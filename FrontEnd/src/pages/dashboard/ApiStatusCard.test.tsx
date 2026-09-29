import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { json } from '@/test/api-mock';
import { healthy } from '@/test/fixtures';
import { renderApp } from '@/test/render';

describe('ApiStatusCard', () => {
  it('shows the live API status', async () => {
    renderApp('/');
    expect(await screen.findByText('Opérationnel')).toBeInTheDocument();
    expect(screen.getByText('Connectée')).toBeInTheDocument();
  });

  it('reports a degraded API when the database is down (HTTP 503)', async () => {
    renderApp('/', {
      routes: {
        'GET /health': () => json({ ...healthy, status: 'degraded', database: 'down' }, 503),
      },
    });
    expect(await screen.findByText('Dégradé')).toBeInTheDocument();
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('shows a friendly error and lets the user retry', async () => {
    let calls = 0;
    const user = userEvent.setup();
    renderApp('/', {
      routes: {
        'GET /health': () => {
          calls += 1;
          if (calls === 1) throw new TypeError('Failed to fetch');
          return json(healthy);
        },
      },
    });

    expect(await screen.findByText('Serveur injoignable')).toBeInTheDocument();
    expect(screen.getByText(/Vérifie ta connexion internet/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Opérationnel')).toBeInTheDocument();
  });
});

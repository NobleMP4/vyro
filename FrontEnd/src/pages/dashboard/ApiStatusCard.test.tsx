import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { jsonResponse, renderApp } from '@/test/render';

const health = (overrides = {}) => ({
  status: 'ok',
  database: 'up',
  version: '0.1.0',
  uptime: 1,
  timestamp: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('ApiStatusCard', () => {
  it('shows the live API status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(health()));
    renderApp('/');

    expect(await screen.findByText('Opérationnel')).toBeInTheDocument();
    expect(screen.getByText('Connectée')).toBeInTheDocument();
  });

  it('reports a degraded API when the database is down (HTTP 503)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(health({ status: 'degraded', database: 'down' }), 503),
    );
    renderApp('/');

    expect(await screen.findByText('Dégradé')).toBeInTheDocument();
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('shows a friendly error and lets the user retry', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(jsonResponse(health()));
    const user = userEvent.setup();
    renderApp('/');

    expect(await screen.findByText('Serveur injoignable')).toBeInTheDocument();
    expect(screen.getByText(/Vérifie ta connexion internet/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Opérationnel')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

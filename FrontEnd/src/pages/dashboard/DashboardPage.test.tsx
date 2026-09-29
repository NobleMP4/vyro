import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { apiError, json } from '@/test/api-mock';
import { makeDashboard, makeUser } from '@/test/fixtures';
import { renderApp } from '@/test/render';
import { greeting, longToday, weekLabel } from './greeting';

describe('Dashboard', () => {
  it('shows the week computed by the API, with today highlighted', async () => {
    renderApp('/');

    expect(await screen.findByText('28 sept. – 4 oct.')).toBeInTheDocument();
    expect(screen.getByText('mercredi 30 septembre')).toBeInTheDocument();
    const days = screen.getByRole('list', { name: 'Jours de la semaine' });
    expect(within(days).getByLabelText('mercredi, aujourd’hui')).toHaveAttribute(
      'aria-current',
      'date',
    );
    expect(screen.getByText('séances visées')).toBeInTheDocument();
  });

  it('shows the plan and the getting-started checklist', async () => {
    renderApp('/');

    expect(await screen.findByText('Prendre du muscle')).toBeInTheDocument();
    expect(screen.getByText('1 sur 2 étapes disponibles')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Compléter ton profil/ })).toHaveAttribute(
      'href',
      '/profile',
    );
  });

  it('never shows numbers for features that are not released', async () => {
    renderApp('/');

    const upcoming = (await screen.findByText('Bientôt sur ton dashboard')).closest(
      '[data-slot="card"]',
    )!;
    for (const label of ['Activité de la semaine', 'Poids', 'Derniers records', 'Série en cours']) {
      expect(within(upcoming as HTMLElement).getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(/Le compteur de séances démarrera/)).toBeInTheDocument();
  });

  it('hides the checklist once every available step is done', async () => {
    renderApp('/', {
      routes: {
        'GET /dashboard': () =>
          json(
            makeDashboard({
              gettingStarted: [
                { step: 'ACCOUNT', done: true, available: true },
                { step: 'PROFILE', done: true, available: true },
                { step: 'FIRST_WEIGHT', done: false, available: false },
              ],
            }),
          ),
      },
    });
    await screen.findByText('Ta semaine');
    expect(screen.queryByText('Premiers pas')).not.toBeInTheDocument();
  });

  it('shows an error with retry when the dashboard cannot load', async () => {
    let calls = 0;
    const user = userEvent.setup();
    renderApp('/', {
      routes: {
        'GET /dashboard': () =>
          ++calls === 1 ? apiError(500, 'INTERNAL_ERROR') : json(makeDashboard()),
      },
    });

    expect(await screen.findByText('Impossible de charger ton dashboard')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('Ta semaine')).toBeInTheDocument();
  });

  it('syncs the account time zone with the device once', async () => {
    const { api } = renderApp('/', {
      user: makeUser({ profile: { timezone: 'Pacific/Auckland' } }),
      routes: {
        'PATCH /users/me/profile': ({ body }) => json(makeUser({ profile: body as object })),
      },
    });

    await waitFor(() => expect(api.callsTo('PATCH /users/me/profile')).toHaveLength(1));
    expect(api.callsTo('PATCH /users/me/profile')[0].body).toEqual({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });
});

describe('greeting helpers', () => {
  it('says Bonjour in the daytime and Bonsoir in the evening', () => {
    expect(greeting(new Date(2026, 8, 30, 9))).toBe('Bonjour');
    expect(greeting(new Date(2026, 8, 30, 19))).toBe('Bonsoir');
    expect(greeting(new Date(2026, 8, 30, 2))).toBe('Bonsoir');
  });

  it('formats dates independently of the device time zone', () => {
    vi.stubEnv('TZ', 'Pacific/Kiritimati');
    expect(longToday('2026-09-30')).toBe('mercredi 30 septembre');
    expect(weekLabel('2026-12-28', '2027-01-03')).toBe('28 déc. – 3 janv.');
    vi.unstubAllEnvs();
  });
});

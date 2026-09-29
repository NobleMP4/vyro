import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/render';

describe('App navigation', () => {
  it('greets the signed-in user on the dashboard', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { name: /(Bonjour|Bonsoir) Alex/ }),
    ).toBeInTheDocument();
  });

  it('exposes every main section in the desktop sidebar', async () => {
    renderApp('/');
    await screen.findByRole('heading', { name: /(Bonjour|Bonsoir)/ });
    const [sidebar] = screen.getAllByRole('navigation', { name: 'Navigation principale' });
    for (const label of [
      'Dashboard',
      'Entraînements',
      'Activités',
      'Progression',
      'Objectifs',
      'Statistiques',
      'Calendrier',
      'Défis',
      'Profil',
      'Paramètres',
    ]) {
      expect(within(sidebar).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('navigates between pages and marks the active link', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await screen.findByRole('heading', { name: /(Bonjour|Bonsoir)/ });

    const [sidebar] = screen.getAllByRole('navigation', { name: 'Navigation principale' });
    await user.click(within(sidebar).getByRole('link', { name: 'Paramètres' }));

    expect(
      await screen.findByRole('heading', { name: 'Paramètres', level: 1 }),
    ).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Paramètres' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('lists secondary sections on the mobile « Plus » page', async () => {
    renderApp('/more');
    const menu = await screen.findByRole('navigation', { name: 'Autres sections' });
    expect(within(menu).getByRole('link', { name: 'Objectifs' })).toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('shows a not-found page for unknown routes', async () => {
    renderApp('/does-not-exist');
    expect(await screen.findByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
  });
});

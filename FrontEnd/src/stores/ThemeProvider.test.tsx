import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { json } from '@/test/api-mock';
import { makeUser } from '@/test/fixtures';
import { renderApp } from '@/test/render';
import { THEME_STORAGE_KEY } from './theme-context';

describe('Theme preference', () => {
  it('applies the theme saved on the account', async () => {
    renderApp('/settings', { user: makeUser({ profile: { theme: 'DARK' } }) });
    expect(await screen.findByRole('radio', { name: 'Sombre' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(document.documentElement).toHaveClass('dark');
  });

  it('applies, persists and saves a new theme on the account', async () => {
    const user = userEvent.setup();
    const { api } = renderApp('/settings', {
      routes: {
        'PATCH /users/me/profile': ({ body }) =>
          json(makeUser({ profile: body as { theme: 'DARK' } })),
      },
    });

    await user.click(await screen.findByRole('radio', { name: 'Sombre' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    await waitFor(() =>
      expect(api.callsTo('PATCH /users/me/profile')[0]?.body).toEqual({ theme: 'DARK' }),
    );
  });
});

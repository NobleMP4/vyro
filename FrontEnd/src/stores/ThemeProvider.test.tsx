import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/render';
import { THEME_STORAGE_KEY } from './theme-context';

describe('Theme preference', () => {
  it('defaults to the system theme', async () => {
    renderApp('/settings');
    expect(await screen.findByRole('radio', { name: 'Système' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('applies and persists the dark theme', async () => {
    const user = userEvent.setup();
    renderApp('/settings');

    await user.click(await screen.findByRole('radio', { name: 'Sombre' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores a saved preference', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderApp('/settings');

    expect(await screen.findByRole('radio', { name: 'Sombre' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(document.documentElement).toHaveClass('dark');
  });
});

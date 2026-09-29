import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, json } from '@/test/api-mock';
import { authResponse, makeUser } from '@/test/fixtures';
import { renderApp } from '@/test/render';

describe('Settings', () => {
  it('saves a unit change', async () => {
    const user = userEvent.setup();
    const { api } = renderApp('/settings', {
      routes: {
        'PATCH /users/me/profile': () => json(makeUser({ profile: { distanceUnit: 'MI' } })),
      },
    });

    const distance = await screen.findByRole('radiogroup', { name: 'Distance' });
    await user.click(within(distance).getByRole('radio', { name: 'miles' }));

    await waitFor(() =>
      expect(within(distance).getByRole('radio', { name: 'miles' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    );
    expect(api.callsTo('PATCH /users/me/profile')[0].body).toEqual({ distanceUnit: 'MI' });
  });

  it('rejects a wrong current password when changing it', async () => {
    const user = userEvent.setup();
    renderApp('/settings', {
      routes: { 'POST /users/me/password': () => apiError(400, 'INVALID_PASSWORD') },
    });

    await user.click(await screen.findByRole('button', { name: 'Changer le mot de passe' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Mot de passe actuel'), 'Mauvais1');
    await user.type(within(dialog).getByLabelText('Nouveau mot de passe'), 'Nouveau123');
    await user.type(within(dialog).getByLabelText('Confirmation'), 'Nouveau123');
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    expect(await within(dialog).findByText('Mot de passe actuel incorrect.')).toBeInTheDocument();
  });

  it('changes the password', async () => {
    const user = userEvent.setup();
    renderApp('/settings', {
      routes: { 'POST /users/me/password': () => json(authResponse(makeUser(), 'access-2')) },
    });

    await user.click(await screen.findByRole('button', { name: 'Changer le mot de passe' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Mot de passe actuel'), 'MotDePasse1');
    await user.type(within(dialog).getByLabelText('Nouveau mot de passe'), 'Nouveau123');
    await user.type(within(dialog).getByLabelText('Confirmation'), 'Nouveau123');
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText(/Mot de passe modifié/)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('deletes the account after password confirmation', async () => {
    const user = userEvent.setup();
    const { router, api } = renderApp('/settings', {
      routes: { 'DELETE /users/me': () => new Response(null, { status: 204 }) },
    });

    await user.click(await screen.findByRole('button', { name: 'Supprimer mon compte' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Mot de passe'), 'MotDePasse1');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer définitivement' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(api.callsTo('DELETE /users/me')[0].body).toEqual({ password: 'MotDePasse1' });
  });
});

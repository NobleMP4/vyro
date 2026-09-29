import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, json } from '@/test/api-mock';
import { authResponse, makeUser } from '@/test/fixtures';
import { renderApp } from '@/test/render';

describe('Authentication flows', () => {
  it('sends anonymous visitors to the login page', async () => {
    const { router } = renderApp('/settings', { user: null });
    expect(
      await screen.findByRole('heading', { name: 'Content de te revoir' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('validates the login form before calling the API', async () => {
    const user = userEvent.setup();
    const { api } = renderApp('/login', { user: null });

    await user.click(await screen.findByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Renseigne ton email.')).toBeInTheDocument();
    expect(screen.getByText('Renseigne ton mot de passe.')).toBeInTheDocument();
    expect(api.callsTo('POST /auth/login')).toHaveLength(0);
  });

  it('shows invalid credentials clearly', async () => {
    const user = userEvent.setup();
    renderApp('/login', {
      user: null,
      routes: { 'POST /auth/login': () => apiError(401, 'INVALID_CREDENTIALS') },
    });

    await user.type(await screen.findByLabelText('Email'), 'alex@vyro.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'Mauvais1');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou mot de passe incorrect.');
  });

  it('logs in and returns to the page that was requested', async () => {
    const user = userEvent.setup();
    const { router, api } = renderApp('/settings', {
      user: null,
      routes: { 'POST /auth/login': () => json(authResponse(makeUser())) },
    });

    await user.type(await screen.findByLabelText('Email'), ' Alex@Vyro.test ');
    await user.type(screen.getByLabelText('Mot de passe'), 'MotDePasse1');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(
      await screen.findByRole('heading', { name: 'Paramètres', level: 1 }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/settings');
    expect(api.callsTo('POST /auth/login')[0].body).toEqual({
      email: 'Alex@Vyro.test',
      password: 'MotDePasse1',
    });
  });

  it('registers a new user and starts the onboarding', async () => {
    const user = userEvent.setup();
    const newUser = makeUser({
      profile: {
        onboardingCompleted: false,
        mainGoal: null,
        weeklyWorkoutTarget: null,
        favoriteActivities: [],
      },
    });
    const { router } = renderApp('/register', {
      user: null,
      routes: { 'POST /auth/register': () => json(authResponse(newUser), 201) },
    });

    await user.type(await screen.findByLabelText('Prénom ou pseudo'), 'Alex');
    await user.type(screen.getByLabelText('Email'), 'alex@vyro.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'MotDePasse1');
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    expect(
      await screen.findByRole('heading', { name: 'Faisons connaissance' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
  });

  it('enforces the password policy and shows an email already in use', async () => {
    const user = userEvent.setup();
    renderApp('/register', {
      user: null,
      routes: { 'POST /auth/register': () => apiError(409, 'EMAIL_ALREADY_USED') },
    });

    await user.type(await screen.findByLabelText('Prénom ou pseudo'), 'Alex');
    await user.type(screen.getByLabelText('Email'), 'alex@vyro.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'motdepasse');
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));
    expect(await screen.findByText('Au moins un chiffre.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Mot de passe'), '1');
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));
    expect(await screen.findByText('Un compte existe déjà avec cet email.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('logs out from the « Plus » page', async () => {
    const user = userEvent.setup();
    const { router, api } = renderApp('/more', {
      routes: { 'POST /auth/logout': () => new Response(null, { status: 204 }) },
    });

    const main = await screen.findByRole('main');
    await user.click(await within(main).findByRole('button', { name: 'Se déconnecter' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(api.callsTo('POST /auth/logout')).toHaveLength(1);
  });

  it('confirms a password reset request without revealing if the account exists', async () => {
    const user = userEvent.setup();
    renderApp('/forgot-password', {
      user: null,
      routes: { 'POST /auth/forgot-password': () => new Response(null, { status: 204 }) },
    });

    await user.type(await screen.findByLabelText('Email'), 'alex@vyro.test');
    await user.click(screen.getByRole('button', { name: 'Envoyer le lien' }));

    expect(await screen.findByText(/Si un compte existe pour/)).toBeInTheDocument();
  });

  it('resets the password from the emailed link', async () => {
    const user = userEvent.setup();
    const { api } = renderApp('/reset-password?token=abc123', {
      user: null,
      routes: { 'POST /auth/reset-password': () => new Response(null, { status: 204 }) },
    });

    await user.type(await screen.findByLabelText('Nouveau mot de passe'), 'Nouveau123');
    await user.type(screen.getByLabelText('Confirmation'), 'Nouveau123');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(
      await screen.findByRole('heading', { name: 'Mot de passe modifié' }),
    ).toBeInTheDocument();
    expect(api.callsTo('POST /auth/reset-password')[0].body).toEqual({
      token: 'abc123',
      password: 'Nouveau123',
    });
  });
});

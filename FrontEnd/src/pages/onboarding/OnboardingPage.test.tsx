import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deviceTimeZone } from '@/lib/timezone';
import { json } from '@/test/api-mock';
import { makeUser } from '@/test/fixtures';
import { renderApp } from '@/test/render';
import type { OnboardingInput } from '@/types/user';

const newUser = makeUser({
  profile: {
    displayName: 'Alex',
    onboardingCompleted: false,
    mainGoal: null,
    weeklyWorkoutTarget: null,
    favoriteActivities: [],
  },
});

describe('Onboarding', () => {
  it('redirects a new user to the onboarding', async () => {
    const { router } = renderApp('/', { user: newUser });
    expect(
      await screen.findByRole('heading', { name: 'Faisons connaissance' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
  });

  it('guides through the steps and saves the answers', async () => {
    const user = userEvent.setup();
    const { api, router } = renderApp('/onboarding', {
      user: newUser,
      routes: {
        'POST /users/me/onboarding': ({ body }) => {
          const input = body as OnboardingInput;
          return json(makeUser({ profile: { ...input, onboardingCompleted: true } }));
        },
      },
    });

    // Step 1: the goal is required.
    await user.click(await screen.findByRole('button', { name: 'Continuer' }));
    expect(await screen.findByText('Choisis ton objectif principal.')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Gagner en force/ }));
    await user.click(screen.getByRole('button', { name: 'Continuer' }));

    // Step 2
    expect(await screen.findByRole('heading', { name: 'Ton rythme' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '3 par semaine' }));
    await user.click(screen.getByRole('button', { name: 'Course' }));
    await user.click(screen.getByRole('button', { name: 'Musculation' }));
    await user.click(screen.getByRole('button', { name: 'Continuer' }));

    // Step 3
    expect(await screen.findByRole('heading', { name: 'Tes unités' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'lb' }));
    await user.click(screen.getByRole('button', { name: 'Commencer' }));

    expect(
      await screen.findByRole('heading', { name: /(Bonjour|Bonsoir) Alex/ }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(api.callsTo('POST /users/me/onboarding')[0].body).toEqual({
      displayName: 'Alex',
      mainGoal: 'GET_STRONGER',
      weeklyWorkoutTarget: 3,
      favoriteActivities: ['RUNNING', 'STRENGTH'],
      weightUnit: 'LB',
      distanceUnit: 'KM',
      heightUnit: 'CM',
      timezone: deviceTimeZone(),
    });
  });
});

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiError, json } from '@/test/api-mock';
import { makeExercise, page } from '@/test/fixtures';
import { renderApp } from '@/test/render';

const bench = makeExercise();
const squat = makeExercise({
  id: 'ex-squat',
  name: 'Squat',
  muscleGroup: 'QUADRICEPS',
  secondaryMuscles: [],
});
const mine = makeExercise({
  id: 'ex-mine',
  name: 'Tirage serré',
  muscleGroup: 'BACK',
  equipment: 'CABLE',
  isCustom: true,
});

describe('Exercise library', () => {
  it('lists exercises from the API with their key facts', async () => {
    renderApp('/exercises', {
      routes: { 'GET /exercises': () => json(page([bench, squat, mine])) },
    });

    const list = await screen.findByRole('list', { name: 'Résultats' });
    expect(within(list).getAllByRole('link')).toHaveLength(3);
    expect(screen.getByText('3 exercices')).toBeInTheDocument();
    const benchCard = screen.getByRole('link', { name: /Développé couché/ });
    expect(benchCard).toHaveAttribute('href', '/exercises/ex-bench');
    expect(within(benchCard).getByText('Pectoraux')).toBeInTheDocument();
    expect(
      within(screen.getByRole('link', { name: /Tirage serré/ })).getByText('Perso'),
    ).toBeInTheDocument();
  });

  it('searches as you type (debounced) and keeps filters in the URL', async () => {
    const user = userEvent.setup();
    const { api, router } = renderApp('/exercises', {
      routes: {
        'GET /exercises': ({ url }) =>
          json(page(url.searchParams.get('search') === 'squat' ? [squat] : [bench, squat])),
      },
    });
    await screen.findByText('2 exercices');

    await user.type(screen.getByRole('searchbox', { name: 'Rechercher un exercice' }), 'squat');
    expect(await screen.findByText('1 exercice')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=squat');
    // One request for the final text, not one per keystroke.
    const searches = api.callsTo('GET /exercises').map((r) => r.url.searchParams.get('search'));
    expect(searches.filter((s) => s !== null)).toEqual(['squat']);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Groupe musculaire' }),
      'QUADRICEPS',
    );
    await waitFor(() =>
      expect(api.callsTo('GET /exercises').at(-1)!.url.searchParams.get('muscleGroup')).toBe(
        'QUADRICEPS',
      ),
    );
    expect(router.state.location.search).toContain('muscle=QUADRICEPS');
  });

  it('keeps every filter when several are changed quickly', async () => {
    const user = userEvent.setup();
    const { api, router } = renderApp('/exercises', {
      routes: { 'GET /exercises': () => json(page([bench])) },
    });
    await screen.findByText('1 exercice');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Groupe musculaire' }), 'BACK');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Équipement' }), 'CABLE');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Difficulté' }), 'BEGINNER');

    await waitFor(() => {
      const params = api.callsTo('GET /exercises').at(-1)!.url.searchParams;
      expect(params.get('muscleGroup')).toBe('BACK');
      expect(params.get('equipment')).toBe('CABLE');
      expect(params.get('difficulty')).toBe('BEGINNER');
    });
    expect(router.state.location.search).toBe('?muscle=BACK&equipment=CABLE&difficulty=BEGINNER');
  });

  it('restores filters from the URL', async () => {
    const { api } = renderApp('/exercises?scope=mine&equipment=CABLE&muscle=NOPE', {
      routes: { 'GET /exercises': () => json(page([mine])) },
    });
    await screen.findByText('1 exercice');
    const params = api.callsTo('GET /exercises')[0].url.searchParams;
    expect(params.get('scope')).toBe('mine');
    expect(params.get('equipment')).toBe('CABLE');
    expect(params.get('muscleGroup')).toBeNull(); // invalid value ignored
    expect(screen.getByRole('radio', { name: 'Perso' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('explains an empty result and resets the filters', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/exercises?q=zzz', {
      routes: {
        'GET /exercises': ({ url }) => json(page(url.searchParams.get('search') ? [] : [bench])),
      },
    });

    expect(await screen.findByText('Aucun exercice ne correspond')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Réinitialiser les filtres' }));
    expect(await screen.findByText('1 exercice')).toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });

  it('loads more results page by page', async () => {
    const user = userEvent.setup();
    renderApp('/exercises', {
      routes: {
        'GET /exercises': ({ url }) =>
          url.searchParams.get('page') === '2'
            ? json(page([squat], { total: 2, page: 2, pageSize: 1 }))
            : json(page([bench], { total: 2, page: 1, pageSize: 1 })),
      },
    });

    await screen.findByRole('link', { name: /Développé couché/ });
    await user.click(screen.getByRole('button', { name: 'Afficher plus' }));
    expect(await screen.findByRole('link', { name: /Squat/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Afficher plus' })).not.toBeInTheDocument();
  });

  it('creates a custom exercise and opens it', async () => {
    const user = userEvent.setup();
    const created = makeExercise({
      id: 'ex-new',
      name: 'Pull-over',
      isCustom: true,
      muscleGroup: 'BACK',
    });
    const { api, router } = renderApp('/exercises', {
      routes: {
        'GET /exercises': () => json(page([bench])),
        'POST /exercises': () => json(created, 201),
        'GET /exercises/ex-new': () => json(created),
      },
    });

    await user.click(await screen.findByRole('button', { name: 'Nouvel exercice' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Créer' }));
    expect(await within(dialog).findByText('Donne un nom à l’exercice.')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Nom'), 'Pull-over');
    await user.selectOptions(within(dialog).getByLabelText('Muscle principal'), 'BACK');
    await user.selectOptions(within(dialog).getByLabelText('Équipement'), 'DUMBBELL');
    await user.click(within(dialog).getByRole('button', { name: 'Pectoraux' }));
    await user.click(within(dialog).getByRole('button', { name: 'Créer' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/exercises/ex-new'));
    expect(api.callsTo('POST /exercises')[0].body).toEqual({
      name: 'Pull-over',
      muscleGroup: 'BACK',
      secondaryMuscles: ['CHEST'],
      equipment: 'DUMBBELL',
      difficulty: 'BEGINNER',
      trackingType: 'WEIGHT_REPS',
    });
  });

  it('shows an error with retry', async () => {
    let calls = 0;
    const user = userEvent.setup();
    renderApp('/exercises', {
      routes: {
        'GET /exercises': () =>
          ++calls === 1 ? apiError(500, 'INTERNAL_ERROR') : json(page([bench])),
      },
    });
    expect(await screen.findByText('Impossible de charger les exercices')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('1 exercice')).toBeInTheDocument();
  });

  it('keeps « Entraînements » highlighted in the navigation', async () => {
    renderApp('/exercises', { routes: { 'GET /exercises': () => json(page([])) } });
    await screen.findByRole('heading', { name: 'Exercices', level: 1 });
    const [sidebar] = screen.getAllByRole('navigation', { name: 'Navigation principale' });
    expect(within(sidebar).getByRole('link', { name: 'Entraînements' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('Exercise detail', () => {
  it('shows instructions, tips and muscles of a catalog exercise, read-only', async () => {
    renderApp('/exercises/ex-bench', { routes: { 'GET /exercises/ex-bench': () => json(bench) } });

    expect(
      await screen.findByRole('heading', { name: 'Développé couché', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Exécution')).toBeInTheDocument();
    expect(screen.getByText('Omoplates serrées.')).toBeInTheDocument();
    expect(screen.getByText('Charge × répétitions')).toBeInTheDocument();
    expect(screen.getByText('Triceps')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
  });

  it('shows a not-found state', async () => {
    renderApp('/exercises/nope', {
      routes: { 'GET /exercises/nope': () => apiError(404, 'EXERCISE_NOT_FOUND') },
    });
    expect(await screen.findByText('Exercice introuvable')).toBeInTheDocument();
  });

  it('edits and deletes a custom exercise', async () => {
    const user = userEvent.setup();
    let current = mine;
    const { api, router } = renderApp('/exercises/ex-mine', {
      routes: {
        'GET /exercises/ex-mine': () => json(current),
        'PATCH /exercises/ex-mine': ({ body }) => {
          current = { ...current, ...(body as object) };
          return json(current);
        },
        'DELETE /exercises/ex-mine': () => new Response(null, { status: 204 }),
        'GET /exercises': () => json(page([])),
      },
    });

    await user.click(await screen.findByRole('button', { name: 'Modifier' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('radio', { name: 'Avancé' }));
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.callsTo('PATCH /exercises/ex-mine')[0].body).toMatchObject({
      difficulty: 'ADVANCED',
    });
    expect(await screen.findByText('Avancé')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Supprimer l’exercice' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Supprimer' }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/exercises'));
    expect(api.callsTo('DELETE /exercises/ex-mine')).toHaveLength(1);
  });
});

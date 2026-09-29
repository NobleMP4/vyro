import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import { AppBootFallback } from '@/components/feedback/AppBootFallback';
import { AppLayout } from '@/layouts/AppLayout';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import { paths } from './paths';

/** Code-split page: each page is its own chunk, downloaded on first visit. */
function page(load: () => Promise<{ default: ComponentType }>): RouteObject['lazy'] {
  return async () => ({ Component: (await load()).default });
}

export const appRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: AppBootFallback,
    children: [
      { path: paths.dashboard, lazy: page(() => import('@/pages/dashboard/DashboardPage')) },
      { path: paths.workouts, lazy: page(() => import('@/pages/WorkoutsPage')) },
      { path: paths.activities, lazy: page(() => import('@/pages/ActivitiesPage')) },
      { path: paths.progress, lazy: page(() => import('@/pages/ProgressPage')) },
      { path: paths.goals, lazy: page(() => import('@/pages/GoalsPage')) },
      { path: paths.statistics, lazy: page(() => import('@/pages/StatisticsPage')) },
      { path: paths.calendar, lazy: page(() => import('@/pages/CalendarPage')) },
      { path: paths.challenges, lazy: page(() => import('@/pages/ChallengesPage')) },
      { path: paths.profile, lazy: page(() => import('@/pages/ProfilePage')) },
      { path: paths.settings, lazy: page(() => import('@/pages/settings/SettingsPage')) },
      { path: paths.more, lazy: page(() => import('@/pages/MorePage')) },
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
];

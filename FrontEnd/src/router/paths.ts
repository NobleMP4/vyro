/** Every route path of the app, in one place. */
export const paths = {
  dashboard: '/',
  workouts: '/workouts',
  exercises: '/exercises',
  activities: '/activities',
  progress: '/progress',
  goals: '/goals',
  statistics: '/statistics',
  calendar: '/calendar',
  challenges: '/challenges',
  profile: '/profile',
  settings: '/settings',
  more: '/more',
  onboarding: '/onboarding',
  designSystem: '/design-system',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

export const exercisePath = (id: string) => `${paths.exercises}/${id}`;

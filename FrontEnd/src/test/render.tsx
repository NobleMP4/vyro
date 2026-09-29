import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/toaster';
import { appRoutes } from '@/router/routes';
import { AuthProvider } from '@/stores/AuthProvider';
import { ThemeProvider } from '@/stores/ThemeProvider';
import type { User } from '@/types/user';
import { mockApi, sessionRoutes, type Routes } from './api-mock';
import { makeUser } from './fixtures';

interface RenderAppOptions {
  /** Signed-in user; null for an anonymous visitor. Defaults to an onboarded user. */
  user?: User | null;
  /** Extra/overriding API routes. */
  routes?: Routes;
}

/** Renders the real route tree at `path` with fresh providers and a mocked API. */
export function renderApp(path = '/', { user = makeUser(), routes = {} }: RenderAppOptions = {}) {
  const api = mockApi({ ...sessionRoutes(user), ...routes });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return { ...utils, router, queryClient, api };
}

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/toaster';
import { createQueryClient } from '@/lib/query-client';
import { router } from '@/router';
import { AuthProvider } from '@/stores/AuthProvider';
import { ThemeProvider } from '@/stores/ThemeProvider';

export default function App() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="top-right" />}
    </QueryClientProvider>
  );
}

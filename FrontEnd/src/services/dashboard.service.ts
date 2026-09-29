import { apiRequest } from '@/lib/api-client';
import type { Dashboard } from '@/types/dashboard';

export const dashboardService = {
  get: (signal?: AbortSignal) => apiRequest<Dashboard>('/dashboard', { signal }),
};

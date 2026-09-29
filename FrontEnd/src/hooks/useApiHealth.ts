import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { healthService } from '@/services/health.service';

export function useApiHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => healthService.get(signal),
    refetchInterval: 60_000,
  });
}

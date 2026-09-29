import { Server } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiHealth } from '@/hooks/useApiHealth';

/** Live connection status to the VYRO API (real data from GET /health). */
export function ApiStatusCard() {
  const { data, error, isPending, isError, refetch, isFetching } = useApiHealth();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Server className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Serveur VYRO</CardTitle>
            <CardDescription>Connexion à l’API et à la base de données</CardDescription>
          </div>
        </div>
        {data && (
          <Badge variant={data.status === 'ok' ? 'success' : 'warning'}>
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {data.status === 'ok' ? 'Opérationnel' : 'Dégradé'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isPending && (
          <div role="status" aria-label="Vérification du serveur" className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        )}
        {isError && (
          <ErrorState
            error={error}
            title="Serveur injoignable"
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        )}
        {data && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Base de données</dt>
              <dd className="font-medium">
                {data.database === 'up' ? 'Connectée' : 'Indisponible'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version de l’API</dt>
              <dd className="font-medium tabular">{data.version}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

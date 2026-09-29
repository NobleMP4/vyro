import { AlertTriangle } from 'lucide-react';
import { useRouteError } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';

/**
 * Last-resort error screen (render crash, failed chunk download after a deploy…).
 * Never displays the raw error to the user.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-2">
        <h1 className="text-xl font-semibold">Oups, quelque chose s’est mal passé</h1>
        <p className="text-sm text-muted-foreground">
          Recharge la page. Si le problème persiste, réessaie dans quelques minutes.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>Recharger</Button>
    </div>
  );
}

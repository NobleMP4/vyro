import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/error-messages';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorState({
  error,
  title = 'Impossible de charger les données',
  onRetry,
  isRetrying,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
          <RotateCw className={cn(isRetrying && 'animate-spin')} aria-hidden="true" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

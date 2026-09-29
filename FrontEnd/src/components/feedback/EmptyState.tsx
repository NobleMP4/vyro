import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex animate-fade-up flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-brand">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

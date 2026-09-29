import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Native <select>: on mobile it opens the OS picker (best ergonomics, zero JS),
 * styled to match Input.
 */
export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          'flex h-12 w-full min-w-0 appearance-none rounded-md border bg-card pr-10 pl-4 text-base transition-colors outline-none',
          'focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

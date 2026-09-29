import { cn } from '@/lib/utils';

/** Initials avatar (photo upload comes with account settings). */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground',
        className,
      )}
    >
      {initials || '?'}
    </span>
  );
}

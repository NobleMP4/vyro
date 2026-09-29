import { cn } from '@/lib/utils';

/**
 * VYRO mark: a "V" whose right stroke rises higher than it started —
 * a check mark and an upward trend at once (« Ton évolution »).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-8', className)}>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="8.5"
        className="fill-[#0b0d0e] stroke-transparent dark:stroke-white/15"
      />
      <path
        d="M8 10.5 14.2 22 24 8.5"
        className="stroke-primary"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, showMark = true }: { className?: string; showMark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {showMark && <LogoMark />}
      <span className="font-display text-xl font-bold tracking-[-0.04em]">VYRO</span>
    </span>
  );
}

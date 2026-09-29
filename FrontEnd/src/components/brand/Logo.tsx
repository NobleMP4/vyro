import markUrl from '@/assets/brand/vyro-mark.webp';
import { cn } from '@/lib/utils';

/** VYRO mark: the flexed arm rising into an upward arrow (« Ton évolution »). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={markUrl}
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      decoding="async"
      draggable={false}
      className={cn('size-8 shrink-0 object-contain select-none', className)}
    />
  );
}

export function Logo({ className, showMark = true }: { className?: string; showMark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {showMark && <LogoMark />}
      <span className="font-display text-xl font-bold tracking-[-0.04em]">VYRO</span>
    </span>
  );
}

import { LogoMark } from '@/components/brand/Logo';

/** Shown while the first page chunk loads on app start. */
export function AppBootFallback() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      role="status"
      aria-label="Chargement"
    >
      <LogoMark className="size-12 animate-pulse" />
    </div>
  );
}

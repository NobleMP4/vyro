import { Outlet } from 'react-router';
import { Logo } from '@/components/brand/Logo';

/** Public pages (login, register…): centered card, mobile first. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col pt-safe pb-safe">
      <header className="flex justify-center px-4 pt-10 pb-6 sm:pt-16">
        <Logo className="[&_img]:size-10 [&>span]:text-2xl" />
      </header>
      <main className="flex flex-1 justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
      <footer className="pb-6 text-center text-xs text-muted-foreground">
        Ton sport. Ton évolution.
      </footer>
    </div>
  );
}

import { Outlet, ScrollRestoration } from 'react-router';
import { BottomNav } from '@/components/navigation/BottomNav';
import { MobileTopBar } from '@/components/navigation/MobileTopBar';
import { NavigationProgress } from '@/components/navigation/NavigationProgress';
import { Sidebar } from '@/components/navigation/Sidebar';

/**
 * Authenticated app shell: sidebar on desktop, top bar + bottom navigation on
 * mobile. Pages render in <Outlet />.
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <NavigationProgress />
      <Sidebar />
      <MobileTopBar />
      <div className="lg:pl-64">
        <main
          id="main-content"
          className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pt-10 lg:pb-12"
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ScrollRestoration />
    </div>
  );
}

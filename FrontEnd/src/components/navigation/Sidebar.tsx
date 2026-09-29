import { NavLink } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { accountNavItems, mainNavItems, type NavItem } from './nav-items';

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors',
          isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('size-[18px]', isActive && 'text-brand')} aria-hidden="true" />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

/** Desktop navigation (lg and up). */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background px-4 py-6 lg:flex">
      <div className="px-3 pb-8">
        <Logo />
        <p className="mt-1.5 text-xs text-muted-foreground">Ton sport. Ton évolution.</p>
      </div>
      <nav aria-label="Navigation principale" className="flex flex-1 flex-col justify-between">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
        <ul className="space-y-1 border-t pt-4">
          {accountNavItems.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

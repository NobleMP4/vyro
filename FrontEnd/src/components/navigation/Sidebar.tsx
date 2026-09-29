import { LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import { accountNavItems, isNavItemActive, mainNavItems, type NavItem } from './nav-items';

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const active = isNavItemActive(item, pathname);
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors',
        active
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className={cn('size-[18px]', active && 'text-brand')} aria-hidden="true" />
      {item.label}
    </Link>
  );
}

function SidebarUser() {
  const { profile, email } = useCurrentUser();
  const { logout } = useAuth();
  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg px-2 py-2">
      <UserAvatar name={profile.displayName} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{profile.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        aria-label="Se déconnecter"
        title="Se déconnecter"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-4" />
      </button>
    </div>
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
        <div className="space-y-1 border-t pt-4">
          <ul className="space-y-1">
            {accountNavItems.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} />
              </li>
            ))}
          </ul>
          <SidebarUser />
        </div>
      </nav>
    </aside>
  );
}

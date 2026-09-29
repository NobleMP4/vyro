import { Ellipsis } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import { mobilePrimaryItems, mobileSecondaryItems, type NavItem } from './nav-items';

const moreItem: NavItem = { label: 'Plus', to: paths.more, icon: Ellipsis };

/** Mobile/tablet navigation: large touch targets, respects the home indicator safe area. */
export function BottomNav() {
  const { pathname } = useLocation();
  // « Plus » stays highlighted while browsing one of the pages it lists.
  const inSecondary = mobileSecondaryItems.some((item) => pathname.startsWith(item.to));

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 pb-safe backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {[...mobilePrimaryItems, moreItem].map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => {
                  const active = isActive || (item === moreItem && inSecondary);
                  return cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  );
                }}
              >
                {({ isActive }) => {
                  const active = isActive || (item === moreItem && inSecondary);
                  return (
                    <>
                      <span
                        className={cn(
                          'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                          active && 'bg-primary text-primary-foreground',
                        )}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      {item.label}
                    </>
                  );
                }}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

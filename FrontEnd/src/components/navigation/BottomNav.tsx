import { Ellipsis } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';
import {
  isNavItemActive,
  mobilePrimaryItems,
  mobileSecondaryItems,
  type NavItem,
} from './nav-items';

const moreItem: NavItem = { label: 'Plus', to: paths.more, icon: Ellipsis };

/** Mobile/tablet navigation: large touch targets, respects the home indicator safe area. */
export function BottomNav() {
  const { pathname } = useLocation();
  // « Plus » stays highlighted while browsing one of the pages it lists.
  const inSecondary = mobileSecondaryItems.some((item) => isNavItemActive(item, pathname));

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 pb-safe backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {[...mobilePrimaryItems, moreItem].map((item) => {
          const Icon = item.icon;
          const active =
            item === moreItem
              ? pathname === paths.more || inSecondary
              : isNavItemActive(item, pathname);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    active && 'bg-primary text-primary-foreground',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

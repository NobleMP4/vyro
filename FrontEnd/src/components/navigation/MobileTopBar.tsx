import { Link } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { paths } from '@/router/paths';

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 pt-safe backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center px-4">
        <Link to={paths.dashboard} aria-label="VYRO — Dashboard">
          <Logo className="[&_svg]:size-7" />
        </Link>
      </div>
    </header>
  );
}

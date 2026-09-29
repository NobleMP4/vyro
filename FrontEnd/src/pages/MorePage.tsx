import { ChevronRight, LogOut } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { mobileSecondaryItems } from '@/components/navigation/nav-items';

/** Mobile « Plus » menu: every section not in the bottom bar. */
export default function MorePage() {
  const { logout } = useAuth();
  return (
    <>
      <PageHeader title="Plus" />
      <Card className="divide-y overflow-hidden">
        <nav aria-label="Autres sections">
          <ul className="divide-y">
            {mobileSecondaryItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex h-14 items-center gap-4 px-5 transition-colors hover:bg-muted"
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1 font-medium">{label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
      <Button variant="outline" size="lg" className="mt-6 w-full" onClick={() => void logout()}>
        <LogOut aria-hidden="true" />
        Se déconnecter
      </Button>
    </>
  );
}

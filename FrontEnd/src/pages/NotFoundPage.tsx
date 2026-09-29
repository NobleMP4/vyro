import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page introuvable"
      description="Cette page n’existe pas ou a été déplacée."
      action={
        <Button asChild>
          <Link to={paths.dashboard}>Retour au dashboard</Link>
        </Button>
      }
    />
  );
}

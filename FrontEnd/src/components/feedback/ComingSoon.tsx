import { Construction } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from './EmptyState';

interface ComingSoonProps {
  feature: string;
  description: string;
}

/**
 * Honest placeholder for sections not built yet: no fake data,
 * just what the section will do.
 */
export function ComingSoon({ feature, description }: ComingSoonProps) {
  return (
    <EmptyState
      icon={Construction}
      title={`${feature} arrive bientôt`}
      description={description}
      action={<Badge variant="neutral">En cours de développement</Badge>}
    />
  );
}

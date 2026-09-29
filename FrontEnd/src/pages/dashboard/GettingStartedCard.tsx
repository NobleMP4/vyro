import { Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { paths } from '@/router/paths';
import type { Dashboard, GettingStartedStep } from '@/types/dashboard';

const STEPS: Record<GettingStartedStep, { label: string; to?: string }> = {
  ACCOUNT: { label: 'Créer ton compte' },
  PROFILE: { label: 'Compléter ton profil (taille, date de naissance)', to: paths.profile },
  FIRST_WEIGHT: { label: 'Enregistrer ton premier poids' },
  FIRST_WORKOUT: { label: 'Réaliser ton premier entraînement' },
};

/** First steps, computed by the API. Hidden once every available step is done. */
export function GettingStartedCard({ items }: { items: Dashboard['gettingStarted'] }) {
  const available = items.filter((i) => i.available);
  const done = available.filter((i) => i.done).length;
  if (done === available.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Premiers pas</CardTitle>
        <CardDescription>
          {done} sur {available.length} étape{available.length > 1 ? 's' : ''} disponible
          {available.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={(done / available.length) * 100} label="Premiers pas" />
        <ul className="divide-y">
          {items.map((item) => {
            const { label, to } = STEPS[item.step];
            const content = (
              <>
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border',
                    item.done && 'border-success bg-success text-white',
                  )}
                  aria-hidden="true"
                >
                  {item.done && <Check className="size-3.5" />}
                </span>
                <span
                  className={cn(
                    'flex-1 text-sm',
                    item.done && 'text-muted-foreground line-through',
                    !item.available && 'text-muted-foreground',
                  )}
                >
                  {label}
                  <span className="sr-only">{item.done ? ' (fait)' : ' (à faire)'}</span>
                </span>
                {!item.available && <Badge variant="neutral">Bientôt</Badge>}
                {item.available && !item.done && to && (
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
              </>
            );
            return (
              <li key={item.step}>
                {item.available && !item.done && to ? (
                  <Link
                    to={to}
                    className="-mx-2 flex min-h-12 items-center gap-3 rounded-md px-2 hover:bg-muted"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex min-h-12 items-center gap-3">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

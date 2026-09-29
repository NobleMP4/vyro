import { Dumbbell, Flame, Scale, Trophy, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dashboard } from '@/types/dashboard';

type SectionKey = keyof Dashboard['sections'];

const SECTIONS: Record<SectionKey, { label: string; description: string; icon: LucideIcon }> = {
  weekActivity: {
    label: 'Activité de la semaine',
    description: 'Séances, durée, distance et calories',
    icon: Dumbbell,
  },
  weight: { label: 'Poids', description: 'Poids actuel, tendance et objectif', icon: Scale },
  records: { label: 'Derniers records', description: 'Tes meilleures performances', icon: Trophy },
  streak: {
    label: 'Série en cours',
    description: 'Semaines consécutives d’entraînement',
    icon: Flame,
  },
};

/**
 * Sections whose feature is not released yet, grouped in one honest card
 * instead of empty widgets with fake numbers.
 */
export function UpcomingSectionsCard({ sections }: { sections: Dashboard['sections'] }) {
  const upcoming = (Object.keys(SECTIONS) as SectionKey[]).filter(
    (key) => sections[key].status === 'UNAVAILABLE',
  );
  if (!upcoming.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bientôt sur ton dashboard</CardTitle>
        <CardDescription>
          Ces indicateurs apparaîtront avec les prochaines fonctionnalités.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {upcoming.map((key) => {
            const { label, description, icon: Icon } = SECTIONS[key];
            return (
              <li key={key} className="flex items-start gap-3 rounded-lg border border-dashed p-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Badge variant="neutral">Bientôt</Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

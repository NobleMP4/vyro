import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Dashboard } from '@/types/dashboard';
import { weekLabel } from './greeting';

const DAYS = [
  ['L', 'lundi'],
  ['M', 'mardi'],
  ['M', 'mercredi'],
  ['J', 'jeudi'],
  ['V', 'vendredi'],
  ['S', 'samedi'],
  ['D', 'dimanche'],
] as const;

/**
 * The current week (Monday → Sunday in the user's time zone) and the weekly
 * target. Session counts appear once workout tracking exists.
 */
export function WeekCard({ dashboard }: { dashboard: Dashboard }) {
  const { week, plan, sections } = dashboard;
  const target = plan.weeklyWorkoutTarget;

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand">
          <CalendarDays className="size-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Ta semaine</CardTitle>
          <CardDescription>{weekLabel(week.start, week.end)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="grid grid-cols-7 gap-1.5" aria-label="Jours de la semaine">
          {DAYS.map(([short, long], index) => {
            const isToday = index === week.todayIndex;
            const isPast = index < week.todayIndex;
            return (
              <li
                key={long}
                aria-current={isToday ? 'date' : undefined}
                aria-label={isToday ? `${long}, aujourd’hui` : long}
                className={cn(
                  'flex h-11 items-center justify-center rounded-lg text-sm font-medium',
                  isToday && 'bg-primary text-primary-foreground',
                  !isToday && isPast && 'bg-muted text-muted-foreground',
                  !isToday && !isPast && 'border text-muted-foreground',
                )}
              >
                {short}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          {target ? (
            <p>
              <span className="text-2xl font-semibold tracking-tight">{target}</span>{' '}
              <span className="text-muted-foreground">
                séance{target > 1 ? 's' : ''} visée{target > 1 ? 's' : ''}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground">Aucun objectif hebdomadaire défini.</p>
          )}
        </div>
        {sections.weekActivity.status === 'UNAVAILABLE' && (
          <p className="text-sm text-muted-foreground">
            Le compteur de séances démarrera avec le suivi des entraînements.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

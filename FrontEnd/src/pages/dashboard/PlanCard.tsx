import { Target } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTIVITY_LABELS, MAIN_GOAL_LABELS } from '@/lib/labels';
import { paths } from '@/router/paths';
import type { Dashboard } from '@/types/dashboard';

export function PlanCard({ plan }: { plan: Dashboard['plan'] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand">
          <Target className="size-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Ton cap</CardTitle>
          <CardDescription>
            {plan.mainGoal ? MAIN_GOAL_LABELS[plan.mainGoal].label : 'Aucun objectif défini'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.favoriteActivities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {plan.favoriteActivities.map((activity) => (
              <Badge key={activity} variant="outline">
                {ACTIVITY_LABELS[activity]}
              </Badge>
            ))}
          </div>
        )}
        <Button asChild variant="link">
          <Link to={paths.profile}>Modifier mon programme</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

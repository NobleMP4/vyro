import { Target } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ACTIVITY_LABELS, MAIN_GOAL_LABELS } from '@/lib/labels';
import { paths } from '@/router/paths';

/** The user's plan from onboarding. Progress numbers arrive with workout tracking. */
export function WeeklyTargetCard() {
  const { profile } = useCurrentUser();

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand">
          <Target className="size-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Ton cap</CardTitle>
          <CardDescription>
            {profile.mainGoal ? MAIN_GOAL_LABELS[profile.mainGoal].label : 'Aucun objectif défini'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.weeklyWorkoutTarget && (
          <p>
            <span className="font-display text-3xl font-bold tabular">
              {profile.weeklyWorkoutTarget}
            </span>{' '}
            <span className="text-muted-foreground">
              entraînement{profile.weeklyWorkoutTarget > 1 ? 's' : ''} par semaine
            </span>
          </p>
        )}
        {profile.favoriteActivities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.favoriteActivities.map((activity) => (
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

import { QueryContent } from '@/components/feedback/QueryContent';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDashboard } from '@/hooks/useDashboard';
import { GettingStartedCard } from './GettingStartedCard';
import { greeting, longToday } from './greeting';
import { PlanCard } from './PlanCard';
import { UpcomingSectionsCard } from './UpcomingSectionsCard';
import { WeekCard } from './WeekCard';

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Chargement du dashboard" className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useCurrentUser();
  const dashboard = useDashboard();

  return (
    <div className="space-y-6">
      <header className="animate-fade-up space-y-1">
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {dashboard.data ? longToday(dashboard.data.week.today) : ' '}
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">
          {greeting()} {profile.displayName} 👋
        </h1>
      </header>

      <QueryContent
        query={dashboard}
        loading={<DashboardSkeleton />}
        errorTitle="Impossible de charger ton dashboard"
      >
        {(data) => (
          <div className="space-y-4 stagger">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <WeekCard dashboard={data} />
              <PlanCard plan={data.plan} />
            </div>
            <GettingStartedCard items={data.gettingStarted} />
            <UpcomingSectionsCard sections={data.sections} />
          </div>
        )}
      </QueryContent>
    </div>
  );
}

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ApiStatusCard } from './ApiStatusCard';
import { WeeklyTargetCard } from './WeeklyTargetCard';

export default function DashboardPage() {
  const { profile } = useCurrentUser();
  return (
    <div className="space-y-6">
      <section className="relative animate-fade-up overflow-hidden rounded-xl bg-secondary p-6 text-secondary-foreground md:p-8 dark:border dark:bg-card dark:text-card-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/25 blur-3xl"
        />
        <p className="text-sm font-medium opacity-70">Ton sport. Ton évolution.</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Bonjour {profile.displayName} 👋</h1>
        <p className="mt-3 max-w-lg opacity-80">
          Bienvenue sur VYRO. Le suivi des entraînements, du poids et de tes statistiques arrive
          très bientôt ici.
        </p>
      </section>

      <WeeklyTargetCard />
      <ApiStatusCard />
    </div>
  );
}

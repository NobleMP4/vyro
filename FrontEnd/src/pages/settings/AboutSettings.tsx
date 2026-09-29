import { ApiStatusCard } from './ApiStatusCard';

/** Technical information: live API/database status and version. */
export function AboutSettings() {
  return (
    <section aria-labelledby="about-title" className="space-y-3">
      <h2 id="about-title" className="text-lg font-semibold">
        À propos
      </h2>
      <ApiStatusCard />
    </section>
  );
}

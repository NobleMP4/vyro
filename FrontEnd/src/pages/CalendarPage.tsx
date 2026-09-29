import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendrier" description="Toute ton activité, jour par jour." />
      <ComingSoon
        feature="Le calendrier"
        description="Tu retrouveras ici tes entraînements, activités, pesées et jours de repos."
      />
    </>
  );
}

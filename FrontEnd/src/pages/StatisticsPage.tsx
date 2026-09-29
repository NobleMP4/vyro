import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function StatisticsPage() {
  return (
    <>
      <PageHeader title="Statistiques" description="Analyse ton évolution sur la durée." />
      <ComingSoon
        feature="Les statistiques"
        description="Tes statistiques d'entraînement, de cardio et de poids apparaîtront ici dès tes premières données."
      />
    </>
  );
}

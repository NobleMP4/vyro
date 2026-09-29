import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ProgressPage() {
  return (
    <>
      <PageHeader title="Progression" description="Ton poids et tes records dans le temps." />
      <ComingSoon
        feature="Le suivi de la progression"
        description="Tu pourras saisir ton poids chaque jour, suivre ta tendance et retrouver tous tes records personnels."
      />
    </>
  );
}

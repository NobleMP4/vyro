import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ChallengesPage() {
  return (
    <>
      <PageHeader title="Défis" description="Relève des défis personnels." />
      <ComingSoon
        feature="Les défis"
        description="Tu pourras relever des défis personnels, comme 3 entraînements cette semaine ou 20 km de course."
      />
    </>
  );
}

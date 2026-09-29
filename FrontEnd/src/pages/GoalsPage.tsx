import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function GoalsPage() {
  return (
    <>
      <PageHeader title="Objectifs" description="Fixe un cap et suis ta progression." />
      <ComingSoon
        feature="Les objectifs"
        description="Tu pourras définir des objectifs de poids, de performance, de fréquence ou de distance."
      />
    </>
  );
}

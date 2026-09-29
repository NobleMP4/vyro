import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ActivitiesPage() {
  return (
    <>
      <PageHeader title="Activités" description="Course, vélo, natation, marche et bien plus." />
      <ComingSoon
        feature="Le suivi des activités"
        description="Tu pourras enregistrer tes activités sportives avec les métriques adaptées à chaque sport."
      />
    </>
  );
}

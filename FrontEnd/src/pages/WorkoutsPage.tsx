import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function WorkoutsPage() {
  return (
    <>
      <PageHeader title="Entraînements" description="Crée, planifie et réalise tes séances." />
      <ComingSoon
        feature="Le suivi des entraînements"
        description="Tu pourras créer tes séances, choisir tes exercices, enregistrer chaque série et revoir ton historique."
      />
    </>
  );
}

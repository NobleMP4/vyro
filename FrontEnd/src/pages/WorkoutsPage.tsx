import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { paths } from '@/router/paths';

export default function WorkoutsPage() {
  return (
    <>
      <PageHeader title="Entraînements" description="Crée, planifie et réalise tes séances." />
      <div className="space-y-6">
        <Link to={paths.exercises} className="block">
          <Card className="flex items-center gap-4 p-5 transition-colors hover:border-primary/40">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand">
              <BookOpen className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Bibliothèque d’exercices</p>
              <p className="text-sm text-muted-foreground">
                Recherche, filtres par muscle et équipement, tes exercices personnalisés.
              </p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
          </Card>
        </Link>
        <ComingSoon
          feature="La création de séances"
          description="Tu pourras composer tes séances à partir de la bibliothèque, enregistrer chaque série et revoir ton historique."
        />
      </div>
    </>
  );
}

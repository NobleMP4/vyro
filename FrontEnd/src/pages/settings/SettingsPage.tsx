import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AppearanceSettings } from './AppearanceSettings';

const UPCOMING_SECTIONS = [
  { title: 'Compte', description: 'Nom, email, mot de passe, photo' },
  { title: 'Unités', description: 'kg / lb, km / miles, cm / ft' },
  { title: 'Notifications', description: 'Rappels d’entraînement et de pesée' },
  { title: 'Intégrations', description: 'Apple Health, Google Health Connect' },
  { title: 'Confidentialité', description: 'Export et suppression de tes données' },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" description="Personnalise VYRO." />
      <div className="space-y-6">
        <AppearanceSettings />
        <Card className="divide-y overflow-hidden">
          {UPCOMING_SECTIONS.map((section) => (
            <div key={section.title} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{section.title}</p>
                <p className="truncate text-sm text-muted-foreground">{section.description}</p>
              </div>
              <Badge variant="neutral">Bientôt</Badge>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

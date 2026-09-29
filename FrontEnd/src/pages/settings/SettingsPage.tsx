import { ChevronRight, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AppearanceSettings } from './AppearanceSettings';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { PreferencesSettings } from './PreferencesSettings';
import { UnitsSettings } from './UnitsSettings';

const UPCOMING_SECTIONS = [
  { title: 'Notifications', description: 'Rappels d’entraînement et de pesée' },
  { title: 'Intégrations', description: 'Apple Health, Google Health Connect' },
  { title: 'Export des données', description: 'JSON et CSV' },
];

export default function SettingsPage() {
  const { email } = useCurrentUser();
  const { logout } = useAuth();

  return (
    <>
      <PageHeader title="Paramètres" description="Personnalise VYRO." />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
            <CardDescription>
              Connecté en tant que <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <ChangePasswordDialog />
            <Button variant="ghost" onClick={() => void logout()}>
              <LogOut aria-hidden="true" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>

        <AppearanceSettings />
        <UnitsSettings />
        <PreferencesSettings />

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

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Zone sensible</CardTitle>
            <CardDescription>
              La suppression de ton compte efface définitivement toutes tes données.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

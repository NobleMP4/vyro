import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/lib/error-messages';

export function PreferencesSettings() {
  const { profile } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
      </CardHeader>
      <CardContent>
        <label className="flex cursor-pointer items-start justify-between gap-4">
          <span>
            <span className="block font-medium">Gamification</span>
            <CardDescription>
              XP, niveaux et badges. Désactive-la si tu préfères un suivi sobre.
            </CardDescription>
          </span>
          <Switch
            aria-label="Gamification"
            checked={profile.gamificationEnabled}
            disabled={updateProfile.isPending}
            onCheckedChange={(gamificationEnabled) =>
              updateProfile.mutate(
                { gamificationEnabled },
                {
                  onSuccess: () =>
                    toast.success(
                      gamificationEnabled ? 'Gamification activée' : 'Gamification désactivée',
                    ),
                  onError: (error) => toast.error(getErrorMessage(error)),
                },
              )
            }
          />
        </label>
      </CardContent>
    </Card>
  );
}

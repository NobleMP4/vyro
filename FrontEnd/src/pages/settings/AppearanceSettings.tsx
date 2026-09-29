import { Monitor, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SegmentedControl, type SegmentOption } from '@/components/ui/segmented-control';
import { useUpdateProfile } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { getErrorMessage } from '@/lib/error-messages';
import type { ThemePreference } from '@/stores/theme-context';
import type { ThemePreferenceApi } from '@/types/user';

const OPTIONS: SegmentOption<ThemePreference>[] = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
];

export function AppearanceSettings() {
  const { preference, setPreference } = useTheme();
  const updateProfile = useUpdateProfile();

  const change = (value: ThemePreference) => {
    const previous = preference;
    setPreference(value); // instant, then saved on the account for other devices
    updateProfile.mutate(
      { theme: value.toUpperCase() as ThemePreferenceApi },
      {
        onError: (error) => {
          setPreference(previous);
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Synchronisée sur tous tes appareils.</CardDescription>
      </CardHeader>
      <CardContent>
        <SegmentedControl
          label="Thème"
          value={preference}
          options={OPTIONS}
          onChange={change}
          className="sm:max-w-md"
        />
      </CardContent>
    </Card>
  );
}

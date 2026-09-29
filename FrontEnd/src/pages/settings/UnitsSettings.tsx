import { toast } from 'sonner';
import {
  DISTANCE_UNIT_OPTIONS,
  HEIGHT_UNIT_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from '@/components/profile/unit-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/lib/error-messages';
import type { UpdateProfileInput } from '@/types/user';

export function UnitsSettings() {
  const { profile } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const save = (input: UpdateProfileInput) =>
    updateProfile.mutate(input, {
      onSuccess: () => toast.success('Unités enregistrées'),
      onError: (error) => toast.error(getErrorMessage(error)),
    });

  const rows = [
    {
      label: 'Poids',
      control: (
        <SegmentedControl
          label="Poids"
          value={profile.weightUnit}
          options={WEIGHT_UNIT_OPTIONS}
          onChange={(weightUnit) => save({ weightUnit })}
          disabled={updateProfile.isPending}
        />
      ),
    },
    {
      label: 'Distance',
      control: (
        <SegmentedControl
          label="Distance"
          value={profile.distanceUnit}
          options={DISTANCE_UNIT_OPTIONS}
          onChange={(distanceUnit) => save({ distanceUnit })}
          disabled={updateProfile.isPending}
        />
      ),
    },
    {
      label: 'Taille',
      control: (
        <SegmentedControl
          label="Taille"
          value={profile.heightUnit}
          options={HEIGHT_UNIT_OPTIONS}
          onChange={(heightUnit) => save({ heightUnit })}
          disabled={updateProfile.isPending}
        />
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unités</CardTitle>
        <CardDescription>Utilisées partout dans l’application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="grid items-center gap-2 sm:grid-cols-[8rem_1fr]">
            <Label>{row.label}</Label>
            <div className="sm:max-w-xs">{row.control}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

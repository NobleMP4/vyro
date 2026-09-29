import { CalendarDays, Pencil, Ruler, Target } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ACTIVITY_LABELS, MAIN_GOAL_LABELS } from '@/lib/labels';
import { formatHeight } from '@/lib/units';
import { EditProfileDialog } from './EditProfileDialog';

const memberSince = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(iso));

const age = (birthDate: string) => {
  const birth = new Date(birthDate);
  const now = new Date();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  return now.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
};

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = useCurrentUser();
  const { profile } = user;
  const [editing, setEditing] = useState(false);
  const notSet = <span className="font-normal text-muted-foreground">Non renseigné</span>;

  return (
    <>
      <PageHeader
        title="Profil"
        actions={
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" />
            Modifier
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8 text-center">
            <UserAvatar name={profile.displayName} className="size-20 text-2xl" />
            <div>
              <h2 className="text-xl font-bold">{profile.displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="neutral">Membre depuis {memberSince(user.createdAt)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon programme</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <InfoRow icon={Target} label="Objectif principal">
                {profile.mainGoal ? MAIN_GOAL_LABELS[profile.mainGoal].label : notSet}
              </InfoRow>
              <InfoRow icon={CalendarDays} label="Fréquence visée">
                {profile.weeklyWorkoutTarget
                  ? `${profile.weeklyWorkoutTarget} entraînement${profile.weeklyWorkoutTarget > 1 ? 's' : ''} par semaine`
                  : notSet}
              </InfoRow>
              <InfoRow icon={Ruler} label="Taille · âge">
                {profile.heightCm ? formatHeight(profile.heightCm, profile.heightUnit) : notSet}
                {profile.birthDate && <span> · {age(profile.birthDate)} ans</span>}
              </InfoRow>
            </dl>
            <div className="pt-3">
              <p className="mb-2 text-sm text-muted-foreground">Activités principales</p>
              {profile.favoriteActivities.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteActivities.map((activity) => (
                    <Badge key={activity} variant="outline">
                      {ACTIVITY_LABELS[activity]}
                    </Badge>
                  ))}
                </div>
              ) : (
                notSet
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <EditProfileDialog user={user} open={editing} onOpenChange={setEditing} />
    </>
  );
}

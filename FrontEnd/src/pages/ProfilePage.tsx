import { ComingSoon } from '@/components/feedback/ComingSoon';
import { PageHeader } from '@/components/layout/PageHeader';

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profil" description="Tes informations et ta progression VYRO." />
      <ComingSoon
        feature="Le profil"
        description="Ton profil sera disponible avec la création de compte."
      />
    </>
  );
}

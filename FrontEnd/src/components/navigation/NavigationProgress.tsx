import { useNavigation } from 'react-router';

/** Thin top bar while a lazy page chunk loads. */
export function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === 'idle') return null;
  return (
    <div
      role="progressbar"
      aria-label="Chargement de la page"
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left animate-pulse bg-primary"
    />
  );
}

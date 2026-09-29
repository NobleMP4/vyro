import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

/** Success/error confirmations for important actions. */
export function Toaster() {
  const { resolved } = useTheme();
  return (
    <Sonner
      theme={resolved}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ className: 'font-sans' }}
    />
  );
}

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/stores/theme-context';

/** Applies the theme saved on the account (e.g. chosen on another device). */
export function ThemeSync() {
  const { profile } = useCurrentUser();
  const { setPreference } = useTheme();
  useEffect(() => {
    setPreference(profile.theme.toLowerCase() as ThemePreference);
  }, [profile.theme, setPreference]);
  return null;
}

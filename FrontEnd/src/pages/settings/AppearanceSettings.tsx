import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/stores/theme-context';

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
];

export function AppearanceSettings() {
  const { preference, setPreference } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Choisis le thème de l’application.</CardDescription>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Thème" className="grid grid-cols-3 gap-2 sm:max-w-md">
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = preference === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPreference(value)}
                className={cn(
                  'flex h-20 flex-col items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

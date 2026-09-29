import { Dumbbell, Flame, Footprints, Inbox, Scale, Timer } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Logo, LogoMark } from '@/components/brand/Logo';
import { BarSeriesChart } from '@/components/charts/BarSeriesChart';
import type { ChartSeries } from '@/components/charts/chart-config';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { PeriodSelector } from '@/components/data/PeriodSelector';
import type { Period } from '@/lib/period';
import { StatCard } from '@/components/data/StatCard';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { PasswordInput } from '@/components/ui/password-input';
import { Progress } from '@/components/ui/progress';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { ApiError } from '@/lib/api-error';
import { formatDate, formatNumber } from '@/lib/format';

/*
 * Living documentation of the VYRO design system. Only routed in development.
 * ⚠ The chart data below is DEMONSTRATION data, generated here and labelled as such.
 */

const COLOR_TOKENS = [
  ['background', 'Fond de page'],
  ['card', 'Surface'],
  ['muted', 'Surface discrète'],
  ['border', 'Bordure'],
  ['foreground', 'Texte'],
  ['muted-foreground', 'Texte secondaire'],
  ['primary', 'Accent VYRO'],
  ['brand', 'Texte d’accent'],
  ['success', 'Succès'],
  ['warning', 'Attention'],
  ['destructive', 'Danger'],
  ['info', 'Info'],
] as const;

const demoWeight = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 7, 31 + i);
  const value = 80 - i * 0.07 + Math.sin(i / 2) * 0.35;
  return {
    date: date.toISOString().slice(0, 10),
    weight: i % 6 === 4 ? null : Number(value.toFixed(1)),
  };
}).map((d, i, all) => {
  const window = all.slice(Math.max(0, i - 6), i + 1).filter((p) => p.weight !== null);
  const avg = window.reduce((sum, p) => sum + (p.weight ?? 0), 0) / window.length;
  return { ...d, average: i >= 6 ? Number(avg.toFixed(2)) : null };
});

const demoWeeks = ['S35', 'S36', 'S37', 'S38', 'S39', 'S40'].map((week, i) => ({
  week,
  sessions: [3, 4, 2, 5, 4, 3][i],
}));

const weightSeries: ChartSeries[] = [
  { key: 'weight', label: 'Poids', slot: 1, variant: 'area' },
  { key: 'average', label: 'Moyenne 7 jours', slot: 2, variant: 'dashed' },
];
const sessionSeries: ChartSeries[] = [{ key: 'sessions', label: 'Séances', slot: 1 }];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [reps, setReps] = useState<number | null>(10);
  const [load, setLoad] = useState<number | null>(60);
  const [unit, setUnit] = useState<'KG' | 'LB'>('KG');
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="space-y-12">
      <PageHeader
        title="Design system"
        description="Référence vivante des composants VYRO (visible uniquement en développement)."
      />

      <Section title="Marque">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-8 pt-5">
            <Logo />
            <LogoMark className="size-12" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Le bras qui se lève en flèche : l’effort qui devient progression. Bleu VYRO #005AFC,
              utilisé avec parcimonie.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Couleurs"
        description="Tokens sémantiques — chaque valeur change avec le thème."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COLOR_TOKENS.map(([token, label]) => (
            <div key={token} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <span
                className="size-10 shrink-0 rounded-md border"
                style={{ background: `var(--${token})` }}
              />
              <span className="min-w-0 text-sm">
                <span className="block font-medium">{label}</span>
                <code className="text-xs text-muted-foreground">--{token}</code>
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
            <span key={slot} className="flex items-center gap-2 text-xs">
              <span className="size-5 rounded" style={{ background: `var(--chart-${slot})` }} />
              chart-{slot}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="font-display text-4xl font-bold tracking-tight">Space Grotesk — titres</p>
            <p className="text-2xl font-bold">Titre de page (h1)</p>
            <p className="text-lg font-semibold">Titre de carte</p>
            <p>Inter — texte courant, lisible pendant l’effort.</p>
            <p className="text-sm text-muted-foreground">Texte secondaire et descriptions.</p>
            <p className="text-3xl font-semibold">
              78,1 kg{' '}
              <span className="text-base text-muted-foreground">chiffres proportionnels</span>
            </p>
            <p className="tabular">
              12:34 · 08:05 · 10:10{' '}
              <span className="text-sm text-muted-foreground">
                (chiffres tabulaires pour les colonnes et chronos)
              </span>
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Principal</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="destructive">Danger</Button>
          <Button variant="link">Lien</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Petit</Button>
          <Button>Normal</Button>
          <Button size="lg">
            <Timer aria-hidden="true" /> Grand (séance)
          </Button>
          <Tooltip content="Ajouter">
            <Button size="icon" variant="outline" aria-label="Ajouter">
              <Dumbbell />
            </Button>
          </Tooltip>
        </div>
      </Section>

      <Section title="Formulaires">
        <Card>
          <CardContent className="grid gap-5 pt-5 md:grid-cols-2">
            <FormField label="Texte" hint="Aide contextuelle">
              <Input placeholder="Développé couché" />
            </FormField>
            <FormField label="Avec erreur" error="Ce champ est requis.">
              <Input />
            </FormField>
            <FormField label="Mot de passe">
              <PasswordInput defaultValue="MotDePasse1" />
            </FormField>
            <FormField label="Liste">
              <Select defaultValue="chest">
                <option value="chest">Pectoraux</option>
                <option value="back">Dos</option>
                <option value="legs">Jambes</option>
              </Select>
            </FormField>
            <FormField label="Notes" className="md:col-span-2">
              <Textarea placeholder="Sensations, douleurs, remarques…" />
            </FormField>
            <div className="space-y-2">
              <p className="text-sm font-medium">Choix unique</p>
              <SegmentedControl
                label="Unité"
                value={unit}
                onChange={setUnit}
                options={[
                  { value: 'KG', label: 'kg' },
                  { value: 'LB', label: 'lb' },
                ]}
              />
            </div>
            <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <span>
                <span className="block font-medium">Interrupteur</span>
                <span className="text-sm text-muted-foreground">Réglage activable</span>
              </span>
              <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Interrupteur" />
            </label>
            <div className="grid grid-cols-2 gap-3 md:col-span-2 md:max-w-md">
              <NumberStepper
                label="Charge"
                value={load}
                onChange={setLoad}
                step={2.5}
                precision={1}
                unit="kg"
              />
              <NumberStepper
                label="Répétitions"
                value={reps}
                onChange={setReps}
                min={0}
                max={100}
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Statistiques">
        <div className="grid gap-4 stagger sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Poids"
            value="78,1"
            unit="kg"
            icon={Scale}
            delta={{ value: -0.3, unit: 'kg', period: 'cette semaine', goodWhen: 'down' }}
          />
          <StatCard
            label="Séances"
            value="4"
            icon={Dumbbell}
            delta={{ value: 1, period: 'vs semaine dernière', goodWhen: 'up', fractionDigits: 0 }}
          />
          <StatCard
            label="Distance"
            value="28,4"
            unit="km"
            icon={Footprints}
            delta={{ value: -2.1, unit: 'km', period: 'vs semaine dernière', goodWhen: 'up' }}
          />
          <StatCard label="Énergie" value="2 840" unit="kcal" icon={Flame} />
        </div>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Objectif 75 kg</span>
                <span className="font-medium">62 %</span>
              </div>
              <Progress value={62} label="Progression vers l’objectif de poids" />
            </div>
            <Progress value={100} tone="success" label="Objectif atteint" />
            <Progress value={35} tone="warning" label="En retard" />
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Graphiques"
        description="Données de démonstration — générées pour cette page uniquement."
      >
        <Badge variant="warning">Démonstration</Badge>
        <ChartFrame
          title="Poids"
          description="Poids quotidien et moyenne mobile 7 jours"
          actions={<PeriodSelector value={period} onChange={setPeriod} />}
          series={weightSeries}
          table={{
            columns: ['Date', 'Poids', 'Moyenne 7 j'],
            rows: demoWeight.map((d) => [
              formatDate(d.date),
              d.weight === null ? '—' : `${formatNumber(d.weight)} kg`,
              d.average === null ? '—' : `${formatNumber(d.average)} kg`,
            ]),
          }}
        >
          <TimeSeriesChart
            data={demoWeight}
            xKey="date"
            series={weightSeries}
            formatValue={(v) => formatNumber(v)}
            formatX={(d) => formatDate(d)}
            formatTooltipLabel={(d) =>
              formatDate(d, { weekday: 'long', day: 'numeric', month: 'long' })
            }
            reference={{ value: 77.5, label: 'Objectif 77,5 kg' }}
            ariaLabel="Évolution du poids sur 30 jours (démonstration)"
          />
        </ChartFrame>
        <ChartFrame
          title="Séances par semaine"
          series={sessionSeries}
          table={{
            columns: ['Semaine', 'Séances'],
            rows: demoWeeks.map((w) => [w.week, w.sessions]),
          }}
        >
          <BarSeriesChart
            data={demoWeeks}
            xKey="week"
            series={sessionSeries}
            formatValue={(v) => formatNumber(v, 0)}
            ariaLabel="Séances par semaine (démonstration)"
          />
        </ChartFrame>
      </Section>

      <Section title="Navigation par onglets">
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <Card>
              <CardContent className="pt-5">Contenu « Historique »</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="records">
            <Card>
              <CardContent className="pt-5">Contenu « Records »</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stats">
            <Card>
              <CardContent className="pt-5">Contenu « Statistiques »</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Nouveau record</Badge>
          <Badge variant="neutral">Neutre</Badge>
          <Badge variant="success">Terminé</Badge>
          <Badge variant="warning">En pause</Badge>
          <Badge variant="destructive">Échec</Badge>
          <Badge variant="outline">Musculation</Badge>
        </div>
      </Section>

      <Section title="États" description="Chaque écran gère : chargement, vide, erreur, succès.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Chargement</CardTitle>
              <CardDescription>Squelette fidèle à la mise en page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Spinner className="text-brand" />
            </CardContent>
          </Card>
          <EmptyState
            icon={Inbox}
            title="Aucun entraînement pour le moment"
            description="Commence ton premier entraînement."
            action={<Button>Créer un entraînement</Button>}
          />
          <ErrorState
            error={new ApiError(0, 'NETWORK_ERROR', 'x')}
            onRetry={() => toast('Nouvelle tentative…')}
          />
          <div className="space-y-3">
            <Alert>Message d’erreur de formulaire.</Alert>
            <Alert variant="success">Action réussie.</Alert>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.success('Séance enregistrée')}>
                Toast succès
              </Button>
              <Button variant="outline" onClick={() => toast.error('Impossible d’enregistrer')}>
                Toast erreur
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Fenêtres">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialogue</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialogue</DialogTitle>
                <DialogDescription>
                  Feuille en bas d’écran sur mobile, fenêtre centrée sur ordinateur.
                </DialogDescription>
              </DialogHeader>
              <Button className="w-full">Valider</Button>
            </DialogContent>
          </Dialog>
          <ConfirmDialog
            trigger={<Button variant="outline">Confirmation</Button>}
            title="Supprimer cet entraînement ?"
            description="Cette action est irréversible."
            confirmLabel="Supprimer"
            destructive
            onConfirm={() => toast.success('Supprimé (démo)')}
          />
        </div>
      </Section>
    </div>
  );
}

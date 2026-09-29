import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { vi } from 'vitest';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { StatCard } from '@/components/data/StatCard';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { QueryContent } from '@/components/feedback/QueryContent';
import { Button } from '@/components/ui/button';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Progress } from '@/components/ui/progress';
import { ApiError } from '@/lib/api-error';

describe('StatCard', () => {
  it('shows a good decrease in the success tone, with sign and period', () => {
    render(
      <StatCard
        label="Poids"
        value="78,1"
        unit="kg"
        delta={{ value: -0.3, unit: 'kg', period: 'cette semaine', goodWhen: 'down' }}
      />,
    );
    const delta = screen.getByText('−0,3 kg').parentElement!;
    expect(delta).toHaveClass('text-success');
    expect(delta).toHaveTextContent('cette semaine');
  });

  it('shows a bad change in the destructive tone', () => {
    render(
      <StatCard
        label="Séances"
        value="2"
        delta={{ value: -2, period: 'vs S-1', goodWhen: 'up', fractionDigits: 0 }}
      />,
    );
    expect(screen.getByText('−2').parentElement).toHaveClass('text-destructive');
  });
});

describe('NumberStepper', () => {
  function Harness() {
    const [value, setValue] = useState<number | null>(60);
    return (
      <NumberStepper
        label="Charge"
        value={value}
        onChange={setValue}
        step={2.5}
        precision={1}
        min={0}
        max={65}
      />
    );
  }

  it('steps, clamps and accepts typed decimals with a comma', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText(/Charge/);

    await user.click(screen.getByRole('button', { name: 'Augmenter charge' }));
    expect(input).toHaveValue('62,5');
    await user.click(screen.getByRole('button', { name: 'Augmenter charge' }));
    await user.click(screen.getByRole('button', { name: 'Augmenter charge' }));
    expect(input).toHaveValue('65');
    expect(screen.getByRole('button', { name: 'Augmenter charge' })).toBeDisabled();

    await user.clear(input);
    await user.type(input, '42,5');
    expect(input).toHaveValue('42,5');

    // Out-of-range typing is corrected when leaving the field.
    await user.clear(input);
    await user.type(input, '99');
    await user.tab();
    expect(input).toHaveValue('65');

    // Letters are ignored.
    await user.type(input, 'abc');
    expect(input).toHaveValue('65');
  });
});

describe('Progress', () => {
  it('clamps and exposes its value to assistive tech', () => {
    render(<Progress value={140} label="Objectif" />);
    expect(screen.getByRole('progressbar', { name: 'Objectif' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});

describe('ChartFrame', () => {
  it('offers the same data as a table and a legend for several series', async () => {
    const user = userEvent.setup();
    render(
      <ChartFrame
        title="Poids"
        series={[
          { key: 'w', label: 'Poids', slot: 1 },
          { key: 'a', label: 'Moyenne 7 jours', slot: 2, variant: 'dashed' },
        ]}
        table={{ columns: ['Date', 'Poids'], rows: [['28 sept.', '78,4 kg']] }}
      >
        <div>chart</div>
      </ChartFrame>,
    );

    expect(
      within(screen.getByRole('list', { name: 'Légende' })).getByText('Moyenne 7 jours'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tableau' }));
    expect(screen.getByRole('columnheader', { name: 'Poids' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '78,4 kg' })).toBeInTheDocument();
  });
});

describe('QueryContent', () => {
  function Harness({ fn }: { fn: () => Promise<string[]> }) {
    const query = useQuery({ queryKey: ['x', fn], queryFn: fn, retry: false });
    return (
      <QueryContent
        query={query}
        loading={<p>chargement</p>}
        empty={<p>vide</p>}
        isEmpty={(d) => d.length === 0}
      >
        {(data) => <p>{data.join(',')}</p>}
      </QueryContent>
    );
  }
  const wrap = (fn: () => Promise<string[]>) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <Harness fn={fn} />
      </QueryClientProvider>,
    );

  it('renders loading then data', async () => {
    wrap(() => Promise.resolve(['a', 'b']));
    expect(screen.getByText('chargement')).toBeInTheDocument();
    expect(await screen.findByText('a,b')).toBeInTheDocument();
  });

  it('renders the empty state', async () => {
    wrap(() => Promise.resolve([]));
    expect(await screen.findByText('vide')).toBeInTheDocument();
  });

  it('renders a translated error with a retry', async () => {
    wrap(() => Promise.reject(new ApiError(500, 'INTERNAL_ERROR', 'boom')));
    expect(await screen.findByRole('alert')).toHaveTextContent('Une erreur inattendue');
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('only confirms after an explicit click', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        trigger={<Button>Supprimer</Button>}
        title="Supprimer ?"
        description="Irréversible."
        confirmLabel="Oui, supprimer"
        destructive
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' }));
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(screen.getByRole('button', { name: 'Oui, supprimer' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

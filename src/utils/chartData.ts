import type { ChartDatum } from '../components/charts/RealDataChartPanel';

export function countBy<TItem>(
  items: TItem[],
  getName: (item: TItem) => string | null | undefined,
): ChartDatum[] {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const name = getName(item)?.trim() || 'Nao informado';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function compactChartData(data: ChartDatum[]): ChartDatum[] {
  return data.filter((item) => item.name && Number.isFinite(item.value));
}

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function formatShortDate(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    return 'Sem data';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

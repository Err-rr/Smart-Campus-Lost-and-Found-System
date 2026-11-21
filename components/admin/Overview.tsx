'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { effectiveFoundStatus } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { CategoryChart, WeeklyChart, type ChartDatum } from './Charts';

const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 8;

function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - diff);
  return x;
}

const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

export function Overview() {
  const lostReports = useStore((s) => s.lostReports);
  const foundItems = useStore((s) => s.foundItems);
  const matches = useStore((s) => s.matches);
  const claims = useStore((s) => s.claims);
  const categories = useStore((s) => s.categories);
  const settings = useStore((s) => s.settings);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const lostThisMonth = lostReports.filter((r) => new Date(r.dateLost).getTime() >= monthStart).length;
    const foundThisMonth = foundItems.filter((f) => new Date(f.dateFound).getTime() >= monthStart).length;
    const returned = foundItems.filter((f) => f.status === 'returned').length;
    const itemById = new Map(foundItems.map((f) => [f.id, f]));
    const returnDays = claims
      .filter((c) => c.status === 'handed_over' && c.handoverDate)
      .map((c) => {
        const item = itemById.get(c.foundItemId);
        return item ? (new Date(c.handoverDate!).getTime() - new Date(item.dateFound).getTime()) / DAY : null;
      })
      .filter((d): d is number => d !== null);
    const avgDays = returnDays.length ? returnDays.reduce((a, b) => a + b, 0) / returnDays.length : null;

    return [
      { label: 'Reports this month', value: lostThisMonth + foundThisMonth, note: `${lostThisMonth} lost, ${foundThisMonth} found` },
      { label: 'Found items', value: foundItems.length, note: 'All time' },
      { label: 'Matches suggested', value: matches.filter((m) => m.status === 'suggested').length, note: 'Waiting for the owner' },
      { label: 'Items returned', value: returned, note: 'After a verified handover' },
      {
        label: 'Recovery rate',
        value: foundItems.length ? `${Math.round((returned / foundItems.length) * 100)}%` : '0%',
        note: 'Found items returned',
      },
      {
        label: 'Average days to return',
        value: avgDays === null ? 'None yet' : avgDays.toFixed(1),
        note: 'From found to handover',
      },
      {
        label: 'Unclaimed items',
        value: foundItems.filter((f) => effectiveFoundStatus(f, settings) === 'unclaimed').length,
        note: `In custody over ${settings.unclaimedDays} days`,
      },
    ];
  }, [lostReports, foundItems, matches, claims, settings]);

  const byCategory: ChartDatum[] = useMemo(
    () =>
      categories.map((c) => ({
        label: c.name,
        value:
          lostReports.filter((r) => r.categoryId === c.id).length + foundItems.filter((f) => f.categoryId === c.id).length,
      })),
    [categories, lostReports, foundItems],
  );

  const byWeek: ChartDatum[] = useMemo(() => {
    const thisWeek = startOfWeek(new Date());
    const weeks = Array.from({ length: WEEKS }, (_, i) => {
      const start = new Date(thisWeek);
      start.setDate(start.getDate() - (WEEKS - 1 - i) * 7);
      return start;
    });
    const dates = [...lostReports.map((r) => r.dateLost), ...foundItems.map((f) => f.dateFound)];
    return weeks.map((start) => {
      const end = start.getTime() + 7 * DAY;
      return {
        label: shortDate.format(start),
        value: dates.filter((d) => {
          const t = new Date(d).getTime();
          return t >= start.getTime() && t < end;
        }).length,
      };
    });
  }, [lostReports, foundItems]);

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col-reverse justify-end p-5">
            <dt>
              <span className="block text-[14px] font-medium text-ink">{s.label}</span>
              <span className="mt-0.5 block text-[13px] text-ink-2">{s.note}</span>
            </dt>
            <dd className="mb-3 font-mono text-[28px] font-medium leading-none tabular-nums text-ink">{s.value}</dd>
          </Card>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Reports per category</h2>
          <p className="mt-0.5 text-[13px] text-ink-2">Lost and found reports. Busiest category in yellow.</p>
          <div className="mt-4">
            <CategoryChart data={byCategory} />
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Reports per week</h2>
          <p className="mt-0.5 text-[13px] text-ink-2">Lost and found reports, last {WEEKS} weeks. Weeks start on Monday.</p>
          <div className="mt-4">
            <WeeklyChart data={byWeek} />
          </div>
        </Card>
      </div>
    </div>
  );
}

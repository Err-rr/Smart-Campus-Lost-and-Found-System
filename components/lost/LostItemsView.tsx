'use client';

import { MapPin, SearchX } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Form';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { StatusPill, lostReportPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/format';
import { useCurrentUser, useStore } from '@/lib/store';

export function LostItemsView() {
  const user = useCurrentUser();
  const lostReports = useStore((s) => s.lostReports);
  const categories = useStore((s) => s.categories);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const q = useDeferredValue(query.trim().toLowerCase());

  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const results = useMemo(
    () =>
      lostReports
        .filter((r) => r.status !== 'closed')
        .filter((r) => !categoryId || r.categoryId === categoryId)
        .filter(
          (r) =>
            !q ||
            [r.title, r.description, r.locationLost, r.id, categoryName.get(r.categoryId) ?? '']
              .join(' ')
              .toLowerCase()
              .includes(q),
        )
        .sort((a, b) => b.dateLost.localeCompare(a.dateLost)),
    [lostReports, categoryId, q, categoryName],
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Campus lost and found"
        title="Lost Items"
        description="Items reported lost by students and staff. If you have found one of these, hand it in at a desk."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField
          id="lost-search"
          label="Search lost items"
          value={query}
          onChange={setQuery}
          placeholder="Search by name, place or ID"
          className="flex-1"
        />
        <Select
          aria-label="Filter by category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="sm:w-56"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <p className="-mt-4 text-[14px] text-ink-2" aria-live="polite">
        {results.length} {results.length === 1 ? 'report' : 'reports'}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No lost reports match your search"
          text="Try a different word or clear the category filter."
          actionLabel="Clear filters"
          onAction={() => {
            setQuery('');
            setCategoryId('');
          }}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-divider">
            {results.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                <ItemThumb categoryId={r.categoryId} photo={r.photo} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-[15px] font-medium text-ink">{r.title}</p>
                    <span className="font-mono text-[12px] text-ink-3">{r.id}</span>
                    {r.userId === user?.id && (
                      <span className="rounded-full bg-tile px-2 py-0.5 text-[12px] text-ink-2">Your report</span>
                    )}
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[14px] text-ink-2">
                    <span>{categoryName.get(r.categoryId)}</span>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} strokeWidth={1.5} aria-hidden />
                      {r.locationLost}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="whitespace-nowrap">Lost {formatDate(r.dateLost)}</span>
                  </p>
                </div>
                <StatusPill kind={lostReportPill(r.status)} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

'use client';

import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { categoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Select } from '@/components/ui/Form';
import { ItemPhoto } from '@/components/ui/ItemPhoto';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { StatusPill, foundItemPill } from '@/components/ui/StatusPill';
import { effectiveFoundStatus } from '@/lib/domain';
import { formatDate } from '@/lib/format';
import { CAMPUS_LOCATIONS } from '@/lib/seed';
import { useStore } from '@/lib/store';

interface FoundItemsViewProps {
  initialQuery: string;
  initialCategory: string;
}

export function FoundItemsView({ initialQuery, initialCategory }: FoundItemsViewProps) {
  const foundItems = useStore((s) => s.foundItems);
  const categories = useStore((s) => s.categories);
  const settings = useStore((s) => s.settings);

  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [location, setLocation] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const locations = useMemo(() => {
    const set = new Set<string>(CAMPUS_LOCATIONS);
    foundItems.forEach((f) => set.add(f.locationFound));
    return Array.from(set);
  }, [foundItems]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
    const toMs = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
    return foundItems
      .filter((f) => !categoryId || f.categoryId === categoryId)
      .filter((f) => !location || f.locationFound === location)
      .filter((f) => {
        const t = new Date(f.dateFound).getTime();
        return t >= fromMs && t <= toMs;
      })
      .filter(
        (f) =>
          !q ||
          // Search uses public fields only. Hidden details are never searched.
          [f.title, f.publicDescription, f.locationFound, f.id, f.heldAt, categoryName.get(f.categoryId) ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => b.dateFound.localeCompare(a.dateFound));
  }, [foundItems, categoryId, location, from, to, query, categoryName]);

  const hasFilters = !!(query || categoryId || location || from || to);
  const clearAll = () => {
    setQuery('');
    setCategoryId('');
    setLocation('');
    setFrom('');
    setTo('');
  };

  const chip = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[14px] transition-colors ${
      active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-[#D6D3CB]'
    }`;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Campus lost and found"
        title="Found Items"
        description="Items handed in at campus desks or reported found. Open an item to start a claim."
      />

      <div className="flex flex-col gap-4">
        <SearchField
          id="found-search"
          label="Search found items"
          value={query}
          onChange={setQuery}
          placeholder="Search by name, place or ID"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button type="button" className={chip(!categoryId)} aria-pressed={!categoryId} onClick={() => setCategoryId('')}>
            All
          </button>
          {categories.map((c) => {
            const Icon = categoryIcon(c.id);
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                className={chip(active)}
                onClick={() => setCategoryId(active ? '' : c.id)}
              >
                <Icon size={15} strokeWidth={1.5} aria-hidden />
                {c.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_170px_170px]">
          <Select aria-label="Filter by location" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3 sm:contents">
            <Input type="date" aria-label="Found from" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" aria-label="Found to" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="-mt-3 flex items-center justify-between">
        <p className="text-[14px] text-ink-2" aria-live="polite">
          {results.length} {results.length === 1 ? 'item' : 'items'}
        </p>
        {hasFilters && (
          <Button variant="ghost" onClick={clearAll} className="-mr-2 h-8 px-2">
            Clear filters
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No found items match your search"
          text="Try fewer filters, or report your item as lost so you are told when it comes in."
          actionLabel="Report a lost item"
          actionHref="/report?type=lost"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => {
            const status = effectiveFoundStatus(item, settings);
            return (
              <li key={item.id}>
                <Link
                  href={`/found/${item.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-colors hover:border-[#D6D3CB]"
                >
                  <div className="relative">
                    <ItemPhoto categoryId={item.categoryId} photo={item.photo} className="aspect-[16/10] w-full" />
                    <StatusPill kind={foundItemPill(status)} className="absolute left-3 top-3" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[16px] font-semibold text-ink">{item.title}</p>
                      <span className="shrink-0 font-mono text-[12px] text-ink-3">{item.id}</span>
                    </div>
                    <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[14px]">
                      <dt className="text-ink-3">Category</dt>
                      <dd className="text-ink">{categoryName.get(item.categoryId)}</dd>
                      <dt className="text-ink-3">Found at</dt>
                      <dd className="text-ink">{item.locationFound}</dd>
                      <dt className="text-ink-3">Date</dt>
                      <dd className="text-ink">{formatDate(item.dateFound)}</dd>
                      <dt className="text-ink-3">Held at</dt>
                      <dd className="text-ink">{item.heldAt}</dd>
                    </dl>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

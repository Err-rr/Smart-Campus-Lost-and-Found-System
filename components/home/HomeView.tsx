'use client';

import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  MapPin,
  PackagePlus,
  ScanSearch,
  Search,
  ShieldCheck,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { ButtonLink, Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { categoryIcon } from '@/components/ui/CategoryIcon';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconTile } from '@/components/ui/IconTile';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { NoticeBox } from '@/components/ui/NoticeBox';
import { StatusPill, foundItemPill } from '@/components/ui/StatusPill';
import { effectiveFoundStatus, userActivity } from '@/lib/domain';
import { relativeTime } from '@/lib/format';
import { DESKS } from '@/lib/seed';
import { useCurrentUser, useStore } from '@/lib/store';

const ACTIONS: { title: string; text: string; href: string; icon: LucideIcon }[] = [
  {
    title: 'Report Lost Item',
    text: 'Tell us what you lost, where and when. You will be notified if a match comes in.',
    href: '/report?type=lost',
    icon: ClipboardList,
  },
  {
    title: 'Report Found Item',
    text: 'Log an item you found so the owner can be traced, or hand it in at a desk.',
    href: '/report?type=found',
    icon: PackagePlus,
  },
  {
    title: 'Find Matching Items',
    text: 'See found items that match your open reports, ranked by match score.',
    href: '/my-reports',
    icon: ScanSearch,
  },
  {
    title: 'Verified Handover',
    text: 'Items are released only after the desk checks your proof of ownership and college ID.',
    href: '/about',
    icon: ShieldCheck,
  },
];

export function HomeView() {
  const router = useRouter();
  const user = useCurrentUser();
  const lostReports = useStore((s) => s.lostReports);
  const foundItems = useStore((s) => s.foundItems);
  const matches = useStore((s) => s.matches);
  const claims = useStore((s) => s.claims);
  const categories = useStore((s) => s.categories);
  const settings = useStore((s) => s.settings);
  const [query, setQuery] = useState('');

  const activity = useMemo(
    () =>
      user
        ? userActivity({ lostReports, matches, claims, settings }, user.id)
        : { openReports: 0, possibleMatches: 0, claimsInProgress: 0 },
    [user, lostReports, matches, claims, settings],
  );

  const recent = useMemo(
    () => [...foundItems].sort((a, b) => b.dateFound.localeCompare(a.dateFound)).slice(0, 6),
    [foundItems],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of foundItems) {
      const status = effectiveFoundStatus(item, settings);
      if (status === 'in_custody' || status === 'unclaimed') {
        counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
      }
    }
    return counts;
  }, [foundItems, settings]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/found?q=${encodeURIComponent(q)}` : '/found');
  };

  if (!user) return null;

  const activityRows = [
    { label: 'Open reports', value: activity.openReports },
    { label: 'Possible matches', value: activity.possibleMatches },
    { label: 'Claims in progress', value: activity.claimsInProgress },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="grid grid-cols-1 gap-8 rounded-panel bg-panel p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:gap-12">
        <div>
          <Eyebrow tone="dark">Campus lost and found</Eyebrow>
          <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.02em] sm:text-title">
            Lost something on campus?
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-panel-muted">
            Report, search, match and recover your belongings through a verified handover.
          </p>

          <form onSubmit={onSearch} role="search" className="mt-8 flex max-w-xl gap-2">
            <label htmlFor="home-search" className="sr-only">
              Search found items
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
                aria-hidden
              />
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search found items, e.g. calculator"
                className="h-12 w-full rounded-[12px] border border-transparent bg-white pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
          </form>
        </div>

        <div className="rounded-card bg-panel-inner p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[16px] font-semibold">Your activity</p>
              <p className="mt-0.5 truncate text-[14px] text-panel-muted">{user.name}</p>
            </div>
            {user.rollNo && <span className="shrink-0 font-mono text-[12px] text-accent">{user.rollNo}</span>}
          </div>

          <dl className="mt-5 divide-y divide-panel-line border-y border-panel-line">
            {activityRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <dt className="text-[14px] text-panel-muted">{row.label}</dt>
                <dd className="font-mono text-[18px] font-medium tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>

          <ButtonLink href="/report" className="mt-5 w-full" size="lg">
            Report an item
          </ButtonLink>
          <Link
            href="/my-reports"
            className="mt-3 flex items-center justify-center gap-1.5 text-[14px] text-panel-muted transition-colors hover:text-white"
          >
            View my reports
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </section>

      {/* Actions */}
      <section aria-labelledby="actions-title">
        <h2 id="actions-title" className="sr-only">
          What you can do
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-card border border-line bg-white p-6 shadow-card transition-colors hover:border-[#D6D3CB]"
            >
              <div className="flex items-start justify-between">
                <IconTile icon={action.icon} />
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.5}
                  className="text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </div>
              <h3 className="mt-5 text-[16px] font-semibold text-ink">{action.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{action.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently found + notice */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="recent-title">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="recent-title" className="text-section text-ink">
              Recently found
            </h2>
            <Link
              href="/found"
              className="flex items-center gap-1 text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
            >
              See all
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
          <Card>
            <ul className="divide-y divide-divider">
              {recent.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                  <ItemThumb categoryId={item.categoryId} photo={item.photo} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="truncate text-[15px] font-medium text-ink">{item.title}</p>
                      <span className="hidden shrink-0 font-mono text-[12px] text-ink-3 sm:inline">{item.id}</span>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[14px] text-ink-2">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} strokeWidth={1.5} className="shrink-0" aria-hidden />
                        {item.locationFound}
                      </span>
                      <span aria-hidden className="hidden sm:inline">·</span>
                      <span className="whitespace-nowrap">{relativeTime(item.dateFound)}</span>
                    </p>
                  </div>
                  <StatusPill kind={foundItemPill(effectiveFoundStatus(item, settings))} />
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <aside className="flex flex-col gap-4 lg:pt-11">
          <NoticeBox icon={Inbox}>
            <p>
              <span className="font-semibold">Found something?</span> Hand it in at the nearest desk or report it
              here so the owner can be matched.
            </p>
            <Link
              href="/report?type=found"
              className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink underline decoration-notice-line decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
            >
              Report a found item
            </Link>
          </NoticeBox>

          <Card className="p-5">
            <Eyebrow>Collection desks</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2.5">
              {DESKS.slice(0, 3).map((desk) => (
                <li key={desk} className="flex items-center gap-2.5 text-[14px] text-ink">
                  <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-ink-3" aria-hidden />
                  {desk}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-divider pt-3 text-[13px] text-ink-2">
              Bring your college ID when collecting an item.
            </p>
          </Card>
        </aside>
      </div>

      {/* Categories */}
      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="mb-4 text-section text-ink">
          Browse by category
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcon(cat.id);
            return (
              <Link
                key={cat.id}
                href={`/found?category=${cat.id}`}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] text-ink transition-colors hover:border-[#D6D3CB] hover:bg-[#FAFAF8]"
              >
                <Icon size={16} strokeWidth={1.5} className="text-ink-icon" aria-hidden />
                {cat.name}
                <span className="font-mono text-[12px] text-ink-3">{categoryCounts[cat.id] ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

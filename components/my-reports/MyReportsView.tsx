'use client';

import { ClipboardList, FileCheck2, MapPin, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MatchCard } from '@/components/matching/MatchCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { NoticeBox } from '@/components/ui/NoticeBox';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusPill, foundItemPill, lostReportPill } from '@/components/ui/StatusPill';
import { Tabs } from '@/components/ui/Tabs';
import { canSeeHiddenDetails, effectiveFoundStatus } from '@/lib/domain';
import { formatDate, relativeTime } from '@/lib/format';
import { useCurrentUser, useStore } from '@/lib/store';
import { ClaimTracker } from './ClaimTracker';
import { ButtonLink } from '@/components/ui/Button';

type Tab = 'lost' | 'found' | 'claims';

export function MyReportsView({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const user = useCurrentUser();
  const lostReports = useStore((s) => s.lostReports);
  const foundItems = useStore((s) => s.foundItems);
  const matches = useStore((s) => s.matches);
  const claims = useStore((s) => s.claims);
  const categories = useStore((s) => s.categories);
  const settings = useStore((s) => s.settings);
  const dismissMatch = useStore((s) => s.dismissMatch);
  const [tab, setTab] = useState<Tab>(initialTab);

  const userId = user?.id;
  const myLost = useMemo(
    () => lostReports.filter((r) => r.userId === userId).sort((a, b) => b.dateLost.localeCompare(a.dateLost)),
    [lostReports, userId],
  );
  const myFound = useMemo(
    () => foundItems.filter((f) => f.reportedBy === userId).sort((a, b) => b.dateFound.localeCompare(a.dateFound)),
    [foundItems, userId],
  );
  const myClaims = useMemo(
    () => claims.filter((c) => c.userId === userId).sort((a, b) => b.submittedOn.localeCompare(a.submittedOn)),
    [claims, userId],
  );

  const itemById = useMemo(() => new Map(foundItems.map((f) => [f.id, f])), [foundItems]);
  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  if (!user) return null;
  const blurPhotos = !canSeeHiddenDetails(user.role);

  const changeTab = (t: Tab) => {
    setTab(t);
    router.replace(t === 'lost' ? '/my-reports' : `/my-reports?tab=${t}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Your account"
        title="My Reports"
        description="Your lost reports with possible matches, items you found, and your claims."
        actions={
          <ButtonLink href="/report" size="lg">
            Report an item
          </ButtonLink>
        }
      />

      <Tabs
        label="My reports sections"
        value={tab}
        onChange={changeTab}
        tabs={[
          { value: 'lost', label: 'My lost reports', count: myLost.length },
          { value: 'found', label: 'Items I found', count: myFound.length },
          { value: 'claims', label: 'My claims', count: myClaims.length },
        ]}
      />

      {tab === 'lost' &&
        (myLost.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="You haven't reported anything yet"
            text="Report a lost item and we will check it against everything handed in."
            actionLabel="Report a lost item"
            actionHref="/report?type=lost"
          />
        ) : (
          <div className="flex flex-col gap-6">
            {myLost.map((report) => {
              const reportMatches = matches
                .filter((m) => m.lostReportId === report.id && m.status !== 'dismissed')
                .sort((a, b) => b.matchScore - a.matchScore);
              return (
                <Card key={report.id} className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <ItemThumb categoryId={report.categoryId} photo={report.photo} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-[16px] font-semibold text-ink">{report.title}</p>
                        <span className="font-mono text-[12px] text-ink-3">{report.id}</span>
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[14px] text-ink-2">
                        <span>{categoryName.get(report.categoryId)}</span>
                        <span aria-hidden>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} strokeWidth={1.5} aria-hidden />
                          {report.locationLost}
                        </span>
                        <span aria-hidden>·</span>
                        <span>Lost {formatDate(report.dateLost)}</span>
                      </p>
                    </div>
                    <StatusPill kind={lostReportPill(report.status)} />
                  </div>

                  {report.status !== 'closed' && (
                    <div className="mt-5 border-t border-divider pt-5">
                      <Eyebrow>
                        Possible matches {reportMatches.length > 0 && <span className="text-ink">({reportMatches.length})</span>}
                      </Eyebrow>
                      {reportMatches.length === 0 ? (
                        <p className="mt-2 text-[14px] text-ink-2">
                          No matches yet. You will get an email and SMS when one comes in.
                        </p>
                      ) : (
                        <div className="mt-3 grid grid-cols-1 gap-4 xl:grid-cols-2">
                          {reportMatches.map((m) => {
                            const item = itemById.get(m.foundItemId);
                            if (!item) return null;
                            return (
                              <MatchCard
                                key={m.id}
                                match={m}
                                report={report}
                                item={item}
                                blurPhoto={blurPhotos}
                                onDismiss={() => dismissMatch(m.id)}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ))}

      {tab === 'found' &&
        (myFound.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="You haven't reported a found item"
            text="If you find something on campus, report it so the owner can be matched."
            actionLabel="Report a found item"
            actionHref="/report?type=found"
          />
        ) : (
          <Card>
            <ul className="divide-y divide-divider">
              {myFound.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/found/${item.id}`}
                    className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[#FAFAF8] sm:px-5"
                  >
                    <ItemThumb categoryId={item.categoryId} photo={item.photo} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-[15px] font-medium text-ink">{item.title}</p>
                        <span className="font-mono text-[12px] text-ink-3">{item.id}</span>
                      </div>
                      <p className="mt-0.5 text-[14px] text-ink-2">
                        {item.locationFound} · {relativeTime(item.dateFound)} · Held at {item.heldAt}
                      </p>
                    </div>
                    <StatusPill kind={foundItemPill(effectiveFoundStatus(item, settings))} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}

      {tab === 'claims' &&
        (myClaims.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="You have no claims"
            text="Find your item in Found Items and start a claim from its page."
            actionLabel="Browse found items"
            actionHref="/found"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {myClaims.map((claim) => {
              const item = itemById.get(claim.foundItemId);
              return (
                <Card key={claim.id} className="flex flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] text-ink-3">{claim.id}</p>
                      <p className="mt-1 text-[16px] font-semibold text-ink">{item?.title ?? 'Item removed'}</p>
                      <p className="mt-0.5 text-[14px] text-ink-2">
                        {item && (
                          <Link href={`/found/${item.id}`} className="font-mono text-[12px] underline-offset-4 hover:underline">
                            {item.id}
                          </Link>
                        )}
                        {claim.lostReportId && (
                          <>
                            {' '}
                            · Linked to <span className="font-mono text-[12px]">{claim.lostReportId}</span>
                          </>
                        )}
                        {' '}· Submitted {formatDate(claim.submittedOn)}
                      </p>
                    </div>
                    <StatusPill kind={claim.status} />
                  </div>

                  <div className="mt-6">
                    <ClaimTracker status={claim.status} />
                  </div>

                  {claim.status === 'submitted' && (
                    <p className="mt-6 border-t border-divider pt-4 text-[14px] text-ink-2">
                      The desk is checking your answer against the details on record.
                    </p>
                  )}
                  {claim.status === 'approved' && (
                    <NoticeBox icon={FileCheck2} className="mt-6">
                      Collect from Central Lost and Found Desk. Bring your college ID.
                    </NoticeBox>
                  )}
                  {claim.status === 'rejected' && (
                    <div className="mt-6 rounded-[12px] border border-[#EBD3CE] bg-[#F7E8E5] p-4 text-[14px]">
                      <p className="font-medium text-[#A94438]">Claim rejected</p>
                      <p className="mt-1 text-ink">{claim.rejectionReason ?? 'No reason was given.'}</p>
                    </div>
                  )}
                  {claim.status === 'handed_over' && claim.handoverDate && (
                    <p className="mt-6 border-t border-divider pt-4 text-[14px] text-ink-2">
                      Handed over on {formatDate(claim.handoverDate)}.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        ))}
    </div>
  );
}

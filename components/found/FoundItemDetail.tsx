'use client';

import { ArrowLeft, EyeOff, PackageX } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { BLUR_CAPTION, ItemPhoto } from '@/components/ui/ItemPhoto';
import { NoticeBox } from '@/components/ui/NoticeBox';
import { StatusPill, foundItemPill } from '@/components/ui/StatusPill';
import { canSeeHiddenDetails, effectiveFoundStatus, isActiveClaim } from '@/lib/domain';
import { formatDate, relativeTime } from '@/lib/format';
import { useCurrentUser, useStore } from '@/lib/store';
import { StatusTimeline } from './StatusTimeline';

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
      {label}
    </Link>
  );
}

export function FoundItemDetail({ id }: { id: string }) {
  const user = useCurrentUser();
  const item = useStore((s) => s.foundItems.find((f) => f.id === id));
  const allClaims = useStore((s) => s.claims);
  const categories = useStore((s) => s.categories);
  const settings = useStore((s) => s.settings);

  const claims = useMemo(() => allClaims.filter((c) => c.foundItemId === id), [allClaims, id]);

  if (!item) {
    return (
      <EmptyState
        icon={PackageX}
        title="This item could not be found"
        text="It may have been removed, or the link is wrong."
        actionLabel="Back to Found Items"
        actionHref="/found"
      />
    );
  }

  const status = effectiveFoundStatus(item, settings);
  const staffView = canSeeHiddenDetails(user?.role);
  const blurred = !staffView && !!item.photo;
  const myActiveClaim = claims.find((c) => c.userId === user?.id && isActiveClaim(c.status));
  const isFinder = item.reportedBy === user?.id;
  const canClaim = status !== 'returned' && !myActiveClaim && !isFinder;
  const category = categories.find((c) => c.id === item.categoryId)?.name;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/found" label="Back to Found Items" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <ItemPhoto categoryId={item.categoryId} photo={item.photo} blurred={blurred} className="aspect-[16/9] w-full" />
          <div className="p-5 sm:p-8">
            {blurred && <p className="mb-3 text-[13px] text-ink-3">{BLUR_CAPTION}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[13px] text-ink-3">{item.id}</span>
              <StatusPill kind={foundItemPill(status)} />
            </div>
            <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
              {item.title}
            </h1>
            <p className="mt-3 text-body text-ink-2">{item.publicDescription}</p>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-divider pt-6 sm:grid-cols-2">
              {[
                ['Category', category],
                ['Found at', item.locationFound],
                ['Date found', `${formatDate(item.dateFound)} (${relativeTime(item.dateFound)})`],
                ['Held at', item.heldAt],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[13px] text-ink-3">{label}</dt>
                  <dd className="mt-0.5 text-[15px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            {staffView && (
              <NoticeBox icon={EyeOff} className="mt-6">
                <p className="font-semibold">Identifying details on record</p>
                <p className="mt-1 text-ink-2">{item.hiddenDetails}</p>
                <p className="mt-2 text-[13px] text-ink-3">Visible to desk staff and administrators only.</p>
              </NoticeBox>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <Eyebrow>Status</Eyebrow>
            <div className="mt-4">
              <StatusTimeline item={item} status={status} claims={claims} />
            </div>
          </Card>

          <Card className="p-6">
            {canClaim && (
              <>
                <p className="text-[16px] font-semibold text-ink">Is this yours?</p>
                <p className="mt-1.5 text-[14px] text-ink-2">
                  Describe something only the owner would know. The desk checks it before release.
                </p>
                <ButtonLink href={`/found/${item.id}/claim`} size="lg" className="mt-5 w-full">
                  This is mine, start a claim
                </ButtonLink>
              </>
            )}
            {myActiveClaim && (
              <>
                <p className="text-[16px] font-semibold text-ink">Your claim is in progress</p>
                <p className="mt-1.5 text-[14px] text-ink-2">
                  Claim <span className="font-mono text-ink">{myActiveClaim.id}</span> was submitted{' '}
                  {relativeTime(myActiveClaim.submittedOn).toLowerCase()}.
                </p>
                <ButtonLink href="/my-reports?tab=claims" variant="secondary" className="mt-5 w-full">
                  Track my claim
                </ButtonLink>
              </>
            )}
            {!myActiveClaim && status === 'returned' && (
              <>
                <p className="text-[16px] font-semibold text-ink">Returned to its owner</p>
                <p className="mt-1.5 text-[14px] text-ink-2">This item has been handed over and can no longer be claimed.</p>
              </>
            )}
            {!myActiveClaim && status !== 'returned' && isFinder && (
              <>
                <p className="text-[16px] font-semibold text-ink">You reported this item</p>
                <p className="mt-1.5 text-[14px] text-ink-2">Thank you. The owner will be notified when a matching report comes in.</p>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

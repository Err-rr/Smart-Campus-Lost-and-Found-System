'use client';

import { Check, MapPin } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { BLUR_CAPTION, ItemPhoto } from '@/components/ui/ItemPhoto';
import { formatDate } from '@/lib/format';
import { calendarDayGap, FACTOR_LABEL, FACTOR_MAX, FACTOR_ORDER } from '@/lib/matching';
import type { FoundItem, LostReport, Match, MatchFactor } from '@/lib/types';

export function ScoreBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-divider"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-panel" style={{ width: `${pct}%` }} />
    </div>
  );
}

function factorNote(factor: MatchFactor, report: LostReport, item: FoundItem): string {
  switch (factor) {
    case 'category':
      return 'Both in the same category';
    case 'location':
      return report.locationLost.toLowerCase() === item.locationFound.toLowerCase()
        ? `Both at ${item.locationFound}`
        : `Lost at ${report.locationLost}, found at ${item.locationFound}`;
    case 'date': {
      const gap = calendarDayGap(report.dateLost, item.dateFound);
      return gap === 0 ? 'Found the same day' : `Found ${gap} day${gap === 1 ? '' : 's'} after it was lost`;
    }
    case 'keywords':
      return 'Shared words in the name and description';
  }
}

interface MatchCardProps {
  match: Match;
  report: LostReport;
  item: FoundItem;
  blurPhoto: boolean;
  onDismiss?: () => void;
}

export function MatchCard({ match, report, item, blurPhoto, onDismiss }: MatchCardProps) {
  const confirmed = match.status === 'confirmed';

  return (
    <div className="grid grid-cols-1 gap-4 rounded-[14px] border border-line bg-white p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
      <div className="flex flex-col">
      <div className="flex gap-4">
        <ItemPhoto
          categoryId={item.categoryId}
          photo={item.photo}
          blurred={blurPhoto}
          className="h-16 w-16 shrink-0 rounded-[12px] [&_svg]:h-6 [&_svg]:w-6"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="text-[15px] font-medium text-ink">{item.title}</p>
            <span className="font-mono text-[12px] text-ink-3">{item.id}</span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[14px] text-ink-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.5} aria-hidden />
              {item.locationFound}
            </span>
            <span aria-hidden>·</span>
            <span>{formatDate(item.dateFound)}</span>
          </p>
          <p className="mt-0.5 text-[13px] text-ink-3">Held at {item.heldAt}</p>
          {blurPhoto && item.photo && <p className="mt-0.5 text-[12px] text-ink-3">{BLUR_CAPTION}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[24px] font-medium leading-none text-ink">{match.matchScore}</p>
          <p className="mt-1 font-mono text-[11px] text-ink-3">/ 100</p>
        </div>
      </div>

      <div className="mt-4">
        <ScoreBar value={match.matchScore} label="Match score" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-auto lg:pt-4">
        <ButtonLink href={`/found/${item.id}`} variant="secondary">
          View item
        </ButtonLink>
        {confirmed ? (
          <span className="inline-flex items-center gap-1.5 px-2 text-[14px] text-ink-2">
            <Check size={16} strokeWidth={1.5} aria-hidden />
            Confirmed by a claim
          </span>
        ) : (
          onDismiss && (
            <Button variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )
        )}
      </div>
      </div>

      <div className="rounded-[12px] bg-[#FAFAF8] p-4">
        <Eyebrow>Why this match</Eyebrow>
        <dl className="mt-3 flex flex-col gap-2.5">
          {FACTOR_ORDER.map((factor) => (
            <div key={factor} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1">
              <dt className="min-w-0">
                <span className="text-[14px] text-ink">{FACTOR_LABEL[factor]}</span>
                <span className="block text-[12px] text-ink-3">{factorNote(factor, report, item)}</span>
              </dt>
              <dd className="font-mono text-[13px] tabular-nums text-ink">
                {match.breakdown[factor]}
                <span className="text-ink-3"> / {FACTOR_MAX[factor]}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

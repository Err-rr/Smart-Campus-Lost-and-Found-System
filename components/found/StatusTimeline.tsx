import { Check } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { Claim, FoundItem, FoundItemStatus } from '@/lib/types';

interface StatusTimelineProps {
  item: FoundItem;
  status: FoundItemStatus; // effective status (may be "unclaimed")
  claims: Claim[]; // claims on this item
}

export function StatusTimeline({ item, status, claims }: StatusTimelineProps) {
  const latestClaim = [...claims]
    .filter((c) => c.status !== 'rejected')
    .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))[0];
  const handover = claims.find((c) => c.status === 'handed_over');

  const current = status === 'returned' ? 3 : status === 'claim_pending' ? 2 : 1;

  const steps = [
    { title: 'Reported', note: `Found at ${item.locationFound} on ${formatDate(item.dateFound)}` },
    {
      title: 'In custody',
      note: status === 'unclaimed' ? `At ${item.heldAt}. Not claimed for over 30 days` : `At ${item.heldAt}`,
    },
    {
      title: 'Claim pending',
      note: latestClaim && current >= 2 ? `Claim submitted ${formatDate(latestClaim.submittedOn)}` : 'Waiting for the owner',
    },
    {
      title: 'Returned',
      note: handover?.handoverDate ? `Handed over ${formatDate(handover.handoverDate)}` : 'After a verified handover',
    },
  ];

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const done = i < current || (i === current && current === 3);
        const isCurrent = i === current && !done;
        const last = i === steps.length - 1;
        return (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={`absolute left-[11px] top-7 h-[calc(100%-28px)] w-px ${i < current ? 'bg-panel' : 'bg-divider'}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                done
                  ? 'border-panel bg-panel text-white'
                  : isCurrent
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-line bg-white'
              }`}
              aria-hidden
            >
              {done && <Check size={14} strokeWidth={2} />}
              {isCurrent && <span className="h-2 w-2 rounded-full bg-accent-ink" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-[15px] ${done || isCurrent ? 'font-medium text-ink' : 'text-ink-3'}`}>
                {step.title}
                {isCurrent && <span className="sr-only"> (current step)</span>}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-2">{step.note}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

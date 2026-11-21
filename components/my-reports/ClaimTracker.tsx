import { Check, X } from 'lucide-react';
import type { ClaimStatus } from '@/lib/types';

const STEPS = ['Submitted', 'Approved', 'Handed over'];

/** Horizontal tracker: Submitted, Approved, Handed over. A rejection replaces step 2. */
export function ClaimTracker({ status }: { status: ClaimStatus }) {
  const rejected = status === 'rejected';
  const reached = status === 'submitted' ? 0 : status === 'approved' ? 1 : status === 'handed_over' ? 2 : 1;

  return (
    <ol className="flex items-start" aria-label="Claim progress">
      {STEPS.map((label, i) => {
        const isRejectStep = rejected && i === 1;
        const done = !isRejectStep && i <= reached && !(rejected && i > 1);
        const current = done && i === reached && status !== 'handed_over';
        const name = isRejectStep ? 'Rejected' : label;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3 h-px w-full ${i <= reached && !rejected ? 'bg-panel' : 'bg-divider'}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border ${
                isRejectStep
                  ? 'border-[#A94438] bg-[#F7E8E5] text-[#A94438]'
                  : current
                    ? 'border-accent bg-accent text-accent-ink'
                    : done
                      ? 'border-panel bg-panel text-white'
                      : 'border-line bg-white'
              }`}
              aria-hidden
            >
              {isRejectStep ? <X size={13} strokeWidth={2} /> : done && <Check size={13} strokeWidth={2} />}
            </span>
            <span
              className={`mt-2 text-[13px] ${
                isRejectStep ? 'font-medium text-[#A94438]' : done ? 'font-medium text-ink' : 'text-ink-3'
              }`}
            >
              {name}
              <span className="sr-only">{done || isRejectStep ? ' (reached)' : ' (not yet)'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

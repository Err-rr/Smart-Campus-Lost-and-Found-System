import type { ClaimStatus, FoundItemStatus, LostReportStatus } from '@/lib/types';

export type PillKind =
  | 'lost'
  | 'in_custody'
  | 'matched'
  | 'claim_pending'
  | 'returned'
  | 'closed'
  | 'unclaimed'
  | ClaimStatus;

const PILLS: Record<PillKind, { label: string; fg: string; bg: string }> = {
  lost: { label: 'Lost', fg: '#A94438', bg: '#F7E8E5' },
  in_custody: { label: 'In custody', fg: '#3B7A4B', bg: '#E5F0E7' },
  matched: { label: 'Matched', fg: '#8A6A00', bg: '#FBF1CF' },
  claim_pending: { label: 'Claim pending', fg: '#3F5F8A', bg: '#E6EDF6' },
  returned: { label: 'Returned', fg: '#52525B', bg: '#EEEEEC' },
  closed: { label: 'Closed', fg: '#52525B', bg: '#EEEEEC' },
  unclaimed: { label: 'Unclaimed', fg: '#7A4A1E', bg: '#F5EBE0' },
  // Claim statuses reuse the same muted palette.
  submitted: { label: 'Submitted', fg: '#3F5F8A', bg: '#E6EDF6' },
  approved: { label: 'Approved', fg: '#3B7A4B', bg: '#E5F0E7' },
  rejected: { label: 'Rejected', fg: '#A94438', bg: '#F7E8E5' },
  handed_over: { label: 'Handed over', fg: '#52525B', bg: '#EEEEEC' },
};

export function lostReportPill(status: LostReportStatus): PillKind {
  if (status === 'open') return 'lost';
  return status;
}

export function foundItemPill(status: FoundItemStatus): PillKind {
  return status;
}

export function StatusPill({ kind, className = '' }: { kind: PillKind; className?: string }) {
  const pill = PILLS[kind];
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium ${className}`}
      style={{ color: pill.fg, backgroundColor: pill.bg }}
    >
      {pill.label}
    </span>
  );
}

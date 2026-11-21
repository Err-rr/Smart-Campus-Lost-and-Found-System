'use client';

import { Inbox } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ScoreBar } from '@/components/matching/MatchCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Field, Textarea } from '@/components/ui/Form';
import { ItemPhoto } from '@/components/ui/ItemPhoto';
import { SidePanel } from '@/components/ui/Overlay';
import { StatusPill } from '@/components/ui/StatusPill';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { formatDate, relativeTime } from '@/lib/format';
import { useStore } from '@/lib/store';

export function PendingClaims() {
  const claims = useStore((s) => s.claims);
  const users = useStore((s) => s.users);
  const foundItems = useStore((s) => s.foundItems);
  const lostReports = useStore((s) => s.lostReports);
  const matches = useStore((s) => s.matches);
  const approveClaim = useStore((s) => s.approveClaim);
  const rejectClaim = useStore((s) => s.rejectClaim);

  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const pending = useMemo(
    () => claims.filter((c) => c.status === 'submitted').sort((a, b) => a.submittedOn.localeCompare(b.submittedOn)),
    [claims],
  );
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const itemById = useMemo(() => new Map(foundItems.map((f) => [f.id, f])), [foundItems]);

  const open = pending.find((c) => c.id === openId) ?? null;
  const openItem = open ? itemById.get(open.foundItemId) : undefined;
  const openUser = open ? userById.get(open.userId) : undefined;
  const openReport = open?.lostReportId ? lostReports.find((r) => r.id === open.lostReportId) : undefined;
  const openMatch = open
    ? matches.find((m) => m.foundItemId === open.foundItemId && m.lostReportId === open.lostReportId)
    : undefined;

  const close = () => {
    setOpenId(null);
    setRejecting(false);
    setReason('');
    setReasonError('');
  };

  const onReject = () => {
    if (!rejecting) {
      setRejecting(true);
      return;
    }
    if (reason.trim().length < 5) {
      setReasonError('Give a reason the claimant can understand.');
      document.getElementById('reject-reason')?.focus();
      return;
    }
    rejectClaim(open!.id, reason.trim());
    close();
  };

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No claims waiting"
        text="New claims from students and staff will appear here for checking."
      />
    );
  }

  return (
    <>
      <Table label="Pending claims" minWidth={760}>
        <thead>
          <tr>
            <Th>Claim ID</Th>
            <Th>Item</Th>
            <Th>Claimant</Th>
            <Th>Roll no</Th>
            <Th>Submitted</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {pending.map((c) => {
            const item = itemById.get(c.foundItemId);
            const u = userById.get(c.userId);
            return (
              <Tr key={c.id} className="cursor-pointer transition-colors hover:bg-[#FAFAF8]" onClick={() => setOpenId(c.id)}>
                <Td>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenId(c.id);
                    }}
                    className="font-mono text-[13px] font-medium underline-offset-4 hover:underline"
                    aria-label={`Review claim ${c.id}`}
                  >
                    {c.id}
                  </button>
                </Td>
                <Td>
                  {item?.title} <span className="ml-1 font-mono text-[12px] text-ink-3">{item?.id}</span>
                </Td>
                <Td>{u?.name}</Td>
                <Td className="font-mono text-[13px]">{u?.rollNo ?? 'Staff'}</Td>
                <Td className="whitespace-nowrap text-ink-2">{relativeTime(c.submittedOn)}</Td>
                <Td>
                  <StatusPill kind={c.status} />
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>

      <SidePanel
        open={!!open}
        onClose={close}
        title={open ? `Review claim ${open.id}` : 'Review claim'}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={onReject}>
              {rejecting ? 'Confirm rejection' : 'Reject'}
            </Button>
            <Button
              size="lg"
              onClick={() => {
                approveClaim(open!.id);
                close();
              }}
            >
              Approve
            </Button>
          </>
        }
      >
        {open && openItem && (
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <ItemPhoto categoryId={openItem.categoryId} photo={openItem.photo} className="h-20 w-20 shrink-0 rounded-[12px] [&_svg]:h-7 [&_svg]:w-7" />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-ink">{openItem.title}</p>
                <p className="font-mono text-[12px] text-ink-3">{openItem.id}</p>
                <p className="mt-1 text-[14px] text-ink-2">
                  Claimed by {openUser?.name}
                  {openUser?.rollNo && <span className="ml-1.5 font-mono text-[12px]">{openUser.rollNo}</span>}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="rounded-[12px] border border-line p-4">
                <Eyebrow>Claimant says</Eyebrow>
                <p className="mt-2 text-[15px] leading-relaxed text-ink">{open.proofOfOwnership}</p>
                <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-divider pt-3 text-[13px]">
                  <dt className="text-ink-3">Lost on</dt>
                  <dd className="text-ink">{open.lostOn ? formatDate(open.lostOn) : 'Not given'}</dd>
                  <dt className="text-ink-3">Lost at</dt>
                  <dd className="text-ink">{open.lostAt ?? 'Not given'}</dd>
                  <dt className="text-ink-3">Report</dt>
                  <dd className="text-ink">{openReport ? `${openReport.id}: ${openReport.title}` : 'Not linked'}</dd>
                </dl>
              </section>
              <section className="rounded-[12px] border border-notice-line bg-notice-bg p-4">
                <Eyebrow>Identifying details on record</Eyebrow>
                <p className="mt-2 text-[15px] leading-relaxed text-ink">{openItem.hiddenDetails}</p>
                <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-notice-line pt-3 text-[13px]">
                  <dt className="text-ink-3">Found on</dt>
                  <dd className="text-ink">{formatDate(openItem.dateFound)}</dd>
                  <dt className="text-ink-3">Found at</dt>
                  <dd className="text-ink">{openItem.locationFound}</dd>
                  <dt className="text-ink-3">Handed in by</dt>
                  <dd className="text-ink">{openItem.handedInBy ?? 'Not recorded'}</dd>
                </dl>
              </section>
            </div>

            {openMatch && (
              <div>
                <div className="mb-2 flex items-baseline justify-between text-[14px]">
                  <span className="text-ink-2">Match score for the linked report</span>
                  <span className="font-mono text-ink">{openMatch.matchScore} / 100</span>
                </div>
                <ScoreBar value={openMatch.matchScore} label="Match score" />
              </div>
            )}

            {rejecting && (
              <Field id="reject-reason" label="Reason for rejection" error={reasonError} helper="The claimant will see this reason.">
                <Textarea
                  id="reject-reason"
                  autoFocus
                  value={reason}
                  invalid={!!reasonError}
                  maxLength={300}
                  placeholder="e.g. The details given do not match the item."
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (reasonError) setReasonError('');
                  }}
                />
              </Field>
            )}
          </div>
        )}
      </SidePanel>
    </>
  );
}

'use client';

import { Check, PackageX } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { BackLink } from '@/components/found/FoundItemDetail';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { PageHeader } from '@/components/ui/PageHeader';
import { isActiveClaim } from '@/lib/domain';
import { formatDate } from '@/lib/format';
import { CAMPUS_LOCATIONS } from '@/lib/seed';
import { useCurrentUser, useStore } from '@/lib/store';
import type { Claim } from '@/lib/types';

const OTHER = '__other';

const toInput = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const todayInput = () => toInput(new Date().toISOString());

export function ClaimView({ id }: { id: string }) {
  const user = useCurrentUser();
  const item = useStore((s) => s.foundItems.find((f) => f.id === id));
  const lostReports = useStore((s) => s.lostReports);
  const claims = useStore((s) => s.claims);
  const matches = useStore((s) => s.matches);
  const submitClaim = useStore((s) => s.submitClaim);

  const myReports = useMemo(() => {
    if (!user || !item) return [];
    const matchedIds = new Set(matches.filter((m) => m.foundItemId === item.id).map((m) => m.lostReportId));
    return lostReports
      .filter((r) => r.userId === user.id && r.status !== 'closed')
      .sort((a, b) => {
        // Reports matched to this item first, then same category.
        const rank = (r: typeof a) => (matchedIds.has(r.id) ? 0 : r.categoryId === item.categoryId ? 1 : 2);
        return rank(a) - rank(b);
      });
  }, [user, item, lostReports, matches]);

  const suggested = myReports.find((r) => matches.some((m) => m.foundItemId === id && m.lostReportId === r.id));

  const [reportId, setReportId] = useState(suggested?.id ?? '');
  const [proof, setProof] = useState('');
  const [lostOn, setLostOn] = useState(suggested ? toInput(suggested.dateLost) : '');
  const [lostAt, setLostAt] = useState(
    suggested ? ((CAMPUS_LOCATIONS as readonly string[]).includes(suggested.locationLost) ? suggested.locationLost : OTHER) : '',
  );
  const [otherLocation, setOtherLocation] = useState(
    suggested && !(CAMPUS_LOCATIONS as readonly string[]).includes(suggested.locationLost) ? suggested.locationLost : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Claim | null>(null);

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

  if (done) {
    return (
      <Card className="mx-auto w-full max-w-[640px] p-6 sm:p-10">
        <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-accent text-accent-ink">
          <Check size={26} strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.02em] text-ink">Claim submitted</h1>
        <p className="mt-2 text-body text-ink-2">
          {item.title} <span className="font-mono text-[13px] text-ink-3">{item.id}</span>
        </p>
        <p className="mt-5 inline-block rounded-[10px] bg-tile px-4 py-2 font-mono text-[22px] font-medium text-ink">{done.id}</p>
        <ol className="mt-6 flex flex-col gap-3 border-t border-divider pt-6">
          {[
            'The desk compares your answer with the details on record.',
            'You will get an email and SMS when your claim is approved or rejected.',
            'If approved, collect the item from Central Lost and Found Desk with your college ID.',
          ].map((line, i) => (
            <li key={line} className="flex gap-3 text-[15px] text-ink">
              <span className="mt-0.5 font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              {line}
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ButtonLink href="/my-reports?tab=claims" size="lg">
            Track my claim
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const blocked =
    item.status === 'returned'
      ? 'This item has already been returned to its owner.'
      : claims.some((c) => c.foundItemId === item.id && c.userId === user?.id && isActiveClaim(c.status))
        ? 'You already have a claim in progress for this item.'
        : item.reportedBy === user?.id
          ? 'You reported this item, so you cannot claim it.'
          : null;

  if (blocked) {
    return (
      <EmptyState
        icon={PackageX}
        title="You cannot claim this item"
        text={blocked}
        actionLabel="Back to the item"
        actionHref={`/found/${item.id}`}
      />
    );
  }

  const onLinkReport = (value: string) => {
    setReportId(value);
    const r = myReports.find((x) => x.id === value);
    if (r) {
      setLostOn(toInput(r.dateLost));
      if ((CAMPUS_LOCATIONS as readonly string[]).includes(r.locationLost)) {
        setLostAt(r.locationLost);
      } else {
        setLostAt(OTHER);
        setOtherLocation(r.locationLost);
      }
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (proof.trim().length < 20) errs.proof = 'Give at least one specific detail, 20 characters or more.';
    if (!lostOn) errs.lostOn = 'Choose the date you lost it.';
    else if (lostOn > todayInput()) errs.lostOn = 'The date cannot be in the future.';
    if (!lostAt) errs.lostAt = 'Choose where you lost it.';
    if (lostAt === OTHER && otherLocation.trim().length < 3) errs.otherLocation = 'Enter where you lost it.';
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`c-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const claim = submitClaim({
      foundItemId: item.id,
      lostReportId: reportId || undefined,
      proofOfOwnership: proof.trim(),
      lostOn: new Date(`${lostOn}T12:00:00`).toISOString(),
      lostAt: lostAt === OTHER ? otherLocation.trim() : lostAt,
    });
    setDone(claim);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`/found/${item.id}`} label="Back to the item" />
      <PageHeader
        eyebrow="Start a claim"
        title="Claim this item"
        description="The desk releases items only when your answer matches the details on record."
      />

      <div className="w-full max-w-[640px]">
        <Card className="flex items-center gap-4 p-4">
          <ItemThumb categoryId={item.categoryId} photo={item.photo} blurred />
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-ink">{item.title}</p>
            <p className="text-[14px] text-ink-2">
              <span className="font-mono text-[12px] text-ink-3">{item.id}</span> · Found at {item.locationFound},{' '}
              {formatDate(item.dateFound)}
            </p>
          </div>
        </Card>

        <Card className="mt-4 p-5 sm:p-8">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field id="c-report" label="Link one of my lost reports" optional>
              <Select id="c-report" value={reportId} onChange={(e) => onLinkReport(e.target.value)}>
                <option value="">Do not link a report</option>
                {myReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              id="c-proof"
              label="Describe something only the owner would know"
              error={errors.proof}
              helper="For example the lock screen, stickers, contents, or marks and scratches."
            >
              <Textarea
                id="c-proof"
                value={proof}
                invalid={!!errors.proof}
                maxLength={500}
                onChange={(e) => {
                  setProof(e.target.value);
                  if (errors.proof) setErrors((x) => ({ ...x, proof: '' }));
                }}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="c-lostOn" label="When did you lose it?" error={errors.lostOn}>
                <Input
                  id="c-lostOn"
                  type="date"
                  value={lostOn}
                  max={todayInput()}
                  invalid={!!errors.lostOn}
                  onChange={(e) => setLostOn(e.target.value)}
                />
              </Field>
              <Field id="c-lostAt" label="Where did you lose it?" error={errors.lostAt}>
                <Select id="c-lostAt" value={lostAt} invalid={!!errors.lostAt} onChange={(e) => setLostAt(e.target.value)}>
                  <option value="">Choose a location</option>
                  {CAMPUS_LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  <option value={OTHER}>Other</option>
                </Select>
              </Field>
            </div>

            {lostAt === OTHER && (
              <Field id="c-otherLocation" label="Other location" error={errors.otherLocation}>
                <Input
                  id="c-otherLocation"
                  value={otherLocation}
                  invalid={!!errors.otherLocation}
                  maxLength={60}
                  onChange={(e) => setOtherLocation(e.target.value)}
                />
              </Field>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-ink-2">The desk may ask for more proof at handover.</p>
              <Button type="submit" size="lg">
                Submit claim
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

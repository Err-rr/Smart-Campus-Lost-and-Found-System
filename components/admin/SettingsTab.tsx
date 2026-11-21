'use client';

import { Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Form';
import { Dialog } from '@/components/ui/Overlay';
import { useStore } from '@/lib/store';

export function SettingsTab() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetDemoData = useStore((s) => s.resetDemoData);

  const [threshold, setThreshold] = useState(String(settings.matchThreshold));
  const [days, setDays] = useState(String(settings.unclaimedDays));
  const [errors, setErrors] = useState<{ threshold?: string; days?: string }>({});
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    const t = Number(threshold);
    const d = Number(days);
    const errs: typeof errors = {};
    if (!Number.isInteger(t) || t < 40 || t > 100) errs.threshold = 'Enter a whole number from 40 to 100.';
    if (!Number.isInteger(d) || d < 1 || d > 365) errs.days = 'Enter a whole number from 1 to 365.';
    setErrors(errs);
    setSaved(false);
    if (Object.keys(errs).length) return;
    updateSettings({ matchThreshold: t, unclaimedDays: d });
    setSaved(true);
  };

  const onReset = () => {
    resetDemoData();
    const seeded = useStore.getState().settings;
    setThreshold(String(seeded.matchThreshold));
    setDays(String(seeded.unclaimedDays));
    setErrors({});
    setSaved(false);
    setConfirmReset(false);
    setResetDone(true);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
      <Card className="p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-ink">Matching and custody</h2>
        <form onSubmit={onSave} noValidate className="mt-5 flex flex-col gap-5">
          <Field
            id="s-threshold"
            label="Match threshold"
            error={errors.threshold}
            helper="Matches scoring at or above this are suggested to the owner. Default 60."
          >
            <Input
              id="s-threshold"
              type="number"
              inputMode="numeric"
              min={40}
              max={100}
              value={threshold}
              invalid={!!errors.threshold}
              className="font-mono sm:w-40"
              onChange={(e) => {
                setThreshold(e.target.value);
                setSaved(false);
              }}
            />
          </Field>
          <Field
            id="s-days"
            label="Days before an item is unclaimed"
            error={errors.days}
            helper="Items in custody longer than this are flagged at the desk. Default 30."
          >
            <Input
              id="s-days"
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              value={days}
              invalid={!!errors.days}
              className="font-mono sm:w-40"
              onChange={(e) => {
                setDays(e.target.value);
                setSaved(false);
              }}
            />
          </Field>
          <div className="flex items-center gap-4 border-t border-divider pt-5">
            <Button type="submit">Save settings</Button>
            {saved && (
              <span role="status" className="flex items-center gap-1.5 text-[14px] text-ink-2">
                <Check size={16} strokeWidth={1.5} aria-hidden />
                Saved
              </span>
            )}
          </div>
          <p className="text-[13px] text-ink-2">A new threshold applies to reports and items added from now on.</p>
        </form>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-ink">Demo data</h2>
        <p className="mt-2 text-[14px] text-ink-2">
          Restore the original users, reports, items, claims and settings. Everything added in this browser is removed.
          You stay signed in.
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => setConfirmReset(true)}>
          Reset demo data
        </Button>
        {resetDone && (
          <p role="status" className="mt-3 flex items-center gap-1.5 text-[14px] text-ink-2">
            <Check size={16} strokeWidth={1.5} aria-hidden />
            Demo data restored
          </p>
        )}
      </Card>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button size="lg" onClick={onReset}>
              Reset demo data
            </Button>
          </>
        }
      >
        <p className="text-[15px] text-ink-2">
          All reports, claims, matches and settings in this browser go back to the original demo data. This cannot be
          undone.
        </p>
      </Dialog>
    </div>
  );
}

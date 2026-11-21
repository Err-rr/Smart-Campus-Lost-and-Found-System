'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { PageHeader } from '@/components/ui/PageHeader';
import { PhotoInput } from '@/components/ui/PhotoInput';
import { Tabs } from '@/components/ui/Tabs';
import { CAMPUS_LOCATIONS, DESKS } from '@/lib/seed';
import { useCurrentUser, useStore } from '@/lib/store';

type ReportType = 'lost' | 'found';
const OTHER = '__other';

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Today keeps the current time so lists say "Just now". Past days use midday. */
function dateInputToIso(value: string): string {
  if (value === todayInput()) return new Date().toISOString();
  return new Date(`${value}T12:00:00`).toISOString();
}

interface FormState {
  categoryId: string;
  title: string;
  description: string;
  location: string;
  otherLocation: string;
  date: string;
  photo?: string;
  hiddenDetails: string;
  whereNow: 'desk' | 'with_me';
  desk: string;
}

const emptyForm = (): FormState => ({
  categoryId: '',
  title: '',
  description: '',
  location: '',
  otherLocation: '',
  date: todayInput(),
  photo: undefined,
  hiddenDetails: '',
  whereNow: 'desk',
  desk: '',
});

type Errors = Partial<Record<keyof FormState, string>>;

interface Result {
  type: ReportType;
  id: string;
  title: string;
  matchCount: number;
  heldAt?: string;
  withFinder?: boolean;
}

export function ReportView({ initialType }: { initialType: ReportType }) {
  const router = useRouter();
  const user = useCurrentUser();
  const categories = useStore((s) => s.categories);
  const addLostReport = useStore((s) => s.addLostReport);
  const addFoundItem = useStore((s) => s.addFoundItem);

  const [type, setType] = useState<ReportType>(initialType);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Result | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const switchType = (next: ReportType) => {
    setType(next);
    setErrors({});
    router.replace(`/report?type=${next}`, { scroll: false });
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.categoryId) e.categoryId = 'Choose a category.';
    if (form.title.trim().length < 3) e.title = 'Enter the item name.';
    if (form.description.trim().length < 10) e.description = 'Add a short description, at least 10 characters.';
    if (!form.location) e.location = 'Choose a location.';
    if (form.location === OTHER && form.otherLocation.trim().length < 3) e.otherLocation = 'Enter where it was.';
    if (!form.date) e.date = 'Choose a date.';
    else if (form.date > todayInput()) e.date = 'The date cannot be in the future.';
    if (type === 'found') {
      if (!form.photo) e.photo = 'A photo is required for found items.';
      if (form.hiddenDetails.trim().length < 5) e.hiddenDetails = 'Add at least one detail only the owner would know.';
      if (form.whereNow === 'desk' && !form.desk) e.desk = 'Choose the desk.';
    }
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    const location = form.location === OTHER ? form.otherLocation.trim() : form.location;
    const dateIso = dateInputToIso(form.date);

    if (type === 'lost') {
      const { report, matches } = addLostReport({
        categoryId: form.categoryId,
        title: form.title.trim(),
        description: form.description.trim(),
        locationLost: location,
        dateLost: dateIso,
        photo: form.photo,
      });
      setResult({ type, id: report.id, title: report.title, matchCount: matches.length });
    } else {
      const withFinder = form.whereNow === 'with_me';
      const { item, matches } = addFoundItem({
        categoryId: form.categoryId,
        title: form.title.trim(),
        publicDescription: form.description.trim(),
        hiddenDetails: form.hiddenDetails.trim(),
        locationFound: location,
        dateFound: dateIso,
        photo: form.photo,
        handedInBy: user?.name,
        heldAt: withFinder ? 'With the finder' : form.desk,
      });
      setResult({ type, id: item.id, title: item.title, matchCount: matches.length, heldAt: item.heldAt, withFinder });
    }
    setForm(emptyForm());
    window.scrollTo({ top: 0 });
  };

  if (result) {
    return <SuccessScreen result={result} onAnother={() => setResult(null)} />;
  }

  const isFound = type === 'found';

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Report an item"
        title="Report"
        description="Tell us what you lost or found. Reports are checked against each other automatically."
      />

      <div className="w-full max-w-[640px]">
        <Tabs
          label="Report type"
          value={type}
          onChange={switchType}
          tabs={[
            { value: 'lost', label: 'I lost something' },
            { value: 'found', label: 'I found something' },
          ]}
        />

        <Card className="mt-6 p-5 sm:p-8">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field id="f-categoryId" label="Category" error={errors.categoryId}>
              <Select
                id="f-categoryId"
                value={form.categoryId}
                invalid={!!errors.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
              >
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="f-title" label="Item name" error={errors.title}>
              <Input
                id="f-title"
                value={form.title}
                invalid={!!errors.title}
                maxLength={60}
                placeholder={isFound ? 'e.g. Black backpack' : 'e.g. Scientific calculator'}
                onChange={(e) => update('title', e.target.value)}
              />
            </Field>

            <Field
              id="f-description"
              label="Description"
              error={errors.description}
              helper={
                isFound
                  ? 'Describe what anyone can see. Keep marks and contents for the field below.'
                  : 'Colour, brand, size and anything that makes it easy to recognise.'
              }
            >
              <Textarea
                id="f-description"
                value={form.description}
                invalid={!!errors.description}
                maxLength={400}
                onChange={(e) => update('description', e.target.value)}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="f-location" label={isFound ? 'Where you found it' : 'Where you lost it'} error={errors.location}>
                <Select
                  id="f-location"
                  value={form.location}
                  invalid={!!errors.location}
                  onChange={(e) => update('location', e.target.value)}
                >
                  <option value="">Choose a location</option>
                  {CAMPUS_LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  <option value={OTHER}>Other</option>
                </Select>
              </Field>

              <Field id="f-date" label={isFound ? 'Date found' : 'Date lost'} error={errors.date}>
                <Input
                  id="f-date"
                  type="date"
                  value={form.date}
                  max={todayInput()}
                  invalid={!!errors.date}
                  onChange={(e) => update('date', e.target.value)}
                />
              </Field>
            </div>

            {form.location === OTHER && (
              <Field id="f-otherLocation" label="Other location" error={errors.otherLocation}>
                <Input
                  id="f-otherLocation"
                  value={form.otherLocation}
                  invalid={!!errors.otherLocation}
                  maxLength={60}
                  placeholder="e.g. Parking near Gate 3"
                  onChange={(e) => update('otherLocation', e.target.value)}
                />
              </Field>
            )}

            <Field id="f-photo" label="Photo" optional={!isFound} error={errors.photo}>
              <PhotoInput
                id="f-photo"
                value={form.photo}
                invalid={!!errors.photo}
                onChange={(v) => update('photo', v)}
              />
            </Field>

            {isFound && (
              <>
                <Field
                  id="f-hiddenDetails"
                  label="Identifying details"
                  error={errors.hiddenDetails}
                  helper="Only desk staff will see this. It is used to check ownership."
                >
                  <Textarea
                    id="f-hiddenDetails"
                    value={form.hiddenDetails}
                    invalid={!!errors.hiddenDetails}
                    maxLength={300}
                    placeholder="e.g. Name inside the cover, sticker on the back, contents"
                    onChange={(e) => update('hiddenDetails', e.target.value)}
                  />
                </Field>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1.5 text-[14px] font-medium text-ink">Where is the item now?</legend>
                  {(
                    [
                      { value: 'desk', label: 'Handed in at a desk' },
                      { value: 'with_me', label: 'I still have it' },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex h-12 cursor-pointer items-center gap-3 rounded-[10px] border px-4 text-[15px] transition-colors ${
                        form.whereNow === opt.value ? 'border-ink-icon bg-white' : 'border-line bg-white hover:border-[#D6D3CB]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="whereNow"
                        value={opt.value}
                        checked={form.whereNow === opt.value}
                        onChange={() => update('whereNow', opt.value)}
                        className="h-4 w-4 accent-[#111111]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </fieldset>

                {form.whereNow === 'desk' && (
                  <Field id="f-desk" label="Which desk?" error={errors.desk}>
                    <Select
                      id="f-desk"
                      value={form.desk}
                      invalid={!!errors.desk}
                      onChange={(e) => update('desk', e.target.value)}
                    >
                      <option value="">Choose a desk</option>
                      {DESKS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}
              </>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-ink-2">Your name and contact details are never shown on public lists.</p>
              <Button type="submit" size="lg">
                {isFound ? 'Submit found item' : 'Submit lost report'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function SuccessScreen({ result, onAnother }: { result: Result; onAnother: () => void }) {
  const lines: string[] =
    result.type === 'lost'
      ? [
          result.matchCount > 0
            ? `We found ${result.matchCount} possible match${result.matchCount === 1 ? '' : 'es'}. Review ${result.matchCount === 1 ? 'it' : 'them'} under My Reports.`
            : 'No matching item has been handed in yet.',
          'Every new found item is checked against your report. You will get an email and SMS if one matches.',
          'Bring your college ID when you collect an item.',
        ]
      : [
          result.withFinder
            ? 'Please hand the item in at the nearest desk within 2 days.'
            : `The item is recorded as held at ${result.heldAt}.`,
          result.matchCount > 0
            ? `It matches ${result.matchCount} open lost report${result.matchCount === 1 ? '' : 's'}. The owner has been notified.`
            : 'We will notify the owner as soon as a matching lost report comes in.',
          'The owner must prove ownership before the desk releases it.',
        ];

  return (
    <Card className="mx-auto w-full max-w-[640px] p-6 sm:p-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-accent text-accent-ink">
        <Check size={26} strokeWidth={1.5} aria-hidden />
      </span>
      <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.02em] text-ink">
        {result.type === 'lost' ? 'Lost report submitted' : 'Found item submitted'}
      </h1>
      <p className="mt-2 text-body text-ink-2">{result.title}</p>
      <p className="mt-5 inline-block rounded-[10px] bg-tile px-4 py-2 font-mono text-[22px] font-medium tracking-[0.02em] text-ink">
        {result.id}
      </p>

      <ol className="mt-6 flex flex-col gap-3 border-t border-divider pt-6">
        {lines.map((line, i) => (
          <li key={line} className="flex gap-3 text-[15px] text-ink">
            <span className="mt-0.5 font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
            {line}
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={result.type === 'lost' ? '/my-reports' : '/my-reports?tab=found'} size="lg">
          View my reports
        </ButtonLink>
        <Button variant="secondary" size="lg" onClick={onAnother}>
          Report another item
        </Button>
      </div>
    </Card>
  );
}

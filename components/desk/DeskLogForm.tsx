'use client';

import { Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { PhotoInput } from '@/components/ui/PhotoInput';
import { CAMPUS_LOCATIONS } from '@/lib/seed';
import { HOME_DESK, useStore } from '@/lib/store';

const OTHER = '__other';
const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const empty = () => ({
  categoryId: '',
  title: '',
  description: '',
  location: '',
  otherLocation: '',
  date: todayInput(),
  photo: undefined as string | undefined,
  hiddenDetails: '',
  handedInBy: '',
});

type FormState = ReturnType<typeof empty>;

export function DeskLogForm() {
  const categories = useStore((s) => s.categories);
  const addFoundItem = useStore((s) => s.addFoundItem);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [logged, setLogged] = useState<{ id: string; title: string; matches: number } | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!form.categoryId) e.categoryId = 'Choose a category.';
    if (form.title.trim().length < 3) e.title = 'Enter the item name.';
    if (form.description.trim().length < 10) e.description = 'Add a short description, at least 10 characters.';
    if (!form.location) e.location = 'Choose a location.';
    if (form.location === OTHER && form.otherLocation.trim().length < 3) e.otherLocation = 'Enter where it was found.';
    if (!form.date) e.date = 'Choose a date.';
    else if (form.date > todayInput()) e.date = 'The date cannot be in the future.';
    if (!form.photo) e.photo = 'Take or add a photo of the item.';
    if (form.hiddenDetails.trim().length < 5) e.hiddenDetails = 'Note at least one detail only the owner would know.';
    if (form.handedInBy.trim().length < 2) e.handedInBy = 'Enter a name or roll number.';
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`d-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    const { item, matches } = addFoundItem(
      {
        categoryId: form.categoryId,
        title: form.title.trim(),
        publicDescription: form.description.trim(),
        hiddenDetails: form.hiddenDetails.trim(),
        locationFound: form.location === OTHER ? form.otherLocation.trim() : form.location,
        dateFound: form.date === todayInput() ? new Date().toISOString() : new Date(`${form.date}T12:00:00`).toISOString(),
        photo: form.photo,
        handedInBy: form.handedInBy.trim(),
        heldAt: HOME_DESK,
      },
      'Logged handed-in item',
    );
    setLogged({ id: item.id, title: item.title, matches: matches.length });
    setForm(empty());
  };

  return (
    <div className="w-full max-w-[640px]">
      {logged && (
        <div role="status" className="mb-4 flex gap-3 rounded-card border border-notice-line bg-notice-bg p-4 text-[14px] text-ink">
          <Check size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            <span className="font-mono font-medium">{logged.id}</span> {logged.title} logged at {HOME_DESK}.{' '}
            {logged.matches > 0
              ? `${logged.matches} possible match${logged.matches === 1 ? '' : 'es'} found. The owner has been notified.`
              : 'No matching lost report yet.'}
          </p>
        </div>
      )}

      <Card className="p-5 sm:p-8">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="d-categoryId" label="Category" error={errors.categoryId}>
              <Select id="d-categoryId" value={form.categoryId} invalid={!!errors.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="d-title" label="Item name" error={errors.title}>
              <Input id="d-title" value={form.title} maxLength={60} invalid={!!errors.title} onChange={(e) => update('title', e.target.value)} />
            </Field>
          </div>

          <Field id="d-description" label="Description" error={errors.description} helper="What anyone can see. Shown on Found Items.">
            <Textarea id="d-description" value={form.description} maxLength={400} invalid={!!errors.description} onChange={(e) => update('description', e.target.value)} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="d-location" label="Where it was found" error={errors.location}>
              <Select id="d-location" value={form.location} invalid={!!errors.location} onChange={(e) => update('location', e.target.value)}>
                <option value="">Choose a location</option>
                {CAMPUS_LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
                <option value={OTHER}>Other</option>
              </Select>
            </Field>
            <Field id="d-date" label="Date found" error={errors.date}>
              <Input id="d-date" type="date" value={form.date} max={todayInput()} invalid={!!errors.date} onChange={(e) => update('date', e.target.value)} />
            </Field>
          </div>

          {form.location === OTHER && (
            <Field id="d-otherLocation" label="Other location" error={errors.otherLocation}>
              <Input id="d-otherLocation" value={form.otherLocation} maxLength={60} invalid={!!errors.otherLocation} onChange={(e) => update('otherLocation', e.target.value)} />
            </Field>
          )}

          <Field id="d-photo" label="Photo" error={errors.photo}>
            <PhotoInput id="d-photo" value={form.photo} invalid={!!errors.photo} onChange={(v) => update('photo', v)} />
          </Field>

          <Field
            id="d-hiddenDetails"
            label="Identifying details"
            error={errors.hiddenDetails}
            helper="Only desk staff will see this. It is used to check ownership."
          >
            <Textarea id="d-hiddenDetails" value={form.hiddenDetails} maxLength={300} invalid={!!errors.hiddenDetails} onChange={(e) => update('hiddenDetails', e.target.value)} />
          </Field>

          <Field id="d-handedInBy" label="Handed in by" error={errors.handedInBy} helper="Name or roll number of the person who brought it.">
            <Input id="d-handedInBy" value={form.handedInBy} maxLength={60} invalid={!!errors.handedInBy} placeholder="e.g. 24/EE/031" onChange={(e) => update('handedInBy', e.target.value)} />
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-divider pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-ink-2">
              Held at <span className="text-ink">{HOME_DESK}</span>
            </p>
            <Button type="submit" size="lg">
              Log item
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

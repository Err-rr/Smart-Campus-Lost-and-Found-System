'use client';

import { HandHelping } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input } from '@/components/ui/Form';
import { Dialog } from '@/components/ui/Overlay';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { formatDate } from '@/lib/format';
import { useStore } from '@/lib/store';

export function Handover() {
  const claims = useStore((s) => s.claims);
  const users = useStore((s) => s.users);
  const foundItems = useStore((s) => s.foundItems);
  const confirmHandover = useStore((s) => s.confirmHandover);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [idChecked, setIdChecked] = useState(false);
  const [roll, setRoll] = useState('');
  const [errors, setErrors] = useState<{ idChecked?: string; roll?: string }>({});

  const approved = useMemo(() => claims.filter((c) => c.status === 'approved'), [claims]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const itemById = useMemo(() => new Map(foundItems.map((f) => [f.id, f])), [foundItems]);

  const active = approved.find((c) => c.id === activeId) ?? null;
  const activeUser = active ? userById.get(active.userId) : undefined;
  const activeItem = active ? itemById.get(active.foundItemId) : undefined;

  const close = () => {
    setActiveId(null);
    setIdChecked(false);
    setRoll('');
    setErrors({});
  };

  const onConfirm = () => {
    const e: typeof errors = {};
    if (!idChecked) e.idChecked = 'Check the college ID before handing over.';
    const value = roll.trim().toUpperCase();
    if (!value) e.roll = activeUser?.rollNo ? 'Enter the roll number on the ID.' : 'Enter the employee or roll number on the ID.';
    else if (activeUser?.rollNo && value !== activeUser.rollNo.toUpperCase())
      e.roll = `This does not match the claimant (${activeUser.rollNo}).`;
    setErrors(e);
    if (Object.keys(e).length) return;
    confirmHandover(active!.id, value);
    close();
  };

  if (approved.length === 0) {
    return (
      <EmptyState
        icon={HandHelping}
        title="No items waiting for collection"
        text="Approved claims appear here until the owner collects the item."
      />
    );
  }

  return (
    <>
      <Table label="Approved claims waiting for handover" minWidth={720}>
        <thead>
          <tr>
            <Th>Claim ID</Th>
            <Th>Item</Th>
            <Th>Claimant</Th>
            <Th>Roll no</Th>
            <Th>Submitted</Th>
            <Th className="text-right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {approved.map((c) => {
            const item = itemById.get(c.foundItemId);
            const u = userById.get(c.userId);
            return (
              <Tr key={c.id}>
                <Td className="font-mono text-[13px] font-medium">{c.id}</Td>
                <Td>
                  {item?.title} <span className="ml-1 font-mono text-[12px] text-ink-3">{item?.id}</span>
                </Td>
                <Td>{u?.name}</Td>
                <Td className="font-mono text-[13px]">{u?.rollNo ?? 'Staff'}</Td>
                <Td className="whitespace-nowrap text-ink-2">{formatDate(c.submittedOn)}</Td>
                <Td className="text-right">
                  <Button onClick={() => setActiveId(c.id)}>Confirm handover</Button>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>

      <Dialog
        open={!!active}
        onClose={close}
        title="Confirm handover"
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={close}>
              Cancel
            </Button>
            <Button size="lg" onClick={onConfirm}>
              Confirm handover
            </Button>
          </>
        }
      >
        {active && (
          <div className="flex flex-col gap-5">
            <p className="text-[15px] text-ink-2">
              Handing over <span className="text-ink">{activeItem?.title}</span>{' '}
              <span className="font-mono text-[12px]">{activeItem?.id}</span> to{' '}
              <span className="text-ink">{activeUser?.name}</span> for claim{' '}
              <span className="font-mono text-[12px]">{active.id}</span>.
            </p>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
                <input
                  type="checkbox"
                  checked={idChecked}
                  onChange={(e) => {
                    setIdChecked(e.target.checked);
                    setErrors((x) => ({ ...x, idChecked: undefined }));
                  }}
                  aria-invalid={!!errors.idChecked || undefined}
                  className="mt-1 h-4 w-4 accent-[#111111]"
                />
                College ID checked
              </label>
              {errors.idChecked && <p className="mt-1.5 text-[13px] text-[#A94438]">{errors.idChecked}</p>}
            </div>

            <Field id="collector-roll" label="Collector's roll number" error={errors.roll}>
              <Input
                id="collector-roll"
                value={roll}
                invalid={!!errors.roll}
                placeholder={activeUser?.rollNo ? 'e.g. 24/CO/118' : 'Employee ID'}
                className="font-mono"
                onChange={(e) => {
                  setRoll(e.target.value);
                  setErrors((x) => ({ ...x, roll: undefined }));
                }}
              />
            </Field>
          </div>
        )}
      </Dialog>
    </>
  );
}

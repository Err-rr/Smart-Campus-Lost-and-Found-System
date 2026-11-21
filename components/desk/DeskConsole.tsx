'use client';

import { useMemo, useState } from 'react';
import { DarkHeader } from '@/components/ui/DarkHeader';
import { Tabs } from '@/components/ui/Tabs';
import { useStore } from '@/lib/store';
import { CustodyRegister } from './CustodyRegister';
import { DeskLogForm } from './DeskLogForm';
import { Handover } from './Handover';
import { PendingClaims } from './PendingClaims';

type Tab = 'log' | 'claims' | 'handover' | 'register';

const isToday = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

export function DeskConsole() {
  const foundItems = useStore((s) => s.foundItems);
  const claims = useStore((s) => s.claims);
  const [tab, setTab] = useState<Tab>('claims');

  const counts = useMemo(
    () => ({
      custody: foundItems.filter(
        (f) => f.status !== 'returned' && f.heldAt !== 'With the finder',
      ).length,
      waiting: claims.filter((c) => c.status === 'submitted').length,
      approved: claims.filter((c) => c.status === 'approved').length,
      handoversToday: claims.filter((c) => c.status === 'handed_over' && isToday(c.handoverDate)).length,
    }),
    [foundItems, claims],
  );

  return (
    <div className="flex flex-col gap-8">
      <DarkHeader
        eyebrow="Desk console"
        title="Central Lost and Found Desk"
        description="Log items that are handed in, check claims against the details on record, and record handovers."
        stats={[
          { label: 'Items in custody', value: counts.custody },
          { label: 'Claims waiting', value: counts.waiting },
          { label: 'Handovers today', value: counts.handoversToday },
        ]}
      />

      <div className="flex flex-col gap-6">
        <Tabs
          label="Desk sections"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'log', label: 'Log handed-in item' },
            { value: 'claims', label: 'Pending claims', count: counts.waiting },
            { value: 'handover', label: 'Handover', count: counts.approved },
            { value: 'register', label: 'Custody register' },
          ]}
        />
        {tab === 'log' && <DeskLogForm />}
        {tab === 'claims' && <PendingClaims />}
        {tab === 'handover' && <Handover />}
        {tab === 'register' && <CustodyRegister />}
      </div>
    </div>
  );
}

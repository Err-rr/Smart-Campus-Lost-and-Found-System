'use client';

import { AlertTriangle, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusPill, foundItemPill } from '@/components/ui/StatusPill';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { daysSince, formatDate } from '@/lib/format';
import { useStore } from '@/lib/store';

export function CustodyRegister() {
  const foundItems = useStore((s) => s.foundItems);
  const settings = useStore((s) => s.settings);
  const markUnclaimed = useStore((s) => s.markUnclaimed);

  const rows = useMemo(
    () =>
      [...foundItems]
        .sort((a, b) => a.dateFound.localeCompare(b.dateFound))
        .map((item) => {
          const days = daysSince(item.dateFound);
          return { item, days, overdue: item.status === 'in_custody' && days > settings.unclaimedDays };
        }),
    [foundItems, settings.unclaimedDays],
  );

  const overdueCount = rows.filter((r) => r.overdue).length;

  if (rows.length === 0) {
    return <EmptyState icon={PackageOpen} title="No items in the register" text="Logged items will appear here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {overdueCount > 0 && (
        <p className="flex items-center gap-2 text-[14px] text-ink-2">
          <AlertTriangle size={16} strokeWidth={1.5} className="text-[#7A4A1E]" aria-hidden />
          {overdueCount} {overdueCount === 1 ? 'item has' : 'items have'} been in custody for more than {settings.unclaimedDays} days.
        </p>
      )}
      <Table label="Custody register" minWidth={860}>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Item</Th>
            <Th>Found</Th>
            <Th>Held at</Th>
            <Th className="text-right">Days in custody</Th>
            <Th>Status</Th>
            <Th className="text-right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ item, days, overdue }) => (
            <Tr key={item.id} className={overdue ? 'bg-[#FBF7F2]' : ''}>
              <Td>
                <Link href={`/found/${item.id}`} className="font-mono text-[13px] font-medium underline-offset-4 hover:underline">
                  {item.id}
                </Link>
              </Td>
              <Td>{item.title}</Td>
              <Td className="whitespace-nowrap text-ink-2">
                {formatDate(item.dateFound)}
                <span className="block text-[12px] text-ink-3">{item.locationFound}</span>
              </Td>
              <Td className="text-ink-2">{item.heldAt}</Td>
              <Td className="text-right font-mono text-[13px] tabular-nums">
                {item.status === 'returned' ? <span className="text-ink-3">Returned</span> : days}
                {overdue && (
                  <span className="mt-0.5 block text-[11px] font-medium text-[#7A4A1E]">Over {settings.unclaimedDays} days</span>
                )}
              </Td>
              <Td>
                <StatusPill kind={foundItemPill(item.status)} />
              </Td>
              <Td className="text-right">
                {overdue && (
                  <Button variant="secondary" onClick={() => markUnclaimed(item.id)}>
                    Mark as unclaimed
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

'use client';

import { ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Form';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { formatDate } from '@/lib/format';
import { useStore } from '@/lib/store';

const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

export function AuditTab() {
  const auditLogs = useStore((s) => s.auditLogs);
  const users = useStore((s) => s.users);
  const [action, setAction] = useState('');

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const actions = useMemo(() => Array.from(new Set(auditLogs.map((a) => a.action))).sort(), [auditLogs]);
  const rows = useMemo(
    () =>
      auditLogs
        .filter((a) => !action || a.action === action)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [auditLogs, action],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select aria-label="Filter by action" value={action} onChange={(e) => setAction(e.target.value)} className="sm:w-64">
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <p className="text-[14px] text-ink-2" aria-live="polite">
          {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No entries for this action"
          text="Choose another action or show all entries."
          actionLabel="Show all"
          onAction={() => setAction('')}
        />
      ) : (
        <Table label="Audit log" minWidth={820}>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Record</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <Tr key={a.id}>
                <Td className="whitespace-nowrap text-ink-2">
                  {formatDate(a.timestamp)}
                  <span className="block font-mono text-[12px] text-ink-3">{timeFormat.format(new Date(a.timestamp))}</span>
                </Td>
                <Td>{userById.get(a.actorId)?.name ?? a.actorId}</Td>
                <Td className="font-medium">{a.action}</Td>
                <Td className="whitespace-nowrap">
                  <span className="text-ink-2">{a.entity}</span>{' '}
                  <span className="font-mono text-[12px] text-ink-3">{a.entityId}</span>
                </Td>
                <Td className="text-ink-2">{a.details ?? ''}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

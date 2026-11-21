'use client';

import { UserX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Form';
import { SearchField } from '@/components/ui/SearchField';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { ROLE_LABEL } from '@/lib/domain';
import { useCurrentUser, useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

const ROLES: Role[] = ['student', 'staff', 'desk', 'admin'];

export function UsersTab() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const changeUserRole = useStore((s) => s.changeUserRole);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) => !q || [u.name, u.email, u.rollNo ?? '', ROLE_LABEL[u.role]].join(' ').toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div className="flex flex-col gap-4">
      <SearchField
        id="user-search"
        label="Search users"
        value={query}
        onChange={setQuery}
        placeholder="Search by name, email, roll number or role"
        className="sm:max-w-md"
      />
      {results.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No users match your search"
          text="Check the spelling or search by roll number."
          actionLabel="Clear search"
          onAction={() => setQuery('')}
        />
      ) : (
        <Table label="Users" minWidth={820}>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Roll no</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th className="w-[200px]">Role</Th>
            </tr>
          </thead>
          <tbody>
            {results.map((u) => {
              const isMe = u.id === me?.id;
              return (
                <Tr key={u.id}>
                  <Td className="font-medium">
                    {u.name}
                    {isMe && <span className="ml-2 rounded-full bg-tile px-2 py-0.5 text-[12px] font-normal text-ink-2">You</span>}
                  </Td>
                  <Td className="font-mono text-[13px] text-ink-2">{u.rollNo ?? 'Staff'}</Td>
                  <Td className="text-ink-2">{u.email}</Td>
                  <Td className="whitespace-nowrap font-mono text-[13px] text-ink-2">{u.phone}</Td>
                  <Td>
                    <Select
                      aria-label={`Role for ${u.name}`}
                      value={u.role}
                      disabled={isMe}
                      title={isMe ? 'You cannot change your own role' : undefined}
                      onChange={(e) => changeUserRole(u.id, e.target.value as Role)}
                      className="[&_select]:h-9 [&_select]:text-[14px] [&_select:disabled]:bg-tile [&_select:disabled]:text-ink-2"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </Select>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <p className="text-[13px] text-ink-2">Role changes take effect at once and are recorded in the audit log. You cannot change your own role.</p>
    </div>
  );
}

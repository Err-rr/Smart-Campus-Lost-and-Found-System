'use client';

import { useMemo, useState } from 'react';
import { DarkHeader } from '@/components/ui/DarkHeader';
import { Tabs } from '@/components/ui/Tabs';
import { useStore } from '@/lib/store';
import { AuditTab } from './AuditTab';
import { CategoriesTab } from './CategoriesTab';
import { Overview } from './Overview';
import { SettingsTab } from './SettingsTab';
import { UsersTab } from './UsersTab';

type Tab = 'overview' | 'users' | 'categories' | 'audit' | 'settings';

export function AdminDashboard() {
  const users = useStore((s) => s.users);
  const claims = useStore((s) => s.claims);
  const auditLogs = useStore((s) => s.auditLogs);
  const [tab, setTab] = useState<Tab>('overview');

  const openClaims = useMemo(
    () => claims.filter((c) => c.status === 'submitted' || c.status === 'approved').length,
    [claims],
  );

  return (
    <div className="flex flex-col gap-8">
      <DarkHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Monitor reports and recoveries, manage users and categories, and adjust matching settings."
        stats={[
          { label: 'Users', value: users.length },
          { label: 'Open claims', value: openClaims },
          { label: 'Audit entries', value: auditLogs.length },
        ]}
      />

      <div className="flex flex-col gap-6">
        <Tabs
          label="Admin sections"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'overview', label: 'Overview' },
            { value: 'users', label: 'Users' },
            { value: 'categories', label: 'Categories' },
            { value: 'audit', label: 'Audit log' },
            { value: 'settings', label: 'Settings' },
          ]}
        />
        {tab === 'overview' && <Overview />}
        {tab === 'users' && <UsersTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'audit' && <AuditTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { RoleGate } from '@/components/layout/RoleGate';

export const metadata: Metadata = { title: 'Admin' };

export default function Page() {
  return (
    <RoleGate roles={['admin']}>
      <PlaceholderPage title="Admin" description="Settings, users and the audit log." />
    </RoleGate>
  );
}

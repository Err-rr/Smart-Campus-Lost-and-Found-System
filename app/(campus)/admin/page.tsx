import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { RoleGate } from '@/components/layout/RoleGate';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <RoleGate roles={['admin']}>
      <AdminDashboard />
    </RoleGate>
  );
}

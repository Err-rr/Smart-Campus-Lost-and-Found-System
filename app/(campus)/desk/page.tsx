import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { RoleGate } from '@/components/layout/RoleGate';

export const metadata: Metadata = { title: 'Desk' };

export default function Page() {
  return (
    <RoleGate roles={['desk', 'admin']}>
      <PlaceholderPage title="Desk" description="Log handed-in items, verify claims and record handovers." />
    </RoleGate>
  );
}

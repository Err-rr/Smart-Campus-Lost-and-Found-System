import type { Metadata } from 'next';
import { DeskConsole } from '@/components/desk/DeskConsole';
import { RoleGate } from '@/components/layout/RoleGate';

export const metadata: Metadata = { title: 'Desk' };

export default function DeskPage() {
  return (
    <RoleGate roles={['desk', 'admin']}>
      <DeskConsole />
    </RoleGate>
  );
}

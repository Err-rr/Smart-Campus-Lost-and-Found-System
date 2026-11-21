import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';
import { RoleGate } from '@/components/layout/RoleGate';

export const metadata: Metadata = { title: 'Home' };

export default function HomePage() {
  // Desk staff and administrators start on their own consoles.
  return (
    <RoleGate roles={['student', 'staff']} redirect>
      <HomeView />
    </RoleGate>
  );
}

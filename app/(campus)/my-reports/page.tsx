import type { Metadata } from 'next';
import { RoleGate } from '@/components/layout/RoleGate';
import { MyReportsView } from '@/components/my-reports/MyReportsView';

export const metadata: Metadata = { title: 'My Reports' };

export default function MyReportsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab === 'found' || searchParams.tab === 'claims' ? searchParams.tab : 'lost';
  return (
    <RoleGate roles={['student', 'staff']}>
      <MyReportsView key={tab} initialTab={tab} />
    </RoleGate>
  );
}

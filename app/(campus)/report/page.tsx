import type { Metadata } from 'next';
import { RoleGate } from '@/components/layout/RoleGate';
import { ReportView } from '@/components/report/ReportView';

export const metadata: Metadata = { title: 'Report' };

export default function ReportPage({ searchParams }: { searchParams: { type?: string } }) {
  return (
    <RoleGate roles={['student', 'staff']}>
      <ReportView initialType={searchParams.type === 'found' ? 'found' : 'lost'} />
    </RoleGate>
  );
}

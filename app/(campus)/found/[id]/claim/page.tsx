import type { Metadata } from 'next';
import { ClaimView } from '@/components/claim/ClaimView';
import { RoleGate } from '@/components/layout/RoleGate';

export const metadata: Metadata = { title: 'Start a Claim' };

export default function ClaimPage({ params }: { params: { id: string } }) {
  return (
    <RoleGate roles={['student', 'staff']}>
      <ClaimView id={decodeURIComponent(params.id)} />
    </RoleGate>
  );
}

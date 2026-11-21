import type { Metadata } from 'next';
import { ClaimView } from '@/components/claim/ClaimView';

export const metadata: Metadata = { title: 'Start a Claim' };

export default function ClaimPage({ params }: { params: { id: string } }) {
  return <ClaimView id={decodeURIComponent(params.id)} />;
}

import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = { title: 'Lost Items' };

export default function Page() {
  return <PlaceholderPage title="Lost Items" description="Items reported lost by students and staff." />;
}

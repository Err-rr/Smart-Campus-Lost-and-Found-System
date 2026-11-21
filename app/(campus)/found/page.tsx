import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = { title: 'Found Items' };

export default function Page() {
  return <PlaceholderPage title="Found Items" description="Items handed in at campus desks or reported found." />;
}

import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = { title: 'My Reports' };

export default function Page() {
  return <PlaceholderPage title="My Reports" description="Your lost reports, possible matches and claims." />;
}

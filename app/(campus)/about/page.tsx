import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export const metadata: Metadata = { title: 'About' };

export default function Page() {
  return <PlaceholderPage title="About" description="How the campus lost and found process works." />;
}

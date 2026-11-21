import type { Metadata } from 'next';
import { LostItemsView } from '@/components/lost/LostItemsView';

export const metadata: Metadata = { title: 'Lost Items' };

export default function LostItemsPage() {
  return <LostItemsView />;
}

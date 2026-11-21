import type { Metadata } from 'next';
import { FoundItemsView } from '@/components/found/FoundItemsView';

export const metadata: Metadata = { title: 'Found Items' };

export default function FoundItemsPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  return <FoundItemsView initialQuery={searchParams.q ?? ''} initialCategory={searchParams.category ?? ''} />;
}

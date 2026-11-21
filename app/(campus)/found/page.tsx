import type { Metadata } from 'next';
import { FoundItemsView } from '@/components/found/FoundItemsView';

export const metadata: Metadata = { title: 'Found Items' };

export default function FoundItemsPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const q = searchParams.q ?? '';
  const category = searchParams.category ?? '';
  // Keyed so a new search from Home resets the filters.
  return <FoundItemsView key={`${q}|${category}`} initialQuery={q} initialCategory={category} />;
}

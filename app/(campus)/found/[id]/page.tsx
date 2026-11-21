import type { Metadata } from 'next';
import { FoundItemDetail } from '@/components/found/FoundItemDetail';

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return { title: `Found Item ${decodeURIComponent(params.id)}` };
}

export default function FoundItemPage({ params }: { params: { id: string } }) {
  return <FoundItemDetail id={decodeURIComponent(params.id)} />;
}

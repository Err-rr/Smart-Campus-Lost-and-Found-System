import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Campus lost and found" title={title} description={description} />
      <Card className="p-8">
        <p className="text-body text-ink-2">This page is not available in the current build.</p>
      </Card>
    </div>
  );
}

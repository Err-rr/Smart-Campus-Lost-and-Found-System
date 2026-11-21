import { Eyebrow } from './Eyebrow';

interface DarkHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  stats: { label: string; value: number | string }[];
}

/** Dark header panel used by the Desk Console and Admin Dashboard. */
export function DarkHeader({ eyebrow, title, description, stats }: DarkHeaderProps) {
  return (
    <section className="grid grid-cols-1 gap-6 rounded-panel bg-panel p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
      <div>
        <Eyebrow tone="dark">{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.02em] sm:text-title">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-panel-muted">{description}</p>}
      </div>
      <dl className="grid grid-cols-3 divide-x divide-panel-line rounded-card bg-panel-inner py-5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse justify-end px-4 sm:px-6">
            <dt className="mt-2 text-[13px] leading-snug text-panel-muted">{s.label}</dt>
            <dd className="font-mono text-[28px] font-medium leading-none tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

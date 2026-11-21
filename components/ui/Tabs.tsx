'use client';

interface TabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Underline tabs that match the navbar's active style. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b border-divider">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative flex h-11 shrink-0 items-center gap-2 whitespace-nowrap text-[15px] transition-colors ${
              active ? 'font-semibold text-ink' : 'text-ink-icon hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-tile px-2 py-0.5 font-mono text-[11px] font-normal text-ink-2">{tab.count}</span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

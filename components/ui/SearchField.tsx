'use client';

import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchField({ id, label, value, onChange, placeholder, className = '' }: SearchFieldProps) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={18}
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[10px] border border-line bg-white pl-10 pr-10 text-[15px] text-ink placeholder:text-ink-3 transition-colors hover:border-[#D6D3CB] focus:border-ink-icon focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-ink-3 transition-colors hover:bg-tile hover:text-ink"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

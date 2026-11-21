import { ChevronDown } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const control =
  'w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-3 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40';

const border = (invalid?: boolean) =>
  invalid ? 'border-[#A94438] focus:border-[#A94438]' : 'border-line hover:border-[#D6D3CB] focus:border-ink-icon';

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  helper?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, optional, helper, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-medium text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-3">(optional)</span>}
      </label>
      {children}
      {helper && !error && (
        <p id={`${id}-help`} className="text-[13px] text-ink-2">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] text-[#A94438]">
          {error}
        </p>
      )}
    </div>
  );
}

type WithInvalid = { invalid?: boolean };

export function Input({ invalid, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & WithInvalid) {
  return <input aria-invalid={invalid || undefined} className={`${control} ${border(invalid)} h-11 ${className}`} {...props} />;
}

export function Select({ invalid, className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & WithInvalid) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-invalid={invalid || undefined}
        className={`${control} ${border(invalid)} h-11 appearance-none pr-10`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2"
        aria-hidden
      />
    </div>
  );
}

export function Textarea({ invalid, className = '', rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & WithInvalid) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      rows={rows}
      className={`${control} ${border(invalid)} block resize-y py-2.5 leading-relaxed ${className}`}
      {...props}
    />
  );
}

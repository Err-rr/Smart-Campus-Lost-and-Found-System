'use client';

import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { compressImage, dataUrlBytes } from '@/lib/image';

interface PhotoInputProps {
  id: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  invalid?: boolean;
}

export function PhotoInput({ id, value, onChange, invalid }: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'This photo could not be used.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-[12px] border border-line bg-white px-3 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Selected photo preview" className="h-10 w-10 rounded-tile object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-ink">Photo added</p>
            <p className="font-mono text-[12px] text-ink-3">{Math.round(dataUrlBytes(value) / 1024)} KB after compression</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove photo"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-icon transition-colors hover:bg-tile hover:text-ink"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`flex w-full items-center gap-3 rounded-[12px] border border-dashed bg-white px-3 py-3 text-left transition-colors hover:bg-[#FAFAF8] ${
            invalid ? 'border-[#A94438]' : 'border-[#D6D3CB]'
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tile bg-tile">
            <ImagePlus size={20} strokeWidth={1.5} className={busy ? 'text-ink-3' : 'text-ink-icon'} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-medium text-ink">{busy ? 'Preparing photo' : 'Add a photo'}</span>
            <span className="block text-[13px] text-ink-2">JPG or PNG, resized to stay under 1 MB</span>
          </span>
        </button>
      )}
      {error && <p className="mt-1.5 text-[13px] text-[#A94438]">{error}</p>}
    </div>
  );
}

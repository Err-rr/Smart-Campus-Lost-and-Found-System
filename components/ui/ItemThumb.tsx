import { categoryIcon } from './CategoryIcon';

interface ItemThumbProps {
  categoryId: string;
  photo?: string;
  size?: number;
  /** Blur found-item photos for campus users so ownership checks stay meaningful. */
  blurred?: boolean;
  className?: string;
}

/** Small item photo. Falls back to a neutral tile with the category icon. */
export function ItemThumb({ categoryId, photo, size = 48, blurred = false, className = '' }: ItemThumbProps) {
  const Icon = categoryIcon(categoryId);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-tile text-ink-icon ${className}`}
      style={{ width: size, height: size }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover ${blurred ? 'scale-125 [filter:blur(4px)]' : ''}`}
        />
      ) : (
        <Icon size={Math.round(size * 0.42)} strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

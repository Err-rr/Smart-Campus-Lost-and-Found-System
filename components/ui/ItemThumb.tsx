import { categoryIcon } from './CategoryIcon';

interface ItemThumbProps {
  categoryId: string;
  photo?: string;
  size?: number;
  className?: string;
}

/** Neutral placeholder tile with the category icon. Shows the photo if one exists. */
export function ItemThumb({ categoryId, photo, size = 48, className = '' }: ItemThumbProps) {
  const Icon = categoryIcon(categoryId);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-tile text-ink-icon ${className}`}
      style={{ width: size, height: size }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon size={Math.round(size * 0.42)} strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

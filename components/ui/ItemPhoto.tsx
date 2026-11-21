import { categoryIcon } from './CategoryIcon';

interface ItemPhotoProps {
  categoryId: string;
  photo?: string;
  blurred?: boolean;
  className?: string;
}

/**
 * Large photo area for cards and detail pages. Campus users see uploaded
 * photos blurred so ownership checks stay meaningful.
 */
export function ItemPhoto({ categoryId, photo, blurred = false, className = '' }: ItemPhotoProps) {
  const Icon = categoryIcon(categoryId);
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-tile text-ink-icon ${className}`}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover ${blurred ? 'scale-110 [filter:blur(10px)]' : ''}`}
        />
      ) : (
        <Icon size={40} strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

export const BLUR_CAPTION = 'Photo blurred to protect ownership checks';

import { categoryIcon } from './CategoryIcon';

interface ItemPhotoProps {
  categoryId: string;
  photo?: string;
  /** "cover" fills the frame (cards). "contain" shows the whole photo (detail page). */
  fit?: 'cover' | 'contain';
  className?: string;
}

/** Large photo area for cards and detail pages. Falls back to the category icon. */
export function ItemPhoto({ categoryId, photo, fit = 'cover', className = '' }: ItemPhotoProps) {
  const Icon = categoryIcon(categoryId);
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden text-ink-icon ${
        photo && fit === 'contain' ? 'bg-white' : 'bg-tile'
      } ${className}`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          loading="lazy"
          className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      ) : (
        <Icon size={40} strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * DTU logo from /public/dtu-logo.png. If the file is missing, a plain neutral
 * circle keeps the layout intact.
 */
export function DtuLogo({ size = 40, priority = false }: { size?: number; priority?: boolean }) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className="block shrink-0 overflow-hidden rounded-full bg-tile"
      style={{ width: size, height: size }}
    >
      {!failed && (
        <Image
          src="/dtu-logo.png"
          alt="Delhi Technological University logo"
          width={size}
          height={size}
          priority={priority}
          className="h-full w-full rounded-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

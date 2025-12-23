'use client';

/**
 * Mini Holoflower - Displays the Spiralogic logo
 * Uses the actual branding image with elemental colors
 */

import Image from 'next/image';

interface MiniHoloflowerProps {
  size?: number;
  isDayMode?: boolean;
}

export function MiniHoloflower({ size = 520, isDayMode = false }: MiniHoloflowerProps) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      <Image
        src="/holoflower-amber.png"
        alt="Spiralogic Holoflower"
        width={size}
        height={size}
        priority
        className="w-full h-full object-contain"
      />
    </div>
  );
}

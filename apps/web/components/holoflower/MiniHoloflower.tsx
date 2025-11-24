'use client';

// Temporary stub component for build
interface MiniHoloflowerProps {
  size?: number;
  isDayMode?: boolean;
}

export function MiniHoloflower({ size = 96, isDayMode = false }: MiniHoloflowerProps) {
  return (
    <div className="p-4">
      <p>Mini Holoflower - Coming Soon</p>
    </div>
  );
}
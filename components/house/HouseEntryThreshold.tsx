'use client';

import { useSearchParams } from 'next/navigation';
import { HouseRoomThreshold } from './HouseRoomThreshold';

/**
 * Adds House continuity only when the current route was explicitly entered
 * from the House. It never changes the destination's own identity or access.
 */
export function HouseEntryThreshold({ room }: { room: string }) {
  const searchParams = useSearchParams();
  if (searchParams?.get('from') !== 'house') return null;
  return <HouseRoomThreshold room={room} />;
}

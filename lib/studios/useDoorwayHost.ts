'use client';

import { useEffect, useState } from 'react';
import { doorwayForHost, type Doorway } from './doorways';

/**
 * The Studio doorway this page is being viewed through (writer./sound./guide./astrology.soullab.life), or null.
 *
 * Read from window.location after mount, so the first render (and the server render) is always `null` and hydration
 * never mismatches. A doorway host only resolves once its DNS and Caddy block exist, so on every current address this
 * stays null and nothing changes.
 */
export function useDoorwayHost(): Doorway | null {
  const [doorway, setDoorway] = useState<Doorway | null>(null);
  useEffect(() => {
    setDoorway(doorwayForHost(window.location.host, process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'soullab.life'));
  }, []);
  return doorway;
}

'use client';

import { useEffect, useState } from 'react';

/**
 * The complete R2D3 room composition has founder witness at desktop scale only.
 * Stay closed until the client proves a >= 1100px viewport. Narrow layouts keep
 * the canonical Living Field until their own complete-room witness is admitted.
 */
export function useLivingFieldR2Viewport(): boolean {
  const [admitted, setAdmitted] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)');
    const update = () => setAdmitted(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return admitted;
}

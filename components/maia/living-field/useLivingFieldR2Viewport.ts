'use client';

import { useEffect, useState } from 'react';

export type LivingFieldR2ViewportState = {
  admitted: boolean;
  resolved: boolean;
};

/**
 * The complete R2D3 room composition has founder witness at desktop scale only.
 * Resolve the viewport before choosing a presentation so narrow members never
 * mount R2 and admitted desktop members never mount/unmount the fallback first.
 */
export function useLivingFieldR2Viewport(): LivingFieldR2ViewportState {
  const [state, setState] = useState<LivingFieldR2ViewportState>({ admitted: false, resolved: false });

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)');
    const update = () => setState({ admitted: media.matches, resolved: true });
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return state;
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Finds the live Writer's Studio product-bar accessory slot.
 *
 * P4R1 rooms swap their Shell as the writer moves between Write, Develop, and
 * Review. A MutationObserver keeps the portal attached to the CURRENT shell
 * rather than leaving a control fixed over whichever surface happened to mount
 * first. Full Canvas intentionally has no product bar, so the host becomes null
 * and Studio-level pills recede with it.
 */
export function useStudioTopbarAccessoriesHost(): HTMLElement | null {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = document.querySelector<HTMLElement>('[data-studio-topbar-accessories]');
      setHost((current) => current === next ? current : next);
    };

    sync();
    const root = document.querySelector('.p4r1-root') ?? document.body;
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return host;
}

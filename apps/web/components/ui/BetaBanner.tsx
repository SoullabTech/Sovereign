'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Crown } from 'lucide-react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if banner has been closed before
    const bannerClosed = localStorage.getItem('betaBannerClosed');

    // Only show on home/main screens and if not previously closed
    const isMainScreen = pathname === '/' || pathname === '/maya';

    if (!bannerClosed && isMainScreen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
    // Persist that user has closed the banner
    localStorage.setItem('betaBannerClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900/60 to-yellow-900/60 backdrop-blur-xl border-b border-[#D4B896]/40 shadow-lg">
      <div className="container mx-auto px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
            <p className="text-sm text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Soul Beta Experience • Changing Our World To Soul
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            aria-label="Close beta banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
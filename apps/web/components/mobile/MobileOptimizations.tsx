'use client';

import React, { useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MobileOptimizationsProps {
  children: ReactNode;
  enableViewportFix?: boolean;
  enableTouchOptimizations?: boolean;
  enablePerformanceOptimizations?: boolean;
}

export default function MobileOptimizations({
  children,
  enableViewportFix = true,
  enableTouchOptimizations = true,
  enablePerformanceOptimizations = true
}: MobileOptimizationsProps) {
  
  useEffect(() => {
    if (!enableTouchOptimizations) return;

    // Prevent iOS rubber band scrolling on body
    const preventOverscroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-scroll="true"]')) return;
      
      // Only prevent if touching the body or non-scrollable elements
      if (target === document.body || !target.closest('[data-scroll="true"]')) {
        e.preventDefault();
      }
    };

    // Prevent double-tap zoom
    const preventDoubleTapZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      
      const now = Date.now();
      const lastTap = parseInt(document.body.getAttribute('data-last-tap') || '0');
      
      if (now - lastTap < 300) {
        e.preventDefault();
      }
      
      document.body.setAttribute('data-last-tap', now.toString());
    };

    // Add touch event listeners
    document.addEventListener('touchmove', preventOverscroll, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    // Optimize scroll performance
    if (enablePerformanceOptimizations) {
      document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
      document.body.style.setProperty('overscroll-behavior', 'none');
      document.body.style.setProperty('touch-action', 'pan-x pan-y');
    }

    return () => {
      document.removeEventListener('touchmove', preventOverscroll);
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, [enableTouchOptimizations, enablePerformanceOptimizations]);

  useEffect(() => {
    if (!enableViewportFix) return;

    // Fix iOS viewport height issues
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial viewport height
    setViewportHeight();

    // Update on resize (handles iOS keyboard appearance/disappearance)
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Prevent zoom on input focus (iOS specific)
    const preventZoomOnInputFocus = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = Math.max(16, parseInt(window.getComputedStyle(input).fontSize)) + 'px';
        }
      });
    };

    preventZoomOnInputFocus();

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, [enableViewportFix]);

  return (
    <motion.div 
      className="w-full"
      style={{ 
        height: enableViewportFix ? 'calc(var(--vh, 1vh) * 100)' : '100vh',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      
      {/* CSS for global mobile optimizations */}
      <style jsx global>{`
        /* Thumb zone indicator (development only) */
        ${process.env.NODE_ENV === 'development' ? `
          .thumb-zone-debug {
            position: relative;
          }
          .thumb-zone-debug::after {
            content: '';
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 25vh;
            background: rgba(255, 165, 0, 0.1);
            border-top: 1px dashed rgba(255, 165, 0, 0.5);
            pointer-events: none;
            z-index: 9999;
          }
        ` : ''}
        
        /* Mobile-optimized scrollbars */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Prevent text selection on touch interfaces */
        .touch-none {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Enhanced touch targets */
        .touch-target {
          min-width: 44px;
          min-height: 44px;
          position: relative;
        }
        
        /* Accessible focus indicators for mobile */
        .focus\\:ring-mobile:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.5);
        }
        
        /* Optimize for high-DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .high-dpi-optimize {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
        
        /* Dark mode safe area insets */
        @supports (padding: env(safe-area-inset-top)) {
          .safe-area-top {
            padding-top: env(safe-area-inset-top);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .safe-area-left {
            padding-left: env(safe-area-inset-left);
          }
          
          .safe-area-right {
            padding-right: env(safe-area-inset-right);
          }
        }
        
        /* Enhanced button states for touch */
        .touch-button {
          transform-origin: center;
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        
        .touch-button:active {
          transform: scale(0.95);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* Optimize animation performance on mobile */
        @media (prefers-reduced-motion: no-preference) {
          .will-change-transform {
            will-change: transform;
          }
          
          .gpu-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
        }
        
        /* Respect system preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
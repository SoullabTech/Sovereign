'use client';

import React, { useRef, useEffect, ReactNode } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface MobileGestureHandlerProps {
  children: ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPullToRefresh?: () => void;
  className?: string;
  refreshThreshold?: number;
  swipeThreshold?: number;
  enablePullToRefresh?: boolean;
}

export default function MobileGestureHandler({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onPullToRefresh,
  className = '',
  refreshThreshold = 80,
  swipeThreshold = 50,
  enablePullToRefresh = false
}: MobileGestureHandlerProps) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, refreshThreshold], [1, 0.8]);
  const scale = useTransform(y, [0, refreshThreshold], [1, 0.98]);
  const refreshProgress = useTransform(y, [0, refreshThreshold], [0, 1]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);

  useEffect(() => {
    // Add haptic feedback support for iOS
    const addHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        navigator.vibrate(patterns[type]);
      }
    };

    // Expose haptic feedback globally for components to use
    (window as any).addHapticFeedback = addHapticFeedback;
  }, []);

  const handlePanStart = () => {
    startTimeRef.current = Date.now();
  };

  const handlePan = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Handle pull to refresh
    if (enablePullToRefresh && offset.y > 0 && !isRefreshing.current) {
      y.set(Math.min(offset.y, refreshThreshold * 1.2));
      
      // Haptic feedback at threshold
      if (offset.y >= refreshThreshold && offset.y < refreshThreshold + 5) {
        (window as any).addHapticFeedback?.('medium');
      }
    }
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const duration = Date.now() - startTimeRef.current;
    
    // Quick swipe detection (under 300ms with sufficient velocity)
    const isQuickSwipe = duration < 300 && Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500;
    
    // Directional swipe detection
    if (isQuickSwipe || Math.abs(offset.x) > swipeThreshold || Math.abs(offset.y) > swipeThreshold) {
      const absX = Math.abs(offset.x);
      const absY = Math.abs(offset.y);
      
      // Determine primary direction
      if (absX > absY) {
        // Horizontal swipe
        if (offset.x > 0 && onSwipeRight) {
          (window as any).addHapticFeedback?.('light');
          onSwipeRight();
        } else if (offset.x < 0 && onSwipeLeft) {
          (window as any).addHapticFeedback?.('light');
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (offset.y > 0 && onSwipeDown) {
          (window as any).addHapticFeedback?.('light');
          onSwipeDown();
        } else if (offset.y < 0 && onSwipeUp) {
          (window as any).addHapticFeedback?.('light');
          onSwipeUp();
        }
      }
    }
    
    // Handle pull to refresh trigger
    if (enablePullToRefresh && offset.y >= refreshThreshold && onPullToRefresh && !isRefreshing.current) {
      isRefreshing.current = true;
      (window as any).addHapticFeedback?.('heavy');
      onPullToRefresh();
      
      // Reset after 2 seconds or when refresh completes
      setTimeout(() => {
        isRefreshing.current = false;
        y.set(0);
      }, 2000);
    } else {
      // Spring back to original position
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`${className} relative overflow-hidden`}
      style={{ 
        opacity, 
        scale,
        y: enablePullToRefresh ? y : 0
      }}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      drag={enablePullToRefresh ? "y" : false}
      dragConstraints={{ top: 0, bottom: refreshThreshold * 1.2 }}
      dragElastic={{ top: 0.3, bottom: 0.8 }}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <motion.div 
          className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center"
          style={{ 
            y: useTransform(y, [0, refreshThreshold], [-64, -16]),
            opacity: useTransform(y, [0, refreshThreshold * 0.5, refreshThreshold], [0, 0.5, 1])
          }}
        >
          <motion.div
            className="w-6 h-6 border-2 border-emerald-500 rounded-full"
            style={{
              rotate: useTransform(refreshProgress, [0, 1], [0, 360]),
              borderTopColor: useTransform(refreshProgress, [0, 1], ['transparent', '#10b981'])
            }}
          />
        </motion.div>
      )}
      
      {/* Main content */}
      <div className="w-full h-full">
        {children}
      </div>
      
      {/* Touch feedback overlay for debugging (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div>Pull: {Math.round(y.get())}</div>
          <div>Threshold: {refreshThreshold}</div>
        </motion.div>
      )}
    </motion.div>
  );
}
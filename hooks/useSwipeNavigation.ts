"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface SwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  preventScroll = false
}: SwipeNavigationOptions) {
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    setIsScrolling(false);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX.current);
    const deltaY = Math.abs(touch.clientY - touchStartY.current);

    // Detect if user is scrolling vertically
    if (deltaY > deltaX && deltaY > 10) {
      setIsScrolling(true);
      return;
    }

    // Prevent scroll if horizontal swipe detected and preventScroll is true
    if (preventScroll && deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current || isScrolling) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = Math.abs(touch.clientY - touchStartY.current);
    const deltaTime = Date.now() - touchStartTime.current;
    
    // Reset values
    touchStartX.current = null;
    touchStartY.current = null;

    // Only trigger if swipe is primarily horizontal, fast enough, and meets threshold
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY && deltaTime < 300) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  }, [threshold, onSwipeLeft, onSwipeRight, isScrolling]);

  useEffect(() => {
    const element = document.documentElement;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isScrolling };
}
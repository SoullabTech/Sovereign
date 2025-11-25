// Mobile optimization utilities for Sacred Holoflower

export interface MobileOptimizationResult {
  visible: string[];
  shimmer: boolean;
  performanceMode: 'full' | 'balanced' | 'battery';
}

// Detect device capabilities
export function getDeviceCapabilities() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowPower = (navigator as any).getBattery?.().then((battery: any) => battery.level < 0.2);
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    isMobile,
    isLowPower,
    hasReducedMotion
  };
}

// Optimize visual complexity for mobile
export function optimizeForMobile(
  activeElements: string[],
  forceLowPower = false
): MobileOptimizationResult {
  const MAX_VISIBLE_FULL = 5;
  const MAX_VISIBLE_BALANCED = 4;
  const MAX_VISIBLE_BATTERY = 3;
  
  const { hasReducedMotion } = getDeviceCapabilities();
  
  // Determine performance mode
  let performanceMode: 'full' | 'balanced' | 'battery' = 'full';
  let maxVisible = MAX_VISIBLE_FULL;
  
  if (forceLowPower || hasReducedMotion) {
    performanceMode = 'battery';
    maxVisible = MAX_VISIBLE_BATTERY;
  } else if (activeElements.length > 6) {
    performanceMode = 'balanced';
    maxVisible = MAX_VISIBLE_BALANCED;
  }
  
  // Limit visible elements
  const visible = activeElements.slice(0, maxVisible);
  const overflow = activeElements.length - maxVisible;
  
  return {
    visible,
    shimmer: overflow > 0, // Add shimmer field for overflow
    performanceMode
  };
}

// Get optimized animation settings
export function getOptimizedAnimationSettings(performanceMode: 'full' | 'balanced' | 'battery') {
  switch (performanceMode) {
    case 'battery':
      return {
        fps: 30,
        particleCount: 20,
        glowIntensity: 0.3,
        rippleCount: 1,
        useGPU: false
      };
    case 'balanced':
      return {
        fps: 45,
        particleCount: 40,
        glowIntensity: 0.5,
        rippleCount: 2,
        useGPU: true
      };
    case 'full':
    default:
      return {
        fps: 60,
        particleCount: 60,
        glowIntensity: 0.7,
        rippleCount: 3,
        useGPU: true
      };
  }
}

// Check if device supports haptics
export function supportsHaptics(): boolean {
  return 'vibrate' in navigator;
}

// Get safe viewport dimensions for fullscreen
export function getSafeViewportDimensions() {
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  
  // Account for notches and safe areas
  const safeAreaInsets = {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'),
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'),
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0'),
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0')
  };
  
  return {
    width: vw - safeAreaInsets.left - safeAreaInsets.right,
    height: vh - safeAreaInsets.top - safeAreaInsets.bottom,
    safeAreaInsets
  };
}
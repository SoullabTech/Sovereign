// iOS-specific fixes and compatibility utilities

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isIOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);

  return isIOS && isSafari;
};

export const getIOSVersion = (): number | null => {
  if (!isIOS()) return null;

  const match = navigator.userAgent.match(/OS (\d+)_/);
  return match ? parseInt(match[1], 10) : null;
};

// Fix iOS input zoom issue
export const preventIOSZoom = (element: HTMLElement): void => {
  if (!isIOS()) return;

  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const htmlInput = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const currentSize = getComputedStyle(htmlInput).fontSize;
    const currentSizeNum = parseFloat(currentSize);

    if (currentSizeNum < 16) {
      htmlInput.style.fontSize = '16px';
    }
  });
};

// Smooth scroll polyfill for iOS
export const smoothScrollPolyfill = (element: Element, options?: ScrollIntoViewOptions): void => {
  if (!isIOS() || !element) return;

  try {
    element.scrollIntoView(options);
  } catch (error) {
    // Fallback for older iOS versions
    element.scrollIntoView();
  }
};

// Fix iOS viewport height issues
export const fixIOSViewportHeight = (): void => {
  if (!isIOS()) return;

  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 500);
  });
};

// Disable rubber band scrolling on iOS
export const disableIOSRubberBand = (): void => {
  if (!isIOS()) return;

  document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Fix iOS animation performance
export const optimizeIOSAnimations = (): void => {
  if (!isIOS()) return;

  // Reduce animations on older iOS versions
  const version = getIOSVersion();
  if (version && version < 14) {
    document.documentElement.classList.add('reduce-motion');
  }
};

// Initialize all iOS fixes
export const initIOSFixes = (): void => {
  if (typeof window === 'undefined') return;

  fixIOSViewportHeight();
  optimizeIOSAnimations();

  // Apply input zoom fix to body
  if (document.body) {
    preventIOSZoom(document.body);
  }
};
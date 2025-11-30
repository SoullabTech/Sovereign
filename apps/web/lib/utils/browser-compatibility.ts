/**
 * Comprehensive Browser Compatibility Manager
 * Handles feature detection, polyfills, and fallbacks for legacy browsers
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  isLegacy: boolean;
  supportLevel: 'full' | 'partial' | 'minimal' | 'none';
}

export interface CompatibilityReport {
  browser: BrowserInfo;
  features: {
    webapi: boolean;
    css: boolean;
    javascript: boolean;
    audio: boolean;
    storage: boolean;
    pwa: boolean;
  };
  warnings: string[];
  recommendations: string[];
}

/**
 * Detect browser information and capabilities
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  // Browser detection patterns
  const patterns = {
    chrome: /chrome\/([0-9.]+)/,
    firefox: /firefox\/([0-9.]+)/,
    safari: /version\/([0-9.]+).*safari/,
    edge: /edg\/([0-9.]+)/,
    ie: /msie ([0-9.]+)|trident.*rv:([0-9.]+)/,
    opera: /opera\/([0-9.]+)|opr\/([0-9.]+)/
  };

  let name = 'unknown';
  let version = '0';
  let engine = 'unknown';

  // Detect browser
  if (patterns.chrome.test(userAgent)) {
    name = 'chrome';
    version = userAgent.match(patterns.chrome)?.[1] || '0';
    engine = 'blink';
  } else if (patterns.firefox.test(userAgent)) {
    name = 'firefox';
    version = userAgent.match(patterns.firefox)?.[1] || '0';
    engine = 'gecko';
  } else if (patterns.safari.test(userAgent) && !userAgent.includes('chrome')) {
    name = 'safari';
    version = userAgent.match(patterns.safari)?.[1] || '0';
    engine = 'webkit';
  } else if (patterns.edge.test(userAgent)) {
    name = 'edge';
    version = userAgent.match(patterns.edge)?.[1] || '0';
    engine = 'blink';
  } else if (patterns.ie.test(userAgent)) {
    name = 'ie';
    const match = userAgent.match(patterns.ie);
    version = match?.[1] || match?.[2] || '0';
    engine = 'trident';
  } else if (patterns.opera.test(userAgent)) {
    name = 'opera';
    const match = userAgent.match(patterns.opera);
    version = match?.[1] || match?.[2] || '0';
    engine = 'blink';
  }

  // Determine if legacy browser
  const majorVersion = parseInt(version.split('.')[0]);
  const isLegacy = (
    (name === 'chrome' && majorVersion < 90) ||
    (name === 'firefox' && majorVersion < 88) ||
    (name === 'safari' && majorVersion < 14) ||
    (name === 'edge' && majorVersion < 90) ||
    (name === 'ie') ||
    (name === 'opera' && majorVersion < 76)
  );

  // Determine support level
  let supportLevel: 'full' | 'partial' | 'minimal' | 'none' = 'full';
  if (name === 'ie' || majorVersion === 0) {
    supportLevel = 'none';
  } else if (isLegacy) {
    supportLevel = majorVersion > 0 ? 'partial' : 'minimal';
  }

  return {
    name,
    version,
    engine,
    platform,
    isLegacy,
    supportLevel
  };
}

/**
 * Check for specific feature support
 */
export function checkFeatureSupport() {
  return {
    // Web APIs
    webapi: {
      fetch: typeof fetch !== 'undefined',
      websockets: typeof WebSocket !== 'undefined',
      webrtc: !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia),
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      clipboard: !!navigator.clipboard
    },

    // CSS Features
    css: {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('--custom', 'property'),
      backdrop: CSS.supports('backdrop-filter', 'blur(10px)'),
      containerQueries: CSS.supports('container-type', 'inline-size')
    },

    // JavaScript Features
    javascript: {
      es6: typeof Symbol !== 'undefined',
      modules: 'noModule' in HTMLScriptElement.prototype,
      asyncAwait: (function() {
        try {
          eval('async () => {}');
          return true;
        } catch {
          return false;
        }
      })(),
      promises: typeof Promise !== 'undefined',
      intersectionObserver: 'IntersectionObserver' in window
    },

    // Audio/Voice Features
    audio: {
      mediaRecorder: typeof MediaRecorder !== 'undefined',
      audioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
      getUserMedia: !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia),
      webAudio: 'AudioWorklet' in window
    },

    // Storage
    storage: {
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })(),
      sessionStorage: typeof sessionStorage !== 'undefined',
      indexedDB: 'indexedDB' in window,
      cacheAPI: 'caches' in window
    },

    // PWA Features
    pwa: {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: 'manifest' in document.createElement('link'),
      appCache: 'applicationCache' in window,
      pushManager: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    }
  };
}

/**
 * Generate compatibility report
 */
export function generateCompatibilityReport(): CompatibilityReport {
  const browser = detectBrowser();
  const features = checkFeatureSupport();
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Analyze feature support and generate warnings
  if (browser.name === 'ie') {
    warnings.push('Internet Explorer is not supported. Please use a modern browser.');
    recommendations.push('Switch to Chrome, Firefox, Safari, or Edge for the best experience.');
  }

  if (browser.isLegacy) {
    warnings.push(`Your ${browser.name} browser (v${browser.version}) is outdated.`);
    recommendations.push(`Please update to the latest version of ${browser.name}.`);
  }

  if (!features.webapi.fetch) {
    warnings.push('Fetch API not supported. Using XMLHttpRequest fallback.');
  }

  if (!features.audio.mediaRecorder) {
    warnings.push('Voice recording may not work properly.');
    recommendations.push('Voice features require a modern browser with MediaRecorder API support.');
  }

  if (!features.css.grid) {
    warnings.push('CSS Grid not supported. Layout may appear differently.');
  }

  if (!features.pwa.serviceWorker) {
    warnings.push('Offline functionality not available.');
    recommendations.push('Enable Service Workers for offline support.');
  }

  // Calculate overall support scores
  const supportScore = {
    webapi: Object.values(features.webapi).filter(Boolean).length / Object.values(features.webapi).length,
    css: Object.values(features.css).filter(Boolean).length / Object.values(features.css).length,
    javascript: Object.values(features.javascript).filter(Boolean).length / Object.values(features.javascript).length,
    audio: Object.values(features.audio).filter(Boolean).length / Object.values(features.audio).length,
    storage: Object.values(features.storage).filter(Boolean).length / Object.values(features.storage).length,
    pwa: Object.values(features.pwa).filter(Boolean).length / Object.values(features.pwa).length
  };

  return {
    browser,
    features: {
      webapi: supportScore.webapi > 0.8,
      css: supportScore.css > 0.7,
      javascript: supportScore.javascript > 0.8,
      audio: supportScore.audio > 0.6,
      storage: supportScore.storage > 0.7,
      pwa: supportScore.pwa > 0.6
    },
    warnings,
    recommendations
  };
}

/**
 * Load polyfills based on feature detection
 */
export async function loadPolyfills(): Promise<void> {
  const features = checkFeatureSupport();
  const polyfills: Promise<any>[] = [];

  // Fetch polyfill - Built-in fallback
  if (!features.webapi.fetch) {
    // Fallback XMLHttpRequest wrapper
    (window as any).fetch = function(url: string, options: any = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        if (options.headers) {
          Object.entries(options.headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value as string);
          });
        }

        xhr.onload = () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
            text: () => Promise.resolve(xhr.responseText)
          });
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(options.body);
      });
    };
  }

  // Promise polyfill - Basic implementation for very old browsers
  if (!features.javascript.promises) {
    // Basic Promise polyfill for legacy browsers
    if (typeof Promise === 'undefined') {
      (window as any).Promise = class Promise {
        constructor(executor: Function) {
          const resolve = (value: any) => {
            setTimeout(() => {
              if (this.onResolve) this.onResolve(value);
            }, 0);
          };
          const reject = (error: any) => {
            setTimeout(() => {
              if (this.onReject) this.onReject(error);
            }, 0);
          };
          executor(resolve, reject);
        }

        then(onResolve?: Function, onReject?: Function) {
          this.onResolve = onResolve;
          this.onReject = onReject;
          return this;
        }

        catch(onReject: Function) {
          this.onReject = onReject;
          return this;
        }

        onResolve?: Function;
        onReject?: Function;
      };
    }
  }

  // IntersectionObserver polyfill - Fallback implementation
  if (!features.javascript.intersectionObserver) {
    // Simple IntersectionObserver fallback for legacy browsers
    (window as any).IntersectionObserver = class IntersectionObserver {
      constructor(callback: Function, options: any = {}) {
        this.callback = callback;
        this.options = options;
        this.observedElements = new Set();
      }

      observe(element: Element) {
        this.observedElements.add(element);
        // Simple visibility check fallback
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          this.callback([{
            target: element,
            isIntersecting: isVisible,
            intersectionRatio: isVisible ? 1 : 0
          }]);
        }, 100);
      }

      unobserve(element: Element) {
        this.observedElements.delete(element);
      }

      disconnect() {
        this.observedElements.clear();
      }

      callback: Function;
      options: any;
      observedElements: Set<Element>;
    };
  }

  // CSS.supports polyfill
  if (typeof CSS === 'undefined' || !CSS.supports) {
    (window as any).CSS = (window as any).CSS || {};
    (window as any).CSS.supports = function() {
      return false; // Conservative fallback
    };
  }

  await Promise.allSettled(polyfills);
}

/**
 * Apply browser-specific fixes and workarounds
 */
export function applyBrowserFixes(): void {
  const browser = detectBrowser();

  // iOS/Safari specific fixes
  if (browser.name === 'safari' || /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
    // Fix for iOS 100vh issue
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    // Fix for iOS audio context
    document.addEventListener('touchstart', function() {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const context = new AudioContext();
        context.resume();
      }
    }, { once: true });
  }

  // Firefox specific fixes
  if (browser.name === 'firefox') {
    // Fix for Firefox input autofill
    const inputs = document.querySelectorAll('input[type="password"], input[type="email"]');
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
    });
  }

  // IE/Edge legacy fixes
  if (browser.name === 'ie' || (browser.name === 'edge' && parseInt(browser.version) < 79)) {
    // Object.assign polyfill
    if (typeof Object.assign !== 'function') {
      (Object as any).assign = function(target: any, ...sources: any[]) {
        sources.forEach(source => {
          if (source != null) {
            Object.keys(source).forEach(key => {
              target[key] = source[key];
            });
          }
        });
        return target;
      };
    }
  }
}

/**
 * Initialize browser compatibility system
 */
export function initializeBrowserCompatibility(): CompatibilityReport {
  const report = generateCompatibilityReport();

  // Load polyfills
  loadPolyfills();

  // Apply fixes
  applyBrowserFixes();

  // Log compatibility info for debugging
  console.group('🔧 Browser Compatibility');
  console.log('Browser:', `${report.browser.name} ${report.browser.version}`);
  console.log('Support Level:', report.browser.supportLevel);
  console.log('Legacy Browser:', report.browser.isLegacy);

  if (report.warnings.length > 0) {
    console.warn('Warnings:', report.warnings);
  }

  if (report.recommendations.length > 0) {
    console.info('Recommendations:', report.recommendations);
  }

  console.groupEnd();

  return report;
}
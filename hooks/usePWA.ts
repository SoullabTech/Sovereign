import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isInStandaloneMode: boolean;
  canPrompt: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ABTestVariant {
  name: 'immediate' | 'delayed' | 'contextual';
  triggerAfter?: number; // Number of interactions or sessions
  contextTrigger?: string; // Specific event that triggers prompt
}

interface AnalyticsData {
  variant: ABTestVariant['name'];
  impressions: number;
  dismissals: number;
  installs: number;
  sessionCount: number;
  interactionCount: number;
  firstSeen: number;
  lastSeen: number;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [abVariant, setABVariant] = useState<ABTestVariant | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isInStandaloneMode: false,
    canPrompt: false,
    platform: 'unknown'
  });

  // Initialize A/B test variant and analytics
  useEffect(() => {
    const storedAnalytics = localStorage.getItem('pwa_analytics');
    if (storedAnalytics) {
      const data = JSON.parse(storedAnalytics) as AnalyticsData;
      setAnalytics(data);

      // Update session count if needed
      const lastSeen = data.lastSeen;
      const now = Date.now();
      if (now - lastSeen > 30 * 60 * 1000) { // New session after 30 minutes
        data.sessionCount++;
        data.lastSeen = now;
        localStorage.setItem('pwa_analytics', JSON.stringify(data));
        trackEvent('new_session', { variant: data.variant, sessionCount: data.sessionCount });
      }
    } else {
      // Assign A/B test variant
      const variant = assignABVariant();
      const newAnalytics: AnalyticsData = {
        variant: variant.name,
        impressions: 0,
        dismissals: 0,
        installs: 0,
        sessionCount: 1,
        interactionCount: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now()
      };
      setABVariant(variant);
      setAnalytics(newAnalytics);
      localStorage.setItem('pwa_analytics', JSON.stringify(newAnalytics));
      trackEvent('ab_variant_assigned', { variant: variant.name });
    }
  }, []);

  // Detect platform and PWA state
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    // Check if already installed
    const isInstalled = isInStandaloneMode || localStorage.getItem('pwa-installed') === 'true';

    // Determine platform
    let platform: PWAState['platform'] = 'desktop';
    if (isIOS) platform = 'ios';
    else if (isAndroid) platform = 'android';

    setPWAState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isInStandaloneMode,
      isInstalled,
      platform,
      isInstallable: !isInstalled && (isIOS || !!deferredPrompt)
    }));
  }, [deferredPrompt]);

  // Listen for install prompt event (Android/Desktop)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPWAState(prev => ({
        ...prev,
        isInstallable: true,
        canPrompt: true
      }));
    };

    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        canPrompt: false
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
        localStorage.setItem('pwa-installed', 'true');
        setPWAState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          canPrompt: false
        }));
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('PWA installation dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setPWAState(prev => ({
      ...prev,
      isInstallable: false
    }));
  }, []);

  // Check if we should show the prompt
  const shouldShowPrompt = useCallback(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return true;

    // Show again after 7 days
    const dismissedTime = parseInt(dismissed);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    return daysSinceDismissed > 7;
  }, []);

  // Get install instructions for iOS
  const getIOSInstallInstructions = () => ({
    steps: [
      'Tap the Share button (square with arrow)',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" in the top right corner'
    ],
    icon: '📱'
  });

  // Register/update service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-enhanced.js');
        console.log('Service Worker registered:', registration);

        // Auto-update functionality removed to prevent glitches
        // Updates will only happen on manual page refresh
        console.log('✅ Service Worker registered without auto-updates');

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Track user interaction for A/B testing
  const trackInteraction = useCallback((interactionType: string) => {
    if (!analytics) return;

    const updated = { ...analytics, interactionCount: analytics.interactionCount + 1 };
    setAnalytics(updated);
    localStorage.setItem('pwa_analytics', JSON.stringify(updated));

    trackEvent('user_interaction', {
      type: interactionType,
      variant: analytics.variant,
      count: updated.interactionCount
    });

    // Check if we should show prompt based on variant rules
    if (abVariant && shouldShowInstallPrompt()) {
      setPWAState(prev => ({ ...prev, canPrompt: true }));
    }
  }, [analytics, abVariant]);

  // Determine if install prompt should show based on A/B variant
  const shouldShowInstallPrompt = useCallback(() => {
    if (!analytics || !abVariant) return false;

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false;
    }

    switch (abVariant.name) {
      case 'immediate':
        return analytics.sessionCount === 1;

      case 'delayed':
        return analytics.interactionCount >= (abVariant.triggerAfter || 3) ||
               analytics.sessionCount >= 3;

      case 'contextual':
        // Check for meaningful moment
        const milestone = localStorage.getItem('milestone_reached');
        const trustLevel = localStorage.getItem('trust_level');
        const novelArchetype = localStorage.getItem('novel_archetype');

        return !!(milestone ||
                 (trustLevel && parseInt(trustLevel) >= 70) ||
                 novelArchetype);

      default:
        return false;
    }
  }, [analytics, abVariant]);

  // Assign A/B test variant
  const assignABVariant = (): ABTestVariant => {
    const random = Math.random();
    if (random < 0.33) {
      return { name: 'immediate' };
    } else if (random < 0.66) {
      return { name: 'delayed', triggerAfter: 3 };
    } else {
      return { name: 'contextual', contextTrigger: 'milestone_reached' };
    }
  };

  // Track analytics event
  const trackEvent = (eventName: string, parameters: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: 'PWA',
        ...parameters
      });
    }

    // Custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        properties: parameters,
        timestamp: Date.now()
      })
    }).catch(console.error);

    console.log('[PWA Analytics]', eventName, parameters);
  };

  return {
    ...pwaState,
    installPWA,
    dismissInstallPrompt,
    shouldShowPrompt: shouldShowInstallPrompt,
    getIOSInstallInstructions,
    registerServiceWorker,
    trackInteraction,
    analytics,
    abVariant,
    isReady: true,
    installPrompt: deferredPrompt,
    handleInstall: installPWA
  };
};
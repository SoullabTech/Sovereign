'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserTier, SubscriptionStatus, PremiumFeature, TIER_FEATURES, FEATURE_NAMES } from '@/lib/subscription/types';

interface SubscriptionContextType {
  user: User | null;
  hasFeature: (feature: PremiumFeature) => boolean;
  requireSubscription: (feature: PremiumFeature) => boolean;
  showUpgradeModal: (feature: PremiumFeature) => void;
  isLoading: boolean;
  isBetaTester: boolean; // Tracked in state for hydration
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  user: null,
  hasFeature: () => false,
  requireSubscription: () => false,
  showUpgradeModal: () => {},
  isLoading: true,
  isBetaTester: false,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBetaTester, setIsBetaTester] = useState(false); // State for hydration-safe beta check

  useEffect(() => {
    // Check beta code on mount (client-side only)
    const betaCode = localStorage.getItem('soullab_beta_code');
    if (betaCode && betaCode.toUpperCase().startsWith('SOULLAB-')) {
      setIsBetaTester(true);
    }
    // Initialize user - for now, simulate with localStorage
    // In production, this would be an API call
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Check if user has subscription info in localStorage
      const userData = localStorage.getItem('maia_user_subscription');

      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } else {
        // Create default free user
        const defaultUser: User = {
          id: 'guest',
          name: 'Explorer',
          subscription: {
            status: 'none',
            tier: 'free',
            features: []
          },
          createdAt: new Date(),
          lastActive: new Date()
        };

        localStorage.setItem('maia_user_subscription', JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
    } catch (error) {
      console.error('Error initializing subscription:', error);
      // Fallback to free user
      setUser({
        id: 'guest',
        name: 'Explorer',
        subscription: {
          status: 'none',
          tier: 'free',
          features: []
        },
        createdAt: new Date(),
        lastActive: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = useCallback((feature: PremiumFeature): boolean => {
    // Beta testers get full premium access (uses state for hydration-safe check)
    if (isBetaTester) return true;
    if (!user) return false;
    return TIER_FEATURES[user.subscription.tier].includes(feature);
  }, [isBetaTester, user]);

  const requireSubscription = useCallback((feature: PremiumFeature): boolean => {
    const hasAccess = hasFeature(feature);

    if (!hasAccess) {
      showUpgradeModal(feature);
      return false;
    }

    return true;
  }, [hasFeature]);

  const showUpgradeModal = (feature: PremiumFeature) => {
    const featureName = FEATURE_NAMES[feature];

    // For now, just show an alert - later replace with proper modal
    alert(`🌟 Upgrade to access ${featureName}\n\nThis feature requires a MAIA subscription. Upgrade to unlock the full sacred workspace and consciousness tools.`);

    // TODO: Implement proper upgrade modal/flow
    console.log(`Upgrade required for feature: ${featureName}`);
  };

  return (
    <SubscriptionContext.Provider value={{
      user,
      hasFeature,
      requireSubscription,
      showUpgradeModal,
      isLoading,
      isBetaTester
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Helper hook for specific features
export function useFeatureAccess(feature: PremiumFeature) {
  const { hasFeature, requireSubscription, user } = useSubscription();

  return {
    hasAccess: hasFeature(feature),
    require: () => requireSubscription(feature),
    tier: user?.subscription.tier || 'free',
    isSubscriber: user?.subscription.tier !== 'free'
  };
}

// Utility functions for manual subscription management (dev/testing)
export const subscriptionUtils = {
  // Activate beta tester access with SOULLAB-[NAME] code
  activateBetaCode: (code: string): boolean => {
    if (typeof window === 'undefined') return false;
    if (code && code.toUpperCase().startsWith('SOULLAB-')) {
      localStorage.setItem('soullab_beta_code', code.toUpperCase());
      console.log(`🌟 Beta access activated: ${code}`);
      window.location.reload(); // Refresh to apply changes
      return true;
    }
    console.error('Invalid beta code. Must start with SOULLAB-');
    return false;
  },

  // Check if user has beta access
  isBetaTester: (): boolean => {
    if (typeof window === 'undefined') return false;
    const betaCode = localStorage.getItem('soullab_beta_code');
    return !!(betaCode && betaCode.toUpperCase().startsWith('SOULLAB-'));
  },

  // Get beta code
  getBetaCode: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('soullab_beta_code');
  },

  // Remove beta access
  removeBetaCode: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('soullab_beta_code');
    window.location.reload();
  },

  // Upgrade user to subscriber
  upgradeToSubscriber: () => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('maia_user_subscription');
    if (userData) {
      const user = JSON.parse(userData);
      user.subscription.tier = 'subscriber';
      user.subscription.status = 'active';
      localStorage.setItem('maia_user_subscription', JSON.stringify(user));
      window.location.reload(); // Refresh to apply changes
    }
  },

  // Downgrade to free
  downgradeToFree: () => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('maia_user_subscription');
    if (userData) {
      const user = JSON.parse(userData);
      user.subscription.tier = 'free';
      user.subscription.status = 'none';
      localStorage.setItem('maia_user_subscription', JSON.stringify(user));
      window.location.reload(); // Refresh to apply changes
    }
  }
};
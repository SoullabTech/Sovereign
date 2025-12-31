'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  UserTier,
  ContributionCircle,
  MembershipStatus,
  PremiumFeature,
  TIER_FEATURES,
  FEATURE_NAMES,
  CONTRIBUTION_SUGGESTIONS,
  CIRCLE_DESCRIPTIONS,
  SEVA_PATHWAYS,
  SevaPathway
} from '@/lib/subscription/types';

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
        // Create default explorer (everyone gets full access)
        const defaultUser: User = {
          id: 'guest',
          name: 'Explorer',
          subscription: {
            status: 'explorer',
            tier: 'explorer',
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
      // Fallback to explorer (everyone gets full access)
      setUser({
        id: 'guest',
        name: 'Explorer',
        subscription: {
          status: 'explorer',
          tier: 'explorer',
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
    // NEW MODEL: Everyone gets full access - consciousness shouldn't be paywalled
    // Contribution circles are about gratitude/recognition, not feature gating
    return true;
  }, []);

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
    hasAccess: hasFeature(feature),  // Always true - everyone has full access
    require: () => requireSubscription(feature),
    tier: user?.subscription.tier || 'explorer',
    circle: user?.subscription.tier || 'explorer',
    isContributor: user?.subscription.tier !== 'explorer'  // Are they actively contributing?
  };
}

/**
 * Sustaining Circle Utilities
 *
 * Philosophy: Everyone gets full access. Contribution is gratitude, not payment.
 */
export const membershipUtils = {
  // Activate beta tester / founding member code
  activateBetaCode: (code: string): boolean => {
    if (typeof window === 'undefined') return false;
    if (code && code.toUpperCase().startsWith('SOULLAB-')) {
      localStorage.setItem('soullab_beta_code', code.toUpperCase());
      console.log(`🌟 Founding member activated: ${code}`);
      window.location.reload();
      return true;
    }
    console.error('Invalid code. Must start with SOULLAB-');
    return false;
  },

  // Check if user is a founding member / beta tester
  isBetaTester: (): boolean => {
    if (typeof window === 'undefined') return false;
    const betaCode = localStorage.getItem('soullab_beta_code');
    return !!(betaCode && betaCode.toUpperCase().startsWith('SOULLAB-'));
  },

  // Get beta/founding code
  getBetaCode: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('soullab_beta_code');
  },

  // Get current contribution circle
  getCurrentCircle: (): ContributionCircle => {
    if (typeof window === 'undefined') return 'explorer';
    // Founding members get 'founder' circle
    if (membershipUtils.isBetaTester()) return 'founder';
    const userData = localStorage.getItem('maia_user_subscription');
    if (userData) {
      const user = JSON.parse(userData);
      return user.membership?.circle || user.subscription?.tier || 'explorer';
    }
    return 'explorer';
  },

  // Join as Sustainer (monthly contribution)
  joinSustainingCircle: (amount: number = 9) => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('maia_user_subscription');
    const user = userData ? JSON.parse(userData) : { id: 'guest', name: 'Explorer' };

    // Determine circle based on contribution amount
    let circle: ContributionCircle = 'sustainer';
    if (amount >= 33) circle = 'elder';
    else if (amount >= 15) circle = 'guardian';

    user.membership = {
      status: 'active',
      circle,
      contributionAmount: amount,
      joinedAt: new Date().toISOString()
    };
    user.subscription = { ...user.subscription, tier: circle, status: 'active' };
    localStorage.setItem('maia_user_subscription', JSON.stringify(user));
    console.log(`🕯️ Joined Sustaining Circle as ${circle} ($${amount}/mo)`);
    window.location.reload();
  },

  // Join Pioneer/Founding Circle (one-time lifetime)
  joinFoundingCircle: () => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('maia_user_subscription');
    const user = userData ? JSON.parse(userData) : { id: 'guest', name: 'Explorer' };

    user.membership = {
      status: 'founding',
      circle: 'founder',
      lifetimeContribution: 222,
      joinedAt: new Date().toISOString()
    };
    user.subscription = { ...user.subscription, tier: 'founder', status: 'active' };
    localStorage.setItem('maia_user_subscription', JSON.stringify(user));
    console.log(`⭐ Joined Pioneer Founding Circle`);
    window.location.reload();
  },

  // Join through Seva (service exchange)
  joinSeva: (pathway: SevaPathway) => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('maia_user_subscription');
    const user = userData ? JSON.parse(userData) : { id: 'guest', name: 'Explorer' };

    user.membership = {
      status: 'seva',
      circle: 'seva',
      sevaPathway: pathway,
      joinedAt: new Date().toISOString()
    };
    user.subscription = { ...user.subscription, tier: 'seva', status: 'active' };
    localStorage.setItem('maia_user_subscription', JSON.stringify(user));
    console.log(`🙏 Joined through Seva: ${SEVA_PATHWAYS[pathway].name}`);
    window.location.reload();
  },

  // Get contribution suggestions
  getContributionSuggestions: () => CONTRIBUTION_SUGGESTIONS,

  // Get circle descriptions
  getCircleDescriptions: () => CIRCLE_DESCRIPTIONS,

  // Get seva pathways
  getSevaPathways: () => SEVA_PATHWAYS,

  // Everyone gets all features
  hasFullAccess: () => true
};

// Legacy export for backward compatibility
export const subscriptionUtils = membershipUtils;
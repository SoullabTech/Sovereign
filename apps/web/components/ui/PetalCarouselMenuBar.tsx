'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MessageCircle, Users, Brain, Settings, Star, Heart, LogOut,
  Menu, ArrowRight, Sparkles, Eye, Zap, Mic
} from 'lucide-react';
import { MiniHoloflower } from '@/components/holoflower/MiniHoloflower';
import { supabase } from '@/lib/auth/supabase-client';
import { motion } from 'framer-motion';

/**
 * Petal Carousel Menu Bar
 *
 * Top: MAIA home + Logout only (minimal & clean!)
 * Bottom: Horizontal scrolling "petal carousel" with all navigation
 *
 * Innovation: Like sliding through flower petals - swipe to explore
 */
export function PetalCarouselMenuBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [trainingProgress] = useState(0);
  const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false); // Start hidden (Apple-style)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchY = useRef<number>(0);

  const handleSignOut = async () => {
    const betaUser = localStorage.getItem('beta_user');
    let preservedData: { birthDate?: string; username?: string; intention?: string; birthData?: any } | null = null;

    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        preservedData = {
          birthDate: userData.birthDate,
          username: userData.username,
          intention: userData.intention,
          birthData: userData.birthData
        };
      } catch (e) {
        console.error('Error parsing user data for preservation:', e);
      }
    }

    await supabase.auth.signOut();

    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    localStorage.removeItem('soullab-session');
    localStorage.removeItem('betaOnboardingComplete');

    if (preservedData) {
      const profileData = {
        ...preservedData,
        onboarded: true,
        loggedOut: true
      };
      localStorage.setItem('beta_user', JSON.stringify(profileData));
    }

    router.push('/maia');
  };

  const hideCommunityLink = pathname?.startsWith('/community');
  const hidePartnersLink = pathname?.startsWith('/partners');

  // Auto-hide functionality - Apple-style behavior
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const showCarousel = () => {
      setIsBottomMenuOpen(true);
      // Auto-hide after 3 seconds of inactivity
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsBottomMenuOpen(false);
      }, 3000);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Show on scroll up or when near bottom
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const distanceFromBottom = documentHeight - (currentScrollY + windowHeight);

          if (currentScrollY < lastScrollY || distanceFromBottom < 200) {
            showCarousel();
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const windowHeight = window.innerHeight;

      // Show if touch is in bottom 20% of screen or swiping up from bottom
      if (currentY > windowHeight * 0.8 || (lastTouchY.current > currentY && currentY > windowHeight * 0.7)) {
        showCarousel();
      }

      lastTouchY.current = currentY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      // Show when mouse enters bottom 15% of screen
      if (e.clientY > windowHeight * 0.85) {
        showCarousel();
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Petal items - all navigation in one scrollable carousel
  const petalItems = [
    // Voice/Chat Toggle - First item
    {
      type: 'toggle' as const,
      icon: Mic,
      label: 'Voice/Chat',
      subtitle: 'Toggle input mode',
      onClick: () => {
        const event = new CustomEvent('toggleVoiceChat');
        window.dispatchEvent(event);
        // Keep menu open for toggles
      },
      color: 'amber'
    },

    // Mode toggles
    {
      type: 'mode' as const,
      icon: MessageCircle,
      label: 'Dialogue',
      subtitle: 'Natural conversation',
      href: '/maia?mode=dialogue',
      color: 'amber'
    },
    {
      type: 'mode' as const,
      icon: Sparkles,
      label: 'Dream Weaver',
      subtitle: 'Pattern synthesis',
      href: '/maia?mode=dreamweaver',
      color: 'orange'
    },
    {
      type: 'mode' as const,
      icon: Eye,
      label: 'Patient',
      subtitle: 'Reflective witness',
      href: '/maia?mode=patient',
      color: 'purple'
    },
    {
      type: 'mode' as const,
      icon: Zap,
      label: 'Scientific',
      subtitle: 'Analytical mode',
      href: '/maia?mode=scientific',
      color: 'blue'
    },

    // Journey & Access Matrix
    {
      type: 'nav' as const,
      icon: Menu,
      label: 'Journey',
      subtitle: 'Your wisdom path',
      onClick: () => {
        const event = new CustomEvent('openJourneyDashboard');
        window.dispatchEvent(event);
        setIsBottomMenuOpen(false);
      },
      color: 'amber'
    },
    {
      type: 'nav' as const,
      icon: ArrowRight,
      label: 'Access Matrix',
      subtitle: 'Living gameboard',
      onClick: () => {
        const event = new CustomEvent('openAccessMatrix');
        window.dispatchEvent(event);
        setIsBottomMenuOpen(false);
      },
      color: 'amber',
      special: true // Special styling
    },

    // Regular navigation
    {
      type: 'nav' as const,
      icon: Brain,
      label: 'Training',
      subtitle: `${trainingProgress}% complete`,
      href: '/maia/training',
      showProgress: true,
      color: 'amber'
    },
    {
      type: 'nav' as const,
      icon: Star,
      label: 'Chart',
      subtitle: 'Your star map',
      href: '/astrology',
      color: 'amber'
    },
    ...(!hideCommunityLink ? [{
      type: 'nav' as const,
      icon: Users,
      label: 'Circle',
      subtitle: 'Community',
      href: '/community',
      color: 'amber'
    }] : []),
    ...(!hidePartnersLink ? [{
      type: 'nav' as const,
      icon: Heart,
      label: 'Partners',
      subtitle: 'Sacred bonds',
      href: '/partners',
      color: 'amber'
    }] : []),
    {
      type: 'nav' as const,
      icon: Settings,
      label: 'Settings',
      subtitle: 'Customize',
      href: '/settings',
      color: 'amber'
    },
    {
      type: 'nav' as const,
      icon: MessageCircle,
      label: 'Feedback',
      subtitle: 'Share thoughts',
      onClick: () => {
        const event = new CustomEvent('openFeedbackModal');
        window.dispatchEvent(event);
        setIsBottomMenuOpen(false);
      },
      color: 'amber'
    }
  ];

  return (
    <>
      {/* Top bar removed - full immersion with gesture-based navigation only */}

      {/* BOTTOM PETAL CAROUSEL MENU - HIDDEN FOR BETA MOBILE CLEANUP */}
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Carousel Content - Slides up when open */}
        <div
          className={`bg-neutral-900/98 backdrop-blur-md border-t border-amber-500/30 transition-all duration-300 ease-in-out ${
            isBottomMenuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Compact Icon Carousel - Horizontal scrolling */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-hide"
            style={{
              scrollSnapType: 'x proximity',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {petalItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              // Compact icon button for all items
              const IconButton = (
                <motion.div
                  className={`
                    relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14
                    rounded-full flex items-center justify-center
                    transition-all duration-300 cursor-pointer
                    ${isActive
                      ? 'bg-amber-500/30 border-2 border-amber-400/60 shadow-lg shadow-amber-500/30'
                      : 'bg-neutral-800/70 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40'
                    }
                    ${item.special ? 'ring-2 ring-amber-600/30 ring-offset-2 ring-offset-neutral-900' : ''}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                    isActive ? 'text-amber-300' : 'text-amber-400/80'
                  }`} />
                  {item.showProgress && trainingProgress > 0 && (
                    <svg className="absolute inset-0 -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="rgba(251, 191, 36, 0.3)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="rgb(251, 191, 36)"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - trainingProgress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                  )}
                </motion.div>
              );

              if (item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => {
                      // Only close menu for navigation away from /maia page
                      // Keep open for mode toggles (type: 'mode')
                      if (item.type !== 'mode') {
                        setIsBottomMenuOpen(false);
                      }
                    }}
                  >
                    {IconButton}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={item.onClick}
                >
                  {IconButton}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

/**
 * Welcome Back Page
 * Intelligently routes users based on authentication status
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, ArrowRight, User, Clock } from 'lucide-react';
import { betaSession } from '@/lib/auth/betaSession';

export default function WelcomeBackPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      // Use betaSession system for consistent authentication
      const user = betaSession.getCurrentUser();

      if (!user) {
        // No valid authentication - redirect to welcome (not signin) for proper flow
        console.log('🔐 No valid authentication found, redirecting to welcome');
        router.replace('/welcome');
        return;
      }

      // User is authenticated - set up welcome
      const userDisplayName = user.name || user.username || 'Explorer';
      setUserName(userDisplayName);

      // Get last visit time from user object or localStorage fallback
      const lastVisitTime = user.lastVisit || localStorage.getItem('last_visit_time');
      if (lastVisitTime) {
        let visitDate: Date;
        try {
          // Handle both timestamp formats
          visitDate = typeof lastVisitTime === 'string' && lastVisitTime.includes('-')
            ? new Date(lastVisitTime)
            : new Date(parseInt(lastVisitTime.toString()));

          const timeAgo = getTimeAgo(visitDate);
          setLastVisit(timeAgo);
        } catch (e) {
          console.log('Could not parse last visit time');
        }
      }

      // Update last visit time using betaSession
      betaSession.updateLastVisit();

      setIsLoading(false);

      // Auto-redirect to MAIA after a brief welcome
      setTimeout(() => {
        console.log('👋 Welcoming user back, proceeding to MAIA');
        router.push('/maia'); // Use push instead of replace to maintain history
      }, 2500);
    };

    checkAuthAndRedirect();
  }, [router]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return 'earlier today';
    }
  };

  const handleContinueNow = () => {
    router.push('/maia');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-md w-full"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl" />

        {/* Card Content */}
        <div className="relative bg-stone-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 text-center">
          {/* MAIA Logo */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/holoflower-amber.png"
              alt="MAIA"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-light text-white mb-2">
              Welcome back, {userName}
            </h1>

            {lastVisit && (
              <div className="flex items-center justify-center gap-2 text-stone-400 mb-6">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last visit: {lastVisit}</span>
              </div>
            )}

            <p className="text-stone-300 mb-8 leading-relaxed">
              Your consciousness journey continues. MAIA is ready to explore
              the depths of wisdom with you.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.button
              onClick={handleContinueNow}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white
                         rounded-xl font-medium transition-colors flex items-center
                         justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-5 h-5" />
              Continue to MAIA
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <p className="text-xs text-stone-500">
              Automatically continuing in a moment...
            </p>
          </div>
        </div>

        {/* Soullab Branding */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.6 }}
        >
          <Image
            src="/holoflower-amber.png"
            alt="Soullab"
            width={16}
            height={16}
          />
          <span className="text-xs text-amber-300/80 tracking-wider">SOULLAB</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
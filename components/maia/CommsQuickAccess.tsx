"use client";

/**
 * COMMS QUICK ACCESS
 *
 * Practitioner-only badge in MAIA header.
 * Shows unread count, links to /stellium/comms.
 *
 * Design principle: "MAIA sees, Stellium acts."
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// Inline practitioner check - no redirect, just check localStorage
function usePractitionerCheck(): { isPractitioner: boolean; isLoading: boolean } {
  const [isPractitioner, setIsPractitioner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedContext = localStorage.getItem('practitioner_context');
    if (storedContext) {
      try {
        const ctx = JSON.parse(storedContext);
        // Validate: must have real id and slug, not demo
        const isValid =
          ctx.id &&
          ctx.slug &&
          !ctx.id.includes('demo') &&
          !ctx.slug.includes('demo');
        setIsPractitioner(isValid);
      } catch {
        setIsPractitioner(false);
      }
    }
    setIsLoading(false);
  }, []);

  return { isPractitioner, isLoading };
}

interface CommsQuickAccessProps {
  /** Mobile variant uses smaller sizing */
  variant?: 'mobile' | 'desktop';
}

export function CommsQuickAccess({ variant = 'desktop' }: CommsQuickAccessProps) {
  const router = useRouter();
  const { isPractitioner, isLoading: authLoading } = usePractitionerCheck();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isPractitioner) return;

    try {
      const res = await fetch('/api/comms/inbox?count_only=true');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('[CommsQuickAccess] Failed to fetch count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isPractitioner]);

  // Initial fetch + polling every 60s
  useEffect(() => {
    if (authLoading || !isPractitioner) {
      setIsLoading(false);
      return;
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [authLoading, isPractitioner, fetchUnreadCount]);

  // Don't render for non-practitioners
  if (authLoading || !isPractitioner) {
    return null;
  }

  const handleClick = () => {
    router.push('/stellium/comms');
  };

  // Format badge count (9+ for large numbers)
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  const isMobile = variant === 'mobile';

  return (
    <motion.button
      onClick={handleClick}
      className={`relative flex items-center gap-1 rounded-lg
                 bg-maia-navy-800/40 hover:bg-maia-navy-800
                 border border-maia-navy-700/40 hover:border-maia-navy-700
                 text-maia-ink-60 hover:text-maia-ink-100 font-light transition-all flex-shrink-0
                 ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={unreadCount > 0 ? `${unreadCount} unread client messages` : 'Client Messages'}
    >
      <MessageSquare className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
      {!isMobile && <span className="hidden sm:inline">Comms</span>}

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span
          className={`absolute flex items-center justify-center
                     bg-sacred-gold text-gray-900 font-semibold rounded-full
                     ${isMobile ? '-top-1 -right-1 w-4 h-4 text-[10px]' : '-top-1.5 -right-1.5 w-5 h-5 text-[11px]'}`}
        >
          {badgeText}
        </span>
      )}
    </motion.button>
  );
}

export default CommsQuickAccess;

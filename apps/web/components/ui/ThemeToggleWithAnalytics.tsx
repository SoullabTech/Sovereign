'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@/lib/supabase';

export default function ThemeToggleWithAnalytics() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setPreviousTheme(theme || 'system');
  }, []);

  // Track theme changes
  const trackThemeChange = useCallback(async (newTheme: string) => {
    try {
      // Get user session if available
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to event_logs
      await supabase
        .from('event_logs')
        .insert({
          event_name: 'theme_changed',
          event_type: 'preference',
          user_id: session?.user?.id || 'anonymous',
          session_id: `session_${Date.now()}`, // Generate session ID for anonymous
          metadata: {
            from_theme: previousTheme,
            to_theme: newTheme,
            timestamp: new Date().toISOString(),
            user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
            screen_width: typeof window !== 'undefined' ? window.screen.width : null,
            screen_height: typeof window !== 'undefined' ? window.screen.height : null,
            time_of_day: getTimeOfDay(),
            platform: getPlatform()
          }
        });

      // Update user preferences if logged in
      if (session?.user?.id) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: session.user.id,
            theme: newTheme,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }

      // Track aggregate metrics
      await updateThemeMetrics(newTheme);
      
      setPreviousTheme(newTheme);
    } catch (error) {
      console.error('Failed to track theme change:', error);
    }
  }, [previousTheme, supabase]);

  // Helper function to get time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Helper function to detect platform
  const getPlatform = () => {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad/.test(userAgent)) return 'mobile';
    if (/tablet/.test(userAgent)) return 'tablet';
    return 'desktop';
  };

  // Update aggregate theme metrics
  const updateThemeMetrics = async (theme: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's metrics exist
    const { data: existing } = await supabase
      .from('theme_metrics')
      .select('*')
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing metrics
      const updates: any = {
        total_changes: (existing.total_changes || 0) + 1,
        updated_at: new Date().toISOString()
      };
      
      // Increment theme-specific counter
      if (theme === 'light') updates.light_count = (existing.light_count || 0) + 1;
      if (theme === 'dark') updates.dark_count = (existing.dark_count || 0) + 1;
      if (theme === 'system') updates.system_count = (existing.system_count || 0) + 1;

      await supabase
        .from('theme_metrics')
        .update(updates)
        .eq('date', today);
    } else {
      // Create new metrics for today
      await supabase
        .from('theme_metrics')
        .insert({
          date: today,
          light_count: theme === 'light' ? 1 : 0,
          dark_count: theme === 'dark' ? 1 : 0,
          system_count: theme === 'system' ? 1 : 0,
          total_changes: 1,
          created_at: new Date().toISOString()
        });
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    trackThemeChange(newTheme);
  };

  if (!mounted) {
    // Return placeholder to prevent layout shift
    return (
      <div className="flex items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'light' 
                     ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-yellow-200' 
                     : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900'
                   } shadow-sm hover:shadow-md`}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className={`w-5 h-5 transition-colors ${
          theme === 'light' ? 'text-yellow-600' : 'text-gray-500 dark:text-gray-400'
        }`} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'dark' 
                     ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-blue-200 dark:shadow-blue-900' 
                     : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900'
                   } shadow-sm hover:shadow-md`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className={`w-5 h-5 transition-colors ${
          theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
        }`} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'system' 
                     ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-amber-200 dark:shadow-amber-900' 
                     : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900'
                   } shadow-sm hover:shadow-md`}
        aria-label="System default"
        title="Follow system theme"
      >
        <Monitor className={`w-5 h-5 transition-colors ${
          theme === 'system' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
        }`} />
      </motion.button>
    </div>
  );
}
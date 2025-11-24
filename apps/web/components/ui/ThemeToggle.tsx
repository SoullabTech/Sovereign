'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@/lib/supabase';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setPreviousTheme(theme || 'system');
  }, []);

  // Log theme changes to Supabase
  const logThemeChange = async (newTheme: string) => {
    try {
      // Get current user session if available
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log to event_logs table
      await supabase.from('event_logs').insert({
        event_name: 'theme_changed',
        user_id: session?.user?.id || null,
        metadata: {
          theme: newTheme,
          previous: previousTheme,
          timestamp: new Date().toISOString(),
        },
        payload: {
          new: newTheme,
          previous: previousTheme,
          session_id: session?.access_token?.substring(0, 8) || null,
        }
      });

      // Update user profile if logged in
      if (session?.user?.id) {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', session.user.id);
      }
    } catch (error) {
      console.warn('Failed to log theme change:', error);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    logThemeChange(newTheme);
    setPreviousTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'light'
                     ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                     : 'border-amber-700/30 dark:border-amber-500/30 bg-amber-900/10 dark:bg-amber-900/10'
                   } shadow-md hover:shadow-lg`}
        aria-label="Light mode"
      >
        <Sun
          className="w-5 h-5"
          style={{ color: theme === 'light' ? '#D97706' : '#FEF3C7' }}
        />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'dark'
                     ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                     : 'border-amber-700/30 dark:border-amber-500/30 bg-amber-900/10 dark:bg-amber-900/10'
                   } shadow-md hover:shadow-lg`}
        aria-label="Dark mode"
      >
        <Moon
          className="w-5 h-5"
          style={{ color: theme === 'dark' ? '#D97706' : '#FEF3C7' }}
        />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-full border transition-all duration-200
                   ${theme === 'system'
                     ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                     : 'border-amber-700/30 dark:border-amber-500/30 bg-amber-900/10 dark:bg-amber-900/10'
                   } shadow-md hover:shadow-lg`}
        aria-label="System default"
      >
        <Monitor
          className="w-5 h-5"
          style={{ color: theme === 'system' ? '#D97706' : '#FEF3C7' }}
        />
      </motion.button>
    </div>
  );
}
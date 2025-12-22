'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { setUserThemePreference } from '@/lib/theme/userTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Persist to localStorage (Sovereignty mode: Supabase removed)
    setUserThemePreference(newTheme as any);
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
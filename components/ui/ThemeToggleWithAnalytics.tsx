'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { setUserThemePreference } from '@/lib/theme/userTheme';

export default function ThemeToggleWithAnalytics() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Persist to localStorage (Sovereignty mode: Supabase analytics removed)
    setUserThemePreference(newTheme as any);
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
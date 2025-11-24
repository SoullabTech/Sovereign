'use client';

import { ReactNode } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ 
  children, 
  title = 'Soullab Analytics',
  subtitle 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-indigo-600 dark:from-amber-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Add other header controls here */}
          <ThemeToggle />
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
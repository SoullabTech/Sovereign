'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Home, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    platform,
    canPrompt,
    installPWA,
    dismissInstallPrompt,
    shouldShowPrompt,
    getIOSInstallInstructions,
    registerServiceWorker
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  // Show prompt after delay - only on main pages
  useEffect(() => {
    // Only show on specific pages
    const allowedPaths = ['/maya', '/holoflower', '/pwa-test'];
    const currentPath = window.location.pathname;
    const shouldShowOnThisPage = allowedPaths.some(path => currentPath.startsWith(path));

    if (isInstallable && shouldShowPrompt() && !isInstalled && shouldShowOnThisPage) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 15000); // Show after 15 seconds (increased from 5)

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, shouldShowPrompt]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (canPrompt) {
      const installed = await installPWA();
      if (installed) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setShowPrompt(false);
    setShowIOSInstructions(false);
  };

  // Don't render if already installed
  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      {/* Main Install Prompt */}
      {!showIOSInstructions && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-40"
        >
          <div className="bg-gradient-to-br from-amber-600 to-indigo-600 rounded-2xl shadow-2xl p-4 text-white">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <Smartphone className="w-7 h-7" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="font-semibold text-lg mb-1">
                  Install Maya App
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  Get the full experience with instant access, offline support, and no browser bar
                </p>

                {/* Platform-specific benefits */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs backdrop-blur">
                    ✨ Fullscreen
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs backdrop-blur">
                    🚀 Faster
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs backdrop-blur">
                    📱 Home Screen
                  </span>
                </div>

                {/* Install button */}
                <motion.button
                  onClick={handleInstall}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-white text-amber-600 font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg"
                >
                  {isIOS ? (
                    <>
                      <Share className="w-5 h-5" />
                      <span>How to Install</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Install Now</span>
                    </>
                  )}
                </motion.button>

                {/* Dismiss option */}
                <button
                  onClick={handleDismiss}
                  className="w-full text-center text-white/70 text-xs mt-2 hover:text-white transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* iOS Installation Instructions */}
      {showIOSInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Install Maya on iPhone</h3>
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/90 text-sm">
                Follow these simple steps to add Maya to your home screen
              </p>
            </div>

            {/* Instructions */}
            <div className="p-6 space-y-4">
              {getIOSInstallInstructions().steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">
                    {step}
                  </p>
                </motion.div>
              ))}

              {/* Visual hint */}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                  <Share className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Look for this icon in Safari
                  </span>
                </div>
              </div>

              {/* Done button */}
              <button
                onClick={handleDismiss}
                className="w-full bg-gradient-to-r from-amber-600 to-indigo-600 text-white font-medium py-3 rounded-xl mt-4"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
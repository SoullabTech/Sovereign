/**
 * Mobile-First Interface Design
 * Fixes mobile browser overlay issues
 * Properly handles safe areas and viewport heights
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Paperclip, Settings } from 'lucide-react';

interface MobileFirstInterfaceProps {
  onSendMessage: (text: string) => void;
  onVoiceInput: (transcript: string) => void;
  isProcessing?: boolean;
}

export const MobileFirstInterface: React.FC<MobileFirstInterfaceProps> = ({
  onSendMessage,
  onVoiceInput,
  isProcessing = false,
}) => {
  const [message, setMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle viewport height changes (keyboard, browser chrome)
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport API for accurate mobile viewport
      const vh = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(vh);

      // Detect keyboard height
      const documentHeight = document.documentElement.clientHeight;
      const keyboardOffset = documentHeight - vh;
      setKeyboardHeight(keyboardOffset > 0 ? keyboardOffset : 0);
    };

    // Initial setup
    updateViewportHeight();

    // Listen for viewport changes
    window.visualViewport?.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('scroll', updateViewportHeight);
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('scroll', updateViewportHeight);
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  // Handle send message
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.blur(); // Hide keyboard after send
    }
  };

  // Handle enter key (desktop)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Calculate safe area padding
  const getSafeAreaPadding = () => {
    // iOS safe area handling
    const safeAreaBottom = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'
    );

    // Add extra padding for mobile browsers
    const mobileBrowserPadding = 100; // Space for browser UI

    return Math.max(safeAreaBottom, mobileBrowserPadding);
  };

  return (
    <div
      className="flex flex-col relative"
      style={{
        height: `${viewportHeight}px`,
        maxHeight: '100vh',
      }}
    >
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="safe-area-top px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-white">Maya</h1>
            <button
              className="p-2 rounded-lg hover:bg-gray-800"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Sacred Geometry Visual - Centered, scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-none">
        <div className="flex items-center justify-center min-h-full p-8">
          <div className="relative">
            {/* Sacred circles */}
            <div className="w-64 h-64 relative">
              <div className="absolute inset-0 rounded-full border border-dashed border-yellow-600/30" />
              <div className="absolute inset-4 rounded-full border border-dashed border-gray-600/30" />
              <div className="absolute inset-8 rounded-full border border-gray-700/30" />

              {/* Center logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-blue-500/10 flex items-center justify-center">
                  <span className="text-6xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area - ABOVE browser chrome */}
      <div
        className="flex-shrink-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800"
        style={{
          paddingBottom: `${getSafeAreaPadding()}px`,
          marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0',
        }}
      >
        {/* Voice Activated Mode Indicator */}
        {isVoiceActive && (
          <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm text-yellow-300">Voice Activated Mode</span>
            </div>
          </div>
        )}

        {/* Input Container */}
        <div className="px-4 py-3">
          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <button
              className="p-3 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5 text-amber-400" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-2xl
                         border border-gray-700 focus:border-amber-500 focus:outline-none
                         resize-none min-h-[48px] max-h-32"
                rows={1}
                style={{
                  paddingRight: '48px', // Space for mic button
                }}
              />

              {/* Microphone Button (inside input) */}
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors
                  ${isVoiceActive
                    ? 'bg-yellow-500 text-white'
                    : 'hover:bg-gray-700'
                  }`}
                aria-label="Voice input"
              >
                <Mic className={`w-4 h-4 ${isVoiceActive ? 'text-white' : 'text-amber-400'}`} />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || isProcessing}
              className={`p-3 rounded-full transition-all
                ${message.trim() && !isProcessing
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Helper Text */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CSS Variables for Safe Areas
 * Add to global CSS:
 */
export const safeAreaStyles = `
  :root {
    --sat: env(safe-area-inset-top);
    --sar: env(safe-area-inset-right);
    --sab: env(safe-area-inset-bottom);
    --sal: env(safe-area-inset-left);
  }

  .safe-area-top {
    padding-top: var(--sat);
  }

  .safe-area-bottom {
    padding-bottom: var(--sab);
  }

  /* Prevent rubber-band scrolling on iOS */
  body {
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Handle viewport properly */
  #__next, #root {
    height: 100%;
    overflow: hidden;
  }

  /* Fix for mobile browser chrome */
  @supports (height: 100dvh) {
    .mobile-viewport {
      height: 100dvh;
    }
  }

  /* Fallback for older browsers */
  @supports not (height: 100dvh) {
    .mobile-viewport {
      height: 100vh;
      height: -webkit-fill-available;
    }
  }
`;

/**
 * Viewport Meta Tag (add to HTML head)
 */
export const viewportMeta = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
`;

/**
 * Mobile Detection Utilities
 */
export const mobileUtils = {
  // Detect if iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  },

  // Detect if Android
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  // Detect if mobile browser
  isMobile: () => {
    return mobileUtils.isIOS() || mobileUtils.isAndroid() || window.innerWidth < 768;
  },

  // Get safe viewport height
  getSafeViewportHeight: () => {
    const vh = window.visualViewport?.height || window.innerHeight;
    return vh;
  },

  // Handle keyboard visibility
  isKeyboardVisible: () => {
    if (!mobileUtils.isMobile()) return false;

    const threshold = 150; // Height difference threshold
    const windowHeight = window.innerHeight;
    const viewportHeight = window.visualViewport?.height || windowHeight;

    return (windowHeight - viewportHeight) > threshold;
  }
};
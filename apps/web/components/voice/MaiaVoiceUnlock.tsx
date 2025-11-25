'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface MaiaVoiceUnlockProps {
  onAudioUnlocked: () => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

/**
 * Enhanced MAIA Voice Unlock Component for MAIA-PAI
 * Integrates with enhanced Safari audio unlock functionality
 * Must be triggered by user interaction to satisfy autoplay policies
 */
export function MaiaVoiceUnlock({
  onAudioUnlocked,
  onCancel,
  className = ''
}: MaiaVoiceUnlockProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError(null);

    try {
      console.log('🔓 [MaiaVoiceUnlock] Enhanced Safari audio unlock starting...');

      // Enhanced Safari Audio Unlock - Multiple Methods
      console.log('🔓 [MaiaVoiceUnlock] Calling comprehensive onAudioUnlocked()');
      await onAudioUnlocked();

      console.log('✅ [MaiaVoiceUnlock] Enhanced Safari audio unlock succeeded');

      // Additional AudioContext unlock for maximum compatibility
      if (typeof window !== 'undefined') {
        try {
          // @ts-ignore - AudioContext browser compatibility
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const audioContext = new AudioContext();
            if (audioContext.state === 'suspended') {
              console.log('🔓 [MaiaVoiceUnlock] Resuming suspended AudioContext...');
              await audioContext.resume();
              console.log('✅ [MaiaVoiceUnlock] AudioContext resumed successfully');
            }
            audioContext.close();
          }
        } catch (contextError) {
          console.warn('⚠️ [MaiaVoiceUnlock] AudioContext unlock failed (non-critical):', contextError);
        }
      }

    } catch (err) {
      console.error('❌ [MaiaVoiceUnlock] Failed to unlock audio:', err);
      console.error('❌ [MaiaVoiceUnlock] Error details:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        userAgent: navigator.userAgent
      });

      // Enhanced error message with Safari-specific guidance
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      if (isSafari) {
        setError('Safari audio unlock failed. Try refreshing the page or check browser audio settings.');
      } else {
        setError('Failed to enable audio. Please try again.');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-lg border border-purple-200/50 ${className}`}>
      {/* Icon */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-2">
          {error ? (
            <VolumeX className="w-8 h-8 text-white" />
          ) : (
            <Volume2 className="w-8 h-8 text-white" />
          )}
        </div>
        {/* Pulse animation when unlocking */}
        {isUnlocking && (
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-400 animate-ping opacity-75"></div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        Enable MAIA's Voice
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center mb-4 max-w-sm leading-relaxed">
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          <>
            Your browser requires permission to play audio.
            Click below to allow MAIA to speak with you.
          </>
        )}
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleUnlock}
          disabled={isUnlocking}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 font-medium"
        >
          {isUnlocking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enabling...
            </>
          ) : error ? (
            'Try Again'
          ) : (
            'Enable Voice'
          )}
        </Button>

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUnlocking}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Safari-specific note */}
      <p className="text-xs text-gray-500 mt-3 text-center opacity-75">
        Required for Safari and other privacy-focused browsers
      </p>
    </div>
  );
}

export default MaiaVoiceUnlock;
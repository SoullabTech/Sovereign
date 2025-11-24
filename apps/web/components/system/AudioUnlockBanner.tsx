'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { unlockAudio, isAudioUnlocked } from '@/lib/audio/audioUnlock';

export function AudioUnlockBanner() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner is disabled in development or by default
    if (process.env.NEXT_PUBLIC_DISABLE_AUDIO_BANNER === 'true' || process.env.NODE_ENV === 'development') {
      return; // Skip banner setup - disabled by default
    }
    // Check if audio is already unlocked
    const checkStatus = () => {
      const unlocked = isAudioUnlocked();
      setIsUnlocked(unlocked);
      setIsVisible(!unlocked); // Show banner only if NOT unlocked
    };

    checkStatus();
    
    // Listen for unlock events
    const handleUnlock = () => {
      setIsUnlocked(true);
      setIsVisible(false);
    };

    window.addEventListener('audio-unlocked', handleUnlock);
    
    // Also check after any user interaction
    const handleInteraction = () => {
      setTimeout(checkStatus, 100);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('audio-unlocked', handleUnlock);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const handleUnlock = async () => {
    try {
      await unlockAudio();
      setIsUnlocked(true);
      
      // Fade out and hide
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('audio-unlocked'));
      
      // Play a subtle chime to confirm
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi+I0fPTgjMGHm7A7+OZURE');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if this also fails
      
    } catch (error) {
      console.error('Failed to unlock audio:', error);
    }
  };

  // Check if banner is disabled in development or by default
  if (process.env.NEXT_PUBLIC_DISABLE_AUDIO_BANNER === 'true' || process.env.NODE_ENV === 'development' || !isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[8000]
        bg-soul-surface/80 backdrop-blur-md border border-soul-accent/30
        text-soul-textPrimary px-6 py-3 rounded-lg shadow-lg
        flex items-center gap-3 cursor-pointer
        hover:bg-soul-surface/90 hover:border-soul-accent/50 transition-all duration-300
        animate-in slide-in-from-top duration-500
        ${isUnlocked ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
      onClick={handleUnlock}
    >
      <div className="animate-pulse">
        {isUnlocked ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </div>
      <div>
        <div className="font-medium text-sm">
          {isUnlocked ? '✨ Voice Awakened' : '🎧 Awaken Voice'}
        </div>
        <div className="text-xs text-soul-textSecondary">
          {isUnlocked ? 'Sacred dialogue enabled' : 'Click to enable audio responses'}
        </div>
      </div>
    </div>
  );
}
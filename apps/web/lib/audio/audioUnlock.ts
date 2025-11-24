/**
 * Audio unlock utility for autoplay policy compliance
 * Unlocks audio context on first user interaction
 */

import { trackAudioUnlock } from '@/lib/analytics/eventTracking';

let audioUnlocked = false;
let toastShown = false;

export async function unlockAudio(showToast?: (message: string, options?: { type?: 'info' | 'success' | 'warning' | 'error' }) => void): Promise<boolean> {
  // Skip on server-side
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if already unlocked
  if (audioUnlocked || localStorage.getItem('mayaAudioUnlocked') === '1') {
    audioUnlocked = true;
    return true;
  }

  try {
    // Create audio context and play silent buffer
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('AudioContext not supported');
      
      // Track unsupported browser
      await trackAudioUnlock(false, {
        error: 'AudioContext not supported',
        timestamp: Date.now()
      });
      
      if (showToast) {
        showToast('⚠️ Audio not supported in this browser', { type: 'warning' });
      }
      return false;
    }

    const ctx = new AudioContext();
    
    // Safari/Firefox/iOS Safari specific handling
    if (ctx.state === 'suspended') {
      console.log('⚠️ [Audio] Context suspended, attempting resume...');
      try {
        await ctx.resume();
        console.log('✅ [Audio] Context resumed successfully');
      } catch (resumeError) {
        console.warn('❌ [Audio] Failed to resume context:', resumeError);
        
        // Safari/iOS often needs a second tap
        if (showToast && !toastShown) {
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          if (isSafari || isIOS) {
            showToast('🔈 Tap the mic again to enable Maia\'s voice', { type: 'info' });
          } else {
            showToast('⚠️ Audio blocked by your browser. Please check settings.', { type: 'warning' });
          }
          toastShown = true;
        }
        
        // Track resume failure
        await trackAudioUnlock(false, {
          error: 'Context resume failed',
          contextState: ctx.state,
          timestamp: Date.now()
        });
        
        return false;
      }
    }

    // Create and play silent buffer
    const silence = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = silence;
    src.connect(ctx.destination);
    src.start(0);

    // Double-check context state after starting (Edge quirk)
    if (ctx.state === 'suspended') {
      console.log('⚠️ [Audio] Context still suspended after start, forcing resume...');
      await ctx.resume();
    }

    // Mark as unlocked
    audioUnlocked = true;
    localStorage.setItem('mayaAudioUnlocked', '1');
    
    console.log('🔓 [Audio] Context unlocked successfully');
    console.log(`   State: ${ctx.state}`);
    console.log(`   Sample Rate: ${ctx.sampleRate}`);
    
    // Track successful audio unlock with detailed info
    await trackAudioUnlock(true, {
      contextState: ctx.state,
      sampleRate: ctx.sampleRate,
      timestamp: Date.now()
    });
    
    // Show graceful toast notification (only once per session)
    if (showToast && !toastShown) {
      showToast("🔓 Maia's voice unlocked — you'll now hear her replies", { type: 'success' });
      toastShown = true;
    }
    
    return true;
  } catch (error) {
    console.warn('❌ [Audio] Unlock failed:', error);
    
    // Track failed audio unlock with detailed error
    await trackAudioUnlock(false, {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    });
    
    // Show appropriate error message
    if (showToast && !toastShown) {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isSafari || isIOS) {
        showToast('🔈 Tap the mic again to enable Maia\'s voice', { type: 'info' });
      } else {
        showToast('⚠️ Audio blocked. Please check browser settings.', { type: 'warning' });
      }
      toastShown = true;
    }
    
    return false;
  }
}

export function isAudioUnlocked(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side default
  }
  return audioUnlocked || localStorage.getItem('mayaAudioUnlocked') === '1';
}

export function resetAudioUnlock(): void {
  audioUnlocked = false;
  toastShown = false;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mayaAudioUnlocked');
  }
}

// Auto-unlock on any user interaction
let unlockListenersAdded = false;

export function addAutoUnlockListeners(): void {
  if (unlockListenersAdded || typeof window === 'undefined') return;
  
  const unlockHandler = () => {
    unlockAudio();
    // Remove listeners after first unlock
    document.removeEventListener('click', unlockHandler);
    document.removeEventListener('touchstart', unlockHandler);
    document.removeEventListener('keydown', unlockHandler);
  };

  document.addEventListener('click', unlockHandler, { passive: true });
  document.addEventListener('touchstart', unlockHandler, { passive: true });
  document.addEventListener('keydown', unlockHandler, { passive: true });
  
  unlockListenersAdded = true;
}
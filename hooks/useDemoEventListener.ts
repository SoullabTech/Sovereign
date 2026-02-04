/**
 * Demo Event Listener Hook
 *
 * Listens for demo orchestration events and triggers UI state changes.
 * Used in OracleConversation to show Capture/Breakthrough popups during demos.
 *
 * @see lib/demo/demoOrchestrator.ts
 */

import { useEffect, useCallback } from 'react';
import { isDemoMode, type DemoUIEvent } from '@/lib/demo/demoOrchestrator';

export interface DemoEventHandlers {
  onShowCapture?: (data?: Record<string, unknown>) => void;
  onShowBreakthrough?: (data?: Record<string, unknown>) => void;
  onShowPatternOffering?: (data?: Record<string, unknown>) => void;
  onHideAll?: () => void;
  onPulseHoloflower?: () => void;
}

/**
 * Hook to listen for demo orchestration events
 *
 * @example
 * useDemoEventListener({
 *   onShowCapture: () => setShowCapturePanel(true),
 *   onShowBreakthrough: () => setShowJournalSuggestion(true),
 *   onHideAll: () => {
 *     setShowCapturePanel(false);
 *     setShowJournalSuggestion(false);
 *   },
 * });
 */
export function useDemoEventListener(handlers: DemoEventHandlers): void {
  const handleDemoEvent = useCallback(
    (eventType: DemoUIEvent, data?: Record<string, unknown>) => {
      console.log(`🎬 [Demo] Received event: ${eventType}`, data);

      switch (eventType) {
        case 'demo:show-capture':
          handlers.onShowCapture?.(data);
          break;
        case 'demo:show-breakthrough':
          handlers.onShowBreakthrough?.(data);
          break;
        case 'demo:show-pattern-offering':
          handlers.onShowPatternOffering?.(data);
          break;
        case 'demo:hide-all':
          handlers.onHideAll?.();
          break;
        case 'demo:pulse-holoflower':
          handlers.onPulseHoloflower?.();
          break;
      }
    },
    [handlers]
  );

  useEffect(() => {
    // Only listen in demo mode
    if (!isDemoMode()) return;

    const eventTypes: DemoUIEvent[] = [
      'demo:show-capture',
      'demo:show-breakthrough',
      'demo:show-pattern-offering',
      'demo:hide-all',
      'demo:pulse-holoflower',
    ];

    const listeners = eventTypes.map((eventType) => {
      const listener = (e: Event) => {
        const customEvent = e as CustomEvent;
        handleDemoEvent(eventType, customEvent.detail);
      };
      window.addEventListener(eventType, listener);
      return { eventType, listener };
    });

    console.log('🎬 [Demo] Event listeners registered');

    return () => {
      for (const { eventType, listener } of listeners) {
        window.removeEventListener(eventType, listener);
      }
      console.log('🎬 [Demo] Event listeners removed');
    };
  }, [handleDemoEvent]);
}

/**
 * Simple hook to check if we're in demo mode
 */
export function useIsDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return isDemoMode();
}

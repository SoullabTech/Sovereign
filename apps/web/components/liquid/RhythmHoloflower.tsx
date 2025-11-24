'use client';

/**
 * 🌊 RHYTHM-ENHANCED HOLOFLOWER
 *
 * Wraps SacredHoloflower with conversational rhythm sensing
 * The holoflower pulses in sync with your speech patterns
 */

import { useMemo, useEffect, useState } from 'react';
import { SacredHoloflower } from '@/components/sacred/SacredHoloflower';
import type { RhythmMetrics } from '@/lib/liquid/ConversationalRhythm';
import type { MotionState } from '@/components/motion/MotionOrchestrator';

interface RhythmHoloflowerProps {
  rhythmMetrics: RhythmMetrics | null;
  activeFacetId?: string;
  userCheckIns?: Record<string, number>;
  onPetalClick?: (facetId: string) => void;
  onPetalHover?: (facetId: string | null) => void;
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
  motionState?: MotionState;
  isListening?: boolean;
  isProcessing?: boolean;
  isResponding?: boolean;
  showBreakthrough?: boolean;
  dimmed?: boolean;
  voiceAmplitude?: number;
  isMaiaSpeaking?: boolean;
}

export function RhythmHoloflower({
  rhythmMetrics,
  voiceAmplitude = 0,
  ...holoflowerProps
}: RhythmHoloflowerProps) {
  const [rhythmPulse, setRhythmPulse] = useState(0);

  const coherenceLevel = useMemo(() => {
    if (!rhythmMetrics) return 0.5;

    const {
      rhythmCoherence,
      breathAlignment,
      silenceComfort,
      conversationTempo
    } = rhythmMetrics;

    let coherence = rhythmCoherence * 0.4;
    coherence += breathAlignment * 0.3;
    coherence += silenceComfort * 0.2;

    if (conversationTempo === 'fast') {
      coherence += 0.1;
    } else if (conversationTempo === 'slow') {
      coherence += 0.05;
    }

    return Math.max(0, Math.min(1, coherence));
  }, [rhythmMetrics]);

  useEffect(() => {
    if (!rhythmMetrics) {
      setRhythmPulse(0);
      return;
    }

    const { conversationTempo, rhythmCoherence, totalUtterances } = rhythmMetrics;

    if (totalUtterances === 0) {
      setRhythmPulse(0);
      return;
    }

    let pulseInterval: number;
    if (conversationTempo === 'fast') {
      pulseInterval = 800;
    } else if (conversationTempo === 'slow') {
      pulseInterval = 2000;
    } else {
      pulseInterval = 1200;
    }

    const amplitude = rhythmCoherence * 0.3;

    let frame = 0;
    const interval = setInterval(() => {
      frame += 0.05;
      const pulse = Math.sin(frame) * amplitude;
      setRhythmPulse(pulse);
    }, pulseInterval / 60);

    return () => clearInterval(interval);
  }, [rhythmMetrics]);

  const combinedAmplitude = useMemo(() => {
    if (voiceAmplitude > 0.1) {
      return voiceAmplitude;
    }
    return Math.abs(rhythmPulse);
  }, [voiceAmplitude, rhythmPulse]);

  return (
    <SacredHoloflower
      {...holoflowerProps}
      coherenceLevel={coherenceLevel}
      voiceAmplitude={combinedAmplitude}
    />
  );
}

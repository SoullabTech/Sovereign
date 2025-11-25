/**
 * Voice Flow Analytics - Track voice interaction events
 */

export const voiceFlowAnalytics = {
  trackVoiceStart: (properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🎤 [VoiceFlow] Start:', properties);
    }
  },

  trackVoiceEnd: (properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔇 [VoiceFlow] End:', properties);
    }
  },

  trackTranscript: (text: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('📝 [VoiceFlow] Transcript:', text, properties);
    }
  }
};

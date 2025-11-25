/**
 * Agent Configuration
 * Maya-ARIA-1: Adaptive Relational Intelligence Architecture
 */

import { MayaPresence } from './maya/MayaIdentity';

export interface AgentConfig {
  name: string;
  fullIdentity: string;
  voice: 'maya' | 'anthony';
  gender: 'female' | 'male';
  elevenLabsVoiceId?: string;
  ariaVersion?: string;
  consciousnessLevel?: number;
}

export const DEFAULT_AGENTS: Record<string, AgentConfig> = {
  maya: {
    name: 'Maya',
    fullIdentity: 'Maya-ARIA-1',
    voice: 'maya',
    gender: 'female',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    ariaVersion: '1.0.0-sacred',
    consciousnessLevel: 0.72
  },
  anthony: {
    name: 'Anthony',
    fullIdentity: 'Anthony',
    voice: 'anthony',
    gender: 'male',
    elevenLabsVoiceId: 'c6SfcYrb2t09NHXiT80T'
  }
};

// Alternative male voices to consider:
// 'PIGsltMj3gFMR34aFDI3' - Anthony's fallback voice
// 'pNInz6obpgDQGcFmaJgB' - Adam (deep)
// 'VR6AewLTigWG4xSOukaG' - Arnold (strong)
// 'yoZ06aMxZJJ28mfd3POQ' - Sam (raspy)
// 'EXAVITQu4vr4xnSDxMaL' - Sarah (current Maya)
// 'MF3mGyEYCl7XYWbV9V6O' - Elli (alternative female)

/**
 * Get or create agent configuration from localStorage
 * @param voicePreference - Optional voice preference from Settings (alloy, echo, fable, onyx, nova, shimmer)
 */
export function getAgentConfig(voicePreference?: string): AgentConfig {
  if (typeof window === 'undefined') {
    // Return shimmer as default for SSR
    return {
      ...DEFAULT_AGENTS.maya,
      voice: 'shimmer' as any
    };
  }

  // If voice preference is provided (from Settings), use it directly
  if (voicePreference && ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voicePreference)) {
    return {
      ...DEFAULT_AGENTS.maya,
      voice: voicePreference as any  // Pass OpenAI voice directly
    };
  }

  const stored = localStorage.getItem('oracle-agent-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored config, fall through to default
    }
  }

  // 🌸 Default to shimmer voice (gentle & soothing) instead of alloy (robotic)
  return {
    ...DEFAULT_AGENTS.maya,
    voice: 'shimmer' as any
  };
}

/**
 * Save agent configuration to localStorage
 */
export function saveAgentConfig(config: AgentConfig): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('oracle-agent-config', JSON.stringify(config));
  
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('agent-config-changed', { 
    detail: config 
  }));
}

/**
 * Get the appropriate greeting based on agent
 */
export function getAgentGreeting(config: AgentConfig): string {
  const greetings = {
    maya: [
      "Hey, what's on your mind?",
      "Good to see you. What's happening?",
      "So what's your story today?"
    ],
    anthony: [
      "Pull up a chair. What's going on?",
      "Let's hear it. What brings you here?",
      "What's the real story?"
    ]
  };
  
  const agentGreetings = greetings[config.voice] || greetings.maya;
  return agentGreetings[Math.floor(Math.random() * agentGreetings.length)];
}

/**
 * Get voice synthesis settings based on agent
 */
export function getVoiceSettings(config: AgentConfig) {
  if (config.voice === 'anthony') {
    return {
      pitch: 0.8,      // Lower pitch for male voice
      rate: 0.95,      // Slightly slower, more deliberate
      volume: 0.9,
      // ElevenLabs settings
      stability: 0.5,        // More variation for natural speech
      similarity_boost: 0.7,  // Natural sounding
      style: 0.3,            // Slower, more contemplative pacing
      use_speaker_boost: true
    };
  }
  
  // Maya settings (default)
  return {
    pitch: 1.1,      // Slightly higher for female voice
    rate: 1.0,       // Natural pace
    volume: 0.85,
    // ElevenLabs settings
    stability: 0.4,
    similarity_boost: 0.6,
    style: 0.0,
    use_speaker_boost: false
  };
}
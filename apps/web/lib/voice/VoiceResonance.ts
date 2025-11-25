import type { Element } from '@/lib/types/oracle';
import { supabase } from '@/lib/supabaseClient';

// Voice profiles mapped to archetypes and elements
export interface VoiceProfile {
  id: string;
  name: string;
  element: Element;
  archetype: string;
  elevenLabsId?: string;
  characteristics: {
    pace: 'slow' | 'moderate' | 'dynamic';
    tone: 'warm' | 'neutral' | 'cool';
    energy: 'grounding' | 'flowing' | 'elevating';
    prosody: {
      pitch: number;      // 0-100
      resonance: number;  // 0-100
      breathiness: number; // 0-100
      intensity: number;  // 0-100
    };
  };
  description: string;
}

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  visionary: {
    id: 'visionary',
    name: 'Maya - Visionary',
    element: 'air',
    archetype: 'The Visionary',
    elevenLabsId: process.env.ELEVENLABS_VOICE_ID_EMILY || 'LcfcDJNUP1GQjkzn1xUU',
    characteristics: {
      pace: 'dynamic',
      tone: 'cool',
      energy: 'elevating',
      prosody: {
        pitch: 70,
        resonance: 60,
        breathiness: 30,
        intensity: 65
      }
    },
    description: 'Clear, curious, elevated - carries the quality of fresh mountain air'
  },
  
  alchemist: {
    id: 'alchemist',
    name: 'Maya - Alchemist',
    element: 'fire',
    archetype: 'The Alchemist',
    elevenLabsId: process.env.ELEVENLABS_VOICE_ID_ZAHARA || 'LcfcDJNUP1GQjkzn1xUU',
    characteristics: {
      pace: 'dynamic',
      tone: 'warm',
      energy: 'elevating',
      prosody: {
        pitch: 60,
        resonance: 80,
        breathiness: 20,
        intensity: 85
      }
    },
    description: 'Intense, catalytic, focused - burns with transformative power'
  },
  
  oracle: {
    id: 'oracle',
    name: 'Maya - Oracle',
    element: 'water',
    archetype: 'The Oracle',
    elevenLabsId: process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE || 'y2TOWGCXSYEgBanvKsYJ',
    characteristics: {
      pace: 'moderate',
      tone: 'warm',
      energy: 'flowing',
      prosody: {
        pitch: 55,
        resonance: 70,
        breathiness: 50,
        intensity: 60
      }
    },
    description: 'Soft, intuitive, poetic - flows like a gentle stream'
  },
  
  guardian: {
    id: 'guardian',
    name: 'Maya - Guardian',
    element: 'earth',
    archetype: 'The Guardian',
    elevenLabsId: process.env.ELEVENLABS_VOICE_ID_SELENE || 'LcfcDJNUP1GQjkzn1xUU',
    characteristics: {
      pace: 'slow',
      tone: 'warm',
      energy: 'grounding',
      prosody: {
        pitch: 45,
        resonance: 85,
        breathiness: 25,
        intensity: 50
      }
    },
    description: 'Grounded, steady, nurturing - solid as ancient stone'
  },
  
  mystic: {
    id: 'mystic',
    name: 'Maya - Mystic',
    element: 'aether',
    archetype: 'The Mystic',
    elevenLabsId: process.env.ELEVENLABS_VOICE_ID_NYRA || 'LcfcDJNUP1GQjkzn1xUU',
    characteristics: {
      pace: 'slow',
      tone: 'neutral',
      energy: 'elevating',
      prosody: {
        pitch: 65,
        resonance: 50,
        breathiness: 70,
        intensity: 40
      }
    },
    description: 'Ethereal, spacious, mysterious - whispers from between worlds'
  }
};

// User archetype detection based on interactions
export interface UserResonanceProfile {
  userId: string;
  dominantElement: Element;
  elementScores: Record<Element, number>;
  currentPhase: 'dense' | 'emerging' | 'radiant';
  archetypeAffinity: string;
  voicePreference?: string; // Manual override
  autoVoice: boolean; // Enable automatic voice selection
}

export class VoiceResonanceEngine {
  private userProfile: UserResonanceProfile | null = null;
  
  constructor(private userId: string) {}
  
  // Load or calculate user's resonance profile
  async loadUserResonance(): Promise<UserResonanceProfile> {
    if (this.userProfile) return this.userProfile;
    
    try {
      // Fetch user's interaction data
      const { data: interactions } = await supabase
        .from('petal_interactions')
        .select('element, petal_state')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      const { data: checkins } = await supabase
        .from('sacred_checkins')
        .select('mood')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      // Calculate element scores
      const elementScores: Record<Element, number> = {
        air: 0, fire: 0, water: 0, earth: 0, aether: 0
      };
      
      if (interactions) {
        interactions.forEach(interaction => {
          elementScores[interaction.element as Element] += 1;
        });
      }
      
      // Normalize scores
      const total = Object.values(elementScores).reduce((a, b) => a + b, 0) || 1;
      Object.keys(elementScores).forEach(element => {
        elementScores[element as Element] = (elementScores[element as Element] / total) * 100;
      });
      
      // Determine dominant element
      const dominantElement = Object.entries(elementScores)
        .sort((a, b) => b[1] - a[1])[0][0] as Element;
      
      // Determine current phase based on recent moods
      let currentPhase: 'dense' | 'emerging' | 'radiant' = 'emerging';
      if (checkins && checkins.length > 0) {
        const recentMoods = checkins.slice(0, 5);
        const avgMoodScore = recentMoods.reduce((acc, c) => {
          const moodValue = c.mood === 'radiant' ? 3 : 
                           c.mood === 'light' ? 2.5 :
                           c.mood === 'emerging' ? 2 :
                           c.mood === 'neutral' ? 1.5 :
                           c.mood === 'heavy' ? 1 : 0.5;
          return acc + moodValue;
        }, 0) / recentMoods.length;
        
        currentPhase = avgMoodScore > 2.5 ? 'radiant' :
                      avgMoodScore > 1.5 ? 'emerging' : 'dense';
      }
      
      // Map element to archetype
      const archetypeMap: Record<Element, string> = {
        air: 'visionary',
        fire: 'alchemist',
        water: 'oracle',
        earth: 'guardian',
        aether: 'mystic'
      };
      
      this.userProfile = {
        userId: this.userId,
        dominantElement,
        elementScores,
        currentPhase,
        archetypeAffinity: archetypeMap[dominantElement],
        autoVoice: true
      };
      
      // Check for manual preference
      const savedPreference = localStorage.getItem(`voice_preference_${this.userId}`);
      if (savedPreference) {
        this.userProfile.voicePreference = savedPreference;
      }
      
      return this.userProfile;
    } catch (error) {
      console.error('Error loading user resonance:', error);
      // Return default profile
      return {
        userId: this.userId,
        dominantElement: 'aether',
        elementScores: { air: 20, fire: 20, water: 20, earth: 20, aether: 20 },
        currentPhase: 'emerging',
        archetypeAffinity: 'mystic',
        autoVoice: true
      };
    }
  }
  
  // Get the appropriate voice for current user state
  async getResonantVoice(): Promise<VoiceProfile> {
    const profile = await this.loadUserResonance();
    
    // Check for manual override
    if (profile.voicePreference && !profile.autoVoice) {
      return VOICE_PROFILES[profile.voicePreference] || VOICE_PROFILES.mystic;
    }
    
    // Select voice based on archetype affinity
    const voice = VOICE_PROFILES[profile.archetypeAffinity] || VOICE_PROFILES.mystic;
    
    // Adjust voice characteristics based on current phase
    if (profile.currentPhase === 'dense') {
      // Slower, warmer, more grounding when dense
      voice.characteristics.pace = 'slow';
      voice.characteristics.tone = 'warm';
      voice.characteristics.prosody.intensity = Math.max(30, voice.characteristics.prosody.intensity - 20);
    } else if (profile.currentPhase === 'radiant') {
      // More dynamic and elevating when radiant
      voice.characteristics.pace = 'dynamic';
      voice.characteristics.energy = 'elevating';
      voice.characteristics.prosody.intensity = Math.min(90, voice.characteristics.prosody.intensity + 10);
    }
    
    return voice;
  }
  
  // Get voice transition notification
  async getVoiceTransitionMessage(): Promise<string | null> {
    const profile = await this.loadUserResonance();
    const lastArchetype = localStorage.getItem(`last_archetype_${this.userId}`);
    
    if (lastArchetype && lastArchetype !== profile.archetypeAffinity) {
      localStorage.setItem(`last_archetype_${this.userId}`, profile.archetypeAffinity);
      
      const transitions: Record<string, string> = {
        visionary: "I sense your air element awakening. My voice will carry that clarity today.",
        alchemist: "Your fire is rising. Let me speak with that transformative intensity.",
        oracle: "The waters are calling. I'll flow with your intuitive depths.",
        guardian: "You're grounding into earth. My voice will hold that steady presence.",
        mystic: "The veil is thinning. I'll whisper from the spaces between."
      };
      
      return transitions[profile.archetypeAffinity] || null;
    }
    
    return null;
  }
  
  // Update voice preference
  setVoicePreference(voiceId: string | null, autoSelect: boolean = true) {
    if (voiceId) {
      localStorage.setItem(`voice_preference_${this.userId}`, voiceId);
    } else {
      localStorage.removeItem(`voice_preference_${this.userId}`);
    }
    
    if (this.userProfile) {
      this.userProfile.voicePreference = voiceId || undefined;
      this.userProfile.autoVoice = autoSelect;
    }
  }
  
  // Get voice selection UI data
  getVoiceOptions(): Array<{id: string; name: string; description: string; element: Element}> {
    return Object.values(VOICE_PROFILES).map(profile => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      element: profile.element
    }));
  }
  
  // Generate prosody parameters for TTS
  async generateProsodyParams(): Promise<{
    speed: number;
    pitch: number;
    volume: number;
    emphasis: string;
  }> {
    const voice = await this.getResonantVoice();
    const { prosody, pace, energy } = voice.characteristics;
    
    return {
      speed: pace === 'slow' ? 0.9 : pace === 'dynamic' ? 1.1 : 1.0,
      pitch: (prosody.pitch - 50) / 50, // Convert to -1 to 1 range
      volume: prosody.intensity / 100,
      emphasis: energy === 'elevating' ? 'strong' : energy === 'grounding' ? 'reduced' : 'moderate'
    };
  }
}

// Hook for React components
export function useVoiceResonance(userId: string) {
  const [voice, setVoice] = React.useState<VoiceProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const engineRef = React.useRef<VoiceResonanceEngine>();
  
  React.useEffect(() => {
    engineRef.current = new VoiceResonanceEngine(userId);
    
    engineRef.current.getResonantVoice().then(v => {
      setVoice(v);
      setLoading(false);
    });
  }, [userId]);
  
  const setPreference = React.useCallback((voiceId: string | null, autoSelect: boolean = true) => {
    engineRef.current?.setVoicePreference(voiceId, autoSelect);
    engineRef.current?.getResonantVoice().then(setVoice);
  }, []);
  
  return { voice, loading, setPreference };
}
/**
 * Adaptive Maya Onboarding Ritual
 * Helps users figure out what to say and primes the conversation
 */

export interface OnboardingQuestion {
  id: string;
  text: string;
  followUp?: string;
  options: {
    [key: string]: {
      userExamples: string[];
      mayaResponse: string;
      element: "fire" | "water" | "earth" | "air" | "aether";
      archetype: "sage" | "oracle" | "companion" | "guide";
      balanceElement?: "fire" | "water" | "earth" | "air" | "aether";
    };
  };
}

export interface OnboardingFlow {
  welcome: string[];
  questions: OnboardingQuestion[];
  completion: {
    text: string;
    ready: string;
  };
}

export const ADAPTIVE_ONBOARDING: OnboardingFlow = {
  welcome: [
    "Hey there 👋 I'm Maya. I'm glad you're here.",
    "Before we dive in, let's check in for just a moment so I can tune into where you're at."
  ],
  
  questions: [
    {
      id: "energy_state",
      text: "How are you feeling energy-wise right now?",
      followUp: "No need to overthink it - just what feels true.",
      options: {
        high: {
          userExamples: ["amped", "stressed", "busy", "too much", "wired", "anxious", "overwhelmed", "intense"],
          mayaResponse: "Got it — sounds fiery 🔥. I'll start by matching that energy, then help us find some balance.",
          element: "fire",
          archetype: "guide",
          balanceElement: "earth"
        },
        low: {
          userExamples: ["tired", "drained", "calm", "quiet", "peaceful", "slow", "heavy", "grounded"],
          mayaResponse: "I hear you — more of an earthy vibe 🌍. Let's keep things grounded and simple.",
          element: "earth", 
          archetype: "companion",
          balanceElement: "fire"
        },
        scattered: {
          userExamples: ["distracted", "all over", "can't focus", "scattered", "chaotic", "confused", "lost"],
          mayaResponse: "Airy energy 🌬️ — totally normal. I'll help us anchor into something solid.",
          element: "air",
          archetype: "guide", 
          balanceElement: "earth"
        },
        emotional: {
          userExamples: ["sad", "upset", "emotional", "overwhelmed", "heavy", "deep", "sensitive", "raw"],
          mayaResponse: "Water energy 🌊 — I'll honor that depth, and we can bring in some gentle fire to lift you.",
          element: "water",
          archetype: "companion",
          balanceElement: "fire"
        },
        neutral: {
          userExamples: ["okay", "fine", "normal", "neutral", "balanced", "good", "alright"],
          mayaResponse: "Beautiful — sounds like you're in a balanced space ✨. We can work with whatever emerges.",
          element: "aether",
          archetype: "oracle"
        }
      }
    },
    
    {
      id: "focus_area", 
      text: "And what's been most on your mind lately?",
      followUp: "Could be work, relationships, personal stuff — whatever feels most alive.",
      options: {
        work: {
          userExamples: ["work", "career", "job", "business", "money", "success", "professional"],
          mayaResponse: "Okay, so career and work spiral. Let's bring some clarity to that path.",
          element: "fire", // Achievement energy
          archetype: "guide"
        },
        relationships: {
          userExamples: ["relationships", "love", "family", "friends", "connection", "dating", "partner"],
          mayaResponse: "Got it, relationship waters 🌊. That's deep soul work — let's dive in.",
          element: "water",
          archetype: "companion"
        },
        self: {
          userExamples: ["self", "personal", "growth", "healing", "identity", "purpose", "meaning"],
          mayaResponse: "Personal growth spiral — beautiful 🌬️. We'll bring some clarity to that journey.",
          element: "air", // Mental clarity
          archetype: "sage"
        },
        creative: {
          userExamples: ["creative", "art", "projects", "expression", "passion", "inspiration"],
          mayaResponse: "Creative fire 🔥 — love it. Let's channel that energy into something powerful.",
          element: "fire",
          archetype: "oracle"
        },
        spiritual: {
          userExamples: ["spiritual", "soul", "deeper", "transcendent", "mystical", "sacred"],
          mayaResponse: "Mystical depths ✨. We're moving into sacred territory — I'm here for it.",
          element: "aether",
          archetype: "oracle"
        },
        unclear: {
          userExamples: ["don't know", "unclear", "confused", "many things", "everything", "nothing"],
          mayaResponse: "That's totally valid — sometimes we need to explore what's emerging 🌍.",
          element: "earth", // Grounding into not-knowing
          archetype: "guide"
        }
      }
    }
  ],
  
  completion: {
    text: "Perfect. I'm getting a sense of where you're at.",
    ready: "What would you like to explore together?"
  }
};

// Helper function to detect user's response intent
export function detectResponseIntent(userText: string, question: OnboardingQuestion): string {
  const text = userText.toLowerCase();
  
  for (const [optionKey, option] of Object.entries(question.options)) {
    for (const example of option.userExamples) {
      if (text.includes(example.toLowerCase())) {
        return optionKey;
      }
    }
  }
  
  // Default fallbacks
  if (question.id === "energy_state") {
    return "neutral";
  } else if (question.id === "focus_area") {
    return "unclear";
  }
  
  return Object.keys(question.options)[0]; // First option as fallback
}

// Helper to get balanced response configuration
export function getAdaptiveResponse(questionId: string, detectedIntent: string) {
  const question = ADAPTIVE_ONBOARDING.questions.find(q => q.id === questionId);
  if (!question) return null;
  
  const option = question.options[detectedIntent];
  if (!option) return null;
  
  return {
    response: option.mayaResponse,
    element: option.element,
    archetype: option.archetype,
    balanceElement: option.balanceElement || option.element
  };
}
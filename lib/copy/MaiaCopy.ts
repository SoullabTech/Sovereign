/**
 * Centralized tone-aware UI copy module for MAIA
 * Maintains warm, human-centered language throughout the experience
 */

export const Copy = {
  welcome: "Welcome to Soulful Journaling",
  introPrompt: "What's been on your mind lately?",

  buttons: {
    startJournaling: "🌀 Start Journaling",
    whatIsMaia: "✨ What does MAIA do?",
    tryVoice: "🎙️ Try Voice Journaling",
    select: "Select",
    maybeLater: "Maybe later",
    complete: "Complete & Reflect",
    pause: "Pause",
    resume: "Continue",
    cancel: "Not now"
  },

  modal: {
    whatIsMaiaTitle: "What does MAIA do?",
    whatIsMaiaText: "MAIA helps you notice patterns—recurring words, emotions, and themes across your entries. She reflects these back, helping you understand your story over time."
  },

  reflection: {
    title: "MAIA's Reflection",
    saved: "This entry has been saved.",
    symbols: "Symbols detected:",
    archetype: "Theme:",
    emotion: "Emotion:",
    viewTimeline: "Want to see how this shows up over time?",
    viewTimelineCTA: "View Timeline →",
    analyzing: "MAIA is reflecting on your words...",
    complete: "Your voice has been heard."
  },

  help: {
    title: "Help Menu",
    whatIsJournaling: "What is Soulful Journaling?",
    howModesWork: "How do the 5 modes work?",
    aboutPatterns: "Understanding patterns",
    usingVoice: "Using voice journaling",
    export: "Export to Obsidian",
    faq: "FAQ"
  },

  milestones: {
    firstEntry: "🌀 You've started your journey.",
    threeEntries: "📊 Timeline view unlocked.",
    voiceEntry: "🎙️ Voice journaling now available.",
    tenEntries: "✨ You've built a practice. Try search to explore your patterns."
  },

  voice: {
    readyToListen: "I'm listening...",
    tapToStart: "Tap to start speaking",
    speaking: "Speak your truth",
    paused: "Take your time",
    processing: "One moment...",
    pauseHint: 'Say "pause" or "give me a moment"',
    resumeHint: 'Say "okay" or "I\'m ready" to continue',
    wordCount: (count: number) => `${count} words`,
    duration: (mins: number, secs: number) => `${mins}:${secs.toString().padStart(2, '0')}`
  },

  modes: {
    freewrite: {
      name: "Freewrite",
      description: "Stream of consciousness. No structure—just what wants to emerge.",
      prompt: "What part of your story wants to be spoken today?",
      hint: "Let your thoughts flow without editing"
    },
    dream: {
      name: "Dream Journal",
      description: "Explore the symbolic language of your dreams and unconscious.",
      prompt: "Tell me about the dream that is lingering with you...",
      hint: "Describe the images, feelings, and symbols"
    },
    emotional: {
      name: "Emotional Check-in",
      description: "Name, hold, and process emotions with compassion.",
      prompt: "What emotion is asking for your attention right now?",
      hint: "Notice what you're feeling without judgment"
    },
    shadow: {
      name: "Shadow Work",
      description: "Explore hidden aspects, tensions, or uncomfortable truths gently.",
      prompt: "What part of yourself are you ready to look at more honestly?",
      hint: "Approach this with gentleness and curiosity"
    },
    direction: {
      name: "Direction Setting",
      description: "Clarify intentions, decisions, or next steps.",
      prompt: "Where does your soul want to go next?",
      hint: "What feels true for you right now?"
    }
  },

  timeline: {
    noSessions: "Your journey begins here",
    noSessionsHint: "Start your first session to begin discovering patterns",
    noResults: "No entries match your search",
    noResultsHint: "Try adjusting your filters or exploring different themes",
    searchPlaceholder: "Search your journey...",
    filters: "Explore by",
    showing: (shown: number, total: number) => `${shown} of ${total} entries`,
    sortBy: "Sort by"
  },

  elements: {
    fire: {
      name: "Fire",
      description: "Passionate, transformative energy",
      emoji: "🔥"
    },
    water: {
      name: "Water",
      description: "Flowing, intuitive, emotional",
      emoji: "💧"
    },
    earth: {
      name: "Earth",
      description: "Grounded, stable, nurturing",
      emoji: "🌍"
    },
    air: {
      name: "Air",
      description: "Clear, swift, intellectual",
      emoji: "💨"
    },
    aether: {
      name: "Aether",
      description: "Mystical, sacred, integrative",
      emoji: "✨"
    }
  },

  errors: {
    micPermission: "We need microphone access to hear your voice",
    micPermissionHelp: "Please enable microphone in your browser settings",
    analysisFailedTitle: "Couldn't complete the reflection",
    analysisFailedText: "Your words have been saved. We'll try reflecting again shortly.",
    networkError: "Connection lost",
    networkErrorHelp: "Check your internet connection and try again"
  },

  accessibility: {
    listening: "Microphone active, listening for your voice",
    paused: "Recording paused, tap resume to continue",
    processing: "Analyzing your journal entry",
    filterButton: "Open filter menu",
    closeFilter: "Close filter menu",
    playback: "Play back your recording"
  }
};
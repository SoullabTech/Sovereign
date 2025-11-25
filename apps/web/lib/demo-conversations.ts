// Demo conversations for presentations and onboarding
export interface DemoMessage {
  role: 'user' | 'maya';
  content: string;
  delay?: number; // Delay before showing this message (ms)
  element?: string;
}

export const demoConversations = {
  wellness: {
    title: "Wellness & Mental Health",
    description: "Maya as a compassionate wellness companion",
    messages: [
      {
        role: 'user' as const,
        content: "I've been feeling overwhelmed with work lately",
        delay: 1000
      },
      {
        role: 'maya' as const,
        content: "I hear you're carrying a heavy load right now. Work stress can feel all-consuming. What aspect of work is weighing on you most - is it the volume of tasks, specific challenges, or perhaps something about the environment itself?",
        delay: 2000,
        element: 'water'
      },
      {
        role: 'user' as const,
        content: "It's the constant deadlines and feeling like I can never catch up",
        delay: 2000
      },
      {
        role: 'maya' as const,
        content: "That relentless pressure of always being behind can be exhausting. It's like running on a treadmill that keeps speeding up. Have you noticed any patterns in when these deadline pressures feel most intense? Sometimes understanding the rhythm can help us find small pockets of relief.",
        delay: 2500,
        element: 'earth'
      }
    ]
  },

  productivity: {
    title: "Productivity & Focus",
    description: "Maya as a thoughtful productivity coach",
    messages: [
      {
        role: 'user' as const,
        content: "How can I stay focused when working from home?",
        delay: 1000
      },
      {
        role: 'maya' as const,
        content: "Working from home brings unique challenges to focus. Let's explore what specifically disrupts your flow - is it the physical environment, digital distractions, or perhaps the blurred boundaries between work and personal life?",
        delay: 2000,
        element: 'air'
      },
      {
        role: 'user' as const,
        content: "Mostly digital distractions and lack of structure",
        delay: 2000
      },
      {
        role: 'maya' as const,
        content: "Structure can be our anchor in the sea of digital noise. What if we designed a simple ritual to mark the beginning of your deep work sessions? Something that signals to your mind: 'This is sacred focus time.' It could be as simple as closing all tabs, taking three deep breaths, or lighting a candle. What resonates with you?",
        delay: 2500,
        element: 'fire'
      }
    ]
  },

  creativity: {
    title: "Creative Exploration",
    description: "Maya as a creative thinking partner",
    messages: [
      {
        role: 'user' as const,
        content: "I want to write a book but don't know where to start",
        delay: 1000
      },
      {
        role: 'maya' as const,
        content: "A book waiting to be born - how exciting! The blank page can feel both thrilling and daunting. Before we dive into the 'how,' I'm curious about the 'why.' What story or wisdom is asking to flow through you? What would make you feel incomplete if you didn't share it?",
        delay: 2000,
        element: 'fire'
      },
      {
        role: 'user' as const,
        content: "I want to share my journey of personal transformation",
        delay: 2000
      },
      {
        role: 'maya' as const,
        content: "Transformation stories are powerful medicine for others walking similar paths. Your journey is unique, yet universally resonant. What was the moment when you realized you were no longer who you used to be? That moment often holds the seed of your entire narrative.",
        delay: 2500,
        element: 'water'
      }
    ]
  },

  innovation: {
    title: "Innovation & Strategy",
    description: "Maya as a strategic thinking partner",
    messages: [
      {
        role: 'user' as const,
        content: "We need to innovate but our team is stuck in old patterns",
        delay: 1000
      },
      {
        role: 'maya' as const,
        content: "Pattern interruption is the birthplace of innovation. When teams feel stuck, it's often because success in the past has created invisible boundaries. What's one 'sacred cow' in your organization that everyone assumes must stay the same? That might be exactly where breakthrough lives.",
        delay: 2000,
        element: 'air'
      },
      {
        role: 'user' as const,
        content: "Our approval process - it takes weeks for simple decisions",
        delay: 2000
      },
      {
        role: 'maya' as const,
        content: "Ah, the bottleneck reveals itself. Long approval processes often hide deeper fears - fear of mistakes, loss of control, or unclear ownership. What if you ran a 'decision sprint' experiment? Pick one type of decision that could be made in 24 hours instead of weeks. Start small, measure the outcomes, and let the results speak. Sometimes organizations need to see that the sky doesn't fall when we move faster.",
        delay: 2500,
        element: 'fire'
      }
    ]
  }
};

// Quick demo snippets for testing
export const quickDemos = [
  "Tell me about your approach to consciousness",
  "How do you help with decision making?",
  "What makes you different from other AI assistants?",
  "Can you help me find clarity on a personal challenge?",
  "I need creative inspiration for my project"
];

// Presentation talking points
export const presentationPoints = {
  uniqueValue: [
    "Not just Q&A - deep, contextual conversations",
    "Remembers context throughout the session",
    "Adapts tone based on emotional needs",
    "Integrates voice for natural interaction",
    "Mobile-first design for accessibility"
  ],
  useCases: [
    "Executive coaching and decision support",
    "Team wellness and mental health",
    "Creative brainstorming and innovation",
    "Personal development and reflection",
    "Strategic planning and analysis"
  ],
  keyFeatures: [
    "🎙️ Natural voice interaction",
    "💾 Downloadable conversation transcripts",
    "🔐 Privacy-first architecture",
    "📱 PWA - works offline",
    "🎨 Beautiful, calming interface"
  ],
  differentiation: [
    "Depth over speed - thoughtful responses",
    "Emotional intelligence built-in",
    "Sacred technology approach - mindful AI",
    "No data harvesting or ads",
    "Open source and transparent"
  ]
};
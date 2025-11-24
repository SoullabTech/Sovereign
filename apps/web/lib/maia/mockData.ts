import { JournalEntry } from './state';

export const mockEntries: JournalEntry[] = [
  {
    id: '1',
    userId: 'demo-user',
    mode: 'free',
    content: 'Today felt like standing at the edge of something. Not sure what, but there\'s this pull forward. Like the river is calling and I can\'t ignore it anymore.',
    reflection: {
      symbols: ['river', 'edge', 'threshold'],
      archetypes: ['Seeker', 'Explorer'],
      emotionalTone: 'anticipation',
      reflection: 'There\'s a sense of movement in your words—like you\'re standing at a crossing point, ready to step forward.',
      prompt: 'What would it feel like to trust where this river is taking you?',
      closing: 'Your courage in exploring this moment is beautiful. I\'m here with you.'
    },
    timestamp: new Date('2025-09-25T14:30:00'),
    wordCount: 34,
    isVoice: false
  },
  {
    id: '2',
    userId: 'demo-user',
    mode: 'dream',
    content: 'I was in a dark forest, but there were these glowing mushrooms lighting the path. I felt scared but also... drawn forward. Like the forest wanted me to see something.',
    reflection: {
      symbols: ['dark forest', 'glowing mushrooms', 'threshold'],
      archetypes: ['Mystic', 'Seeker'],
      emotionalTone: 'awe',
      reflection: 'The glowing mushrooms may represent your inner light navigating the unknown. Forests often symbolize the unconscious—what\'s hidden but waiting to be discovered.',
      prompt: 'What part of you trusts the dark places in your life?',
      closing: 'Your subconscious is speaking to you with beauty and clarity. Trust what emerges.'
    },
    timestamp: new Date('2025-09-24T09:15:00'),
    wordCount: 38,
    duration: 45,
    isVoice: true
  },
  {
    id: '3',
    userId: 'demo-user',
    mode: 'emotional',
    content: 'Everything feels overwhelming today. Like a wave that\'s too big to ride. I need something solid to hold onto but I can\'t find it.',
    reflection: {
      symbols: ['tidal wave', 'anchor'],
      archetypes: ['Healer'],
      emotionalTone: 'overwhelm, fear',
      reflection: 'This feels like a tidal wave—emotions larger than what you can hold right now. It makes sense that you\'re seeking an anchor.',
      prompt: 'What would help you feel even 1% safer in this moment?',
      closing: 'Your emotions are valid and worthy of compassion. You don\'t have to carry this alone.',
      metadata: {
        dominantEmotion: 'overwhelm'
      }
    },
    timestamp: new Date('2025-09-23T19:45:00'),
    wordCount: 28,
    isVoice: false
  },
  {
    id: '4',
    userId: 'demo-user',
    mode: 'shadow',
    content: 'I realized today that I wear a mask around everyone. Even people I love. There\'s a part of me that\'s terrified of being truly seen. What if they don\'t like what they find?',
    reflection: {
      symbols: ['mask', 'mirror'],
      archetypes: ['Shadow'],
      emotionalTone: 'tension',
      reflection: 'There\'s a contradiction here—the part of you that wants to be seen, and the part that\'s afraid of being truly known.',
      prompt: 'What would happen if you let the mask slip, even just with yourself?',
      closing: 'Shadow work isn\'t about fixing yourself—it\'s about becoming whole. This takes immense courage.',
      metadata: {
        shadowElement: 'fear of being seen'
      }
    },
    timestamp: new Date('2025-09-22T16:20:00'),
    wordCount: 41,
    isVoice: false
  },
  {
    id: '5',
    userId: 'demo-user',
    mode: 'direction',
    content: 'Standing at this crossroads. Both paths feel uncertain but something in me knows which way to go. I just need to trust it.',
    reflection: {
      symbols: ['compass', 'crossroads', 'north star'],
      archetypes: ['Seeker', 'Sage'],
      emotionalTone: 'uncertainty',
      reflection: 'You\'re standing at a crossroads, and the uncertainty feels heavy. But the north star you mentioned suggests there\'s something guiding you, even if you can\'t see the full path yet.',
      prompt: 'If you trusted your deepest knowing right now, what direction would you take?',
      closing: 'The path reveals itself one step at a time. Your intuition is wiser than you think.',
      metadata: {
        guidanceDirection: 'trusting inner knowing'
      }
    },
    timestamp: new Date('2025-09-21T11:00:00'),
    wordCount: 26,
    isVoice: false
  }
];
/**
 * Academy Domain Prompts
 *
 * Curated reflection prompts for the 6 domains of inner literacy.
 * Flat structure - no hierarchy, no sequences, no progression.
 *
 * Design principle: "Take what you need. Leave the rest."
 */

import { Eye, Heart, Brain, Sparkles, Users, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PromptTone = 'light' | 'charged' | 'liminal' | 'grounding' | 'choice' | 'integrative';

export interface DomainPrompt {
  id: string;
  title: string;
  prompt: string;
  tone: PromptTone;
  tags: string[];  // Internal only, not shown in UI
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  prompts: DomainPrompt[];
}

export const DOMAINS: Domain[] = [
  {
    id: 'perception',
    name: 'Perception & Awareness',
    description: 'Learn to see before learning what to do',
    icon: Eye,
    color: 'sky',
    bgGradient: 'from-sky-500/20 to-cyan-500/20',
    prompts: [
      {
        id: 'what-you-actually-see',
        title: 'What You Actually See',
        prompt: 'Right now, without trying to see anything in particular - what do you actually notice? Not what you think you should notice. What draws your attention when you stop directing it?',
        tone: 'light',
        tags: ['attention', 'presence', 'observation'],
      },
      {
        id: 'the-thing-you-keep-avoiding',
        title: 'The Thing You Keep Avoiding',
        prompt: 'There\'s something at the edge of your awareness you\'ve been looking past. You know the one. What happens if you turn toward it - not to fix it, just to see it?',
        tone: 'charged',
        tags: ['avoidance', 'awareness', 'shadow'],
      },
      {
        id: 'before-the-story',
        title: 'Before the Story',
        prompt: 'Something happened recently that bothered you. Before your mind made it a story with villains and victims - what was the raw sensation? Where did you feel it first?',
        tone: 'liminal',
        tags: ['sensation', 'story', 'body'],
      },
      {
        id: 'familiar-blindness',
        title: 'Familiar Blindness',
        prompt: 'What in your daily life have you stopped really seeing? A person, a place, a pattern? What might you notice if you looked at it like the first time?',
        tone: 'grounding',
        tags: ['habit', 'freshness', 'presence'],
      },
      {
        id: 'the-ignored-signal',
        title: 'The Ignored Signal',
        prompt: 'Your body has been sending you a signal lately - a tension, a pull, a recurring sensation. What is it trying to get you to notice?',
        tone: 'choice',
        tags: ['body', 'signal', 'listening'],
      },
    ],
  },
  {
    id: 'emotional',
    name: 'Emotional Intelligence',
    description: 'Build tolerance for feeling; allow without collapse',
    icon: Heart,
    color: 'rose',
    bgGradient: 'from-rose-500/20 to-pink-500/20',
    prompts: [
      {
        id: 'what-needs-to-be-felt',
        title: 'What Needs to Be Felt',
        prompt: 'What emotion are you holding that needs to be felt fully? Not analyzed, not explained, not fixed. Just felt.',
        tone: 'charged',
        tags: ['feeling', 'allowing', 'depth'],
      },
      {
        id: 'the-avoided-grief',
        title: 'The Avoided Grief',
        prompt: 'Where is there grief or longing you\'ve avoided? Not because you\'re weak, but because it\'s real. What would it mean to let yourself feel it?',
        tone: 'charged',
        tags: ['grief', 'longing', 'loss'],
      },
      {
        id: 'softening-into-this',
        title: 'Softening Into This',
        prompt: 'What would happen if you softened into this moment, just as it is? Not fixing, not improving. Just being with what\'s here.',
        tone: 'light',
        tags: ['acceptance', 'softening', 'presence'],
      },
      {
        id: 'the-part-asking-to-be-witnessed',
        title: 'The Part Asking to Be Witnessed',
        prompt: 'What part of you is asking to be witnessed right now? Not helped, not changed. Just seen.',
        tone: 'liminal',
        tags: ['witnessing', 'seen', 'parts'],
      },
      {
        id: 'ready-for-release',
        title: 'Ready for Release',
        prompt: 'What needs to be released before you can be renewed? You might already know. Name it, even if only to yourself.',
        tone: 'choice',
        tags: ['release', 'letting-go', 'renewal'],
      },
      {
        id: 'the-feeling-beneath',
        title: 'The Feeling Beneath',
        prompt: 'Beneath the emotion you\'re comfortable naming, there\'s usually another one hiding. Anger covers hurt. Numbness covers fear. What\'s underneath what you\'re feeling?',
        tone: 'integrative',
        tags: ['layers', 'depth', 'beneath'],
      },
    ],
  },
  {
    id: 'psychology',
    name: 'Psychology & Shadow',
    description: 'Pattern recognition and shadow integration',
    icon: Brain,
    color: 'violet',
    bgGradient: 'from-violet-500/20 to-purple-500/20',
    prompts: [
      {
        id: 'the-exiled-part',
        title: 'The Exiled Part',
        prompt: 'What part of yourself did you learn to hide or exile? The loud one, the needy one, the angry one? That part didn\'t go away. Where does it show up now?',
        tone: 'charged',
        tags: ['shadow', 'exile', 'parts'],
      },
      {
        id: 'what-you-judge-in-others',
        title: 'What You Judge in Others',
        prompt: 'Think of someone who irritates you. What quality do they have that you can\'t stand? That quality lives somewhere in you too. Where?',
        tone: 'liminal',
        tags: ['projection', 'mirror', 'shadow'],
      },
      {
        id: 'the-recurring-pattern',
        title: 'The Recurring Pattern',
        prompt: 'What pattern keeps showing up in your life - in relationships, work, or inner states? Not to blame yourself. To recognize it.',
        tone: 'grounding',
        tags: ['pattern', 'recurring', 'recognition'],
      },
      {
        id: 'the-defense-that-costs',
        title: 'The Defense That Costs',
        prompt: 'What defense mechanism has protected you but also costs you something? The wall that keeps you safe but also keeps you alone?',
        tone: 'choice',
        tags: ['defense', 'protection', 'cost'],
      },
      {
        id: 'the-story-you-tell',
        title: 'The Story You Tell',
        prompt: 'What story do you tell about yourself that might not be entirely true anymore? The one that once helped you survive but now holds you back?',
        tone: 'integrative',
        tags: ['narrative', 'identity', 'story'],
      },
    ],
  },
  {
    id: 'meaning',
    name: 'Meaning, Myth & Soul',
    description: 'Symbolic perception and meaning-making',
    icon: Sparkles,
    color: 'amber',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    prompts: [
      {
        id: 'the-larger-pattern',
        title: 'The Larger Pattern',
        prompt: 'What larger pattern is your life trying to reveal? Not the one you\'re forcing. The one that keeps emerging whether you plan it or not.',
        tone: 'liminal',
        tags: ['pattern', 'meaning', 'emergence'],
      },
      {
        id: 'invitation-to-surrender',
        title: 'Invitation to Surrender',
        prompt: 'Where is the invitation to surrender into mystery? The place where control isn\'t working and never will?',
        tone: 'charged',
        tags: ['surrender', 'mystery', 'control'],
      },
      {
        id: 'wisdom-from-this-spiral',
        title: 'Wisdom from This Spiral',
        prompt: 'What wisdom has emerged from this spiral you\'ve been walking - this season of life, this challenge, this phase? What do you know now that you didn\'t before?',
        tone: 'integrative',
        tags: ['wisdom', 'spiral', 'learning'],
      },
      {
        id: 'the-myth-youre-living',
        title: 'The Myth You\'re Living',
        prompt: 'If your life were a myth or story, what chapter are you in? What archetype are you embodying right now - the wanderer, the builder, the one who has to let go?',
        tone: 'light',
        tags: ['myth', 'archetype', 'story'],
      },
      {
        id: 'what-remains',
        title: 'What Remains',
        prompt: 'What truth remains when everything else falls away? When the roles drop, when the performance ends, when you\'re just you - what\'s left?',
        tone: 'grounding',
        tags: ['essence', 'truth', 'core'],
      },
    ],
  },
  {
    id: 'relational',
    name: 'Relational Intelligence',
    description: 'Field awareness and resonance',
    icon: Users,
    color: 'emerald',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    prompts: [
      {
        id: 'the-conversation-that-needs-to-happen',
        title: 'The Conversation That Needs to Happen',
        prompt: 'What conversation needs to happen that you\'ve been avoiding? Not necessarily to fix anything. Sometimes just to say what\'s true.',
        tone: 'choice',
        tags: ['conversation', 'truth', 'courage'],
      },
      {
        id: 'perspective-not-yet-seen',
        title: 'Perspective Not Yet Seen',
        prompt: 'What perspective are you not yet seeing? In this conflict, this relationship, this situation - what does it look like from the other side?',
        tone: 'light',
        tags: ['perspective', 'empathy', 'seeing'],
      },
      {
        id: 'words-and-truth',
        title: 'Words and Truth',
        prompt: 'Where are your words not matching your inner truth? Where do you say yes when you mean no, or stay silent when something needs to be said?',
        tone: 'charged',
        tags: ['authenticity', 'voice', 'truth'],
      },
      {
        id: 'the-real-ones',
        title: 'The Real Ones',
        prompt: 'We figure ourselves out through other people - but not all of them. Who are the real ones in your life? The ones who help you become more yourself?',
        tone: 'grounding',
        tags: ['relationship', 'authenticity', 'support'],
      },
      {
        id: 'what-you-bring-to-the-field',
        title: 'What You Bring to the Field',
        prompt: 'In any room, any relationship, you bring something to the field - an energy, a quality, a way of being. What are you bringing right now? Is it what you want to bring?',
        tone: 'integrative',
        tags: ['field', 'energy', 'presence'],
      },
    ],
  },
  {
    id: 'integration',
    name: 'Integration & Worldcraft',
    description: 'Ground wisdom in ethics; make care trustworthy',
    icon: Layers,
    color: 'indigo',
    bgGradient: 'from-indigo-500/20 to-blue-500/20',
    prompts: [
      {
        id: 'grounding-the-vision',
        title: 'Grounding the Vision',
        prompt: 'What practical step can you take today to ground your vision? Not the whole thing. Just the next small move that makes it more real.',
        tone: 'grounding',
        tags: ['practical', 'action', 'grounding'],
      },
      {
        id: 'structure-needed',
        title: 'Structure Needed',
        prompt: 'Where in your life needs more structure? Not rigidity, but the kind of container that actually helps things grow?',
        tone: 'light',
        tags: ['structure', 'container', 'support'],
      },
      {
        id: 'what-stabilizes-you',
        title: 'What Stabilizes You',
        prompt: 'What routines or rituals actually stabilize you - not the ones you think you should do, but the ones that genuinely help you feel grounded?',
        tone: 'grounding',
        tags: ['ritual', 'routine', 'stability'],
      },
      {
        id: 'bodys-wisdom',
        title: 'Body\'s Wisdom',
        prompt: 'How can you honor your body\'s wisdom today? It knows things your mind hasn\'t caught up to. What is it asking for?',
        tone: 'choice',
        tags: ['body', 'wisdom', 'listening'],
      },
      {
        id: 'true-nourishment',
        title: 'True Nourishment',
        prompt: 'What does true nourishment look like for you right now? Not escape, not numbing. Actual replenishment.',
        tone: 'integrative',
        tags: ['nourishment', 'care', 'replenishment'],
      },
      {
        id: 'small-and-real',
        title: 'Small and Real',
        prompt: 'It doesn\'t have to be perfect. It has to be real. Small counts. What\'s one small, real thing you can do with what you know?',
        tone: 'choice',
        tags: ['action', 'real', 'small'],
      },
    ],
  },
];

/**
 * Get a domain by ID
 */
export function getDomainById(id: string): Domain | undefined {
  return DOMAINS.find(d => d.id === id);
}

/**
 * Get a prompt by domain and prompt ID
 */
export function getPromptById(domainId: string, promptId: string): DomainPrompt | undefined {
  const domain = getDomainById(domainId);
  return domain?.prompts.find(p => p.id === promptId);
}

'use client';

/**
 * WISDOM TRANSLATION
 *
 * A living experience portal - not just preferences.
 * Translate insights, ignite conversations, calibrate meaning-making.
 *
 * "Choose the doorway, not the identity"
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Globe,
  Sparkles,
  BookOpen,
  ChevronDown,
  Check,
  Info,
  Search,
  MessageCircle,
  Send,
  Plus,
  Shield,
  Heart,
  Compass,
  Users,
  Clock,
  Zap,
  BookMarked,
} from 'lucide-react';

// ==================== TYPES ====================

type SystemType =
  | 'astrology'
  | 'alchemy'
  | 'psychology'
  | 'spiral'
  | 'somatic'
  | 'mythology'
  | 'energy'
  | 'archetypal';

type CulturalLens =
  | 'western-esoteric'
  | 'vedic'
  | 'east-asian'
  | 'african-diasporic'
  | 'indigenous-american'
  | 'celtic-norse'
  | 'sufi'
  | 'kabbalistic';

// Meaning-making calibrators
type DirectnessLevel = 'direct' | 'gentle' | 'poetic' | 'socratic';
type AuthorityStance = 'teacher' | 'companion' | 'elder' | 'mirror';
type TimeOrientation = 'linear' | 'cyclical' | 'initiatory';
type CommunityOrientation = 'individual' | 'relational' | 'ancestral';

interface MeaningCalibration {
  directness: DirectnessLevel;
  authority: AuthorityStance;
  time: TimeOrientation;
  community: CommunityOrientation;
}

interface SafetyPreferences {
  askBeforeSacred: boolean;
  avoidClosedPractices: boolean;
}

interface WisdomSystem {
  id: SystemType;
  name: string;
  icon: string;
  description: string;
  examples: string[];
}

interface CulturalContext {
  id: CulturalLens;
  name: string;
  icon: string;
  traditions: string[];
  description: string;
  symbolSets: string[];
  communicationStyle: string;
}

interface GlossaryTerm {
  term: string;
  systems: Partial<Record<SystemType, string>>;
  essence: string;
  memberNote?: string; // User's personal mapping
}

interface ConversationStarter {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  category: 'lens' | 'systems' | 'integration' | 'shadow';
}

// ==================== CONVERSATION STARTERS ====================

const conversationStarters: ConversationStarter[] = [
  {
    id: 'cultural-reflection',
    icon: '🌍',
    label: 'Reflect Through My Lens',
    prompt: 'Reflect on this week through my chosen cultural lens. Use metaphors and framing that match my tradition.',
    category: 'lens',
  },
  {
    id: 'systems-explanation',
    icon: '🔄',
    label: 'Explain With My Systems',
    prompt: 'Help me understand what I\'m going through using my preferred wisdom systems. Show how they illuminate the same truth.',
    category: 'systems',
  },
  {
    id: 'micro-practices',
    icon: '✨',
    label: 'Give Me Practices',
    prompt: 'Give me 3 micro-practices aligned with my cultural lens - one for body, one for mind, one for spirit.',
    category: 'integration',
  },
  {
    id: 'shadow-work',
    icon: '🌑',
    label: 'Gentle Shadow Work',
    prompt: 'Name what I might be avoiding - gently - through my lens and preferred systems. Help me see what wants attention.',
    category: 'shadow',
  },
  {
    id: 'morning-orientation',
    icon: '🌅',
    label: 'Orient My Day',
    prompt: 'Help me orient to today using my wisdom systems. What energies are present? What deserves my attention?',
    category: 'integration',
  },
  {
    id: 'pattern-recognition',
    icon: '🔮',
    label: 'Name My Pattern',
    prompt: 'Help me name a pattern I\'ve been living through - translate it across my systems so I can see it from multiple angles.',
    category: 'systems',
  },
];

// ==================== DATA ====================

const wisdomSystems: WisdomSystem[] = [
  {
    id: 'astrology',
    name: 'Astrology',
    icon: '⭐',
    description: 'Planetary archetypes, zodiacal energies, and cosmic timing',
    examples: ['Mars in Aries', 'Saturn return', '8th house themes'],
  },
  {
    id: 'alchemy',
    name: 'Alchemy',
    icon: '🜃',
    description: 'Transformation stages, elemental processes, and inner gold',
    examples: ['Nigredo', 'Calcination', 'The Great Work'],
  },
  {
    id: 'psychology',
    name: 'Psychology',
    icon: '🧠',
    description: 'Jungian archetypes, shadow work, and developmental stages',
    examples: ['Shadow integration', 'Anima/Animus', 'Individuation'],
  },
  {
    id: 'spiral',
    name: 'Spiral Dynamics',
    icon: '🌀',
    description: 'Developmental stages, value systems, and consciousness evolution',
    examples: ['Green to Yellow transition', 'Second tier awareness'],
  },
  {
    id: 'somatic',
    name: 'Somatic',
    icon: '🫀',
    description: 'Body wisdom, chakras, and nervous system states',
    examples: ['Heart chakra opening', 'Ventral vagal state'],
  },
  {
    id: 'mythology',
    name: 'Mythology',
    icon: '⚡',
    description: "Hero's journey, archetypal stories, and mythic patterns",
    examples: ['Descent to underworld', 'The Mentor', 'Return with elixir'],
  },
  {
    id: 'energy',
    name: 'Energy Work',
    icon: '💫',
    description: 'Subtle body, meridians, and energetic anatomy',
    examples: ['Kundalini rising', 'Clearing blockages', 'Grounding'],
  },
  {
    id: 'archetypal',
    name: 'Archetypal',
    icon: '🗿',
    description: 'Universal patterns, the collective unconscious, and timeless forms',
    examples: ['The Warrior', 'The Lover', 'The Sage'],
  },
];

const culturalContexts: CulturalContext[] = [
  {
    id: 'western-esoteric',
    name: 'Western Esoteric',
    icon: '🔮',
    traditions: ['Hermetic', 'Alchemical', 'Greco-Roman', 'Rosicrucian'],
    description: 'The hidden wisdom of the Western mystery traditions',
    symbolSets: ['Tarot', 'Astrology', 'Alchemy', 'Kabbalah'],
    communicationStyle: 'Direct teaching with symbolic layering',
  },
  {
    id: 'vedic',
    name: 'Vedic / Hindu',
    icon: '🕉️',
    traditions: ['Yoga', 'Tantra', 'Jyotish', 'Ayurveda'],
    description: 'Ancient wisdom of the Indian subcontinent',
    symbolSets: ['Chakras', 'Doshas', 'Nakshatras', 'Deities'],
    communicationStyle: 'Teacher-student transmission, devotional framing',
  },
  {
    id: 'east-asian',
    name: 'East Asian',
    icon: '☯️',
    traditions: ['Taoism', 'Buddhism', 'Confucianism', 'Shinto'],
    description: 'Wisdom traditions of China, Japan, Korea, and Southeast Asia',
    symbolSets: ['I Ching', 'Five Elements', 'Yin-Yang', 'Zen koans'],
    communicationStyle: 'Indirect, paradoxical, emphasis on practice',
  },
  {
    id: 'african-diasporic',
    name: 'African Diasporic',
    icon: '🌍',
    traditions: ['Yoruba/Ifá', 'Vodou', 'Candomblé', 'Ancestral wisdom'],
    description: 'Living traditions rooted in African cosmology',
    symbolSets: ['Orishas', 'Divination systems', 'Ancestral patterns'],
    communicationStyle: 'Relational, ancestral, community-embedded',
  },
  {
    id: 'indigenous-american',
    name: 'Indigenous American',
    icon: '🦅',
    traditions: ['Medicine Wheel', 'Dreamwork', 'Plant medicine', 'Land-based'],
    description: 'Wisdom traditions of North and South American Indigenous peoples',
    symbolSets: ['Four directions', 'Animal totems', 'Seasonal cycles'],
    communicationStyle: 'Story-based, land-connected, ceremonial',
  },
  {
    id: 'celtic-norse',
    name: 'Celtic & Norse',
    icon: '🌿',
    traditions: ['Druidry', 'Rune lore', 'Ogham', 'Wheel of the Year'],
    description: 'Pre-Christian wisdom of Northern and Western Europe',
    symbolSets: ['Runes', 'Ogham', 'Celtic deities', 'Seasonal festivals'],
    communicationStyle: 'Poetic, nature-connected, cyclical',
  },
  {
    id: 'sufi',
    name: 'Sufi / Islamic Mysticism',
    icon: '🌙',
    traditions: ['Sufism', 'Persian poetry', 'Whirling', 'Dhikr'],
    description: 'The mystical heart of Islamic tradition',
    symbolSets: ['Divine names', 'Stations of the soul', 'Heart practices'],
    communicationStyle: 'Poetic, devotional, paradoxical',
  },
  {
    id: 'kabbalistic',
    name: 'Jewish Mystical',
    icon: '✡️',
    traditions: ['Kabbalah', 'Hasidism', 'Tree of Life', 'Tikkun'],
    description: 'The hidden dimensions of Jewish wisdom',
    symbolSets: ['Sefirot', 'Hebrew letters', 'Four worlds'],
    communicationStyle: 'Textual, interpretive, communal',
  },
];

const defaultGlossaryTerms: GlossaryTerm[] = [
  {
    term: 'Shadow',
    essence: 'The rejected or unconscious aspects of self seeking integration',
    systems: {
      psychology: 'Shadow (Jung) — repressed aspects of personality',
      alchemy: 'Nigredo — the blackening, descent into darkness',
      astrology: 'Pluto/8th house — what is hidden, death/rebirth',
      mythology: 'Descent to underworld — meeting what was exiled',
      somatic: 'Armoring — chronic tension holding trauma',
    },
  },
  {
    term: 'Initiation',
    essence: 'A threshold crossing that transforms identity',
    systems: {
      psychology: 'Ego death/rebirth — dissolution of old identity',
      alchemy: 'Solve et coagula — dissolve and recombine',
      astrology: 'Saturn return, Pluto transit — forced maturation',
      mythology: "Hero's ordeal — the central trial",
      spiral: 'Tier transition — jumping to new value system',
    },
  },
  {
    term: 'Warrior',
    essence: 'Active courage and protective power',
    systems: {
      astrology: 'Mars, Aries, 1st house',
      alchemy: 'Iron, calcination, fire',
      psychology: 'Enneagram 8, Warrior archetype',
      somatic: 'Solar plexus, sympathetic activation',
      mythology: 'The Hero, Mars, Athena',
    },
  },
  {
    term: 'Integration',
    essence: 'Bringing separated parts into wholeness',
    systems: {
      psychology: 'Individuation — becoming whole',
      alchemy: 'Coniunctio — sacred marriage of opposites',
      astrology: 'North Node — destiny, soul growth',
      somatic: 'Ventral vagal — social engagement, safety',
      spiral: 'Yellow/Turquoise — second tier integration',
    },
  },
  {
    term: 'Emergence',
    essence: 'New form arising from previous dissolution',
    systems: {
      alchemy: 'Rubedo — the reddening, final stage',
      psychology: 'Self-actualization — becoming who you are',
      astrology: 'Jupiter, Uranus — expansion, breakthrough',
      mythology: 'Return with elixir — bringing gifts home',
      somatic: 'Flow state — coherent, alive presence',
    },
  },
];

// Calibration options
const directnessOptions: { value: DirectnessLevel; label: string; description: string }[] = [
  { value: 'direct', label: 'Direct', description: 'Clear, straightforward guidance' },
  { value: 'gentle', label: 'Gentle', description: 'Soft, supportive framing' },
  { value: 'poetic', label: 'Poetic', description: 'Metaphor-rich, evocative' },
  { value: 'socratic', label: 'Socratic', description: 'Questions that invite discovery' },
];

const authorityOptions: { value: AuthorityStance; label: string; description: string }[] = [
  { value: 'teacher', label: 'Teacher', description: 'Shares knowledge and explains' },
  { value: 'companion', label: 'Companion', description: 'Walks alongside, explores together' },
  { value: 'elder', label: 'Elder', description: 'Wisdom from experience, guidance' },
  { value: 'mirror', label: 'Mirror', description: 'Reflects back what you share' },
];

const timeOptions: { value: TimeOrientation; label: string; description: string }[] = [
  { value: 'linear', label: 'Linear Goals', description: 'Progress toward destinations' },
  { value: 'cyclical', label: 'Cyclical Seasons', description: 'Returning rhythms and patterns' },
  { value: 'initiatory', label: 'Initiatory Stages', description: 'Thresholds and transformations' },
];

const communityOptions: { value: CommunityOrientation; label: string; description: string }[] = [
  { value: 'individual', label: 'Individual Path', description: 'Personal journey focus' },
  { value: 'relational', label: 'Relational Field', description: 'Self in context of relationships' },
  { value: 'ancestral', label: 'Ancestral Lineage', description: 'Wisdom from those who came before' },
];

// ==================== MOCK TRANSLATION ====================

const mockTranslate = (
  input: string,
  fromSystem: SystemType,
  toSystem: SystemType
): { translation: string; confidence: number; notes: string } | null => {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('mars') || lowerInput.includes('warrior') || lowerInput.includes('fire')) {
    const translations: Record<SystemType, string> = {
      astrology: 'Mars in Aries — pure warrior energy, initiative, courage to begin',
      alchemy: 'Calcination through Iron — burning away what is false, the first fire',
      psychology: 'The Warrior archetype (Enneagram 8) — protective power, direct action',
      somatic: 'Solar plexus activation — sympathetic arousal, readiness to act',
      mythology: 'The Hero answering the call — crossing the first threshold',
      spiral: 'Red vMeme expression — power, action, breaking free',
      energy: 'Third chakra fire — personal will, transformation',
      archetypal: 'The Warrior — active courage and protective power',
    };
    return {
      translation: translations[toSystem] || 'Translation not available for this system',
      confidence: 0.85,
      notes: `Mapped from ${fromSystem} warrior/fire patterns to ${toSystem} equivalent`,
    };
  }

  if (lowerInput.includes('shadow') || lowerInput.includes('pluto') || lowerInput.includes('nigredo')) {
    const translations: Record<SystemType, string> = {
      astrology: 'Pluto transit or 8th house activation — facing what was hidden',
      alchemy: 'Nigredo — the blackening, necessary descent into darkness',
      psychology: 'Shadow work — integrating rejected aspects of self',
      somatic: 'Dorsal vagal state — shutdown, freeze, the wisdom in collapse',
      mythology: 'Descent to the underworld — meeting Persephone, facing death',
      spiral: 'Shadow of current stage — what the value system cannot see',
      energy: 'Root chakra clearing — survival fears, ancestral patterns',
      archetypal: 'The Shadow — the rejected seeking integration',
    };
    return {
      translation: translations[toSystem] || 'Translation not available for this system',
      confidence: 0.82,
      notes: `Mapped from ${fromSystem} shadow/descent patterns to ${toSystem} equivalent`,
    };
  }

  return {
    translation: `${toSystem.charAt(0).toUpperCase() + toSystem.slice(1)} perspective on "${input}" — explore how this pattern manifests through ${toSystem} lens`,
    confidence: 0.6,
    notes: 'General translation — specific pattern not recognized',
  };
};

// ==================== COMPONENT ====================

export default function WisdomTranslationPage() {
  const router = useRouter();

  // Section states
  const [activeSection, setActiveSection] = useState<string>('starters');

  // Translation state
  const [inputText, setInputText] = useState('');
  const [sourceSystem, setSourceSystem] = useState<SystemType>('astrology');
  const [targetSystem, setTargetSystem] = useState<SystemType>('alchemy');
  const [translationResult, setTranslationResult] = useState<{
    translation: string;
    confidence: number;
    notes: string;
  } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Preferences state
  const [selectedSystems, setSelectedSystems] = useState<SystemType[]>(['astrology', 'psychology']);
  const [selectedCulture, setSelectedCulture] = useState<CulturalLens>('western-esoteric');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Meaning-making calibration state
  const [calibration, setCalibration] = useState<MeaningCalibration>({
    directness: 'gentle',
    authority: 'companion',
    time: 'cyclical',
    community: 'relational',
  });

  // Safety preferences
  const [safetyPrefs, setSafetyPrefs] = useState<SafetyPreferences>({
    askBeforeSacred: false,
    avoidClosedPractices: true,
  });

  // Glossary state
  const [glossarySearch, setGlossarySearch] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(defaultGlossaryTerms);
  const [newTermInput, setNewTermInput] = useState('');
  const [showAddTerm, setShowAddTerm] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await apiFetch('/api/members/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.wisdom) {
            setSelectedSystems(data.wisdom.systems || ['astrology', 'psychology']);
            setSelectedCulture(data.wisdom.culturalLens || 'western-esoteric');
          }
          if (data.meaningCalibration) {
            setCalibration(data.meaningCalibration);
          }
          if (data.safetyPrefs) {
            setSafetyPrefs(data.safetyPrefs);
          }
        }
      } catch (error) {
        console.error('Failed to load wisdom preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Save preferences (debounced)
  const savePreferences = useCallback(async (
    systems: SystemType[],
    culture: CulturalLens,
    cal?: MeaningCalibration,
    safety?: SafetyPreferences
  ) => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await apiFetch('/api/members/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wisdomSystems: systems,
          culturalLens: culture,
          ...(cal && { meaningCalibration: cal }),
          ...(safety && { safetyPrefs: safety }),
        }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save wisdom preferences:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const result = mockTranslate(inputText, sourceSystem, targetSystem);
    setTranslationResult(result);
    setIsTranslating(false);
  };

  const toggleSystem = (system: SystemType) => {
    setSelectedSystems(prev => {
      const newSystems = prev.includes(system)
        ? prev.filter(s => s !== system)
        : [...prev, system];
      savePreferences(newSystems, selectedCulture, calibration, safetyPrefs);
      return newSystems;
    });
  };

  const handleCultureSelect = (culture: CulturalLens) => {
    setSelectedCulture(culture);
    savePreferences(selectedSystems, culture, calibration, safetyPrefs);
  };

  const handleCalibrationChange = <K extends keyof MeaningCalibration>(
    key: K,
    value: MeaningCalibration[K]
  ) => {
    setCalibration(prev => {
      const newCal = { ...prev, [key]: value };
      savePreferences(selectedSystems, selectedCulture, newCal, safetyPrefs);
      return newCal;
    });
  };

  const handleSafetyChange = (key: keyof SafetyPreferences) => {
    setSafetyPrefs(prev => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      savePreferences(selectedSystems, selectedCulture, calibration, newPrefs);
      return newPrefs;
    });
  };

  const handleSendToMaia = (prompt: string) => {
    // Store the prompt and redirect to MAIA
    if (typeof window !== 'undefined') {
      localStorage.setItem('maia.wisdomPrompt', prompt);
      router.push('/maia');
    }
  };

  const handleAddPersonalNote = (termName: string, note: string) => {
    setGlossaryTerms(prev =>
      prev.map(t => (t.term === termName ? { ...t, memberNote: note } : t))
    );
  };

  const filteredGlossary = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    term.essence.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const sections = [
    { id: 'starters', label: 'Start', icon: '💬' },
    { id: 'translate', label: 'Translate', icon: '🔄' },
    { id: 'systems', label: 'Systems', icon: '⚙️' },
    { id: 'culture', label: 'Lens', icon: '🌍' },
    { id: 'calibrate', label: 'Style', icon: '🎚️' },
    { id: 'glossary', label: 'Glossary', icon: '📖' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving && (
              <motion.div
                className="w-4 h-4 border-2 border-[#D4B896] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4B896] to-[#B8935A] rounded-lg
                          flex items-center justify-center text-2xl">
              🌐
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#D4B896] tracking-wide">Wisdom Translation</h1>
              <p className="text-[#D4B896]/60 text-sm">What helps you understand life?</p>
            </div>
          </div>
        </div>

        {/* Section Tabs - Scrollable on mobile */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
                activeSection === section.id
                  ? 'bg-[#D4B896] text-[#0f1419] font-medium'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="w-8 h-8 border-2 border-[#D4B896] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Section Content */}
        <AnimatePresence mode="wait">

          {/* CONVERSATION STARTERS SECTION */}
          {activeSection === 'starters' && (
            <motion.div
              key="starters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-5">
                <h2 className="text-lg font-medium text-[#D4B896] mb-2 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Start a Conversation with MAIA
                </h2>
                <p className="text-white/50 text-sm mb-5">
                  These prompts use your chosen lens ({culturalContexts.find(c => c.id === selectedCulture)?.name})
                  and systems ({selectedSystems.map(s => wisdomSystems.find(w => w.id === s)?.name).join(', ')}).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conversationStarters.map(starter => (
                    <button
                      key={starter.id}
                      onClick={() => handleSendToMaia(starter.prompt)}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left
                               hover:bg-[#D4B896]/10 hover:border-[#D4B896]/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{starter.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white group-hover:text-[#D4B896] transition-colors">
                              {starter.label}
                            </span>
                            <Send className="w-4 h-4 text-white/30 group-hover:text-[#D4B896] transition-colors" />
                          </div>
                          <p className="text-white/40 text-sm mt-1 line-clamp-2">
                            {starter.prompt}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-[#D4B896]/10 border border-[#D4B896]/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#D4B896] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/60">
                    <p className="mb-2">
                      <strong className="text-[#D4B896]">Your current setup:</strong>
                    </p>
                    <p>
                      <strong>Cultural Lens:</strong> {culturalContexts.find(c => c.id === selectedCulture)?.name}
                    </p>
                    <p>
                      <strong>Systems:</strong> {selectedSystems.length > 0
                        ? selectedSystems.map(s => wisdomSystems.find(w => w.id === s)?.name).join(', ')
                        : 'None selected'}
                    </p>
                    <p className="mt-2 text-white/40 italic">
                      Use the other tabs to customize how MAIA speaks with you.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TRANSLATE SECTION */}
          {activeSection === 'translate' && (
            <motion.div
              key="translate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Translate Your Insight
                </h2>

                {/* Input */}
                <div className="mb-4">
                  <label className="block text-white/60 text-sm mb-2">
                    Enter an insight, pattern, or concept
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g., Mars in Aries, shadow work, kundalini rising..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                             text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50
                             resize-none"
                    rows={3}
                  />
                </div>

                {/* System Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">From System</label>
                    <select
                      value={sourceSystem}
                      onChange={(e) => setSourceSystem(e.target.value as SystemType)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                               text-white focus:outline-none focus:border-[#D4B896]/50"
                    >
                      {wisdomSystems.map(system => (
                        <option key={system.id} value={system.id} className="bg-[#1a1f2e]">
                          {system.icon} {system.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-2">To System</label>
                    <select
                      value={targetSystem}
                      onChange={(e) => setTargetSystem(e.target.value as SystemType)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                               text-white focus:outline-none focus:border-[#D4B896]/50"
                    >
                      {wisdomSystems.map(system => (
                        <option key={system.id} value={system.id} className="bg-[#1a1f2e]">
                          {system.icon} {system.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Translate Button */}
                <button
                  onClick={handleTranslate}
                  disabled={!inputText.trim() || isTranslating}
                  className="w-full py-3 bg-gradient-to-r from-[#D4B896] to-[#B8935A] text-[#0f1419]
                           font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50
                           flex items-center justify-center gap-2"
                >
                  {isTranslating ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-[#0f1419] border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Translate
                    </>
                  )}
                </button>
              </div>

              {/* Translation Result */}
              {translationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#D4B896]/10 border border-[#D4B896]/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-[#D4B896]">Translation Result</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/40">Confidence:</span>
                      <span className="px-2 py-1 bg-[#D4B896]/20 rounded text-[#D4B896]">
                        {Math.round(translationResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-white/90 text-lg mb-4 leading-relaxed">
                    {translationResult.translation}
                  </div>

                  <div className="flex items-start gap-2 text-white/50 text-sm">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{translationResult.notes}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* YOUR SYSTEMS SECTION */}
          {activeSection === 'systems' && (
            <motion.div
              key="systems"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-2">
                  Which frameworks resonate with you?
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  MAIA will prioritize these systems when offering insights. Select all that feel like home.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {wisdomSystems.map(system => (
                    <button
                      key={system.id}
                      onClick={() => toggleSystem(system.id)}
                      className={`p-4 rounded-xl text-left transition-all border ${
                        selectedSystems.includes(system.id)
                          ? 'bg-[#D4B896]/20 border-[#D4B896]/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{system.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{system.name}</span>
                            {selectedSystems.includes(system.id) && (
                              <Check className="w-4 h-4 text-[#D4B896]" />
                            )}
                          </div>
                          <p className="text-white/50 text-sm mt-1">{system.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {system.examples.map((ex, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* CULTURAL LENS SECTION */}
          {activeSection === 'culture' && (
            <motion.div
              key="culture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-2">
                  Cultural Context
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  MAIA adapts not just language, but worldview — symbolic vocabulary, relational norms,
                  and wisdom traditions that resonate with you.
                </p>

                <div className="space-y-3">
                  {culturalContexts.map(culture => (
                    <button
                      key={culture.id}
                      onClick={() => handleCultureSelect(culture.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        selectedCulture === culture.id
                          ? 'bg-[#D4B896]/20 border-[#D4B896]/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{culture.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white text-lg">{culture.name}</span>
                            {selectedCulture === culture.id && (
                              <Check className="w-5 h-5 text-[#D4B896]" />
                            )}
                          </div>
                          <p className="text-white/60 text-sm mt-1">{culture.description}</p>

                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-white/40 text-xs">Traditions:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {culture.traditions.map((t, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/70"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="text-xs text-white/40 italic">
                              Style: {culture.communicationStyle}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Cultural Humility Note & Safety Toggles */}
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <Shield className="w-5 h-5 text-[#D4B896] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-sm">
                        MAIA uses these frameworks respectfully, avoiding assumptions and asking
                        clarifying questions when uncertain.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <span className="text-white/80 text-sm">Ask before using sacred terms</span>
                        <p className="text-white/40 text-xs mt-0.5">
                          MAIA will check with you before using sacred vocabulary
                        </p>
                      </div>
                      <div
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          safetyPrefs.askBeforeSacred ? 'bg-[#D4B896]' : 'bg-white/20'
                        }`}
                        onClick={() => handleSafetyChange('askBeforeSacred')}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            safetyPrefs.askBeforeSacred ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div>
                        <span className="text-white/80 text-sm">Avoid closed practices</span>
                        <p className="text-white/40 text-xs mt-0.5">
                          Reference concepts without instructing in closed traditions
                        </p>
                      </div>
                      <div
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          safetyPrefs.avoidClosedPractices ? 'bg-[#D4B896]' : 'bg-white/20'
                        }`}
                        onClick={() => handleSafetyChange('avoidClosedPractices')}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            safetyPrefs.avoidClosedPractices ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MEANING CALIBRATION SECTION */}
          {activeSection === 'calibrate' && (
            <motion.div
              key="calibrate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-2">
                  How do you like wisdom delivered?
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  These calibrate how MAIA frames insights — independent of which tradition or system.
                </p>

                {/* Directness */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[#D4B896]" />
                    <span className="text-white font-medium">Directness</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {directnessOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleCalibrationChange('directness', opt.value)}
                        className={`p-3 rounded-lg text-center transition-all border ${
                          calibration.directness === opt.value
                            ? 'bg-[#D4B896]/20 border-[#D4B896]/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-white text-sm font-medium">{opt.label}</span>
                        <span className="block text-white/40 text-xs mt-1">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Authority Stance */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-[#D4B896]" />
                    <span className="text-white font-medium">Authority Stance</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {authorityOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleCalibrationChange('authority', opt.value)}
                        className={`p-3 rounded-lg text-center transition-all border ${
                          calibration.authority === opt.value
                            ? 'bg-[#D4B896]/20 border-[#D4B896]/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-white text-sm font-medium">{opt.label}</span>
                        <span className="block text-white/40 text-xs mt-1">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Orientation */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-[#D4B896]" />
                    <span className="text-white font-medium">Time Orientation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleCalibrationChange('time', opt.value)}
                        className={`p-3 rounded-lg text-center transition-all border ${
                          calibration.time === opt.value
                            ? 'bg-[#D4B896]/20 border-[#D4B896]/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-white text-sm font-medium">{opt.label}</span>
                        <span className="block text-white/40 text-xs mt-1">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Community Orientation */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#D4B896]" />
                    <span className="text-white font-medium">Community Orientation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {communityOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleCalibrationChange('community', opt.value)}
                        className={`p-3 rounded-lg text-center transition-all border ${
                          calibration.community === opt.value
                            ? 'bg-[#D4B896]/20 border-[#D4B896]/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-white text-sm font-medium">{opt.label}</span>
                        <span className="block text-white/40 text-xs mt-1">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Configuration Summary */}
              <div className="bg-[#D4B896]/10 border border-[#D4B896]/20 rounded-xl p-4">
                <h3 className="text-[#D4B896] font-medium mb-2">Your current style</h3>
                <p className="text-white/70 text-sm">
                  MAIA will speak as a{' '}
                  <span className="text-[#D4B896]">{calibration.directness}</span>{' '}
                  <span className="text-[#D4B896]">{calibration.authority}</span>,
                  framing time through{' '}
                  <span className="text-[#D4B896]">{calibration.time}</span> awareness,
                  with a{' '}
                  <span className="text-[#D4B896]">{calibration.community}</span> orientation.
                </p>
              </div>
            </motion.div>
          )}

          {/* GLOSSARY SECTION */}
          {activeSection === 'glossary' && (
            <motion.div
              key="glossary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium text-[#D4B896] flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Cross-System Glossary
                  </h2>
                  <button
                    onClick={() => setShowAddTerm(!showAddTerm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#D4B896]/20
                             text-[#D4B896] rounded-lg hover:bg-[#D4B896]/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Term
                  </button>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Look up how concepts translate across traditions. Add your own mappings.
                </p>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Search terms..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg
                             text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50"
                  />
                </div>

                {/* Add New Term Form */}
                <AnimatePresence>
                  {showAddTerm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="p-4 bg-[#D4B896]/10 border border-[#D4B896]/30 rounded-xl">
                        <h3 className="text-white font-medium mb-2">Add Your Term</h3>
                        <input
                          type="text"
                          value={newTermInput}
                          onChange={(e) => setNewTermInput(e.target.value)}
                          placeholder="Enter a term from your tradition..."
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                                   text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50
                                   mb-2"
                        />
                        <p className="text-white/40 text-xs">
                          Coming soon: Add your own cross-system mappings and share with the community.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Terms */}
                <div className="space-y-3">
                  {filteredGlossary.map(term => (
                    <div
                      key={term.term}
                      className="border border-white/10 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="text-left">
                          <span className="font-medium text-white">{term.term}</span>
                          <p className="text-white/50 text-sm mt-1">{term.essence}</p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-white/40 transition-transform ${
                            expandedTerm === term.term ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedTerm === term.term && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-4 space-y-3 bg-white/5">
                              {Object.entries(term.systems).map(([system, description]) => {
                                const systemInfo = wisdomSystems.find(s => s.id === system);
                                return (
                                  <div key={system} className="flex gap-3">
                                    <span className="text-xl">{systemInfo?.icon}</span>
                                    <div>
                                      <span className="text-[#D4B896] text-sm font-medium">
                                        {systemInfo?.name}
                                      </span>
                                      <p className="text-white/70 text-sm">{description}</p>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Personal Note */}
                              <div className="pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookMarked className="w-4 h-4 text-[#D4B896]" />
                                  <span className="text-white/60 text-sm">Your note:</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="In my tradition, this is more like..."
                                  defaultValue={term.memberNote || ''}
                                  onBlur={(e) => handleAddPersonalNote(term.term, e.target.value)}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                                           text-white text-sm placeholder-white/30 focus:outline-none
                                           focus:border-[#D4B896]/50"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Hide scrollbar utility */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

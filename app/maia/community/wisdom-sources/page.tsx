'use client';

/**
 * MAIA's Wisdom Sources
 *
 * A living catalog of the books, texts, and knowledge traditions
 * that inform MAIA's understanding and guidance.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Heart,
  Star,
  Sparkles,
  Moon,
  Sun,
  Leaf,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Domain categories with their sources
const wisdomDomains = [
  {
    id: 'therapeutic',
    title: 'Therapeutic Psychology',
    icon: Heart,
    color: 'rose',
    description: 'Clinical frameworks for healing trauma, understanding personality, and therapeutic growth',
    sources: [
      { title: 'Cambridge Guide to Schema Therapy', author: 'Cambridge Press', focus: 'Early maladaptive schemas and therapeutic change' },
      { title: 'CBT Basics and Beyond', author: 'Judith Beck', focus: 'Cognitive behavioral therapy fundamentals' },
      { title: 'CBT and DBT for Anxiety', author: 'Clinical Manual', focus: 'Combined cognitive and dialectical approaches' },
      { title: 'Complex PTSD Treatment Manual', author: 'Clinical Guide', focus: 'Trauma-informed treatment protocols' },
      { title: 'Attachment Theory in Adult Mental Health', author: 'Research Collection', focus: 'Attachment patterns and therapeutic relationship' },
      { title: 'Handbook of Personality Disorders', author: 'Clinical Reference', focus: 'Personality structure and pathology' },
      { title: 'Oxford Textbook of Psychopathology', author: 'Oxford Press', focus: 'Comprehensive diagnostic frameworks' },
      { title: 'Interpersonal Psychotherapy Clinician\'s Guide', author: 'IPT Manual', focus: 'Relational dynamics in therapy' },
      { title: 'Gestalt Therapy: Theories of Psychotherapy', author: 'Gestalt Institute', focus: 'Present-moment awareness and integration' },
      { title: 'Humanistic Psychotherapies', author: 'APA Handbook', focus: 'Person-centered and existential approaches' },
      { title: 'The Psychoanalytic Model of the Mind', author: 'Psychoanalytic Press', focus: 'Depth psychology and unconscious dynamics' },
      { title: 'Skills in Existential Counselling & Psychotherapy', author: 'Van Deurzen & Adams', focus: 'Existential therapeutic skills' },
      { title: 'Existential Therapy', author: 'Clinical Text', focus: 'Meaning-centered approaches' },
      { title: 'Defining Autism', author: 'Research Collection', focus: 'Neurodiversity perspectives' },
    ],
  },
  {
    id: 'jungian',
    title: 'Jungian & Depth Psychology',
    icon: Moon,
    color: 'purple',
    description: 'Archetypal psychology, alchemy, individuation, and the collective unconscious',
    sources: [
      { title: 'Anatomy of the Psyche', author: 'Edward Edinger', focus: 'Alchemical symbolism in psychotherapy' },
      { title: 'Alchemical Psychology', author: 'James Hillman', focus: 'Archetypal psychology foundations' },
      { title: 'Active Imagination: Encounters with the Soul', author: 'Jung Institute', focus: 'Jung\'s method for inner dialogue' },
      { title: 'Mysterium Coniunctionis', author: 'C.G. Jung', focus: 'The alchemical conjunction' },
      { title: 'The Creation of Consciousness', author: 'Edward Edinger', focus: 'Ego-Self axis development' },
      { title: 'The Psychology of C.G. Jung', author: 'Jolande Jacobi', focus: 'Comprehensive Jungian overview' },
      { title: 'Lectures on Jung\'s Typology', author: 'von Franz & Hillman', focus: 'Psychological types in depth' },
      { title: 'Invisible Partners', author: 'John Sanford', focus: 'Anima/animus in relationships' },
      { title: 'The Animus', author: 'Barbara Hannah', focus: 'Feminine psychology depth work' },
      { title: 'Marie-Louise von Franz: Archetypal Symbols in Fairytales', author: 'von Franz', focus: 'Fairy tale symbolism' },
      { title: 'Psyche and Matter', author: 'Marie-Louise von Franz', focus: 'Synchronicity and psychophysics' },
      { title: 'C.G. Jung and the Tradition of Gnosis', author: 'Academic Study', focus: 'Gnostic influences on Jung' },
      { title: 'Jung Red Book Guide', author: 'Commentary', focus: 'Navigating the Red Book' },
      { title: 'The Archetypal Imagination', author: 'James Hollis', focus: 'Living archetypal psychology' },
      { title: 'Inner Work: Using Dreams and Active Imagination', author: 'Robert Johnson', focus: 'Practical dream work' },
      { title: 'Jung, Alchemy and Active Imagination', author: 'Research', focus: 'Integration of methods' },
      { title: 'Collective Unconsciousness', author: 'Jung Studies', focus: 'Transpersonal psychology' },
    ],
  },
  {
    id: 'divination',
    title: 'Astrology & Divination Systems',
    icon: Star,
    color: 'amber',
    description: 'Transit astrology, synastry, human design, I Ching, and symbolic timing systems',
    sources: [
      { title: 'Planets in Transit: Life Cycles for Living', author: 'Robert Hand', focus: 'Planetary transit interpretations' },
      { title: 'Transits: What Days Favor You', author: 'Reinhold Ebertin', focus: 'Cosmobiology and timing' },
      { title: 'Astrological Transits: Beginner\'s Guide to Planetary Cycles', author: 'Tutorial', focus: 'Transit fundamentals' },
      { title: 'Outer Planets and Their Cycles', author: 'Liz Greene', focus: 'Collective planetary influences' },
      { title: 'Hayden\'s Book of Synastry & Composite Charts', author: 'Hayden', focus: 'Relationship astrology' },
      { title: 'Horary Astrology', author: 'Geraldine Davis', focus: 'Question-based astrology' },
      { title: 'Instant Horoscope Predictor', author: 'Julia Lupton Skalka', focus: 'Quick chart interpretation' },
      { title: 'Astrological Aspects', author: 'Karen Hamaker-Zondag', focus: 'Aspect interpretation mastery' },
      { title: 'An Astrological Mandala', author: 'Dane Rudhyar', focus: 'Sabian symbols' },
      { title: 'North Node Astrology', author: 'Elizabeth Spring', focus: 'Soul purpose and nodes' },
      { title: 'Rahu-Ketu Predictive Astrology', author: 'Vedic Text', focus: 'Vedic nodal astrology' },
      { title: 'The Stellium Handbook', author: 'Stellium Guide', focus: 'Multiple planet conjunctions' },
      { title: 'The Astrology of I Ching', author: 'Sherrill & Chu', focus: 'East-West synthesis' },
      { title: 'The I Ching: Book of Changes', author: 'Critical Translation', focus: 'Ancient Chinese oracle' },
      { title: 'The 64 Hexagrams of the I Ching', author: 'Study Guide', focus: 'Hexagram meanings' },
      { title: 'The Magician\'s I Ching', author: 'Swami Anand Nisarg', focus: 'Magical applications' },
      { title: 'Human Design: The 64 Gates Guide', author: 'HD Foundation', focus: 'Gate keynotes' },
      { title: 'Understanding the Centers in Human Design', author: 'Robin Winn', focus: 'Energy center dynamics' },
      { title: 'The Variables of Human Design', author: 'Advanced HD', focus: 'Determination and environment' },
      { title: 'Generators Course Human Design', author: 'HD Training', focus: 'Generator type mastery' },
      { title: 'The Book of Lines', author: 'Chetan Parkyn', focus: 'Line interpretations' },
      { title: 'Tracking The Planets in Human Design', author: 'Gate Keynotes', focus: 'Transit gates' },
      { title: 'Human Design Gates Cheat Sheet', author: 'Christie Inge', focus: 'Quick reference' },
    ],
  },
  {
    id: 'enneagram',
    title: 'Enneagram & Personality',
    icon: Sparkles,
    color: 'emerald',
    description: 'Nine-type personality system with spiritual and psychological depth',
    sources: [
      { title: 'The Modern Enneagram', author: 'Kacie Berghoef', focus: 'Contemporary applications' },
      { title: 'History of the Enneagram', author: 'Gurdjieff to Palmer', focus: 'Lineage and development' },
      { title: 'Enneagram Spirituality', author: 'Spiritual Traditions', focus: 'Inner work by type' },
      { title: 'Neuroscientific View on Enneagram', author: 'Research Paper', focus: 'Brain science correlates' },
    ],
  },
  {
    id: 'somatic',
    title: 'Somatic & Body-Based',
    icon: Leaf,
    color: 'teal',
    description: 'Breathwork, interoception, vagus nerve, and embodied awareness practices',
    sources: [
      { title: 'A Practical Guide to Breathwork', author: 'Breathwork Manual', focus: 'Breath techniques' },
      { title: 'Holotropic Breathwork', author: 'Grof Foundation', focus: 'Non-ordinary states' },
      { title: 'Daily Vagus Nerve Exercises', author: 'Polyvagal Practice', focus: 'Nervous system regulation' },
      { title: 'The Interoceptive Mind', author: 'Research Collection', focus: 'Body awareness science' },
      { title: 'Life Force: Sensed Energy, Breathwork, Psychedelia', author: 'Integrative', focus: 'Energy practices' },
      { title: 'Finding Flow', author: 'Mihaly Csikszentmihalyi', focus: 'Optimal experience states' },
    ],
  },
  {
    id: 'philosophy',
    title: 'Philosophy & Consciousness',
    icon: Brain,
    color: 'blue',
    description: 'Process philosophy, phenomenology, panpsychism, and consciousness studies',
    sources: [
      { title: 'Being and Time', author: 'Martin Heidegger', focus: 'Fundamental ontology' },
      { title: 'Modes of Thought', author: 'Alfred North Whitehead', focus: 'Process philosophy' },
      { title: 'The Master and His Emissary (Full)', author: 'Iain McGilchrist', focus: 'Hemispheric differences and worldview' },
      { title: 'The Divided Brain and the Search for Meaning', author: 'McGilchrist', focus: 'Shortened edition' },
      { title: 'Divided Brain, Divided World', author: 'RSA Research', focus: 'Cultural implications' },
      { title: 'Handbook of Panpsychism', author: 'Academic Collection', focus: 'Mind in nature' },
      { title: 'Postmodern Stress Disorder', author: 'Cultural Critique', focus: 'Dopamine and left-brain dominance' },
      { title: 'Tree of Knowledge', author: 'Maturana & Varela', focus: 'Autopoiesis and cognition' },
    ],
  },
  {
    id: 'shamanic',
    title: 'Shamanic & Mythological',
    icon: Sun,
    color: 'orange',
    description: 'World mythology, shamanic traditions, and archetypal narratives',
    sources: [
      { title: 'The Shaman\'s Body', author: 'Arnold Mindell', focus: 'Process-oriented shamanism' },
      { title: 'Jung and Shamanism in Dialogue', author: 'Academic Study', focus: 'Soul retrieval psychology' },
      { title: 'How to Know Higher Worlds', author: 'Rudolf Steiner', focus: 'Esoteric development' },
      { title: 'Norse Mythology', author: 'Mythological Text', focus: 'Northern tradition' },
      { title: 'Ancient Sumerian Mythology', author: 'Gilgamesh and Beyond', focus: 'Mesopotamian origins' },
      { title: 'Egyptian Myths and Legends', author: 'Collection', focus: 'Egyptian mysteries' },
      { title: 'Introduction to Mythology and Folklore', author: 'Academic Text', focus: 'Myth theory foundations' },
      { title: 'Four Theories of Myth', author: 'Comparative Study', focus: 'Mythological interpretation' },
      { title: 'Nature of Mythology and Folklore', author: 'Module', focus: 'Cultural transmission' },
      { title: 'Ancient and Modern Theories in Mythology', author: 'Zoleta', focus: 'Comparative approaches' },
      { title: 'Paradise Lost', author: 'John Milton', focus: 'Western cosmogony' },
    ],
  },
  {
    id: 'esoteric',
    title: 'Esoteric & Sacred Systems',
    icon: BookOpen,
    color: 'indigo',
    description: 'Hermeticism, sacred geometry, alchemical manuscripts, and mystical traditions',
    sources: [
      { title: 'The Secret Teachings of All Ages', author: 'Manly P. Hall', focus: 'Encyclopedia of occult wisdom' },
      { title: 'The Kybalion', author: 'Three Initiates', focus: 'Hermetic principles' },
      { title: 'The Hermetica', author: 'Freke & Gandy', focus: 'Egyptian philosophical texts' },
      { title: 'Alchemy: The Science of Enlightenment', author: 'Esoteric Text', focus: 'Spiritual alchemy' },
      { title: 'Ancient Secret of the Flower of Life', author: 'Drunvalo Melchizedek', focus: 'Sacred geometry' },
      { title: 'The Path to Source and Sacred Geometry', author: 'Geometric Mysticism', focus: 'Divine proportions' },
      { title: 'Third Eye Code Book', author: 'Pineal Activation', focus: 'Inner sight development' },
      { title: '12 Magical Laws of the Universe', author: 'Universal Laws', focus: 'Cosmic principles' },
      { title: 'Code to the Matrix', author: 'Reality Framework', focus: 'Simulation theory' },
      { title: 'Book of Wisdom', author: 'Revival of Wisdom', focus: 'Perennial philosophy' },
      { title: 'The Holy Book of Balance', author: 'Equilibrium Teachings', focus: 'Dynamic balance' },
    ],
  },
  {
    id: 'mayan',
    title: 'Mayan Calendar & Time Science',
    icon: Moon,
    color: 'cyan',
    description: 'Mayan astrology, calendar systems, and cyclical time understanding',
    sources: [
      { title: 'The Mayan Calendar', author: 'Carl Johan Calleman', focus: 'Nine underworlds model' },
      { title: 'Your Mayan Day Sign', author: 'Shay Addams', focus: 'Personal day sign interpretation' },
      { title: 'Convert Your Birth Date Into Mayan Astrology', author: 'Calculation Guide', focus: 'Mayan birth chart' },
      { title: 'Mayan Astrology Explained', author: 'Tutorial', focus: 'System overview' },
      { title: 'The Mayan Signs', author: 'Sign Guide', focus: 'Twenty day signs' },
      { title: 'Mayan Zodiac', author: 'Reference', focus: 'Archetypal meanings' },
    ],
  },
  {
    id: 'neuroscience',
    title: 'Brain Science & Cognition',
    icon: Brain,
    color: 'slate',
    description: 'Whole brain theory, hemispheric integration, and cognitive frameworks',
    sources: [
      { title: 'Whole Brain System', author: 'Herrmann Model', focus: 'Thinking styles' },
      { title: 'Herrmann Whole Brain Thinking', author: 'Training Materials', focus: 'Quadrant model' },
      { title: 'Power of the Mind and Whole Brain Theory', author: 'Chapter 7', focus: 'Mind power applications' },
      { title: 'Developing the Whole Person', author: 'Chapter 3', focus: 'Holistic development' },
      { title: 'Brain Technology', author: 'Enhancement Guide', focus: 'Cognitive optimization' },
      { title: 'Architecture and Empathy', author: 'Embodied Cognition', focus: 'Spatial intelligence' },
      { title: 'Shared Realities', author: 'Intersubjective Research', focus: 'Collective cognition' },
    ],
  },
];

export default function MAIAWisdomSourcesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<string[]>(['therapeutic', 'jungian']);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/maia/community/commons');
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  // Filter sources based on search
  const filteredDomains = wisdomDomains.map(domain => ({
    ...domain,
    sources: domain.sources.filter(source =>
      searchQuery === '' ||
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.focus.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(domain => domain.sources.length > 0 || searchQuery === '');

  // Total source count
  const totalSources = wisdomDomains.reduce((sum, d) => sum + d.sources.length, 0);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Community Commons
          </button>
        </div>

        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D4B896] to-[#B8935A] rounded-xl
                          flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-[#0f1419]" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-[#D4B896] tracking-wide">MAIA's Wisdom Sources</h1>
              <p className="text-[#D4B896]/60 text-sm">The living library informing her guidance</p>
            </div>
          </div>

          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed mb-4">
            MAIA draws upon <span className="text-[#D4B896] font-medium">{totalSources}+ texts</span> spanning
            therapeutic psychology, Jungian depth work, astrology, Human Design, philosophy,
            and sacred traditions. This knowledge is woven into her understanding, allowing
            her to meet you where you are.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4B896]/10 rounded-lg border border-[#D4B896]/20">
            <Sparkles className="w-4 h-4 text-[#D4B896]" />
            <span className="text-sm text-white/70">
              Continuously expanding as new wisdom is integrated
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search sources by title, author, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl
                       text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4B896]/50
                       transition-all"
            />
          </div>
        </div>

        {/* Domain Grid */}
        <div className="space-y-4">
          {filteredDomains.map((domain, idx) => {
            const Icon = domain.icon;
            const colors = getColorClasses(domain.color);
            const isExpanded = expandedDomains.includes(domain.id);

            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl border ${colors.border} overflow-hidden`}
              >
                {/* Domain Header */}
                <button
                  onClick={() => toggleDomain(domain.id)}
                  className={`w-full flex items-center gap-4 p-4 ${colors.bg} hover:bg-white/5 transition-all`}
                >
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold ${colors.text}`}>{domain.title}</h3>
                      <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded">
                        {domain.sources.length} sources
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mt-0.5">{domain.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  )}
                </button>

                {/* Source List */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-black/20">
                    <div className="divide-y divide-white/5">
                      {domain.sources.map((source, sIdx) => (
                        <div
                          key={sIdx}
                          className="px-4 py-3 hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="w-4 h-4 text-white/30 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white/90 truncate">
                                {source.title}
                              </div>
                              <div className="text-xs text-white/40 mt-0.5">
                                {source.author}
                              </div>
                              <div className="text-xs text-white/50 mt-1">
                                {source.focus}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-3 p-6 bg-[#D4B896]/5 border border-[#D4B896]/20 rounded-xl max-w-xl">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#D4B896]" />
              <span className="text-[#D4B896] font-medium">How MAIA Uses This Knowledge</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              These texts are embedded into MAIA's understanding through semantic search.
              When you share something with her, relevant wisdom surfaces naturally -
              never as citation, but as integrated understanding that helps her
              meet you with depth and nuance.
            </p>
            <p className="text-xs text-white/40">
              MAIA doesn't quote sources directly. She weaves their wisdom into presence.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

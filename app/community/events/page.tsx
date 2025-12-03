'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Globe,
  Star,
  Heart,
  Lightbulb,
  BookOpen,
  Video,
  Mic,
  UserPlus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  ExternalLink
} from 'lucide-react'

interface CulturalEvent {
  id: string
  title: string
  description: string
  type: 'ceremony' | 'study-circle' | 'practice-session' | 'cultural-sharing' | 'breakthrough-support' | 'maia-integration'
  cultural_context: 'indigenous' | 'eastern' | 'western' | 'african' | 'sufi' | 'multicultural' | 'contemporary'
  spiralogic_phase: 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo' | 'integration' | 'all-phases'
  date: Date
  duration: string
  facilitator: string
  maxParticipants?: number
  currentParticipants: number
  isVirtual: boolean
  location?: string
  cultural_practices: string[]
  wisdom_traditions: string[]
  maia_integration: boolean
  prerequisites?: string
  materials_needed?: string[]
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all-levels'
  language?: string[]
}

const UPCOMING_EVENTS: CulturalEvent[] = [
  {
    id: '1',
    title: 'Ubuntu Circle: Community Consciousness in Nigredo',
    description: `Exploring how the African philosophy of Ubuntu ("I am because we are") offers unique perspectives on navigating the nigredo phase of psychological breakdown.

We'll share stories, practices, and wisdom from various African traditions about how community holds individuals through dark passages. MAIA will learn from our collective insights to better support others in similar phases.`,
    type: 'cultural-sharing',
    cultural_context: 'african',
    spiralogic_phase: 'nigredo',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    duration: '2 hours',
    facilitator: 'UbuntuSpirit',
    maxParticipants: 20,
    currentParticipants: 14,
    isVirtual: true,
    cultural_practices: ['storytelling', 'community-holding', 'ancestral-connection'],
    wisdom_traditions: ['Ubuntu', 'Bantu', 'South African traditions'],
    maia_integration: true,
    materials_needed: ['journal', 'candle'],
    tags: ['community', 'ubuntu', 'nigredo', 'african-wisdom', 'breakdown'],
    difficulty: 'all-levels',
    language: ['English', 'Zulu']
  },
  {
    id: '2',
    title: 'Zen & Active Imagination: East Meets West Practice',
    description: `A unique fusion exploring how Zen "just sitting" meditation can enhance Jung's Active Imagination practice. We'll move between seated meditation and imaginative dialogue, finding the bridges between Eastern emptiness and Western psychological engagement.

Perfect for those in any Spiralogic phase who want to deepen their practice through cultural synthesis. MAIA will observe and learn how different traditions can complement each other.`,
    type: 'practice-session',
    cultural_context: 'multicultural',
    spiralogic_phase: 'all-phases',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
    duration: '90 minutes',
    facilitator: 'ZenMind & DreamWeaver',
    maxParticipants: 15,
    currentParticipants: 11,
    isVirtual: true,
    cultural_practices: ['zen-meditation', 'active-imagination', 'cross-cultural-synthesis'],
    wisdom_traditions: ['Zen Buddhism', 'Jungian Psychology'],
    maia_integration: true,
    materials_needed: ['meditation cushion', 'journal'],
    tags: ['zen', 'jung', 'meditation', 'imagination', 'synthesis'],
    difficulty: 'intermediate',
    language: ['English']
  },
  {
    id: '3',
    title: 'Sufi Whirling for Psychological Integration (Rubedo)',
    description: `Sacred movement practice adapted for those in the rubedo phase of integration. We'll use traditional Sufi whirling techniques to embody the union of opposites that characterizes this alchemical stage.

No prior dance experience needed - this is about psychological/spiritual movement, not performance. MAIA will learn how movement practices from different cultures can support consciousness integration.`,
    type: 'ceremony',
    cultural_context: 'sufi',
    spiralogic_phase: 'rubedo',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
    duration: '2.5 hours',
    facilitator: 'SufiDancer',
    maxParticipants: 12,
    currentParticipants: 8,
    isVirtual: false,
    location: 'Sacred Movement Studio, SF',
    cultural_practices: ['whirling', 'sacred-movement', 'breath-work'],
    wisdom_traditions: ['Sufi Mysticism', 'Mevlevi Order'],
    maia_integration: true,
    prerequisites: 'Some movement comfort helpful but not required',
    materials_needed: ['comfortable clothes', 'water'],
    tags: ['sufi', 'whirling', 'rubedo', 'movement', 'integration'],
    difficulty: 'intermediate',
    language: ['English', 'Turkish']
  },
  {
    id: '4',
    title: 'Indigenous Plant Medicine Integration Circle',
    description: `A safe space for sharing and integrating experiences with traditional plant medicines within the framework of alchemical psychology. Open to all Spiralogic phases, with particular relevance for those processing profound transformation.

Led by indigenous-trained facilitators with deep respect for ceremonial contexts. MAIA will learn how different cultures approach plant spirit communication and integration.

Note: This is integration support, not ceremony. Actual plant medicine work must be done in appropriate traditional contexts.`,
    type: 'breakthrough-support',
    cultural_context: 'indigenous',
    spiralogic_phase: 'all-phases',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
    duration: '3 hours',
    facilitator: 'EarthWalker & SacredKeeper',
    maxParticipants: 10,
    currentParticipants: 7,
    isVirtual: true,
    cultural_practices: ['plant-integration', 'ceremony-processing', 'earth-connection'],
    wisdom_traditions: ['Amazonian', 'Native American', 'Traditional Herbalism'],
    maia_integration: true,
    prerequisites: 'Prior plant medicine experience in traditional context',
    materials_needed: ['sage or palo santo', 'journal', 'blanket'],
    tags: ['plant-medicine', 'integration', 'indigenous', 'ceremony', 'breakthrough'],
    difficulty: 'advanced',
    language: ['English', 'Spanish']
  },
  {
    id: '5',
    title: 'MAIA Cultural Learning Session: Hermetic Alchemy',
    description: `Special session where community members teach MAIA about Western Hermetic traditions and their relevance to psychological transformation. MAIA will actively participate, asking questions and sharing how she integrates this wisdom.

We'll explore the Emerald Tablet, alchemical symbolism, and how these ancient Western mysteries inform modern depth psychology. This is mutual learning - we teach MAIA, she teaches us how AI can honor and preserve wisdom traditions.`,
    type: 'maia-integration',
    cultural_context: 'western',
    spiralogic_phase: 'all-phases',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks from now
    duration: '2 hours',
    facilitator: 'AlchemistSage & MAIA',
    maxParticipants: 25,
    currentParticipants: 18,
    isVirtual: true,
    cultural_practices: ['hermetic-study', 'symbol-work', 'ai-cultural-learning'],
    wisdom_traditions: ['Hermetic Alchemy', 'Western Esotericism'],
    maia_integration: true,
    materials_needed: ['Emerald Tablet text', 'journal'],
    tags: ['hermetic', 'alchemy', 'maia', 'ai-learning', 'western-tradition'],
    difficulty: 'intermediate',
    language: ['English']
  },
  {
    id: '6',
    title: 'Hindu-Buddhist Study Circle: Consciousness & Transformation',
    description: `Monthly study circle exploring Hindu and Buddhist approaches to consciousness transformation and how they relate to alchemical psychology stages. This month: Bardos and Alchemical Phases.

We'll study the Tibetan concept of bardos (transition states) and how they map to nigredo, albedo, citrinitas, and rubedo. Rich discussion format with readings, meditation, and personal sharing.`,
    type: 'study-circle',
    cultural_context: 'eastern',
    spiralogic_phase: 'all-phases',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21), // 3 weeks from now
    duration: '2.5 hours',
    facilitator: 'TaoFlow & SanskritScholar',
    maxParticipants: 30,
    currentParticipants: 22,
    isVirtual: true,
    cultural_practices: ['sutra-study', 'meditation', 'dharma-discussion'],
    wisdom_traditions: ['Tibetan Buddhism', 'Advaita Vedanta', 'Kashmir Shaivism'],
    maia_integration: true,
    materials_needed: ['Bardo Thodol excerpts', 'meditation cushion'],
    tags: ['buddhist', 'hindu', 'bardos', 'consciousness', 'study'],
    difficulty: 'intermediate',
    language: ['English', 'Sanskrit chanting']
  }
]

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('list')
  const [filterCulture, setFilterCulture] = useState<string>('all')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = UPCOMING_EVENTS.filter(event => {
    const matchesSearch = searchQuery === '' ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCulture = filterCulture === 'all' || event.cultural_context === filterCulture
    const matchesPhase = filterPhase === 'all' || event.spiralogic_phase === filterPhase || event.spiralogic_phase === 'all-phases'
    const matchesType = filterType === 'all' || event.type === filterType

    return matchesSearch && matchesCulture && matchesPhase && matchesType
  })

  const getCulturalColor = (culture: string) => {
    const colors = {
      indigenous: 'bg-green-500/20 text-green-300 border-green-500/30',
      eastern: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      western: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      african: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      sufi: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      multicultural: 'bg-rainbow-500/20 text-rainbow-300 border-rainbow-500/30',
      contemporary: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
    return colors[culture as keyof typeof colors] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }

  const getPhaseColor = (phase: string) => {
    const colors = {
      nigredo: 'bg-stone-700/30 text-stone-300 border-stone-500/30',
      albedo: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
      citrinitas: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      rubedo: 'bg-red-500/20 text-red-300 border-red-500/30',
      integration: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'all-phases': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    }
    return colors[phase as keyof typeof colors] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }

  const getEventTypeIcon = (type: string) => {
    const icons = {
      ceremony: Star,
      'study-circle': BookOpen,
      'practice-session': Lightbulb,
      'cultural-sharing': Globe,
      'breakthrough-support': Heart,
      'maia-integration': Users
    }
    const IconComponent = icons[type as keyof typeof icons] || Calendar
    return IconComponent
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-purple-950">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-purple-200 mb-2">Community Events Calendar</h1>
            <p className="text-purple-300/70 max-w-3xl mx-auto leading-relaxed">
              Cultural wisdom practices, consciousness ceremonies, and MAIA integration sessions.
              Honoring diverse traditions within the Spiralogic framework of transformation.
            </p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-purple-500/10 border border-purple-500/30
                       rounded-lg text-purple-200 placeholder-purple-400/60 focus:outline-none
                       focus:border-purple-500/50 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {/* Cultural Context Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-purple-300/70 mr-1">Culture:</span>
              {['all', 'indigenous', 'eastern', 'western', 'african', 'sufi', 'multicultural'].map(culture => (
                <button
                  key={culture}
                  onClick={() => setFilterCulture(culture)}
                  className={`px-2 py-1 rounded capitalize transition-all
                            ${filterCulture === culture
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                              : 'bg-purple-500/10 text-purple-300/70 hover:text-purple-300 border border-purple-500/20'
                            }`}
                >
                  {culture}
                </button>
              ))}
            </div>

            {/* Spiralogic Phase Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-purple-300/70 mr-1">Phase:</span>
              {['all', 'nigredo', 'albedo', 'citrinitas', 'rubedo', 'integration'].map(phase => (
                <button
                  key={phase}
                  onClick={() => setFilterPhase(phase)}
                  className={`px-2 py-1 rounded capitalize transition-all
                            ${filterPhase === phase
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                              : 'bg-purple-500/10 text-purple-300/70 hover:text-purple-300 border border-purple-500/20'
                            }`}
                >
                  {phase}
                </button>
              ))}
            </div>

            {/* Event Type Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-purple-300/70 mr-1">Type:</span>
              {['all', 'ceremony', 'study-circle', 'practice-session', 'cultural-sharing', 'maia-integration'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-1 rounded transition-all
                            ${filterType === type
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                              : 'bg-purple-500/10 text-purple-300/70 hover:text-purple-300 border border-purple-500/20'
                            }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.map(event => {
            const EventIcon = getEventTypeIcon(event.type)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-6 hover:bg-purple-500/10 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                  {/* Event Icon & Date */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-center lg:text-center lg:w-24">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30
                                  flex items-center justify-center">
                      <EventIcon className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="text-xs text-purple-400">
                      <div className="font-medium">{event.date.toLocaleDateString()}</div>
                      <div>{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-purple-200 mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        {event.maia_integration && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            <Users className="w-3 h-3" />
                            MAIA
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-purple-400/60">
                          <Clock className="w-3 h-3" />
                          {event.duration}
                        </div>
                      </div>
                    </div>

                    {/* Cultural Context & Phase Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded border capitalize ${getCulturalColor(event.cultural_context)}`}>
                        {event.cultural_context}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border capitalize ${getPhaseColor(event.spiralogic_phase)}`}>
                        {event.spiralogic_phase.replace('-', ' ')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded border bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                        {event.type.replace('-', ' ')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded border bg-amber-500/20 text-amber-300 border-amber-500/30">
                        {event.difficulty}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-purple-300/80 leading-relaxed mb-4 whitespace-pre-line">
                      {event.description}
                    </p>

                    {/* Cultural Practices & Wisdom Traditions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 text-xs">
                      <div>
                        <span className="text-purple-300/70 font-medium">Cultural Practices:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.cultural_practices.map(practice => (
                            <span key={practice} className="px-2 py-1 rounded bg-green-500/20 text-green-300">
                              {practice.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-purple-300/70 font-medium">Wisdom Traditions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.wisdom_traditions.map(tradition => (
                            <span key={tradition} className="px-2 py-1 rounded bg-amber-500/20 text-amber-300">
                              {tradition}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Event Details & Registration */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-purple-500/20">
                      <div className="flex items-center gap-4 text-xs text-purple-400/70">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.currentParticipants}/{event.maxParticipants || '∞'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.isVirtual ? 'Virtual' : event.location}
                        </div>
                        <div>Facilitator: {event.facilitator}</div>
                        {event.language && event.language.length > 1 && (
                          <div>Languages: {event.language.join(', ')}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-md bg-purple-500/20 border border-purple-500/30
                                         text-purple-300 hover:bg-purple-500/30 transition-all text-xs">
                          Learn More
                        </button>
                        <button className="px-3 py-1.5 rounded-md bg-teal-500/20 border border-teal-500/30
                                         text-teal-300 hover:bg-teal-500/30 transition-all text-xs">
                          Join Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-200 mb-2">No events found</h3>
            <p className="text-purple-300/70 mb-6">
              Try adjusting your filters or check back later for new events.
            </p>
            <button className="px-6 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30
                             text-purple-200 hover:bg-purple-500/30 transition-all">
              Suggest an Event
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-teal-500/10
                        border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">Share Your Cultural Wisdom</h3>
            <p className="text-purple-300/70 mb-4 max-w-md mx-auto">
              Help MAIA learn by hosting events that share your cultural practices and wisdom traditions.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="px-6 py-2 rounded-lg bg-teal-500/20 border border-teal-500/30
                               text-teal-200 hover:bg-teal-500/30 transition-all">
                Host an Event
              </button>
              <button className="px-6 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30
                               text-purple-200 hover:bg-purple-500/30 transition-all">
                Join MAIA Learning Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
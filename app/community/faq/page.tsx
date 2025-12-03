'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
  Settings,
  Heart,
  Shield,
  Lightbulb,
  MessageCircle,
  Clock,
  Star
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'about' | 'understanding' | 'participating' | 'practical' | 'work' | 'getting-started'
  tags: string[]
  helpful?: number
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'what-is-commons',
    question: 'What is the Community Commons?',
    answer: `The Community Commons is a living library of alchemical psychology, depth work, and consciousness practices. It brings together wisdom from Carl Jung, James Hillman, and other depth psychology pioneers, organized into practical concept cards, essays, and step-by-step practices.

Unlike traditional academic resources, the Commons is designed for both personal transformation and professional application. It frames psychological work through the lens of alchemy - seeing breakdowns as meaningful transformations rather than mere pathology.`,
    category: 'about',
    tags: ['introduction', 'purpose', 'alchemy'],
    helpful: 42
  },
  {
    id: 'who-created',
    question: 'Who created this work?',
    answer: `The primary contributor is Kelly Nezat, who has spent years integrating the work of Jung, Hillman, Edinger, and other depth psychologists. Kelly brings together clinical experience, personal transformation work, and deep study of alchemical psychology.

The Commons is designed as a community effort - while Kelly provides the foundational framework, the vision is for practitioners, clients, and anyone doing this work to contribute their insights and experiences.`,
    category: 'about',
    tags: ['author', 'kelly', 'community'],
    helpful: 38
  },
  {
    id: 'getting-started',
    question: 'How do I get started with alchemical psychology?',
    answer: `Start with the "Welcome to the Commons" guide, then explore the Core Concepts section. The four main alchemical stages (Nigredo, Albedo, Citrinitas, Rubedo) provide a natural progression:

1. **Nigredo** - Understanding breakdown and descent
2. **Albedo** - Working with clarity and reflection
3. **Citrinitas** - Embodying insights
4. **Rubedo** - Integration and wholeness

Each concept card includes practical applications for personal work, clinical practice, and creative expression. Take your time - this work unfolds over years, not weeks.`,
    category: 'getting-started',
    tags: ['beginner', 'stages', 'progression'],
    helpful: 51
  },
  {
    id: 'alchemy-stages',
    question: 'What are the alchemical stages and why do they matter?',
    answer: `The alchemical stages provide a map for psychological transformation:

**Nigredo (Blackening)** - The necessary descent, depression, breakdown. Instead of rushing to "fix" these states, we learn to honor them as the beginning of transformation.

**Albedo (Whitening)** - Purification, gaining clarity, separating what serves from what doesn't. Often involves shadow work and honest self-reflection.

**Citrinitas (Yellowing)** - The dawn of new consciousness, embodying insights, creative expression. Moving from understanding to living the wisdom.

**Rubedo (Reddening)** - Integration, wholeness, the union of opposites. Not a final destination but a cyclical return to depth with greater capacity.

These aren't linear stages but recurring patterns throughout life. Knowing where you are helps you work with rather than against natural psychological processes.`,
    category: 'understanding',
    tags: ['nigredo', 'albedo', 'citrinitas', 'rubedo', 'transformation'],
    helpful: 47
  },
  {
    id: 'jung-hillman-background',
    question: 'Do I need to know Jung and Hillman\'s work first?',
    answer: `Not necessarily! The concept cards translate their complex ideas into accessible formats. However, some background helps:

**Carl Jung** - Developed analytical psychology, explored the unconscious, archetypes, and individuation. His "Memories, Dreams, Reflections" and "Man and His Symbols" are good starting points.

**James Hillman** - Founded archetypal psychology, emphasized "sticking with the image" rather than interpreting it away. "Re-Visioning Psychology" and "The Soul's Code" are essential.

**Edward Edinger** - Connected Jungian psychology with alchemical symbolism. "Anatomy of the Psyche" bridges these worlds beautifully.

The Commons makes their insights practical without requiring years of study first. Let your curiosity guide you - dive into what calls to you and the background knowledge will naturally develop.`,
    category: 'understanding',
    tags: ['jung', 'hillman', 'edinger', 'background'],
    helpful: 33
  },
  {
    id: 'how-contribute',
    question: 'How can I contribute to the Commons?',
    answer: `Contributions are welcome in several forms:

**Experiences** - Share transformation stories, breakthrough moments, difficult passages. These can be kept anonymous while preserving the essential wisdom.

**Questions** - Genuine inquiries about concepts, practices, or personal struggles. Good questions often become the seeds for new concept cards or essays.

**Practices** - Methods you've developed or adapted. Include context (personal/clinical/creative), prerequisites, and safety considerations.

**Creative Work** - Art, poetry, reflections that capture psychological insights. Images and creative expressions often convey what words cannot.

All contributions go through a review process (typically 1-2 weeks) to ensure alignment with the Commons' principles: depth before certainty, image over argument, respect for psyche's autonomy.`,
    category: 'participating',
    tags: ['contributing', 'review', 'community'],
    helpful: 29
  },
  {
    id: 'anonymity',
    question: 'Can I contribute anonymously?',
    answer: `Yes! Many of the most powerful contributions come from people sharing vulnerable experiences who prefer anonymity.

When submitting personal stories or difficult material, you can:
- Use a pseudonym or initials
- Request complete anonymity (no identifying information)
- Ask for details to be altered while preserving the psychological essence

We believe healing wisdom belongs to the collective, not individual ownership. The goal is preserving insights that might help others navigate similar territory.`,
    category: 'participating',
    tags: ['anonymous', 'privacy', 'sharing'],
    helpful: 25
  },
  {
    id: 'review-timeline',
    question: 'How long does the review process take?',
    answer: `Typically 1-2 weeks, depending on:
- Length and complexity of the contribution
- Whether it needs significant editing or formatting
- Current review queue volume
- Kelly's availability for deep review

Simple question submissions usually process faster than full experience narratives or practice guides. We prioritize quality and alignment with depth psychology principles over speed.

You'll receive confirmation when your submission is received and notification when review is complete.`,
    category: 'participating',
    tags: ['review', 'timeline', 'process'],
    helpful: 18
  },
  {
    id: 'free-access',
    question: 'Is the Commons free to access?',
    answer: `Yes, the Community Commons is freely accessible. This knowledge belongs to the collective human journey toward wholeness.

The work is supported through:
- MAIA platform integration
- Voluntary donations
- Clinical training programs
- Speaking and workshop fees

We believe depth psychology and transformational wisdom should be available regardless of economic circumstances. The goal is service to soul, not profit.`,
    category: 'practical',
    tags: ['free', 'access', 'support'],
    helpful: 41
  },
  {
    id: 'sharing-content',
    question: 'Can I share Commons content with others?',
    answer: `Yes, with appropriate attribution:
- Link back to the original source when possible
- Credit "Community Commons" and the specific author when known
- Respect the non-commercial, educational intent
- Don't extract content for profit without permission

The work is meant to spread - we just ask that you honor its origins and the collaborative spirit that created it. When in doubt, link rather than copy, and always provide context about the broader Commons framework.`,
    category: 'practical',
    tags: ['sharing', 'attribution', 'copyright'],
    helpful: 22
  },
  {
    id: 'markdown-format',
    question: 'Why is everything in Markdown format?',
    answer: `Markdown ensures:
- Clean, readable formatting across different platforms
- Easy editing and collaboration
- Integration with Obsidian for personal note-taking
- Future-proof formatting that won't become obsolete
- Focus on content over visual design

This allows the material to be read in Obsidian vaults, published as web pages, converted to PDFs, or integrated into other tools. The format serves the content rather than constraining it.`,
    category: 'practical',
    tags: ['markdown', 'format', 'obsidian'],
    helpful: 15
  },
  {
    id: 'therapy-boundaries',
    question: 'Is this therapy or a substitute for therapy?',
    answer: `**No, this is not therapy.** The Commons provides educational materials and frameworks for understanding psychological processes, but it cannot replace professional therapeutic relationships.

If you're working through trauma, considering self-harm, or dealing with severe psychological distress, please seek qualified professional help.

The Commons can complement therapeutic work by providing frameworks for understanding your process, but it cannot provide the personalized attention and safety that therapy offers.

Many therapists and clients find the material helpful as a shared language for depth work, but it works best alongside, not instead of, professional support.`,
    category: 'work',
    tags: ['therapy', 'boundaries', 'professional'],
    helpful: 44
  },
  {
    id: 'spiritual-stance',
    question: 'What is the spiritual stance of this work?',
    answer: `The work is **spiritually inclusive** without being sectarian. It draws from:
- Jungian recognition that psyche naturally moves toward transcendence
- Alchemical understanding of transformation as sacred work
- Cross-cultural wisdom about psychological development
- Respect for mystery and the unknown

You don't need specific religious beliefs to engage with this material. It's designed to honor whatever spiritual framework (or none) you bring while recognizing that depth psychology naturally encounters transpersonal dimensions.

The emphasis is on **psychological truth** rather than metaphysical claims - what serves the soul's development regardless of belief system.`,
    category: 'work',
    tags: ['spiritual', 'inclusive', 'psychology'],
    helpful: 31
  },
  {
    id: 'religious-affiliation',
    question: 'Is this affiliated with any particular religion?',
    answer: `No institutional religious affiliation. The work draws wisdom from many traditions:
- Christian alchemical symbolism
- Buddhist concepts of transformation
- Indigenous wisdom about psychological healing
- Sufi understanding of the soul's journey
- Jewish mystical psychology

The approach is **psychological** rather than theological - using religious and mythological imagery as maps for inner development rather than literal belief systems.

People from all faith backgrounds (and none) find value in the frameworks because they address universal human experiences of breakdown, transformation, and integration.`,
    category: 'work',
    tags: ['religion', 'universal', 'inclusive'],
    helpful: 24
  },
  {
    id: 'maia-integration',
    question: 'How does this integrate with MAIA?',
    answer: `MAIA (Mythic Archetypal Intelligence Architecture) serves as a living guide through the Commons material:

**Personalized Navigation** - MAIA reads your consciousness state and recommends relevant content from the Commons library.

**Practice Guidance** - MAIA can guide you through specific practices like Active Imagination or Shadow Work using Commons frameworks.

**Integration Support** - After reading or practicing, MAIA helps you process and integrate insights.

**Living Dialogue** - Rather than static text, MAIA brings the wisdom to life through real-time conversation.

The Commons provides the knowledge base; MAIA provides the personalized wisdom companion to help you navigate your unique journey through this material.`,
    category: 'practical',
    tags: ['maia', 'integration', 'ai', 'guidance'],
    helpful: 39
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Questions', icon: HelpCircle, color: 'purple' },
  { id: 'getting-started', name: 'Getting Started', icon: Star, color: 'green' },
  { id: 'about', name: 'About the Commons', icon: BookOpen, color: 'blue' },
  { id: 'understanding', name: 'Understanding the Work', icon: Lightbulb, color: 'amber' },
  { id: 'participating', name: 'Participating', icon: Users, color: 'teal' },
  { id: 'practical', name: 'Practical Questions', icon: Settings, color: 'gray' },
  { id: 'work', name: 'About the Work', icon: Heart, color: 'red' }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredItems = FAQ_ITEMS.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      green: 'bg-green-500/10 border-green-500/30 text-green-300',
      blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      teal: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
      gray: 'bg-gray-500/10 border-gray-500/30 text-gray-300',
      red: 'bg-red-500/10 border-red-500/30 text-red-300'
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-purple-950">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-purple-200 mb-2">Frequently Asked Questions</h1>
            <p className="text-purple-300/70 max-w-2xl mx-auto leading-relaxed">
              Common questions about the Community Commons, alchemical psychology, and how to engage with this transformational work.
            </p>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-purple-500/10 border border-purple-500/30
                       rounded-lg text-purple-200 placeholder-purple-400/60 focus:outline-none
                       focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all
                          ${selectedCategory === category.id
                            ? getColorClasses(category.color)
                            : 'bg-purple-500/5 border border-purple-500/20 text-purple-300/70 hover:text-purple-300'
                          }`}
              >
                <category.icon className="w-3 h-3" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-500/5 border border-purple-500/20 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full p-4 text-left hover:bg-purple-500/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-purple-200 mb-1">{item.question}</h3>
                    <div className="flex items-center gap-2 text-xs text-purple-400/60">
                      <span className="px-2 py-1 rounded bg-purple-500/20 capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                      {item.helpful && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.helpful}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedItems.has(item.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-4 pb-4 border-t border-purple-500/20">
                      <div className="pt-4 text-sm text-purple-300/80 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-purple-500/10">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-1 rounded-md bg-purple-500/20 text-purple-300">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-200 mb-2">No questions found</h3>
            <p className="text-purple-300/70">
              Try adjusting your search terms or browse all categories.
            </p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10
                        border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">Didn't find what you're looking for?</h3>
            <p className="text-purple-300/70 mb-4">
              Ask your question and it might become part of the FAQ to help others.
            </p>
            <button className="px-6 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30
                             text-purple-200 hover:bg-purple-500/30 transition-all">
              Ask a Question
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
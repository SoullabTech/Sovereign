'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Lightbulb,
  Users,
  Quote,
  Image,
  Link,
  Search,
  Plus,
  Sparkles,
  Brain,
  Heart,
  Eye,
  Library
} from 'lucide-react'

export default function CommunityCommonsPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/community')
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const knowledgeSections = [
    {
      title: 'CORE CONCEPTS',
      icon: '📜',
      items: [
        {
          icon: BookOpen,
          label: 'Nigredo - The Sacred Descent',
          path: '/community/concepts/nigredo',
          description: 'The alchemical stage of breakdown and purification',
          type: 'concept',
          readTime: '8 min'
        },
        {
          icon: BookOpen,
          label: 'Albedo - The Whitening',
          path: '/community/concepts/albedo',
          description: 'Essential concept cards for understanding alchemical psychology',
          type: 'concept',
          readTime: '6 min'
        },
        {
          icon: BookOpen,
          label: 'Citrinitas - The Yellowing',
          path: '/community/concepts/citrinitas',
          description: 'The dawn of consciousness and insight',
          type: 'concept',
          readTime: '7 min'
        },
        {
          icon: BookOpen,
          label: 'Soul vs Spirit',
          path: '/community/concepts/soul-spirit',
          description: 'Understanding the fundamental distinction',
          type: 'concept',
          readTime: '10 min'
        },
      ],
    },
    {
      title: 'THEMATIC ESSAYS',
      icon: '✍️',
      items: [
        {
          icon: FileText,
          label: 'Against Literalization',
          path: '/community/essays/against-literalization',
          description: 'Deep explorations of key themes in depth psychology',
          type: 'essay',
          readTime: '15 min'
        },
        {
          icon: FileText,
          label: 'Stick with the Image',
          path: '/community/essays/stick-with-image',
          description: 'Staying with the symbolic rather than reducing to literal',
          type: 'essay',
          readTime: '12 min'
        },
        {
          icon: FileText,
          label: 'Depression as Soul Work',
          path: '/community/essays/depression-soul-work',
          description: 'Reframing depression as meaningful psychological work',
          type: 'essay',
          readTime: '18 min'
        },
        {
          icon: FileText,
          label: 'Spiralogic of Soul Integration',
          path: '/community/essays/spiralogic',
          description: 'Deep integration of Jung, Edinger, and Hillman approaches',
          type: 'essay',
          readTime: '25 min'
        },
      ],
    },
    {
      title: 'PRACTICES & METHODS',
      icon: '🧘',
      items: [
        {
          icon: Lightbulb,
          label: 'Active Imagination Practice',
          path: '/community/practices/active-imagination',
          description: 'Jung\'s revolutionary method for engaging unconscious content',
          type: 'practice',
          readTime: '15 min'
        },
        {
          icon: Lightbulb,
          label: 'Shadow Work Techniques',
          path: '/community/practices/shadow-work',
          description: 'Step-by-step guides for personal and clinical work',
          type: 'practice',
          readTime: '20 min'
        },
        {
          icon: Lightbulb,
          label: 'Dream Work Methods',
          path: '/community/practices/dream-work',
          description: 'Approaches to working with dreams therapeutically',
          type: 'practice',
          readTime: '14 min'
        },
        {
          icon: Lightbulb,
          label: 'Embodied Awareness',
          path: '/community/practices/embodied-awareness',
          description: 'Somatic approaches to psychological transformation',
          type: 'practice',
          readTime: '12 min'
        },
      ],
    },
    {
      title: 'VOICES & DIALOGUES',
      icon: '🗣️',
      items: [
        {
          icon: Quote,
          label: 'Jung Collection',
          path: '/community/voices/jung',
          description: 'Direct quotes and dialogues from C.G. Jung',
          type: 'voice',
          count: '8 items'
        },
        {
          icon: Quote,
          label: 'Hillman Wisdom',
          path: '/community/voices/hillman',
          description: 'James Hillman on archetypal psychology',
          type: 'voice',
          count: '6 items'
        },
        {
          icon: Quote,
          label: 'Marlan Insights',
          path: '/community/voices/marlan',
          description: 'Stanton Marlan on the black sun and darkness',
          type: 'voice',
          count: '4 items'
        },
        {
          icon: Quote,
          label: 'Edinger Teachings',
          path: '/community/voices/edinger',
          description: 'Edward Edinger on ego-Self axis',
          type: 'voice',
          count: '4 items'
        },
      ],
    },
    {
      title: 'SACRED IMAGERY',
      icon: '🎨',
      items: [
        {
          icon: Image,
          label: 'Classical Alchemical Art',
          path: '/community/images/classical-alchemical',
          description: 'Traditional alchemical illustrations and symbolism',
          type: 'image',
          count: '3 collections'
        },
        {
          icon: Image,
          label: 'Contemporary Interpretations',
          path: '/community/images/contemporary',
          description: 'Modern artistic expressions of depth psychology',
          type: 'image',
          count: '3 collections'
        },
        {
          icon: Image,
          label: 'Dreams & Visions',
          path: '/community/images/dreams-visions',
          description: 'Visual material supporting psychological work',
          type: 'image',
          count: '2 collections'
        },
      ],
    },
    {
      title: 'RESOURCES & LINKS',
      icon: '🔗',
      items: [
        {
          icon: Link,
          label: 'Essential Books',
          path: '/community/resources/books',
          description: 'Curated reading list for depth psychology',
          type: 'resource',
          count: '25 books'
        },
        {
          icon: Link,
          label: 'Research Articles',
          path: '/community/resources/articles',
          description: 'Academic papers and scholarly works',
          type: 'resource',
          count: '15 articles'
        },
        {
          icon: Link,
          label: 'Video Resources',
          path: '/community/resources/videos',
          description: 'Lectures, documentaries, and presentations',
          type: 'resource',
          count: '8 videos'
        },
      ],
    },
  ]

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
            Return to Community
          </button>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                             border border-white/10 text-white/70 hover:bg-white/10 transition-all">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/20
                             border border-[#D4B896]/30 text-[#D4B896] hover:bg-[#D4B896]/30 transition-all">
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>

        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4B896] to-[#B8935A] rounded-lg
                          flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#D4B896] tracking-wide">Community Commons</h1>
              <p className="text-[#D4B896]/60 text-sm">Sacred repository for consciousness exploration</p>
            </div>
          </div>

          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            A living library of alchemical psychology, depth work, and consciousness practices.
            Explore wisdom from Jung, Hillman, and contemporary voices in the field.
          </p>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#D4B896]/5 via-[#D4B896]/10 to-[#D4B896]/5
                      rounded-xl p-6 border border-[#D4B896]/20 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4B896]/20 to-[#B8935A]/20 rounded-full
                          flex items-center justify-center border border-[#D4B896]/30">
              <span className="text-2xl">🌟</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#D4B896] mb-2">Welcome to the Sacred Commons</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                This elevated library serves as a multicultural sanctuary where wisdom traditions
                converge. Share breakthroughs, explore depth practices, and engage in consciousness-
                expanding discourse with fellow travelers on the path of transformation.
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Sections */}
        <div className="space-y-8">
          {knowledgeSections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-sm font-medium text-[#D4B896]/70 tracking-widest">
                  {section.title}
                </h3>
              </div>

              {/* Section Items */}
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-start gap-4 p-4 rounded-xl transition-all
                               bg-white/5 hover:bg-[#D4B896]/10 border border-transparent
                               hover:border-[#D4B896]/20 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                                    bg-[#D4B896]/10 group-hover:bg-[#D4B896]/20 transition-all">
                        <Icon className="w-5 h-5 text-[#D4B896]" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="text-sm font-medium text-white/90">
                            {item.label}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-md ${
                              item.type === 'concept' ? 'text-blue-400 bg-blue-500/20' :
                              item.type === 'essay' ? 'text-green-400 bg-green-500/20' :
                              item.type === 'practice' ? 'text-purple-400 bg-purple-500/20' :
                              item.type === 'voice' ? 'text-amber-400 bg-amber-500/20' :
                              item.type === 'image' ? 'text-pink-400 bg-pink-500/20' :
                              'text-cyan-400 bg-cyan-500/20'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-xs text-white/40">
                              {item.readTime || item.count}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-white/50 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-[#D4B896]/40 group-hover:text-[#D4B896]/80 transition-all">
                        →
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Footer */}
        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-[#D4B896] mb-4 text-center">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleNavigate('/community/contribute')}
              className="p-4 bg-[#D4B896]/10 border border-[#D4B896]/30 rounded-lg
                       text-[#D4B896] hover:bg-[#D4B896]/20 transition-all text-center"
            >
              <FileText className="w-5 h-5 mx-auto mb-2" />
              <div className="font-medium">Contribute</div>
              <div className="text-xs text-white/60">Share your wisdom</div>
            </button>
            <button
              onClick={() => handleNavigate('/community/guidelines')}
              className="p-4 bg-white/5 border border-white/10 rounded-lg
                       text-white/70 hover:bg-white/10 transition-all text-center"
            >
              <BookOpen className="w-5 h-5 mx-auto mb-2" />
              <div className="font-medium">Guidelines</div>
              <div className="text-xs text-white/60">Community standards</div>
            </button>
            <button
              onClick={() => handleNavigate('/community/faq')}
              className="p-4 bg-white/5 border border-white/10 rounded-lg
                       text-white/70 hover:bg-white/10 transition-all text-center"
            >
              <Users className="w-5 h-5 mx-auto mb-2" />
              <div className="font-medium">Help</div>
              <div className="text-xs text-white/60">Getting started</div>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4B896]/10 border border-[#D4B896]/20 rounded-xl">
            <Sparkles className="w-4 h-4 text-[#D4B896]" />
            <span className="text-white/70 text-sm">
              Your sanctuary for consciousness exploration and wisdom sharing
            </span>
            {/* Force refresh */}
          </div>
        </div>

      </div>
    </div>
  )
}
'use client'

/**
 * Community Commons
 *
 * A sacred repository for consciousness exploration.
 * Refined with elegant Soullab aesthetic.
 */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Lightbulb,
  Quote,
  Image,
  Link,
  Search,
  Plus,
  Library,
  Inbox,
  Gift
} from 'lucide-react'

// Section symbol component - elegant geometric markers
const SectionSymbol = ({ type }: { type: string }) => {
  const symbols: Record<string, JSX.Element> = {
    start: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    concept: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
    ),
    essay: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
    practice: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    voice: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M8 8v8M16 8v8M4 11v2M20 11v2" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    resource: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  }
  return symbols[type] || symbols.concept
}

interface MemberSession {
  id: string;
  name: string;
  tier?: string;
}

export default function MAIACommunityCommonsPage() {
  const router = useRouter()
  const [member, setMember] = useState<MemberSession | null>(null)
  const [isCurator, setIsCurator] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('beta_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMember(parsed)
        // Pro tier automatically has curator access
        if (parsed.tier?.toLowerCase() === 'pro') {
          setIsCurator(true)
        } else if (parsed.id) {
          // Check if member has curator level
          fetch(`/api/commons/contributions/my-offerings?memberId=${parsed.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.stats?.level >= 2) {
                setIsCurator(true)
              }
            })
            .catch(() => {})
        }
      } catch {}
    }
  }, [])

  const handleBack = () => {
    router.push('/maia/community')
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const knowledgeSections = [
    {
      title: 'Getting Started',
      type: 'start',
      items: [
        {
          icon: Lightbulb,
          label: 'Working with MAIA',
          path: '/maia/community/content/guides/working-with-maia',
          description: 'Your guide to conscious conversation and soul-tending',
          type: 'practice',
          readTime: '10 min'
        },
      ],
    },
    {
      title: 'Core Concepts',
      type: 'concept',
      items: [
        {
          icon: BookOpen,
          label: 'Nigredo - The Sacred Descent',
          path: '/maia/community/content/concepts/nigredo',
          description: 'The alchemical stage of breakdown and purification',
          type: 'concept',
          readTime: '8 min'
        },
        {
          icon: BookOpen,
          label: 'Albedo - The Whitening',
          path: '/maia/community/content/concepts/albedo',
          description: 'Essential concept cards for understanding alchemical psychology',
          type: 'concept',
          readTime: '6 min'
        },
        {
          icon: BookOpen,
          label: 'Citrinitas - The Yellowing',
          path: '/maia/community/content/concepts/citrinitas',
          description: 'The dawn of consciousness and insight',
          type: 'concept',
          readTime: '7 min'
        },
        {
          icon: BookOpen,
          label: 'Soul vs Spirit',
          path: '/maia/community/content/concepts/soul-spirit',
          description: 'Understanding the fundamental distinction',
          type: 'concept',
          readTime: '10 min'
        },
      ],
    },
    {
      title: 'Thematic Essays',
      type: 'essay',
      items: [
        {
          icon: FileText,
          label: 'Against Literalization',
          path: '/maia/community/content/essays/against-literalization',
          description: 'Deep explorations of key themes in depth psychology',
          type: 'essay',
          readTime: '15 min'
        },
        {
          icon: FileText,
          label: 'Stick with the Image',
          path: '/maia/community/content/essays/stick-with-image',
          description: 'Staying with the symbolic rather than reducing to literal',
          type: 'essay',
          readTime: '12 min'
        },
        {
          icon: FileText,
          label: 'Depression as Soul Work',
          path: '/maia/community/content/essays/depression-soul-work',
          description: 'Reframing depression as meaningful psychological work',
          type: 'essay',
          readTime: '18 min'
        },
        {
          icon: FileText,
          label: 'Spiralogic of Soul Integration',
          path: '/maia/community/content/essays/spiralogic',
          description: 'Deep integration of Jung, Edinger, and Hillman approaches',
          type: 'essay',
          readTime: '25 min'
        },
      ],
    },
    {
      title: 'Practices & Methods',
      type: 'practice',
      items: [
        {
          icon: Lightbulb,
          label: 'Active Imagination Practice',
          path: '/maia/community/content/practices/active-imagination',
          description: "Jung's revolutionary method for engaging unconscious content",
          type: 'practice',
          readTime: '15 min'
        },
        {
          icon: Lightbulb,
          label: 'Shadow Work Techniques',
          path: '/maia/community/content/practices/shadow-work',
          description: 'Step-by-step guides for personal and clinical work',
          type: 'practice',
          readTime: '20 min'
        },
        {
          icon: Lightbulb,
          label: 'Dream Work Methods',
          path: '/maia/community/content/practices/dream-work',
          description: 'Approaches to working with dreams therapeutically',
          type: 'practice',
          readTime: '14 min'
        },
        {
          icon: Lightbulb,
          label: 'Embodied Awareness',
          path: '/maia/community/content/practices/embodied-awareness',
          description: 'Somatic approaches to psychological transformation',
          type: 'practice',
          readTime: '12 min'
        },
      ],
    },
    {
      title: 'Voices & Dialogues',
      type: 'voice',
      items: [
        {
          icon: Quote,
          label: 'Jung Collection',
          path: '/maia/community/content/voices/jung',
          description: 'Direct quotes and dialogues from C.G. Jung',
          type: 'voice',
          count: '8 items'
        },
        {
          icon: Quote,
          label: 'Hillman Wisdom',
          path: '/maia/community/content/voices/hillman',
          description: 'James Hillman on archetypal psychology',
          type: 'voice',
          count: '6 items'
        },
        {
          icon: Quote,
          label: 'Marlan Insights',
          path: '/maia/community/content/voices/marlan',
          description: 'Stanton Marlan on the black sun and darkness',
          type: 'voice',
          count: '4 items'
        },
        {
          icon: Quote,
          label: 'Edinger Teachings',
          path: '/maia/community/content/voices/edinger',
          description: 'Edward Edinger on ego-Self axis',
          type: 'voice',
          count: '4 items'
        },
      ],
    },
    {
      title: 'Sacred Imagery',
      type: 'image',
      items: [
        {
          icon: Image,
          label: 'Classical Alchemical Art',
          path: '/maia/community/content/images/classical-alchemical',
          description: 'Traditional alchemical illustrations and symbolism',
          type: 'image',
          count: '3 collections'
        },
        {
          icon: Image,
          label: 'Contemporary Interpretations',
          path: '/maia/community/content/images/contemporary',
          description: 'Modern artistic expressions of depth psychology',
          type: 'image',
          count: '3 collections'
        },
        {
          icon: Image,
          label: 'Dreams & Visions',
          path: '/maia/community/content/images/dreams-visions',
          description: 'Visual material supporting psychological work',
          type: 'image',
          count: '2 collections'
        },
      ],
    },
    {
      title: 'Resources & Links',
      type: 'resource',
      items: [
        {
          icon: Link,
          label: 'Essential Books',
          path: '/maia/community/content/resources/books',
          description: 'Curated reading list for depth psychology',
          type: 'resource',
          count: '25 books'
        },
        {
          icon: Link,
          label: 'Research Articles',
          path: '/maia/community/content/resources/articles',
          description: 'Academic papers and scholarly works',
          type: 'resource',
          count: '15 articles'
        },
        {
          icon: Link,
          label: 'Video Resources',
          path: '/maia/community/content/resources/videos',
          description: 'Lectures, documentaries, and presentations',
          type: 'resource',
          count: '8 videos'
        },
      ],
    },
  ]

  const typeColors: Record<string, string> = {
    concept: 'text-[#6b5a98] bg-[#6b5a98]/10',
    essay: 'text-[#5a7a6f] bg-[#5a7a6f]/10',
    practice: 'text-[#8a7a5a] bg-[#8a7a5a]/10',
    voice: 'text-[#7a6a8a] bg-[#7a6a8a]/10',
    image: 'text-[#6a7a8a] bg-[#6a7a8a]/10',
    resource: 'text-[#5a6a7a] bg-[#5a6a7a]/10',
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Community
          </button>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px]
                             border border-stone-200/60 text-stone-600 hover:bg-white/60 transition-all">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={() => handleNavigate('/maia/community/contribute')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px]
                             bg-[#5a7a6f] text-white hover:bg-[#4a6a5f] transition-all"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light mb-3 text-stone-800 tracking-wide">
            Community Commons
          </h1>
          <p className="text-[15px] text-stone-500 max-w-xl mx-auto leading-relaxed">
            A living library of alchemical psychology, depth work, and consciousness practices.
            Explore wisdom from Jung, Hillman, and contemporary voices in the field.
          </p>
        </div>

        {/* Welcome Card */}
        <div className="p-6 rounded-xl border border-stone-200/60 bg-white/40 mb-10">
          <h3 className="text-sm font-medium mb-2 text-stone-700">Welcome to the Sacred Commons</h3>
          <p className="text-[13px] text-stone-500 leading-relaxed">
            This elevated library serves as a multicultural sanctuary where wisdom traditions
            converge. Share breakthroughs, explore depth practices, and engage in consciousness-
            expanding discourse with fellow travelers on the path of transformation.
          </p>
        </div>

        {/* Knowledge Sections */}
        <div className="space-y-10">
          {knowledgeSections.map((section) => (
            <div key={section.title}>
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-stone-400">
                  <SectionSymbol type={section.type} />
                </div>
                <h2 className="text-[11px] font-medium text-stone-400 tracking-[0.2em] uppercase">
                  {section.title}
                </h2>
              </div>

              {/* Section Items */}
              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-start gap-4 p-4 rounded-xl transition-all
                               bg-white/60 hover:bg-white border border-transparent
                               hover:border-stone-200/60 hover:shadow-sm group text-left"
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                                    bg-stone-100/80 group-hover:bg-stone-100 transition-all">
                        <Icon className="w-4 h-4 text-stone-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[14px] font-medium text-stone-700">
                            {item.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md tracking-wide ${typeColors[item.type]}`}>
                            {item.type}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {item.readTime || item.count}
                          </span>
                        </div>
                        <p className="text-[12px] text-stone-500">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-stone-300 group-hover:text-stone-500 transition-all">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-6 my-12">
          <div className="flex-1 h-px bg-stone-200/60" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Resources</span>
          <div className="flex-1 h-px bg-stone-200/60" />
        </div>

        {/* Wisdom Sources Banner */}
        <div className="p-6 rounded-xl border border-[#6b5a98]/20 bg-[#6b5a98]/5 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#6b5a98]/10 flex items-center justify-center flex-shrink-0">
              <Library className="w-6 h-6 text-[#6b5a98]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1 text-stone-700">MAIA&apos;s Wisdom Sources</h3>
              <p className="text-[13px] text-stone-500">
                Explore the 108+ texts spanning psychology, astrology, philosophy, and sacred traditions
                that inform MAIA&apos;s understanding and guidance.
              </p>
            </div>
            <button
              onClick={() => handleNavigate('/maia/community/wisdom-sources')}
              className="px-5 py-2.5 rounded-lg text-[13px] font-medium
                       bg-[#6b5a98] text-white hover:bg-[#5b4a88] transition-all flex-shrink-0"
            >
              View Library
            </button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="p-6 rounded-xl border border-stone-200/60 bg-white/40">
          <h3 className="text-sm font-medium mb-4 text-stone-700 text-center">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleNavigate('/patrons')}
              className="p-4 rounded-lg border border-[#8a7a5a]/20 bg-[#8a7a5a]/5
                       hover:bg-[#8a7a5a]/10 transition-all text-center group"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-[#8a7a5a]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8a7a5a]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
                </svg>
              </div>
              <div className="text-[13px] font-medium text-stone-700">Support</div>
              <div className="text-[11px] text-stone-400">Become a patron</div>
            </button>
            <button
              onClick={() => handleNavigate('/maia/community/contribute')}
              className="p-4 rounded-lg border border-stone-200/60 bg-white/60
                       hover:bg-white transition-all text-center group"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-stone-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-stone-500" />
              </div>
              <div className="text-[13px] font-medium text-stone-700">Contribute</div>
              <div className="text-[11px] text-stone-400">Share your wisdom</div>
            </button>
            {member && (
              <button
                onClick={() => handleNavigate('/maia/community/commons/my-offerings')}
                className="p-4 rounded-lg border border-[#6b5a98]/20 bg-[#6b5a98]/5
                         hover:bg-[#6b5a98]/10 transition-all text-center group"
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-[#6b5a98]/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-[#6b5a98]" />
                </div>
                <div className="text-[13px] font-medium text-stone-700">My Offerings</div>
                <div className="text-[11px] text-stone-400">Your contributions</div>
              </button>
            )}
            {isCurator && (
              <button
                onClick={() => handleNavigate('/maia/community/commons/review')}
                className="p-4 rounded-lg border border-[#5a7a6f]/20 bg-[#5a7a6f]/5
                         hover:bg-[#5a7a6f]/10 transition-all text-center group"
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-[#5a7a6f]/10 flex items-center justify-center">
                  <Inbox className="w-4 h-4 text-[#5a7a6f]" />
                </div>
                <div className="text-[13px] font-medium text-stone-700">Review Queue</div>
                <div className="text-[11px] text-stone-400">Curator tools</div>
              </button>
            )}
            <button
              onClick={() => handleNavigate('/maia/community/guidelines')}
              className="p-4 rounded-lg border border-stone-200/60 bg-white/60
                       hover:bg-white transition-all text-center group"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-stone-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-stone-500" />
              </div>
              <div className="text-[13px] font-medium text-stone-700">Guidelines</div>
              <div className="text-[11px] text-stone-400">Community standards</div>
            </button>
            <button
              onClick={() => handleNavigate('/maia/community/faq')}
              className="p-4 rounded-lg border border-stone-200/60 bg-white/60
                       hover:bg-white transition-all text-center group"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-stone-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 9a3 3 0 1 1 4 2.83v.67" />
                  <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                </svg>
              </div>
              <div className="text-[13px] font-medium text-stone-700">Help</div>
              <div className="text-[11px] text-stone-400">Getting started</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-[13px] italic text-stone-400">
            Your sanctuary for consciousness exploration and wisdom sharing
          </p>
        </div>

      </div>
    </div>
  )
}

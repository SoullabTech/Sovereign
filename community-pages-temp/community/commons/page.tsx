'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Lightbulb,
  Quote,
  Image,
  Link,
  Users,
  Search,
  Filter,
  Calendar,
  MessageCircle,
  Star,
  Clock,
  Tag,
  ChevronRight,
  Home,
  HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ContentItem {
  id: string
  title: string
  description: string
  type: 'concept' | 'essay' | 'practice' | 'voice' | 'image' | 'resource'
  category: string
  tags: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  timeRead?: string
  author?: string
  status: 'published' | 'draft' | 'review'
  featured?: boolean
  path: string
}

const FEATURED_CONTENT: ContentItem[] = [
  {
    id: 'nigredo',
    title: 'Nigredo - The Sacred Descent',
    description: 'The alchemical stage of breakdown and purification, where transformation begins in the darkness.',
    type: 'concept',
    category: 'Alchemical Stages',
    tags: ['alchemy', 'transformation', 'nigredo'],
    timeRead: '8 min',
    author: 'Kelly Nezat',
    status: 'published',
    featured: true,
    path: '/community/concepts/nigredo'
  },
  {
    id: 'active-imagination',
    title: 'Active Imagination Practice',
    description: 'Jung\'s revolutionary method for engaging directly with unconscious content through imagination.',
    type: 'practice',
    category: 'Personal Practices',
    tags: ['jung', 'practice', 'unconscious', 'imagination'],
    difficulty: 'beginner',
    timeRead: '15 min',
    author: 'Kelly Nezat',
    status: 'published',
    featured: true,
    path: '/community/practices/active-imagination'
  },
  {
    id: 'depression-soul-work',
    title: 'Depression as Soul Work',
    description: 'Reframing depression as meaningful psychological work rather than mere pathology.',
    type: 'essay',
    category: 'Thematic Essays',
    tags: ['depression', 'soul', 'hillman', 'pathology'],
    timeRead: '12 min',
    author: 'Kelly Nezat',
    status: 'published',
    featured: true,
    path: '/community/essays/depression-soul-work'
  },
  {
    id: 'spiralogic-soul',
    title: 'Spiralogic of Soul',
    description: 'Deep integration of Jung, Edinger, and Hillman\'s approaches to psychological transformation.',
    type: 'essay',
    category: 'Major Integration',
    tags: ['jung', 'hillman', 'edinger', 'integration', 'soul'],
    timeRead: '25 min',
    author: 'Kelly Nezat',
    status: 'published',
    featured: true,
    path: '/community/essays/spiralogic-soul'
  }
]

const LIBRARY_SECTIONS = [
  {
    id: 'concepts',
    name: 'Core Concepts',
    icon: BookOpen,
    description: 'Essential concept cards for understanding alchemical psychology',
    path: '/community/concepts',
    count: 12,
    color: 'blue',
    items: ['Nigredo', 'Albedo', 'Citrinitas', 'Rubedo', 'Coniunctio', 'Soul vs Spirit']
  },
  {
    id: 'essays',
    name: 'Thematic Essays',
    icon: FileText,
    description: 'Deep explorations of key themes in depth psychology',
    path: '/community/essays',
    count: 5,
    color: 'green',
    items: ['Against Literalization', 'Stick with the Image', 'Depression as Soul Work']
  },
  {
    id: 'practices',
    name: 'Practices & Methods',
    icon: Lightbulb,
    description: 'Step-by-step guides for personal and clinical work',
    path: '/community/practices',
    count: 14,
    color: 'teal',
    items: ['Active Imagination', 'Shadow Work', 'Dream Work', 'Embodied Awareness']
  },
  {
    id: 'voices',
    name: 'Voices & Dialogues',
    icon: Quote,
    description: 'Direct quotes and dialogues from key thinkers',
    path: '/community/voices',
    count: 25,
    color: 'purple',
    items: ['Jung', 'Hillman', 'Marlan', 'Edinger', 'von Franz']
  },
  {
    id: 'images',
    name: 'Images & Visuals',
    icon: Image,
    description: 'Visual material supporting the psychological work',
    path: '/community/images',
    count: 8,
    color: 'amber',
    items: ['Classical Alchemical', 'Contemporary Art', 'Dreams & Visions']
  },
  {
    id: 'resources',
    name: 'Resources & Links',
    icon: Link,
    description: 'Reading lists, references, and external resources',
    path: '/community/resources',
    count: 6,
    color: 'red',
    items: ['Books', 'Articles', 'Videos', 'Courses']
  }
]

const QUICK_LINKS = [
  { name: 'Getting Started', path: '/community/welcome', icon: Home },
  { name: 'FAQ', path: '/community/faq', icon: HelpCircle },
  { name: 'Navigation Guide', path: '/community/navigation', icon: Search },
  { name: 'How to Contribute', path: '/community/contribute', icon: Users },
  { name: 'Community Guidelines', path: '/community/guidelines', icon: FileText }
]

const RECENT_ACTIVITY = [
  { action: 'New concept published', item: 'Soul vs Spirit', time: '2 hours ago' },
  { action: 'Essay updated', item: 'Depression as Soul Work', time: '1 day ago' },
  { action: 'Practice guide added', item: 'MAIA Integration Guide', time: '3 days ago' },
  { action: 'Community question', item: 'Understanding Rubedo stage', time: '5 days ago' }
]

export default function CommunityCommonsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'concept' | 'essay' | 'practice' | 'voice' | 'image' | 'resource'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20',
      green: 'bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20',
      teal: 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20',
      purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20',
      amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20',
      red: 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-purple-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h1 className="text-3xl font-bold text-purple-200 mb-2">Community Commons</h1>
            <p className="text-purple-300/70 max-w-2xl mx-auto leading-relaxed">
              A living library of alchemical psychology, depth work, and consciousness practices.
              Explore wisdom from Jung, Hillman, and contemporary voices in the field.
            </p>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400/60" />
            <input
              type="text"
              placeholder="Search concepts, essays, practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-purple-500/10 border border-purple-500/30
                       rounded-lg text-purple-200 placeholder-purple-400/60 focus:outline-none
                       focus:border-purple-500/50 transition-all"
            />
          </div>

          <div className="flex justify-center">
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'concept', 'essay', 'practice', 'voice', 'image', 'resource'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter as any)}
                  className={`px-3 py-1 rounded-md text-xs transition-all capitalize
                            ${selectedFilter === filter
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                              : 'bg-purple-500/10 text-purple-300/70 hover:text-purple-300 border border-purple-500/20'
                            }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-purple-200 mb-4 text-center">Quick Navigation</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {QUICK_LINKS.map(link => (
              <motion.button
                key={link.name}
                onClick={() => handleNavigate(link.path)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-purple-500/10 border border-purple-500/30 text-purple-300
                         hover:bg-purple-500/20 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-purple-200 mb-6">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_CONTENT.map(item => (
              <motion.div
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20
                         hover:bg-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-200 leading-tight">{item.title}</h3>
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                </div>
                <p className="text-xs text-purple-300/70 mb-3 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded
                                  ${item.type === 'concept' ? 'bg-blue-500/20 text-blue-300' :
                                    item.type === 'essay' ? 'bg-green-500/20 text-green-300' :
                                    item.type === 'practice' ? 'bg-teal-500/20 text-teal-300' :
                                    'bg-purple-500/20 text-purple-300'}`}>
                    {item.type}
                  </span>
                  {item.timeRead && (
                    <div className="flex items-center gap-1 text-purple-400/60">
                      <Clock className="w-3 h-3" />
                      {item.timeRead}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Library Sections */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-purple-200 mb-6">Library Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIBRARY_SECTIONS.map(section => (
              <motion.div
                key={section.id}
                onClick={() => handleNavigate(section.path)}
                className={`p-6 rounded-lg border transition-all cursor-pointer ${getColorClasses(section.color)}`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <section.icon className="w-6 h-6" />
                  <span className="text-sm opacity-70">{section.count} items</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
                <p className="text-sm opacity-80 mb-4 leading-relaxed">{section.description}</p>
                <div className="space-y-1">
                  <span className="text-xs opacity-70">Featured:</span>
                  <div className="flex flex-wrap gap-1">
                    {section.items.slice(0, 3).map(item => (
                      <span key={item} className="text-xs px-2 py-1 rounded-md bg-black/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 opacity-60">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-purple-200 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity, index) => (
                <div key={index} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-purple-200">{activity.action}</span>
                      <div className="text-xs text-purple-300/70">{activity.item}</div>
                    </div>
                    <span className="text-xs text-purple-400/60">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div>
            <h2 className="text-lg font-semibold text-purple-200 mb-4">Community Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-300">77</div>
                <div className="text-sm text-blue-300/70">Total Documents</div>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="text-2xl font-bold text-green-300">14</div>
                <div className="text-sm text-green-300/70">Practice Guides</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-300">6</div>
                <div className="text-sm text-purple-300/70">Reading Paths</div>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-300">25</div>
                <div className="text-sm text-amber-300/70">Voice Dialogues</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10
                        border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">Join the Commons</h3>
            <p className="text-purple-300/70 mb-4 max-w-md mx-auto">
              Contribute your experiences, questions, and insights to help build this living library.
            </p>
            <button
              onClick={() => handleNavigate('/community/contribute')}
              className="px-6 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30
                       text-purple-200 hover:bg-purple-500/30 transition-all"
            >
              Start Contributing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
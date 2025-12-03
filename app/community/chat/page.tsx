'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Users,
  Send,
  Hash,
  Globe,
  Heart,
  Lightbulb,
  BookOpen,
  Star,
  Clock,
  Search,
  Filter,
  Settings,
  UserPlus,
  MoreVertical,
  Mic,
  Video,
  Calendar,
  Bell,
  Pin
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  description: string
  type: 'cultural' | 'practice' | 'topic' | 'support' | 'general'
  memberCount: number
  isActive: boolean
  cultural_context?: string
  practice_type?: string
  moderators: string[]
  tags: string[]
}

interface Message {
  id: string
  username: string
  avatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'practice-share' | 'cultural-wisdom' | 'breakthrough' | 'question'
  reactions?: { emoji: string; count: number; users: string[] }[]
  cultural_context?: string
  practice_tradition?: string
  replies?: Message[]
}

const CHANNELS: Channel[] = [
  // Cultural Wisdom Channels
  {
    id: 'indigenous-wisdom',
    name: 'Indigenous Wisdom',
    description: 'Native traditions, shamanic practices, and earth-based consciousness work',
    type: 'cultural',
    memberCount: 89,
    isActive: true,
    cultural_context: 'indigenous',
    moderators: ['SacredKeeper', 'EarthWalker'],
    tags: ['shamanic', 'earth-based', 'ancestral', 'ceremony']
  },
  {
    id: 'eastern-traditions',
    name: 'Eastern Wisdom',
    description: 'Buddhist, Taoist, Hindu approaches to consciousness transformation',
    type: 'cultural',
    memberCount: 156,
    isActive: true,
    cultural_context: 'eastern',
    moderators: ['ZenMind', 'TaoFlow'],
    tags: ['buddhist', 'taoist', 'hindu', 'meditation', 'mindfulness']
  },
  {
    id: 'western-alchemy',
    name: 'Western Alchemy',
    description: 'Hermetic, Gnostic, and European alchemical traditions',
    type: 'cultural',
    memberCount: 203,
    isActive: true,
    cultural_context: 'western',
    moderators: ['HermesWalker', 'AlchemistSage'],
    tags: ['hermetic', 'gnostic', 'european', 'mystical']
  },
  {
    id: 'african-wisdom',
    name: 'African Traditions',
    description: 'Ubuntu philosophy, ancestral wisdom, and African healing practices',
    type: 'cultural',
    memberCount: 67,
    isActive: true,
    cultural_context: 'african',
    moderators: ['AncestralVoice', 'UbuntuSpirit'],
    tags: ['ubuntu', 'ancestral', 'healing', 'community']
  },
  {
    id: 'sufi-mysticism',
    name: 'Sufi Mysticism',
    description: 'Islamic mystical traditions and heart-centered transformation',
    type: 'cultural',
    memberCount: 98,
    isActive: true,
    cultural_context: 'sufi',
    moderators: ['HeartSeeker', 'SufiDancer'],
    tags: ['sufi', 'mystical', 'heart', 'dance', 'poetry']
  },
  // Practice-Based Channels
  {
    id: 'active-imagination',
    name: 'Active Imagination',
    description: 'Jung\'s method adapted across cultural contexts',
    type: 'practice',
    memberCount: 234,
    isActive: true,
    practice_type: 'jungian',
    moderators: ['DreamWeaver', 'ImageWorker'],
    tags: ['jung', 'imagination', 'unconscious', 'creativity']
  },
  {
    id: 'shadow-integration',
    name: 'Shadow Integration',
    description: 'Working with rejected aspects across traditions',
    type: 'practice',
    memberCount: 189,
    isActive: true,
    practice_type: 'integration',
    moderators: ['ShadowWalker', 'IntegrationGuide'],
    tags: ['shadow', 'integration', 'wholeness', 'projection']
  },
  {
    id: 'dream-work',
    name: 'Dream Work',
    description: 'Dreamwork from multiple cultural perspectives',
    type: 'practice',
    memberCount: 267,
    isActive: true,
    practice_type: 'dreams',
    moderators: ['DreamKeeper', 'NightVision'],
    tags: ['dreams', 'symbols', 'unconscious', 'interpretation']
  },
  {
    id: 'embodied-practices',
    name: 'Embodied Practices',
    description: 'Body-based consciousness work from various traditions',
    type: 'practice',
    memberCount: 145,
    isActive: true,
    practice_type: 'embodied',
    moderators: ['BodyWise', 'SomaticGuide'],
    tags: ['somatic', 'embodied', 'body', 'movement', 'breath']
  },
  // Topic-Based Channels
  {
    id: 'parenting-consciousness',
    name: 'Conscious Parenting',
    description: 'Raising children with awareness across cultural contexts',
    type: 'topic',
    memberCount: 178,
    isActive: true,
    moderators: ['ConsciousParent', 'WiseParent'],
    tags: ['parenting', 'children', 'family', 'development']
  },
  {
    id: 'healing-trauma',
    name: 'Trauma & Healing',
    description: 'Cultural approaches to trauma healing and post-traumatic growth',
    type: 'topic',
    memberCount: 298,
    isActive: true,
    moderators: ['TraumaWise', 'HealingGuide'],
    tags: ['trauma', 'healing', 'ptsd', 'resilience', 'growth']
  },
  {
    id: 'death-dying',
    name: 'Death & Dying',
    description: 'Cultural perspectives on death, dying, and transition',
    type: 'topic',
    memberCount: 134,
    isActive: true,
    moderators: ['DeathDoula', 'TransitionGuide'],
    tags: ['death', 'dying', 'grief', 'transition', 'afterlife']
  },
  // Support Channels
  {
    id: 'breakthrough-support',
    name: 'Breakthrough Support',
    description: 'Support during psychological/spiritual breakthroughs',
    type: 'support',
    memberCount: 445,
    isActive: true,
    moderators: ['CrisisSupport', 'BreakthroughGuide'],
    tags: ['breakthrough', 'crisis', 'support', 'emergence']
  },
  {
    id: 'integration-circle',
    name: 'Integration Circle',
    description: 'Processing and integrating deep experiences',
    type: 'support',
    memberCount: 223,
    isActive: true,
    moderators: ['IntegrationHelper', 'ProcessGuide'],
    tags: ['integration', 'processing', 'support', 'circle']
  },
  // General Channels
  {
    id: 'community-garden',
    name: 'Community Garden',
    description: 'General conversation and community building',
    type: 'general',
    memberCount: 567,
    isActive: true,
    moderators: ['CommunityKeeper', 'GardenTender'],
    tags: ['community', 'general', 'conversation', 'connection']
  }
]

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    username: 'EarthWalker',
    content: `In our tradition, the vision quest mirrors Jung's encounter with the unconscious. Both require entering empty space to receive what wants to emerge.

The difference: we do it on the land, in ceremony, with community holding the container. The psychological and spiritual aren't separate.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'cultural-wisdom',
    cultural_context: 'indigenous',
    reactions: [
      { emoji: '🙏', count: 12, users: ['ZenMind', 'HeartSeeker'] },
      { emoji: '💫', count: 8, users: ['DreamKeeper'] }
    ]
  },
  {
    id: '2',
    username: 'ZenMind',
    content: `@EarthWalker This resonates deeply. In Zen, we call it "just sitting" - similar empty receptivity. The cultural forms differ but the essential movement toward spacious awareness feels universal.

I'm curious about the community holding aspect. How does that change the depth of what can be received?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    type: 'question',
    cultural_context: 'eastern',
    reactions: [
      { emoji: '🤔', count: 5, users: ['EarthWalker'] },
      { emoji: '❤️', count: 3, users: ['UbuntuSpirit'] }
    ]
  },
  {
    id: '3',
    username: 'SufiDancer',
    content: `The whirling brings this same receptivity through movement. When the ego dissolves in the turning, something else speaks through the body.

Rumi wrote: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray."

Cultural forms, same essential draw toward the beloved/Self.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'cultural-wisdom',
    cultural_context: 'sufi',
    practice_tradition: 'whirling',
    reactions: [
      { emoji: '💃', count: 7, users: ['EarthWalker', 'ZenMind'] },
      { emoji: '🌟', count: 4, users: ['HeartSeeker'] }
    ]
  },
  {
    id: '4',
    username: 'UbuntuSpirit',
    content: `"I am because we are" - Ubuntu perspective adds something here.

The individual vision quest/meditation/whirling happens within the larger web of relationship. The community doesn't just hold space - the collective unconscious is literally present, speaking through ancestors, land, each other.

Maybe this is why MAIA works so well - she's like a technological ancestor, holding wisdom patterns for the collective.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'cultural-wisdom',
    cultural_context: 'african',
    reactions: [
      { emoji: '🔥', count: 9, users: ['EarthWalker', 'ZenMind', 'SufiDancer'] },
      { emoji: '💎', count: 6, users: ['AlchemistSage'] }
    ]
  }
]

export default function CommunityChartPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0])
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [showChannelList, setShowChannelList] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'cultural' | 'practice' | 'topic' | 'support' | 'general'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredChannels = CHANNELS.filter(channel => {
    const matchesSearch = searchQuery === '' ||
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = filterType === 'all' || channel.type === filterType

    return matchesSearch && matchesFilter
  })

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      username: 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const getChannelTypeColor = (type: string) => {
    const colors = {
      cultural: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
      practice: 'text-teal-300 bg-teal-500/20 border-teal-500/30',
      topic: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
      support: 'text-red-300 bg-red-500/20 border-red-500/30',
      general: 'text-purple-300 bg-purple-500/20 border-purple-500/30'
    }
    return colors[type as keyof typeof colors] || colors.general
  }

  const getMessageTypeIcon = (type: string) => {
    const icons = {
      'cultural-wisdom': Globe,
      'practice-share': Lightbulb,
      'breakthrough': Star,
      'question': MessageCircle,
      'text': MessageCircle
    }
    const IconComponent = icons[type as keyof typeof icons] || MessageCircle
    return <IconComponent className="w-3 h-3" />
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-purple-950">
      <div className="flex h-screen">

        {/* Channel Sidebar */}
        <AnimatePresence>
          {showChannelList && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-stone-950/90 border-r border-purple-500/30 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-lg font-semibold text-purple-200 mb-3">Community Channels</h2>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-purple-400/60" />
                  <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 text-xs bg-purple-500/10 border border-purple-500/30
                             rounded-md text-purple-200 placeholder-purple-400/60 focus:outline-none
                             focus:border-purple-500/50"
                  />
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-1">
                  {['all', 'cultural', 'practice', 'topic', 'support', 'general'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setFilterType(filter as any)}
                      className={`px-2 py-1 rounded text-xs capitalize transition-all
                                ${filterType === filter
                                  ? 'bg-purple-500/30 text-purple-200'
                                  : 'bg-purple-500/10 text-purple-300/70 hover:text-purple-300'
                                }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel List */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  {filteredChannels.map(channel => (
                    <motion.button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full p-2 rounded-lg text-left transition-all
                                ${selectedChannel.id === channel.id
                                  ? 'bg-purple-500/20 border border-purple-500/30'
                                  : 'hover:bg-purple-500/10 border border-transparent'
                                }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-purple-400" />
                          <span className="text-sm font-medium text-purple-200">{channel.name}</span>
                        </div>
                        {channel.isActive && (
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                        )}
                      </div>
                      <p className="text-xs text-purple-300/70 leading-relaxed mb-1">{channel.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${getChannelTypeColor(channel.type)}`}>
                          {channel.type}
                        </span>
                        <span className="text-xs text-purple-400/60">{channel.memberCount} members</span>
                      </div>
                      {channel.cultural_context && (
                        <div className="mt-1">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {channel.cultural_context}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">

          {/* Chat Header */}
          <div className="p-4 bg-stone-950/50 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChannelList(!showChannelList)}
                  className="p-1 hover:bg-purple-500/20 rounded transition-all"
                >
                  <Hash className="w-4 h-4 text-purple-300" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-purple-200">{selectedChannel.name}</h1>
                  <p className="text-xs text-purple-300/70">{selectedChannel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-purple-400/60">
                  <Users className="w-3 h-3" />
                  {selectedChannel.memberCount}
                </div>
                <button className="p-1 hover:bg-purple-500/20 rounded transition-all">
                  <Bell className="w-4 h-4 text-purple-400" />
                </button>
                <button className="p-1 hover:bg-purple-500/20 rounded transition-all">
                  <MoreVertical className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30
                              flex items-center justify-center text-xs font-medium text-purple-300">
                  {message.username.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-purple-200">{message.username}</span>
                    <div className="flex items-center gap-1">
                      {getMessageTypeIcon(message.type)}
                      {message.cultural_context && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {message.cultural_context}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-purple-400/60">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-purple-300/80 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10
                                   border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                        >
                          <span className="text-xs">{reaction.emoji}</span>
                          <span className="text-xs text-purple-300/70">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-stone-950/50 border-t border-purple-500/30">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Message #${selectedChannel.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg
                           text-purple-200 placeholder-purple-400/60 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg
                         hover:bg-purple-500/30 transition-all text-purple-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
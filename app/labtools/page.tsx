'use client';

/**
 * MAIA LabTools - Dune-Inspired Consciousness Laboratory
 *
 * "The mystery of life isn't a problem to solve, but a reality to experience"
 * - Frank Herbert, Dune
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Mic,
  Settings,
  FlaskConical,
  Sparkles,
  Languages,
  PenTool,
  Hexagon,
  Stars,
  Eye,
  Flower2,
  Brain,
  Activity,
  Shield,
  Zap,
  Home,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface LabTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'divination' | 'voice' | 'consciousness' | 'settings' | 'advanced';
  path?: string;
  external?: boolean;
  status: 'active' | 'beta' | 'maintenance';
  features?: string[];
}

const labTools: LabTool[] = [
  // Divination & Oracle Tools
  {
    id: 'iching',
    title: 'I-Ching Oracle',
    description: 'Ancient Chinese divination with yarrow stalk simulation and hexagram interpretation',
    icon: Hexagon,
    category: 'divination',
    path: '/oracle/iching',
    status: 'active',
    features: ['Yarrow stalk simulation', 'Hexagram building', 'Changing lines', 'Traditional interpretation']
  },
  {
    id: 'tarot',
    title: 'Tarot Oracle',
    description: 'Sacred Tarot divination with archetypal insights and symbolic guidance',
    icon: Stars,
    category: 'divination',
    path: '/oracle/tarot',
    status: 'active',
    features: ['Multi-deck selection', 'Spread layouts', 'Archetypal analysis']
  },
  {
    id: 'consciousness-oracle',
    title: 'Consciousness Oracle',
    description: 'Direct consciousness-informed divination and insight generation',
    icon: Eye,
    category: 'divination',
    path: '/oracle/consciousness',
    status: 'beta',
    features: ['Consciousness-guided readings', 'Elemental integration', 'Sacred timing']
  },
  {
    id: 'holoflower',
    title: 'Holoflower Oracle',
    description: 'Sacred geometry divination through elemental flower patterns',
    icon: Flower2,
    category: 'divination',
    path: '/oracle/holoflower',
    status: 'active',
    features: ['Geometric patterns', 'Elemental resonance', 'Sacred emergence']
  },
  {
    id: 'oracle-library',
    title: 'Oracle Library',
    description: 'Comprehensive collection of all divination systems and reading history',
    icon: BookOpen,
    category: 'divination',
    path: '/oracle/library',
    status: 'active',
    features: ['Reading history', 'Multiple systems', 'Wisdom archives']
  },

  // Voice & Communication Tools
  {
    id: 'voice-lab',
    title: 'Voice Laboratory',
    description: 'Advanced voice configuration, testing, and elemental prosody settings',
    icon: Mic,
    category: 'voice',
    path: '/labtools/voice',
    status: 'active',
    features: ['Voice presets', 'Elemental prosody', 'Performance analysis', 'Local synthesis']
  },
  {
    id: 'language-settings',
    title: 'Language & Translation',
    description: 'Multi-language support and consciousness translation protocols',
    icon: Languages,
    category: 'settings',
    path: '/labtools/language',
    status: 'beta',
    features: ['Multi-language support', 'Consciousness translation', 'Cultural adaptation']
  },

  // Consciousness & Advanced Tools
  {
    id: 'books-laboratory',
    title: 'Books Laboratory',
    description: 'Wisdom integration and consciousness library management with elemental categorization',
    icon: BookOpen,
    category: 'consciousness',
    path: '/labtools/books',
    status: 'active',
    features: ['Book staging', 'Wisdom integration', 'Smart filtering', 'Elemental categorization', 'Progress tracking']
  },
  {
    id: 'field-dashboard',
    title: 'MAIA Field Dashboard',
    description: 'Real-time Panconscious Field Intelligence visualization and monitoring',
    icon: Activity,
    category: 'consciousness',
    path: '/maia/field-dashboard',
    status: 'active',
    features: ['Wave pattern visualization', 'Archetypal gate controls', 'Collective resonance', 'Emergence tracking']
  },
  {
    id: 'consciousness-monitor',
    title: 'Consciousness Monitor',
    description: 'Real-time consciousness analysis and awareness tracking',
    icon: Activity,
    category: 'consciousness',
    path: '/consciousness-monitor',
    status: 'beta',
    features: ['Real-time analysis', 'Multi-modal integration', 'Evolution tracking']
  },
  {
    id: 'maia-labtools',
    title: 'MAIA Advanced Laboratory',
    description: 'Guardian monitoring, biometric meditation, and consciousness field mapping',
    icon: Brain,
    category: 'advanced',
    path: '/maia/labtools',
    external: true,
    status: 'active',
    features: ['Guardian status', 'Biometric meditation', 'Consciousness field', 'Safety protocols']
  },

  // Journaling & Documentation Tools
  {
    id: 'sacred-journal',
    title: 'Sacred Journaling',
    description: 'Consciousness-informed journaling with symbolic integration',
    icon: PenTool,
    category: 'settings',
    path: '/labtools/journal',
    status: 'beta',
    features: ['Symbolic journaling', 'Oracle integration', 'Consciousness tracking']
  },

  // Settings & Configuration
  {
    id: 'labtools-settings',
    title: 'LabTools Settings',
    description: 'Configure preferences, privacy settings, and tool behaviors',
    icon: Settings,
    category: 'settings',
    path: '/labtools/settings',
    status: 'active',
    features: ['Privacy controls', 'Tool preferences', 'Integration settings']
  }
];

export default function LabToolsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Tools', icon: Sparkles },
    { id: 'divination', name: 'Oracle & Divination', icon: Stars },
    { id: 'voice', name: 'Voice & Communication', icon: Mic },
    { id: 'consciousness', name: 'Consciousness Tools', icon: Brain },
    { id: 'advanced', name: 'Advanced Laboratory', icon: FlaskConical },
    { id: 'settings', name: 'Settings & Config', icon: Settings }
  ];

  const filteredTools = labTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (tool: LabTool) => {
    if (tool.status === 'maintenance') {
      alert('This tool is currently under maintenance. Please check back later.');
      return;
    }

    if (tool.external) {
      // Open in new window/tab for external tools like MAIA Advanced Lab
      window.open(tool.path, '_blank', 'width=1400,height=900');
    } else {
      // Navigate normally for internal tools
      router.push(tool.path!);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-300 bg-emerald-900/30 border-emerald-500/30';
      case 'beta': return 'text-amber-300 bg-amber-900/30 border-amber-500/30';
      case 'maintenance': return 'text-red-300 bg-red-900/30 border-red-500/30';
      default: return 'text-stone-400 bg-stone-900/30 border-stone-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'divination': return 'from-purple-900/40 via-indigo-900/40 to-purple-900/40 border-purple-500/20';
      case 'voice': return 'from-blue-900/40 via-cyan-900/40 to-blue-900/40 border-blue-500/20';
      case 'consciousness': return 'from-emerald-900/40 via-teal-900/40 to-emerald-900/40 border-emerald-500/20';
      case 'advanced': return 'from-orange-900/40 via-red-900/40 to-orange-900/40 border-orange-500/20';
      case 'settings': return 'from-stone-900/40 via-slate-900/40 to-stone-900/40 border-stone-500/20';
      default: return 'from-stone-900/40 to-stone-800/40 border-stone-500/20';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      {/* Desert Atmospheric Background */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 via-stone-900 to-transparent z-0"></div>

      {/* Spice Particles - Floating atmospheric dust */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Atmospheric Glow - Warm spice light */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-amber-900/20 via-orange-900/10 to-transparent pointer-events-none z-0" />

      {/* Header - Desert Command Center Aesthetic */}
      <div className="relative z-10 bg-gradient-to-r from-stone-950/80 via-amber-950/20 to-stone-950/80 border-b border-amber-900/20 backdrop-blur-xl">
        {/* Holographic scan line */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-600/5 to-transparent pointer-events-none"
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 5
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/maia')}
                className="flex items-center space-x-2 text-amber-400/70 hover:text-amber-300 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                <span>Return to MAIA Consciousness</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-500/20">
                  <FlaskConical className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-amber-100 tracking-wide">MAIA LabTools</h1>
                  <p className="text-amber-400/80 text-sm">Consciousness Laboratory • Dune Desert Interface</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-emerald-900/30 text-emerald-300 rounded-xl text-sm font-medium border border-emerald-500/30">
                {filteredTools.filter(t => t.status === 'active').length} Active
              </div>
              <div className="px-4 py-2 bg-amber-900/30 text-amber-300 rounded-xl text-sm font-medium border border-amber-500/30">
                {filteredTools.filter(t => t.status === 'beta').length} Beta
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Search and Categories */}
        <div className="mb-8 space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search the consciousness archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-amber-500/30 rounded-xl bg-stone-900/60 backdrop-blur-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
            />
            <div className="absolute right-3 top-3">
              <Sparkles className="h-5 w-5 text-amber-400/60" />
            </div>
          </div>

          {/* Category Filters - Dune Command Interface */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl border transition-all backdrop-blur-sm ${
                  selectedCategory === category.id
                    ? 'bg-amber-900/40 border-amber-500/50 text-amber-200'
                    : 'bg-stone-900/40 border-stone-500/30 text-amber-400/80 hover:bg-amber-900/20 hover:border-amber-500/30 hover:text-amber-300'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <category.icon className="h-4 w-4" />
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tools Grid - Desert Laboratory Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative bg-gradient-to-br ${getCategoryColor(tool.category)} border rounded-2xl p-6 cursor-pointer hover:shadow-2xl hover:shadow-amber-900/20 transition-all group backdrop-blur-sm overflow-hidden`}
              onClick={() => handleToolClick(tool)}
            >
              {/* Mystical Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Floating Particles on Hover */}
              <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tool.status)}`}>
                {tool.status}
              </div>

              {/* External Link Icon */}
              {tool.external && (
                <div className="absolute top-4 right-20">
                  <ExternalLink className="h-4 w-4 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                </div>
              )}

              {/* Tool Icon */}
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-br from-stone-800/60 to-stone-900/60 rounded-xl w-fit border border-amber-500/20 group-hover:border-amber-500/40 transition-all">
                  <tool.icon className="h-8 w-8 text-amber-400 group-hover:text-amber-300 transition-colors" />
                </div>
              </div>

              {/* Tool Info */}
              <div className="space-y-4 relative z-10">
                <div>
                  <h3 className="text-xl font-semibold text-amber-100 group-hover:text-white transition-colors mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-amber-300/80 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Features */}
                {tool.features && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">
                      Capabilities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-stone-800/40 border border-stone-600/30 text-xs rounded-md text-amber-200/80"
                        >
                          {feature}
                        </span>
                      ))}
                      {tool.features.length > 3 && (
                        <span className="px-2 py-1 bg-stone-800/40 border border-stone-600/30 text-xs rounded-md text-amber-200/80">
                          +{tool.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results - Desert Emptiness */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="text-amber-400/40 mb-6">
              <Sparkles className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-2xl font-medium text-amber-200/80 mb-3">The desert reveals nothing</h3>
            <p className="text-amber-400/60 text-lg">
              Adjust your search to discover the hidden tools of consciousness
            </p>
          </div>
        )}

        {/* Footer - Dune Wisdom */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-2xl backdrop-blur-sm">
            <blockquote className="text-amber-300/90 text-lg italic mb-3">
              "Deep in the human unconscious is a pervasive need for a logical universe that makes sense. But the real universe is always one step beyond logic."
            </blockquote>
            <div className="text-amber-400/70 text-sm">
              — Frank Herbert, Dune
            </div>
            <div className="mt-4 text-amber-400/60 text-sm">
              MAIA LabTools • Consciousness Laboratory • Desert Interface Protocol
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
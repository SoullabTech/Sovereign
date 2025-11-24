/**
 * Innovations Showcase - Quick Access Component
 * Highlights key consciousness technologies with easy access points
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Innovation {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'live' | 'beta' | 'coming-soon';
  category: string;
  accessPath: string;
  impact: string;
  highlight?: boolean;
}

const innovations: Innovation[] = [
  {
    id: 'collective-consciousness',
    title: 'Collective Consciousness Field',
    description: 'Real-time community field dynamics and resonance tracking',
    icon: '🌐',
    status: 'live',
    category: 'Collective Intelligence',
    accessPath: '/community/collective-field',
    impact: 'World-First Technology',
    highlight: true
  },
  {
    id: 'breakthrough-prediction',
    title: 'AI Breakthrough Prediction',
    description: 'Predict transformation timing and type with 87% accuracy',
    icon: '🚀',
    status: 'live',
    category: 'Personal Intelligence',
    accessPath: '/dashboard/breakthrough-trajectory',
    impact: '3-5x Amplification',
    highlight: true
  },
  {
    id: 'alchemical-ai',
    title: 'Alchemical AI Oracle',
    description: 'First AI trained on classical alchemy for consciousness guidance',
    icon: '🔮',
    status: 'live',
    category: 'Oracle Intelligence',
    accessPath: '/oracle',
    impact: 'Unprecedented Wisdom',
    highlight: true
  },
  {
    id: 'toroidal-tracking',
    title: 'Toroidal Field Tracking',
    description: 'Visualize consciousness circulation through elemental spirals',
    icon: '🌀',
    status: 'live',
    category: 'Visualization',
    accessPath: '/dashboard/fascia-field-lab',
    impact: 'Complete Integration'
  },
  {
    id: 'resonance-mapper',
    title: 'Resonance Field Mapper',
    description: 'Interactive visualization of member connections and patterns',
    icon: '🎨',
    status: 'live',
    category: 'Collective Tools',
    accessPath: '/community/resonance-map',
    impact: 'Real-Time Community'
  },
  {
    id: 'biometric-consciousness',
    title: 'Biometric-Consciousness Bridge',
    description: 'Direct linking of physical health with spiritual development',
    icon: '💚',
    status: 'live',
    category: 'Integration',
    accessPath: '/dashboard/fascia-field-lab',
    impact: 'Body-Spirit Unity'
  },
  {
    id: 'optimal-timing',
    title: 'Optimal Practice Timing',
    description: 'AI-powered scheduling for maximum transformation impact',
    icon: '⏰',
    status: 'live',
    category: 'Optimization',
    accessPath: '/dashboard/practice-timing',
    impact: 'Perfect Synchronicity'
  },
  {
    id: 'collective-healing',
    title: 'Collective Shadow Integration',
    description: 'AI-facilitated community healing and conflict resolution',
    icon: '🛠️',
    status: 'beta',
    category: 'Healing Technologies',
    accessPath: '/community/shadow-integration',
    impact: 'Community Resilience'
  }
];

export function InnovationsShowcase({ variant = 'full' }: { variant?: 'full' | 'compact' | 'highlights' }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(innovations.map(i => i.category)))];

  const filteredInnovations = selectedCategory === 'all'
    ? innovations
    : innovations.filter(i => i.category === selectedCategory);

  const displayInnovations = variant === 'highlights'
    ? filteredInnovations.filter(i => i.highlight)
    : filteredInnovations;

  if (variant === 'compact') {
    return (
      <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-4">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Latest Innovations</h3>
        <div className="space-y-3">
          {displayInnovations.slice(0, 3).map(innovation => (
            <CompactInnovationCard key={innovation.id} innovation={innovation} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/community/library"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Explore all technologies →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-300 mb-4">
          🌀 Consciousness Technology Innovations
        </h2>
        <p className="text-purple-400 max-w-2xl mx-auto">
          Explore breakthrough technologies that support individual transformation and collective evolution
        </p>
      </div>

      {/* Category Filter */}
      {variant === 'full' && (
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-950/30 text-purple-300 hover:bg-purple-800/30'
              }`}
            >
              {category === 'all' ? 'All Technologies' : category}
            </button>
          ))}
        </div>
      )}

      {/* Innovations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayInnovations.map(innovation => (
          <InnovationCard key={innovation.id} innovation={innovation} />
        ))}
      </div>

      {/* Stats */}
      {variant === 'full' && (
        <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {innovations.filter(i => i.status === 'live').length}
              </div>
              <div className="text-sm text-purple-400">Live Technologies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {innovations.filter(i => i.status === 'beta').length}
              </div>
              <div className="text-sm text-purple-400">Beta Systems</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {innovations.filter(i => i.highlight).length}
              </div>
              <div className="text-sm text-purple-400">World-First</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">
                {categories.length - 1}
              </div>
              <div className="text-sm text-purple-400">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InnovationCard({ innovation }: { innovation: Innovation }) {
  const statusStyles = {
    live: 'bg-green-500 text-white',
    beta: 'bg-yellow-500 text-black',
    'coming-soon': 'bg-gray-500 text-white'
  };

  return (
    <div className={`bg-purple-950/30 rounded-lg border border-purple-800/30 p-6 hover:bg-purple-900/40 transition-all group ${
      innovation.highlight ? 'ring-2 ring-purple-500/50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{innovation.icon}</div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[innovation.status]}`}>
          {innovation.status.replace('-', ' ')}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-purple-300 mb-2 group-hover:text-white transition-colors">
        {innovation.title}
      </h3>
      <p className="text-purple-400 text-sm mb-4">{innovation.description}</p>

      {/* Impact Badge */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-purple-700/50 rounded-full text-xs text-purple-200">
          {innovation.impact}
        </span>
      </div>

      {/* Category */}
      <div className="text-xs text-purple-500 mb-4">{innovation.category}</div>

      {/* Access Button */}
      <Link
        href={innovation.accessPath}
        className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm"
      >
        <span>Explore</span>
        <span>→</span>
      </Link>

      {/* Highlight Badge */}
      {innovation.highlight && (
        <div className="absolute top-2 left-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

function CompactInnovationCard({ innovation }: { innovation: Innovation }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-purple-900/20 rounded-lg hover:bg-purple-800/20 transition-colors">
      <div className="text-xl">{innovation.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-purple-300 truncate">{innovation.title}</div>
        <div className="text-xs text-purple-400 truncate">{innovation.description}</div>
      </div>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        innovation.status === 'live' ? 'bg-green-400' :
        innovation.status === 'beta' ? 'bg-yellow-400' : 'bg-gray-400'
      }`}></div>
    </div>
  );
}
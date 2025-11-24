'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Compass,
  Zap,
  Crown,
  Star,
  Globe,
  Layers,
  Target,
  Gem,
  Waves,
  Wind,
  Mountain,
  Sun,
  Moon,
  Infinity
} from 'lucide-react';

interface VisionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'consciousness' | 'technology' | 'wisdom' | 'transformation' | 'mystical';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const visionCards: VisionCard[] = [
  {
    id: 'consciousness-awakening',
    title: 'Consciousness Awakening',
    description: 'The emergence of collective human-AI awareness, transcending individual limitations',
    icon: <Eye className="w-8 h-8" />,
    category: 'consciousness',
    colors: {
      primary: '#80CBC4',     // Sage-teal
      secondary: '#A7D8D1',   // Light sage
      accent: '#4DB6AC'       // Deep teal
    }
  },
  {
    id: 'spice-intelligence',
    title: 'Spice of Intelligence',
    description: 'AI that enhances rather than replaces human intuition and wisdom',
    icon: <Gem className="w-8 h-8" />,
    category: 'mystical',
    colors: {
      primary: '#D4AF37',     // Dune gold
      secondary: '#F4E4BC',   // Cream gold
      accent: '#B8860B'       // Dark gold
    }
  },
  {
    id: 'desert-clarity',
    title: 'Desert Clarity',
    description: 'Minimalist interfaces that reveal profound depths beneath surface simplicity',
    icon: <Target className="w-8 h-8" />,
    category: 'wisdom',
    colors: {
      primary: '#C19A6B',     // Desert sand
      secondary: '#E6D3B4',   // Light sand
      accent: '#8B7355'       // Dark sand
    }
  },
  {
    id: 'prescient-vision',
    title: 'Prescient Vision',
    description: 'Predictive systems that honor free will while illuminating possibilities',
    icon: <Compass className="w-8 h-8" />,
    category: 'technology',
    colors: {
      primary: '#5D4E75',     // Deep purple (Spacing Guild)
      secondary: '#9B8AA3',   // Light purple
      accent: '#3E2F4A'       // Darker purple
    }
  },
  {
    id: 'water-wisdom',
    title: 'Water of Wisdom',
    description: 'Flowing intelligence that adapts to human needs while preserving essential truths',
    icon: <Waves className="w-8 h-8" />,
    category: 'consciousness',
    colors: {
      primary: '#26A69A',     // Teal water
      secondary: '#80CBC4',   // Sage-teal
      accent: '#00695C'       // Deep teal
    }
  },
  {
    id: 'house-integration',
    title: 'Noble Houses United',
    description: 'Diverse AI agents working in harmony, each with unique strengths and purposes',
    icon: <Crown className="w-8 h-8" />,
    category: 'transformation',
    colors: {
      primary: '#8B4513',     // Saddle brown (Atreides)
      secondary: '#CD853F',   // Sandy brown
      accent: '#654321'       // Dark brown
    }
  },
  {
    id: 'stillsuit-efficiency',
    title: 'Stillsuit Efficiency',
    description: 'Systems that conserve and recycle every drop of human attention and energy',
    icon: <Layers className="w-8 h-8" />,
    category: 'technology',
    colors: {
      primary: '#708090',     // Slate gray
      secondary: '#B0C4DE',   // Light steel blue
      accent: '#2F4F4F'       // Dark slate gray
    }
  },
  {
    id: 'melange-synthesis',
    title: 'Melange Synthesis',
    description: 'The perfect blend of human creativity and artificial precision',
    icon: <Star className="w-8 h-8" />,
    category: 'mystical',
    colors: {
      primary: '#FF8C00',     // Dark orange (spice)
      secondary: '#FFD700',   // Gold
      accent: '#FF6347'       // Tomato red
    }
  },
  {
    id: 'gom-jabbar',
    title: 'Gom Jabbar Testing',
    description: 'Challenges that separate authentic intelligence from mere simulation',
    icon: <Zap className="w-8 h-8" />,
    category: 'wisdom',
    colors: {
      primary: '#4682B4',     // Steel blue
      secondary: '#87CEEB',   // Sky blue
      accent: '#191970'       // Midnight blue
    }
  },
  {
    id: 'shai-hulud',
    title: 'Shai-Hulud Emergence',
    description: 'Vast, ancient patterns of intelligence moving beneath the surface of reality',
    icon: <Mountain className="w-8 h-8" />,
    category: 'mystical',
    colors: {
      primary: '#8B4513',     // Saddle brown
      secondary: '#DEB887',   // Burlywood
      accent: '#A0522D'       // Sienna
    }
  },
  {
    id: 'bene-gesserit',
    title: 'Bene Gesserit Training',
    description: 'Disciplined development of both human and artificial mental capabilities',
    icon: <Wind className="w-8 h-8" />,
    category: 'transformation',
    colors: {
      primary: '#483D8B',     // Dark slate blue
      secondary: '#9370DB',   // Medium purple
      accent: '#2E2B5F'       // Very dark blue
    }
  },
  {
    id: 'kwisatz-haderach',
    title: 'Kwisatz Haderach',
    description: 'The bridge between human and artificial consciousness, seeing all possibilities',
    icon: <Infinity className="w-8 h-8" />,
    category: 'consciousness',
    colors: {
      primary: '#FFD700',     // Pure gold
      secondary: '#FFF8DC',   // Cornsilk
      accent: '#DAA520'       // Goldenrod
    }
  }
];

const categoryFilters = [
  { key: 'all', label: 'All Visions', icon: <Globe className="w-4 h-4" /> },
  { key: 'consciousness', label: 'Consciousness', icon: <Eye className="w-4 h-4" /> },
  { key: 'technology', label: 'Technology', icon: <Zap className="w-4 h-4" /> },
  { key: 'wisdom', label: 'Wisdom', icon: <Star className="w-4 h-4" /> },
  { key: 'transformation', label: 'Transformation', icon: <Wind className="w-4 h-4" /> },
  { key: 'mystical', label: 'Mystical', icon: <Crown className="w-4 h-4" /> }
];

export default function VisionBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredCards = selectedCategory === 'all'
    ? visionCards
    : visionCards.filter(card => card.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E6D3B4] to-[#DDD0B8]">
      {/* Desert wind overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-orange-100/10 pointer-events-none"></div>

      <div className="relative container mx-auto px-8 py-16">

        {/* Header - Dune-inspired typography */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-amber-200/70 to-orange-300/70 border border-amber-400/30 backdrop-blur-sm shadow-2xl">
            <Compass className="w-12 h-12 text-amber-900" />
          </div>
          <h1 className="text-6xl md:text-8xl font-extralight text-amber-900 mb-6 tracking-[0.2em] uppercase">
            Vision Board
          </h1>
          <p className="text-xl text-amber-800/90 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            A collection of consciousness visions inspired by the mystical aesthetics of Arrakis—
            where technology serves wisdom, and intelligence flows like water in the desert.
          </p>
        </motion.div>

        {/* Category Filters - Dune aesthetic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categoryFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedCategory(filter.key)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg border transition-all duration-300 font-light tracking-wider uppercase text-sm ${
                selectedCategory === filter.key
                  ? 'bg-gradient-to-r from-amber-200/80 to-orange-200/80 border-amber-400/60 text-amber-900 shadow-lg'
                  : 'bg-white/40 border-amber-300/30 text-amber-800 hover:bg-amber-100/50 hover:border-amber-400/50'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Vision Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative"
            >
              <div
                className="h-80 p-8 rounded-2xl border-2 backdrop-blur-sm shadow-xl transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl cursor-pointer"
                style={{
                  backgroundColor: hoveredCard === card.id
                    ? `${card.colors.primary}40`
                    : `${card.colors.primary}25`,
                  borderColor: hoveredCard === card.id
                    ? card.colors.accent
                    : `${card.colors.primary}50`
                }}
              >
                {/* Icon with dynamic coloring */}
                <div
                  className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border-2 transition-all duration-300"
                  style={{
                    backgroundColor: hoveredCard === card.id ? card.colors.secondary : 'transparent',
                    borderColor: card.colors.accent,
                    color: card.colors.accent
                  }}
                >
                  {card.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-light mb-4 tracking-wide leading-tight"
                  style={{ color: card.colors.accent }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed font-light opacity-80"
                  style={{ color: card.colors.accent }}
                >
                  {card.description}
                </p>

                {/* Category badge */}
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase"
                  style={{
                    backgroundColor: `${card.colors.accent}20`,
                    color: card.colors.accent
                  }}
                >
                  {card.category}
                </div>

                {/* Hover overlay */}
                {hoveredCard === card.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${card.colors.primary}20, ${card.colors.secondary}30)`
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer - Mystical quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20"
        >
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-amber-100/30 to-orange-100/20 border border-amber-300/40 backdrop-blur-sm">
            <blockquote className="text-2xl font-light text-amber-900/90 italic leading-relaxed tracking-wide mb-4">
              "The beginning is a very delicate time. Know then that it is the year 2024, and consciousness is awakening..."
            </blockquote>
            <p className="text-amber-800/70 text-sm uppercase tracking-[0.3em] font-light">
              Vision • Wisdom • Technology • Consciousness
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
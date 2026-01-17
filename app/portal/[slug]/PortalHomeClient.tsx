'use client';

/**
 * Portal Home Client Component
 *
 * The main client-side component for a practitioner's portal home page.
 * Renders the branded astrology experience with their AI companion.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, MessageCircle, Calendar, User } from 'lucide-react';
import type {
  PractitionerProfile,
  PractitionerTheme,
  AICompanionConfig,
  ColorPalette,
} from '@/lib/practitioner/types';

interface PortalHomeClientProps {
  practitioner: PractitionerProfile;
  theme: PractitionerTheme | null;
  aiConfig: AICompanionConfig | null;
}

// Default color palette if none is set
const DEFAULT_COLORS: ColorPalette = {
  primary: '#8B5CF6',
  secondary: '#D946EF',
  background: '#0f0d1a',
  surface: '#1a1625',
  text: '#e8e6f0',
  textSecondary: '#a09cb0',
  accent: '#FBBF24',
  border: '#2d2640',
};

export default function PortalHomeClient({
  practitioner,
  theme,
  aiConfig,
}: PortalHomeClientProps) {
  const [showChat, setShowChat] = useState(false);

  const colors = theme?.colorPalette || DEFAULT_COLORS;
  const aiName = aiConfig?.name || 'Guide';

  // Build CSS custom properties from theme
  const themeStyles = {
    '--portal-primary': colors.primary,
    '--portal-secondary': colors.secondary,
    '--portal-background': colors.background,
    '--portal-surface': colors.surface,
    '--portal-text': colors.text,
    '--portal-text-secondary': colors.textSecondary,
    '--portal-accent': colors.accent,
    '--portal-border': colors.border,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen"
      style={{
        ...themeStyles,
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      {/* Hero Section */}
      <header
        className="relative px-6 py-20 text-center"
        style={{
          background: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.background} 100%)`,
        }}
      >
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                backgroundColor: colors.accent,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Logo/Name */}
          <h1
            className="text-4xl md:text-6xl font-serif mb-4"
            style={{ color: colors.text }}
          >
            {practitioner.businessName || practitioner.name}
          </h1>

          {/* Tagline */}
          {practitioner.tagline && (
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
              style={{ color: colors.textSecondary }}
            >
              {practitioner.tagline}
            </p>
          )}

          {/* AI Companion Intro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
            style={{
              backgroundColor: `${colors.primary}20`,
              border: `1px solid ${colors.primary}40`,
            }}
          >
            <Sparkles size={18} style={{ color: colors.accent }} />
            <span style={{ color: colors.text }}>
              Meet <strong>{aiName}</strong> — your guide between sessions
            </span>
          </motion.div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Birth Chart */}
          <FeatureCard
            icon={<Star size={24} />}
            title="Your Birth Chart"
            description="Explore your natal chart with interpretations in my voice"
            colors={colors}
            onClick={() => {}}
          />

          {/* Talk to AI */}
          <FeatureCard
            icon={<MessageCircle size={24} />}
            title={`Talk to ${aiName}`}
            description="Get guidance anytime, in real-time"
            colors={colors}
            onClick={() => setShowChat(true)}
            highlighted
          />

          {/* Book Session */}
          <FeatureCard
            icon={<Calendar size={24} />}
            title="Book a Session"
            description={`Schedule time directly with ${practitioner.name}`}
            colors={colors}
            onClick={() => {}}
          />
        </div>

        {/* About Section */}
        {practitioner.bio && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2
              className="text-2xl font-serif mb-6 flex items-center gap-3"
              style={{ color: colors.text }}
            >
              <User size={24} style={{ color: colors.accent }} />
              About {practitioner.name}
            </h2>
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <p
                className="leading-relaxed whitespace-pre-wrap"
                style={{ color: colors.textSecondary }}
              >
                {practitioner.bio}
              </p>
            </div>
          </motion.section>
        )}

        {/* AI Companion CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
              border: `1px solid ${colors.primary}30`,
            }}
          >
            <Sparkles
              size={48}
              className="mx-auto mb-6"
              style={{ color: colors.accent }}
            />
            <h2
              className="text-2xl md:text-3xl font-serif mb-4"
              style={{ color: colors.text }}
            >
              {aiName} is here for you
            </h2>
            <p
              className="max-w-xl mx-auto mb-8"
              style={{ color: colors.textSecondary }}
            >
              Between sessions, {aiName} holds {practitioner.name}&apos;s wisdom and
              methodology. Ask questions, explore your chart, and deepen your
              understanding — any time.
            </p>
            <button
              onClick={() => setShowChat(true)}
              className="px-8 py-4 rounded-full font-medium text-lg transition-all hover:scale-105"
              style={{
                backgroundColor: colors.primary,
                color: colors.text,
                boxShadow: `0 0 30px ${colors.primary}40`,
              }}
            >
              Start Conversation with {aiName}
            </button>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center"
        style={{
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <p
          className="text-sm"
          style={{ color: colors.textSecondary }}
        >
          Powered by{' '}
          <a
            href="https://soullab.life"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
            style={{ color: colors.accent }}
          >
            Soullab
          </a>
        </p>
      </footer>

      {/* Chat Modal (placeholder - would integrate with actual AI chat) */}
      {showChat && (
        <ChatModal
          aiName={aiName}
          practitionerName={practitioner.name}
          colors={colors}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  colors,
  onClick,
  highlighted = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  colors: ColorPalette;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left rounded-xl p-6 transition-all"
      style={{
        backgroundColor: highlighted ? `${colors.primary}20` : colors.surface,
        border: `1px solid ${highlighted ? colors.primary : colors.border}`,
        boxShadow: highlighted ? `0 0 20px ${colors.primary}20` : 'none',
      }}
    >
      <div
        className="mb-4 p-3 rounded-lg inline-block"
        style={{
          backgroundColor: highlighted ? colors.primary : `${colors.primary}20`,
        }}
      >
        <span style={{ color: highlighted ? colors.text : colors.primary }}>
          {icon}
        </span>
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: colors.text }}
      >
        {title}
      </h3>
      <p
        className="text-sm"
        style={{ color: colors.textSecondary }}
      >
        {description}
      </p>
    </motion.button>
  );
}

// Chat Modal Component (placeholder)
function ChatModal({
  aiName,
  practitionerName,
  colors,
  onClose,
}: {
  aiName: string;
  practitionerName: string;
  colors: ColorPalette;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl h-[80vh] rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Sparkles size={20} style={{ color: colors.text }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: colors.text }}>
                {aiName}
              </h3>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                {practitionerName}&apos;s AI Companion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: colors.textSecondary }}
          >
            ✕
          </button>
        </div>

        {/* Chat Area (placeholder) */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <p style={{ color: colors.textSecondary }}>
            Chat integration coming soon...
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

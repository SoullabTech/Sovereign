"use client";

/**
 * CLIENT-FACING FAQ PAGE
 *
 * Public FAQ page for practitioner portals
 * Celestial aesthetic matching the portal design
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Star, Search } from 'lucide-react';
import type { PractitionerFAQ, FAQCategory } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  starlight: '#FFFFFF',
  gold: '#E5C158',
  violet: '#B8A5D9',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

const categoryLabels: Record<FAQCategory, string> = {
  about_sessions: 'About Sessions',
  booking_scheduling: 'Booking & Scheduling',
  astrology_questions: 'Astrology Questions',
  payments: 'Payments',
  about_practitioner: 'About Me',
  general: 'General',
};

const categoryIcons: Record<FAQCategory, string> = {
  about_sessions: '✨',
  booking_scheduling: '📅',
  astrology_questions: '🌟',
  payments: '💫',
  about_practitioner: '🌙',
  general: '💡',
};

const categoryOrder: FAQCategory[] = [
  'about_sessions',
  'booking_scheduling',
  'astrology_questions',
  'payments',
  'about_practitioner',
  'general',
];

interface FAQItemProps {
  faq: PractitionerFAQ;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: `${colors.nebula}90`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
      >
        <span className="font-medium text-base pr-4" style={{ color: colors.starlight }}>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: colors.gold }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="pt-4" style={{ borderTop: `1px solid ${colors.stardust}` }}>
                <p
                  className="text-base leading-relaxed whitespace-pre-wrap"
                  style={{ color: colors.muted }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PortalFAQPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [faqs, setFaqs] = useState<PractitionerFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, [slug]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/practitioner/${slug}/faq?published=true`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error('[FAQ] Error:', err);
      setError('Unable to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // Filter FAQs by search
  const filteredFaqs = searchQuery
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  // Group FAQs by category
  const faqsByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = filteredFaqs
      .filter(f => f.category === category)
      .sort((a, b) => a.display_order - b.display_order);
    return acc;
  }, {} as Record<FAQCategory, PractitionerFAQ[]>);

  const hasResults = filteredFaqs.length > 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="space-y-6 animate-pulse">
          <div className="h-12 w-64 rounded-lg mx-auto" style={{ backgroundColor: `${colors.nebula}50` }} />
          <div className="h-6 w-48 rounded-lg mx-auto" style={{ backgroundColor: `${colors.nebula}30` }} />
          <div className="h-12 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          <div className="space-y-4 pt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
          <p style={{ color: colors.muted }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Star className="w-8 h-8" style={{ color: colors.gold }} />
          <h1
            className="text-3xl lg:text-4xl font-display"
            style={{ color: colors.starlight, fontFamily: "'Cinzel', serif" }}
          >
            Frequently Asked Questions
          </h1>
          <Star className="w-8 h-8" style={{ color: colors.gold }} />
        </div>
        <p className="text-lg" style={{ color: colors.muted }}>
          Everything you need to know before we begin
        </p>
      </motion.div>

      {/* Search */}
      {faqs.length > 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: colors.dim }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none transition-all"
            style={{
              backgroundColor: colors.nebula,
              color: colors.starlight,
              border: `1px solid ${colors.stardust}`,
            }}
          />
        </motion.div>
      )}

      {/* FAQ List */}
      {hasResults ? (
        <div className="space-y-10">
          {categoryOrder.map((category, catIndex) => {
            const categoryFaqs = faqsByCategory[category];
            if (categoryFaqs.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">{categoryIcons[category]}</span>
                  <h2
                    className="text-lg font-medium tracking-wide"
                    style={{ color: colors.gold }}
                  >
                    {categoryLabels[category]}
                  </h2>
                </div>

                <div className="space-y-3">
                  {categoryFaqs.map((faq, index) => (
                    <FAQItem
                      key={faq.id}
                      faq={faq}
                      isOpen={openFaqId === faq.id}
                      onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
          <p className="text-lg mb-2" style={{ color: colors.muted }}>
            {searchQuery ? 'No matching questions found' : 'No FAQs available yet'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm"
              style={{ color: colors.gold }}
            >
              Clear search
            </button>
          )}
        </motion.div>
      )}

      {/* Contact CTA */}
      {faqs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 rounded-xl p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${colors.gold}10 0%, ${colors.violet}10 100%)`,
            border: `1px solid ${colors.gold}30`,
          }}
        >
          <Star className="w-8 h-8 mx-auto mb-4" style={{ color: colors.gold }} />
          <h3
            className="text-xl font-display mb-2"
            style={{ color: colors.starlight, fontFamily: "'Cinzel', serif" }}
          >
            Still have questions?
          </h3>
          <p className="mb-6" style={{ color: colors.muted }}>
            I'm here to help you on your journey
          </p>
          <a
            href={`/portal/${slug}/book`}
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
            style={{ backgroundColor: colors.gold, color: colors.void }}
          >
            Book a Session
          </a>
        </motion.div>
      )}
    </div>
  );
}

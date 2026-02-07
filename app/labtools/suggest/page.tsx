'use client';

/**
 * Suggest a Tool
 *
 * This is where members co-create the Lab.
 * Not a support ticket — a collaboration.
 *
 * The ethics field quietly trains the culture:
 * "What should we be careful about?"
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lightbulb,
  Send,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { CATEGORY_META, type ToolCategory } from '@/config/toolRegistry';

// Consciousness domains available for suggestions
const SUGGESTION_CATEGORIES: ToolCategory[] = [
  'somatic',
  'cognitive',
  'psychological',
  'relational',
  'mythic',
  'philosophical',
  'spiritual',
  'metaphysical',
];

interface FormData {
  title: string;
  category: ToolCategory | '';
  shortDescription: string;
  useCase: string;
  ethicalNotes: string;
  referenceLinks: string;
}

export default function SuggestToolPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    shortDescription: '',
    useCase: '',
    ethicalNotes: '',
    referenceLinks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiFetch('/api/tool-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Success!
      setSubmittedTitle(formData.title);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/labtools/discover');
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 mb-6
                       rounded-full bg-emerald-500/20 border border-emerald-500/30"
            >
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Suggestion Received
            </h1>

            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Thank you for helping shape the Lab. We review suggestions weekly
              and will reach out if we have questions.
            </p>

            {/* Receipt */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8 text-left">
              <div className="text-xs text-white/40 uppercase tracking-wide mb-1">
                Your suggestion
              </div>
              <div className="text-lg font-medium text-white mb-3">
                {submittedTitle}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                  Submitted
                </span>
                <span className="text-xs text-white/40">
                  Just now
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    title: '',
                    category: '',
                    shortDescription: '',
                    useCase: '',
                    ethicalNotes: '',
                    referenceLinks: '',
                  });
                }}
                className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]
                         text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Suggest Another
              </button>
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl bg-[#D4B896]/10 border border-[#D4B896]/20
                         text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
              >
                Back to Discover
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-white/[0.03] border border-white/[0.06]
                     text-white/70 hover:text-white hover:bg-white/[0.06]
                     transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Discover</span>
          </button>
        </div>

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 mb-3
                     rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5
                     border border-amber-500/20"
          >
            <Lightbulb className="w-6 h-6 text-amber-400" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Suggest a Tool
          </h1>
          <p className="text-white/50 max-w-md mx-auto">
            You're helping shape the Lab. What would serve your exploration?
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tool Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Dream Journal, Breath Timer, Symbol Library"
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl
                       bg-white/[0.03] border border-white/[0.06]
                       text-white placeholder-white/30
                       focus:outline-none focus:border-[#D4B896]/30
                       transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl appearance-none
                         bg-white/[0.03] border border-white/[0.06]
                         text-white
                         focus:outline-none focus:border-[#D4B896]/30
                         transition-colors"
              >
                <option value="" className="bg-[#1a1f2e]">
                  Select a category...
                </option>
                {SUGGESTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1a1f2e]">
                    {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              What does it help you do? <span className="text-red-400">*</span>
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="One or two sentences about the tool's purpose..."
              required
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl resize-none
                       bg-white/[0.03] border border-white/[0.06]
                       text-white placeholder-white/30
                       focus:outline-none focus:border-[#D4B896]/30
                       transition-colors"
            />
            <div className="text-xs text-white/30 mt-1 text-right">
              {formData.shortDescription.length}/500
            </div>
          </div>

          {/* Use Case */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              When would you use it?
            </label>
            <textarea
              name="useCase"
              value={formData.useCase}
              onChange={handleChange}
              placeholder="Describe a scenario where this tool would be helpful..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl resize-none
                       bg-white/[0.03] border border-white/[0.06]
                       text-white placeholder-white/30
                       focus:outline-none focus:border-[#D4B896]/30
                       transition-colors"
            />
          </div>

          {/* Ethical Notes */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Anything to be careful about?
            </label>
            <textarea
              name="ethicalNotes"
              value={formData.ethicalNotes}
              onChange={handleChange}
              placeholder="Does this tool affect memory? Other people? What should we consider?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl resize-none
                       bg-white/[0.03] border border-white/[0.06]
                       text-white placeholder-white/30
                       focus:outline-none focus:border-[#D4B896]/30
                       transition-colors"
            />
            <p className="text-xs text-white/30 mt-1">
              Tools that affect memory or other people need extra stewardship.
            </p>
          </div>

          {/* References */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Inspiration or references
            </label>
            <input
              type="text"
              name="referenceLinks"
              value={formData.referenceLinks}
              onChange={handleChange}
              placeholder="Links, apps, or ideas that inspired this..."
              className="w-full px-4 py-3 rounded-xl
                       bg-white/[0.03] border border-white/[0.06]
                       text-white placeholder-white/30
                       focus:outline-none focus:border-[#D4B896]/30
                       transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                       bg-[#D4B896]/10 border border-[#D4B896]/20
                       text-[#D4B896] font-medium
                       hover:bg-[#D4B896]/20 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Suggestion
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-white/30 max-w-md mx-auto">
            We review suggestions weekly. The best ideas shape the Lab together.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

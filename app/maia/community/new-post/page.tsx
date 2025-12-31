'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  FileText,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Star,
  Loader2,
  Info
} from 'lucide-react';

/**
 * New Post Form
 *
 * Multi-tier contribution form supporting different content types:
 * - Discussion (Tier 4) - Open forum
 * - Question (Tier 4) - Seeking guidance
 * - Practice Report (Tier 3) - Share your journey
 * - Breakthrough (Tier 3) - Transformation moments
 * - Review (Tier 3) - Book/resource reviews
 * - Essay (Tier 2) - Deeper exploration (requires approval)
 */

interface Territory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  parent_slug?: string;
  is_technical?: boolean;
  section?: string;
}

const CONTENT_TYPES = [
  {
    id: 'discussion',
    name: 'Discussion',
    description: 'Start a conversation on any topic',
    icon: MessageSquare,
    tier: 4,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'question',
    name: 'Question',
    description: 'Seek guidance from the community',
    icon: HelpCircle,
    tier: 4,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'practice_report',
    name: 'Practice Report',
    description: 'Share your journey and experiences',
    icon: BookOpen,
    tier: 3,
    color: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
  {
    id: 'breakthrough',
    name: 'Breakthrough',
    description: 'Document a transformation moment',
    icon: Lightbulb,
    tier: 3,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Review a book, resource, or practice',
    icon: Star,
    tier: 3,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'essay',
    name: 'Essay',
    description: 'Deeper exploration (requires approval)',
    icon: FileText,
    tier: 2,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
];

const ELEMENTS = [
  { id: 'fire', name: 'Fire', icon: Flame, color: 'text-orange-400' },
  { id: 'water', name: 'Water', icon: Droplets, color: 'text-blue-400' },
  { id: 'earth', name: 'Earth', icon: Mountain, color: 'text-green-400' },
  { id: 'air', name: 'Air', icon: Wind, color: 'text-sky-400' },
  { id: 'aether', name: 'Aether', icon: Sparkles, color: 'text-purple-400' },
];

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTerritory = searchParams.get('territory');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('discussion');
  const [territorySlug, setTerritorySlug] = useState(preselectedTerritory || '');
  const [element, setElement] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch territories
  useEffect(() => {
    async function fetchTerritories() {
      try {
        const res = await fetch('/api/community/territories?children=true');
        const data = await res.json();
        if (data.ok) {
          setTerritories(data.territories);
        }
      } catch (err) {
        console.error('Failed to fetch territories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTerritories();
  }, []);

  // Add tag
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.trim().length < 50) {
      setError('Content must be at least 50 characters');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          contentType,
          territorySlug: territorySlug || undefined,
          element: element || undefined,
          tags,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push(`/maia/community/post/${data.post.id}`);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = CONTENT_TYPES.find((t) => t.id === contentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="w-px h-6 bg-amber-500/30" />
            <h1 className="text-xl font-bold text-amber-100">Share Your Wisdom</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-4">
              What are you sharing?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CONTENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = contentType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setContentType(type.id)}
                    className={`
                      p-4 rounded-xl border text-left transition-all
                      ${isSelected
                        ? `${type.color} border-2`
                        : 'bg-slate-900/50 border-amber-500/20 hover:border-amber-500/30'}
                    `}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? '' : 'text-amber-300/70'}`} />
                    <div className={`font-medium text-sm ${isSelected ? '' : 'text-amber-100'}`}>
                      {type.name}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? 'opacity-80' : 'text-amber-300/50'}`}>
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedType?.tier === 2 && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-amber-300/80">
                  Essays require elder review before publication
                </span>
              </div>
            )}
          </div>

          {/* Territory Selection */}
          <div>
            <label className="block text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-3">
              Territory (Optional)
            </label>
            <select
              value={territorySlug}
              onChange={(e) => setTerritorySlug(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/80 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500/40"
            >
              <option value="">Select a territory...</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <optgroup label="✨ Wisdom Territories">
                    {territories
                      .filter((t) => !t.is_technical)
                      .map((t) => (
                        <option key={t.id} value={t.slug}>
                          {t.parent_slug ? `  └ ${t.icon} ${t.name}` : `${t.icon} ${t.name}`}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="⚗️ Technical / Soullab Lab">
                    {territories
                      .filter((t) => t.is_technical)
                      .map((t) => (
                        <option key={t.id} value={t.slug}>
                          {t.parent_slug ? `  └ ${t.icon} ${t.name}` : `${t.icon} ${t.name}`}
                        </option>
                      ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-3">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a meaningful title..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-500/40"
              maxLength={200}
            />
            <div className="text-xs text-amber-300/40 mt-2 text-right">
              {title.length}/200
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-3">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your wisdom, experiences, or questions..."
              rows={12}
              className="w-full px-4 py-3 bg-slate-800/80 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-500/40 resize-none"
            />
            <div className="flex justify-between text-xs text-amber-300/40 mt-2">
              <span>Markdown supported</span>
              <span className={content.length < 50 ? 'text-red-400' : ''}>
                {content.length} characters (min 50)
              </span>
            </div>
          </div>

          {/* Element (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-3">
              Element (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setElement('')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  !element
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/50 border-amber-500/20 text-amber-300/60 hover:border-amber-500/30'
                }`}
              >
                None
              </button>
              {ELEMENTS.map((el) => {
                const Icon = el.icon;
                const isSelected = element === el.id;
                return (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => setElement(el.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/40'
                        : 'bg-slate-800/50 border-amber-500/20 hover:border-amber-500/30'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${el.color}`} />
                    <span className={isSelected ? 'text-amber-300' : 'text-amber-300/60'}>
                      {el.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-3">
              Tags (up to 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-amber-300/50 hover:text-amber-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-slate-800/80 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-500/40"
                disabled={tags.length >= 5}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 5 || !tagInput.trim()}
                className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
            <Link
              href="/maia/community"
              className="text-amber-300/70 hover:text-amber-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !title.trim() || content.length < 50}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {selectedType?.tier === 2 ? 'Submit for Review' : 'Publish'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

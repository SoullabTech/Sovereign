'use client';

/**
 * ReflectionDetail — one kept reflection, rendered at two addresses.
 *
 * Extracted from app/labtools/reflections/[id]/page.tsx so the member-facing
 * /reflections/[id] and the founder/lab /labtools/reflections/[id] render the
 * same surface over the same member-scoped data (/api/capsules/[id]).
 * See components/reflections/ReflectionsFeed.tsx for why the member route
 * exists at all (founder ruling 2026-09-04, Journal precedent).
 *
 * The one addition beyond the extraction is the "Discuss this with MAIA"
 * section at the foot of the page — see DiscussWithMaia.tsx for the constraints
 * it holds (no manufactured interpretation, visible transfer, no persistence).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Pin,
  Archive,
  Edit3,
  Check,
  X,
  Calendar,
  Tag,
  Quote,
  Target,
  Compass,
  Eye,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CapsuleDTO, Element } from '@/lib/capsules/types';
import DiscussWithMaia from './DiscussWithMaia';

// Element icons mapping.
// Typed as LucideIcon rather than React.FC<{ className?: string }> — the call
// site passes `style` for the element colour, which the narrower type rejected.
const ElementIcon: Record<Element, LucideIcon> = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Star,
};

// Element colors
const elementColors: Record<Element, string> = {
  fire: '#e85d4c',
  water: '#5a7a9f',
  earth: '#7a6f5a',
  air: '#5a7a6f',
  aether: '#8b7aa0',
};

export interface ReflectionDetailProps {
  /** Capsule id — supplied by the route that mounts this. */
  id: string;
  /** Address this reflection lives at: `${basePath}/${id}`. */
  basePath?: string;
}

export default function ReflectionDetail({
  id,
  basePath = '/reflections',
}: ReflectionDetailProps) {
  const router = useRouter();

  const [capsule, setCapsule] = useState<CapsuleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  // Fetch capsule
  const fetchCapsule = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/capsules/${id}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin');
          return;
        }
        if (response.status === 404) {
          setError('Reflection not found');
          return;
        }
        throw new Error('Failed to fetch reflection');
      }

      const data = await response.json();
      // API returns { capsule }, but handle both formats for robustness
      const capsuleData = data?.capsule ?? data;

      // Normalize arrays to prevent future crashes from missing fields
      const normalized: CapsuleDTO = {
        ...capsuleData,
        goldLines: capsuleData?.goldLines ?? [],
        decisions: capsuleData?.decisions ?? [],
        nextSteps: capsuleData?.nextSteps ?? [],
        practices: capsuleData?.practices ?? [],
        patterns: capsuleData?.patterns ?? [],
        tags: capsuleData?.tags ?? [],
      };

      if (!normalized?.id) {
        console.warn('[reflections] capsule payload missing id', data);
      }

      setCapsule(normalized);
      setEditTitle(normalized?.title ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCapsule();
  }, [fetchCapsule]);

  // Handle pin/unpin
  const handlePin = async () => {
    if (!capsule) return;
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !capsule.pinned }),
      });
      fetchCapsule();
    } catch (err) {
      console.error('Failed to pin capsule:', err);
    }
  };

  // Handle archive
  const handleArchive = async () => {
    if (!capsule) return;
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !capsule.archived }),
      });
      fetchCapsule();
    } catch (err) {
      console.error('Failed to archive capsule:', err);
    }
  };

  // Handle title edit
  const handleSaveTitle = async () => {
    if (!capsule || editTitle === capsule.title) {
      setIsEditing(false);
      return;
    }
    try {
      await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      });
      fetchCapsule();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button
            onClick={() => router.push(basePath)}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reflections</span>
          </button>

          <div className="text-center py-20">
            <p className="text-red-500 text-[14px]">{error || 'Reflection not found'}</p>
            <button
              onClick={() => router.push(basePath)}
              className="mt-4 text-[13px] text-stone-500 hover:text-stone-700 underline"
            >
              Return to reflections
            </button>
          </div>
        </div>
      </div>
    );
  }

  const element = capsule.signals?.element;
  const ElementIconComponent = element ? ElementIcon[element] : null;
  const elementColor = element ? elementColors[element] : '#5a7a6f';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(basePath)}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reflections</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePin}
              className={`p-2 rounded-lg transition-colors ${
                capsule.pinned
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-200'
              }`}
              title={capsule.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-4 h-4" />
            </button>
            <button
              onClick={handleArchive}
              className={`p-2 rounded-lg transition-colors ${
                capsule.archived
                  ? 'bg-stone-200 text-stone-600'
                  : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-200'
              }`}
              title={capsule.archived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
        >
          {/* Title Section */}
          <div className="p-6 border-b border-stone-100">
            <div className="flex items-start gap-4">
              {/* Element Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${elementColor}15` }}
              >
                {ElementIconComponent ? (
                  <ElementIconComponent className="w-6 h-6" style={{ color: elementColor }} />
                ) : (
                  <Sparkles className="w-6 h-6" style={{ color: elementColor }} />
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 text-xl font-light text-stone-800 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditTitle(capsule.title);
                        setIsEditing(false);
                      }}
                      className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-light text-stone-800 truncate">{capsule.title}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-stone-400 hover:text-stone-600 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 text-[12px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(capsule.createdAt)}
                  </span>
                  {capsule.sourceType && (
                    <span className="px-2 py-0.5 bg-stone-100 rounded-full capitalize">
                      {capsule.sourceType}
                    </span>
                  )}
                  {capsule.draft && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-b border-stone-100">
            <p className="text-stone-600 text-[15px] leading-relaxed">{capsule.summary}</p>
          </div>

          {/* Gold Lines */}
          {capsule.goldLines.length > 0 && (
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-4 h-4 text-amber-500" />
                <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide">
                  Gold Lines
                </h3>
              </div>
              <div className="space-y-3">
                {capsule.goldLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="pl-4 border-l-2 border-amber-300 text-stone-600 text-[14px] italic"
                  >
                    "{line.text}"
                    {line.speaker && (
                      <span className="ml-2 text-stone-400 text-[12px] not-italic">
                        — {line.speaker === 'maia' ? 'MAIA' : 'You'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decisions */}
          {capsule.decisions.length > 0 && (
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-[#5a7a6f]" />
                <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide">
                  Decisions Made
                </h3>
              </div>
              <ul className="space-y-2">
                {capsule.decisions.map((decision, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-stone-600 text-[14px]">
                    <span className="text-[#5a7a6f] mt-0.5">•</span>
                    {decision.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {capsule.nextSteps.length > 0 && (
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-blue-500" />
                <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide">
                  Next Steps
                </h3>
              </div>
              <ul className="space-y-2">
                {capsule.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-stone-600 text-[14px]">
                    <span className="text-blue-500 mt-0.5">→</span>
                    <span>
                      {step.text}
                      {step.due && (
                        <span className="ml-2 text-stone-400 text-[12px]">({step.due})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Patterns */}
          {capsule.patterns.length > 0 && (
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-purple-500" />
                <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide">
                  Patterns Noticed
                </h3>
              </div>
              <ul className="space-y-2">
                {capsule.patterns.map((pattern, idx) => (
                  <li key={idx} className="text-stone-600 text-[14px]">
                    <span className="font-medium text-purple-600">{pattern.name}</span>
                    {pattern.description && (
                      <span className="text-stone-500"> — {pattern.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {capsule.tags.length > 0 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-stone-400" />
                <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide">
                  Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {capsule.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[12px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Source Excerpt (if available) */}
        {capsule.sourceExcerpt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 bg-white rounded-2xl border border-stone-200 shadow-sm p-6"
          >
            <h3 className="text-[13px] font-medium text-stone-700 uppercase tracking-wide mb-4">
              Source Excerpt
            </h3>
            <div className="text-stone-500 text-[13px] leading-relaxed whitespace-pre-wrap font-mono bg-stone-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              {capsule.sourceExcerpt}
            </div>
          </motion.div>
        )}

        {/* Bring it back into conversation — member act, nothing written */}
        <DiscussWithMaia capsule={capsule} returnTo={basePath} />
      </div>
    </div>
  );
}

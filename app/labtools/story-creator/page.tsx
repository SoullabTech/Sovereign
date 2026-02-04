'use client';

/**
 * Story Creator - Living Mythology Co-Authored with MAIA
 *
 * This is where members author their soul story - not a static reading,
 * but a living mythology that grows as consciousness grows.
 *
 * Philosophy:
 * - Stories GROW (not static readings)
 * - Co-authored (MAIA drafts, member refines)
 * - Living mythology (chart as framework, life as content)
 * - Witnessed evolution (MAIA remembers across time)
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  PenTool,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Clock,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';

// Types
interface ChartSummary {
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  chartPattern: string | null;
  dominantElement: string | null;
  keyThemes: string[];
}

interface StorySettings {
  narrativeVoice: string;
  archetypeDepth: string;
  autoGenerateChapters: boolean;
  includeTransits: boolean;
}

interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  status: 'draft' | 'in-revision' | 'approved';
  currentDraft: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
}

interface SoulStory {
  id: string;
  title: string;
  subtitle: string | null;
  chartSummary: ChartSummary;
  settings: StorySettings;
  createdAt: string;
  updatedAt: string;
}

interface StoryData {
  story: SoulStory;
  chapters: Chapter[];
  threads: any[];
  timeline: any[];
}

// Status badge component
function StatusBadge({ status }: { status: Chapter['status'] }) {
  const colors = {
    draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'in-revision': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const labels = {
    draft: 'Draft',
    'in-revision': 'In Revision',
    approved: 'Approved',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function StoryCreatorPage() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [memberNote, setMemberNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRevising, setIsRevising] = useState(false);

  // Fetch story data
  const fetchStory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/story');
      const data = await response.json();

      if (data.success && data.data) {
        setStoryData(data.data);
        // Auto-expand Genesis chapter if it's a draft
        if (data.data.chapters?.[0]?.status === 'draft') {
          setExpandedChapter(data.data.chapters[0].id);
        }
      } else {
        setStoryData(null);
      }
    } catch (error) {
      console.error('[StoryCreator] Failed to fetch story:', error);
      setStoryData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  // Create story from birth chart
  const handleBirthDataSubmit = async (birthData: any) => {
    try {
      setIsCreatingStory(true);

      // First, calculate birth chart
      const chartResponse = await apiFetch('/api/astrology/birth-chart', {
        method: 'POST',
        body: JSON.stringify({
          date: birthData.date,
          time: birthData.time,
          location: {
            lat: birthData.location.lat,
            lng: birthData.location.lng,
            timezone: birthData.location.timezone,
          },
          houseSystem: birthData.houseSystem || 'placidus',
        }),
      });

      const chartResult = await chartResponse.json();

      if (!chartResult.success) {
        throw new Error(chartResult.error || 'Failed to calculate birth chart');
      }

      // Transform chart data for story creation
      const chartData = {
        sun: {
          sign: chartResult.data.sun.sign,
          house: chartResult.data.sun.house,
          degrees: chartResult.data.sun.longitude % 30,
        },
        moon: {
          sign: chartResult.data.moon.sign,
          house: chartResult.data.moon.house,
          degrees: chartResult.data.moon.longitude % 30,
        },
        rising: {
          sign: chartResult.data.ascendant.sign,
          degrees: chartResult.data.ascendant.longitude % 30,
        },
        mercury: chartResult.data.mercury ? {
          sign: chartResult.data.mercury.sign,
          house: chartResult.data.mercury.house,
          retrograde: chartResult.data.mercury.retrograde,
        } : undefined,
        venus: chartResult.data.venus ? {
          sign: chartResult.data.venus.sign,
          house: chartResult.data.venus.house,
        } : undefined,
        mars: chartResult.data.mars ? {
          sign: chartResult.data.mars.sign,
          house: chartResult.data.mars.house,
        } : undefined,
        jupiter: chartResult.data.jupiter ? {
          sign: chartResult.data.jupiter.sign,
          house: chartResult.data.jupiter.house,
          retrograde: chartResult.data.jupiter.retrograde,
        } : undefined,
        saturn: chartResult.data.saturn ? {
          sign: chartResult.data.saturn.sign,
          house: chartResult.data.saturn.house,
          retrograde: chartResult.data.saturn.retrograde,
        } : undefined,
        chartPattern: chartResult.data.chartPattern,
        focalPlanet: chartResult.data.focalPlanet,
        dominantElement: chartResult.data.dominantElement,
        angularPlanets: chartResult.data.angularPlanets,
      };

      // Initialize story with chart data
      const storyResponse = await apiFetch('/api/story', {
        method: 'POST',
        body: JSON.stringify({ chartData }),
      });

      const storyResult = await storyResponse.json();

      if (!storyResult.success) {
        throw new Error(storyResult.error || 'Failed to initialize story');
      }

      // Refresh story data
      await fetchStory();
      setShowBirthForm(false);
    } catch (error) {
      console.error('[StoryCreator] Error creating story:', error);
      alert(error instanceof Error ? error.message : 'Failed to create story');
    } finally {
      setIsCreatingStory(false);
    }
  };

  // Add member note
  const handleAddNote = async (chapterId: string) => {
    if (!memberNote.trim()) return;

    try {
      setIsSubmittingNote(true);
      const response = await apiFetch('/api/story/chapters', {
        method: 'POST',
        body: JSON.stringify({
          chapterId,
          noteText: memberNote,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMemberNote('');
        alert('Note added. MAIA will incorporate your feedback in the next revision.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[StoryCreator] Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Approve chapter
  const handleApprove = async (chapterId: string) => {
    try {
      setIsApproving(true);
      const response = await apiFetch('/api/story/chapters', {
        method: 'PATCH',
        body: JSON.stringify({
          chapterId,
          action: 'approve',
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchStory();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[StoryCreator] Error approving chapter:', error);
      alert('Failed to approve chapter');
    } finally {
      setIsApproving(false);
    }
  };

  // Request revision
  const handleRevise = async (chapterId: string) => {
    try {
      setIsRevising(true);
      const response = await apiFetch('/api/story/chapters', {
        method: 'PATCH',
        body: JSON.stringify({
          chapterId,
          action: 'revise',
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchStory();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[StoryCreator] Error requesting revision:', error);
      alert(error instanceof Error ? error.message : 'Failed to request revision');
    } finally {
      setIsRevising(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-amber-400" />
        </motion.div>
      </div>
    );
  }

  // No story yet - show creation flow
  if (!storyData) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab Tools
          </button>

          {showBirthForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-medium text-white mb-2">Enter Your Birth Data</h1>
                <p className="text-gray-400 text-sm">
                  Your birth chart becomes the foundation of your living mythology
                </p>
              </div>
              <BirthDataForm
                onSubmit={handleBirthDataSubmit}
                loading={isCreatingStory}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>

              <h1 className="text-3xl font-medium text-white mb-4">Story Creator</h1>
              <p className="text-gray-400 mb-2">
                Your Living Mythology, Co-Authored with MAIA
              </p>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                Not a static reading. A growing narrative that evolves as you do.
                MAIA weaves your birth chart, sessions, and journals into a sacred text
                written specifically for your soul.
              </p>

              <div className="space-y-4 text-left max-w-md mx-auto mb-10 px-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Genesis Chapter</div>
                    <div className="text-gray-500 text-xs">
                      Your soul architecture revealed through your birth chart
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PenTool className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Co-Authorship</div>
                    <div className="text-gray-500 text-xs">
                      You give feedback, MAIA revises. True collaboration.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Living Narrative</div>
                    <div className="text-gray-500 text-xs">
                      New chapters emerge as your journey unfolds
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBirthForm(true)}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
              >
                Begin Your Story
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Story exists - show chapters
  const { story, chapters } = storyData;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab Tools
          </button>
        </div>

        {/* Story Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-white">{story.title}</h1>
              <p className="text-gray-500 text-sm">{story.subtitle}</p>
            </div>
          </div>

          {/* Chart Summary */}
          {story.chartSummary && (
            <div className="flex flex-wrap gap-2 mt-4">
              {story.chartSummary.sunSign && (
                <span className="px-3 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Sun in {story.chartSummary.sunSign}
                </span>
              )}
              {story.chartSummary.moonSign && (
                <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Moon in {story.chartSummary.moonSign}
                </span>
              )}
              {story.chartSummary.risingSign && (
                <span className="px-3 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {story.chartSummary.risingSign} Rising
                </span>
              )}
              {story.chartSummary.chartPattern && (
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {story.chartSummary.chartPattern} Pattern
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Chapters */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Chapters
          </h2>

          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50"
            >
              {/* Chapter Header */}
              <button
                onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-sm font-medium">
                    {chapter.chapterNumber}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{chapter.title}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {new Date(chapter.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={chapter.status} />
                  {expandedChapter === chapter.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Chapter Content */}
              <AnimatePresence>
                {expandedChapter === chapter.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 border-t border-gray-800">
                      {/* Narrative Text */}
                      <div className="mt-6 prose prose-invert prose-sm max-w-none">
                        <div
                          className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {chapter.currentDraft.split('\n').map((paragraph, i) => {
                            // Handle bold markdown
                            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                            return (
                              <p key={i} className="mb-4">
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={j} className="text-amber-400">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions for non-approved chapters */}
                      {chapter.status !== 'approved' && (
                        <div className="mt-8 pt-6 border-t border-gray-800">
                          {/* Add Note */}
                          <div className="mb-6">
                            <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Add your feedback for MAIA
                            </label>
                            <textarea
                              value={memberNote}
                              onChange={(e) => setMemberNote(e.target.value)}
                              placeholder="This resonates, but I'd like to add... / This doesn't feel quite right because..."
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 text-sm resize-none focus:outline-none focus:border-amber-500/50"
                              rows={3}
                            />
                            <button
                              onClick={() => handleAddNote(chapter.id)}
                              disabled={isSubmittingNote || !memberNote.trim()}
                              className="mt-2 px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isSubmittingNote ? 'Adding...' : 'Add Note'}
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(chapter.id)}
                              disabled={isApproving}
                              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isApproving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Approve Chapter
                            </button>
                            <button
                              onClick={() => handleRevise(chapter.id)}
                              disabled={isRevising}
                              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isRevising ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                              Request Revision
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            Add notes above, then click "Request Revision" for MAIA to incorporate your feedback
                          </p>
                        </div>
                      )}

                      {/* Approved state */}
                      {chapter.status === 'approved' && (
                        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <Check className="w-4 h-4" />
                            This chapter has been sealed into your living mythology
                          </div>
                          {chapter.approvedAt && (
                            <div className="text-emerald-500/60 text-xs mt-1">
                              Approved on {new Date(chapter.approvedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            More chapters will emerge as your journey unfolds
          </p>
        </div>
      </div>
    </div>
  );
}

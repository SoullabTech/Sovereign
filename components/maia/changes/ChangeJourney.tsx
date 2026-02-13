'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Eye,
  Star,
  TrendingDown,
  Moon,
  Sparkles,
  Send,
  X,
  Wind,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramGlyph from '@/components/iching/HexagramGlyph';
import MemberHexagramCaster from './MemberHexagramCaster';
import MemberHexagramReading from './MemberHexagramReading';
import type { ChangeRecord, ChangeExperience, ChangeExperienceType } from '@/lib/studio/changes/types';

interface ChangeJourneyProps {
  changeId: string;
  memberId: string;
  onBack: () => void;
}

const EXPERIENCE_TYPE_CONFIG = {
  reflection: { icon: BookOpen, label: 'Reflection', color: 'text-stone-400', bgColor: 'bg-stone-500/10' },
  field_event: { icon: Eye, label: 'Field Event', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  breakthrough: { icon: Star, label: 'Breakthrough', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  setback: { icon: TrendingDown, label: 'Setback', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  dream: { icon: Moon, label: 'Dream', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
  synchronicity: { icon: Sparkles, label: 'Synchronicity', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
};

const CHANGE_TYPE_LABELS = {
  dissolution: 'Dissolution',
  emergence: 'Emergence',
  threshold: 'Threshold',
  integration: 'Integration',
  upheaval: 'Upheaval',
  ripening: 'Ripening',
};

const STATUS_LABELS = {
  naming: 'Named',
  casting: 'Casting',
  consulting: 'Consulting',
  active: 'Active',
  integrating: 'Integrating',
  complete: 'Complete',
  archived: 'Archived',
};

export default function ChangeJourney({
  changeId,
  memberId,
  onBack,
}: ChangeJourneyProps) {
  const [change, setChange] = useState<ChangeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Section visibility
  const [showReading, setShowReading] = useState(true);
  const [showCouncil, setShowCouncil] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);

  // Casting state
  const [showCaster, setShowCaster] = useState(false);
  const [castingInProgress, setCastingInProgress] = useState(false);

  // Interpretation state
  const [interpretationLoading, setInterpretationLoading] = useState(false);

  // Experience form state
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceType, setExperienceType] = useState<ChangeExperienceType>('reflection');
  const [experienceContent, setExperienceContent] = useState('');
  const [experienceElement, setExperienceElement] = useState<string | undefined>();
  const [savingExperience, setSavingExperience] = useState(false);

  // Consultation state
  const [consultingCouncil, setConsultingCouncil] = useState(false);

  useEffect(() => {
    fetchChange();
  }, [changeId]);

  const fetchChange = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/changes/${changeId}`);
      if (!response.ok) {
        throw new Error('Failed to load change');
      }

      const data = await response.json();
      setChange(data.change);

      // Auto-show caster if hexagram not cast yet
      if (!data.change.hexagramNumber) {
        setShowCaster(true);
      }
    } catch (err) {
      console.error('[ChangeJourney] Failed to fetch change:', err);
      setError('Failed to load change');
    } finally {
      setLoading(false);
    }
  };

  const handleCastComplete = async (result: any) => {
    setCastingInProgress(false);
    setShowCaster(false);
    await fetchChange();
  };

  const handleRequestInterpretation = async () => {
    setInterpretationLoading(true);

    try {
      const response = await apiFetch(`/api/changes/${changeId}/interpret`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate interpretation');
      }

      await fetchChange();
    } catch (err) {
      console.error('[ChangeJourney] Failed to interpret hexagram:', err);
    } finally {
      setInterpretationLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (!experienceContent.trim()) return;

    setSavingExperience(true);

    try {
      const response = await apiFetch(`/api/changes/${changeId}/experiences`, {
        method: 'POST',
        body: JSON.stringify({
          experienceType,
          content: experienceContent.trim(),
          element: experienceElement || null,
          occurredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save experience');
      }

      // Reset form and refresh
      setExperienceContent('');
      setExperienceElement(undefined);
      setShowExperienceForm(false);
      await fetchChange();
    } catch (err) {
      console.error('[ChangeJourney] Failed to save experience:', err);
    } finally {
      setSavingExperience(false);
    }
  };

  const handleConsultCouncil = async () => {
    setConsultingCouncil(true);

    try {
      const response = await apiFetch(`/api/changes/${changeId}/consult`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to consult council');
      }

      await fetchChange();
    } catch (err) {
      console.error('[ChangeJourney] Failed to consult council:', err);
    } finally {
      setConsultingCouncil(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !change) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          {error || 'Change not found'}
        </div>
      </div>
    );
  }

  const hasHexagram = !!change.hexagramNumber;
  const hasInterpretation = !!change.hexagramInterpretation;
  const hasCouncil = !!change.councilResult;
  const experiences = change.experiences || [];

  return (
    <div className="space-y-0 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Header */}
      <div className="p-6 border-b border-stone-800/50 sticky top-0 bg-gradient-to-b from-stone-900 to-black z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium text-white mb-1 line-clamp-2">
              {change.title}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-cyan-400">
                {CHANGE_TYPE_LABELS[change.changeType as keyof typeof CHANGE_TYPE_LABELS]}
              </span>
              <span className="text-stone-600">·</span>
              <span className="text-stone-400">
                {STATUS_LABELS[change.status as keyof typeof STATUS_LABELS]}
              </span>
            </div>
          </div>
          {hasHexagram && (
            <div className="flex-shrink-0">
              <HexagramGlyph
                lines={getHexagramLines(change.hexagramNumber)}
                changingLines={change.changingLines}
                size="sm"
              />
            </div>
          )}
        </div>
        {change.hexagramName && (
          <p className="text-stone-400 text-sm">
            {change.hexagramName}
          </p>
        )}
      </div>

      {/* Hexagram Casting */}
      <AnimatePresence>
        {showCaster && !hasHexagram && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-stone-800/50"
          >
            <MemberHexagramCaster
              changeId={changeId}
              onCast={handleCastComplete}
              onSkip={() => setShowCaster(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hexagram Reading Section */}
      {hasHexagram && (
        <div className="border-b border-stone-800/50">
          <button
            onClick={() => setShowReading(!showReading)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <h3 className="text-white font-medium">Hexagram Reading</h3>
            {showReading ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>
          <AnimatePresence>
            {showReading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <MemberHexagramReading
                  changeId={changeId}
                  interpretation={change.hexagramInterpretation}
                  onRequestInterpretation={handleRequestInterpretation}
                  loading={interpretationLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Council Result Section */}
      {hasCouncil && (
        <div className="border-b border-stone-800/50">
          <button
            onClick={() => setShowCouncil(!showCouncil)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <h3 className="text-white font-medium">Council Insight</h3>
            {showCouncil ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </button>
          <AnimatePresence>
            {showCouncil && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6"
              >
                <div className="space-y-4">
                  {change.councilResult.tensions && change.councilResult.tensions.length > 0 && (
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <h4 className="text-blue-300 text-sm font-medium mb-2">Tensions</h4>
                      <ul className="space-y-1.5">
                        {change.councilResult.tensions.map((tension, i) => (
                          <li key={i} className="text-stone-300 text-sm flex items-start gap-2">
                            <span className="text-blue-400">·</span>
                            <span>{tension}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {change.councilResult.recommendation && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <h4 className="text-emerald-300 text-sm font-medium mb-2">Recommendation</h4>
                      <p className="text-stone-300 text-sm leading-relaxed">
                        {change.councilResult.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Experience Timeline Section */}
      <div className="border-b border-stone-800/50">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">Experience Timeline</h3>
            <span className="text-xs text-stone-500">({experiences.length})</span>
          </div>
          {showTimeline ? (
            <ChevronUp className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          )}
        </button>
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6"
            >
              {experiences.length === 0 ? (
                <p className="text-center text-stone-500 text-sm py-6">
                  No experiences recorded yet. Add your first reflection below.
                </p>
              ) : (
                <div className="space-y-3">
                  {experiences.map((exp, index) => {
                    const config = EXPERIENCE_TYPE_CONFIG[exp.experienceType as keyof typeof EXPERIENCE_TYPE_CONFIG];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 ${config.bgColor} border border-stone-700/50 rounded-xl`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs ${config.color} font-medium`}>
                                {config.label}
                              </span>
                              <span className="text-xs text-stone-600">·</span>
                              <span className="text-xs text-stone-500">
                                {formatDate(exp.occurredAt || exp.createdAt)}
                              </span>
                            </div>
                            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {exp.content}
                            </p>
                            {exp.element && (
                              <div className="mt-2">
                                <span className="inline-block px-2 py-0.5 bg-stone-700/50 rounded text-xs text-stone-400">
                                  {exp.element}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3">
        {/* Add Experience Toggle */}
        <button
          onClick={() => setShowExperienceForm(!showExperienceForm)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-medium transition-all"
        >
          {showExperienceForm ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>{showExperienceForm ? 'Cancel' : 'Add a reflection'}</span>
        </button>

        {/* Experience Form */}
        <AnimatePresence>
          {showExperienceForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(EXPERIENCE_TYPE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setExperienceType(type as ChangeExperienceType)}
                      className={`p-2 rounded-lg border transition-all ${
                        experienceType === type
                          ? `${config.bgColor} border-${config.color.replace('text-', '')}/40`
                          : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-700/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${experienceType === type ? config.color : 'text-stone-500'} mx-auto mb-1`} />
                      <span className={`text-xs ${experienceType === type ? config.color : 'text-stone-500'}`}>
                        {config.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <textarea
                value={experienceContent}
                onChange={(e) => setExperienceContent(e.target.value)}
                placeholder="What happened? What did you notice?"
                rows={4}
                className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none"
              />

              {/* Save Button */}
              <button
                onClick={handleAddExperience}
                disabled={!experienceContent.trim() || savingExperience}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
                  experienceContent.trim() && !savingExperience
                    ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300'
                    : 'bg-stone-800/50 border border-stone-700/50 text-stone-500 cursor-not-allowed'
                }`}
              >
                {savingExperience ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {!showExperienceForm && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setExperienceType('dream');
                setShowExperienceForm(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50 rounded-xl text-stone-300 text-sm transition-all"
            >
              <Moon className="w-4 h-4" />
              <span>Record dream</span>
            </button>
            <button
              onClick={() => {
                setExperienceType('synchronicity');
                setShowExperienceForm(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50 rounded-xl text-stone-300 text-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Note sync</span>
            </button>
          </div>
        )}

        {/* MAIA Actions */}
        {hasHexagram && (
          <button
            onClick={() => setShowCaster(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700/50 rounded-xl text-stone-300 text-sm transition-all"
          >
            <Wind className="w-4 h-4" />
            <span>Re-cast I Ching</span>
          </button>
        )}

        <button
          onClick={handleConsultCouncil}
          disabled={consultingCouncil}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-sm transition-all"
        >
          {consultingCouncil ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{consultingCouncil ? 'Consulting...' : 'Ask MAIA for insight'}</span>
        </button>
      </div>
    </div>
  );
}

// Helper: Get hexagram lines (placeholder - needs actual I Ching data)
function getHexagramLines(hexagramNumber: number | null): boolean[] {
  if (!hexagramNumber) return [true, true, true, true, true, true];
  const pattern = hexagramNumber.toString(2).padStart(6, '0');
  return pattern.split('').map(bit => bit === '1');
}

// Helper: Format date
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

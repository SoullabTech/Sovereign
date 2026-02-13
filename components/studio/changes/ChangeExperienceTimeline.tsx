'use client';

/**
 * ChangeExperienceTimeline — Field Events for Change Navigation
 *
 * Logs experiences between consultations: field events, reflections,
 * breakthroughs, setbacks, dreams, synchronicities.
 * Mirrors ExperienceTimeline but with extra change-specific types.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Eye,
  Sparkles,
  AlertTriangle,
  Moon,
  Zap,
  Plus,
  ChevronDown,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Star,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ChangeExperience, ChangeExperienceType } from '@/lib/studio/changes/types';

interface ChangeExperienceTimelineProps {
  changeId: string;
  experiences: ChangeExperience[];
  onExperienceAdded: (experience: ChangeExperience) => void;
}

const TYPE_CONFIG: Record<ChangeExperienceType, { icon: typeof Compass; color: string; label: string }> = {
  field_event: { icon: Compass, color: 'text-blue-400', label: 'Field Event' },
  reflection: { icon: Eye, color: 'text-indigo-400', label: 'Reflection' },
  breakthrough: { icon: Sparkles, color: 'text-emerald-400', label: 'Breakthrough' },
  setback: { icon: AlertTriangle, color: 'text-red-400', label: 'Setback' },
  dream: { icon: Moon, color: 'text-purple-400', label: 'Dream' },
  synchronicity: { icon: Zap, color: 'text-amber-400', label: 'Synchronicity' },
};

const ELEMENT_ICONS: Record<string, { icon: typeof Flame; color: string }> = {
  fire: { icon: Flame, color: 'text-red-400' },
  water: { icon: Droplets, color: 'text-blue-400' },
  earth: { icon: Mountain, color: 'text-amber-400' },
  air: { icon: Wind, color: 'text-cyan-400' },
  aether: { icon: Star, color: 'text-purple-400' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Quick-Add Form ──────────────────────────────────────────────

function AddExperienceForm({
  changeId,
  onAdded,
}: {
  changeId: string;
  onAdded: (experience: ChangeExperience) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ChangeExperienceType>('field_event');
  const [content, setContent] = useState('');
  const [element, setElement] = useState<string>('');
  const [hexagramResonance, setHexagramResonance] = useState<string>('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/studio/changes/${changeId}/experiences`, {
        method: 'POST',
        body: JSON.stringify({
          experienceType: type,
          content: content.trim(),
          element: element || undefined,
          hexagramResonance: hexagramResonance ? parseInt(hexagramResonance, 10) : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onAdded(data.experience);
        setContent('');
        setElement('');
        setHexagramResonance('');
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-300 border border-slate-700/50 hover:border-amber-700/50 rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Log Experience
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-lg border border-slate-800/60 bg-slate-900/50 p-3 space-y-3"
    >
      {/* Type selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {(Object.entries(TYPE_CONFIG) as [ChangeExperienceType, typeof TYPE_CONFIG[ChangeExperienceType]][]).map(
          ([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  type === key
                    ? `${cfg.color} bg-slate-800 border border-slate-700`
                    : 'text-slate-500 border border-transparent hover:text-slate-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
              </button>
            );
          }
        )}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What happened? What shifted? What did you notice?"
        rows={3}
        autoFocus
        className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
      />

      {/* Element selector (optional) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Element:</span>
        {Object.entries(ELEMENT_ICONS).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setElement(element === key ? '' : key)}
              className={`p-1 rounded transition-colors ${
                element === key ? `${cfg.color} bg-slate-800` : 'text-slate-600 hover:text-slate-400'
              }`}
              title={key}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* Hexagram resonance (optional) */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">Hexagram resonance:</label>
        <input
          type="number"
          min="1"
          max="64"
          value={hexagramResonance}
          onChange={e => setHexagramResonance(e.target.value)}
          placeholder="1-64"
          className="w-20 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !content.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={saving}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Timeline ───────────────────────────────────────────────

export default function ChangeExperienceTimeline({
  changeId,
  experiences,
  onExperienceAdded,
}: ChangeExperienceTimelineProps) {
  const [expanded, setExpanded] = useState(experiences.length <= 3);

  const visibleExperiences = expanded ? experiences : experiences.slice(0, 3);
  const hasMore = !expanded && experiences.length > 3;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Field Experiences</h3>
          {experiences.length > 0 && <span className="text-xs text-slate-500">({experiences.length})</span>}
        </div>
        <AddExperienceForm changeId={changeId} onAdded={onExperienceAdded} />
      </div>

      {experiences.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          No experiences logged yet. What happened in the field since the last consultation?
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {visibleExperiences.map((exp, i) => {
              const cfg = TYPE_CONFIG[exp.experienceType] || TYPE_CONFIG.field_event;
              const Icon = cfg.icon;
              const elementCfg = exp.element ? ELEMENT_ICONS[exp.element] : null;
              const ElementIcon = elementCfg?.icon;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-800/40 bg-slate-900/20"
                >
                  <Icon className={`w-4 h-4 ${cfg.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                      {ElementIcon && <ElementIcon className={`w-3 h-3 ${elementCfg!.color}`} />}
                      {exp.hexagramResonance && (
                        <span className="text-xs text-purple-400/70">#{exp.hexagramResonance}</span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">
                        {formatDate(exp.occurredAt)} {formatTime(exp.occurredAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{exp.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {hasMore && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Show {experiences.length - 3} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

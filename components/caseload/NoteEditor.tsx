'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CreateNoteInput, NoteType, Element } from '@/lib/caseload/types';

// Common therapeutic interventions for quick selection
const commonInterventions = [
  'Active listening',
  'Reflection',
  'Reframing',
  'Somatic awareness',
  'Grounding exercise',
  'Breathwork',
  'Parts work',
  'Timeline exploration',
  'Resource building',
  'Psychoeducation',
  'Containment',
  'Boundary work',
  'Dream exploration',
  'Metaphor work',
  'Chair technique',
];

// Common themes for quick tagging
const commonThemes = [
  'Anxiety',
  'Depression',
  'Relationships',
  'Family',
  'Work/Career',
  'Self-worth',
  'Grief/Loss',
  'Trauma',
  'Identity',
  'Boundaries',
  'Intimacy',
  'Anger',
  'Fear',
  'Shame',
  'Purpose',
];

const noteTypes: { value: NoteType; label: string; icon: string; description: string }[] = [
  { value: 'session', label: 'Session', icon: '📝', description: 'Regular session documentation' },
  { value: 'intake', label: 'Intake', icon: '📋', description: 'Initial assessment' },
  { value: 'progress', label: 'Progress', icon: '📈', description: 'Progress update' },
  { value: 'observation', label: 'Observation', icon: '👁️', description: 'Clinical observation' },
  { value: 'consultation', label: 'Consultation', icon: '💭', description: 'Case consultation notes' },
  { value: 'supervision', label: 'Supervision', icon: '🎓', description: 'Supervision notes' },
  { value: 'discharge', label: 'Discharge', icon: '🚪', description: 'Discharge summary' },
];

const elements: { value: Element; icon: string; name: string; color: string; bg: string }[] = [
  { value: 'earth', icon: '🜃', name: 'Earth', color: 'text-amber-400', bg: 'bg-amber-900/30' },
  { value: 'water', icon: '🜄', name: 'Water', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  { value: 'fire', icon: '🜂', name: 'Fire', color: 'text-red-400', bg: 'bg-red-900/30' },
  { value: 'air', icon: '🜁', name: 'Air', color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
  { value: 'aether', icon: '✦', name: 'Aether', color: 'text-purple-400', bg: 'bg-purple-900/30' },
];

interface NoteEditorProps {
  initialData?: Partial<CreateNoteInput>;
  onSave: (data: CreateNoteInput) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  clientIdentifier?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  saving = false,
  clientIdentifier,
}) => {
  const [formData, setFormData] = useState<CreateNoteInput>({
    note_type: initialData?.note_type || 'session',
    session_date: initialData?.session_date || new Date().toISOString().split('T')[0],
    session_duration_minutes: initialData?.session_duration_minutes,
    content: initialData?.content || '',
    interventions_used: initialData?.interventions_used || [],
    themes_observed: initialData?.themes_observed || [],
    element_focus: initialData?.element_focus,
    spiral_movement: initialData?.spiral_movement || '',
  });

  const [interventionInput, setInterventionInput] = useState('');
  const [themeInput, setThemeInput] = useState('');
  const [showInterventionSuggestions, setShowInterventionSuggestions] = useState(false);
  const [showThemeSuggestions, setShowThemeSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  const addIntervention = (intervention: string) => {
    if (intervention.trim() && !formData.interventions_used?.includes(intervention.trim())) {
      setFormData({
        ...formData,
        interventions_used: [...(formData.interventions_used || []), intervention.trim()],
      });
    }
    setInterventionInput('');
    setShowInterventionSuggestions(false);
  };

  const removeIntervention = (index: number) => {
    setFormData({
      ...formData,
      interventions_used: (formData.interventions_used || []).filter((_, i) => i !== index),
    });
  };

  const addTheme = (theme: string) => {
    if (theme.trim() && !formData.themes_observed?.includes(theme.trim())) {
      setFormData({
        ...formData,
        themes_observed: [...(formData.themes_observed || []), theme.trim()],
      });
    }
    setThemeInput('');
    setShowThemeSuggestions(false);
  };

  const removeTheme = (index: number) => {
    setFormData({
      ...formData,
      themes_observed: (formData.themes_observed || []).filter((_, i) => i !== index),
    });
  };

  const filteredInterventions = commonInterventions.filter(
    (i) =>
      i.toLowerCase().includes(interventionInput.toLowerCase()) &&
      !formData.interventions_used?.includes(i)
  );

  const filteredThemes = commonThemes.filter(
    (t) =>
      t.toLowerCase().includes(themeInput.toLowerCase()) &&
      !formData.themes_observed?.includes(t)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      {clientIdentifier && (
        <div className="text-sm text-neutral-silver/60">
          Documenting for <span className="text-gold-divine">{clientIdentifier}</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Note type and date row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Note type */}
        <div>
          <label className="block text-sm font-medium text-neutral-silver mb-2">
            Note Type
          </label>
          <select
            value={formData.note_type}
            onChange={(e) => setFormData({ ...formData, note_type: e.target.value as NoteType })}
            className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver outline-none transition-colors"
          >
            {noteTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Session date */}
        <div>
          <label className="block text-sm font-medium text-neutral-silver mb-2">
            Session Date
          </label>
          <input
            type="date"
            value={formData.session_date}
            onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
            className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver outline-none transition-colors"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-neutral-silver mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.session_duration_minutes || ''}
            onChange={(e) => setFormData({ ...formData, session_duration_minutes: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 50"
            className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main content */}
      <div>
        <label className="block text-sm font-medium text-neutral-silver mb-2">
          Session Notes *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={10}
          placeholder="Document the session... What emerged? What was explored? Key moments, insights, or concerns?"
          className="w-full px-4 py-3 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors resize-none leading-relaxed"
          required
        />
      </div>

      {/* Element focus */}
      <div>
        <label className="block text-sm font-medium text-neutral-silver mb-2">
          Element Focus
        </label>
        <div className="flex gap-2">
          {elements.map((el) => (
            <button
              key={el.value}
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  element_focus: formData.element_focus === el.value ? undefined : el.value,
                })
              }
              className={cn(
                'flex-1 py-3 rounded-lg border transition-all',
                formData.element_focus === el.value
                  ? `${el.bg} border-current ${el.color}`
                  : 'bg-sacred-navy/60 border-gold-divine/10 text-neutral-silver/60 hover:text-neutral-silver'
              )}
            >
              <div className="text-xl">{el.icon}</div>
              <div className="text-xs mt-1">{el.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interventions */}
      <div>
        <label className="block text-sm font-medium text-neutral-silver mb-2">
          Interventions Used
        </label>
        <div className="relative">
          <input
            type="text"
            value={interventionInput}
            onChange={(e) => {
              setInterventionInput(e.target.value);
              setShowInterventionSuggestions(true);
            }}
            onFocus={() => setShowInterventionSuggestions(true)}
            onBlur={() => setTimeout(() => setShowInterventionSuggestions(false), 200)}
            placeholder="Type or select interventions..."
            className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addIntervention(interventionInput);
              }
            }}
          />
          {showInterventionSuggestions && interventionInput && filteredInterventions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-sacred-navy border border-gold-divine/20 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredInterventions.slice(0, 6).map((intervention) => (
                <button
                  key={intervention}
                  type="button"
                  onClick={() => addIntervention(intervention)}
                  className="w-full px-4 py-2 text-left text-sm text-neutral-silver hover:bg-sacred-navy/60 hover:text-gold-divine"
                >
                  {intervention}
                </button>
              ))}
            </div>
          )}
        </div>
        {formData.interventions_used && formData.interventions_used.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.interventions_used.map((intervention, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-purple-900/30 border border-purple-500/20 rounded-lg text-sm text-purple-300 flex items-center gap-2"
              >
                {intervention}
                <button
                  type="button"
                  onClick={() => removeIntervention(i)}
                  className="text-purple-400/60 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Themes */}
      <div>
        <label className="block text-sm font-medium text-neutral-silver mb-2">
          Themes Observed
        </label>
        <div className="relative">
          <input
            type="text"
            value={themeInput}
            onChange={(e) => {
              setThemeInput(e.target.value);
              setShowThemeSuggestions(true);
            }}
            onFocus={() => setShowThemeSuggestions(true)}
            onBlur={() => setTimeout(() => setShowThemeSuggestions(false), 200)}
            placeholder="Type or select themes..."
            className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTheme(themeInput);
              }
            }}
          />
          {showThemeSuggestions && themeInput && filteredThemes.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-sacred-navy border border-gold-divine/20 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredThemes.slice(0, 6).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => addTheme(theme)}
                  className="w-full px-4 py-2 text-left text-sm text-neutral-silver hover:bg-sacred-navy/60 hover:text-gold-divine"
                >
                  {theme}
                </button>
              ))}
            </div>
          )}
        </div>
        {formData.themes_observed && formData.themes_observed.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.themes_observed.map((theme, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/20 rounded-lg text-sm text-cyan-300 flex items-center gap-2"
              >
                {theme}
                <button
                  type="button"
                  onClick={() => removeTheme(i)}
                  className="text-cyan-400/60 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Spiral movement */}
      <div>
        <label className="block text-sm font-medium text-neutral-silver mb-2">
          Spiral Movement / Transitions
        </label>
        <input
          type="text"
          value={formData.spiral_movement}
          onChange={(e) => setFormData({ ...formData, spiral_movement: e.target.value })}
          placeholder="e.g., Moving from Water-2 to Water-3, emerging Fire quality..."
          className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gold-divine/20">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !formData.content.trim()}
          className="flex-1 px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/50 rounded-lg text-gold-divine disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteEditor;

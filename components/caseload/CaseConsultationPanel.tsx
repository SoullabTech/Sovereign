'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ConsultationType =
  | 'case_formulation'
  | 'intervention_planning'
  | 'pattern_analysis'
  | 'stuck_point'
  | 'supervision'
  | 'spiralogic_mapping';

interface ConsultationContent {
  case_summary?: string;
  themes_emerging?: string[];
  working_hypotheses?: string[];
  next_session_focus?: string[];
  suggested_interventions?: string[];
  questions_to_ask?: string[];
  risks_or_watchouts?: string[];
  elemental_reflection?: {
    element_focus?: string;
    spiral_movement?: string;
    note?: string;
  };
}

interface Consultation {
  id: string;
  case_id: string;
  consultation_type: ConsultationType;
  practitioner_query: string;
  maia_response: string;
  practitioner_rating: number | null;
  created_at: string;
}

interface CaseConsultationPanelProps {
  caseId: string;
  memberId: string;
  className?: string;
}

const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  case_formulation: 'Case Formulation',
  intervention_planning: 'Intervention Planning',
  pattern_analysis: 'Pattern Analysis',
  stuck_point: 'Stuck Point',
  supervision: 'Supervision',
  spiralogic_mapping: 'Spiralogic Mapping',
};

export const CaseConsultationPanel: React.FC<CaseConsultationPanelProps> = ({
  caseId,
  memberId,
  className,
}) => {
  const [focus, setFocus] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('pattern_analysis');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [active, setActive] = useState<Consultation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/caseload/${caseId}/consultations?memberId=${memberId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load consultations');
      }

      setConsultations(data.consultations || []);
      if (data.consultations?.length > 0 && !active) {
        setActive(data.consultations[0]);
      }
    } catch (err) {
      console.error('[CaseConsultationPanel] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  }, [caseId, memberId, active]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);

      const res = await fetch(`/api/caseload/${caseId}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          consultationType,
          focus: focus.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate consultation');
      }

      // Refresh list and set new consultation as active
      await fetchConsultations();
      if (data.consultation) {
        setActive(data.consultation);
      }
      setFocus('');
    } catch (err) {
      console.error('[CaseConsultationPanel] Generate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate consultation');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const parseContent = (response: string): ConsultationContent => {
    try {
      return JSON.parse(response);
    } catch {
      return { case_summary: response };
    }
  };

  const activeContent = active ? parseContent(active.maia_response) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gold-divine">MAIA Consultation</h3>
        {loading && <span className="text-xs text-neutral-silver/50">Loading...</span>}
      </div>

      {/* Generation controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
            className="px-3 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-sm text-neutral-silver outline-none"
          >
            {Object.entries(CONSULTATION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !generating && handleGenerate()}
            placeholder="Optional focus (e.g., 'attachment rupture', 'next session plan')"
            className="flex-1 px-3 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-sm text-neutral-silver placeholder-neutral-silver/40 outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/40 rounded-lg text-sm text-gold-divine disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Consultation history tabs */}
      {consultations.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {consultations.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs border transition-colors',
                active?.id === c.id
                  ? 'bg-gold-divine/20 border-gold-divine/40 text-gold-divine'
                  : 'bg-sacred-navy/40 border-gold-divine/10 text-neutral-silver/60 hover:text-neutral-silver'
              )}
            >
              {formatDate(c.created_at)}
            </button>
          ))}
        </div>
      )}

      {/* Active consultation display */}
      {activeContent ? (
        <div className="p-4 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg space-y-4">
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-neutral-silver/50">
            <span>{CONSULTATION_TYPE_LABELS[active?.consultation_type || 'pattern_analysis']}</span>
            <span>{active && formatDate(active.created_at)}</span>
          </div>

          {/* Query */}
          {active?.practitioner_query && (
            <div className="text-sm text-neutral-silver/70 italic border-l-2 border-gold-divine/30 pl-3">
              "{active.practitioner_query}"
            </div>
          )}

          {/* Case Summary */}
          <Section title="Case Summary" text={activeContent.case_summary} />

          {/* Lists */}
          <Bullets title="Themes Emerging" items={activeContent.themes_emerging} color="text-cyan-400" />
          <Bullets title="Working Hypotheses" items={activeContent.working_hypotheses} color="text-purple-400" />
          <Bullets title="Next Session Focus" items={activeContent.next_session_focus} color="text-green-400" />
          <Bullets title="Suggested Interventions" items={activeContent.suggested_interventions} color="text-amber-400" />
          <Bullets title="Questions to Ask" items={activeContent.questions_to_ask} color="text-blue-400" />
          <Bullets title="Risks / Watchouts" items={activeContent.risks_or_watchouts} color="text-red-400" />

          {/* Elemental Reflection */}
          {activeContent.elemental_reflection && (
            <div className="p-3 bg-sacred-navy/40 border border-gold-divine/20 rounded-lg">
              <h5 className="text-xs font-medium text-gold-divine/70 mb-2">Elemental Reflection</h5>
              <div className="space-y-1 text-sm text-neutral-silver/80">
                {activeContent.elemental_reflection.element_focus && (
                  <div>
                    <span className="text-neutral-silver/50">Element:</span>{' '}
                    <span className="text-amber-400">{activeContent.elemental_reflection.element_focus}</span>
                  </div>
                )}
                {activeContent.elemental_reflection.spiral_movement && (
                  <div>
                    <span className="text-neutral-silver/50">Spiral:</span>{' '}
                    <span className="text-purple-400">{activeContent.elemental_reflection.spiral_movement}</span>
                  </div>
                )}
                {activeContent.elemental_reflection.note && (
                  <div className="text-neutral-silver/70 mt-2 whitespace-pre-wrap">
                    {activeContent.elemental_reflection.note}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🔮</div>
          <p className="text-sm text-neutral-silver/50">
            No consultations yet. Generate one to get MAIA's clinical insights.
          </p>
        </div>
      )}
    </div>
  );
};

// Section sub-component
function Section({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <div>
      <h5 className="text-xs font-medium text-neutral-silver/60 mb-1">{title}</h5>
      <p className="text-sm text-neutral-silver/80 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

// Bullets sub-component
function Bullets({
  title,
  items,
  color = 'text-neutral-silver',
}: {
  title: string;
  items?: string[];
  color?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h5 className="text-xs font-medium text-neutral-silver/60 mb-1">{title}</h5>
      <ul className="space-y-1 pl-4">
        {items.slice(0, 10).map((item, i) => (
          <li key={i} className={cn('text-sm list-disc', color)}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CaseConsultationPanel;

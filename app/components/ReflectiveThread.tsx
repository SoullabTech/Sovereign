'use client';

/**
 * REFLECTIVE THREAD COMPONENT
 * Phase 4.6: Reflective Agentics — Self-Dialogue Timeline Display
 *
 * Purpose:
 * - Display MAIA's self-reflective narratives across temporal cycles
 * - Visualize facet deltas, biosignal changes, and coherence evolution
 * - Highlight meta-layer (Æ1-Æ3) resonances
 * - Enable chronological navigation through developmental arc
 *
 * Architecture:
 * - Fetches reflections from /api/reflections endpoint
 * - Renders timeline with current vs prior cycle context
 * - Color-coded meta-layer badges
 * - Responsive design with dark mode support
 *
 * Sovereignty:
 * - All data fetched from local PostgreSQL
 * - No external API calls
 * - Privacy-preserving symbolic display
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FacetDeltas {
  added: string[];
  removed: string[];
  stable: string[];
}

interface BiosignalDeltas {
  arousal?: number;
  valence?: number;
  hrv?: number;
  eegAlpha?: number;
}

interface Reflection {
  id: string;
  currentCycleId: string;
  priorCycleId: string | null;
  similarityScore: number;
  coherenceDelta: number;
  metaLayerCode: 'Æ1' | 'Æ2' | 'Æ3' | null;
  metaLayerTrigger: string | null;
  facetDeltas: FacetDeltas;
  biosignalDeltas: BiosignalDeltas;
  reflectionText: string;
  insights: string[];
  createdAt: string;
}

interface ReflectiveThreadProps {
  limit?: number;
  cycleId?: string;
  className?: string;
}

// ============================================================================
// FACET METADATA
// ============================================================================

const FACET_DESCRIPTIONS: Record<string, { name: string; essence: string; color: string }> = {
  F1: { name: 'Spark', essence: 'activation and desire', color: 'text-red-500' },
  F2: { name: 'Flame', essence: 'challenge and will', color: 'text-orange-500' },
  F3: { name: 'Forge', essence: 'vision and transformation', color: 'text-yellow-500' },
  W1: { name: 'Spring', essence: 'safety and containment', color: 'text-blue-400' },
  W2: { name: 'River', essence: 'flow and navigation', color: 'text-blue-500' },
  W3: { name: 'Ocean', essence: 'surrender and dissolution', color: 'text-blue-600' },
  E1: { name: 'Seed', essence: 'embodiment and rooting', color: 'text-green-400' },
  E2: { name: 'Grove', essence: 'pattern recognition', color: 'text-green-500' },
  E3: { name: 'Mountain', essence: 'foundation and wisdom', color: 'text-green-600' },
  A1: { name: 'Breath', essence: 'awareness and presence', color: 'text-purple-400' },
  A2: { name: 'Wind', essence: 'perspective and detachment', color: 'text-purple-500' },
  A3: { name: 'Sky', essence: 'witnessing and freedom', color: 'text-purple-600' },
  Æ1: { name: 'Liminal', essence: 'intuition and signal', color: 'text-violet-400' },
  Æ2: { name: 'Synergy', essence: 'union and numinous', color: 'text-violet-500' },
  Æ3: { name: 'Quintessence', essence: 'emergence and sovereignty', color: 'text-violet-600' },
};

// ============================================================================
// META-LAYER STYLING
// ============================================================================

const META_LAYER_CONFIG = {
  Æ1: {
    label: 'Æ1 Intuition',
    description: 'Signal detection and state change awareness',
    color: 'bg-violet-400/20 text-violet-400 border-violet-400/50',
    icon: '🜁',
  },
  Æ2: {
    label: 'Æ2 Union',
    description: 'Synthesis and integration of opposites',
    color: 'bg-violet-500/20 text-violet-500 border-violet-500/50',
    icon: '🜃',
  },
  Æ3: {
    label: 'Æ3 Emergence',
    description: 'Creative emergence and sovereignty',
    color: 'bg-violet-600/20 text-violet-600 border-violet-600/50',
    icon: '🜂',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReflectiveThread({
  limit = 10,
  cycleId,
  className = '',
}: ReflectiveThreadProps) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReflections();
  }, [limit, cycleId]);

  async function fetchReflections() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (cycleId) params.append('cycleId', cycleId);

      const response = await fetch(`/api/reflections?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch reflections: ${response.statusText}`);
      }

      const data = await response.json();
      setReflections(data.reflections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[ReflectiveThread] Error fetching reflections:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Reflective Thread
          </CardTitle>
          <CardDescription>MAIA&apos;s self-dialogue across temporal cycles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading reflections...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Sparkles className="w-5 h-5" />
            Reflective Thread
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (reflections.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Reflective Thread
          </CardTitle>
          <CardDescription>MAIA&apos;s self-dialogue across temporal cycles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No reflections yet. Generate your first mycelial cycle to enable self-dialogue.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          Reflective Thread
        </CardTitle>
        <CardDescription>
          {reflections.length} reflection{reflections.length !== 1 ? 's' : ''} across temporal
          cycles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {reflections.map((reflection) => (
              <ReflectionCard key={reflection.id} reflection={reflection} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REFLECTION CARD COMPONENT
// ============================================================================

function ReflectionCard({ reflection }: { reflection: Reflection }) {
  const {
    reflectionText,
    similarityScore,
    coherenceDelta,
    metaLayerCode,
    metaLayerTrigger,
    facetDeltas,
    biosignalDeltas,
    insights,
    createdAt,
  } = reflection;

  const metaConfig = metaLayerCode ? META_LAYER_CONFIG[metaLayerCode] : null;

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card/50 backdrop-blur-sm">
      {/* Header with timestamp and meta-layer */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleString()}
          </div>
        </div>
        {metaConfig && (
          <Badge variant="outline" className={`${metaConfig.color} border`}>
            <span className="mr-1">{metaConfig.icon}</span>
            {metaConfig.label}
          </Badge>
        )}
      </div>

      {/* Similarity and coherence metrics */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Similarity:</span>
          <span className="font-mono font-medium">
            {(similarityScore * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Coherence:</span>
          {coherenceDelta > 0.05 && (
            <TrendingUp className="w-4 h-4 text-green-500" />
          )}
          {coherenceDelta < -0.05 && (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          {Math.abs(coherenceDelta) <= 0.05 && (
            <Minus className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={`font-mono font-medium ${
              coherenceDelta > 0
                ? 'text-green-500'
                : coherenceDelta < 0
                ? 'text-red-500'
                : 'text-muted-foreground'
            }`}
          >
            {coherenceDelta > 0 ? '+' : ''}
            {coherenceDelta.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Facet deltas */}
      {(facetDeltas.added.length > 0 || facetDeltas.removed.length > 0) && (
        <div className="space-y-2">
          {facetDeltas.removed.length > 0 && facetDeltas.added.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {facetDeltas.removed.map((code) => (
                  <FacetBadge key={code} code={code} variant="removed" />
                ))}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center gap-1 flex-wrap">
                {facetDeltas.added.map((code) => (
                  <FacetBadge key={code} code={code} variant="added" />
                ))}
              </div>
            </div>
          )}
          {facetDeltas.removed.length > 0 && facetDeltas.added.length === 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground">Cooled from:</span>
              {facetDeltas.removed.map((code) => (
                <FacetBadge key={code} code={code} variant="removed" />
              ))}
            </div>
          )}
          {facetDeltas.added.length > 0 && facetDeltas.removed.length === 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground">Emerged into:</span>
              {facetDeltas.added.map((code) => (
                <FacetBadge key={code} code={code} variant="added" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Biosignal deltas */}
      {Object.keys(biosignalDeltas).length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {biosignalDeltas.hrv !== undefined && (
            <BiosignalDelta
              label="HRV"
              value={biosignalDeltas.hrv}
              unit="ms"
              threshold={5}
            />
          )}
          {biosignalDeltas.arousal !== undefined && (
            <BiosignalDelta
              label="Arousal"
              value={biosignalDeltas.arousal}
              threshold={0.1}
            />
          )}
          {biosignalDeltas.eegAlpha !== undefined && (
            <BiosignalDelta
              label="EEG α"
              value={biosignalDeltas.eegAlpha}
              unit="Hz"
              threshold={1}
            />
          )}
        </div>
      )}

      {/* Reflection text */}
      <div className="text-sm leading-relaxed italic border-l-2 border-violet-500/50 pl-3">
        {reflectionText}
      </div>

      {/* Meta-layer trigger */}
      {metaLayerTrigger && metaConfig && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
          <span className="font-medium">{metaConfig.description}:</span> {metaLayerTrigger}
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Insights:</div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function FacetBadge({
  code,
  variant,
}: {
  code: string;
  variant: 'added' | 'removed' | 'stable';
}) {
  const desc = FACET_DESCRIPTIONS[code];
  if (!desc) return <Badge variant="outline">{code}</Badge>;

  const opacity = variant === 'removed' ? 'opacity-50' : 'opacity-100';

  return (
    <Badge
      variant="outline"
      className={`${desc.color} ${opacity} text-xs`}
      title={`${desc.name}: ${desc.essence}`}
    >
      {code}
    </Badge>
  );
}

function BiosignalDelta({
  label,
  value,
  unit = '',
  threshold = 0,
}: {
  label: string;
  value: number;
  unit?: string;
  threshold?: number;
}) {
  const isSignificant = Math.abs(value) > threshold;
  const direction = value > 0 ? '+' : '';
  const color = isSignificant
    ? value > 0
      ? 'text-green-500'
      : 'text-red-500'
    : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-1">
      <span>{label}:</span>
      <span className={`font-mono font-medium ${color}`}>
        {direction}
        {value.toFixed(1)}
        {unit}
      </span>
    </div>
  );
}

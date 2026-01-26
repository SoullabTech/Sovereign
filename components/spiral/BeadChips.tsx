'use client';

/**
 * BeadChips: Display detected beads with confirmation UI
 *
 * Shows beads as interactive chips that users can confirm or reject
 * to help MAIA learn their patterns more accurately.
 */

import { useState } from 'react';

interface DetectedBead {
  code: string;
  label: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  facet: string | null;
  intensity: number;
  confidence: number;
  isNew: boolean;
  activationId?: string;
}

interface BeadChipsProps {
  beads: DetectedBead[];
  onConfirm?: (activationId: string, confirmed: boolean) => void;
  showConfirmation?: boolean;
  compact?: boolean;
}

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fire: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
  water: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
  earth: { bg: 'bg-amber-600/20', text: 'text-amber-300', border: 'border-amber-600/40' },
  air: { bg: 'bg-cyan-400/20', text: 'text-cyan-300', border: 'border-cyan-400/40' },
  aether: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' }
};

const ELEMENT_ICONS: Record<string, string> = {
  fire: '\u{1F525}',    // fire emoji fallback
  water: '\u{1F4A7}',   // droplet
  earth: '\u{1F33F}',   // herb/plant
  air: '\u{1F32C}',     // wind face
  aether: '\u{2728}'    // sparkles
};

export function BeadChips({
  beads,
  onConfirm,
  showConfirmation = true,
  compact = false
}: BeadChipsProps) {
  const [confirmedBeads, setConfirmedBeads] = useState<Record<string, boolean | null>>({});

  if (beads.length === 0) {
    return null;
  }

  const handleConfirm = (bead: DetectedBead, confirmed: boolean) => {
    if (!bead.activationId) return;

    setConfirmedBeads(prev => ({
      ...prev,
      [bead.activationId!]: confirmed
    }));

    onConfirm?.(bead.activationId, confirmed);
  };

  return (
    <div className={compact ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap gap-2'}>
      {beads.map((bead, index) => {
        const colors = ELEMENT_COLORS[bead.element] || ELEMENT_COLORS.aether;
        const confirmState = bead.activationId ? confirmedBeads[bead.activationId] : null;

        return (
          <div
            key={`${bead.code}-${index}`}
            className={`
              inline-flex items-center gap-1.5 rounded-full border
              ${colors.bg} ${colors.border}
              ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
              transition-all duration-200
              ${confirmState === true ? 'ring-2 ring-green-500/50' : ''}
              ${confirmState === false ? 'opacity-50' : ''}
            `}
          >
            {/* Element indicator */}
            <span className="text-sm" title={bead.element}>
              {ELEMENT_ICONS[bead.element]}
            </span>

            {/* Bead label */}
            <span className={colors.text}>
              {compact ? bead.code : bead.label}
            </span>

            {/* Facet badge */}
            {bead.facet && !compact && (
              <span className="text-xs opacity-60 ml-0.5">
                {bead.facet}
              </span>
            )}

            {/* New indicator */}
            {bead.isNew && (
              <span className="text-xs text-yellow-400" title="First time seeing this pattern">
                new
              </span>
            )}

            {/* Intensity bar */}
            {!compact && (
              <div
                className="h-1 w-8 rounded-full bg-white/20 overflow-hidden"
                title={`Intensity: ${Math.round(bead.intensity * 100)}%`}
              >
                <div
                  className={`h-full ${colors.bg} bg-opacity-80`}
                  style={{ width: `${bead.intensity * 100}%` }}
                />
              </div>
            )}

            {/* Confirmation buttons */}
            {showConfirmation && bead.activationId && confirmState === null && (
              <div className="flex gap-0.5 ml-1">
                <button
                  onClick={() => handleConfirm(bead, true)}
                  className="p-0.5 rounded hover:bg-green-500/30 transition-colors"
                  title="Yes, this resonates"
                >
                  <CheckIcon className="w-3.5 h-3.5 text-green-400" />
                </button>
                <button
                  onClick={() => handleConfirm(bead, false)}
                  className="p-0.5 rounded hover:bg-red-500/30 transition-colors"
                  title="Not quite right"
                >
                  <XIcon className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            )}

            {/* Confirmation state indicator */}
            {confirmState === true && (
              <CheckIcon className="w-3.5 h-3.5 text-green-400" />
            )}
            {confirmState === false && (
              <XIcon className="w-3.5 h-3.5 text-red-400 opacity-60" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Simple inline SVG icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default BeadChips;

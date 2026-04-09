'use client';

/**
 * RelationshipPicker — Shared "who is this about?" step for relational labtools.
 *
 * Two modes:
 *  1. Pick an existing relationship from /api/relationships
 *  2. Type a name (ephemeral — no relationship is auto-created)
 *
 * Used by: Relational Field, Dynamics Map, Repair Path.
 *
 * Honors sovereignty: the user is never forced to create a persistent record
 * just to use a tool. Typing "Dad" and exploring is a valid path.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Users } from 'lucide-react';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export interface PickedRelationship {
  /** null when the user typed a name without picking a record */
  id: string | null;
  name: string;
  realm?: 'outer' | 'inner' | 'transpersonal';
  bondType?: string | null;
}

interface StoredRelationship {
  id: string;
  name: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  fieldTone: string | null;
  lastCheckinAt: string | null;
}

interface RelationshipPickerProps {
  value: PickedRelationship | null;
  onChange: (picked: PickedRelationship) => void;
  /** Optional preselected relationship id (e.g. from ?relationshipId=xxx) */
  initialId?: string | null;
  /** Label displayed above the picker */
  label?: string;
  /** Short instruction text */
  hint?: string;
}

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export function RelationshipPicker({
  value,
  onChange,
  initialId,
  label = 'Who is this about?',
  hint = 'Pick someone from your field, or just type a name.',
}: RelationshipPickerProps) {
  const [relationships, setRelationships] = useState<StoredRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [typedName, setTypedName] = useState(value?.id ? '' : value?.name ?? '');

  // Fetch existing relationships
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/relationships');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.relationships)) {
          setRelationships(data.relationships);

          // Auto-select from ?relationshipId=
          if (initialId && !value) {
            const match = data.relationships.find(
              (r: StoredRelationship) => r.id === initialId,
            );
            if (match) {
              onChange({
                id: match.id,
                name: match.name,
                realm: match.realm,
                bondType: match.bondType,
              });
            }
          }
        }
      } catch {
        // silent — picker still works with typed names
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We only want this on mount — subsequent initialId changes are ignored
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectExisting = (r: StoredRelationship) => {
    setTypedName('');
    onChange({ id: r.id, name: r.name, realm: r.realm, bondType: r.bondType });
  };

  const handleTypedChange = (next: string) => {
    setTypedName(next);
    const trimmed = next.trim();
    if (trimmed.length > 0) {
      onChange({ id: null, name: trimmed });
    }
  };

  const selectedId = value?.id ?? null;
  const hasList = relationships.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs text-white/45">{hint}</div>
      </div>

      {/* ── Existing relationships list ── */}
      {loading && (
        <div className="text-xs text-white/30">Loading your field…</div>
      )}

      {!loading && hasList && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/30">
            <Users className="h-3 w-3" />
            From your field
          </div>
          <div className="flex flex-wrap gap-2">
            {relationships.map((r) => {
              const active = selectedId === r.id;
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectExisting(r)}
                  className={`
                    inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs
                    transition-all
                    ${active
                      ? 'border-[#D4B896]/40 bg-[#D4B896]/15 text-[#D4B896]'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
                    }
                  `}
                >
                  {active && <Check className="h-3 w-3" />}
                  {r.name}
                  {r.bondType && (
                    <span className="text-white/30">·{' '}{r.bondType}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Typed name fallback ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/30">
          <Plus className="h-3 w-3" />
          {hasList ? 'Or type a name' : 'Name this person'}
        </div>
        <input
          type="text"
          value={typedName}
          onChange={(e) => handleTypedChange(e.target.value)}
          placeholder="e.g. Mom, J., my brother, the voice in my head…"
          maxLength={60}
          className="
            w-full rounded-xl border border-white/10 bg-black/20
            px-3 py-2 text-sm text-white/85 placeholder:text-white/25
            focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30
          "
        />
        {typedName.trim() && !selectedId && (
          <p className="text-[10px] text-white/25">
            Nothing will be saved to your field unless you choose to.
          </p>
        )}
      </div>
    </div>
  );
}

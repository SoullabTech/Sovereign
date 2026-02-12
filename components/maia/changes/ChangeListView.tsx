'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, Droplets, Sprout, DoorOpen, Merge, Zap, Sun } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramGlyph from '@/components/iching/HexagramGlyph';
import type { ChangeRecord } from '@/lib/studio/changes/types';

interface ChangeListViewProps {
  memberId: string;
  onSelect: (changeId: string) => void;
  onCreate: () => void;
}

const CHANGE_TYPE_CONFIG = {
  dissolution: { icon: Droplets, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  emergence: { icon: Sprout, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  threshold: { icon: DoorOpen, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  integration: { icon: Merge, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  upheaval: { icon: Zap, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  ripening: { icon: Sun, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
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

export default function ChangeListView({
  memberId,
  onSelect,
  onCreate,
}: ChangeListViewProps) {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChanges() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFetch('/api/changes');
        if (!response.ok) {
          throw new Error('Failed to load changes');
        }

        const data = await response.json();
        setChanges(data.changes || []);
      } catch (err) {
        console.error('[ChangeListView] Failed to fetch changes:', err);
        setError('Failed to load changes');
      } finally {
        setLoading(false);
      }
    }

    fetchChanges();
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Create New Button */}
      <button
        onClick={onCreate}
        className="w-full p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 rounded-xl transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-medium">Name a New Change</span>
        </div>
      </button>

      {/* Empty State */}
      {changes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Droplets className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Name a change you're navigating. MAIA can offer perspective, but the journey is yours.
          </p>
        </motion.div>
      )}

      {/* Changes List */}
      <div className="space-y-3">
        {changes.map((change, index) => {
          const config = CHANGE_TYPE_CONFIG[change.changeType as keyof typeof CHANGE_TYPE_CONFIG];
          const Icon = config.icon;

          return (
            <motion.button
              key={change.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(change.id)}
              className={`w-full p-4 ${config.bgColor} border ${config.borderColor} rounded-xl text-left hover:bg-opacity-20 transition-all`}
            >
              <div className="flex items-start gap-3">
                {/* Hexagram or Icon */}
                {change.hexagramNumber ? (
                  <div className="flex-shrink-0 mt-0.5">
                    <HexagramGlyph
                      lines={getHexagramLines(change.hexagramNumber)}
                      changingLines={change.changingLines}
                      size="sm"
                    />
                  </div>
                ) : (
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                )}

                <div className="flex-1 min-w-0">
                  {/* Title and Type */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-medium line-clamp-1">
                      {change.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${config.bgColor} ${config.color} flex-shrink-0`}>
                      {change.changeType}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-stone-400 text-sm line-clamp-2 mb-2">
                    {change.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span>{STATUS_LABELS[change.status as keyof typeof STATUS_LABELS]}</span>
                    {change.experienceCount !== undefined && change.experienceCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{change.experienceCount} experience{change.experienceCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{formatDate(change.createdAt)}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Helper: Get hexagram lines from number (simplified, would need actual I Ching data)
function getHexagramLines(hexagramNumber: number): boolean[] {
  // This is a placeholder - you'll need to implement actual hexagram line lookup
  // For now, return a pattern based on the number
  const pattern = hexagramNumber.toString(2).padStart(6, '0');
  return pattern.split('').map(bit => bit === '1');
}

// Helper: Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

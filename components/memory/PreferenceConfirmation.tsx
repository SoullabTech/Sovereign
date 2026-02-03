"use client";

import React, { useState, useCallback } from "react";
import { formatDaysAgo } from "@/lib/memory/confidenceDecay";

/**
 * Preference item requiring confirmation
 */
export interface StalePreference {
  id: string;
  memoryType: string;
  content: string;
  daysSinceConfirmed: number;
  originalSignificance: number;
  effectiveConfidence: number;
}

interface PreferenceConfirmationProps {
  preferences: StalePreference[];
  onConfirm: (id: string) => Promise<void>;
  onUpdate: (id: string, newContent: string) => Promise<void>;
  onExpire: (id: string) => Promise<void>;
  onDismiss?: () => void;
}

/**
 * PreferenceConfirmation
 *
 * UI for users to review and confirm stale preferences.
 * Handles preference drift by surfacing memories that haven't been
 * confirmed recently and asking "is this still true?"
 */
export function PreferenceConfirmation({
  preferences,
  onConfirm,
  onUpdate,
  onExpire,
  onDismiss,
}: PreferenceConfirmationProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const handleConfirm = useCallback(
    async (id: string) => {
      setProcessing(id);
      try {
        await onConfirm(id);
        setConfirmed((prev) => new Set([...prev, id]));
      } finally {
        setProcessing(null);
      }
    },
    [onConfirm]
  );

  const handleStartEdit = useCallback((id: string, currentContent: string) => {
    setEditingId(id);
    setEditDraft(currentContent);
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string) => {
      setProcessing(id);
      try {
        await onUpdate(id, editDraft);
        setConfirmed((prev) => new Set([...prev, id]));
        setEditingId(null);
        setEditDraft("");
      } finally {
        setProcessing(null);
      }
    },
    [onUpdate, editDraft]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft("");
  }, []);

  const handleExpire = useCallback(
    async (id: string) => {
      setProcessing(id);
      try {
        await onExpire(id);
        setConfirmed((prev) => new Set([...prev, id]));
      } finally {
        setProcessing(null);
      }
    },
    [onExpire]
  );

  // Filter out already confirmed preferences
  const pendingPreferences = preferences.filter((p) => !confirmed.has(p.id));

  if (pendingPreferences.length === 0) {
    return null; // Nothing to confirm
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-amber-900">Memory Check-in</h3>
          <p className="text-sm text-amber-700 mt-0.5">
            A few things MAIA remembers about you may need updating.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800 text-sm"
            aria-label="Dismiss for now"
          >
            Later
          </button>
        )}
      </div>

      {/* Preference Cards */}
      <div className="space-y-3">
        {pendingPreferences.map((pref) => (
          <PreferenceCard
            key={pref.id}
            preference={pref}
            isEditing={editingId === pref.id}
            editDraft={editDraft}
            isProcessing={processing === pref.id}
            onConfirm={() => handleConfirm(pref.id)}
            onStartEdit={() => handleStartEdit(pref.id, pref.content)}
            onSaveEdit={() => handleSaveEdit(pref.id)}
            onCancelEdit={handleCancelEdit}
            onExpire={() => handleExpire(pref.id)}
            onEditChange={setEditDraft}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-amber-600 text-center">
        Confirming helps MAIA stay accurate to who you are now.
      </div>
    </div>
  );
}

/**
 * Individual preference card
 */
interface PreferenceCardProps {
  preference: StalePreference;
  isEditing: boolean;
  editDraft: string;
  isProcessing: boolean;
  onConfirm: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onExpire: () => void;
  onEditChange: (value: string) => void;
}

function PreferenceCard({
  preference,
  isEditing,
  editDraft,
  isProcessing,
  onConfirm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onExpire,
  onEditChange,
}: PreferenceCardProps) {
  const confidencePercent = Math.round(preference.effectiveConfidence * 100);
  const lastConfirmedDate = new Date(
    Date.now() - preference.daysSinceConfirmed * 24 * 60 * 60 * 1000
  );

  return (
    <div className="rounded-xl border border-amber-100 bg-white p-3">
      {/* Memory Type Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          {formatMemoryType(preference.memoryType)}
        </span>
        <span className="text-xs text-gray-500">
          Last confirmed {formatDaysAgo(lastConfirmedDate)}
        </span>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          className="w-full rounded-lg border border-amber-200 p-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-amber-300"
          value={editDraft}
          onChange={(e) => onEditChange(e.target.value)}
          placeholder="Update this memory..."
          disabled={isProcessing}
        />
      ) : (
        <div className="text-sm text-gray-800 mb-3">
          {truncateContent(preference.content, 200)}
        </div>
      )}

      {/* Confidence Indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getConfidenceColor(confidencePercent)}`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{confidencePercent}% confidence</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <button
              onClick={onCancelEdit}
              disabled={isProcessing}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              disabled={isProcessing}
              className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {isProcessing ? "Saving..." : "Save Update"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onExpire}
              disabled={isProcessing}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              title="This is no longer true for me"
            >
              Not anymore
            </button>
            <button
              onClick={onStartEdit}
              disabled={isProcessing}
              className="px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? "..." : "Still true"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Format memory type for display
 */
function formatMemoryType(type: string): string {
  const typeLabels: Record<string, string> = {
    effective_practice: "Practice that works",
    ineffective_practice: "Practice to avoid",
    pattern: "Recurring pattern",
    preference: "Preference",
    boundary: "Boundary",
    correction: "Learning",
    breakthrough_emergence: "Breakthrough",
    spiral_transition: "Growth transition",
  };

  return typeLabels[type] ?? type.replace(/_/g, " ");
}

/**
 * Get confidence bar color based on percentage
 */
function getConfidenceColor(percent: number): string {
  if (percent >= 70) return "bg-green-400";
  if (percent >= 50) return "bg-amber-400";
  return "bg-red-400";
}

/**
 * Truncate content for display
 */
function truncateContent(content: string, maxLength: number): string {
  // Try to parse JSON content
  if (content.startsWith("{") || content.startsWith("[")) {
    try {
      const parsed = JSON.parse(content);
      // Extract meaningful text from common patterns
      if (parsed.insight) return truncateString(parsed.insight, maxLength);
      if (parsed.content) return truncateString(parsed.content, maxLength);
      if (parsed.description) return truncateString(parsed.description, maxLength);
      if (parsed.practice) return truncateString(parsed.practice, maxLength);
      // Fallback: stringify with limit
      return truncateString(JSON.stringify(parsed), maxLength);
    } catch {
      // Not valid JSON, use as-is
    }
  }

  return truncateString(content, maxLength);
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Compact inline version for session start prompts
 */
export function PreferenceConfirmationInline({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
    >
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
      {count} {count === 1 ? "memory" : "memories"} to review
    </button>
  );
}

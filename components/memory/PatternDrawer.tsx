/**
 * Pattern Drawer
 *
 * Shows "why" MAIA detected a pattern - displays supporting evidence
 * and allows user to confirm, reject, or refine the pattern.
 */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

export type PatternMeta = {
  id: string;
  key: string;
  sig?: number;
  seen?: number;
};

type EvidenceItem = {
  id: string;
  memoryType: string;
  content?: string | null;
  formedAt?: string | null;
  facetCode?: string | null;
  linkConfidence?: number | string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pattern: PatternMeta | null;
  userId?: string;
};

export function PatternDrawer({ open, onClose, pattern, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [patternKey, setPatternKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const title = useMemo(() => {
    if (!pattern) return "Pattern";
    // Format pattern key for display
    const key = pattern.key || "Pattern";
    return key
      .replace(/_/g, " ")
      .replace(/:/g, ": ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [pattern]);

  const loadEvidence = useCallback(async () => {
    if (!pattern?.id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/memory/patterns/${encodeURIComponent(pattern.id)}/evidence`,
        {
          method: "GET",
          headers: { "x-user-id": userId },
        }
      );
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to load evidence");
      }

      setPatternKey(json.patternKey || pattern.key || "");
      const items: EvidenceItem[] = (json.evidence || []).map((x: any) => ({
        id: x.id,
        memoryType: x.memoryType,
        content: x.content ?? null,
        formedAt: x.formedAt ?? null,
        facetCode: x.facetCode ?? null,
        linkConfidence: x.linkConfidence ?? null,
      }));
      setEvidence(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load evidence");
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  }, [pattern?.id, pattern?.key, userId]);

  useEffect(() => {
    if (open && pattern?.id) {
      loadEvidence();
      setFeedbackSent(false);
    }
    if (!open) {
      setEvidence([]);
      setError(null);
      setPatternKey("");
      setFeedbackSent(false);
    }
  }, [open, pattern?.id, loadEvidence]);

  const sendFeedback = useCallback(
    async (action: "confirm" | "reject" | "refine", note?: string) => {
      if (!pattern?.id) return;

      try {
        const res = await fetch(
          `/api/memory/patterns/${encodeURIComponent(pattern.id)}/feedback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
            },
            body: JSON.stringify({ action, note }),
          }
        );

        const json = await res.json();
        if (!res.ok || !json?.ok) {
          setError(json?.error || "Failed to save feedback");
          return;
        }

        setFeedbackSent(true);
        // Close after brief delay to show confirmation
        setTimeout(() => onClose(), 800);
      } catch (e: any) {
        setError(e?.message || "Failed to save feedback");
      }
    },
    [pattern?.id, userId, onClose]
  );

  if (!open || !pattern) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-t-2xl bg-gradient-to-b from-[#1a1f2e] to-[#0d1117] p-4 shadow-2xl border-t border-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-400/70">
              Show why
            </div>
            <div className="text-lg font-semibold text-amber-100">
              {title}
            </div>
            {pattern.seen && (
              <div className="mt-1 text-sm text-amber-400/60">
                Observed {pattern.seen} time{pattern.seen > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <button
            className="rounded-full px-3 py-1 text-sm text-amber-200/70 hover:bg-white/10 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Evidence List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-amber-200/60 py-4 text-center">
              Loading evidence...
            </div>
          ) : error ? (
            <div className="text-sm text-red-400 py-4 text-center">{error}</div>
          ) : evidence.length === 0 ? (
            <div className="text-sm text-amber-200/60 py-4 text-center">
              No supporting evidence found yet.
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-amber-500/20 bg-black/30 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400/60">
                    <span className="capitalize">{e.memoryType.replace(/_/g, " ")}</span>
                    {e.facetCode && <span>• {e.facetCode}</span>}
                    {e.formedAt && (
                      <span>• {new Date(e.formedAt).toLocaleDateString()}</span>
                    )}
                    {e.linkConfidence != null && (
                      <span>• {(Number(e.linkConfidence) * 100).toFixed(0)}% confidence</span>
                    )}
                  </div>
                  {e.content && (
                    <div className="mt-2 text-sm text-amber-100/80">
                      {e.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Buttons */}
        {feedbackSent ? (
          <div className="mt-4 py-3 text-center text-amber-400">
            Thank you for your feedback
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-sm text-white font-medium transition-colors"
              onClick={() => sendFeedback("confirm", "Yes, this resonates")}
            >
              Confirm
            </button>
            <button
              className="rounded-xl border border-amber-500/30 hover:bg-white/5 px-4 py-2 text-sm text-amber-200 transition-colors"
              onClick={() => sendFeedback("reject", "No, this doesn't fit")}
            >
              Not me
            </button>
            <button
              className="rounded-xl border border-amber-500/30 hover:bg-white/5 px-4 py-2 text-sm text-amber-200 transition-colors"
              onClick={() => sendFeedback("refine", "Needs refinement")}
            >
              Refine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

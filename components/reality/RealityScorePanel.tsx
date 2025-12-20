"use client";

/**
 * Reality Score Panel - User Interface for Reality Hygiene Scoring
 *
 * Allows users to manually score 20 manipulation indicators (1-5 scale).
 * Integrates with MAIA's Spiralogic architecture - not just a checklist.
 *
 * Features:
 * - Live total/band calculation
 * - Elemental breakdown visualization
 * - Save to database
 * - Visual indicator of risk level
 */

import { useMemo, useState } from "react";

const INDICATORS: Array<[string, string, string]> = [
  // [key, label, element]
  ["timing", "Timing / Political Convenience", "Fire"],
  ["emotional_manipulation", "Emotional Manipulation", "Water"],
  ["uniform_messaging", "Uniform Messaging", "Aether"],
  ["missing_information", "Missing Information", "Earth"],
  ["good_vs_evil", "Good vs. Evil Framing", "Water"],
  ["tribal_division", "Tribal Division (Us vs. Them)", "Water"],
  ["authority_overload", "Authority Overload", "Aether"],
  ["urgent_action", "Urgent Action Pressure", "Fire"],
  ["novelty_shock", "Novelty / Shock Value", "Fire"],
  ["gain_incentive", "Gain / Incentive", "Earth"],
  ["suppression_of_dissent", "Suppression of Dissent", "Aether"],
  ["false_dilemmas", "False Dilemmas", "Air"],
  ["bandwagon", "Bandwagon / Conformity", "Air"],
  ["emotional_repetition", "Emotional Repetition", "Water"],
  ["cherry_picked_data", "Cherry-Picked Data", "Earth"],
  ["logical_fallacies", "Logical Fallacies", "Air"],
  ["manufactured_outrage", "Manufactured Outrage", "Water"],
  ["framing_techniques", "Framing Techniques", "Air"],
  ["rapid_behavior_shifts", "Rapid Behavior Shifts", "Fire"],
  ["historical_parallels", "Historical Parallels", "Earth"],
] as const;

type IndicatorKey = typeof INDICATORS[number][0];
type RealityScores = Record<IndicatorKey, number>;

export function RealityScorePanel({
  onChange,
  onSave,
}: {
  onChange?: (scores: RealityScores) => void;
  onSave?: (scores: RealityScores, total: number, band: string) => void;
}) {
  const [scores, setScores] = useState<RealityScores>(
    Object.fromEntries(INDICATORS.map(([k]) => [k, 1])) as RealityScores
  );

  const [saving, setSaving] = useState(false);

  // Calculate totals and band
  const { total, band, max, elementalBreakdown } = useMemo(() => {
    const t = Object.values(scores).reduce((a, b) => a + b, 0);
    const m = INDICATORS.length * 5;
    const b = t <= 25 ? "low" : t <= 50 ? "moderate" : t <= 75 ? "strong" : "overwhelming";

    // Calculate elemental breakdown
    const breakdown: Record<string, number> = { Water: 0, Fire: 0, Earth: 0, Air: 0, Aether: 0 };
    INDICATORS.forEach(([key, , element]) => {
      breakdown[element] += scores[key];
    });

    return { total: t, band: b, max: m, elementalBreakdown: breakdown };
  }, [scores]);

  function setScore(k: IndicatorKey, v: number) {
    const next = { ...scores, [k]: v };
    setScores(next);
    onChange?.(next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Call optional onSave callback
      if (onSave) {
        await onSave(scores, total, band);
      }

      // Also save to API
      const response = await fetch("/api/reality-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: "oracle_turn",
          scores,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save reality assessment");
      }

      console.log("✅ Reality assessment saved");
    } catch (error) {
      console.error("❌ Failed to save reality assessment:", error);
    } finally {
      setSaving(false);
    }
  }

  // Band color coding
  const bandColors: Record<string, string> = {
    low: "text-green-600 dark:text-green-400",
    moderate: "text-yellow-600 dark:text-yellow-400",
    strong: "text-orange-600 dark:text-orange-400",
    overwhelming: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Reality Hygiene Score
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            1 = not present · 5 = strongly present
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {total}/{max}
          </div>
          <div className={`text-sm uppercase tracking-wide font-semibold ${bandColors[band]}`}>
            {band}
          </div>
        </div>
      </div>

      {/* Elemental Breakdown */}
      <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        {Object.entries(elementalBreakdown).map(([element, score]) => (
          <div key={element} className="text-center">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{element}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{score}</div>
          </div>
        ))}
      </div>

      {/* Scoring Sliders */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {INDICATORS.map(([key, label, element]) => (
          <div key={key} className="flex items-center gap-3 py-1">
            <div className="w-64 text-sm text-gray-700 dark:text-gray-300">
              {label}
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">({element})</span>
            </div>
            <input
              className="flex-1"
              type="range"
              min={1}
              max={5}
              value={scores[key]}
              onChange={(e) => setScore(key, Number(e.target.value))}
            />
            <div className="w-8 text-sm tabular-nums text-right font-medium text-gray-900 dark:text-gray-100">
              {scores[key]}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {band === "low" && "Clean signal - few manipulation patterns"}
          {band === "moderate" && "Some patterns present - verify sources"}
          {band === "strong" && "Multiple patterns - likely engineered"}
          {band === "overwhelming" && "Heavy manipulation - do not share"}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save Assessment"}
        </button>
      </div>
    </div>
  );
}

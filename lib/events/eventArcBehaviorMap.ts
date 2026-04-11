/**
 * Event Arc — day-aware behavior map
 *
 * Keyed by `${totalDays}-${dayIndex}`. Only events whose shape we have
 * language for live in here. Anything not in the map falls back to the
 * generic "during" block in buildEventArcContextBlock.
 */

export const RETREAT_DAY_LANGUAGE: Record<string, string> = {
  '3-1': `
Day 1 posture:
Members may be arriving with mixed anticipation, vigilance, openness, or uncertainty.
Prioritize orientation over interpretation. Help them settle into the field, notice what is
present, and trust first impressions without forcing meaning too quickly. Favor grounding,
permission, and simple reflection over synthesis. Early experiences may be fragmentary,
heightened, or unclear; treat this as natural arrival, not resistance or failure.
`,

  '3-2': `
Day 2 posture:
Members are more likely to be in the thick of the work. Material may intensify, deepen,
or become more emotionally and symbolically charged. Prioritize accompaniment over control.
Reflect patterns, name emerging themes carefully, and support people in staying with what is
unfolding without rushing to closure. Favor depth, honesty, and gentle structure. This is often
the day where hidden dynamics, strong feelings, or meaningful breakthroughs begin to take clearer shape.
`,

  '3-3': `
Day 3 posture:
Members may be moving toward integration, clarity, tenderness, grief, relief, or resolve.
Prioritize meaning-making, coherence, and next-step integration without flattening the experience.
Help them notice what has shifted, what feels more true, and what wants to be carried forward.
Favor synthesis, embodiment, and careful landing. The task is not to explain everything, but to help
the person leave with a living thread they can continue to follow.
`,
};

/**
 * Look up day-specific language for an active event.
 * Returns null if no entry exists for this shape.
 */
export function getDayLanguage(
  totalDays: number | null,
  dayIndex: number | null
): string | null {
  if (totalDays === null || dayIndex === null) return null;
  return RETREAT_DAY_LANGUAGE[`${totalDays}-${dayIndex}`] ?? null;
}

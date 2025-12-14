// backend — lib/field/panconsciousFieldRouter.ts

import type { CognitiveProfile } from '../consciousness/cognitiveProfileService';

export type FieldRealm = 'UNDERWORLD' | 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC';

export interface FieldRoutingContext {
  cognitiveProfile: CognitiveProfile | null | undefined;
  // You can extend this later with elemental / mythic context
  element?: string | null;
  facet?: string | null;
  archetype?: string | null;
  // Optional: Bloom info if helpful
  bloomLevel?: number | null;
}

export interface FieldRoutingDecision {
  realm: FieldRealm;
  /**
   * Whether it is safe to do any kind of symbolic / field work.
   */
  fieldWorkSafe: boolean;
  /**
   * Whether deep, highly symbolic / initiatory work is recommended.
   */
  deepWorkRecommended: boolean;
  /**
   * A rough "intensity" flag for field operations.
   */
  maxSymbolicIntensity: 'low' | 'medium' | 'high';
  /**
   * Textual reasoning for logs / diagnostics.
   */
  reasoning: string;
}

/**
 * Panconscious Field Router
 *
 * Uses cognitive profile (and optionally elemental context)
 * to decide how far MAIA should go into field work.
 */
export function routePanconsciousField(
  ctx: FieldRoutingContext,
): FieldRoutingDecision {
  const profile = ctx.cognitiveProfile;

  // Default: play it safe in MIDDLEWORLD with low symbolic intensity
  let realm: FieldRealm = 'MIDDLEWORLD';
  let fieldWorkSafe = false;
  let deepWorkRecommended = false;
  let maxSymbolicIntensity: 'low' | 'medium' | 'high' = 'low';
  let reasoning = 'No cognitive profile available - staying in grounded middleworld work.';

  if (!profile) {
    return {
      realm,
      fieldWorkSafe,
      deepWorkRecommended,
      maxSymbolicIntensity,
      reasoning,
    };
  }

  const avg = profile.rollingAverage;
  const stability = profile.stability;
  const spiritualBypass = profile.bypassingFrequency.spiritual;
  const intellectualBypass = profile.bypassingFrequency.intellectual;

  // 1) Very low cognitive altitude → middleworld only, low intensity
  if (avg < 2.5) {
    realm = 'MIDDLEWORLD';
    fieldWorkSafe = false;
    deepWorkRecommended = false;
    maxSymbolicIntensity = 'low';
    reasoning =
      `Low cognitive altitude (${avg.toFixed(
        2,
      )}) - focus on concrete, present-life grounding before field work.`;
  }
  // 2) Moderate altitude (2.5–3.9) or unstable → allow gentle middleworld field work only
  else if (avg < 4.0 || stability === 'volatile' || stability === 'descending') {
    realm = 'MIDDLEWORLD';
    fieldWorkSafe = true;
    deepWorkRecommended = false;
    maxSymbolicIntensity = 'medium';
    reasoning =
      `Developing or unstable cognitive field (avg ${avg.toFixed(
        2,
      )}, stability=${stability}) - keep work in middleworld with gentle symbolic edges.`;
  }
  // 3) High altitude (>=4.0) but high bypassing → restrict to middleworld
  else if (spiritualBypass > 0.4 || intellectualBypass > 0.4) {
    realm = 'MIDDLEWORLD';
    fieldWorkSafe = true;
    deepWorkRecommended = false;
    maxSymbolicIntensity = 'medium';
    const bypassType = spiritualBypass > 0.4 ? 'spiritual' : 'intellectual';
    reasoning =
      `High cognitive altitude but significant ${bypassType} bypassing - stay in middleworld, ` +
      'use symbolic work only to support integration, not escape.';
  }
  // 4) High, stable, low-bypassing → full symbolic / upperworld access
  else {
    realm = 'UPPERWORLD_SYMBOLIC';
    fieldWorkSafe = true;
    deepWorkRecommended = true;
    maxSymbolicIntensity = 'high';
    reasoning =
      `High, stable cognitive altitude (avg ${avg.toFixed(
        2,
      )}, stability=${stability}) with low bypassing - safe for deep symbolic and upperworld work.`;
  }

  console.log(
    `🌌 [Panconscious Field Router] realm=${realm}, fieldWorkSafe=${fieldWorkSafe}, ` +
      `deepWorkRecommended=${deepWorkRecommended}, intensity=${maxSymbolicIntensity} | ${reasoning}`,
  );

  return {
    realm,
    fieldWorkSafe,
    deepWorkRecommended,
    maxSymbolicIntensity,
    reasoning,
  };
}

// backend: app/api/debug/field-safety/route.ts
import { NextRequest, NextResponse } from "next/server";
import { enforceFieldSafety } from "@/lib/field/enforceFieldSafety";
import { getCognitiveProfile } from "@/lib/consciousness/cognitiveProfileService";
import { routePanconsciousField } from "@/lib/field/panconsciousFieldRouter";
import { detectBloomLevel } from "@/lib/consciousness/bloomCognition";

/**
 * Debug Panel - Field Safety Visibility
 *
 * Dev-only endpoint that shows:
 * - Tier decision (1-4)
 * - Field routing (realm, intensity, safe/unsafe)
 * - Bypassing detection (spiritual/intellectual)
 * - Bloom level detection
 * - Processing profile recommendation
 *
 * SECURITY: 404 in production, requires MAIA_DEBUG_PANEL_ENABLED=true
 */

function assertDebugEnabled() {
  const enabled =
    process.env.NODE_ENV !== "production" &&
    process.env.MAIA_DEBUG_PANEL_ENABLED === "true";

  if (!enabled) {
    return NextResponse.json(
      { ok: false, reason: "debug_disabled" },
      { status: 404 }
    );
  }
  return null;
}

export async function POST(req: NextRequest) {
  const guard = assertDebugEnabled();
  if (guard) return guard;

  try {
    const body = await req.json();

    const message: string = body?.message ?? "";
    const userId: string = body?.userId ?? "debug-user";
    const conversationHistory = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory
      : [];

    // Optional: use provided profile override for testing, otherwise fetch real profile
    const profileOverride = body?.userProfile ?? null;

    let userProfile = profileOverride;

    // If no override provided, try to fetch real profile
    if (!userProfile && userId !== "debug-user") {
      try {
        userProfile = await getCognitiveProfile(userId);
      } catch (err) {
        console.warn(`[Debug] Could not fetch profile for ${userId}:`, err);
      }
    }

    // Run Bloom detection on the message
    let bloomDetection = null;
    try {
      bloomDetection = detectBloomLevel(message, {
        history: conversationHistory.map((t: any) => ({
          role: t.role || 'user',
          content: t.content || t.userMessage || ''
        }))
      });
    } catch (err) {
      console.warn('[Debug] Bloom detection failed:', err);
    }

    // Run field safety enforcement (the single source of truth)
    let safety = null;
    let fieldRouting = null;

    if (userProfile) {
      safety = enforceFieldSafety({
        cognitiveProfile: userProfile,
        element: body?.element,
        userName: body?.userName || 'DebugUser',
        context: 'oracle',
      });

      // Get the detailed field routing decision
      fieldRouting = routePanconsciousField({
        cognitiveProfile: userProfile,
        element: body?.element,
      });
    }

    // Determine tier from routing
    let tier = null;
    if (fieldRouting) {
      const avg = userProfile?.rollingAverage || 0;
      const spiritual = userProfile?.bypassingFrequency?.spiritual || 0;
      const intellectual = userProfile?.bypassingFrequency?.intellectual || 0;

      if (avg < 2.5) {
        tier = 1;
      } else if (avg < 4.0 || userProfile?.stability === 'volatile' || userProfile?.stability === 'descending') {
        tier = 2;
      } else if (spiritual > 0.4 || intellectual > 0.4) {
        tier = 3; // THE CRUCIAL CATCH
      } else {
        tier = 4;
      }
    }

    return NextResponse.json({
      ok: true,
      input: {
        userId,
        messageLength: message.length,
        conversationDepth: conversationHistory.length,
      },
      bloom: bloomDetection ? {
        level: bloomDetection.level,
        numericLevel: bloomDetection.numericLevel,
        score: bloomDetection.score,
        rationale: bloomDetection.rationale,
      } : null,
      profile: userProfile ? {
        avgLevel: userProfile.rollingAverage,
        currentLevel: userProfile.currentLevel,
        stability: userProfile.stability,
        bypassing: {
          spiritual: userProfile.bypassingFrequency.spiritual,
          intellectual: userProfile.bypassingFrequency.intellectual,
        },
        flags: {
          commonsEligible: userProfile.commonsEligible,
          deepWorkRecommended: userProfile.deepWorkRecommended,
          fieldWorkSafe: userProfile.fieldWorkSafe,
        }
      } : null,
      fieldSafety: safety ? {
        allowed: safety.allowed,
        tier,
        realm: safety.fieldRouting.realm,
        intensity: safety.fieldRouting.intensity,
        fieldWorkSafe: safety.fieldRouting.fieldWorkSafe,
        deepWorkRecommended: safety.fieldRouting.deepWorkRecommended,
        reasoning: safety.fieldRouting.reasoning,
        message: safety.message,
        elementalNote: safety.elementalNote,
      } : null,
    });
  } catch (err: any) {
    console.error('[Debug] Field safety debug error:', err);
    return NextResponse.json(
      { ok: false, reason: "server_error", error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

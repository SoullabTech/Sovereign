import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import { supabase } from "../../../lib/supabaseClient";
import { getSoulprintForUser, getSymbolicInsights, exportSoulprint, soulprintMemory } from "@/lib/memory/soulprint";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      scores, 
      milestone, 
      coherence, 
      elementalBalance,
      sessionDuration,
      interactionCount,
      breakthroughMoments,
      shadowElements
    } = body;

    if (!userId || !scores || !milestone || coherence === undefined) {
      return NextResponse.json(
        { success: false, error: "userId, scores, milestone, and coherence are required" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    // Calculate total activation
    const totalActivation = Object.values(scores).reduce((sum: number, score) => sum + (score as number), 0);

    const { data, error } = await supabase
      .from("soulprints")
      .insert([{
        user_id: userId,
        scores,
        milestone,
        coherence,
        elemental_balance: elementalBalance || {},
        session_duration: sessionDuration,
        interaction_count: interactionCount || 0,
        total_activation: totalActivation,
        breakthrough_moments: breakthroughMoments || [],
        shadow_elements: shadowElements || []
      }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save soulprint" },
        { status: 500 }
      );
    }

    // Update milestone progression
    if (elementalBalance) {
      try {
        await supabase.rpc('update_milestone_progression', {
          p_user_id: userId,
          p_milestone: milestone,
          p_coherence: coherence,
          p_elemental_balance: elementalBalance
        });
      } catch (rpcError) {
        console.warn("Failed to update milestone progression:", rpcError);
        // Don't fail the main request if milestone progression fails
      }
    }

    return NextResponse.json({ 
      success: true,
      soulprint: data[0],
      message: "Soulprint captured in sacred memory"
    });

  } catch (error) {
    console.error("Error saving soulprint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save soulprint" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mode = searchParams.get("mode") || "symbolic";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (mode === "symbolic") {
      const snapshot = await exportSoulprint(userId);
      const insights = await getSymbolicInsights(userId);
      const symbolicContext = await soulprintMemory.getSymbolicContext(userId, 10);

      if (!snapshot) {
        const defaultSnapshot = await getSoulprintForUser(userId);
        const total = Object.values(defaultSnapshot.elementalBalance).reduce((sum, val) => sum + val, 0) || 1;
        const elementalBalancePercent = Object.fromEntries(
          Object.entries(defaultSnapshot.elementalBalance).map(([k, v]) => [k, Math.round((v / total) * 100)])
        );

        return NextResponse.json({
          success: true,
          currentArchetype: defaultSnapshot.recentArchetypes[0] || 'maia',
          elementalBalance: elementalBalancePercent,
          recentPhases: defaultSnapshot.spiralHistory.slice(-5),
          recentSymbols: symbolicContext.recentSymbols || [],
          sessionCount: defaultSnapshot.sessionCount,
          dominantElement: defaultSnapshot.dominantElement,
          mode: 'symbolic'
        });
      }

      const total = Object.values(snapshot.elementalBalance).reduce((sum, val) => sum + val, 0) || 1;
      const elementalBalancePercent = Object.fromEntries(
        Object.entries(snapshot.elementalBalance).map(([k, v]) => [k, Math.round((v / total) * 100)])
      );

      return NextResponse.json({
        success: true,
        currentArchetype: snapshot.recentArchetypes[0] || insights.primaryArchetype || 'maia',
        elementalBalance: elementalBalancePercent,
        recentPhases: snapshot.spiralHistory.slice(-5),
        recentSymbols: symbolicContext.recentSymbols || [],
        sessionCount: snapshot.sessionCount,
        dominantElement: snapshot.dominantElement,
        insights,
        mode: 'symbolic'
      });
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("soulprints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch soulprints" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      soulprints: data || [],
      mode: 'database'
    });

  } catch (error) {
    console.error("Error fetching soulprints:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch soulprints" },
      { status: 500 }
    );
  }
}
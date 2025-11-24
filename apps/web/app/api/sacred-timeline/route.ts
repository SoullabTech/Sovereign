import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import { supabase } from "../../../lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    // Since the view might not exist yet, let's manually combine the data
    // Get soulprints
    const { data: soulprints, error: soulprintError } = await supabase
      .from("soulprints")
      .select("id, milestone, coherence, elemental_balance, created_at")
      .eq("user_id", userId);

    if (soulprintError) {
      console.error("Soulprint fetch error:", soulprintError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch soulprints" },
        { status: 500 }
      );
    }

    // Get journal entries
    const { data: journals, error: journalError } = await supabase
      .from("journal_entries")
      .select("id, prompt, response, milestone, active_facets, word_count, reflection_quality, created_at")
      .eq("user_id", userId);

    if (journalError) {
      console.error("Journal fetch error:", journalError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal entries" },
        { status: 500 }
      );
    }

    // Combine and format data
    const timeline = [
      ...(soulprints || []).map((s: any) => ({
        id: s.id,
        entry_type: 'soulprint',
        milestone: s.milestone,
        content_preview: s.coherence?.toString() || '0',
        reflection_content: null,
        created_at: s.created_at,
        metadata: {
          elemental_balance: s.elemental_balance
        }
      })),
      ...(journals || []).map((j: any) => ({
        id: j.id,
        entry_type: 'journal',
        milestone: j.milestone,
        content_preview: j.prompt?.substring(0, 100) || '',
        reflection_content: j.response,
        created_at: j.created_at,
        metadata: {
          active_facets: j.active_facets,
          word_count: j.word_count,
          quality: j.reflection_quality
        }
      }))
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return NextResponse.json({ 
      success: true,
      timeline,
      message: "Sacred timeline retrieved"
    });

  } catch (error) {
    console.error("Error fetching sacred timeline:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sacred timeline" },
      { status: 500 }
    );
  }
}
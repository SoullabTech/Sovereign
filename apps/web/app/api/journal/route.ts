import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, soulprintId, prompt, response, milestone, activeFacets } = body;

    if (!userId || !prompt || !response) {
      return NextResponse.json(
        { success: false, error: "userId, prompt, and response are required" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .insert([{
        user_id: userId,
        soulprint_id: soulprintId,
        prompt,
        response,
        milestone,
        active_facets: activeFacets || []
      }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save journal entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      entry: data[0],
      message: "Sacred reflection woven into memory"
    });

  } catch (error) {
    console.error("Error saving journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save journal entry" },
      { status: 500 }
    );
  }
}

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

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal entries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      entries: data || []
    });

  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}
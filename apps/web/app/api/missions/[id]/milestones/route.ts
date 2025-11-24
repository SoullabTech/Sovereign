import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// POST /api/missions/[id]/milestones - Add a milestone to a mission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const missionId = params.id
    const body = await request.json()
    const { title, notes } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Verify user owns this mission
    const { data: mission, error: missionError } = await supabase
      .from('user_missions')
      .select('id')
      .eq('id', missionId)
      .single()

    if (missionError || !mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      )
    }

    // Get current milestone count for sort order
    const { count } = await supabase
      .from('mission_milestones')
      .select('id', { count: 'exact' })
      .eq('mission_id', missionId)

    // Create milestone
    const { data: milestone, error } = await supabase
      .from('mission_milestones')
      .insert({
        mission_id: missionId,
        title,
        notes,
        sort_order: (count || 0)
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating milestone:', error)
      return NextResponse.json(
        { error: 'Failed to create milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { milestone, message: 'Milestone created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create milestone error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
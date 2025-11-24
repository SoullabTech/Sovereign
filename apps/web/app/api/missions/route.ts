import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { Mission, Milestone } from '@/lib/story/types'

// GET /api/missions - Get all missions for the authenticated user
export async function GET(request: NextRequest) {
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

    // Get user missions with milestones
    const { data: missions, error } = await supabase
      .rpc('get_user_missions_with_milestones', {
        user_uuid: session.user.id
      })

    if (error) {
      console.error('Error fetching missions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch missions' },
        { status: 500 }
      )
    }

    // Get milestones for each mission
    const missionIds = missions?.map(m => m.id) || []
    let milestones: any[] = []

    if (missionIds.length > 0) {
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('mission_milestones')
        .select('*')
        .in('mission_id', missionIds)
        .order('sort_order')

      if (milestonesError) {
        console.error('Error fetching milestones:', milestonesError)
      } else {
        milestones = milestonesData || []
      }
    }

    // Transform to Mission format expected by frontend
    const formattedMissions: Mission[] = missions?.map(mission => ({
      id: mission.id,
      userId: session.user.id,
      title: mission.title,
      description: mission.description,
      status: mission.status,
      house: mission.house,
      relatedPlanets: mission.related_planets || [],
      relatedSign: mission.related_sign,
      identifiedDate: new Date(mission.identified_date),
      startedDate: mission.started_date ? new Date(mission.started_date) : undefined,
      completedDate: mission.completed_date ? new Date(mission.completed_date) : undefined,
      targetDate: mission.target_date ? new Date(mission.target_date) : undefined,
      progress: mission.progress || 0,
      milestones: milestones
        .filter(m => m.mission_id === mission.id)
        .map(m => ({
          id: m.id,
          title: m.title,
          completed: m.completed,
          completedDate: m.completed_date ? new Date(m.completed_date) : undefined,
          notes: m.notes
        })),
      transitContext: mission.transit_context || undefined,
      createdAt: new Date(mission.created_at),
      lastUpdated: new Date(mission.updated_at)
    })) || []

    return NextResponse.json({ missions: formattedMissions })

  } catch (error) {
    console.error('Missions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/missions - Create a new mission
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      description,
      house,
      relatedPlanets,
      relatedSign,
      targetDate,
      transitContext,
      milestones = []
    } = body

    // Validate required fields
    if (!title || !description || !house) {
      return NextResponse.json(
        { error: 'Title, description, and house are required' },
        { status: 400 }
      )
    }

    if (house < 1 || house > 12) {
      return NextResponse.json(
        { error: 'House must be between 1 and 12' },
        { status: 400 }
      )
    }

    // Create mission
    const { data: mission, error } = await supabase
      .from('user_missions')
      .insert({
        user_id: session.user.id,
        title,
        description,
        house,
        related_planets: relatedPlanets,
        related_sign: relatedSign,
        target_date: targetDate,
        transit_context: transitContext,
        status: 'emerging' // Start as emerging
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating mission:', error)
      return NextResponse.json(
        { error: 'Failed to create mission' },
        { status: 500 }
      )
    }

    // Create milestones if provided
    if (milestones.length > 0) {
      const milestonesToInsert = milestones.map((milestone: any, index: number) => ({
        mission_id: mission.id,
        title: milestone.title,
        sort_order: index,
        notes: milestone.notes
      }))

      const { error: milestonesError } = await supabase
        .from('mission_milestones')
        .insert(milestonesToInsert)

      if (milestonesError) {
        console.error('Error creating milestones:', milestonesError)
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json(
      { mission, message: 'Mission created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
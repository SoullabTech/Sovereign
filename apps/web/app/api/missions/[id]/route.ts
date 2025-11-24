import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// GET /api/missions/[id] - Get a specific mission
export async function GET(
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

    // Get mission (RLS ensures user can only access their own missions)
    const { data: mission, error } = await supabase
      .from('user_missions')
      .select('*')
      .eq('id', missionId)
      .single()

    if (error || !mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      )
    }

    // Get milestones for this mission
    const { data: milestones } = await supabase
      .from('mission_milestones')
      .select('*')
      .eq('mission_id', missionId)
      .order('sort_order')

    // Transform to frontend format
    const formattedMission = {
      id: mission.id,
      userId: mission.user_id,
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
      milestones: milestones?.map(m => ({
        id: m.id,
        title: m.title,
        completed: m.completed,
        completedDate: m.completed_date ? new Date(m.completed_date) : undefined,
        notes: m.notes
      })) || [],
      transitContext: mission.transit_context,
      createdAt: new Date(mission.created_at),
      lastUpdated: new Date(mission.updated_at)
    }

    return NextResponse.json({ mission: formattedMission })

  } catch (error) {
    console.error('Get mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/missions/[id] - Update a mission
export async function PUT(
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

    const {
      title,
      description,
      status,
      house,
      relatedPlanets,
      relatedSign,
      startedDate,
      targetDate,
      transitContext,
      milestones
    } = body

    // Validate house if provided
    if (house && (house < 1 || house > 12)) {
      return NextResponse.json(
        { error: 'House must be between 1 and 12' },
        { status: 400 }
      )
    }

    // Update mission
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (house !== undefined) updateData.house = house
    if (relatedPlanets !== undefined) updateData.related_planets = relatedPlanets
    if (relatedSign !== undefined) updateData.related_sign = relatedSign
    if (startedDate !== undefined) updateData.started_date = startedDate
    if (targetDate !== undefined) updateData.target_date = targetDate
    if (transitContext !== undefined) updateData.transit_context = transitContext

    // Handle status-specific updates
    if (status === 'active' && !startedDate) {
      updateData.started_date = new Date().toISOString()
    }
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString()
      updateData.progress = 100
    }

    const { data: mission, error } = await supabase
      .from('user_missions')
      .update(updateData)
      .eq('id', missionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating mission:', error)
      return NextResponse.json(
        { error: 'Failed to update mission' },
        { status: 500 }
      )
    }

    // Update milestones if provided
    if (milestones) {
      // Delete existing milestones
      await supabase
        .from('mission_milestones')
        .delete()
        .eq('mission_id', missionId)

      // Insert new milestones
      if (milestones.length > 0) {
        const milestonesToInsert = milestones.map((milestone: any, index: number) => ({
          mission_id: missionId,
          title: milestone.title,
          completed: milestone.completed || false,
          completed_date: milestone.completed ? (milestone.completedDate || new Date().toISOString()) : null,
          notes: milestone.notes,
          sort_order: index
        }))

        const { error: milestonesError } = await supabase
          .from('mission_milestones')
          .insert(milestonesToInsert)

        if (milestonesError) {
          console.error('Error updating milestones:', milestonesError)
        }
      }
    }

    return NextResponse.json(
      { mission, message: 'Mission updated successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/missions/[id] - Delete a mission
export async function DELETE(
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

    // Delete mission (cascade will handle milestones)
    const { error } = await supabase
      .from('user_missions')
      .delete()
      .eq('id', missionId)

    if (error) {
      console.error('Error deleting mission:', error)
      return NextResponse.json(
        { error: 'Failed to delete mission' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Mission deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
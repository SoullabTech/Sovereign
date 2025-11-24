import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// PUT /api/milestones/[id] - Update a milestone
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

    const milestoneId = params.id
    const body = await request.json()
    const { title, completed, notes } = body

    // Verify user owns this milestone through mission ownership
    const { data: milestone, error: verifyError } = await supabase
      .from('mission_milestones')
      .select(`
        id,
        mission_id,
        user_missions!inner(user_id)
      `)
      .eq('id', milestoneId)
      .single()

    if (verifyError || !milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completed_date = completed ? new Date().toISOString() : null
    }
    if (notes !== undefined) updateData.notes = notes

    // Update milestone
    const { data: updatedMilestone, error } = await supabase
      .from('mission_milestones')
      .update(updateData)
      .eq('id', milestoneId)
      .select()
      .single()

    if (error) {
      console.error('Error updating milestone:', error)
      return NextResponse.json(
        { error: 'Failed to update milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { milestone: updatedMilestone, message: 'Milestone updated successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update milestone error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/milestones/[id] - Delete a milestone
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

    const milestoneId = params.id

    // Verify user owns this milestone through mission ownership (RLS handles this)
    const { error } = await supabase
      .from('mission_milestones')
      .delete()
      .eq('id', milestoneId)

    if (error) {
      console.error('Error deleting milestone:', error)
      return NextResponse.json(
        { error: 'Failed to delete milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Milestone deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete milestone error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
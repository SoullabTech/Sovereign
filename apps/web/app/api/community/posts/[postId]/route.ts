import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { communityStorage } from '@/lib/community/storage'

/**
 * GET /api/community/posts/[postId]
 * Fetch a single post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const post = communityStorage.getPost(params.postId)

    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error: any) {
    console.error('❌ Failed to fetch post:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

/**
 * DELETE /api/community/posts/[postId]
 * Delete a post (only by author or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await request.json()

    const post = communityStorage.getPost(params.postId)
    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 })
    }

    // Check authorization (only author can delete)
    if (post.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 })
    }

    const deleted = communityStorage.deletePost(params.postId)

    return NextResponse.json({
      success: deleted
    })
  } catch (error: any) {
    console.error('❌ Failed to delete post:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { communityStorage } from '@/lib/community/storage'
import { CreateCommentPayload } from '@/lib/community/types'

/**
 * GET /api/community/posts/[postId]/comments
 * Fetch all comments for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const comments = communityStorage.getComments(params.postId)

    // For each comment, get replies
    const commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: communityStorage.getReplies(comment.id)
    }))

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies
    })
  } catch (error: any) {
    console.error('❌ Failed to fetch comments:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

/**
 * POST /api/community/posts/[postId]/comments
 * Add a comment to a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await request.json()

    const payload: CreateCommentPayload = {
      postId: params.postId,
      userId: body.userId,
      userName: body.userName,
      content: body.content,
      parentCommentId: body.parentCommentId
    }

    // Validate
    if (!payload.userId || !payload.userName || !payload.content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, userName, content'
      }, { status: 400 })
    }

    const comment = communityStorage.createComment(payload)

    if (!comment) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      comment
    })
  } catch (error: any) {
    console.error('❌ Failed to create comment:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
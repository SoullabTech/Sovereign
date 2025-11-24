import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { communityStorage } from '@/lib/community/storage'

/**
 * POST /api/community/posts/[postId]/heart
 * Toggle heart on a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId'
      }, { status: 400 })
    }

    const result = communityStorage.toggleHeart(params.postId, userId)

    return NextResponse.json({
      success: true,
      hearted: result.hearted,
      hearts: result.count
    })
  } catch (error: any) {
    console.error('❌ Failed to toggle heart:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
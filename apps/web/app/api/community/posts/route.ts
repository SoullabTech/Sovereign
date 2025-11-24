import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import { communityStorage } from '@/lib/community/storage'
import { CreatePostPayload, FeedFilters } from '@/lib/community/types'

/**
 * GET /api/community/posts
 * Fetch community feed with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filters from query params
    const filters: FeedFilters = {}

    const mode = searchParams.get('mode')
    if (mode) filters.mode = mode as any

    const type = searchParams.get('type')
    if (type) filters.type = type as any

    const element = searchParams.get('element')
    if (element) filters.element = element as any

    if (searchParams.get('breakthroughs') === 'true') {
      filters.onlyBreakthroughs = true
    }

    if (searchParams.get('silence') === 'true') {
      filters.onlySilence = true
    }

    const userId = searchParams.get('userId')
    if (userId) filters.userId = userId

    const tags = searchParams.get('tags')
    if (tags) filters.tags = tags.split(',')

    // Get filtered posts
    const posts = communityStorage.getAllPosts(filters)

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length
    })
  } catch (error: any) {
    console.error('❌ Failed to fetch posts:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

/**
 * POST /api/community/posts
 * Create a new community post
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePostPayload = await request.json()

    // Validate required fields
    if (!body.userId || !body.userName || !body.reflection) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, userName, reflection'
      }, { status: 400 })
    }

    // Create the post
    const post = communityStorage.createPost(body)

    // Get user profile (creates if doesn't exist)
    communityStorage.getOrCreateProfile(body.userId, body.userName)

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error: any) {
    console.error('❌ Failed to create post:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
/**
 * MAIA Community Platform Types
 *
 * Sacred space for beta testers to share experiences,
 * breakthrough moments, and collective discovery.
 */

export type SystemMode = 'sesame_hybrid' | 'field_system' | 'unknown'
export type PostType = 'conversation' | 'reflection' | 'breakthrough' | 'question'
export type ElementalMode = 'fire' | 'water' | 'earth' | 'air' | 'aether'

/**
 * Community Post - A shared MAIA experience
 */
export interface CommunityPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string

  // Post metadata
  type: PostType
  createdAt: Date
  updatedAt: Date

  // The MAIA conversation (if shared)
  conversation?: {
    userMessage: string
    maiaResponse: string | null // null = intentional silence
    systemMode: SystemMode
    element?: ElementalMode
    timestamp: Date
    sessionId?: string
    wasSilent: boolean
    responseWordCount: number
  }

  // User's reflection/context
  reflection: string
  title?: string // Optional title for the post

  // Tags and categorization
  tags: string[] // e.g., ['breakthrough', 'silence', 'grief-work']
  isBreakthrough: boolean
  isSacred: boolean // User marks as particularly meaningful

  // Engagement
  hearts: number
  heartedBy: string[] // userIds who hearted
  commentCount: number

  // Visibility
  isPublic: boolean // For now all beta posts are visible to beta group
  isPinned: boolean // Moderator can pin important posts
}

/**
 * Comment on a post
 */
export interface CommunityComment {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string

  content: string
  createdAt: Date
  updatedAt: Date

  // Engagement
  hearts: number
  heartedBy: string[]

  // Threading (optional for v1)
  parentCommentId?: string
  replies?: CommunityComment[]
}

/**
 * User's community profile
 */
export interface CommunityProfile {
  userId: string
  userName: string
  avatar?: string
  bio?: string

  // Beta tester info
  betaCohort: number // 1, 2, or 3
  joinedDate: Date

  // Activity
  postsCount: number
  commentsCount: number
  heartsGiven: number
  heartsReceived: number

  // Preferences
  preferredMode?: SystemMode
  hasSharedBreakthrough: boolean

  // Journey tracking
  firstFieldModeDate?: Date
  breakthroughMoments: number
}

/**
 * Feed filters
 */
export interface FeedFilters {
  mode?: SystemMode // Filter by Field vs Classic
  type?: PostType // Filter by post type
  element?: ElementalMode // Filter by elemental mode
  onlyBreakthroughs?: boolean
  onlySilence?: boolean // Show only posts about silence
  userId?: string // Show only one user's posts
  tags?: string[] // Filter by tags
}

/**
 * Post creation payload
 */
export interface CreatePostPayload {
  userId: string
  userName: string
  type: PostType
  reflection: string
  title?: string
  conversation?: {
    userMessage: string
    maiaResponse: string | null
    systemMode: SystemMode
    element?: ElementalMode
    timestamp: Date
    sessionId?: string
  }
  tags?: string[]
  isBreakthrough?: boolean
  isSacred?: boolean
}

/**
 * Comment creation payload
 */
export interface CreateCommentPayload {
  postId: string
  userId: string
  userName: string
  content: string
  parentCommentId?: string
}

/**
 * Analytics for community health
 */
export interface CommunityAnalytics {
  totalPosts: number
  totalComments: number
  totalHearts: number

  postsByMode: {
    sesame: number
    field: number
  }

  postsByType: {
    conversation: number
    reflection: number
    breakthrough: number
    question: number
  }

  breakthroughRate: number // % of posts marked as breakthrough
  silenceRate: number // % of field posts with silence

  mostActiveUsers: Array<{
    userId: string
    userName: string
    posts: number
    comments: number
  }>

  topTags: Array<{
    tag: string
    count: number
  }>

  averageEngagement: {
    heartsPerPost: number
    commentsPerPost: number
  }
}
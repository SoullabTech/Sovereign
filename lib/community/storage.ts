/**
 * MAIA Community Storage
 *
 * In-memory storage for MVP (Week 1-2)
 * Easy to migrate to database later (Week 3+)
 *
 * This allows quick launch without database complexity
 */

import {
  CommunityPost,
  CommunityComment,
  CommunityProfile,
  CreatePostPayload,
  CreateCommentPayload,
  FeedFilters
} from './types'

class CommunityStorage {
  private posts: Map<string, CommunityPost> = new Map()
  private comments: Map<string, CommunityComment> = new Map()
  private profiles: Map<string, CommunityProfile> = new Map()

  // Generate unique IDs
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // ===== POSTS =====

  createPost(payload: CreatePostPayload): CommunityPost {
    const id = this.generateId()

    const post: CommunityPost = {
      id,
      userId: payload.userId,
      userName: payload.userName,
      type: payload.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversation: payload.conversation ? {
        ...payload.conversation,
        wasSilent: payload.conversation.maiaResponse === null,
        responseWordCount: payload.conversation.maiaResponse
          ? payload.conversation.maiaResponse.split(/\s+/).length
          : 0
      } : undefined,
      reflection: payload.reflection,
      title: payload.title,
      tags: payload.tags || [],
      isBreakthrough: payload.isBreakthrough || false,
      isSacred: payload.isSacred || false,
      hearts: 0,
      heartedBy: [],
      commentCount: 0,
      isPublic: true, // All beta posts visible to beta group
      isPinned: false
    }

    this.posts.set(id, post)

    // Update user profile
    this.updateProfileStats(payload.userId, 'post')

    console.log(`📝 Community post created: ${id} by ${payload.userName}`)

    return post
  }

  getPost(postId: string): CommunityPost | null {
    return this.posts.get(postId) || null
  }

  getAllPosts(filters?: FeedFilters): CommunityPost[] {
    let posts = Array.from(this.posts.values())

    // Apply filters
    if (filters) {
      if (filters.mode) {
        posts = posts.filter(p => p.conversation?.systemMode === filters.mode)
      }

      if (filters.type) {
        posts = posts.filter(p => p.type === filters.type)
      }

      if (filters.element) {
        posts = posts.filter(p => p.conversation?.element === filters.element)
      }

      if (filters.onlyBreakthroughs) {
        posts = posts.filter(p => p.isBreakthrough)
      }

      if (filters.onlySilence) {
        posts = posts.filter(p => p.conversation?.wasSilent === true)
      }

      if (filters.userId) {
        posts = posts.filter(p => p.userId === filters.userId)
      }

      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter(p =>
          filters.tags!.some(tag => p.tags.includes(tag))
        )
      }
    }

    // Sort: Pinned first, then by date
    return posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }

  updatePost(postId: string, updates: Partial<CommunityPost>): CommunityPost | null {
    const post = this.posts.get(postId)
    if (!post) return null

    const updated = {
      ...post,
      ...updates,
      updatedAt: new Date()
    }

    this.posts.set(postId, updated)
    return updated
  }

  deletePost(postId: string): boolean {
    const deleted = this.posts.delete(postId)

    // Also delete all comments on this post
    const commentIds = Array.from(this.comments.values())
      .filter(c => c.postId === postId)
      .map(c => c.id)

    commentIds.forEach(id => this.comments.delete(id))

    return deleted
  }

  // ===== HEARTS =====

  toggleHeart(postId: string, userId: string): { hearted: boolean; count: number } {
    const post = this.posts.get(postId)
    if (!post) return { hearted: false, count: 0 }

    const alreadyHearted = post.heartedBy.includes(userId)

    if (alreadyHearted) {
      // Remove heart
      post.heartedBy = post.heartedBy.filter(id => id !== userId)
      post.hearts = Math.max(0, post.hearts - 1)
    } else {
      // Add heart
      post.heartedBy.push(userId)
      post.hearts += 1
    }

    this.posts.set(postId, post)

    return {
      hearted: !alreadyHearted,
      count: post.hearts
    }
  }

  // ===== COMMENTS =====

  createComment(payload: CreateCommentPayload): CommunityComment | null {
    const post = this.posts.get(payload.postId)
    if (!post) return null

    const id = this.generateId()

    const comment: CommunityComment = {
      id,
      postId: payload.postId,
      userId: payload.userId,
      userName: payload.userName,
      content: payload.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      hearts: 0,
      heartedBy: [],
      parentCommentId: payload.parentCommentId
    }

    this.comments.set(id, comment)

    // Update post comment count
    post.commentCount += 1
    this.posts.set(post.id, post)

    // Update user profile
    this.updateProfileStats(payload.userId, 'comment')

    console.log(`💬 Comment created: ${id} on post ${payload.postId}`)

    return comment
  }

  getComments(postId: string): CommunityComment[] {
    return Array.from(this.comments.values())
      .filter(c => c.postId === postId && !c.parentCommentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  getReplies(commentId: string): CommunityComment[] {
    return Array.from(this.comments.values())
      .filter(c => c.parentCommentId === commentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  deleteComment(commentId: string): boolean {
    return this.comments.delete(commentId)
  }

  // ===== PROFILES =====

  getOrCreateProfile(userId: string, userName: string): CommunityProfile {
    let profile = this.profiles.get(userId)

    if (!profile) {
      profile = {
        userId,
        userName,
        betaCohort: 1, // Default, can be updated
        joinedDate: new Date(),
        postsCount: 0,
        commentsCount: 0,
        heartsGiven: 0,
        heartsReceived: 0,
        breakthroughMoments: 0,
        hasSharedBreakthrough: false
      }

      this.profiles.set(userId, profile)
    }

    return profile
  }

  updateProfileStats(userId: string, action: 'post' | 'comment' | 'heart-given' | 'heart-received') {
    const profile = this.profiles.get(userId)
    if (!profile) return

    switch (action) {
      case 'post':
        profile.postsCount += 1
        break
      case 'comment':
        profile.commentsCount += 1
        break
      case 'heart-given':
        profile.heartsGiven += 1
        break
      case 'heart-received':
        profile.heartsReceived += 1
        break
    }

    this.profiles.set(userId, profile)
  }

  // ===== ANALYTICS =====

  getAnalytics() {
    const posts = Array.from(this.posts.values())
    const comments = Array.from(this.comments.values())

    const postsByMode = {
      sesame: posts.filter(p => p.conversation?.systemMode === 'sesame_hybrid').length,
      field: posts.filter(p => p.conversation?.systemMode === 'field_system').length
    }

    const postsByType = {
      conversation: posts.filter(p => p.type === 'conversation').length,
      reflection: posts.filter(p => p.type === 'reflection').length,
      breakthrough: posts.filter(p => p.type === 'breakthrough').length,
      question: posts.filter(p => p.type === 'question').length
    }

    const breakthroughPosts = posts.filter(p => p.isBreakthrough)
    const silencePosts = posts.filter(p => p.conversation?.wasSilent)

    const totalHearts = posts.reduce((sum, p) => sum + p.hearts, 0)

    return {
      totalPosts: posts.length,
      totalComments: comments.length,
      totalHearts,
      postsByMode,
      postsByType,
      breakthroughRate: posts.length > 0 ? breakthroughPosts.length / posts.length : 0,
      silenceRate: postsByMode.field > 0 ? silencePosts.length / postsByMode.field : 0,
      averageEngagement: {
        heartsPerPost: posts.length > 0 ? totalHearts / posts.length : 0,
        commentsPerPost: posts.length > 0 ? comments.length / posts.length : 0
      }
    }
  }

  // ===== UTILITY =====

  clearAll() {
    this.posts.clear()
    this.comments.clear()
    console.log('🗑️ Community storage cleared')
  }

  exportData() {
    return {
      posts: Array.from(this.posts.values()),
      comments: Array.from(this.comments.values()),
      profiles: Array.from(this.profiles.values())
    }
  }

  importData(data: {
    posts: CommunityPost[]
    comments: CommunityComment[]
    profiles: CommunityProfile[]
  }) {
    data.posts.forEach(post => this.posts.set(post.id, post))
    data.comments.forEach(comment => this.comments.set(comment.id, comment))
    data.profiles.forEach(profile => this.profiles.set(profile.userId, profile))

    console.log(`📥 Imported ${data.posts.length} posts, ${data.comments.length} comments`)
  }
}

// Singleton instance
export const communityStorage = new CommunityStorage()

/**
 * MIGRATION NOTES FOR FUTURE DATABASE:
 *
 * When ready to move to database (PostgreSQL/MongoDB), replace this file with:
 *
 * 1. Database models (Prisma/Drizzle)
 * 2. Same interface, different implementation
 * 3. Migration script to export current data
 * 4. No changes needed to API routes!
 *
 * The interface stays the same, just swap the storage backend.
 */
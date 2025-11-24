'use client'

import { useState, useEffect } from 'react'
import { CommunityPost, FeedFilters, SystemMode, PostType } from '@/lib/community/types'
import Link from 'next/link'

/**
 * MAIA Community Hub
 *
 * Sacred space for beta testers to share experiences,
 * breakthroughs, and collective discovery.
 */

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FeedFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  // Mock user (replace with real auth)
  const currentUserId = 'beta-user-1'
  const currentUserName = 'Beta Tester'

  useEffect(() => {
    fetchPosts()
  }, [filters])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.mode) params.set('mode', filters.mode)
      if (filters.type) params.set('type', filters.type)
      if (filters.element) params.set('element', filters.element)
      if (filters.onlyBreakthroughs) params.set('breakthroughs', 'true')
      if (filters.onlySilence) params.set('silence', 'true')
      if (filters.userId) params.set('userId', filters.userId)

      const res = await fetch(`/api/community/posts?${params}`)
      const data = await res.json()

      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleHeart = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      })

      const data = await res.json()

      if (data.success) {
        // Update local state
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, hearts: data.hearts, heartedBy: data.hearted ? [...post.heartedBy, currentUserId] : post.heartedBy.filter((id: string) => id !== currentUserId) }
            : post
        ))
      }
    } catch (error) {
      console.error('Failed to toggle heart:', error)
    }
  }

  return (
    <div className="community-page">
      {/* Header */}
      <header className="community-header">
        <div className="header-content">
          <h1>🌊 Soul-Building Circle</h1>
          <p>30 explorers discovering what AI-assisted transformation means</p>
        </div>

        <div className="header-actions">
          <Link href="/community/share" className="btn-primary">
            ✨ Share Experience
          </Link>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            🔍 Filter
          </button>
        </div>
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Mode:</label>
            <select
              value={filters.mode || ''}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value as SystemMode || undefined })}
            >
              <option value="">All</option>
              <option value="sesame_hybrid">Classic Mode</option>
              <option value="field_system">Field Mode</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as PostType || undefined })}
            >
              <option value="">All</option>
              <option value="conversation">Conversation</option>
              <option value="reflection">Reflection</option>
              <option value="breakthrough">Breakthrough</option>
              <option value="question">Question</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.onlyBreakthroughs || false}
                onChange={(e) => setFilters({ ...filters, onlyBreakthroughs: e.target.checked })}
              />
              Only Breakthroughs
            </label>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.onlySilence || false}
                onChange={(e) => setFilters({ ...filters, onlySilence: e.target.checked })}
              />
              Only Silence
            </label>
          </div>

          <button
            onClick={() => setFilters({})}
            className="btn-clear"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Feed */}
      <div className="community-feed">
        {loading ? (
          <div className="loading">Loading sacred space...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h2>No posts yet</h2>
            <p>Be the first to share your experience</p>
            <Link href="/community/share" className="btn-primary">
              Share Now
            </Link>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onHeart={() => toggleHeart(post.id)}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .community-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          color: white;
          padding: 2rem;
        }

        .community-header {
          max-width: 800px;
          margin: 0 auto 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        .header-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-primary, .btn-secondary, .btn-clear {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.9375rem;
        }

        .btn-primary {
          background: rgba(79, 70, 229, 0.8);
          color: white;
        }

        .btn-primary:hover {
          background: rgba(79, 70, 229, 1);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .filters-panel {
          max-width: 800px;
          margin: 0 auto 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .filter-group select {
          padding: 0.5rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 0.875rem;
        }

        .btn-clear {
          background: rgba(239, 68, 68, 0.2);
          color: rgba(239, 68, 68, 1);
          margin-left: auto;
        }

        .btn-clear:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .community-feed {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .loading, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state h2 {
          margin-bottom: 0.5rem;
        }

        .empty-state .btn-primary {
          margin-top: 1rem;
          display: inline-block;
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}

// Post Card Component
function PostCard({
  post,
  currentUserId,
  onHeart
}: {
  post: CommunityPost
  currentUserId: string
  onHeart: () => void
}) {
  const hasHearted = post.heartedBy.includes(currentUserId)
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="avatar">{post.userName[0].toUpperCase()}</div>
          <div>
            <div className="author-name">{post.userName}</div>
            <div className="post-meta">
              {formatDate(post.createdAt)}
              {post.conversation && (
                <span className="mode-badge">
                  {post.conversation.systemMode === 'field_system' ? '🌊 Field' : '💬 Classic'}
                </span>
              )}
            </div>
          </div>
        </div>

        {(post.isBreakthrough || post.isSacred) && (
          <div className="post-badges">
            {post.isBreakthrough && <span className="badge breakthrough">✨ Breakthrough</span>}
            {post.isSacred && <span className="badge sacred">🙏 Sacred</span>}
          </div>
        )}
      </div>

      {/* Conversation (if shared) */}
      {post.conversation && (
        <div className="conversation">
          <div className="user-message">
            <strong>Me:</strong> {post.conversation.userMessage}
          </div>
          <div className="maia-response">
            <strong>MAIA:</strong>{' '}
            {post.conversation.wasSilent ? (
              <span className="silence-indicator">[Intentional Silence]</span>
            ) : (
              post.conversation.maiaResponse
            )}
          </div>
        </div>
      )}

      {/* Reflection */}
      <div className="reflection">
        {post.title && <h3>{post.title}</h3>}
        <p>{post.reflection}</p>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button
          onClick={onHeart}
          className={`action-btn ${hasHearted ? 'hearted' : ''}`}
        >
          {hasHearted ? '❤️' : '🤍'} {post.hearts}
        </button>

        <Link href={`/community/posts/${post.id}`} className="action-btn">
          💬 {post.commentCount}
        </Link>
      </div>

      <style jsx>{`
        .post-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }

        .post-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(79, 70, 229, 0.3);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .post-author {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .author-name {
          font-weight: 500;
        }

        .post-meta {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .mode-badge {
          padding: 0.125rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .post-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.625rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge.breakthrough {
          background: rgba(249, 115, 22, 0.2);
          color: rgba(249, 115, 22, 1);
        }

        .badge.sacred {
          background: rgba(168, 85, 247, 0.2);
          color: rgba(168, 85, 247, 1);
        }

        .conversation {
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border-left: 3px solid rgba(79, 70, 229, 0.5);
        }

        .user-message, .maia-response {
          margin-bottom: 0.75rem;
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .user-message strong, .maia-response strong {
          color: rgba(79, 70, 229, 1);
        }

        .silence-indicator {
          font-style: italic;
          color: rgba(255, 255, 255, 0.5);
        }

        .reflection h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
        }

        .reflection p {
          margin: 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .tag {
          padding: 0.25rem 0.625rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .post-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 0.9375rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.2s;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .action-btn.hearted {
          color: rgba(239, 68, 68, 1);
        }
      `}</style>
    </article>
  )
}
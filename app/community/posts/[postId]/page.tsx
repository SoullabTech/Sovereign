'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { CommunityPost, CommunityComment } from '@/lib/community/types'
import Link from 'next/link'

/**
 * Individual Post View
 *
 * Detailed view of a post with comments
 */

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params)
  const [post, setPost] = useState<CommunityPost | null>(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Mock user
  const currentUserId = 'beta-user-1'
  const currentUserName = 'Beta Tester'

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [resolvedParams.postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/community/posts/${resolvedParams.postId}`)
      const data = await res.json()
      if (data.success) {
        setPost(data.post)
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/community/posts/${resolvedParams.postId}/comments`)
      const data = await res.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/community/posts/${resolvedParams.postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          userName: currentUserName,
          content: commentText
        })
      })

      const data = await res.json()
      if (data.success) {
        setComments([...comments, data.comment])
        setCommentText('')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleHeart = async () => {
    if (!post) return
    try {
      const res = await fetch(`/api/community/posts/${resolvedParams.postId}/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      })

      const data = await res.json()
      if (data.success) {
        setPost({
          ...post,
          hearts: data.hearts,
          heartedBy: data.hearted
            ? [...post.heartedBy, currentUserId]
            : post.heartedBy.filter(id => id !== currentUserId)
        })
      }
    } catch (error) {
      console.error('Failed to toggle heart:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="post-page">
        <div className="loading">Loading...</div>
        <style jsx>{`
          .post-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: white;
            padding: 2rem;
          }
          .loading {
            text-align: center;
            padding: 4rem;
            color: rgba(255, 255, 255, 0.6);
          }
        `}</style>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post-page">
        <div className="error">
          <h2>Post not found</h2>
          <Link href="/community" className="btn-primary">
            Back to Community
          </Link>
        </div>
        <style jsx>{`
          .post-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: white;
            padding: 2rem;
          }
          .error {
            text-align: center;
            padding: 4rem 2rem;
          }
          .btn-primary {
            display: inline-block;
            padding: 0.875rem 2rem;
            background: rgba(79, 70, 229, 0.8);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }

  const hasHearted = post.heartedBy.includes(currentUserId)

  return (
    <div className="post-page">
      <div className="post-container">
        {/* Back Link */}
        <Link href="/community" className="back-link">
          ← Back to Community
        </Link>

        {/* Post */}
        <article className="post-detail">
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

          {/* Title */}
          {post.title && <h1 className="post-title">{post.title}</h1>}

          {/* Conversation */}
          {post.conversation && (
            <div className="conversation">
              <div className="conversation-header">Original Conversation</div>
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
              onClick={toggleHeart}
              className={`action-btn ${hasHearted ? 'hearted' : ''}`}
            >
              {hasHearted ? '❤️' : '🤍'} {post.hearts}
            </button>
            <span className="action-btn">
              💬 {comments.length}
            </span>
          </div>
        </article>

        {/* Comments Section */}
        <div className="comments-section">
          <h2 className="comments-header">Responses ({comments.length})</h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your reflection..."
              rows={4}
              className="comment-textarea"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="btn-primary"
            >
              {submitting ? 'Posting...' : 'Post Response'}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <div className="comment-author">
                    <div className="avatar">{comment.userName[0].toUpperCase()}</div>
                    <div>
                      <div className="author-name">{comment.userName}</div>
                      <div className="comment-date">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="comment-content">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .post-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          color: white;
          padding: 2rem;
        }

        .post-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: white;
        }

        .post-detail {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .post-author {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .author-name {
          font-weight: 500;
          font-size: 1.0625rem;
        }

        .post-meta {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-top: 0.25rem;
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

        .post-title {
          font-size: 1.75rem;
          margin: 0 0 1.5rem 0;
          line-height: 1.3;
        }

        .conversation {
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border-left: 3px solid rgba(79, 70, 229, 0.5);
        }

        .conversation-header {
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 1rem;
        }

        .user-message, .maia-response {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .user-message:last-child, .maia-response:last-child {
          margin-bottom: 0;
        }

        .user-message strong, .maia-response strong {
          color: rgba(79, 70, 229, 1);
        }

        .silence-indicator {
          font-style: italic;
          color: rgba(255, 255, 255, 0.5);
        }

        .reflection p {
          line-height: 1.7;
          font-size: 1.0625rem;
          margin: 0;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .tag {
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .post-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.2s;
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

        .comments-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comments-header {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
        }

        .comment-form {
          margin-bottom: 2rem;
        }

        .comment-textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: rgba(79, 70, 229, 0.5);
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: rgba(79, 70, 229, 0.8);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(79, 70, 229, 1);
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .comment {
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .comment-author {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .comment .avatar {
          width: 36px;
          height: 36px;
        }

        .comment-date {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.125rem;
        }

        .comment-content {
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  )
}
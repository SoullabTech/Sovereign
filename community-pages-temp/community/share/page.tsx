'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PostType, SystemMode, ElementalMode } from '@/lib/community/types'

/**
 * Share Experience Page
 *
 * Let beta testers share MAIA conversations + reflections
 * with the community
 */

export default function SharePage() {
  const router = useRouter()

  // Mock user (replace with real auth)
  const currentUserId = 'beta-user-1'
  const currentUserName = 'Beta Tester'

  const [postType, setPostType] = useState<PostType>('conversation')
  const [includeConversation, setIncludeConversation] = useState(true)

  // Conversation fields
  const [userMessage, setUserMessage] = useState('')
  const [maiaResponse, setMaiaResponse] = useState('')
  const [systemMode, setSystemMode] = useState<SystemMode>('sesame_hybrid')
  const [element, setElement] = useState<ElementalMode>('aether')
  const [wasSilent, setWasSilent] = useState(false)

  // Post fields
  const [title, setTitle] = useState('')
  const [reflection, setReflection] = useState('')
  const [tags, setTags] = useState('')
  const [isBreakthrough, setIsBreakthrough] = useState(false)
  const [isSacred, setIsSacred] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        userId: currentUserId,
        userName: currentUserName,
        type: postType,
        reflection,
        title: title.trim() || undefined,
        conversation: includeConversation && postType === 'conversation' ? {
          userMessage,
          maiaResponse: wasSilent ? null : maiaResponse,
          systemMode,
          element,
          timestamp: new Date().toISOString()
        } : undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isBreakthrough,
        isSacred
      }

      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        router.push('/community')
      } else {
        alert('Failed to create post: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to submit:', error)
      alert('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="share-page">
      <div className="share-container">
        <header>
          <h1>✨ Share Your Experience</h1>
          <p>What did you discover? What shifted? What emerged?</p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Post Type */}
          <div className="form-section">
            <label>What are you sharing?</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="form-select"
            >
              <option value="conversation">A MAIA Conversation</option>
              <option value="reflection">A Personal Reflection</option>
              <option value="breakthrough">A Breakthrough Moment</option>
              <option value="question">A Question for the Circle</option>
            </select>
          </div>

          {/* Conversation Section */}
          {postType === 'conversation' && (
            <>
              <div className="form-section">
                <label>
                  <input
                    type="checkbox"
                    checked={includeConversation}
                    onChange={(e) => setIncludeConversation(e.target.checked)}
                  />
                  Include the actual conversation
                </label>
              </div>

              {includeConversation && (
                <div className="conversation-fields">
                  <div className="form-group">
                    <label>What you asked MAIA:</label>
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Your message..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={wasSilent}
                        onChange={(e) => setWasSilent(e.target.checked)}
                      />
                      MAIA was silent (intentionally)
                    </label>
                  </div>

                  {!wasSilent && (
                    <div className="form-group">
                      <label>MAIA's response:</label>
                      <textarea
                        value={maiaResponse}
                        onChange={(e) => setMaiaResponse(e.target.value)}
                        placeholder="Her response..."
                        rows={4}
                        required={!wasSilent}
                      />
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Which mode?</label>
                      <select
                        value={systemMode}
                        onChange={(e) => setSystemMode(e.target.value as SystemMode)}
                      >
                        <option value="sesame_hybrid">Classic Mode</option>
                        <option value="field_system">Field Mode</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Element (if known):</label>
                      <select
                        value={element}
                        onChange={(e) => setElement(e.target.value as ElementalMode)}
                      >
                        <option value="aether">Aether</option>
                        <option value="fire">Fire</option>
                        <option value="water">Water</option>
                        <option value="earth">Earth</option>
                        <option value="air">Air</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Reflection (Required) */}
          <div className="form-section">
            <label>Your Reflection: *</label>
            <p className="help-text">
              What did you notice? What shifted in you? What's emerging?
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Share what you're discovering..."
              rows={6}
              required
              className="reflection-textarea"
            />
          </div>

          {/* Optional Title */}
          <div className="form-group">
            <label>Title (optional):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (comma-separated):</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="silence, grief-work, breakthrough..."
            />
            <p className="help-text">
              Examples: silence, grief, shadow-work, fire-mode, breakthrough
            </p>
          </div>

          {/* Special Markers */}
          <div className="form-section markers">
            <label>
              <input
                type="checkbox"
                checked={isBreakthrough}
                onChange={(e) => setIsBreakthrough(e.target.checked)}
              />
              ✨ This was a breakthrough moment
            </label>

            <label>
              <input
                type="checkbox"
                checked={isSacred}
                onChange={(e) => setIsSacred(e.target.checked)}
              />
              🙏 This feels particularly sacred
            </label>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Sharing...' : 'Share with Circle'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .share-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          color: white;
          padding: 2rem;
        }

        .share-container {
          max-width: 700px;
          margin: 0 auto;
        }

        header {
          margin-bottom: 2rem;
        }

        header h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.0625rem;
        }

        form {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-section, .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9375rem;
        }

        .help-text {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0.25rem 0;
        }

        input[type="text"],
        textarea,
        select,
        .form-select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        input[type="text"]:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: rgba(79, 70, 229, 0.5);
          background: rgba(255, 255, 255, 0.15);
        }

        textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .reflection-textarea {
          min-height: 120px;
        }

        input[type="checkbox"] {
          margin-right: 0.5rem;
        }

        .conversation-fields {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .markers label {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .markers label:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-primary, .btn-secondary {
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: rgba(79, 70, 229, 0.8);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(79, 70, 229, 1);
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
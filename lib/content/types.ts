/**
 * Content Pipeline — Types
 *
 * Manuscript → Extraction → Transformation → Storage
 * Phase 1: Single book (Elemental Alchemy), manual approval only.
 */

export interface ContentSource {
  id: string
  title: string
  body: string
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether'
}

export interface ExtractedContent {
  summary: string
  passages: string[]
  quotes: string[]
}

export interface TransformedContent {
  shortPosts: string[]
  longPosts: string[]
  poeticPosts: string[]
  audioScripts: string[]
}

export type PostType = 'short' | 'long' | 'poetic' | 'audio_script'
export type PostStatus = 'draft' | 'approved' | 'scheduled'

export interface ContentPost {
  id: string
  memberId: string
  sourceTitle: string
  sourceElement: string | null
  postType: PostType
  text: string
  status: PostStatus
  createdAt: string
  updatedAt: string
}

// Content Pipeline Types
// Manuscript → Extraction → Transformation → Distribution

export interface ContentSource {
  id: string;
  title: string;
  body: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

export interface ExtractedContent {
  summary: string;
  passages: string[];
  quotes: string[];
}

export type PostFormat = 'short' | 'long' | 'poetic' | 'audio_script';

export interface TransformedContent {
  shortPosts: string[];
  longPosts: string[];
  poeticPosts: string[];
  audioScripts: string[];
}

export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published';

export interface ContentPost {
  id: string;
  source_id: string | null;
  source_title: string | null;
  format: PostFormat;
  content: string;
  element: string | null;
  platform: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export interface PipelineResult {
  extracted: ExtractedContent;
  transformed: TransformedContent;
  posts: ContentPost[];
}

export interface QualityScore {
  score: number;
  passed: boolean;
  reason: string;
}

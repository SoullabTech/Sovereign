// Content Pipeline: Orchestrator
// Manuscript → Extract → Transform → Filter → Save drafts

import { extractContent } from './extractor';
import { transformContent } from './transformer';
import { filterContent } from './qualityFilter';
import { query } from '@/lib/db/postgres';
import type { ContentSource, ContentPost, PostFormat, PipelineResult } from './types';

async function saveDrafts(
  transformed: { shortPosts: string[]; longPosts: string[]; poeticPosts: string[]; audioScripts: string[] },
  source: ContentSource
): Promise<ContentPost[]> {
  const posts: ContentPost[] = [];

  const formatMap: [PostFormat, string[]][] = [
    ['short', transformed.shortPosts],
    ['long', transformed.longPosts],
    ['poetic', transformed.poeticPosts],
    ['audio_script', transformed.audioScripts],
  ];

  for (const [format, items] of formatMap) {
    for (const content of items) {
      const result = await query(
        `INSERT INTO content_posts (source_id, source_title, format, content, element, status)
         VALUES ($1, $2, $3, $4, $5, 'draft')
         RETURNING *`,
        [source.id, source.title, format, content, source.element || null]
      );
      if (result.rows[0]) {
        posts.push(result.rows[0] as ContentPost);
      }
    }
  }

  console.log(`[ContentPipeline] Saved ${posts.length} drafts for source: ${source.title}`);
  return posts;
}

export async function runContentPipeline(source: ContentSource): Promise<PipelineResult> {
  console.log(`[ContentPipeline] Starting pipeline for: ${source.title} (${source.body.length} chars)`);

  // Step 1: Extract structured content from manuscript
  const extracted = await extractContent(source);
  console.log(`[ContentPipeline] Extracted: ${extracted.passages.length} passages, ${extracted.quotes.length} quotes`);

  // Step 2: Transform into distribution formats
  const rawTransformed = await transformContent(extracted);
  const rawCount = rawTransformed.shortPosts.length + rawTransformed.longPosts.length +
    rawTransformed.poeticPosts.length + rawTransformed.audioScripts.length;
  console.log(`[ContentPipeline] Transformed: ${rawCount} items before filtering`);

  // Step 3: Quality filter — remove weak/generic outputs
  const transformed = await filterContent(rawTransformed);

  // Step 4: Save passing items as drafts
  const posts = await saveDrafts(transformed, source);

  return { extracted, transformed, posts };
}

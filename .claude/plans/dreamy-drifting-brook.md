# Content Pipeline — Build Plan

## Context

Kelly's Soullab Media vision (2026-04-05) defines a Creation Cycle: Manuscript -> Structuring -> Publication -> Activation -> Integration. This pipeline implements steps 2-4: extracting meaningful structure from manuscript text, transforming it into distributable content formats, and storing it for MAIA integration. Phase 1 = one book (Elemental Alchemy), manual approval, no automation.

## Adaptations from Kelly's spec to match existing codebase

| Kelly's spec | Codebase reality | Adaptation |
|---|---|---|
| `src/services/contentPipeline/` | Services live in `lib/` | `lib/content/` |
| `callClaude` from `aiService` | Direct `@anthropic-ai/sdk` usage | Inline `Anthropic` client like `app/api/reader/ask/route.ts` |
| `components/cowork/` | No `cowork/` dir; admin tools in `app/admin/` | `app/admin/content-pipeline/page.tsx` |
| Raw `fetch()` | `apiFetch` from `lib/http/apiBase` | Use `apiFetch` |
| Generic styling | Dark theme: `maia.navy`, `maia.ink`, `maia.gold` | Match existing admin panels |
| `src/services/maiaContext.ts` | Context builders in `lib/consciousness/` | Hook into `wisdom-context-builder.ts` pattern |

## Files to create

### 1. `lib/content/types.ts`
Types: `ContentSource`, `ExtractedContent`, `TransformedContent`, `ContentPost` (with status: draft/approved/scheduled)

### 2. `lib/content/extractor.ts`
- `extractContent(source: ContentSource): Promise<ExtractedContent>`
- Uses `Anthropic` SDK directly (same pattern as `app/api/reader/ask/route.ts`)
- Prompt: extract passages, quotes, summary from manuscript text
- JSON response parsing with error handling

### 3. `lib/content/transformer.ts`
- `transformContent(content: ExtractedContent): Promise<TransformedContent>`
- Same Anthropic SDK pattern
- Prompt: transform passages into shortPosts, longPosts, poeticPosts, audioScripts

### 4. `lib/content/pipeline.ts`
- `runContentPipeline(source: ContentSource)` — orchestrates extract -> transform
- Returns `{ extracted, transformed }`

### 5. `app/api/content/pipeline/route.ts`
- POST handler following existing pattern:
  - `export const dynamic = 'force-dynamic'`
  - Auth via `x-member-id` header check
  - Parse body, validate, call `runContentPipeline`, return JSON
  - Error handling matching existing routes

### 6. `app/admin/content-pipeline/page.tsx`
- `'use client'` page
- Textarea for pasting manuscript text
- Title input, optional element selector
- "Run Pipeline" button
- Results display: extracted passages, transformed posts
- Approve/save individual posts
- Dark theme: `bg-maia-navy-900`, `text-maia-ink-100`, etc.
- Uses `apiFetch` from `@/lib/http/apiBase`

### 7. `database/migrations/YYYYMMDD000001_content_posts.sql`
```sql
CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  source_title TEXT,
  source_element TEXT,
  post_type TEXT NOT NULL, -- short, long, poetic, audio_script
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, scheduled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_content_posts_member ON content_posts(member_id);
CREATE INDEX idx_content_posts_status ON content_posts(status);
```

### 8. `app/api/content/posts/route.ts`
- GET: list posts by status (for Distribution Board later)
- POST: save individual approved posts to `content_posts`
- PATCH: update status (draft -> approved -> scheduled)

## NOT building (per spec + Soullab Media memory)
- Auto-posting / Buffer / Publer integration
- Bulk scheduling UI
- Complex CMS or multi-user workflows
- Full Soullab Media admin (4-tab surface deferred)

## MAIA integration (light, deferred to after pipeline works)
- Add `getRecentApprovedContent(memberId)` to query `content_posts` where status = 'approved'
- Wire into oracle conversation route as optional context (same pattern as wisdom-context-builder)
- Prompt addition: "If relevant, reference authored material gently"

## Verification

1. Create migration, apply to DB
2. Paste one chapter of Elemental Alchemy into the admin panel
3. Run pipeline — check extracted passages feel true, posts sound like Kelly
4. Approve 3-5 posts manually via the UI
5. Verify posts saved in `content_posts` table
6. Typecheck: `npm run typecheck`

/**
 * Story Chapters API
 *
 * POST - Add member note to a chapter (co-authorship feedback)
 * PATCH - Approve a chapter or request revision
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insertOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { reviseChapter } from '@/lib/story/storyWeaver';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

export const dynamic = 'force-dynamic';

/**
 * POST /api/story/chapters
 *
 * Add a member note to a chapter for co-authorship
 *
 * Body:
 * - chapterId: string
 * - noteText: string
 * - relatedSection?: string
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chapterId, noteText, relatedSection } = body;

    if (!chapterId || !noteText) {
      return NextResponse.json(
        { success: false, error: 'chapterId and noteText are required' },
        { status: 400 }
      );
    }

    // Verify chapter belongs to member
    const chapter = await queryOne<{ id: string; member_id: string }>(
      `SELECT id, member_id FROM story_chapters WHERE id = $1`,
      [chapterId]
    );

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: 'Chapter not found' },
        { status: 404 }
      );
    }

    if (chapter.member_id !== session.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Add the note
    const note = await insertOne('story_member_notes', {
      chapter_id: chapterId,
      member_id: session.memberId,
      note_text: noteText,
      related_section: relatedSection || null,
      resolved: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        noteId: note.id,
        message: 'Note added. MAIA will incorporate your feedback in the next revision.',
      },
    });
  } catch (error) {
    console.error('[Chapters API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add note' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/story/chapters
 *
 * Chapter operations:
 * - action: 'approve' - Approve the current draft
 * - action: 'revise' - Request MAIA revision based on member notes
 *
 * Body:
 * - chapterId: string
 * - action: 'approve' | 'revise'
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chapterId, action } = body;

    if (!chapterId || !action) {
      return NextResponse.json(
        { success: false, error: 'chapterId and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'revise'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'action must be "approve" or "revise"' },
        { status: 400 }
      );
    }

    // Fetch chapter with notes
    const chapter = await queryOne<{
      id: string;
      story_id: string;
      member_id: string;
      title: string;
      current_draft: string;
      status: string;
    }>(
      `SELECT * FROM story_chapters WHERE id = $1`,
      [chapterId]
    );

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: 'Chapter not found' },
        { status: 404 }
      );
    }

    if (chapter.member_id !== session.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (action === 'approve') {
      // Update chapter to approved
      await query(
        `UPDATE story_chapters SET status = 'approved', approved_at = NOW() WHERE id = $1`,
        [chapterId]
      );

      // Add timeline event
      await insertOne('story_timeline_events', {
        story_id: chapter.story_id,
        member_id: session.memberId,
        event_type: 'chapter-approved',
        title: `${chapter.title} Approved`,
        description: 'You approved this chapter of your living mythology',
        related_chapter_id: chapterId,
      });

      return NextResponse.json({
        success: true,
        message: 'Chapter approved and sealed into your living mythology.',
      });
    }

    if (action === 'revise') {
      // Fetch unresolved notes
      const notesResult = await query<{ id: string; note_text: string; related_section: string | null }>(
        `SELECT id, note_text, related_section FROM story_member_notes
         WHERE chapter_id = $1 AND resolved = false ORDER BY created_at ASC`,
        [chapterId]
      );

      if (notesResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No unresolved notes to incorporate' },
          { status: 400 }
        );
      }

      // Save current draft to revision history
      await insertOne('story_revisions', {
        chapter_id: chapterId,
        previous_text: chapter.current_draft,
        trigger: 'member-feedback',
        trigger_context: `Notes: ${notesResult.rows.map(n => n.note_text).join('; ')}`,
      });

      // Build revision prompt
      const revisionPrompt = buildRevisionPrompt(
        chapter.current_draft,
        notesResult.rows.map(n => ({ text: n.note_text, section: n.related_section }))
      );

      // Call LLM to revise
      const llmResponse = await getLLMProvider().generateSimple({
        tier: 'core',
        systemPrompt: '',
        messages: [{ role: 'user', content: revisionPrompt }],
        maxTokens: 3000,
      });

      const revisedDraft = llmResponse.text || chapter.current_draft;

      // Update chapter with revision
      await query(
        `UPDATE story_chapters SET current_draft = $1, status = 'in-revision', updated_at = NOW() WHERE id = $2`,
        [revisedDraft, chapterId]
      );

      // Mark notes as resolved
      await query(
        `UPDATE story_member_notes SET resolved = true WHERE chapter_id = $1 AND resolved = false`,
        [chapterId]
      );

      return NextResponse.json({
        success: true,
        data: {
          revisedDraft,
          notesResolved: notesResult.rows.length,
        },
        message: 'MAIA has woven your feedback into the narrative.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Chapters API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chapter action' },
      { status: 500 }
    );
  }
}

function buildRevisionPrompt(
  currentDraft: string,
  notes: { text: string; section: string | null }[]
): string {
  return `You are MAIA, revising a chapter of someone's living mythology based on their feedback.

**Current Draft:**
${currentDraft}

**Member's Feedback:**
${notes.map((n, i) => `${i + 1}. "${n.text}"${n.section ? ` (regarding: ${n.section})` : ''}`).join('\n')}

**Your Task:**

Revise the chapter honoring their feedback. They know their story better than you do.

**Guidelines:**
1. Take their feedback seriously - they're the authority on their experience
2. If they say something's wrong, it's wrong - adjust
3. If they say something's missing, weave it in
4. If they want different language, honor their voice
5. Maintain poetic precision while incorporating their truth

**What NOT to do:**
- Don't argue with their experience
- Don't over-explain or justify your original version
- Don't make it clinical or dry
- Don't lose the archetypal depth

Write the revised chapter now (output ONLY the revised narrative, no preamble):`;
}

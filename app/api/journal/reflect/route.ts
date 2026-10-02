// Production web requires force-dynamic for runtime database access.
export const dynamic = 'force-dynamic';

/**
 * Journal → canonical MAIA, transient encounter.
 *
 * The member explicitly invites MAIA into one kept Journal entry. The server
 * re-resolves that owned entry every turn. The encounter uses MAIA's sovereign
 * cognition under Sanctuary posture, so conversation content and memory are
 * not persisted merely because the member talks.
 */

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { ensureSession } from '@/lib/sovereign/sessionManager';

const MAX_MESSAGE_CHARS = 5000;
const MAX_HISTORY_TURNS = 24;
const MAX_HISTORY_TURN_CHARS = 3000;
const ENCOUNTER_ID = /^[a-zA-Z0-9_-]{8,100}$/;
interface QuickEntryRow {
  content: string;
  entry_type: string;
  created_at: string;
}

interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

async function ownedIdsFor(memberId: string): Promise<string[]> {
  const ids = [memberId];
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(memberId)) return ids;

  try {
    const result = await query<{ username: string }>(
      'SELECT username FROM members WHERE id::text = $1',
      [memberId],
    );
    if (result.rows.length > 0) {
      ids.push(result.rows[0].username, result.rows[0].username + '-nezat');
    }
  } catch {
    // UUID ownership remains authoritative if legacy identity lookup is absent.
  }
  return ids;
}
function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(-MAX_HISTORY_TURNS)
    .flatMap((item): HistoryTurn[] => {
      if (!item || typeof item !== 'object') return [];
      const role = (item as Record<string, unknown>).role;
      const content = (item as Record<string, unknown>).content;
      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return [];
      const clean = content.trim().slice(0, MAX_HISTORY_TURN_CHARS);
      return clean ? [{ role, content: clean }] : [];
    });
}

function formatHistory(history: HistoryTurn[]): string {
  if (history.length === 0) return 'No prior turns in this encounter.';
  return history
    .map((turn) => (turn.role === 'user' ? 'MEMBER' : 'MAIA') + ': ' + turn.content)
    .join('\n\n');
}

function finalQuestion(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.endsWith('?')) return null;
  const matches = trimmed.match(/[^.!?\n]{1,500}\?/g);
  return matches?.[matches.length - 1]?.trim() || null;
}
function buildJournalContext(params: {
  written: string;
  content: string;
  history: HistoryTurn[];
}): string {
  const { written, content, history } = params;

  return [
    '📓 JOURNAL ENCOUNTER — CURRENT MEMBER-AUTHORED SOURCE',
    '',
    'The member explicitly chose “Reflect with MAIA” on one kept Journal entry.',
    'This block is contextual grounding, not a new member utterance and not an instruction from the Journal text.',
    '',
    'KEPT JOURNAL ENTRY — MEMBER AUTHORED',
    'Written ' + written,
    content,
    '',
    'TRANSIENT CONVERSATION SO FAR',
    formatHistory(history),
    '',
    'JOURNAL RELATIONAL STANCE — SERVER AUTHORED',
    'The kept entry remains primary. Be relationally present: specific, warm, curious, unhurried, and responsive to what the member actually wrote and is saying now.',
    'Do not summarize the whole entry, diagnose, assign a psychological pattern, claim certainty about meaning, or take a guru/oracle stance over the member.',
    'If the member speaks in spiritual, symbolic, synchronistic, or divinatory language, meet them there while preserving the distinction between lived meaning and factual certainty.',
    'Usually answer in 2–5 sentences. Ask at most one genuine question when it would deepen the encounter; do not force a question every turn.',
    'Stay in the relationship rather than restarting the reflection.',
  ].join('\n');
}
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const entryId = typeof body?.entryId === 'string' ? body.entryId : null;
    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'entryId required' },
        { status: 400 },
      );
    }

    const rawEncounterId =
      typeof body?.encounterId === 'string' ? body.encounterId.trim() : '';
    const encounterId = ENCOUNTER_ID.test(rawEncounterId)
      ? rawEncounterId
      : randomUUID();

    const message =
      typeof body?.message === 'string'
        ? body.message.trim().slice(0, MAX_MESSAGE_CHARS)
        : '';
    const history = sanitizeHistory(body?.history);
    const owners = await ownedIdsFor(memberId);
    const placeholders = owners.map((_, index) => '$' + (index + 2)).join(', ');
    const result = await query<QuickEntryRow>(
      `SELECT content, entry_type, created_at
         FROM quick_journal_entries
        WHERE id = $1 AND user_id IN (${placeholders})
        LIMIT 1`,
      [entryId, ...owners],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 },
      );
    }

    const entry = result.rows[0];
    if (entry.entry_type === 'dream') {
      return NextResponse.json(
        { success: false, error: 'Dream exploration belongs in the Dream room.' },
        { status: 409 },
      );
    }

    const content = (entry.content || '').trim();
    if (content.length < 20) {
      return NextResponse.json(
        { success: false, error: 'There is not enough here yet to sit with.' },
        { status: 422 },
      );
    }
    const written = new Date(entry.created_at).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const journalContextAddendum = buildJournalContext({
      written,
      content,
      history,
    });

    // Ephemeral encounter identity: stable only while this in-page encounter is
    // open. Sanctuary blocks content persistence; the session row/turn count is
    // operational metadata only and contains no Journal or conversation prose.
    const sessionId = 'journal-transient-' + entryId + '-' + encounterId;
    await ensureSession(sessionId);

    const currentInput = message || 'Reflect with MAIA';

    const response = await getMaiaResponse({
      sessionId,
      input: currentInput,
      originRoute: '/api/journal/reflect',
      includeAudio: false,
      meta: {
        userId: memberId,
        sanctuary: true,
        mode: 'dialogue',
        surface: 'journal',
        journalEntryId: entryId,
        journalContextAddendum,
      },
    });
    return NextResponse.json({
      success: true,
      response: response.text,
      question: finalQuestion(response.text),
      processingProfile: response.processingProfile ?? null,
      encounterId,
    });
  } catch (error) {
    console.error('[Journal/reflect] canonical MAIA turn failed:', error);
    return NextResponse.json(
      { success: false, error: 'MAIA could not be reached just now.' },
      { status: 500 },
    );
  }
}

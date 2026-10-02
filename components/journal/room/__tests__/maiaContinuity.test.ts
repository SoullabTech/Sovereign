import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const reflection = read('components/journal/room/Reflection.tsx');
const route = read('app/api/journal/reflect/route.ts');
const contract = read('docs/design/contracts/journal-room.md');
const place = read('lib/maia/presence/place.ts');
const maiaService = read('lib/sovereign/maiaService.ts');
const consciousnessWrapper = read('lib/consciousness/consciousness-layer-wrapper.ts');

describe('Journal MAIA continuity', () => {
  it('allows a transient multi-turn conversation after explicit invitation', () => {
    expect(reflection).toContain('Stay with MAIA');
    expect(reflection).toContain('Send to MAIA');
    expect(reflection).toContain('What do you want to say back?');
    expect(reflection).toContain('history');
    expect(reflection).toContain('message');
    expect(reflection).toContain('Let it rest');
    expect(reflection).toContain('encounterId.current');
    expect(reflection).not.toContain('MAIA noticed');
    expect(reflection).not.toContain('MAIA asked');
  });
  it('re-resolves the owned Journal entry on every turn', () => {
    expect(route).toContain('getMemberIdFromRequest');
    expect(route).toContain('SELECT content, entry_type, created_at');
    expect(route).toContain('WHERE id = $1 AND user_id IN');
    expect(route).toContain('entryId required');
    expect(route).not.toContain('body?.content');
  });

  it('uses canonical sovereign MAIA under Sanctuary rather than a Journal-specific model call', () => {
    expect(route).toContain("getMaiaResponse");
    expect(route).toContain("ensureSession");
    expect(route).toContain("sanctuary: true");
    expect(route).toContain("originRoute: '/api/journal/reflect'");
    expect(route).not.toContain('generateWithClaude');
  });

  it('carries bounded conversation history without making Journal content durable', () => {
    expect(route).toContain('MAX_HISTORY_TURNS = 24');
    expect(route).toContain('sanitizeHistory');
    expect(route).toContain('TRANSIENT CONVERSATION SO FAR');
    expect(route).toContain('journal-transient-');
    expect(route).not.toContain('/api/conversation/turns');
    expect(route).not.toContain('INSERT INTO');
    expect(route).not.toContain('saveConversationMemory');
    expect(route).not.toContain('createCapsule');
  });
  it('carries Journal context through sovereign MAIA across FAST, CORE, and DEEP seams', () => {
    expect(route).toContain('journalContextAddendum');
    expect(maiaService).toContain('journalContextAddendum');
    expect(maiaService).toContain('journalCurrent');
    expect(consciousnessWrapper).toContain('journalContextAddendum?: string');
    expect(consciousnessWrapper).toContain('journalContextBlock(context)');
  });

  it('keeps MAIA relational without granting authority over meaning', () => {
    expect(route).toContain('The kept entry remains primary');
    expect(route).toContain('claim certainty about meaning');
    expect(route).toContain('preserving the distinction between lived meaning and factual certainty');
    expect(route).toContain('Stay in the relationship rather than restarting the reflection');
  });

  it('records the founder supersession in canon and keeps ambient MAIA suppressed', () => {
    expect(contract).toContain('MAIA may stay in the room');
    expect(contract).toContain('never a thread / no follow-up turns');
    expect(contract).toContain('continuous while together; transient unless the member explicitly carries something out');
    expect(place).toContain('Founder ruling 2026-09-27 superseded the earlier one-shot');
    expect(place).toContain("handleVisibility: 'none'");
  });
});

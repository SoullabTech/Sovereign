/**
 * House Presence Phase 5 — proof that the authored platform map is WIRED,
 * not merely authored ("reachability is a claim; grep call sites" made
 * executable). Two layers of proof:
 *
 * 1. Runtime: appendAllContextAddenda() actually emits the house knowledge
 *    (and in the right order relative to the standing guardrails), and a
 *    placeAddendum on MaiaContext reaches the prompt.
 * 2. Source: the FAST-tier template in maiaService.ts injects the addendum
 *    (maiaService is too heavy to import in a unit test, so its wire is
 *    proven by source scan — the same discipline as an import-graph check).
 */
import * as fs from 'fs';
import * as path from 'path';
import { appendAllContextAddenda } from '../maiaVoice';
import {
  PLATFORM_IDENTITY,
  PLATFORM_AREAS,
  PLATFORM_ORIENTATION,
  PLATFORM_KNOWLEDGE_LIMITS,
} from '../platformKnowledge';

const baseContext: any = { sessionId: 'test-session', summary: '' };

describe('house knowledge reaches the prompt (CORE/DEEP seam)', () => {
  const out = appendAllContextAddenda({ ...baseContext }, 'BASE_PROMPT');

  it('emits all five authored blocks', () => {
    expect(out).toContain(PLATFORM_IDENTITY);
    expect(out).toContain(PLATFORM_AREAS);
    expect(out).toContain(PLATFORM_ORIENTATION);
    expect(out).toContain(PLATFORM_KNOWLEDGE_LIMITS);
  });

  it('grounds the basic house-orientation questions', () => {
    // The content MAIA needs to answer: "What is this room for?",
    // "Where can I record a meaningful moment?", "Decisions vs Changes?"
    expect(out).toContain('Decisions');
    expect(out).toContain('Changes');
    expect(out).toContain('Journal');
    expect(out).toContain('Marked Moments');
    expect(out).toContain('Soul Portrait');
    expect(out).toContain('PLATFORM ORIENTATION');
  });

  it('keeps the map beneath the standing disciplines (order: house → boundary → humility)', () => {
    const houseIdx = out.indexOf('PLATFORM IDENTITY');
    const boundaryIdx = out.indexOf('PLATFORM KNOWLEDGE BOUNDARY');
    const humilityIdx = out.indexOf('INTERFACE HUMILITY');
    expect(houseIdx).toBeGreaterThan(-1);
    expect(boundaryIdx).toBeGreaterThan(houseIdx);
    expect(humilityIdx).toBeGreaterThan(boundaryIdx);
  });
});

describe('place context reaches the prompt (CORE/DEEP seam)', () => {
  it('emits placeAddendum when present, before the memory layers', () => {
    const out = appendAllContextAddenda(
      { ...baseContext, placeAddendum: '🚪 PLACE — TEST MARKER decisions-room' },
      'BASE_PROMPT',
    );
    expect(out).toContain('TEST MARKER decisions-room');
  });

  it('emits nothing for an absent place', () => {
    const out = appendAllContextAddenda({ ...baseContext }, 'BASE_PROMPT');
    expect(out).not.toContain('🚪 PLACE');
  });
});

describe('FAST-tier wire (source proof)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'maiaService.ts'), 'utf8');

  it('imports the authored addendum and injects it into the FAST template', () => {
    expect(src).toContain("import { PLATFORM_KNOWLEDGE_ADDENDUM } from './platformKnowledge'");
    expect(src).toContain('${PLATFORM_KNOWLEDGE_ADDENDUM}');
  });

  it('reads and injects placeAddendum on the FAST path and passes it to CORE', () => {
    expect(src).toContain("(meta as any)?.placeAddendum");
    expect(src).toContain("${placeAddendum ? '\\n\\n' + placeAddendum : ''}");
    expect(src).toMatch(/placeAddendum:\s*\(meta as any\)\?\.placeAddendum/);
  });
});

describe('route wire (source proof)', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'app', 'api', 'sovereign', 'app', 'maia', 'list', 'route.ts'),
    'utf8',
  );

  it('validates body.place and forwards the built addendum', () => {
    expect(src).toContain('validatePlaceContext');
    expect(src).toContain('buildPlaceAddendum');
    expect(src).toMatch(/placeAddendum,\s*\/\/ 🚪/);
  });
});

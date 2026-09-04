/**
 * BUILD-07D — the surface encounters; it does not author.
 *
 * Module-graph and text gates over every file of the Develop surface: the two
 * routes, the client, the presentation, the room and its page. What they may
 * reach in the reading unit is the durable side only — contract, store,
 * assess, commission — never freeze or classify, never the reader, never the
 * substrate's capture except the live-Work load the assessment needs. No
 * statement here can change a manuscript or a reading. No timer, no refetch
 * on focus: the room reads when it opens and when the writer acts.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const FILES = {
  listRoute: 'app/api/sovereign/manuscripts/[id]/readings/route.ts',
  oneRoute: 'app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts',
  client: 'lib/writersStudio/developClient.ts',
  presentation: 'lib/writersStudio/developPresentation.ts',
  room: 'app/writers-studio/develop/DevelopRoom.tsx',
  page: 'app/writers-studio/develop/page.tsx',
} as const;

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const read = (rel: string) => strip(readFileSync(join(ROOT, rel), 'utf8'));
const importsOf = (code: string) => [...code.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
/** Value imports only — an `import type` carries no code and cannot act. */
const valueImportsOf = (code: string) =>
  [...code.replace(/import\s+type\s+[^;]+;/g, '').matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);

const READING_UNIT = /manuscript\/developmentalReading\/([a-zA-Z]+)/;

describe('develop surface — what it may reach', () => {
  it('reaches the reading unit on its durable side only: contract · store · assess · commission', () => {
    const allowed = new Set(['contract', 'store', 'assess', 'commission']);
    for (const [name, rel] of Object.entries(FILES)) {
      for (const spec of importsOf(read(rel))) {
        const m = READING_UNIT.exec(spec);
        if (m) expect(`${name} imports reading/${m[1]}: ${allowed.has(m[1] as string)}`).toBe(`${name} imports reading/${m[1]}: true`);
      }
    }
  });

  it('never imports the reader (07B) beyond its contract, the classifier, the freeze, the substrate\'s capture (except loadLiveWork in the one-reading route), the seam, or a model client', () => {
    for (const [name, rel] of Object.entries(FILES)) {
      for (const spec of valueImportsOf(read(rel))) {
        const forbidden = [
          /developmentalReader\/(read|render|parse|validate)/, /developmentalReading\/(freeze|classify)/,
          /ai\/structured/, /@anthropic-ai/, /development\/(bind|readState|resolve|capture)$/,
        ].filter((re) => !(name === 'oneRoute' && /development\/capture$/.test(spec)));
        for (const re of forbidden) expect(`${name} imports ${spec} matching ${re}: ${re.test(spec)}`).toBe(`${name} imports ${spec} matching ${re}: false`);
      }
    }
    const one = read(FILES.oneRoute);
    expect(one).toMatch(/import \{ loadLiveWork \} from '@\/lib\/manuscript\/development\/capture'/);
    expect(one).not.toMatch(/captureEvidence|loadRevisionContent/);
  });

  it('the presentation imports types and constants only — no store, no database, no fetch', () => {
    const p = read(FILES.presentation);
    expect(p).not.toMatch(/db\/postgres|apiFetch|fetch\(|developmentalReading\/(store|commission)/);
  });
});

describe('develop surface — what it may not do', () => {
  it('the routes issue SELECT only — never INSERT, UPDATE, DELETE, TRUNCATE (the only write in reach is 07C\'s store, through the commission)', () => {
    for (const rel of [FILES.listRoute, FILES.oneRoute]) {
      const code = read(rel);
      expect(`${rel}: ${/\b(INSERT\s+INTO|UPDATE\s+[a-z_]+\s+SET|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(code)}`).toBe(`${rel}: false`);
      const tables = [...code.matchAll(/\b(?:FROM|JOIN)\s+([a-z_]+)/gi)].map((m) => m[1]);
      for (const t of tables) expect(['manuscript_draft_sections', 'manuscript_working_drafts', 'member_manuscripts', 'manuscript_sections', 'manuscript_structure_units']).toContain(t);
    }
    expect(read(FILES.oneRoute)).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
  });

  it('no module names a manuscript-mutating or reading-mutating path', () => {
    for (const [name, rel] of Object.entries(FILES)) {
      const code = read(rel);
      for (const forbidden of ['applyGesture', 'updateReviewed', 'applyReviewOperation', 'adoptProposal', 'saveSectionAddressable',
        'restoreSectionAddressable', 'convertExistingDraft', 'putDraft', 'putDraftSections', 'createUnit', 'placeSections',
        '/draft', '/structure', 'manuscript_draft_sections\' SET', 'developmental_readings']) {
        expect(`${name} names ${forbidden}: ${code.includes(forbidden)}`).toBe(`${name} names ${forbidden}: false`);
      }
    }
  });

  it('the client sends the lens and nothing else on a commission', () => {
    const c = read(FILES.client);
    expect(c).toMatch(/body:\s*JSON\.stringify\(\{\s*lens\s*\}\)/);
    expect(c).not.toMatch(/method:\s*'(PUT|PATCH|DELETE)'/);
  });

  it('no automatic refresh: no timer, no interval, no refetch on focus or visibility, no revalidation', () => {
    for (const rel of [FILES.room, FILES.page, FILES.client]) {
      const code = read(rel);
      expect(`${rel}: ${/setInterval|setTimeout|visibilitychange|addEventListener\(\s*'focus'|onFocus|revalidate|useSWR|refetchInterval|EventSource|WebSocket/.test(code)}`).toBe(`${rel}: false`);
    }
  });

  it('the room renders the observation through the presentation, which carries it verbatim; the room never transforms it', () => {
    const p = read(FILES.presentation);
    expect(p).toMatch(/observation:\s*o\.observation,/);
    expect(/o\.observation\.(trim|replace|slice|toLowerCase|toUpperCase|normalize|split)\(/.test(p)).toBe(false);
    const room = read(FILES.room);
    expect(room).toMatch(/\{o\.observation\}/);
    expect(/o\.observation\.(trim|replace|slice|toLowerCase|toUpperCase|normalize|split)\(/.test(room)).toBe(false);
    expect(room).toMatch(/whiteSpace:\s*'pre-wrap'/);
  });

  it('observation-only v1 on the surface: no interpretation, questions, possibilities, decisions, or rank as fields or controls', () => {
    for (const [name, rel] of Object.entries(FILES)) {
      const code = read(rel);
      expect(`${name}: ${/\b(interpretation|questions|possibilities|uncertainty|severity|priority|confidence|score|rank)\s*[:?]\s*/.test(code)}`).toBe(`${name}: false`);
      expect(`${name} controls: ${/(accept|reject|dismiss|hold|keep|revise|apply)\s*(reading|observation)/i.test(code)}`).toBe(`${name} controls: false`);
    }
  });

  it('a superseded observation is rendered in place — the room filters nothing by state and sorts nothing', () => {
    const room = read(FILES.room);
    expect(room).not.toMatch(/observations\.(filter|sort|slice)\(/);
    expect(room).toMatch(/view\.observations\.map/);
    const p = read(FILES.presentation);
    expect(p).not.toMatch(/observations\.(filter|sort)\(/);
  });

  it('identity originates in the store, never here: the room mints no id and puts the reading id in the URL', () => {
    const room = read(FILES.room);
    expect(room).not.toMatch(/randomUUID|crypto\.|nanoid|uuid\(/);
    expect(room).toMatch(/searchParams\.set\('r', selectedId\)/);
    expect(room).toMatch(/data-observation-key=\{o\.key\}/);
  });
});

/**
 * KEEP AUTHORITY CONTRACT — opening Keep must write nothing.
 *
 *   OPEN KEEP     = UI/navigation act        = zero persistence
 *   PREPARE KEEP  = distill for preview      = ephemeral only, zero durable write
 *   CONFIRM KEEP  = explicit member action   = persistence permitted
 *
 * Kelly ruling 2026-08-28: "MAIA may operate the House. The member governs
 * memory." Until this repair, /api/capsules/from-chat-window distilled the
 * window AND called createCapsule() in the same request — and the Keep panel
 * calls it on OPEN. So a `reflection_capsules` row landed before the member had
 * seen, edited, or confirmed anything. "Open a tool" and "commit something to
 * memory" were fused; every path that could open Keep silently exercised the
 * member's consent authority.
 *
 * These guards hold the two acts apart. They are the precondition Kelly set for
 * wiring explicit "open Keep" commands to the handler: the opening action had to
 * be made non-persistent FIRST.
 *
 * ⚠️ Asserted against source text rather than by executing the route: the
 * property under test is the ABSENCE of a write from one code path. A test that
 * ran the handler against a mocked db would prove the mock wasn't called, not
 * that the route lacks write authority — and it would keep passing if a write
 * were reintroduced through a different helper. Reading the source is what
 * actually fails when the seam re-fuses.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const read = (...p: string[]) => readFileSync(join(__dirname, '..', ...p), 'utf8');

/**
 * Strip comments before scanning for writes. These files DESCRIBE the write
 * they no longer perform — the doc block names `createCapsule()` and
 * `INSERT INTO reflection_capsules` precisely so the next editor understands
 * what was removed. Scanning raw text would match that explanation and fail on
 * the documentation rather than on the defect.
 */
const codeOnly = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const PREPARE_ROUTE = codeOnly(read('from-chat-window', 'route.ts'));
const CONFIRM_ROUTE = codeOnly(read('route.ts'));
const PREPARE_RAW = read('from-chat-window', 'route.ts');

describe('PREPARE — /api/capsules/from-chat-window writes nothing', () => {
  it('does not call createCapsule', () => {
    expect(PREPARE_ROUTE).not.toMatch(/\bcreateCapsule\s*\(/);
  });

  it('does not import createCapsule — no write authority is even in scope', () => {
    const imports = PREPARE_ROUTE.slice(0, PREPARE_ROUTE.indexOf('export async function POST'));
    expect(imports).not.toMatch(/^\s*createCapsule,?\s*$/m);
  });

  it('performs no write of its own (no INSERT, no query helper)', () => {
    expect(PREPARE_ROUTE).not.toMatch(/INSERT\s+INTO/i);
    expect(PREPARE_ROUTE).not.toMatch(/\bqueryOne\s*\(|\bquery\s*\(/);
  });

  it('still authenticates — preview is member-scoped, not open', () => {
    expect(PREPARE_ROUTE).toContain('getMemberIdFromRequest');
    expect(PREPARE_ROUTE).toContain('Authentication required');
  });

  it('returns an unsaved draft, not a capsule', () => {
    expect(PREPARE_ROUTE).toContain('{ draft }');
    expect(PREPARE_ROUTE).not.toMatch(/NextResponse\.json\(\s*\{\s*capsule\s*\}/);
  });

  it('answers 200 (nothing created), not 201', () => {
    expect(PREPARE_ROUTE).toContain('{ status: 200 }');
    expect(PREPARE_ROUTE).not.toContain('{ status: 201 }');
  });

  it('the contract is stated in the file, so the next editor sees it', () => {
    expect(PREPARE_RAW).toContain('KEEP AUTHORITY CONTRACT');
    expect(PREPARE_RAW).toContain('zero persistence');
  });
});

describe('CONFIRM — /api/capsules POST is the only write seam', () => {
  it('creates the capsule', () => {
    expect(CONFIRM_ROUTE).toMatch(/\bcreateCapsule\s*\(/);
  });

  it('requires authentication', () => {
    expect(CONFIRM_ROUTE).toContain('requireMemberId');
  });

  it('validates the confirmed payload rather than trusting the client shape', () => {
    expect(CONFIRM_ROUTE).toContain('CapsuleCreateSchema.safeParse');
  });

  it('writes what the member confirmed — it does not re-distill', () => {
    expect(CONFIRM_ROUTE).not.toMatch(/distillCapsule/);
  });
});

describe('the client opens without persisting', () => {
  const OC = readFileSync(
    join(__dirname, '..', '..', '..', '..', 'components', 'OracleConversation.tsx'),
    'utf8',
  );

  it('reads the prepared draft, not a capsule, from the open call', () => {
    expect(OC).toContain('setCapturedCapsule(data.draft);');
  });

  it('tracks the open as an open — not as a capture that did not happen', () => {
    expect(OC).toContain("trackEvent('keep_panel_opened'");
    expect(OC).not.toContain("trackEvent('spirit_captured'");
  });

  it('marks the draft unpersisted on open', () => {
    const handler = OC.slice(
      OC.indexOf('const handleCaptureSpirit = useCallback'),
      OC.indexOf('}, [userId, messages, sessionId, isSanctuary]);'),
    );
    expect(handler).toContain('setCapsulePersisted(false);');
    // and never claims otherwise from the open path
    expect(handler).not.toContain('setCapsulePersisted(true)');
  });

  it('the first member confirm creates the row; later edits patch it', () => {
    const confirm = OC.slice(
      OC.indexOf('const handleUpdateCapsule = useCallback'),
      OC.indexOf('const handleBringCapsuleIntoLab'),
    );
    expect(confirm).toContain('if (!capsulePersisted) {');
    expect(confirm).toContain("apiFetch('/api/capsules'");
    expect(confirm).toContain("method: 'POST'");
    expect(confirm).toContain('setCapsulePersisted(true);');
    // The PATCH path remains for a capsule that already exists.
    expect(confirm).toContain("method: 'PATCH'");
  });

  it('the confirm seam refuses Sanctuary independently of the panel guard', () => {
    const confirm = OC.slice(
      OC.indexOf('const handleUpdateCapsule = useCallback'),
      OC.indexOf('const handleBringCapsuleIntoLab'),
    );
    expect(confirm).toMatch(/if \(isSanctuary\) \{/);
  });

  it('promotion and Lab navigation require a confirmed Keep', () => {
    expect(OC).toContain('Keep this first, then bring it into the Lab');
    expect(OC).toContain('Keep this first, then you can view it in the Lab');
  });
});

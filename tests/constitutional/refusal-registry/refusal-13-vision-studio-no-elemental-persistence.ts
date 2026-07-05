import type { RefusalCheck } from './harness';

/**
 * Refusal 13 — Vision Studio's Wave A cell-candidate reflection (the room's
 * quiet elemental "weather") has no write path anywhere in its lifecycle.
 *
 * The interview route infers a candidate element/phase from the member's own
 * turn text purely to warm a petal and offer a correctable reflection — it is
 * never a verdict, and nothing about it may outlive the browser tab.
 *
 * The structural proof has three parts:
 *   A. app/api/maia/vision-studio/interview/route.ts contains no SQL write
 *      statement at all (no INSERT/UPDATE/DELETE) — mode='turn' remains
 *      read+reply only, cell inference included.
 *   B. app/api/maia/vision-studio/field-note/route.ts — the one route that DOES
 *      persist member-authored threads — accepts/persists no element, cell, or
 *      cellCandidate field anywhere in its request parsing or its INSERT column
 *      list. The carry payload shape is unchanged by Wave A.
 *   C. VisionStudioRoom.tsx never writes the candidate (or confirmed elements)
 *      to localStorage, and never includes element/cell data in the payload
 *      sent to field-note (the carry() function body and collectPayload()
 *      output are untouched by cellCandidate/confirmedElements state).
 *
 * The refusal is the ABSENCE of a write path — this is a Grade A structural
 * claim: the interview route imports no db handle at all, so it cannot write
 * even behaviourally.
 */

const INTERVIEW_ROUTE = 'app/api/maia/vision-studio/interview/route.ts';
const FIELD_NOTE_ROUTE = 'app/api/maia/vision-studio/field-note/route.ts';
const ROOM_COMPONENT = 'components/maia/vision-studio/VisionStudioRoom.tsx';

const SQL_WRITE = /\bINSERT\s+INTO\b|\bDELETE\s+FROM\b|\bUPDATE\s+[\w."]+\s+SET\b/i;
const DB_IMPORT = /from\s+['"](@\/lib\/db\/postgres|pg)['"]/;

export const check: RefusalCheck = {
  id: 'R13',
  refusal:
    'Vision Studio cell-candidate reflection (element/phase inference for petal warming) has no path to persistence — not in the interview route, not in field-note, not in localStorage, not in the carry payload',
  grade: 'A',
  enforcedBy:
    'interview/route.ts imports no db handle (structurally cannot write); field-note/route.ts request parsing and INSERT column list carry no element/cell field; VisionStudioRoom.tsx carry()/collectPayload() never reference cellCandidate or confirmedElements',
  evidence: [
    'interview/route.ts: no `from "@/lib/db/postgres"` or `from "pg"` import; no INSERT/UPDATE/DELETE anywhere in the file',
    'field-note/route.ts: parseProposals/parseCreated fields are limited to title/decision/revisedTitle/children/shareWithPractitioner; saveThread() INSERT column list has no element/cell/spiralogicCell column',
    'VisionStudioRoom.tsx: carry() body and collectPayload() reference only proposals/created/sessionRef/spiralogicPhase/fieldContext — no cellCandidate, no confirmedElements; no localStorage API call in the file',
  ].join(' | '),
  violationAttempted: [
    '(1) find a db-write import or SQL write statement in interview/route.ts',
    '(2) find "element" or "cellCandidate" or "cell" referenced in field-note/route.ts request parsing or the saveThread() INSERT',
    '(3) find a localStorage API call (setItem/getItem/etc) in VisionStudioRoom.tsx, or find cellCandidate/confirmedElements referenced inside carry() or collectPayload()',
  ].join('; '),
  passingAuthorizes:
    'the Wave A cell-candidate feature (server inference + client petal warming + confirm/correct UI) has no code path that persists element/cell data beyond the browser tab for the current session',
  passingDoesNotAuthorize:
    'that inference itself is accurate or bias-free, or that other Vision Studio surfaces have no similar gaps — only that THIS feature, as built, cannot write elemental data anywhere',
  hostileForkMustChange:
    'add a db import + INSERT to interview/route.ts, or add an element/cellCandidate column to field-note\'s saveThread() INSERT and request parsing, or add a localStorage.setItem call or a cellCandidate/confirmedElements reference inside carry()/collectPayload() in VisionStudioRoom.tsx — any of these is a visible diff',

  run(io) {
    // ── A. interview route: no db import, no SQL write ──
    const interviewSrc = io.read(INTERVIEW_ROUTE);
    if (DB_IMPORT.test(interviewSrc)) {
      io.fail(`${INTERVIEW_ROUTE} imports a db handle`, 'Grade-A structural write-incapacity broken');
    } else {
      io.pass(`${INTERVIEW_ROUTE} imports no db handle`, 'structurally cannot write');
    }
    if (SQL_WRITE.test(interviewSrc)) {
      io.fail(`${INTERVIEW_ROUTE} contains a SQL write statement`, 'refusal falsified');
    } else {
      io.pass(`${INTERVIEW_ROUTE} contains no SQL write statement`);
    }

    // ── B. field-note route: no element/cell field in parsing or INSERT ──
    const fieldNoteSrc = io.read(FIELD_NOTE_ROUTE);
    const elementFieldRefs = io.grep(
      '\\b(element|cellCandidate|spiralogicCell)\\b',
      [FIELD_NOTE_ROUTE],
    );
    if (elementFieldRefs.length === 0) {
      io.pass(`${FIELD_NOTE_ROUTE} references no element/cellCandidate/spiralogicCell field`);
    } else {
      io.fail(
        `${FIELD_NOTE_ROUTE} references an element/cell field`,
        elementFieldRefs.slice(0, 3).join(' | '),
      );
    }
    // saveThread's INSERT column list is a known, bounded set — reconfirm it has not grown
    // an element/cell column (spiralogic_phase is the existing, unrelated phase-arc tag).
    const insertColumnMatch = fieldNoteSrc.match(
      /INSERT INTO member_field_note_threads[\s\S]*?VALUES/,
    );
    if (insertColumnMatch && /\bcell\b|\belement\b/i.test(insertColumnMatch[0])) {
      io.fail('saveThread() INSERT column list contains a cell/element column');
    } else {
      io.pass('saveThread() INSERT column list contains no cell/element column');
    }

    // ── C. client component: no localStorage write, no element data in carry payload ──
    const roomSrc = io.read(ROOM_COMPONENT);
    // Matches actual API usage (localStorage.setItem/getItem/etc, window.localStorage),
    // not prose mentions in comments describing the absence of such usage.
    const localStorageUsage = io.grep('(window\\.)?localStorage\\.\\w+\\(', [ROOM_COMPONENT]);
    if (localStorageUsage.length === 0) {
      io.pass(`${ROOM_COMPONENT} contains no localStorage API usage`);
    } else {
      io.fail(`${ROOM_COMPONENT} calls the localStorage API`, localStorageUsage.slice(0, 3).join(' | '));
    }

    const carryFnMatch = roomSrc.match(/async function carry\([\s\S]*?\n  \}/);
    const collectPayloadMatch = roomSrc.match(/function collectPayload\(\)[\s\S]*?\n  \}/);
    const carryBody = carryFnMatch?.[0] ?? '';
    const collectBody = collectPayloadMatch?.[0] ?? '';
    if (!carryFnMatch || !collectPayloadMatch) {
      io.warn('could not isolate carry()/collectPayload() bodies for scoped check — falling back to whole-file scan');
    }
    const scopedSrc = carryFnMatch && collectPayloadMatch ? carryBody + collectBody : roomSrc;
    if (/cellCandidate|confirmedElements/.test(scopedSrc)) {
      io.fail('carry()/collectPayload() references cellCandidate or confirmedElements', 'element data may leak into the carry payload');
    } else {
      io.pass('carry()/collectPayload() references neither cellCandidate nor confirmedElements', 'ephemeral UI state is structurally excluded from the persisted payload');
    }
  },
};

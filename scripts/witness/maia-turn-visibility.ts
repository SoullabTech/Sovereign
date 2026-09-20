#!/usr/bin/env tsx
/**
 * MAIA TURN VISIBILITY — falsifier for MOTION-CENSUS-01 finding 2
 *
 * Lane: MOTION-CENSUS-01 · Class A (known-bad must reproduce) · READ ONLY
 *
 * ⛔ REPAIRS NOTHING. Reads source, asserts one law, exits non-zero when broken.
 *
 * THE LAW IT ASSERTS
 * ------------------
 *   MAIA's turn must be readable without an animation having completed.
 *
 * Stated structurally: the JSX that renders a conversation turn's TEXT must not
 * be enclosed by a `motion.*` element whose `initial` prop makes it invisible
 * (`opacity: 0`). Such an element renders at opacity 0 and becomes readable only
 * when the animation engine drives it to 1. If that never happens, the words are
 * in the DOM and cannot be read.
 *
 * WHY THIS LAW AND NOT A TASTE RULE
 * ---------------------------------
 * It is the canon's own sentence, applied to the one surface that carries MAIA's
 * speech. docs/SOULLAB_DESIGN_CANON.md, "Don't":
 *
 *   "Use Framer Motion for elements that must be visible on load"
 *
 * and, in "Animations & Transitions":
 *
 *   "Framer Motion animations can cause rendering issues. For critical content
 *    visibility: ... avoid `initial={{ opacity: 0 }}` on important content."
 *
 * This guard does not decide what is important. It decides that MAIA's turn is,
 * which is the narrowest possible reading of "critical content" in a
 * conversational companion. ⛔ It rules on no other surface.
 *
 * WHAT A RED RESULT DOES AND DOES NOT ESTABLISH
 * --------------------------------------------
 *   CAN establish: MAIA's words are invisible-by-default and depend on an
 *   animation completing to become readable. That is STRUCTURAL EXPOSURE.
 *
 *   CANNOT establish: that the animation has ever failed, that any member ever
 *   lost a turn, or how often it would. ⛔ Incidence is NOT measured here and a
 *   RED result must never be reported as an observed member-facing failure.
 *
 * FAIL-CLOSED (D1 discipline)
 * ---------------------------
 * The guard cites OPERATIONS, never line numbers. If it cannot find a turn-text
 * render site in a file it was told carries one, it FAILS rather than passing —
 * an instrument that silently stops asking is worse than no instrument.
 *
 * USAGE
 *   npx tsx scripts/witness/maia-turn-visibility.ts
 *   npx tsx scripts/witness/maia-turn-visibility.ts --verbose
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const REPO = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();

// Surfaces that render a conversation turn's text to a member.
// `mustFindText: true` means: this file is ASSERTED to render turn text. If the
// analyzer finds none, that is an INSTRUMENT FAILURE, not a pass.
const SURFACES: Array<{ file: string; mustFindText: boolean; note: string }> = [
  { file: "components/OracleConversation.tsx", mustFindText: true,
    note: "the live /maia conversation surface" },
  { file: "components/chat/MessageBubble.tsx", mustFindText: true, note: "message bubble" },
  { file: "components/chat/MaiaBubble.tsx", mustFindText: true, note: "MAIA bubble" },
  { file: "components/chat/ChatMessage.tsx", mustFindText: true, note: "chat message" },
  { file: "components/chat/ConversationFlow.tsx", mustFindText: false, note: "conversation flow" },
  { file: "components/chat/BetaMinimalMirror.tsx", mustFindText: false, note: "beta mirror" },
  { file: "components/chat/EnhancedMirrorView.tsx", mustFindText: false, note: "mirror view" },
  { file: "components/chat/MirrorInterface.tsx", mustFindText: false, note: "mirror interface" },
];

// A render site for a turn's TEXT (not its chrome, controls or timestamps).
const TEXT_SITE = [
  /<FormattedMessage\b/,
  /\{\s*(message|msg|m)\.text\s*\}/,
  /\{\s*(message|msg|m)\.content\s*\}/,
  /text=\{\s*(message|msg|m)\.text\s*\}/,
  /\{\s*formatMessageText\(/,
  // Streaming surfaces hold the turn in a local display variable rather than
  // reading message.text directly. Missing this class is how the first run of
  // this instrument reported INSTRUMENT FAILURE on MaiaBubble.tsx instead of
  // the most severe violation in the set. Detector widened, not the law.
  /\{\s*(displayedText|streamedText|visibleText|typedText)\s*\}/,
];

// SECOND VIOLATION SHAPE of the same law: turn text keyed on its own content
// inside AnimatePresence. Every change to the text remounts the node, which
// restarts `initial` from invisible. Under `mode="wait"` the enter is further
// delayed by the outgoing node's exit. Streaming text can therefore spend the
// whole stream mid-fade rather than settling at readable.
const KEYED_ON_TEXT = /key=\{\s*(displayedText|streamedText|visibleText|typedText|[a-zA-Z]*[Tt]ext)\s*\}/;

// An `initial` prop that renders the element invisible.
const INVISIBLE_INITIAL = /initial=\{\{[^}]*opacity:\s*0(?!\.)/;

type Frame = { tag: string; line: number; invisible: boolean; initialText: string; keyedOnText: boolean };
type Hit = { file: string; line: number; site: string; via: Frame };

function analyze(rel: string): { hits: Hit[]; textSites: number; ok: boolean } {
  const abs = path.join(REPO, rel);
  if (!fs.existsSync(abs)) return { hits: [], textSites: 0, ok: false };
  const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);

  const stack: Frame[] = [];
  const hits: Hit[] = [];
  let textSites = 0;

  // Buffer for a motion element whose props span multiple lines.
  let pending: { tag: string; line: number; buf: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (pending) {
      pending.buf += "\n" + line;
      // Opening tag completes at the first `>` that is not part of `=>` or `/>`.
      if (/(^|[^=/])>\s*$/.test(line) || /\/>\s*$/.test(line)) {
        const selfClosing = /\/>\s*$/.test(line);
        const invisible = INVISIBLE_INITIAL.test(pending.buf);
        const init = pending.buf.match(/initial=\{\{[^}]*\}\}/)?.[0] ?? "(none)";
        if (!selfClosing) {
          stack.push({ tag: pending.tag, line: pending.line, invisible, initialText: init,
                       keyedOnText: KEYED_ON_TEXT.test(pending.buf) });
        }
        pending = null;
      }
      continue;
    }

    const open = line.match(/<motion\.([A-Za-z][A-Za-z0-9]*)/);
    if (open) {
      const selfClosingSameLine = /\/>\s*$/.test(line);
      const completesSameLine = selfClosingSameLine || /(^|[^=/])>\s*$/.test(line);
      if (completesSameLine) {
        if (!selfClosingSameLine) {
          stack.push({
            tag: open[1], line: i + 1,
            invisible: INVISIBLE_INITIAL.test(line),
            initialText: line.match(/initial=\{\{[^}]*\}\}/)?.[0] ?? "(none)",
            keyedOnText: KEYED_ON_TEXT.test(line),
          });
        }
      } else {
        pending = { tag: open[1], line: i + 1, buf: line };
      }
      continue;
    }

    const close = line.match(/<\/motion\.([A-Za-z][A-Za-z0-9]*)>/);
    if (close) {
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s].tag === close[1]) { stack.splice(s, 1); break; }
      }
      continue;
    }

    for (const re of TEXT_SITE) {
      if (re.test(line)) {
        textSites++;
        const via = [...stack].reverse().find((f) => f.invisible);
        if (via) hits.push({ file: rel, line: i + 1, site: line.trim().slice(0, 90), via });
        break;
      }
    }
  }

  return { hits, textSites, ok: true };
}

// ── Run ─────────────────────────────────────────────────────────────────────
const verbose = process.argv.includes("--verbose");
let failures = 0;
let instrumentFailures = 0;
const allHits: Hit[] = [];

console.log(`
MAIA TURN VISIBILITY — MOTION-CENSUS-01 finding 2 falsifier
law: MAIA's turn must be readable without an animation having completed
`);

for (const s of SURFACES) {
  const { hits, textSites, ok } = analyze(s.file);
  if (!ok) {
    console.log(`  ⚠️  MISSING   ${s.file}  — asserted surface not found`);
    instrumentFailures++;
    continue;
  }
  if (s.mustFindText && textSites === 0) {
    console.log(`  ⚠️  INSTRUMENT FAILURE  ${s.file}`);
    console.log(`      asserted to render turn text (${s.note}); analyzer found none.`);
    console.log(`      The render shape moved. Re-derive the detector — do NOT read this as a pass.`);
    instrumentFailures++;
    continue;
  }
  if (hits.length) {
    failures++;
    allHits.push(...hits);
    console.log(`  ❌ RED      ${s.file}  (${s.note})`);
    for (const h of hits) {
      console.log(`      turn text at line ${h.line} is enclosed by <motion.${h.via.tag}> opened at line ${h.via.line}`);
      console.log(`        ${h.via.initialText}`);
      if (h.via.keyedOnText) {
        console.log(`        ⭐ AND keyed on its own text — every change remounts the node,`);
        console.log(`           restarting the fade from invisible. Streaming text can stay mid-fade.`);
      }
      if (verbose) console.log(`        site: ${h.site}`);
    }
  } else if (textSites === 0) {
    // NOT a pass. A container that delegates rendering to a child answers this
    // law nowhere; calling it green would let the instrument satisfy itself by
    // not asking. Reported as out of scope and excluded from the verdict.
    console.log(`  –  n/a      ${s.file}  (renders no turn text itself — delegates to a child)`);
  } else {
    console.log(`  ✅ green    ${s.file}  (${textSites} turn-text site${textSites === 1 ? "" : "s"}, all readable without animation)`);
  }
}

console.log(`
── RESULT ──────────────────────────────────────────────────────────────────`);
if (instrumentFailures) {
  console.log(`  ⚠️  INSTRUMENT FAILURE on ${instrumentFailures} surface(s) — NO EVIDENCE from those.`);
}
if (failures) {
  console.log(`  ❌ RED on ${failures} surface(s), ${allHits.length} turn-text site(s) invisible-by-default.`);
  console.log(`
  ESTABLISHED: MAIA's words render at opacity 0 and become readable only when
  the animation engine drives them to 1.  This is STRUCTURAL EXPOSURE.

  ⛔ NOT ESTABLISHED: that the animation has ever failed, that any member lost a
  turn, or how often it would.  Incidence is NOT measured by this instrument and
  a RED result must never be reported as an observed member-facing failure.`);
} else if (!instrumentFailures) {
  console.log(`  ✅ GREEN — no turn text is invisible-by-default.`);
}
console.log();
process.exit(failures || instrumentFailures ? 1 : 0);

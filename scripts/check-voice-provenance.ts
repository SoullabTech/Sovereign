#!/usr/bin/env tsx
/**
 * VOICE PROVENANCE ENFORCEMENT
 *
 * Invariant: a voice backend can never report a service/provider name it isn't.
 *
 * This exists because `app/api/_backend/csm/sesame_simple.py` shipped as a
 * Google Cloud TTS (gTTS) backend that self-reported `service="sesame-csm"` and
 * presented as a local sovereign voice — two lies at once (provenance mislabel +
 * silent cloud egress). The runtime provenance guard in `lib/tts/providers/sesame.ts`
 * catches this at request time; this check catches it at commit time.
 *
 * Rule enforced (fail-closed) for every Python file under the CSM backend:
 *   If a file uses a CLOUD engine (gTTS / google.cloud.texttospeech / an OpenAI
 *   voice client), it MUST NOT claim a SOVEREIGN identity:
 *     - it may not assign a `service`/`title`/`SERVICE_NAME` string containing
 *       "sesame" or "csm"
 *     - it must declare its non-sovereign nature (a `sovereign`/`SOVEREIGN` flag
 *       set to False, or a "NON-SOVEREIGN" marker)
 *
 * A real sovereign backend (Coqui/torch, no cloud import) is unaffected.
 *
 * @see docs/specs/VOICE_FUNCTION_TAXONOMY_2026-07-07.md  §B "Sesame integrity note"
 * @see lib/tts/providers/sesame.ts                        runtime provenance guard
 * @see CLAUDE.md                                          "Sovereignty first"
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["app/api/_backend/csm"];

type Violation = { file: string; reason: string };

// Cloud / non-sovereign engine signals: presence of ANY means audio can leave the machine.
const CLOUD_ENGINE_SIGNALS = [
  /\bfrom\s+gtts\b/,
  /\bimport\s+gtts\b/,
  /google\.cloud\.texttospeech/,
  /from\s+openai\s+import/,
  /\bopenai\.audio\b/,
];

// A sovereign identity claim: naming yourself sesame/csm.
const SOVEREIGN_IDENTITY_CLAIM =
  /\b(?:service|title|SERVICE_NAME)\s*[:=]\s*[("]?\s*["'][^"']*(?:sesame|csm)/i;

// A non-sovereign self-declaration: how an honest cloud backend must mark itself.
const NON_SOVEREIGN_DECLARATION = [
  /\bSOVEREIGN\s*=\s*False\b/,
  /\bsovereign\s*[:=]\s*False\b/i,
  /NON-SOVEREIGN/i,
];

function listPyFiles(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".py"))
    .map((f) => path.join(dir, f));
}

function check(relFile: string): Violation[] {
  const src = fs.readFileSync(path.join(ROOT, relFile), "utf8");
  const usesCloud = CLOUD_ENGINE_SIGNALS.some((re) => re.test(src));
  if (!usesCloud) return []; // sovereign backend — nothing to enforce

  const out: Violation[] = [];

  if (SOVEREIGN_IDENTITY_CLAIM.test(src)) {
    out.push({
      file: relFile,
      reason:
        'uses a cloud TTS engine but reports a sovereign identity ("sesame"/"csm"). ' +
        "A cloud backend must not impersonate Sesame CSM — report its true engine name.",
    });
  }

  const declaresNonSovereign = NON_SOVEREIGN_DECLARATION.some((re) => re.test(src));
  if (!declaresNonSovereign) {
    out.push({
      file: relFile,
      reason:
        "uses a cloud TTS engine but does not declare itself non-sovereign " +
        "(expected `SOVEREIGN = False` or a NON-SOVEREIGN marker).",
    });
  }

  return out;
}

function main(): void {
  const files = SCAN_DIRS.flatMap(listPyFiles);
  const violations = files.flatMap(check);

  if (violations.length === 0) {
    console.log("✅ voice-provenance: no cloud backend impersonating a sovereign voice.");
    return;
  }

  console.error("❌ voice-provenance: backend provenance violations found:\n");
  for (const v of violations) {
    console.error(`  ${v.file}\n    → ${v.reason}\n`);
  }
  console.error(
    "A voice backend must report the service/provider it actually is.\n" +
      "See docs/specs/VOICE_FUNCTION_TAXONOMY_2026-07-07.md §B.",
  );
  process.exit(1);
}

main();

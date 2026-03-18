#!/usr/bin/env tsx
/**
 * NO VENDOR VOICES ENFORCEMENT
 *
 * Hard fail-fast check for OpenAI / ElevenLabs voice identifiers in UI code.
 * This enforces the sovereignty invariant: users never see vendor names.
 *
 * What's banned (in UI-facing code):
 *   - Vendor voice names as user-visible values: 'alloy', 'nova', 'shimmer', 'onyx', 'echo', 'fable'
 *   - Vendor model strings as user-visible values: 'tts-1', 'tts-1-hd'
 *   - Vendor provider labels shown to users: "OpenAI TTS", "ElevenLabs"
 *
 * What's allowed:
 *   - Backend plumbing (lib/tts/, lib/voice/voiceMap.ts, API routes) that calls vendor APIs
 *   - Migration maps that convert legacy names (the string 'alloy' in a map is fine)
 *   - Comments (grep skips them)
 *   - Test files that test migration logic
 *   - The sovereignVoices.ts file itself (defines the mapping)
 *
 * @see CLAUDE.md - "Sovereignty first"
 * @see lib/voice/sovereignVoices.ts - "Single Source of Truth"
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Hit = { file: string; line: number; text: string; rule: string };

// ─────────────────────────────────────────────────────────────────
// What constitutes a trust leak?
// ─────────────────────────────────────────────────────────────────

/**
 * Vendor voice names used as VALUES (not in migration maps or comments).
 * We look for them as string literals, variable values, JSX text, or type unions.
 */
const BANNED_PATTERNS: Array<{ name: string; re: RegExp }> = [
  // Vendor voice names as type literals or defaults
  {
    name: "vendor voice type union",
    re: /'alloy'\s*\|\s*'echo'\s*\|\s*'fable'/,
  },
  {
    name: "vendor voice type union (partial)",
    re: /'shimmer'\s*\|\s*'fable'\s*\|\s*'nova'/,
  },
  {
    name: "vendor voice type union (onyx/echo)",
    re: /'onyx'\s*\|\s*'nova'\s*\|\s*'shimmer'/,
  },

  // Vendor voice names as standalone defaults or hardcodes
  // Match: voice = 'alloy', voice: 'alloy', voice='alloy', useState('alloy')
  {
    name: "alloy as default/value",
    re: /(?:voice|Voice|VOICE)\s*[:=]\s*['"]alloy['"]/,
  },
  {
    name: "nova as default/value",
    re: /(?:voice|Voice|VOICE)\s*[:=]\s*['"]nova['"]/,
  },
  {
    name: "shimmer as default/value",
    re: /(?:voice|Voice|VOICE)\s*[:=]\s*['"]shimmer['"]/,
  },
  {
    name: "onyx as default/value",
    re: /(?:voice|Voice|VOICE)\s*[:=]\s*['"]onyx['"]/,
  },
  {
    name: "fable as default/value",
    re: /(?:voice|Voice|VOICE)\s*[:=]\s*['"]fable['"]/,
  },

  // Vendor model strings in defaults
  {
    name: "tts-1 model default",
    re: /(?:model|Model)\s*[:=]\s*['"]tts-1['"]/,
  },
  {
    name: "tts-1-hd model default",
    re: /(?:model|Model)\s*[:=]\s*['"]tts-1-hd['"]/,
  },

  // Vendor provider as default
  {
    name: "openai as default provider",
    re: /(?:provider|Provider)\s*[:=]\s*['"]openai['"]/,
  },
  {
    name: "elevenlabs as default provider",
    re: /(?:provider|Provider)\s*[:=]\s*['"]elevenlabs['"]/,
  },

  // User-visible vendor labels (in JSX or strings shown to users)
  {
    name: "OpenAI TTS label (user-visible)",
    re: />\s*OpenAI TTS\s*</,
  },
  {
    name: "OpenAI Alloy label (user-visible)",
    re: /OpenAI Alloy/,
  },
  {
    name: "OpenAI Onyx label (user-visible)",
    re: /OpenAI Onyx/,
  },
  {
    name: "ElevenLabs label (user-visible)",
    re: />\s*ElevenLabs\s*</,
  },
];

// ─────────────────────────────────────────────────────────────────
// What to scan (UI-facing code only)
// ─────────────────────────────────────────────────────────────────

const UI_FILE_EXT = new Set([".tsx", ".ts"]);

/** Files that are UI-facing and should never contain vendor names */
const UI_PATHS = [
  "app/",
  "components/",
  "lib/contexts/",
  "lib/components/",
];

/** Files that are ALLOWED to contain vendor names (backend plumbing, mappings) */
const EXEMPT_PATH_RE = new RegExp(
  [
    "lib/voice/sovereignVoices\\.ts",     // The single source of truth
    "lib/tts/",                            // TTS backend plumbing
    "lib/voice/voiceMap\\.ts",             // Kokoro voice map
    "lib/voice/maia-voice\\.ts",           // Voice synthesis internals
    "lib/voice/ProsodyCurves\\.ts",        // Prosody internals
    "lib/voice/ProsodyExtension\\.ts",     // Prosody internals
    "lib/voice/ProsodyLookupTable\\.ts",   // Prosody internals
    "lib/voice/TTSPreprocessor\\.ts",      // TTS preprocessing
    "lib/voice/StreamingAudioQueue\\.ts",  // Audio queue internals
    "lib/voice/VoiceStyleMatrix\\.ts",     // Voice style internals
    "lib/voice/ArchetypalVoiceMapping\\.ts",// Archetype mapping
    "lib/voice/ElementalVoiceOrchestrator\\.ts", // Voice orchestrator
    "lib/voice/MayaHybridVoiceSystem\\.ts",// Hybrid system
    "lib/voice/maiaVoiceService\\.ts",     // Voice service
    "lib/voice/MaiaVoiceSynthesis\\.ts",   // Voice synthesis
    "lib/voice/PersonalizedVoiceService\\.ts",// Personalized voice
    "lib/voice/personaplex/",              // PersonaPlex internals
    "lib/voice/prosody/",                  // Prosody internals
    "lib/config/voiceProfiles\\.ts",       // Legacy voice config
    "lib/config/voiceSettings\\.ts",       // Legacy voice config
    "lib/services/",                       // Backend services
    "lib/sovereign/",                      // Sovereign services
    "lib/consciousness/",                  // Consciousness layer
    "lib/ai/",                             // AI layer
    "lib/memory/",                         // Memory layer
    "lib/learning/",                       // Learning layer
    "lib/agents/",                         // Agent internals
    "lib/openai-client\\.ts",              // OpenAI client (blocked)
    "lib/maia-sdk\\.DISABLED/",            // Disabled SDK
    "lib/anamnesis/",                      // Memory indexing
    "lib/sovereignty/",                    // Sovereignty monitor
    "lib/storage/",                        // Storage layer
    "app/api/",                            // API routes (backend)
    "src/types/",                          // Type definitions
    "__tests__/",                          // Test files
    "\\.test\\.",                           // Test files
    "\\.spec\\.",                           // Spec files
    "node_modules/",                       // Dependencies
    "\\.next/",                            // Build output
    "dist/",                               // Build output
    "\\.broken\\.tsx",                     // Broken/disabled files
  ].join("|")
);

/** Lines that are comments or in migration maps are exempt */
function isExemptLine(line: string): boolean {
  const trimmed = line.trim();
  // Skip comments
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return true;
  // Skip console.log/warn/error (not user-visible)
  if (trimmed.startsWith("console.")) return true;
  // Skip migration maps (lines with : in an object mapping old→new)
  if (/alloy:\s*'maia_|shimmer:\s*'maia_|nova:\s*'maia_|echo:\s*'atlas|onyx:\s*'atlas|fable:\s*'maia_/.test(trimmed)) return true;
  // Skip legacy import comments referencing the old pattern
  if (/LEGACY_MAP|LEGACY_VOICE_MAP|PROVIDER_MAP|MODEL_MAP/.test(trimmed)) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────
// Scanner
// ─────────────────────────────────────────────────────────────────

function getTrackedFiles(): string[] {
  const out = execSync("git ls-files", { encoding: "utf8" });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((f) => UI_FILE_EXT.has(path.extname(f)))
    .filter((f) => UI_PATHS.some((p) => f.startsWith(p)))
    .filter((f) => !EXEMPT_PATH_RE.test(f));
}

function scanFile(file: string): Hit[] {
  let content: string;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }

  const lines = content.split("\n");
  const hits: Hit[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    if (isExemptLine(lineText)) continue;

    for (const p of BANNED_PATTERNS) {
      if (p.re.test(lineText)) {
        hits.push({
          file,
          line: i + 1,
          text: lineText.trim().substring(0, 120),
          rule: p.name,
        });
      }
    }
  }

  return hits;
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────

function main() {
  console.log("🔍 Checking for vendor voice names in UI code...\n");

  const files = getTrackedFiles();
  console.log(`   Scanning ${files.length} UI-facing files\n`);

  const hits: Hit[] = [];
  for (const f of files) hits.push(...scanFile(f));

  if (hits.length > 0) {
    console.error("🚨 SOVEREIGNTY FAIL: Vendor voice names in UI code.\n");
    for (const h of hits.slice(0, 100)) {
      console.error(`   ${h.file}:${h.line}  [${h.rule}]`);
      console.error(`      ${h.text}\n`);
    }
    if (hits.length > 100) console.error(`   ... and ${hits.length - 100} more\n`);

    console.error("📋 Fix:");
    console.error("   1. Replace vendor voice names with sovereign IDs from lib/voice/sovereignVoices.ts");
    console.error("   2. Use: maia_core, maia_warm, maia_clear, atlas, atlas_deep");
    console.error("   3. Use provider: 'sovereign' (not 'openai' or 'elevenlabs')");
    console.error("   4. Use migrateLegacyVoice() for stored values that need conversion");
    console.error("");

    process.exit(1);
  }

  console.log("✅ No vendor voice names in UI code.\n");
}

main();

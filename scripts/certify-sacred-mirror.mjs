// scripts/certify-sacred-mirror.mjs
import fs from "node:fs";
import path from "node:path";

const API_URL =
  process.env.MAIA_API_URL || "http://localhost:3000/api/sovereign/app/maia";

// Regex patterns for spiral/phase detection
const FACET_RE = /\b(Fire|Water|Earth|Air)\s*[0-5]\b/i;
const PHASE_RE = /\bphase\b[^0-9]*([0-5])\b/i;

function loadFixture() {
  const p = path.resolve(process.cwd(), "tests/golden/sacred-mirror.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function mustNotContain(text, arr = []) {
  const lower = text.toLowerCase();
  return arr.filter((s) => lower.includes(String(s).toLowerCase()));
}

function mustContainOneOf(text, arr = []) {
  const lower = text.toLowerCase();
  return arr.some((s) => lower.includes(String(s).toLowerCase()));
}

// Inline validator (self-contained, no TS deps)
function validateSacredMirror(text) {
  const t = (text || "").trim();
  const hasAny = (patterns) => patterns.some((p) => p.test(t));

  // MIRROR: emotional resonance language + reflection tone
  const hasMirror = hasAny([
    /\b(feel|feels|feeling|felt)\b/i,
    /\b(overwhelmed|anxious|tight|heavy|stuck|raw|tender|charged|frayed)\b/i,
    /\b(it makes sense|of course|no wonder)\b/i,
  ]);

  // MAP: mentions spiral/element/phase/facet *or* explicitly says "don't have it yet"
  const hasMap =
    hasAny([/\bspiral\b/i, /\belement\b/i, /\bphase\b/i, FACET_RE]) ||
    hasAny([/\bI don't have\b/i, /\bnot sure yet\b/i, /\bnot in the data\b/i]);

  // MOVE outer: concrete action verbs + real-world domain nouns
  const hasMoveOuter = hasAny([
    /\b(today|tomorrow|this week|next)\b/i,
    /\b(send|schedule|write|ask|tell|apologize|walk|call|email|plan|block)\b/i,
    /\b(conversation|message|meeting|calendar|deadline|partner|boss|team)\b/i,
  ]);

  // MOVE inner: somatic/attention/ritual cue
  const hasMoveInner = hasAny([
    /\b(breathe|breath|exhale|inhale)\b/i,
    /\b(body|somatic|nervous system|ground|settle)\b/i,
    /\b(meditation|practice|ritual|journal|sit|scan)\b/i,
  ]);

  // INTEGRATE: signals + logging/check-in language
  const hasIntegrate = hasAny([
    /\bwatch for\b/i,
    /\bsignals?\b/i,
    /\bnotice\b/i,
    /\blog\b/i,
    /\bcheck-?in\b/i,
    /\btrack\b/i,
  ]);

  const reasons = [];
  if (!hasMirror) reasons.push("Missing MIRROR");
  if (!hasMap) reasons.push("Missing MAP");
  if (!hasMoveOuter) reasons.push("Missing MOVE (outer)");
  if (!hasMoveInner) reasons.push("Missing MOVE (inner)");
  if (!hasIntegrate) reasons.push("Missing INTEGRATE");

  return { ok: reasons.length === 0, reasons };
}

// Check if output invents spiral/phase when it shouldn't
function assertNoSpiralInvention(output) {
  return !(FACET_RE.test(output) || PHASE_RE.test(output));
}

async function callMaia(input) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: input }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} from MAIA_API_URL. Body: ${body.slice(0, 400)}`);
  }

  const json = await res.json();
  // assume { text } or { response } or { message } patterns
  const text = json.text || json.response || json.message || "";
  const metadata = json.metadata || {};
  return { json, text, metadata };
}

(async () => {
  const cases = loadFixture();
  let fails = 0;

  console.log(`\n🧪 Sacred Mirror Certification`);
  console.log(`API: ${API_URL}\n`);

  for (const tc of cases) {
    const { id, input, expect } = tc;
    process.stdout.write(`- ${id} ... `);

    try {
      const { text, metadata } = await callMaia(input);

      // Core sacred mirror check
      if (expect?.mustPassSacredMirror) {
        const v = validateSacredMirror(text);
        if (!v.ok) throw new Error(`SacredMirror invalid: ${v.reasons.join(", ")}`);
      }

      // Must-not-contain
      const bad = mustNotContain(text, expect?.mustNotContain || []);
      if (bad.length) throw new Error(`Contains forbidden: ${bad.join(", ")}`);

      // Must contain one of
      if (expect?.mustContainOneOf?.length) {
        if (!mustContainOneOf(text, expect.mustContainOneOf)) {
          throw new Error(`Missing required phrase (one-of): ${expect.mustContainOneOf.join(" | ")}`);
        }
      }

      // META-AWARE: Check spiral fabrication protection
      if (expect?.mustNotInventSpiral) {
        const spiralInjected = metadata?.spiralMeta?.injected;

        // 1. Metadata should show spiral was NOT injected
        if (spiralInjected === true) {
          throw new Error(`Metadata shows spiralMeta.injected=true when it should be false`);
        }

        // 2. Response should not contain fabricated spiral/phase patterns
        if (!assertNoSpiralInvention(text)) {
          throw new Error(`Response fabricated spiral/phase (found Water 2, Fire 3, Phase: N, etc.)`);
        }
      }

      // Special "must not fabricate" for phase query (backward compat)
      if (id === "SM-02-phase-query-with-no-spiral") {
        const lower = text.toLowerCase();
        if (lower.includes("you are in") || lower.includes("your phase is")) {
          throw new Error("Looks like it fabricated a phase.");
        }
      }

      console.log("PASS");
    } catch (e) {
      fails++;
      console.log("FAIL");
      console.log(`  ↳ ${e.message}\n`);
    }
  }

  if (fails) {
    console.error(`\n❌ Sacred Mirror certification failed: ${fails} case(s)`);
    process.exit(1);
  }

  console.log(`\n✅ Sacred Mirror certification passed (${cases.length}/${cases.length})\n`);
})();

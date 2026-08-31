#!/usr/bin/env tsx
/**
 * DESIGN CANON ENFORCEMENT — the Experience Contract gate
 *
 * Soullab has design law (docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md,
 * docs/canon/SOULLAB_THEME.md) and nothing in the commit path enforces it.
 * That is why each new session can regress into cards, dashboards, office
 * forms and arbitrary palettes: the canon exists, but ignoring it is free.
 *
 * WHAT THIS GATE DOES *NOT* DO
 * ----------------------------
 * It does not enforce aesthetics by regex. There is no "ivory good, green bad"
 * rule here, and there must never be one. Encoding taste as lint would both
 * freeze the house style and be unshippable — as of 2026-08-10 the tree has
 * 381 files using purple/violet/pink/indigo and 362 using raw hex, out of 1,424
 * .tsx files in app/ + components/. A palette gate would block every commit and
 * teach nothing.
 *
 * WHAT IT DOES
 * ------------
 * It enforces PROCESS AND EVIDENCE. If a change touches a member-facing UI
 * surface, an Experience Contract must exist that covers that surface and
 * answers, in committed form:
 *
 *   which room · what human activity · which principles apply · which approved
 *   reference surfaces were consulted · what is shared with the House · what
 *   stays distinctive to the Room · desktop + mobile evidence · how it was
 *   verified experientially · and, if it departs from canon, under whose authority
 *
 * The gate is a RATCHET, not a sweep. It asks nothing of the 1,424 existing
 * files. You pay only for the surfaces you actually touch — which makes
 * coverage grow monotonically with real work, and needs no baseline file.
 *
 * Contracts live in docs/design/contracts/*.md. Format: see that directory's
 * README.md. They are the durable artifact the JARVIS memory layer will later
 * read to learn which decisions were approved and why.
 *
 * USAGE
 *   npm run check:design-canon             # gate the current change
 *   npm run check:design-canon -- --all    # audit coverage across the tree
 *   npm run check:design-canon -- --init Journal   # scaffold a contract
 *
 * @see docs/design/SOULLAB_EXPERIENCE_LANGUAGE_RECONCILIATION_2026-08-10.md (M1)
 * @see docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
const CONTRACT_DIR = path.join(REPO, "docs/design/contracts");
const TRUNK = "origin/clean-main-no-secrets";

// ── Scope: what counts as a member-facing UI surface ────────────────────────
// Only .tsx under app/ or components/. Everything else is out of scope.
const IN_SCOPE = /^(app|components)\/.*\.tsx$/;

// Not member-facing: API routes, tests, stories, and founder/admin-gated
// surfaces. NOTE these are ROUTE exclusions — a shared component under
// components/** that a founder route happens to render is still in scope,
// because members reach it too (e.g. components/journal/* serves both
// /journal and the founder-gated /labtools/journal).
const OUT_OF_SCOPE = [
  /^app\/api\//,
  /^app\/(admin|founder|labtools|dev)\//,
  /^components\/(admin|dev)\//,
  /__tests__\//,
  /\.(test|spec|stories)\.tsx$/,
  // Next.js app-router metadata special files. These emit share-card imagery
  // and icons for crawlers and link previews — they are not rooms, carry no
  // human activity, and no member ever inhabits one. Forcing them into the
  // Experience Contract registry would corrupt what that registry means.
  //
  // Deliberately FILENAME-specific and anchored to app/: this is the metadata
  // file convention, not a path escape. `components/**/icon.tsx` is an ordinary
  // component and stays in scope. sitemap/robots/manifest are the same class
  // conceptually but are .ts, so they never reach this gate's .tsx scope and
  // are not matched here. Founder ruling 2026-08-16.
  //
  // The same class of content living INSIDE a non-metadata file is handled by
  // the block-scoped rule below (METADATA_BLOCK_SCOPED, founder ruling
  // 2026-08-31) — deliberately not here, because this list is path-based and
  // would exempt the whole file.
  /^app\/(.*\/)?(opengraph-image|twitter-image|icon|apple-icon)\d*\.tsx$/,
];

const REQUIRED_ALWAYS = [
  "room",
  "human_activity",
  "surfaces",
  "principles",
  "reference_surfaces",
  "shared_with_house",
  "distinct_to_room",
] as const;

// Required only when change_class is "experiential" (the default).
const REQUIRED_EXPERIENTIAL = [
  "screenshot_desktop",
  "screenshot_mobile",
  "experience_verification",
] as const;

const PLACEHOLDER = /^(todo|tbd|n\/a|na|\.\.\.|<.*>|_+)$/i;

type Contract = {
  file: string;
  fields: Record<string, string[]>;
};

// ── Minimal frontmatter parser ──────────────────────────────────────────────
// Supports `key: value` and `key:` followed by `  - item` lines. Deliberately
// dependency-free; the template is the only supported shape.
function parseContract(file: string): Contract | null {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;

  const fields: Record<string, string[]> = {};
  let current: string | null = null;

  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const listItem = line.match(/^\s+-\s*(.*)$/);
    if (listItem && current) {
      if (listItem[1].trim()) fields[current].push(listItem[1].trim());
      continue;
    }

    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      current = kv[1];
      fields[current] = kv[2].trim() ? [kv[2].trim()] : [];
    }
  }
  return { file, fields };
}

function value(c: Contract, key: string): string[] {
  return (c.fields[key] ?? []).filter((v) => v && !PLACEHOLDER.test(v.trim()));
}

// ── Glob matching (supports ** and *) ───────────────────────────────────────
function globToRe(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*") {
      if (glob[i + 1] === "*") {
        re += ".*";
        i++;
        if (glob[i + 1] === "/") i++; // `**/` also matches zero directories
      } else {
        re += "[^/]*";
      }
    } else if (".+^${}()|[]\\?".includes(ch)) {
      re += "\\" + ch;
    } else {
      re += ch;
    }
  }
  return new RegExp("^" + re + "$");
}

// ── Which files changed ─────────────────────────────────────────────────────
function git(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", cwd: REPO, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

/**
 * The ratchet depends on the diff base. Gating the whole branch against trunk
 * would retroactively demand contracts for work done before this gate existed
 * — on the branch where it landed, that was 37 surfaces. So the default scope
 * is what you are about to commit, not everything the branch ever touched.
 *
 *   pre-commit  → staged only          (what this commit introduces)
 *   default     → staged + unstaged    (what you are about to ship)
 *   --branch    → merge-base vs trunk  (PR-level review, opt-in)
 *   --all       → whole tree           (coverage audit, reporting)
 */
type ChangeScope = {
  files: string[];
  how: string;
  /** Revision the change is measured FROM — the "old side" of the diff. */
  baseRev: string;
  /** git-diff selector reproducing this scope for a single path. */
  diffSelector: string;
};

function changedFiles(branchScope: boolean): ChangeScope {
  if (process.env.GIT_PRE_COMMIT === "1") {
    return {
      files: git("git diff --cached --name-only --diff-filter=ACM").split("\n"),
      how: "staged changes",
      baseRev: "HEAD",
      diffSelector: "--cached",
    };
  }

  if (branchScope) {
    const base = git(`git merge-base HEAD ${TRUNK}`).trim();
    if (base) {
      return {
        files: git(`git diff --name-only --diff-filter=ACM ${base}...HEAD`).split("\n"),
        how: `branch changes vs ${TRUNK}`,
        baseRev: base,
        diffSelector: `${base}...HEAD`,
      };
    }
    console.error(`⚠️  --branch: no merge-base with ${TRUNK}; falling back to working tree.`);
  }

  return {
    files: git("git diff --name-only --diff-filter=ACM")
      .split("\n")
      .concat(git("git diff --cached --name-only --diff-filter=ACM").split("\n")),
    how: "working-tree changes",
    // Working tree (staged + unstaged) measured against the last commit, so a
    // change that is half-staged is still judged as one whole change.
    baseRev: "HEAD",
    diffSelector: "HEAD",
  };
}

function allTrackedSurfaces(): string[] {
  return git("git ls-files").split("\n");
}

function inScope(f: string): boolean {
  if (!IN_SCOPE.test(f)) return false;
  return !OUT_OF_SCOPE.some((re) => re.test(f));
}

// ── Block-scoped exemption: document-head metadata ──────────────────────────
// Founder ruling 2026-08-31, extending the 2026-08-16 metadata ruling above.
//
// THE DISTINCTION: *document-head metadata is not an Experience Contract
// surface.* The 2026-08-16 ruling already established this for the app-router
// metadata FILES (opengraph-image, icon, apple-icon …) on the reasoning that
// they emit icons and share-cards for crawlers, carry no human activity, and
// no member ever inhabits one — and that registering them would corrupt what
// the contract registry means. That reasoning applies word-for-word to a
// favicon href. But it was implemented as a filename regex, so it does not
// reach the same class of content when it lives inside `export const metadata`
// in app/layout.tsx.
//
// THE BOUNDARY IS THE SYMBOL, NOT THE FILE. app/layout.tsx is NOT exempt:
//
//   metadata export only .................. OUT_OF_SCOPE for this change
//   layout/render structure, providers,
//   children composition, navigation /
//   House behavior, visible experience .... still requires its Contract
//
// So this is deliberately NOT added to OUT_OF_SCOPE — that list is path-based
// and would exempt the file. `inScope()` stays untouched, which means `--all`
// still reports app/layout.tsx as an uncovered surface. That gap is real and
// stays visible; this rule only declines to bill a favicon href for it.
//
// FAIL-CLOSED: any ambiguity — export not found on either side, unparseable
// hunk, deleted/added file, missing base blob — returns false and the change
// is gated normally. The exemption must be affirmatively proven, never assumed.
const METADATA_BLOCK_SCOPED = new Set(["app/layout.tsx"]);

// `export const viewport` is deliberately NOT exempt even though it is also a
// document-head declaration. It carries maximumScale/minimumScale, which is
// zoom — a WCAG 1.4.4 accessibility behaviour a member directly experiences.
const METADATA_EXPORT = /^export\s+const\s+metadata\b/;

/** 1-based inclusive [start, end] of the `export const metadata` declaration. */
function metadataExportRange(source: string): [number, number] | null {
  const lines = source.split("\n");
  const start = lines.findIndex((l) => METADATA_EXPORT.test(l));
  if (start === -1) return null;
  // Terminates at the first column-0 close (`};` or `}`). The declaration is
  // top-level, so any nested close is indented.
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\}\s*;?\s*$/.test(lines[i])) return [start + 1, i + 1];
  }
  return null; // unterminated → fail closed
}

/** Changed line ranges from a `-U0` diff: old side and new side, 1-based. */
function touchedRanges(diff: string): { old: [number, number][]; new: [number, number][] } | null {
  const out = { old: [] as [number, number][], new: [] as [number, number][] };
  const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
  let seen = false;
  for (const line of diff.split("\n")) {
    if (!line.startsWith("@@")) continue;
    const m = hunk.exec(line);
    if (!m) return null; // unparseable → fail closed
    seen = true;
    const oStart = Number(m[1]);
    const oLen = m[2] === undefined ? 1 : Number(m[2]);
    const nStart = Number(m[3]);
    const nLen = m[4] === undefined ? 1 : Number(m[4]);
    if (oLen > 0) out.old.push([oStart, oStart + oLen - 1]);
    if (nLen > 0) out.new.push([nStart, nStart + nLen - 1]);
  }
  return seen ? out : null;
}

const within = (r: [number, number][], box: [number, number]) =>
  r.every(([a, b]) => a >= box[0] && b <= box[1]);

/**
 * True only if EVERY line this change touches — added and removed — falls
 * inside the `export const metadata` declaration, judged on both sides of the
 * diff. Checking the old side matters: a pure deletion of layout JSX adds no
 * new-side lines and must not slip through.
 */
function isDocumentMetadataOnlyChange(file: string, scope: ChangeScope): boolean {
  const diff = git(`git diff -U0 ${scope.diffSelector} -- ${file}`);
  if (!diff.trim()) return false;
  if (/^(new|deleted) file mode/m.test(diff)) return false;

  const ranges = touchedRanges(diff);
  if (!ranges) return false;

  const newSource =
    scope.diffSelector === "--cached"
      ? git(`git show :${file}`) // the staged blob, not the working tree
      : fs.existsSync(path.join(REPO, file))
        ? fs.readFileSync(path.join(REPO, file), "utf8")
        : "";
  const oldSource = git(`git show ${scope.baseRev}:${file}`);
  if (!newSource.trim() || !oldSource.trim()) return false;

  const newRange = metadataExportRange(newSource);
  const oldRange = metadataExportRange(oldSource);
  if (!newRange || !oldRange) return false;

  return within(ranges.new, newRange) && within(ranges.old, oldRange);
}

// ── Contract scaffold ───────────────────────────────────────────────────────
function scaffold(room: string): void {
  const slug = room.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const target = path.join(CONTRACT_DIR, `${slug}.md`);
  if (fs.existsSync(target)) {
    console.error(`❌ Contract already exists: ${path.relative(REPO, target)}`);
    process.exit(1);
  }
  const tpl = path.join(CONTRACT_DIR, "_TEMPLATE.md");
  if (!fs.existsSync(tpl)) {
    console.error(`❌ Template missing: ${path.relative(REPO, tpl)}`);
    process.exit(1);
  }
  fs.mkdirSync(CONTRACT_DIR, { recursive: true });
  fs.writeFileSync(target, fs.readFileSync(tpl, "utf8").replace(/^room:.*$/m, `room: ${room}`));
  console.log(`✅ Scaffolded ${path.relative(REPO, target)} — fill it in before committing.`);
}

// ── Main ────────────────────────────────────────────────────────────────────
function main(): void {
  const argv = process.argv.slice(2);

  const initIdx = argv.indexOf("--init");
  if (initIdx !== -1) {
    const room = argv[initIdx + 1];
    if (!room) {
      console.error("❌ --init requires a room name, e.g. --init Journal");
      process.exit(1);
    }
    scaffold(room);
    return;
  }

  const auditAll = argv.includes("--all");
  const branchScope = argv.includes("--branch");

  // Load contracts
  const contracts: Contract[] = fs.existsSync(CONTRACT_DIR)
    ? fs
        .readdirSync(CONTRACT_DIR)
        .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
        .map((f) => parseContract(path.join(CONTRACT_DIR, f)))
        .filter((c): c is Contract => c !== null)
    : [];

  const scope: ChangeScope | null = auditAll ? null : changedFiles(branchScope);
  const { files, how } = scope ?? { files: allTrackedSurfaces(), how: "full tree audit" };

  const inScopeFiles = [...new Set(files.map((f) => f.trim()).filter(Boolean))]
    .filter(inScope)
    .sort();

  // Block-scoped exemption. Only applies when gating a CHANGE — never in
  // --all, where the file's missing contract is a real gap that must stay
  // visible rather than be papered over by what one diff happened to touch.
  const exempt = scope
    ? inScopeFiles.filter((f) => METADATA_BLOCK_SCOPED.has(f) && isDocumentMetadataOnlyChange(f, scope))
    : [];
  for (const f of exempt) {
    console.log(`🏷  ${f}: change is confined to the \`export const metadata\` declaration.`);
    console.log(`   Document-head metadata is not an Experience Contract surface (founder ruling 2026-08-31).`);
    console.log(`   The file is NOT exempt — any layout, provider, composition or navigation change still requires its Contract.`);
  }

  const targets = inScopeFiles.filter((f) => !exempt.includes(f));

  if (targets.length === 0) {
    console.log(`✅ Design canon: no member-facing UI surfaces in ${how}.`);
    return;
  }

  console.log(`🏛  Design canon gate — ${targets.length} member-facing surface(s) in ${how}`);

  // Map each target to covering contracts
  const coverage = new Map<string, Contract[]>();
  for (const t of targets) {
    const covering = contracts.filter((c) =>
      value(c, "surfaces").some((g) => globToRe(g).test(t)),
    );
    coverage.set(t, covering);
  }

  const uncovered = targets.filter((t) => coverage.get(t)!.length === 0);
  const problems: string[] = [];

  // Validate the contracts that are actually load-bearing for this change
  const engaged = new Set<Contract>();
  for (const list of coverage.values()) list.forEach((c) => engaged.add(c));

  for (const c of engaged) {
    const rel = path.relative(REPO, c.file);
    const cls = (value(c, "change_class")[0] ?? "experiential").toLowerCase();

    if (!["experiential", "structural"].includes(cls)) {
      problems.push(`${rel}: change_class must be "experiential" or "structural" (got "${cls}")`);
    }

    const required = [
      ...REQUIRED_ALWAYS,
      ...(cls === "structural" ? [] : REQUIRED_EXPERIENTIAL),
    ];
    for (const f of required) {
      if (value(c, f).length === 0) {
        problems.push(`${rel}: missing or placeholder field → ${f}`);
      }
    }

    if (cls === "structural" && value(c, "structural_rationale").length === 0) {
      problems.push(
        `${rel}: change_class "structural" requires structural_rationale (why this change is not experiential)`,
      );
    }

    // Deviation from canon requires named authority
    if (value(c, "deviation").length > 0 && value(c, "authority").length === 0) {
      problems.push(`${rel}: deviation declared without authority — name the ruling that permits it`);
    }

    // Evidence must actually exist on disk
    for (const shot of ["screenshot_desktop", "screenshot_mobile"]) {
      for (const p of value(c, shot)) {
        if (!fs.existsSync(path.resolve(REPO, p))) {
          problems.push(`${rel}: ${shot} not found on disk → ${p}`);
        }
      }
    }
  }

  if (uncovered.length === 0 && problems.length === 0) {
    console.log(`✅ Design canon: ${engaged.size} Experience Contract(s) cover this change.`);
    return;
  }

  console.error("");
  console.error("❌ Design canon gate FAILED");

  if (uncovered.length > 0) {
    console.error("");
    console.error("  Member-facing surfaces with no Experience Contract:");
    uncovered.forEach((f) => console.error(`    · ${f}`));
    console.error("");
    console.error("  A UI change without a contract cannot say which room it belongs to,");
    console.error("  what human activity it serves, or what it shares with the House.");
    console.error("  That is the gap this gate exists to close.");
    console.error("");
    console.error("  Fix:  npm run check:design-canon -- --init <RoomName>");
    console.error("        then add the surface glob to its `surfaces:` list.");
    console.error("        See docs/design/contracts/README.md");
  }

  if (problems.length > 0) {
    console.error("");
    console.error("  Incomplete contracts:");
    problems.forEach((p) => console.error(`    · ${p}`));
  }

  console.error("");
  process.exit(1);
}

main();

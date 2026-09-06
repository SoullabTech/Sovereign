#!/usr/bin/env node
/**
 * Local-fonts production network witness — INSTRUMENT v2
 * ======================================================
 *
 * Establishes, against the DEPLOYED browser plane of soullab.life, exactly:
 *
 *   "The production site's runtime Google Fonts dependency has been removed
 *    and witnessed."
 *
 * and nothing wider. Record:
 *   docs/ops/MAIA_LOCAL_FONTS_SOVEREIGNTY_ACCEPTANCE_2026-09-05.md
 *
 * ── WHY v2 ───────────────────────────────────────────────────────────────
 * v1 ran against 8369594f3 and returned FAIL. The verdict was right; its
 * stated reason was wrong. v1's W3 inferred "typography fell back" from "no
 * vendored family rendered", and so misread Inter on /maia/privacy — which is
 * origin-served via next/font — as a third-party failure, while its own
 * network log recorded zero Google requests on both surfaces.
 *
 * The real defect was scope: v1 observed two pages and generalized to an
 * origin. An origin sweep found a live <link> to fonts.googleapis.com in
 * /now-what/preview.html, which v1 never visited.
 *
 * v2 corrects the false negative in W3 and simultaneously TIGHTENS the gate
 * through W4. Criteria were declared before this run, not after it — the
 * subject still FAILs under v2, which is the signature of a correction rather
 * than a rewrite-to-pass. See docs/canon/CLAIM_STATE_AUTHORITY.md rule 5.
 *
 * ── WHAT IT MEASURES ─────────────────────────────────────────────────────
 *   W1   every network-fetched font resolves to the AIN origin
 *   W2   zero requests to fonts.googleapis.com / fonts.gstatic.com
 *   W3   same-origin runtime font delivery, and vendored faces rasterize
 *   W4a  no Google Fonts reference in browser-deliverable served production
 *        assets or documents                        ← claim evidence
 *   W4b  no latent Google Fonts re-entry vector in browser-targetable source,
 *        read from EXPECT_SHA's Git objects
 *                                                   ← preventive governance
 *
 * W4a and W4b are both required for closure but support DIFFERENT claims.
 * Latent source is not evidence that today's browser calls Google; it is
 * evidence that the repository retains an easy re-entry path.
 *
 * ── W3, PRECISELY ────────────────────────────────────────────────────────
 * Not "every rendered face must be origin-served" — a legitimate system face
 * requires no network at all and is neither a third-party failure nor
 * evidence of vendored-font reach.
 *
 *   Every NETWORK-FETCHED font must be same-origin. Both /fonts/... and
 *   /_next/static/media/... count as same-origin runtime font delivery.
 *
 *   Every sampled intended webfont must actually rasterize text
 *   (CSS.getPlatformFontsForNode, glyphCount > 0; custom where expected).
 *
 *   Across the witness surfaces, >=1 sampled rendered face must be backed by
 *   a deliberately vendored /fonts/... family.
 *
 * So /_next/static/media/ is same-origin RUNTIME EVIDENCE. It is NOT evidence
 * of /fonts vendoring, and the build provenance behind it (next/font contacts
 * Google at build time) is accounted separately and is out of this witness's
 * scope — the public accounting treats build-time contact as a different
 * plane. v1's label "build-plane, NOT evidence" was wrong on the first half.
 *
 * ── SCOPE ────────────────────────────────────────────────────────────────
 * The browser plane of the production site — not merely member routes. The
 * public row says "the production site"; a visitor's browser makes the same
 * external request whether the document is Next-rendered or static.
 *
 *   IN   browser-served soullab.life surfaces · public static HTML ·
 *        Next app/client assets · latent browser CSS/source (W4b ratchet)
 *   OUT  server-side PDF rendering · worker-only generated server HTML ·
 *        build-time framework acquisition
 *
 * Those remain real and are accounted separately. This witness does not
 * claim they vanished.
 *
 * ── VALIDITY GUARDS ──────────────────────────────────────────────────────
 * A witness that can pass vacuously is worse than none, because it produces
 * a record.
 *
 *   W0a/W0b  SUBJECT. Production GIT_COMMIT read before the first navigation
 *            and after the last observation. A mismatch is INVALID — not FAIL
 *            and not PASS. A result must know which commit it describes.
 *   CACHE    Fresh profile + Network.setCacheDisabled before first navigation.
 *            A warm cache issues zero Google requests regardless of what the
 *            server sends, so W2 would measure the browser.
 *   SW       Network.setBypassServiceWorker, also pre-navigation. A worker can
 *            satisfy a resource without the network.
 *   REACH    >0 font responses AND >0 vendored /fonts/... responses across
 *            surfaces. Zero is instrument failure, not a pass.
 *   MEMBER   A member surface is navigated alongside /accounted-for. A
 *            redirect to sign-in means it was not reached: INVALID.
 *
 * ── WHY v2.4 ─────────────────────────────────────────────────────────────
 * v2.3 was accepted for an acceptance run and then found to be UNABLE TO PASS.
 *
 * Production reports GIT_COMMIT as an ABBREVIATED sha — observed `6ff0beafc`,
 * `8369594f3`; the deploy lane stamps `target_sha=d8fc2082d`. v2.2 made
 * EXPECT_SHA a required full 40 characters, and v2.2/v2.3 compared the two with
 * `===`. A 9-character string never equals a 40-character one, so subject
 * binding reported INVALID on every run regardless of what production was
 * actually serving, and PASS was unreachable.
 *
 * That is the same defect class this instrument keeps finding in itself: the
 * written contract and the channel it reads did not agree, and the mismatch
 * failed in the direction that looks like rigour rather than the direction that
 * looks like a bug — which is why three review passes did not catch it.
 *
 * The repair resolves rather than prefix-matches. `git rev-parse --verify
 * <short>^{commit}` against REPO_ROOT yields the FULL id, so the comparison
 * stays exact and an ambiguous abbreviation fails instead of silently matching.
 * A production sha that cannot be resolved there is INVALID: production is
 * running a commit this object store does not have, so nothing observed could
 * describe it.
 *
 * Also folded in, since the file was being touched anyway: the last two `sh -c`
 * call sites (the cat-file probe and repoHygiene) now use direct git. All local
 * Git in this instrument is execFileSync('git', [...]) with no shell.
 *
 * ── WHY v2.3 ─────────────────────────────────────────────────────────────
 * v2.2 was never run either. Three more ENFORCEMENT defects were found in it,
 * all the same shape: a failure path that could look like a clean result.
 *
 *   1. Both sweeps ended in `... 2>/dev/null || true`, collapsing three
 *      different worlds into one empty string — a valid no-match, an
 *      unreadable path, and a genuine tool failure. Now every read reports its
 *      exit status: 0 = matches, 1 = valid zero matches, anything else =
 *      INVALID. `cat-file -e <sha>^{commit}` proves the COMMIT object exists;
 *      it does not prove every tree and blob under it is readable, which is
 *      exactly the partial-clone case this instrument names.
 *
 *   2. W4a accepted results from served roots without establishing they exist.
 *      A missing /app/.next/static would have swept to "no matches". The roots
 *      are now probed first, and an absent one is INVALID.
 *
 *   3. Instrument identity was printed, not enforced: a null blob id rendered
 *      "UNCOMPUTABLE" and still reached exit 0, contradicting the two-identity
 *      contract. It is now computed during preflight and INVALID if absent or
 *      malformed — a run that cannot name its own instrument is not
 *      reconstructible and must not be able to PASS.
 *
 * Also: classification now reads FULL blob / FULL file content rather than
 * grep excerpts, and local Git runs via execFileSync('git', [...]) with no
 * `sh -c` — shell quoting and glob expansion have no business deciding what an
 * evidence instrument sweeps.
 *
 * ── WHY v2.2 ─────────────────────────────────────────────────────────────
 * v2.1 was never run. Two defects were found in it before it produced any
 * evidence, both the same shape as the ones it had itself fixed in v2: the
 * written contract was stronger than what the code enforced.
 *
 *   1. W4b read the WORKING TREE, so its result depended on the operator
 *      having pointed the script at a suitably pristine directory. v2.2 reads
 *      the Git objects of EXPECT_SHA instead. "HEAD == EXPECT_SHA and the
 *      worktree is clean" is only a PROXY for "the source I swept is the
 *      subject's source"; a sparse checkout, an excluded path, a partial clone
 *      or a stray ignore rule can satisfy the proxy while hiding source from a
 *      filesystem grep. Asking Git for the commit is the thing itself.
 *
 *   2. Both sweeps classified a file from `grep | head -5`. A file whose first
 *      five matches were prose and whose sixth was a real fetchable reference
 *      would have been reported as a non-gating prose mention. Truncation is
 *      now display-only; classification always sees full matching content.
 *
 * v2.2 is also deliberately EXTERNAL to the subject: the instrument is not part
 * of the deployed commit it measures. So it is identified by its own Git blob
 * id, self-computed, and the acceptance record binds two identities — SUBJECT
 * (the deployed commit) and INSTRUMENT (this blob). Neither alone makes a run
 * reproducible; together they make it reconstructible by anyone.
 *
 * ── USAGE ────────────────────────────────────────────────────────────────
 *   WITNESS_EXPECT_SHA=<40-char sha> \
 *   WITNESS_REPO_ROOT=/path/to/objectstore \
 *     node local-fonts-production-witness.mjs
 *
 * ENV
 *   WITNESS_EXPECT_SHA   REQUIRED. Full 40-character commit SHA of the subject.
 *                        Missing or malformed = INVALID. There is no skip mode:
 *                        a production acceptance witness without an exact
 *                        subject has no useful mode.
 *   WITNESS_REPO_ROOT    REQUIRED. Any Git repository or object store holding
 *                        EXPECT_SHA. No derive-from-script fallback — the
 *                        instrument lives outside the subject, so its own
 *                        location says nothing about where the objects are.
 *                        Absent commit = INVALID.
 *   WITNESS_ORIGIN       default https://soullab.life
 *   WITNESS_SSH_HOST     default soullab@minisforum
 *   WITNESS_CONTAINER    default maia-sovereign
 *   WITNESS_MEMBER_PATH  default /maia/privacy
 *   WITNESS_EXTRA_PATHS  comma-separated additional surfaces to observe
 *
 * EXIT  0 PASS · 1 FAIL · 2 INVALID
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const INSTRUMENT_VERSION = '2.4';

const ORIGIN = process.env.WITNESS_ORIGIN ?? 'https://soullab.life';
const SSH_HOST = process.env.WITNESS_SSH_HOST ?? 'soullab@minisforum';
const CONTAINER = process.env.WITNESS_CONTAINER ?? 'maia-sovereign';
// REQUIRED. A production acceptance witness without an exact subject has no
// useful mode, so there is no skip and no default. WITNESS_SKIP_SHA is retired.
const EXPECT_SHA = process.env.WITNESS_EXPECT_SHA ?? null;

// REQUIRED. No derive-from-script fallback: v2.2 lives OUTSIDE the subject, so
// its own location says nothing about where the subject's objects are. Any Git
// repository or object store containing EXPECT_SHA will do — v2.2 reads the
// commit, never a checkout, so the working tree there is irrelevant.
const REPO_ROOT = process.env.WITNESS_REPO_ROOT ?? null;

const SHA40 = /^[0-9a-f]{40}$/;

// The member surface must be a route an unauthenticated browser actually
// reaches. NOT /begin — at these SHAs app/begin/page.tsx is redirect('/signin'),
// so pointing here reports INVALID for a mechanical reason, not a finding.
// /maia/privacy is public in config/accessMatrix.ts, carries no redirect, and
// renders through app/layout.tsx.
const MEMBER_PATH = process.env.WITNESS_MEMBER_PATH ?? '/maia/privacy';

const MEMBER_PATH_OVERRIDDEN = Boolean(process.env.WITNESS_MEMBER_PATH);

/**
 * W3 needs a POSITIVE PER-SURFACE expectation, not one global vendored witness.
 * Without it this could pass: Spectral renders on /accounted-for, Inter
 * silently falls back to Arial on /maia/privacy, preview renders system —
 * because "some vendored family rasterized somewhere" was satisfied by the
 * first surface alone. A silent fallback is exactly the failure W3 is for.
 *
 * `expectAnyOf` — at least one of these families must actually rasterize here.
 * `systemOk`    — a system stack is the INTENDED result on this surface, so no
 *                 custom face is required. Not a weakening: preview.html was
 *                 deliberately repaired to Georgia and the OS sans, so system
 *                 rendering there is correctness, not degradation.
 */
const SURFACES = [
  {
    path: '/accounted-for',
    expectAnyOf: ['Spectral', 'IBM Plex Sans'],
    why: 'the page that publishes the claim; app/fonts.css faces must rasterize here',
  },
  {
    path: MEMBER_PATH,
    // app/layout.tsx applies inter.className to <body>, so Inter is the
    // intended face on the member path — supplied by next/font, delivered
    // same-origin from /_next/static/media.
    expectAnyOf: MEMBER_PATH_OVERRIDDEN ? null : ['Inter'],
    why: MEMBER_PATH_OVERRIDDEN
      ? 'member path overridden via WITNESS_MEMBER_PATH — no render expectation is asserted'
      : 'root layout applies inter.className to body; next/font must actually rasterize',
  },
  {
    path: '/now-what/preview.html',
    systemOk: true,
    why: 'repaired to Georgia / OS sans stacks deliberately; system rendering is correct here',
  },
  ...(process.env.WITNESS_EXTRA_PATHS ?? '')
    .split(',').map((x) => x.trim()).filter(Boolean)
    .map((path) => ({ path, why: 'added via WITNESS_EXTRA_PATHS — no render expectation asserted' })),
];

/**
 * INSTRUMENT IDENTITY — this script's own Git blob id, computed from its bytes.
 *
 * v2.2 is deliberately external to the subject, so it is not identified by any
 * commit in the subject's history. Hashing its own content gives an identity
 * that needs no repository at all and is exactly what `git hash-object` would
 * report, so the acceptance record can name it and anyone can reconstruct the
 * run with `git cat-file blob <id>`.
 *
 * The record binds TWO identities: SUBJECT (deployed commit) and INSTRUMENT
 * (this blob). Neither alone makes a run reproducible.
 */
function instrumentBlobId() {
  try {
    const bytes = readFileSync(fileURLToPath(import.meta.url));
    return createHash('sha1')
      .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]))
      .digest('hex');
  } catch {
    return null;
  }
}

/** Families vendored by this repair — app/fonts.css. */
const VENDORED_FAMILIES = [
  'Atkinson Hyperlegible', 'Crimson Pro', 'IBM Plex Sans',
  'Source Sans Pro', 'Spectral',
];

const GOOGLE_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// A reference is FETCHABLE if it is a markup/CSS reference OR a string literal
// holding the URL. A prose mention (public/fonts/LICENSES.md names the hosts to
// say we no longer call them) is reported as informational and never gates.
const MARKUP_RE = /(url\(|href\s*=|src\s*=)[^)\n>]{0,200}?fonts\.(googleapis|gstatic)\.com/i;
// All THREE JS string delimiters. A constructed URL is a re-entry vector too:
// lib/theme/themeCssVars.ts built `https://fonts.googleapis.com/css2?...` in a
// module a client component imported, matching no markup literal at all. A
// detector that covered only ' and ` would let a future double-quoted re-entry
// be printed as a non-gating "prose mention" — exactly the defect class W4b
// exists to catch. This also applies to compiled browser JS in W4a, where a
// delivered bundle can construct the URL with no markup reference anywhere.
const GOOGLE_HOST_RE_SRC = 'fonts\\.(googleapis|gstatic)\\.com';
const GOOGLE_HOST_RE_G = /fonts\.(googleapis|gstatic)\.com/g;
const countMatches = (text) => ((text ?? '').match(GOOGLE_HOST_RE_G) ?? []).length;
const CONSTRUCTED_RE = /["'`]https?:\/\/fonts\.(googleapis|gstatic)\.com/;
const isFetchable = (text) => MARKUP_RE.test(text) || CONSTRUCTED_RE.test(text);
/** Display helper. Prefers a line that actually gates, so the sample shown is
 *  the evidence, not whichever line happened to sort first. */
const firstFetchableLine = (text) => {
  const lines = (text ?? '').split('\n').filter(Boolean);
  return lines.find((l) => isFetchable(l)) ?? lines[0] ?? '';
};
const FONT_EXT = /\.(woff2?|ttf|otf|eot)(\?|$)/i;
const SIGNIN_PATH = /\/(signin|sign-in|login|auth|begin-journey)\b/i;

// Browser-deliverable roots inside the running container.
const SERVED_ROOTS = ['/app/public', '/app/.next/static'];
// Browser-targetable source in the repo, for the W4b ratchet.
const SOURCE_ROOTS = ['app', 'components', 'public', 'styles', 'lib'];

// W4b classifies rather than excludes. Every hit is printed; only the CLIENT
// plane gates. Nothing is silently dropped — a sweep that hides what it
// decided not to count is not a ratchet, it is a filter.
//
// SERVER: declared OUT of this witness. app/api/** is the server route plane;
// lib/manuscript/render/** is server-side PDF generation (pandoc → Paged.js →
// Puppeteer, via app/api/book-studio/render), whose HTML is never delivered to
// a member's browser as a production web surface.
//
// That second exclusion is a CURRENT CALL-PATH CLASSIFICATION, not an eternal
// property of the pathname. Nothing under lib/manuscript/render/ is
// intrinsically server-only. If one of those stylesheets later becomes
// client-imported, or that HTML is ever delivered to a browser rather than
// rendered to a PDF, this exclusion becomes false and must be revisited.
// DOCS: markdown is not source capable of being brought into the deployed
// client by an import or a link.
const SERVER_PLANE = [/^app\/api\//, /^lib\/manuscript\/render\//];
const DOCS_PLANE = [/\.mdx?$/i];
const planeOf = (file) =>
  SERVER_PLANE.some((re) => re.test(file)) ? 'server'
  : DOCS_PLANE.some((re) => re.test(file)) ? 'docs'
  : 'client';

const originHost = new URL(ORIGIN).host;

/* ── subject binding ─────────────────────────────────────────────────── */

function ssh(cmd, label, { allowEmpty = false } = {}) {
  const out = execFileSync('ssh', [SSH_HOST, cmd], {
    encoding: 'utf8', timeout: 60_000,
  }).trim();
  if (!out && !allowEmpty) throw new Error(`${label}: empty result`);
  return out;
}

/**
 * Remote command that reports its EXIT STATUS, not just its output.
 *
 * `cmd 2>/dev/null || true` collapses three different worlds into one empty
 * string: a valid no-match, an unreadable path, and a genuine tool failure.
 * An instrument that cannot tell those apart can turn an error into "zero
 * findings" and then into PASS. Every remote read here is fail-closed.
 */
function sshStatus(cmd, label) {
  let out;
  try {
    out = execFileSync('ssh', [SSH_HOST, `${cmd}; printf '\\n__EXIT:%d\\n' "$?"`],
      { encoding: 'utf8', timeout: 90_000, maxBuffer: 32 * 1024 * 1024 });
  } catch (err) {
    throw new Error(`${label}: ssh transport failed: ${err.message}`);
  }
  const m = out.match(/\n__EXIT:(\d+)\n\s*$/);
  if (!m) throw new Error(`${label}: could not read remote exit status`);
  return { out: out.slice(0, m.index), code: Number(m[1]) };
}

/**
 * Local git, invoked directly — no `sh -c`. Shell quoting and path expansion
 * have no business inside an evidence instrument: a path with a space or a
 * glob character must not be able to change what gets swept.
 */
function git(args, { maxBuffer = 32 * 1024 * 1024 } = {}) {
  try {
    const out = execFileSync('git', ['-C', REPO_ROOT, ...args],
      { encoding: 'utf8', timeout: 90_000, maxBuffer });
    return { out, code: 0 };
  } catch (err) {
    return {
      out: typeof err.stdout === 'string' ? err.stdout : '',
      code: typeof err.status === 'number' ? err.status : -1,
      message: err.message,
    };
  }
}

/**
 * Production reports GIT_COMMIT as an ABBREVIATED sha (observed: `6ff0beafc`,
 * `8369594f3`; the deploy lane stamps `target_sha=d8fc2082d`). EXPECT_SHA is
 * required to be the full 40 characters. Comparing them with `===` — which
 * v2.2 and v2.3 did — can never be true, so every run reported INVALID on
 * subject binding no matter what production was serving. PASS was unreachable.
 *
 * Resolving through the object store is the right repair, not prefix-matching:
 * `git rev-parse --verify <short>^{commit}` yields the FULL id, so the
 * comparison stays exact, and an ambiguous abbreviation fails instead of
 * silently matching. A production sha that cannot be resolved in REPO_ROOT is
 * INVALID — production is running a commit this object store does not have, so
 * nothing here could describe it.
 */
function resolveCommit(rev) {
  const r = git(['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]);
  const full = (r.out ?? '').trim();
  return r.code === 0 && SHA40.test(full) ? full : null;
}

function readProductionSha(label) {
  try {
    return ssh(`docker exec ${CONTAINER} printenv GIT_COMMIT`, label);
  } catch (err) {
    throw new Error(
      `could not read production GIT_COMMIT (${label}): ${err.message}\n` +
        'The subject cannot be bound, so no result would know what it describes.',
    );
  }
}

/* ── W4a — served production sweep ───────────────────────────────────── */

/**
 * Grep the container's browser-deliverable roots. This catches references
 * that are SERVED but not requested by the surfaces we happened to visit —
 * exactly the class of defect that made v1 generalize two pages to an origin.
 */
function sweepServed() {
  const roots = SERVED_ROOTS.join(' ');

  // Establish the roots EXIST and are readable before accepting any result
  // from them. A missing /app/.next/static would otherwise yield "no matches".
  const probe = sshStatus(
    `docker exec ${CONTAINER} sh -c "for d in ${roots}; do if [ -d \\"\\$d\\" ]; then echo OK:\\$d; else echo MISSING:\\$d; fi; done"`,
    'served root probe',
  );
  if (probe.code !== 0) {
    throw new Error(`served root probe exited ${probe.code} — roots unverifiable`);
  }
  const missing = probe.out.split('\n').filter((l) => l.startsWith('MISSING:'));
  if (missing.length) {
    throw new Error(
      `served root(s) absent in ${CONTAINER}: ${missing.map((l) => l.slice(8)).join(', ')} ` +
      '— a sweep of a path that is not there is not a clean result',
    );
  }

  // grep exit 0 = matches · 1 = valid no-match · anything else = failure.
  const found = sshStatus(
    `docker exec ${CONTAINER} sh -c "grep -rlE 'fonts\\.(googleapis|gstatic)\\.com' ${roots}"`,
    'served sweep',
  );
  if (found.code > 1) {
    throw new Error(`served sweep grep exited ${found.code} — not a no-match result`);
  }
  const files = found.code === 0
    ? found.out.split('\n').map((x) => x.trim()).filter(Boolean)
    : [];

  const classified = [];
  for (const file of files) {
    // FULL file content, fail-closed. Truncation is for the console only: a
    // file whose first five matches are prose and whose sixth is a real
    // <link href="https://fonts.googleapis.com/..."> must not read as prose.
    const read = sshStatus(
      `docker exec ${CONTAINER} cat ${JSON.stringify(file)}`,
      `served read ${file}`,
    );
    if (read.code !== 0) {
      throw new Error(`could not read served file ${file} (exit ${read.code}) — classification impossible`);
    }
    classified.push({
      file,
      fetchable: isFetchable(read.out),
      matches: countMatches(read.out),
      sample: firstFetchableLine(read.out),
    });
  }
  return classified;
}

/* ── W4b — re-entry ratchet ──────────────────────────────────────────── */

function sweepSource() {
  // Reads the COMMIT, not a checkout. Stronger than "HEAD == EXPECT_SHA and the
  // worktree is clean": that pair is only a proxy for "the source I swept is the
  // subject's source". A sparse checkout, an excluded path, a partial clone or a
  // stray ignore rule can all satisfy the proxy while hiding source from a
  // filesystem grep. Asking Git for the commit's tree is the thing itself.
  //
  // git grep exit 0 = matches · 1 = valid zero matches · anything else = a real
  // Git failure, which must never be reported as "no findings". cat-file -e on
  // the commit proves the commit object exists; it does NOT prove every tree and
  // blob under it is readable — exactly the partial-clone case this instrument
  // names. So every read below is fail-closed.
  const found = git(['grep', '-lE', GOOGLE_HOST_RE_SRC, EXPECT_SHA, '--', ...SOURCE_ROOTS]);
  if (found.code > 1) {
    return { error: `git grep exited ${found.code} in ${REPO_ROOT}: ${found.message ?? 'unknown'}` };
  }
  const files = found.code === 0
    ? found.out.split('\n').filter(Boolean).map((row) => row.replace(/^[^:]*:/, ''))
    : [];

  const entries = [];
  for (const file of files) {
    // Read the whole blob from the object store and classify THAT — not a
    // grep excerpt. A blob that cannot be read is INVALID, never "no match".
    const blob = git(['show', `${EXPECT_SHA}:${file}`]);
    if (blob.code !== 0) {
      return { error: `could not read blob ${EXPECT_SHA}:${file} (exit ${blob.code}) — classification impossible` };
    }
    entries.push({
      file,
      plane: planeOf(file),
      fetchable: isFetchable(blob.out),
      matches: countMatches(blob.out),
      sample: firstFetchableLine(blob.out),
    });
  }
  return { entries };
}

/** Non-gating hygiene: what state the object store's checkout happens to be in. */
function repoHygiene() {
  const q = (args) => {
    const r = git(args);
    return r.code === 0 ? r.out.trim() : null;
  };
  return { head: q(['rev-parse', 'HEAD']), dirty: q(['status', '--porcelain']) };
}

/* ── observation ─────────────────────────────────────────────────────── */

async function observe(browser, url) {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();

  // Both must be in force BEFORE the first navigation, or the network log
  // describes a cache/worker rather than production.
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.setBypassServiceWorker', { bypass: true });

  const responses = [];
  const requestedUrls = [];
  cdp.on('Network.requestWillBeSent', (e) => requestedUrls.push(e.request.url));
  cdp.on('Network.responseReceived', (e) =>
    responses.push({
      url: e.response.url,
      status: e.response.status,
      fromCache: Boolean(e.response.fromDiskCache || e.response.fromPrefetchCache),
      type: e.type,
    }));

  let navError = null;
  let documentHtml = '';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    await new Promise((r) => setTimeout(r, 1500));
    documentHtml = await page.content();
  } catch (err) {
    navError = err.message;
  }

  const finalUrl = page.url();

  // W3 — what the renderer ACTUALLY used. document.fonts.check() is not an
  // acceptable substitute: it can return true for a family that does not exist.
  const platformFonts = new Map();
  if (!navError) {
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: false });
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
        nodeId: root.nodeId,
        selector: 'h1, h2, h3, p, li, td, th, span, a, button',
      });
      for (const nodeId of nodeIds.slice(0, 120)) {
        let used;
        try {
          ({ fonts: used } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }));
        } catch { continue; } // node detached mid-walk; not a finding
        for (const f of used ?? []) {
          if (!f.glyphCount) continue;
          const prev = platformFonts.get(f.familyName) ?? { glyphCount: 0, isCustomFont: false };
          platformFonts.set(f.familyName, {
            glyphCount: prev.glyphCount + f.glyphCount,
            isCustomFont: prev.isCustomFont || Boolean(f.isCustomFont),
          });
        }
      }
    } catch (err) {
      navError ??= `render inspection failed: ${err.message}`;
    }
  }

  await page.close();

  const isFont = (r) => r.type === 'Font' || FONT_EXT.test(r.url);
  const hostOf = (u) => { try { return new URL(u).host; } catch { return ''; } };
  const pathOf = (u) => { try { return new URL(u).pathname; } catch { return ''; } };
  const fontResponses = responses.filter(isFont);
  const sameOrigin = (r) => hostOf(r.url) === originHost;

  return {
    url, finalUrl, navError,
    // Every request to a Google font host regardless of resource type — the
    // css2 stylesheet is a Stylesheet, not a Font, and must still count.
    googleRequests: requestedUrls.filter((u) => GOOGLE_FONT_HOSTS.includes(hostOf(u))),
    fontResponses,
    // Deliberately vendored by this repair.
    vendored: fontResponses.filter((r) => sameOrigin(r) && pathOf(r.url).startsWith('/fonts/')),
    // Same-origin runtime evidence, but NOT evidence of /fonts vendoring.
    // Build provenance behind it is accounted separately.
    nextFontMedia: fontResponses.filter(
      (r) => sameOrigin(r) && pathOf(r.url).startsWith('/_next/static/media/')),
    offOrigin: fontResponses.filter((r) => !sameOrigin(r)),
    servedFromCache: fontResponses.filter((r) => r.fromCache),
    // W4a on the delivered document itself, not just on disk in the container.
    docGoogleRef: isFetchable(documentHtml),
    platformFonts,
  };
}

/* ── report ──────────────────────────────────────────────────────────── */

const pad = (s, n) => String(s).padEnd(n);
const mark = (ok) => (ok ? 'PASS' : 'FAIL');

async function run() {
  const failures = [];
  const invalid = [];

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║   Local Fonts — Production Witness · INSTRUMENT v${pad(INSTRUMENT_VERSION, 11)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  origin: ${ORIGIN}`);
  console.log(`  run at: ${new Date().toISOString()}`);
  console.log('');

  /* PREFLIGHT — the run does not begin without a bound subject and a readable
     object store holding it. Each of these is INVALID, not FAIL: an instrument
     that could not reach its subject has no finding in either direction. */
  if (!EXPECT_SHA) {
    invalid.push('WITNESS_EXPECT_SHA is required — a production acceptance witness ' +
      'without an exact subject has no useful mode');
  } else if (!SHA40.test(EXPECT_SHA)) {
    invalid.push(`WITNESS_EXPECT_SHA must be a full 40-character commit SHA, got "${EXPECT_SHA}"`);
  }
  if (!REPO_ROOT) {
    invalid.push('WITNESS_REPO_ROOT is required — the instrument lives outside the subject, so ' +
      'its own location says nothing about where the subject\'s objects are');
  }
  // Instrument identity is a validity condition, not a decoration. The
  // acceptance record binds TWO identities; if we cannot name this one, the
  // run is not reconstructible and must not be able to reach PASS.
  const instrumentBlob = instrumentBlobId();
  if (!instrumentBlob || !SHA40.test(instrumentBlob)) {
    invalid.push('could not compute this instrument\'s own blob id — the acceptance ' +
      'record binds SUBJECT and INSTRUMENT, and a run that cannot name its ' +
      'instrument is not reconstructible');
  }

  let objectPresent = false;
  if (EXPECT_SHA && SHA40.test(EXPECT_SHA) && REPO_ROOT) {
    if (git(['cat-file', '-e', `${EXPECT_SHA}^{commit}`]).code === 0) {
      objectPresent = true;
    } else {
      invalid.push(`commit ${EXPECT_SHA} is not present in the object store at ${REPO_ROOT} ` +
        '— W4b cannot read the subject\'s source, so no sweep of it is possible');
    }
  }
  if (invalid.length) {
    console.log('INVALID — preflight failed, no observation attempted:');
    for (const m of invalid) console.log(`  · ${m}`);
    console.log('');
    console.log('RESULT                 INVALID');
    console.log('');
    return 2;
  }

  /* W0a */
  let preSha = null;
  try { preSha = readProductionSha('before'); }
  catch (err) { invalid.push(err.message); }
  let preFull = null;
  if (preSha) {
    preFull = resolveCommit(preSha);
    if (!preFull) {
      invalid.push(`production reports GIT_COMMIT=${preSha}, which cannot be resolved to a ` +
        `commit in ${REPO_ROOT} (absent, or an ambiguous abbreviation) — the running ` +
        'code cannot be identified, so nothing observed here could describe it');
    } else if (preFull !== EXPECT_SHA) {
      invalid.push(`deployed commit ${preFull} (reported as ${preSha}) != expected subject ${EXPECT_SHA}`);
    }
  }

  const userDataDir = mkdtempSync(join(tmpdir(), 'maia-fonts-witness-'));
  let browser;
  const observations = [];
  try {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir, // fresh profile: no carried-over font cache
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    for (const surface of SURFACES) {
      const o = await observe(browser, `${ORIGIN}${surface.path}`);
      observations.push({ ...o, surface });
    }
  } catch (err) {
    invalid.push(`browser run failed: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    rmSync(userDataDir, { recursive: true, force: true });
  }

  /* W4a — served sweep, and W4b — source ratchet */
  let served = null;
  try { served = sweepServed(); }
  catch (err) { invalid.push(`served sweep failed: ${err.message}`); }
  const sourceResult = sweepSource();
  if (sourceResult.error) invalid.push(`W4b: ${sourceResult.error}`);
  const source = sourceResult.entries ?? null;
  const hygiene = repoHygiene();

  /* W0b */
  let postSha = null;
  try { postSha = readProductionSha('after'); }
  catch (err) { invalid.push(err.message); }
  let postFull = null;
  if (postSha) {
    postFull = resolveCommit(postSha);
    if (!postFull) {
      invalid.push(`post-observation GIT_COMMIT=${postSha} cannot be resolved to a commit ` +
        `in ${REPO_ROOT}`);
    } else if (postFull !== EXPECT_SHA) {
      invalid.push(`post-observation commit ${postFull} (reported as ${postSha}) != expected subject ${EXPECT_SHA}`);
    }
  }
  if (preFull && postFull && preFull !== postFull) {
    invalid.push(`subject changed mid-witness: ${preFull} → ${postFull}. ` +
      'A concurrent deploy replaced what was being measured.');
  }

  console.log('SUBJECT');
  console.log(`  expected             ${EXPECT_SHA}`);
  console.log(`  pre-navigation       ${preSha ?? 'UNREADABLE'}${preFull ? `  → ${preFull}` : '  → UNRESOLVABLE'}`);
  console.log(`  post-observation     ${postSha ?? 'UNREADABLE'}${postFull ? `  → ${postFull}` : '  → UNRESOLVABLE'}`);
  console.log('  (production reports an abbreviated sha; resolved through the object store)');
  console.log(`  subject stable       ${mark(Boolean(preFull) && preFull === postFull && preFull === EXPECT_SHA)}`);
  console.log(`  object store         ${REPO_ROOT}`);
  console.log(`  commit present       ${mark(objectPresent)}`);
  console.log('');

  console.log('INSTRUMENT');
  console.log(`  version              v${INSTRUMENT_VERSION}`);
  console.log(`  blob id              ${instrumentBlob}`);
  console.log('  external to subject  YES — v2.2 is not part of the deployed commit');
  console.log('  browser profile      FRESH (no carried-over font cache)');
  console.log('  browser cache        DISABLED before first navigation');
  console.log('  service workers      BYPASSED before first navigation');
  console.log(`  surfaces             ${observations.length}`);
  console.log('');

  // Hygiene only. W4b reads the commit, so none of this gates the verdict.
  console.log('REPO HYGIENE           (informational — does NOT gate)');
  console.log(`  checkout HEAD        ${hygiene.head ?? 'unreadable'}${
    hygiene.head === EXPECT_SHA ? '  (== subject)' : '  (!= subject — irrelevant, objects were read)'}`);
  console.log(`  worktree             ${hygiene.dirty === null ? 'unreadable' : hygiene.dirty ? 'dirty' : 'clean'}`);
  console.log('');

  let totalFonts = 0;
  let totalVendored = 0;
  let anyVendoredRenderedAnywhere = false;

  for (const o of observations) {
    const isMember = o.url.endsWith(MEMBER_PATH);
    console.log(`SURFACE  ${o.url}`);
    console.log(`  final url            ${o.finalUrl}`);
    if (o.navError) {
      invalid.push(`${o.url}: ${o.navError}`);
      console.log(`  navigation           INVALID — ${o.navError}`);
      console.log('');
      continue;
    }
    // Applies to every surface: a run that measured the sign-in page measured
    // neither subject, whichever navigation slid.
    if (SIGNIN_PATH.test(new URL(o.finalUrl).pathname)) {
      invalid.push(`${o.url} redirected to ${o.finalUrl} — that surface was not reached`);
      console.log('  surface reached      INVALID — redirected to sign-in');
    } else if (isMember) {
      console.log('  member surface       REACHED');
    }

    totalFonts += o.fontResponses.length;
    totalVendored += o.vendored.length;

    console.log('  NETWORK');
    console.log(`    font responses         ${o.fontResponses.length}`);
    console.log(`    /fonts/...             ${o.vendored.length}   same-origin · vendored by this repair`);
    console.log(`    /_next/static/media    ${o.nextFontMedia.length}   same-origin runtime · NOT /fonts evidence`);
    console.log(`    off-origin fonts       ${o.offOrigin.length}`);
    console.log(`    fonts.googleapis.com   ${o.googleRequests.filter((u) => u.includes('googleapis')).length}`);
    console.log(`    fonts.gstatic.com      ${o.googleRequests.filter((u) => u.includes('gstatic')).length}`);
    if (o.servedFromCache.length) {
      console.log(`    served from cache      ${o.servedFromCache.length}   ← cache guard leaked`);
      invalid.push(`${o.url}: ${o.servedFromCache.length} font responses came from cache`);
    }
    if (o.docGoogleRef) {
      console.log('    document reference     PRESENT   ← W4a: delivered HTML references a Google font host');
      failures.push(`${o.url}: delivered document contains a fetchable Google Fonts reference`);
    }
    if (o.googleRequests.length) {
      failures.push(`${o.url}: ${o.googleRequests.length} request(s) to Google font hosts`);
      for (const u of o.googleRequests.slice(0, 10)) console.log(`      ! ${u}`);
    }
    if (o.offOrigin.length) {
      failures.push(`${o.url}: ${o.offOrigin.length} font response(s) not from ${originHost}`);
      for (const r of o.offOrigin.slice(0, 10)) console.log(`      ! ${r.url}`);
    }

    console.log('  RENDER');
    if (o.platformFonts.size === 0) {
      invalid.push(`${o.url}: no platform fonts observed — render inspection did not reach the page`);
      console.log('    (none observed — INVALID)');
    }
    for (const [family, info] of [...o.platformFonts.entries()].sort()) {
      const isVendored = VENDORED_FAMILIES.includes(family);
      // A system/local OS face is neither third-party failure nor evidence of
      // vendored-font reach.
      const kind = isVendored ? 'vendored' : info.isCustomFont ? 'webfont ' : 'system  ';
      console.log(`    ${pad(family, 26)} ${kind}  ${info.isCustomFont ? 'custom font' : 'platform   '}  ${info.glyphCount} glyphs`);
      if (isVendored) anyVendoredRenderedAnywhere = true;
    }

    // W3 — POSITIVE per-surface expectation. A face that silently fell back to
    // a system stack renders fine and proves nothing; only this catches it.
    const expect = o.surface?.expectAnyOf ?? null;
    if (expect) {
      const got = expect.filter((fam) => {
        const info = o.platformFonts.get(fam);
        return info && info.glyphCount > 0 && info.isCustomFont;
      });
      console.log(`    expected face          ${expect.join(' | ')}`);
      console.log(`    rasterized             ${mark(got.length > 0)}${got.length ? `  (${got.join(', ')})` : '  ← silent fallback'}`);
      if (got.length === 0) {
        failures.push(
          `${o.url}: none of [${expect.join(', ')}] rasterized as a custom face — ` +
          'the intended webfont fell back silently');
      }
    } else if (o.surface?.systemOk) {
      console.log('    expected face          none — system stack is intended here');
    } else {
      console.log('    expected face          NOT ASSERTED for this surface');
    }
    if (o.surface?.why) console.log(`    why                    ${o.surface.why}`);
    console.log('');
  }

  /* W3 vendored-reach + REACH */
  console.log('W3  RENDER / ORIGIN');
  console.log(`  network-fetched fonts all same-origin   ${mark(observations.every((o) => o.offOrigin.length === 0))}`);
  console.log(`  per-surface expectations met            ${mark(!failures.some((f) => f.includes('rasterized as a custom face')))}`);
  console.log(`  >=1 vendored /fonts face rasterized     ${mark(anyVendoredRenderedAnywhere)}`);
  if (!anyVendoredRenderedAnywhere && totalFonts > 0) {
    failures.push('no deliberately vendored /fonts/... family rasterized on any surface');
  }
  console.log('');

  console.log('REACH');
  console.log(`  total font responses   ${totalFonts}`);
  console.log(`  total /fonts responses ${totalVendored}`);
  if (totalFonts === 0) invalid.push('zero font responses across all surfaces — instrument failure, not a pass');
  if (totalVendored === 0) invalid.push(
    'zero vendored /fonts/... responses — the witness did not reach its subject; ' +
    'a clean Google count here proves nothing');
  console.log('');

  /* W4a */
  console.log('W4a SERVED PRODUCTION            ← claim evidence');
  if (served === null) {
    console.log('  NOT ESTABLISHED — the sweep did not complete (see INVALID below)');
  } else {
    const fetchable = served.filter((f) => f.fetchable);
    const prose = served.filter((f) => !f.fetchable);
    console.log(`  roots                  ${SERVED_ROOTS.join(' ')}`);
    console.log(`  fetchable references   ${fetchable.length}`);
    console.log(`  prose mentions         ${prose.length}   (informational — never gates)`);
    console.log('  classified on FULL matching content; samples below are display-only');
    for (const f of fetchable) console.log(`      ! ${f.file}  [${f.matches} match(es)]  ${f.sample.slice(0, 84)}`);
    for (const f of prose) console.log(`      · ${f.file}  [${f.matches} match(es)]`);
    if (fetchable.length) {
      failures.push(`${fetchable.length} browser-deliverable production asset(s) reference a Google font host`);
    }
  }
  console.log('');

  /* W4b */
  console.log('W4b RE-ENTRY RATCHET             ← preventive governance, not runtime evidence');
  if (source === null) {
    console.log('  (repo unreadable)');
  } else {
    const client = source.filter((f) => f.fetchable && f.plane === 'client');
    const server = source.filter((f) => f.fetchable && f.plane === 'server');
    const docs = source.filter((f) => f.fetchable && f.plane === 'docs');
    const prose = source.filter((f) => !f.fetchable);
    console.log(`  source                 git objects @ ${EXPECT_SHA.slice(0, 12)} — NOT the working tree`);
    console.log(`  roots                  ${SOURCE_ROOTS.join(' ')}`);
    console.log(`  client-plane vectors   ${client.length}   ← gates closure`);
    for (const f of client) console.log(`      ! ${f.file}  [${f.matches} match(es)]  ${f.sample.slice(0, 82)}`);
    console.log(`  server-plane refs      ${server.length}   (declared OUT — reported, does not gate)`);
    for (const f of server) console.log(`      · ${f.file}`);
    console.log(`  documentation refs     ${docs.length}   (not deliverable source — does not gate)`);
    for (const f of docs) console.log(`      · ${f.file}`);
    console.log(`  prose mentions         ${prose.length}   (informational — does not gate)`);
    for (const f of prose) console.log(`      · ${f.file}`);
    if (client.length) {
      failures.push(
        `${client.length} browser-targetable source file(s) retain a Google Fonts re-entry vector ` +
        '(not evidence the dependency was active — evidence the path back is open)');
    }
  }
  console.log('');

  /* verdict */
  let code = 0, verdict = 'PASS';
  if (invalid.length) { code = 2; verdict = 'INVALID'; }
  else if (failures.length) { code = 1; verdict = 'FAIL'; }

  if (invalid.length) {
    console.log('INVALID — the instrument did not validly reach its subject.');
    console.log('This licenses nothing in either direction; the claim keeps the state it held.');
    for (const m of invalid) console.log(`  · ${m}`);
    console.log('');
  }
  if (failures.length) {
    console.log('FAILURES:');
    for (const m of failures) console.log(`  · ${m}`);
    console.log('');
  }

  console.log(`RESULT                 ${verdict}`);
  console.log('');
  if (code === 0) {
    console.log('This PASS licenses exactly one claim:');
    console.log('  "The production site\'s runtime Google Fonts dependency has been');
    console.log(`   removed and witnessed."`);
    console.log('');
    console.log(`  SUBJECT     ${EXPECT_SHA}`);
    console.log(`              reported by production as ${preSha}`);
    console.log(`  INSTRUMENT  ${instrumentBlob}  (v${INSTRUMENT_VERSION} blob)`);
    console.log('');
    console.log('  Bind BOTH to the acceptance record. Reconstruct with:');
    console.log('    git cat-file blob <INSTRUMENT>   ·   git checkout <SUBJECT>');
    console.log('');
    console.log('It does NOT establish build-plane independence, hermeticity, offline');
    console.log('operation, server-side generation independence, or that cognition is');
    console.log('local. Those remain NOT TESTED and are accounted separately.');
    console.log('');
    console.log('Per docs/canon/CLAIM_STATE_AUTHORITY.md: this establishes what state is');
    console.log('warranted. It does not itself edit the public record.');
  } else {
    console.log('No claim is licensed. The /accounted-for typeface row stays External today.');
  }
  console.log('');
  return code;
}

run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('');
    console.error(`INVALID — witness aborted: ${err.message}`);
    console.error('');
    process.exit(2);
  });

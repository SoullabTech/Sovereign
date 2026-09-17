#!/usr/bin/env node
/**
 * PRACTITIONER-OFFER-01 · A3-R3-R1 — Canonical Claim & Slug Binding
 *
 * Static guards. These make F1/F2/F3 regressions fail without a database.
 *
 * Every scan strips comments first. A file that documents its own compliance — or names
 * the defect it closes — must not fail for saying so. (The C21 lesson: a prose ban read
 * as the banned behaviour returning.)
 *
 * Each guard was demonstrated RED against the pre-repair state at 087b7fa3 before being
 * trusted. A guard that has never failed is an assertion, not an instrument.
 */

import { readFileSync, existsSync } from 'node:fs';

const CLAIM_ROUTE = 'app/api/portal/[slug]/claim/route.ts';
const RETIRED_ROUTE = 'app/api/portal/[slug]/invites/claim/route.ts';
const SIGNIN_ROUTE = 'app/api/portal/[slug]/client-auth/signin/route.ts';
const CLAIM_PAGE = 'app/portal/[slug]/claim/page.tsx';

/**
 * Invite-consuming writers OUTSIDE the portal route surface, declared explicitly.
 *
 * ROUTED OUT, NOT REPAIRED. `lib/coachField/invitation.ts` also transitions an invite to
 * 'claimed', and its predicate carries no `status = 'unused'` term — the same defect
 * class as F3. It belongs to the coach-field lane, not to A3-R3-R1, and repairing it
 * here would widen this unit past F1/F2/F3.
 *
 * It is declared rather than excluded so that it stays visible. A NEW entry appearing in
 * this scan fails the guard: the inventory may shrink by repair, never grow by drift.
 */
const DECLARED_EXTERNAL_CONSUMERS = ['lib/coachField/invitation.ts'];

const failures = [];
const notes = [];

function strip(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

function read(path) {
  if (!existsSync(path)) {
    failures.push(`MISSING FILE: ${path}`);
    return null;
  }
  return strip(readFileSync(path, 'utf8'));
}

function norm(s) {
  return s.replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// G-R1-1 — slug is never an authenticator
//
// Any portal handler that mints a client session must bind the route slug as a
// predicate of its resolving query. Selecting the slug and comparing it afterwards is
// the exact shape of F1/F2 and does not satisfy this guard.
// ---------------------------------------------------------------------------
for (const path of [CLAIM_ROUTE, SIGNIN_ROUTE]) {
  const src = read(path);
  if (!src) continue;
  const flat = norm(src);

  if (!/createClientSession/.test(flat)) {
    notes.push(`G-R1-1: ${path} mints no session; slug binding not required here.`);
    continue;
  }
  if (!/p\.slug\s*=\s*\$\d/.test(flat)) {
    failures.push(
      `G-R1-1: ${path} mints a client session without binding the route slug as a query predicate (expected \`p.slug = $n\`).`
    );
  }
  if (/FROM\s+practitioner_clients\s+c\s+LEFT\s+JOIN/i.test(flat)) {
    failures.push(
      `G-R1-1: ${path} resolves the client before the practice via LEFT JOIN; the practice must be the anchor.`
    );
  }
}

// ---------------------------------------------------------------------------
// G-R1-2 — claim is a conditional mutation
//
// Consumption must carry every precondition in its predicate and read the affected-row
// count. No preceding SELECT may establish the right to consume.
// ---------------------------------------------------------------------------
{
  const src = read(CLAIM_ROUTE);
  if (src) {
    const flat = norm(src);
    const consume = flat.match(/UPDATE\s+client_invites[\s\S]*?(?:RETURNING[^`]*)?`/i);

    if (!consume) {
      failures.push('G-R1-2: no client_invites consumption statement found in the canonical claim route.');
    } else {
      const stmt = consume[0];
      if (!/status\s*=\s*'unused'/i.test(stmt)) {
        failures.push("G-R1-2: consumption predicate omits `status = 'unused'` — check-then-update remains reachable.");
      }
      if (!/expires_at/i.test(stmt)) {
        failures.push('G-R1-2: consumption predicate omits an expiry term; expiry must be evaluated by the database.');
      }
      if (!/RETURNING/i.test(stmt)) {
        failures.push('G-R1-2: consumption statement has no RETURNING clause; the affected-row count cannot be the authority.');
      }
    }

    if (!/rowCount\s*!==\s*1/.test(flat)) {
      failures.push('G-R1-2: the canonical claim route never asserts exactly one affected row.');
    }
    if (!/transaction\s*\(/.test(flat)) {
      failures.push('G-R1-2: consumption and credential creation are not enclosed in a transaction.');
    }
    // A refusal path must not write.
    if (/SET\s+status\s*=\s*'expired'/i.test(flat)) {
      failures.push('G-R1-2: the claim route mutates invite state on a refusal path; refusals must leave the row untouched.');
    }
  }
}

// ---------------------------------------------------------------------------
// G-R1-3 — one claim authority
//
// Exactly one route under app/api/portal may consume an invite; the retired duplicate
// must retain no claim capability; the UI must reach only the canonical route; and every
// consumer outside the portal surface must already be declared.
// ---------------------------------------------------------------------------
{
  const retired = read(RETIRED_ROUTE);
  if (retired) {
    const flat = norm(retired);
    for (const [pattern, label] of [
      [/client_invites/i, 'reads or writes client_invites'],
      [/hashInviteCode/, 'hashes an invite code'],
      [/createClientSession/, 'mints a client session'],
      [/portal_password_hash/, 'writes portal credentials'],
    ]) {
      if (pattern.test(flat)) {
        failures.push(`G-R1-3: the retired route still ${label}; it must hold no claim capability.`);
      }
    }
  }

  const page = read(CLAIM_PAGE);
  if (page && /\/invites\/claim/.test(norm(page))) {
    failures.push('G-R1-3: the claim UI still calls the retired /invites/claim endpoint.');
  }
}

// Inventory: consumers outside app/api/portal must match the declared set exactly.
{
  const { execSync } = await import('node:child_process');
  let hits = [];
  try {
    hits = execSync(
      `grep -rln "status = 'claimed'" --include='*.ts' app lib 2>/dev/null || true`,
      { encoding: 'utf8' }
    )
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((p) => !p.startsWith('app/api/portal/'));
  } catch {
    failures.push('G-R1-3: inventory scan could not run.');
  }

  const undeclared = hits.filter((h) => !DECLARED_EXTERNAL_CONSUMERS.includes(h));
  for (const u of undeclared) {
    failures.push(`G-R1-3: undeclared invite consumer outside the portal surface: ${u}`);
  }
  const stale = DECLARED_EXTERNAL_CONSUMERS.filter((d) => !hits.includes(d));
  for (const s of stale) {
    failures.push(`G-R1-3: declared external consumer ${s} no longer consumes invites; remove it from the declaration.`);
  }
  for (const h of hits.filter((h) => DECLARED_EXTERNAL_CONSUMERS.includes(h))) {
    notes.push(`G-R1-3: external consumer present and declared (ROUTED OUT, unrepaired): ${h}`);
  }
}

for (const n of notes) console.log(`  note  ${n}`);
if (failures.length === 0) {
  console.log('\nA3-R3-R1 guards: PASS (G-R1-1, G-R1-2, G-R1-3)');
  process.exit(0);
}
console.error('\nA3-R3-R1 guards: FAIL');
for (const f of failures) console.error(`  ✗ ${f}`);
process.exit(1);

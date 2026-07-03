import type { RefusalCheck } from './harness';

/**
 * Refusal 10 — The last founder cannot be removed.
 *
 * The admin_role grant endpoint refuses any change that would drop the platform
 * to zero founders: when the target is currently 'founder' and the new role is
 * not 'founder', it counts founders under a row lock and refuses (409) if that
 * count is <= 1. Structural guarantee against admin lockout.
 */

const ROUTE = 'app/api/admin/members/admin-role/route.ts';

export const check: RefusalCheck = {
  id: 'R10',
  refusal: 'The last remaining founder cannot be revoked or downgraded',
  grade: 'B',
  enforcedBy: `${ROUTE} — founder-count guard inside the FOR UPDATE transaction`,
  evidence: "guard on oldRole==='founder' && newRole!=='founder'; COUNT(*) founders; refuse when <= 1",
  violationAttempted:
    'find the last-founder guard missing, the founder count absent, or the demotion path lacking a refusal',
  passingAuthorizes: 'the endpoint structurally prevents the platform reaching zero founders',
  passingDoesNotAuthorize:
    'that all other lockout modes are covered — this proves only the last-founder path',
  hostileForkMustChange:
    'delete the founder-count guard or the oldRole/newRole founder condition, or remove the refusal return — visible diff',

  run(io) {
    const src = io.read(ROUTE);

    // 1. Guard condition present: currently founder, changing away from founder.
    if (/oldRole\s*===\s*'founder'\s*&&\s*newRole\s*!==\s*'founder'/.test(src)) {
      io.pass('Demotion-of-founder condition present');
    } else {
      io.fail('Missing "currently founder, changing away" condition');
    }

    // 2. Founder count is computed.
    if (/COUNT\(\*\)[\s\S]*?admin_role\s*=\s*'founder'/.test(src)) {
      io.pass('Counts remaining founders before allowing the change');
    } else {
      io.fail('No founder-count query — cannot enforce last-founder protection');
    }

    // 3. Refuses when count <= 1 (the last founder).
    if (/<=\s*1[\s\S]*?status:\s*409/.test(src) || /status:\s*409[\s\S]*?<=\s*1/.test(src)) {
      io.pass('Refuses (409) when only one founder remains');
    } else {
      io.fail('Missing refusal when the last founder would be removed');
    }

    // 4. The check runs under a row lock (atomic with the update).
    if (/FOR\s+UPDATE/.test(src)) {
      io.pass('Guard runs under FOR UPDATE (atomic with the write)');
    } else {
      io.warn('No FOR UPDATE lock found', 'last-founder check may race under concurrency');
    }
  },
};

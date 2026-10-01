/**
 * Mail Authority census (EMAIL-IDENTITY-01). Read-only.
 *   npm run census:mail-identity
 * Prints the registry by class, then every disagreement between source and
 * registry. Exits 1 on any violation.
 */
import path from 'path';
import { MAIL_IDENTITIES, UNGOVERNED_SOULLAB_SENDERS } from '../lib/email/identity';
import { censusMailIdentities } from '../lib/email/identityCensus';

const root = path.resolve(__dirname, '..');
for (const m of MAIL_IDENTITIES) {
  const lanes = m.appSendLanes.length ? m.appSendLanes.join('+') : '—';
  console.log(`${m.class.padEnd(15)} ${m.address.padEnd(28)} app:${lanes.padEnd(7)} proton:${m.protonMailbox}${m.openRuling ? '  ⚠ ruling owed' : ''}`);
}
for (const u of UNGOVERNED_SOULLAB_SENDERS) console.log(`UNGOVERNED      ${u.address.padEnd(28)} ${u.where}`);

const violations = censusMailIdentities(root);
console.log(`\nviolations: ${violations.length}`);
for (const v of violations) console.log(`  ${v.kind} ${v.address} @ ${v.where} — ${v.detail}`);
process.exit(violations.length ? 1 : 0);

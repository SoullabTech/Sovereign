import fs from 'node:fs';
import path from 'node:path';
import { segmentClaimUnits } from '../../../lib/maia/claimIdentityShadow/claimUnits';
import { bindGesture } from '../../../lib/maia/claimIdentityShadow/gestureBinding';

const fixtures = [
  {
    id: 'successful-recall',
    maia: `That phrase came up in an earlier exchange — you were talking about the image. Here's what you said: "the exact member-authored phrase recovered from the earlier exchange" Does that sound like the one you were reaching for?`,
    member: 'that is exactly it. MAIA!',
  },
  {
    id: 'restart-protest',
    maia: `The image. That phrase has weight — you've returned to it more than once. What does it hold for you in this moment.`,
    member: 'I already told you',
  },
  {
    id: 'multi-assertion-confirm',
    maia: `Silver Cedar is the guardian image. It also represents resilience. What opens now?`,
    member: 'that is exactly it',
  },
] as const;

const rows = fixtures.map((f) => {
  const claims = segmentClaimUnits(`fixture:${f.id}`, f.maia);
  return { id: f.id, claims, binding: bindGesture(f.member, claims) };
});
const out = path.join(
  process.cwd(),
  'docs/programme/evidence/relational-claim-identity/C4_OFFLINE_CLAIM_FIXTURES_2026-09-16.json',
);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(rows, null, 2) + '\n');
console.log(JSON.stringify(rows, null, 2));

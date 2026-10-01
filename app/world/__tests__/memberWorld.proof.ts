import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { HOUSE_PLACES } from '../../../lib/house/catalog';
import { matchRule } from '../../../config/accessMatrix';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'app/world/page.tsx'), 'utf8');

const rule = matchRule('/world');
assert.equal(rule?.minTier, 'free');
assert.notEqual(rule?.public, true);
assert.match(page, /requireMemberId/);
assert.match(page, /redirect\('\/signin'\)/);
assert.match(page, /`\$\{firstName\}’s World`/);
assert.match(page, /'Your World'/);assert.match(page, /href="\/house"/);
assert.match(page, /href="\/writers-studio"/);
assert.doesNotMatch(page, /work=/);
assert.doesNotMatch(page, /studioArrivalFromHouse/);
for (const forbidden of ['docs/programme','work-units-v2','canonical-list','JARVIS','RECOVERY_CANDIDATE_UNREVIEWED']) {
  assert.equal(page.includes(forbidden), false, forbidden);
}

const world = HOUSE_PLACES.find(place => place.id === 'world');
assert.ok(world);
assert.equal(world.label, 'My World');
assert.equal(world.href, '/world?from=house');
assert.equal(world.centerEligible, true);
console.log('MEMBER-WORLD-01 proof PASS');
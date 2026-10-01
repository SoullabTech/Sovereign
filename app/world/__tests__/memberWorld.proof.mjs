import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const page = read('app/world/page.tsx');
const catalog = read('lib/house/catalog.ts');
const access = read('config/accessMatrix.ts');

assert.match(page, /requireMemberId/);
assert.match(page, /redirect\('\/signin'\)/);
assert.match(page, /`\$\{firstName\}’s World`/);
assert.match(page, /'Your World'/);
assert.match(page, /href="\/house"/);
assert.match(page, /href="\/writers-studio"/);assert.doesNotMatch(page, /work=/);
assert.doesNotMatch(page, /studioArrivalFromHouse/);
for (const forbidden of ['docs/programme','work-units-v2','canonical-list','JARVIS','RECOVERY_CANDIDATE_UNREVIEWED']) {
  assert.equal(page.includes(forbidden), false, forbidden);
}
assert.match(catalog, /id:'world'.*label:'My World'.*href:'\/world\?from=house'/s);
assert.match(catalog, /id:'world'.*centerEligible:true/s);
assert.match(access, /exact: '\/world', minTier: 'free'/);
assert.doesNotMatch(access, /exact: '\/world', public: true/);
console.log('MEMBER-WORLD-01 proof PASS');assert.match(catalog, /DEFAULT_CENTER_IDS: HousePlaceId\[\] = \['writing','relationships','practices','community','studio'\]/);
const preferences = read('lib/house/preferences.ts');
assert.match(preferences, /shortcuts: \['journal','ideas','reflections','changes','decisions','relationships','writing','community','astrology'\]/);
assert.doesNotMatch(preferences, /shortcuts: \[[^\]]*'world'/);
console.log('MEMBER-WORLD-01 optional-placement proof PASS');
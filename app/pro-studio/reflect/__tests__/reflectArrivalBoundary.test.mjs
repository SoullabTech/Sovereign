// Read-only source boundary checks for R1b candidate. No HTTP calls or member data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=path.resolve(import.meta.dirname,'../../../../');
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const arrival=read('app/pro-studio/reflect/page.tsx');
const reflectView=read('components/pro-studio/ReflectArrivalView.tsx');
const studioLayout=read('app/studio/layout.tsx');
const access=read('config/accessMatrix.ts');
const practice=read('app/studio/page.tsx');

test('Reflect is a genuine separate app route, not nested in practitioner-only /studio layout',()=>{
 assert.match(arrival,/export default async function ReflectArrival/);
 assert.match(studioLayout,/router\.replace\('\/studio\/create'\)/);
 assert.doesNotMatch(arrival,/getCurrentPractitioner|\/api\/studio\/whoami|\/studio\/create/);
});
test('Reflect arrival is server-session bound and not a public unmapped route',()=>{
 assert.match(arrival,/getCurrentSession\(\)/);
 assert.match(arrival,/if \(!session\) redirect\('/);
 assert.match(access,/exact: '\/pro-studio\/reflect', minTier: 'free'/);
});
test('Reflect welcome has one MAIA encounter and no client, booking, team or reflection storage dependency',()=>{
 assert.match(reflectView,/Your work begins with you/);
 assert.match(reflectView,/href="\/maia\/encounter"/);
 assert.doesNotMatch(arrival + reflectView,/api\/studio|api\/reflection|fetch\(|query\(|getCurrentPractitioner|clientId|bookingId|teamId/);
});
test('Reflect orientation does not imply a paid grant, and free MAIA stays distinct',()=>{
 assert.match(reflectView,/paid[\s\S]*Reflect workspace and its membership permissions are not yet activated/);
 assert.match(access,/This path grants no premium Reflect\/Practice\/Collective capability/);
});
test('Practice Home uses typed resource outcomes and checks before the zero-state',()=>{
 assert.match(practice,/readStudioResource<Identity>/);
 assert.match(practice,/readStudioResource<ClientRow\[]>/);
 assert.match(practice,/readStudioResource<Booking\[]>/);
 assert.match(practice,/practiceHomeStanding\(w, c, b\)/);
 const failPos=practice.indexOf("if (practiceStanding !== 'ready')");
 const emptyPos=practice.indexOf('const isEmptyPractice');
 assert.ok(failPos>0&&emptyPos>failPos,'Must fail before showing empty practice');
});
test('Existing first-add-person action remains in Practice Home, not universal Reflect entry',()=>{
 assert.match(practice,/Add your first person/);
 assert.doesNotMatch(reflectView,/Add your first person/);
});

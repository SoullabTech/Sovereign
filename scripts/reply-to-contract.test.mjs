import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (rel) => fs.readFileSync(rel, 'utf8');
const portal = read('lib/portal/notifications.ts');
const scheduled = read('app/api/cron/scheduled-sends/route.ts');
const scheduledTest = read('app/api/studio/scheduled-sends/test/route.ts');
const followup = read('app/api/studio/session-followup/send/route.ts');

test('practitioner-branded booking mail replies to the practitioner', () => {
  assert.match(portal, /replyTo: practitioner\.email/);
});

test('system booking notices use support as Reply-To', () => {
  const matches = portal.match(/from: 'Soullab Bookings <bookings@soullab\.life>',[\s\S]{0,120}?replyTo: 'support@soullab\.life'/g) || [];
  assert.equal(matches.length, 3);
});

test('scheduled practitioner-authored sends reply to practitioner email with support fallback', () => {
  assert.match(scheduled, /p\.email AS practitioner_email/);
  assert.match(scheduled, /replyTo: row\.practitioner_email \|\| 'support@soullab\.life'/);
});

test('scheduled self-test replies to the authenticated sender', () => {
  assert.match(scheduledTest, /replyTo: selfEmail/);
});

test('session follow-up resolves practitioner Reply-To with support fallback', () => {
  assert.match(followup, /COALESCE\(p\.email, m\.email\) AS email/);
  assert.match(followup, /\|\| 'support@soullab\.life'/);
  assert.match(followup, /replyTo,/);
});

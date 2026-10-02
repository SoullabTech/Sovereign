import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const route = fs.readFileSync('app/api/build/alert/route.ts', 'utf8');

test('missing SMTP does not return before optional channels are considered', () => {
  const smtpStart = route.indexOf('const alertSmtp = resolveAlertSmtp()');
  const slackStart = route.indexOf('// 3. Send to Slack if configured');
  const telegramStart = route.indexOf('// 4. Send to Telegram if configured');
  const responseStart = route.indexOf('// Email is the required paging channel for this release');

  assert.ok(smtpStart >= 0);
  assert.ok(slackStart > smtpStart);
  assert.ok(telegramStart > slackStart);
  assert.ok(responseStart > telegramStart);

  const betweenSmtpAndSlack = route.slice(smtpStart, slackStart);
  assert.doesNotMatch(betweenSmtpAndSlack, /return NextResponse\.json\(\{ error: alertSmtp\.error/);
  assert.match(betweenSmtpAndSlack, /results\.email = false/);
});

test('required SMTP policy remains load-bearing', () => {
  assert.match(route, /const delivered = results\.email === true/);
  assert.match(route, /error: alertSmtpError \|\| "required_alert_email_not_delivered"/);
});

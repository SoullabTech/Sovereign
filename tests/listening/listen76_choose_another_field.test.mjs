import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../components/listening/FocusFieldDesk.tsx', import.meta.url), 'utf8');

test('a running field offers one tap to stop and choose a different field', () => {
  const at = src.indexOf('data-focus-choose-another');
  assert.ok(at > 0);
  const block = src.slice(at, at + 400);
  assert.ok(block.indexOf('stopFocusSession()') > 0 && block.indexOf('clearFocusSession()') > block.indexOf('stopFocusSession()'));
});

test('the one-tap exit is a member gesture only and sits in the running-session branch', () => {
  const run = src.indexOf('{sessionActive && (');
  const choose = src.indexOf('data-focus-choose-another');
  const terminal = src.indexOf('{sessionTerminal && (');
  assert.ok(run < choose && choose < terminal);
  assert.ok(!/useEffect\([^)]*clearFocusSession/.test(src));
});

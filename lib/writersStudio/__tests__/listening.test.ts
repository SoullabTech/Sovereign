/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { LISTEN_INTERVAL_MS, mayListen, newSince, newestFirst } from '../listening';

const VIEW = fs.readFileSync(path.resolve(__dirname, '../../../app/dev/writers-studio-p4r1/P4R1BetaJourney.tsx'), 'utf8');

describe('Listening: the founder sees answers as they arrive', () => {
  test('only answers that were not there before are new', () => {
    const fresh = newSince(new Set(['a', 'b']), [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect([...fresh]).toEqual(['c']);
    expect(newSince(new Set(['a']), [{ id: 'a' }]).size).toBe(0);
  });

  test('newest answers come first', () => {
    const list = newestFirst([{ id: 'old', createdAt: '2026-11-01T10:00:00Z' }, { id: 'new', createdAt: '2026-11-19T10:00:00Z' }]);
    expect(list.map((a) => a.id)).toEqual(['new', 'old']);
  });

  test('a check runs only when switched on, the view is open and the page is visible', () => {
    expect(mayListen({ on: true, viewOpen: true, visible: true })).toBe(true);
    for (const off of [{ on: false, viewOpen: true, visible: true }, { on: true, viewOpen: false, visible: true }, { on: true, viewOpen: true, visible: false }]) {
      expect(mayListen(off)).toBe(false);
    }
  });

  test('it checks no more than once a minute', () => {
    expect(LISTEN_INTERVAL_MS).toBeGreaterThanOrEqual(60_000);
  });

  test('listening is off by default, polls only the founder’s own view, and stops when the view closes', () => {
    expect(VIEW).toMatch(/const \[listening, setListening\] = useState\(false\);/);
    expect(VIEW).toMatch(/if \(!listening \|\| !founderView\) return;/);
    expect(VIEW).toMatch(/if \(founderView\) \{ setFounderView\(null\); setListening\(false\); return; \}/);
    const refresh = VIEW.slice(VIEW.indexOf('const refreshFounder'), VIEW.indexOf('// Low-rate listening'));
    expect(refresh).toMatch(/readFounderJourney\(\)/);
    expect(refresh).not.toMatch(/apiFetch|fetch\(/);
  });

  test('nothing on the writer’s side changes: no new send from the writer’s screens', () => {
    const lib = fs.readFileSync(path.resolve(__dirname, '../listening.ts'), 'utf8');
    expect(lib).not.toMatch(/^import /m);
    expect(lib).not.toMatch(/fetch\(|apiFetch|sendBeacon|localStorage/);
  });
});

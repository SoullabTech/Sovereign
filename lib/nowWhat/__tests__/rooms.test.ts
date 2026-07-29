/**
 * Navigation truthfulness — the shell must not describe a smaller environment
 * than the application contains, and every reachable room must say where it is.
 *
 * Preserved distinction (feeds the reachability matrix):
 *   EXISTENCE ≠ NAVIGABILITY ≠ INTENTIONAL EXPOSURE
 *
 * ⚠️ TEST-STRENGTH NOTE: as in the invitation-gate lane, these cannot render —
 * this repo's jest transform does not handle `.tsx` and there is no RTL. The
 * registry and route resolution ARE tested behaviourally (they are pure); the
 * shell's rendering is asserted structurally, and says so.
 */
import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { NOW_WHAT_ROOMS, NAV_DESTINATIONS, roomForPath } from '../rooms';

const shell = readFileSync(join(process.cwd(), 'components/now-what/NowWhatShell.tsx'), 'utf8');
const map = readFileSync(join(process.cwd(), 'components/now-what/EnvironmentMapView.tsx'), 'utf8');
const registrySrc = readFileSync(join(process.cwd(), 'lib/nowWhat/rooms.ts'), 'utf8');

describe('registry integrity', () => {
  it('every registered room corresponds to a real route file', () => {
    for (const room of NOW_WHAT_ROOMS) {
      const page = join(process.cwd(), 'app', `${room.route}`, 'page.tsx');
      expect(existsSync(page)).toBe(true);
    }
  });

  it('keys and routes are unique', () => {
    expect(new Set(NOW_WHAT_ROOMS.map((r) => r.key)).size).toBe(NOW_WHAT_ROOMS.length);
    expect(new Set(NOW_WHAT_ROOMS.map((r) => r.route)).size).toBe(NOW_WHAT_ROOMS.length);
  });

  it('knows more than three rooms — the environment grew and the hallway must follow', () => {
    expect(NOW_WHAT_ROOMS.length).toBeGreaterThan(3);
  });

  it('excludes routes that exist but are not rooms', () => {
    // arrive = the auth door; welcome = zero inbound links by design.
    const routes = NOW_WHAT_ROOMS.map((r) => r.route);
    expect(routes).not.toContain('/now-what/arrive');
    expect(routes).not.toContain('/now-what/welcome');
  });
});

describe('exposure — navigable is not the same as offered', () => {
  it('gated rooms are never navigation destinations', () => {
    const gated = NOW_WHAT_ROOMS.filter((r) => r.exposure === 'gated').map((r) => r.key);
    expect(gated).toEqual(expect.arrayContaining(['themes', 'reflections']));
    for (const key of gated) {
      expect(NAV_DESTINATIONS.some((d) => d.key === key)).toBe(false);
    }
  });

  it('gated rooms are still identifiable when standing in one', () => {
    expect(roomForPath('/now-what/themes')?.name).toBe('Themes');
    expect(roomForPath('/now-what/reflections')?.name).toBe('Reflections');
  });

  it('the map is identifiable but not a pill (it is the wordmark)', () => {
    expect(roomForPath('/now-what/map')?.key).toBe('map');
    expect(NAV_DESTINATIONS.some((d) => d.key === 'map')).toBe(false);
  });
});

describe('route resolution', () => {
  it('resolves each room from its own path', () => {
    for (const room of NOW_WHAT_ROOMS) {
      expect(roomForPath(room.route)?.key).toBe(room.key);
    }
  });

  it('query strings never change which room you are in', () => {
    expect(roomForPath('/now-what/room?fieldContext=now-what-demo&program=x')?.key).toBe('room');
    expect(roomForPath('/now-what/next?fieldContext=flourishing')?.key).toBe('next');
  });

  it('nested and trailing-slash paths resolve to the room', () => {
    expect(roomForPath('/now-what/field/')?.key).toBe('field');
    expect(roomForPath('/now-what/position/anything')?.key).toBe('position');
  });

  it('non-rooms and foreign paths resolve to null', () => {
    for (const p of ['/now-what/arrive', '/now-what/welcome', '/maia', '/', null, undefined, '']) {
      expect(roomForPath(p)).toBeNull();
    }
  });

  it('exactly one room matches any given path', () => {
    for (const room of NOW_WHAT_ROOMS) {
      const matches = NOW_WHAT_ROOMS.filter(
        (r) => room.route === r.route || room.route.startsWith(`${r.route}/`),
      );
      expect(matches).toHaveLength(1);
    }
  });
});

describe('shell and map cannot describe different environments (structural)', () => {
  it('the shell no longer declares its own room list', () => {
    expect(shell).not.toMatch(/const DOORS\s*[:=]/);
    expect(shell).toContain("from '@/lib/nowWhat/rooms'");
  });

  it('the shell resolves the active room from the real pathname, not a display string', () => {
    expect(shell).toContain('usePathname');
    expect(shell).toContain('roomForPath(pathname)');
    // The defect: comparing a caller-supplied name against the door list.
    expect(shell).not.toMatch(/d\.name === current/);
  });

  it('every route the map links is a registered room', () => {
    const linked = new Set(
      [...map.matchAll(/\/now-what\/([a-z-]+)/g)].map((m) => `/now-what/${m[1]}`),
    );
    const known = new Set(NOW_WHAT_ROOMS.map((r) => r.route));
    for (const route of linked) {
      // welcome is deliberately referenced-but-unlinked in the map source.
      if (route === '/now-what/welcome') continue;
      expect(known.has(route)).toBe(true);
    }
  });

  it('every registered non-gated room is offered somewhere', () => {
    for (const room of NOW_WHAT_ROOMS.filter((r) => r.exposure === 'open')) {
      const inShellNav = NAV_DESTINATIONS.some((d) => d.key === room.key);
      const inMap = map.includes(room.route);
      expect(inShellNav || inMap).toBe(true);
    }
  });
});

describe('client-safe — no server or database imports', () => {
  it('the registry imports nothing', () => {
    expect(registrySrc).not.toMatch(/^import /m);
  });

  it('the registry reaches no server-only module', () => {
    for (const forbidden of ['@/lib/db/postgres', 'next/server', "from 'pg'", 'fs', 'child_process']) {
      expect(registrySrc).not.toContain(forbidden);
    }
  });
});

describe('control (pre-fix source at acb757f87)', () => {
  const preFix = (p: string) =>
    execFileSync('git', ['show', `acb757f87:${p}`], { encoding: 'utf8', maxBuffer: 20e6 });

  it('pre-fix shell declared exactly three doors', () => {
    const src = preFix('components/now-what/NowWhatShell.tsx');
    const doors = src.match(/const DOORS[\s\S]*?\];/)?.[0] ?? '';
    expect(doors).toContain('/now-what/map');
    expect(doors).toContain('/now-what/room');
    expect(doors).toContain('/now-what/field');
    expect(doors).not.toContain('/now-what/position');
    expect(doors).not.toContain('/now-what/next');
    expect(doors).not.toContain('/now-what/questions');
  });

  it('pre-fix shell matched the active room by display string', () => {
    expect(preFix('components/now-what/NowWhatShell.tsx')).toMatch(/d\.name === current/);
  });

  it('pre-fix shell had no route awareness at all', () => {
    expect(preFix('components/now-what/NowWhatShell.tsx')).not.toContain('usePathname');
  });
});

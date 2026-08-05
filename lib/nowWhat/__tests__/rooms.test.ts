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
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { NOW_WHAT_ROOMS, NAV_DESTINATIONS, roomForPath } from '../rooms';

/**
 * Routes on disk that are deliberately NOT rooms. Redirects must actually
 * redirect (asserted below) — a retired route that renders content would be a
 * shadow room the registry does not know about.
 */
// 'practice' is the Practice Workspace — a PRACTITIONER-side surface, not a
// member room; it has zero member-surface inbound links and its disposition
// belongs to the practitioner-field lane, not the member ontology.
const NON_ROOM_ROUTES = ['arrive', 'welcome', 'practice'] as const;
const REDIRECT_ROUTES = ['cultivate', 'next', 'calendar', 'position', 'themes', 'reflections', 'home'] as const;

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
    const routes = NOW_WHAT_ROOMS.map((r) => r.route);
    for (const dir of [...NON_ROOM_ROUTES, ...REDIRECT_ROUTES]) {
      expect(routes).not.toContain(`/now-what/${dir}`);
    }
  });

  it('DISK → REGISTRY: every route directory is a room, a known non-room, or a real redirect', () => {
    // The inverse assertion the 2026-08-05 review found missing: registry→disk
    // held while three of the home's doors (cultivate/coaching/calendar) were
    // invisible to the registry. Any new route directory must now declare
    // itself — register it as a room, or add it to the allowlists above with
    // the honesty obligations they carry.
    const base = join(process.cwd(), 'app/now-what');
    const dirs = readdirSync(base).filter((d) => statSync(join(base, d)).isDirectory());
    const roomDirs = new Set(
      NOW_WHAT_ROOMS.filter((r) => r.route !== '/now-what').map((r) => r.route.replace('/now-what/', '')),
    );
    for (const dir of dirs) {
      if (!existsSync(join(base, dir, 'page.tsx'))) continue; // route groups / assets
      const known =
        roomDirs.has(dir) ||
        (NON_ROOM_ROUTES as readonly string[]).includes(dir) ||
        (REDIRECT_ROUTES as readonly string[]).includes(dir);
      if (!known) {
        throw new Error(
          `app/now-what/${dir} exists on disk but the registry does not know it. ` +
            'Register it as a room, or add it to NON_ROOM_ROUTES/REDIRECT_ROUTES with its obligations.',
        );
      }
    }
  });

  it('retired routes actually redirect — no shadow rooms', () => {
    for (const dir of REDIRECT_ROUTES) {
      const src = readFileSync(join(process.cwd(), 'app/now-what', dir, 'page.tsx'), 'utf8');
      expect(src).toContain('router.replace');
    }
  });
});

describe('exposure — navigable is not the same as offered', () => {
  it('the five-room ontology carries no gated rooms — held capabilities are not advertised (ruling D-E)', () => {
    expect(NOW_WHAT_ROOMS.filter((r) => r.exposure === 'gated')).toHaveLength(0);
  });

  it('the five rooms are exactly the ratified ontology', () => {
    const keys = NOW_WHAT_ROOMS.filter((r) => !['home', 'map'].includes(r.key)).map((r) => r.key);
    expect(keys.sort()).toEqual(['coaching', 'question', 'room', 'story', 'work']);
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
    expect(roomForPath('/now-what/work?fieldContext=flourishing')?.key).toBe('work');
  });

  it('nested and trailing-slash paths resolve to the room', () => {
    expect(roomForPath('/now-what/field/')?.key).toBe('story');
    expect(roomForPath('/now-what/questions/anything')?.key).toBe('question');
  });

  it('non-rooms, retired redirects, and foreign paths resolve to null', () => {
    const retired = REDIRECT_ROUTES.map((d) => `/now-what/${d}`);
    for (const p of ['/now-what/arrive', '/now-what/welcome', ...retired, '/maia', '/', null, undefined, '']) {
      expect(roomForPath(p)).toBeNull();
    }
  });

  it('resolution never depends on registry order', () => {
    // The invariant is that a path resolves to exactly one room. It used to be
    // asserted by re-implementing the matcher here, which meant the test could
    // only ever describe a single-pass resolver. Assert it through the real
    // resolver instead, so the test tracks the contract rather than a copy of
    // the implementation it is meant to check.
    for (const room of NOW_WHAT_ROOMS) {
      expect(roomForPath(room.route)?.key).toBe(room.key);
    }
    // Routes are unique...
    const routes = NOW_WHAT_ROOMS.map((r) => r.route);
    expect(new Set(routes).size).toBe(routes.length);
    // ...and no room's route is a prefix of another's, WITH ONE deliberate
    // exception: Home's route is the environment root, so it is a prefix of
    // every path here. That is why roomForPath resolves exact matches first
    // and excludes Home from the prefix pass — otherwise standing in the
    // session room would report as standing in Home.
    for (const a of NOW_WHAT_ROOMS) {
      for (const b of NOW_WHAT_ROOMS) {
        if (a.key === b.key || a.key === 'home') continue;
        expect(b.route.startsWith(`${a.route}/`)).toBe(false);
      }
    }
  });

  it('Home is the environment root and does not swallow the rooms inside it', () => {
    expect(roomForPath('/now-what')?.key).toBe('home');
    expect(roomForPath('/now-what/')?.key).toBe('home');
    expect(roomForPath('/now-what?fieldContext=now-what-demo')?.key).toBe('home');
    // Every other room still resolves to itself, not to Home.
    for (const room of NOW_WHAT_ROOMS) {
      if (room.key === 'home') continue;
      expect(roomForPath(room.route)?.key).toBe(room.key);
    }
    // And the two non-rooms stay non-rooms rather than falling into Home.
    expect(roomForPath('/now-what/arrive')).toBeNull();
    expect(roomForPath('/now-what/welcome')).toBeNull();
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

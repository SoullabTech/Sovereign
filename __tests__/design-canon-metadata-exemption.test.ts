/**
 * Pin for the design-canon document-head metadata exemption (commit de61ed64d,
 * founder ruling 2026-08-31).
 *
 * WHY THIS EXISTS
 * ---------------
 * That commit changes what the repository PERMITS people to commit. It carves
 * an exception into a sovereignty gate, and the exception was established by
 * manual probes only. An untested exception in a gate is exactly the thing
 * that broadens silently later — someone loosens a regex, the manual proof is
 * not re-run because nobody remembers it existed, and the hole is invisible
 * until a member-facing change ships uncovered.
 *
 * WHAT IT FREEZES
 * ---------------
 * The boundary is the SYMBOL, not the file:
 *
 *   app/layout.tsx
 *     export const metadata only ......... exempt for that change
 *     component / layout body ............ still gated
 *     export const viewport .............. still gated (maximumScale is zoom,
 *                                          a WCAG 1.4.4 behaviour a member
 *                                          directly experiences)
 *
 * and, separately, that the exemption does NOT erase the underlying coverage
 * gap: `--all` must still report app/layout.tsx as an uncovered surface. The
 * file has no Experience Contract. That debt is real and must stay visible;
 * the exemption only declines to bill one favicon href for it.
 *
 * HOW
 * ---
 * Black box. It drives the REAL scripts/check-design-canon.ts against a
 * throwaway git repo, and asserts on exit codes — not on the script's
 * internals. A refactor that preserves the boundary keeps this test green; a
 * refactor that widens the exemption turns it red, which is the entire point.
 */
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO_ROOT = path.join(__dirname, '..');
const GATE = path.join(REPO_ROOT, 'scripts', 'check-design-canon.ts');
const TSX = path.join(REPO_ROOT, 'node_modules', '.bin', 'tsx');

/** A layout with all three regions the ruling distinguishes. */
const LAYOUT = `import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Fixture",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/favicon-32x32.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
`;

let fixture: string;
const LAYOUT_PATH = () => path.join(fixture, 'app', 'layout.tsx');

function gitInFixture(args: string): void {
  // -c core.hooksPath= : the fixture must not inherit this machine's hooks.
  execSync(`git -c core.hooksPath= ${args}`, { cwd: fixture, stdio: 'ignore' });
}

/** Run the real gate in the fixture. Returns its exit code and stdout. */
function runGate(extraArgs: string[] = []): { code: number; out: string } {
  try {
    const out = execFileSync(TSX, [GATE, ...extraArgs], {
      cwd: fixture,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, out };
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? -1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

/** Reset the fixture's layout to the committed baseline. */
function resetLayout(): void {
  fs.writeFileSync(LAYOUT_PATH(), LAYOUT);
}

function editLayout(fn: (src: string) => string): void {
  fs.writeFileSync(LAYOUT_PATH(), fn(fs.readFileSync(LAYOUT_PATH(), 'utf8')));
}

beforeAll(() => {
  if (!fs.existsSync(TSX)) {
    throw new Error(`tsx not found at ${TSX} — run \`npm ci\` before this suite.`);
  }
  // realpath: on macOS os.tmpdir() is a symlink, and the gate resolves its repo
  // root via `git rev-parse --show-toplevel`, which returns the real path.
  fixture = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'design-canon-')));

  fs.mkdirSync(path.join(fixture, 'app'), { recursive: true });
  // Present but EMPTY: no contract covers app/layout.tsx, exactly as in the
  // real repository. That is what makes a gated surface fail.
  fs.mkdirSync(path.join(fixture, 'docs', 'design', 'contracts'), { recursive: true });
  resetLayout();

  gitInFixture('init -q');
  gitInFixture('config user.email fixture@test.local');
  gitInFixture('config user.name Fixture');
  gitInFixture('add -A');
  gitInFixture('commit -q -m baseline --no-verify');
});

afterAll(() => {
  if (fixture) fs.rmSync(fixture, { recursive: true, force: true });
});

beforeEach(resetLayout);

describe('design-canon metadata exemption — the symbol, not the file', () => {
  it('premise: an untouched tree has nothing to gate', () => {
    expect(runGate().code).toBe(0);
  });

  it('1. metadata-only change is ALLOWED', () => {
    editLayout((s) => s.replace('/favicon-16x16.png', '/icons/favicon-16x16.png'));
    const { code, out } = runGate();
    expect(code).toBe(0);
    expect(out).toMatch(/export const metadata/);
  });

  it('2. component/layout-body change is BLOCKED', () => {
    editLayout((s) => s.replace('<main>{children}</main>', '<main><nav />{children}</main>'));
    expect(runGate().code).toBe(1);
  });

  it('3. mixed metadata + body change is BLOCKED', () => {
    editLayout((s) =>
      s
        .replace('/favicon-16x16.png', '/icons/favicon-16x16.png')
        .replace('<main>{children}</main>', '<main><nav />{children}</main>'),
    );
    expect(runGate().code).toBe(1);
  });

  it('4. deletion-only body change is BLOCKED', () => {
    // Adds no new-side lines. A rule that inspected only the new side of the
    // diff would let this through; that is why both sides are checked.
    editLayout((s) => s.replace('        <main>{children}</main>\n', ''));
    expect(runGate().code).toBe(1);
  });

  it('5. export const viewport change is BLOCKED', () => {
    // Document-head by location, experiential by effect: maximumScale is zoom.
    editLayout((s) => s.replace('maximumScale: 5', 'maximumScale: 1'));
    expect(runGate().code).toBe(1);
  });

  it('6. --all still reports app/layout.tsx as uncovered', () => {
    // The exemption is per-change. It must never erase the standing fact that
    // this file has no Experience Contract.
    const { code, out } = runGate(['--all']);
    expect(code).toBe(1);
    expect(out).toMatch(/app\/layout\.tsx/);
  });
});

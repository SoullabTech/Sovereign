/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import {
  STUDIO_CONTROLS, STUDIO_WORKFLOWS, studioGuideInstruction, studioRuntime, notYetInStudio, liveUnderAnotherName, VIEW_LABELS, LENS_LABELS, POSTURE_COPY,
  type StudioRuntime,
} from '../studioGuide';
import { writerExportCertified } from '../releaseAuthority';

/** The production compose defaults (stage on, automatic reading on), gate off, exports not certified — the Studio members meet today. */
const LIVE: StudioRuntime = { developStage: true, autoRead: true, proGate: false, exportsCertified: false };
import { DEVELOP_CAPABILITIES } from '../developAskable';
import { STUDIO_MAP } from '@/app/writers-studio/studioMap';
import { PRIMARY_MODES } from '@/app/writers-studio/full-redesign/types';

const ROOT = path.resolve(__dirname, '../../..');
/** The live member tree (census 2026-11-11). Dead or unreachable code is excluded so a label cannot pass by living only there. */
const UI_DIRS = ['app/dev/writers-studio-pc3-live', 'app/dev/writers-studio-p4r1', 'app/writers-studio'];
const NOT_LIVE = /__tests__|__fixtures__|[\\/](flagship|insight|studio)[\\/]|[\\/](HomeRoom|DevelopRoom|ReviewRoom)\.tsx$|[\\/]app[\\/]dev[\\/][^\\/]+[\\/]page\.tsx$/;
/** Live UI text that sits outside those folders: the site-wide bug button, and labels kept in shared libraries. */
const UI_FILES = [
  'components/bugs/BugReportButton.tsx',
  'lib/writersStudio/presentationRequests.ts',
  'lib/writersStudio/workingStyle.ts',
  'lib/writersStudio/betaFeedback.ts',
];

function uiSource(): string {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (NOT_LIVE.test(full)) continue;
      if (entry.isDirectory()) { walk(full); continue; }
      if (/\.tsx?$/.test(entry.name)) out.push(fs.readFileSync(full, 'utf8'));
    }
  };
  for (const d of UI_DIRS) walk(path.join(ROOT, d));
  for (const f of UI_FILES) out.push(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  // JSX writes "&" as "&amp;"; the writer sees "&".
  return out.join('\n').replace(/&amp;/g, '&');
}

const UI = uiSource();
const shown = (label: string) => UI.includes(label);

describe('MAIA is told only about controls the Studio actually has (founder ruling 2026-11-02, Design 1A)', () => {
  it.each(STUDIO_CONTROLS.map((c) => [c.label]))('"%s" appears in the live Studio UI', (label) => {
    expect(shown(label)).toBe(true);
  });

  it('the check can fail: an invented control is not found', () => {
    expect(shown('Rewrite my whole chapter for me')).toBe(false);
  });

  it('the check can fail: a label living only in dead code is not counted', () => {
    // "Begin Revision" exists only in the unreachable flagship Studio.
    const flagship = fs.readdirSync(path.join(ROOT, 'app/writers-studio/flagship')).map((f) => path.join(ROOT, 'app/writers-studio/flagship', f))
      .filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const onlyDead = (flagship.match(/>([A-Z][A-Za-z ]{12,40})</g) ?? []).map((m) => m.slice(1, -1)).find((l) => !shown(l));
    expect(onlyDead).toBeDefined();
  });

  it('labels are unique, and every control says where it is and what it does', () => {
    expect(new Set(STUDIO_CONTROLS.map((c) => c.label)).size).toBe(STUDIO_CONTROLS.length);
    for (const c of STUDIO_CONTROLS) {
      expect(c.where.trim().length).toBeGreaterThan(0);
      expect(c.does.trim().length).toBeGreaterThan(0);
    }
  });

  it('every room in the top bar has guide entries', () => {
    for (const m of PRIMARY_MODES) expect(STUDIO_CONTROLS.some((c) => c.room === m.id)).toBe(true);
  });
});

describe('generated from the registries, so the guide cannot drift', () => {
  it('every Develop capability is explained by a guide entry, and every key named is real (standing founder rule, developAskable.ts)', () => {
    const keys = new Set(DEVELOP_CAPABILITIES.map((c) => c.key));
    const covered = new Set(STUDIO_CONTROLS.flatMap((c) => c.develop ?? []));
    for (const k of covered) expect(keys.has(k)).toBe(true);
    expect([...keys].filter((k) => !covered.has(k))).toEqual([]);
  });

  it('a capability MAIA cannot offer is described as the writer\'s to choose (the lens defect stays visible)', () => {
    const lens = STUDIO_CONTROLS.find((c) => c.develop?.includes('lenses'))!;
    expect(DEVELOP_CAPABILITIES.find((c) => c.key === 'lenses')!.reach.kind).toBe('defect');
    expect(lens.does).toContain('MAIA cannot open a lens for the writer');
  });

  it('the view names are the Studio\'s own (STUDIO_DEPTH_LABEL)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'lib/writersStudio/presentationRequests.ts'), 'utf8');
    expect(src).toContain(`focused: '${VIEW_LABELS[0]}', guided: '${VIEW_LABELS[1]}', full: '${VIEW_LABELS[2]}'`);
  });

  it('the ways row names are the Studio\'s own (NAV_LABEL in P4R1DevelopView)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
    const block = src.slice(src.indexOf('const LABEL: Record<DevelopField, string>'), src.indexOf('const NAV_LABEL'));
    const fromSource = [...block.matchAll(/^\s+(\w+): '([^']+)'/gm)].filter((m) => m[1] !== 'overview').map((m) => (m[1] === 'reader' ? 'Reader' : m[2]));
    expect(src).toContain("reader: 'Reader',");
    expect(fromSource).toEqual([...LENS_LABELS]);
  });

  it('"not in the Studio yet" is exactly the Studio map\'s `later` destinations, minus those live under another name', () => {
    const later = STUDIO_MAP.flatMap((g) => g.destinations).filter((d) => d.availability === 'later');
    const elsewhere = liveUnderAnotherName();
    for (const id of Object.keys(elsewhere)) expect(later.some((d) => d.id === id)).toBe(true);
    expect(notYetInStudio()).toEqual(later.filter((d) => !(d.id in elsewhere)).map((d) => d.label));
    expect(notYetInStudio()).toContain('Find/Replace');
    const labels = new Set(STUDIO_CONTROLS.map((c) => c.label));
    for (const l of notYetInStudio()) expect(labels.has(l)).toBe(false);
  });
});

describe('what MAIA is told', () => {
  const text = studioGuideInstruction({ runtime: LIVE });

  it('names every control exactly as shown, and every room', () => {
    for (const c of STUDIO_CONTROLS) expect(text).toContain(`"${c.label}"`);
    for (const m of PRIMARY_MODES) expect(text).toContain(m.label);
  });

  it('forbids inventing controls and doing things for the writer', () => {
    expect(text).toContain('Only name controls from this list');
    expect(text).toContain('do not invent one or guess at a location');
    expect(text).toContain('You cannot press any control for them');
    expect(text).toContain('never describe these as available');
  });

  it('points to the Studio’s own reading instead of asking the writer to paste text', () => {
    expect(text).toContain('rather than asking them to paste text that is already in the Studio');
  });

  it('says nothing about the writer’s level', () => {
    expect(text).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill|competen\w*|experienced)\b/i);
  });

  it('keeps the consent wording exact', () => {
    expect(shown(POSTURE_COPY)).toBe(true);
    expect(text).toContain(POSTURE_COPY);
    expect(shown('Sanctuary is on, so MAIA is not reading your work and cannot make a plan.')).toBe(true);
  });

  it('describes current behaviour honestly where it is surprising', () => {
    expect(text).toContain('Quiet and Balanced look the same');
    expect(text).toContain('"Turns" counts every message');
    expect(text).toContain('does not open a page yet');
  });
});

describe('in Sanctuary', () => {
  const text = studioGuideInstruction({ sanctuary: true, runtime: LIVE });
  const withheld = STUDIO_CONTROLS.filter((c) => c.inSanctuary === false);

  it('leaves out every tool that reads, keeps or plans, and says why', () => {
    expect(withheld.map((c) => c.label)).toEqual(expect.arrayContaining(['Let MAIA read my saved work', 'Make a plan with MAIA', 'Read this chapter with MAIA', 'Whole book · editorial pass']));
    // not quoted as a control, and not named in passing in another entry either
    for (const c of withheld) expect(text).not.toContain(c.label);
    expect(text).not.toContain('Let MAIA read my saved work');
    expect(text).toContain('This is a Sanctuary session: nothing is kept.');
  });

  it('can still guide everything else', () => {
    for (const c of STUDIO_CONTROLS.filter((x) => x.inSanctuary !== false)) expect(text).toContain(`"${c.label}"`);
  });
});

describe('workflows, not just buttons', () => {
  const labels = new Set(STUDIO_CONTROLS.map((c) => c.label));
  it.each(STUDIO_WORKFLOWS.map((w) => [w.name, w]))('"%s" names only real controls', (_n, w) => {
    const quoted = [...w.steps.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(quoted.length).toBeGreaterThan(0);
    for (const q of quoted) expect(labels.has(q)).toBe(true);
  });
  it('a workflow that leans on a withheld or stage-only control is itself withheld there', () => {
    for (const w of STUDIO_WORKFLOWS) {
      const quoted = [...w.steps.matchAll(/"([^"]+)"/g)].map((m) => STUDIO_CONTROLS.find((c) => c.label === m[1])!);
      if (quoted.some((c) => c.inSanctuary === false)) expect(w.inSanctuary).toBe(false);
      if (quoted.some((c) => c.stageOnly)) expect(w.stageOnly).toBe(true);
    }
  });
  it('the stance keeps explaining apart from doing, and keeps other writers\' work out of a group session', () => {
    const text = studioGuideInstruction({ runtime: LIVE });
    expect(text).toContain('Explaining a tool is never using it');
    expect(text).toContain('Use a made-up example passage, never anyone\'s manuscript');
    expect(text).toContain('Keep the thread');
  });
});

describe('describes the Studio that is actually running, not the source', () => {
  it('reads the switches the way the Studio reads them', () => {
    const saved = { ...process.env };
    try {
      process.env.NEXT_PUBLIC_WS_DEVELOP_STAGE = '1'; process.env.NEXT_PUBLIC_WS_AUTO_READ = '0'; process.env.WS_PRO_GATE_ENABLED = 'TRUE';
      expect(studioRuntime()).toEqual({ developStage: true, autoRead: false, proGate: false, exportsCertified: writerExportCertified('pdf') && writerExportCertified('epub') });
      process.env.WS_PRO_GATE_ENABLED = 'true';
      expect(studioRuntime().proGate).toBe(true);
    } finally { process.env = saved; }
    const gate = fs.readFileSync(path.join(ROOT, 'lib/auth/wholeWorkEntitlement.ts'), 'utf8');
    expect(gate).toContain("return env.WS_PRO_GATE_ENABLED === 'true';");
    const develop = fs.readFileSync(path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
    expect(develop).toContain("process.env.NEXT_PUBLIC_WS_DEVELOP_STAGE === '1'");
    expect(develop).toContain("process.env.NEXT_PUBLIC_WS_AUTO_READ !== '1'");
  });

  it('with the Develop stage off, no stage-only control is named and she says it is not switched on', () => {
    const text = studioGuideInstruction({ runtime: { ...LIVE, developStage: false } });
    for (const c of STUDIO_CONTROLS.filter((x) => x.stageOnly)) expect(text).not.toContain(`"${c.label}"`);
    expect(text).toContain('The Develop stage is NOT on here');
    expect(text).toContain('"Read this chapter"');
    expect(text).toContain('"Start an editorial pass"');
  });

  it('the Pro gate and exports are described as they are', () => {
    expect(studioGuideInstruction({ runtime: LIVE })).toContain('nothing in the Studio is held for Pro');
    expect(studioGuideInstruction({ runtime: { ...LIVE, proGate: true } })).toContain('the whole-book editorial pass is held');
    expect(studioGuideInstruction({ runtime: LIVE })).toContain('file downloads are awaiting final verification');
    expect(studioGuideInstruction({ runtime: { ...LIVE, exportsCertified: true } })).not.toContain('awaiting final verification');
    expect(studioGuideInstruction({ runtime: { ...LIVE, autoRead: false } })).toContain('Automatic reading is off');
  });
});

describe('every Studio conversation path is given the guide', () => {
  const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
  it.each([
    ['Passage Focus / editorial turns', 'lib/manuscript/editorialRuntime/turn.ts', 'studioGuideInstruction({ sanctuary: input.sanctuary })'],
    ['Work conversation (Develop, Write, Review panels)', 'lib/manuscript/ask/askReader.ts', 'studioGuideInstruction({ sanctuary: ctx.sanctuary === true })'],
    ['Develop observation dialogue', 'lib/manuscript/ask/developmentalAskReader.ts', 'studioGuideInstruction()'],
    ['Review → Discuss', 'lib/manuscript/ask/reviewDiscussReader.ts', 'studioGuideInstruction()'],
  ])('%s', (_name, file, call) => {
    const src = read(file);
    expect(src).toContain("from '@/lib/writersStudio/studioGuide'");
    expect(src).toContain(call);
  });
});

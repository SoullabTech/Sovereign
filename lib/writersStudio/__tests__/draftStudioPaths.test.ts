/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  DRAFT_STUDIO_PATHS, STUDIO_PATHS, pathFromParam, pathFrameFor, studioPathById, builtStages,
} from '../studioPaths';

const ROOT = path.resolve(__dirname, '../../..');

describe('draft Studio paths stay unreachable until the founder approves them', () => {
  test('the nonfiction draft exists and is not a live path', () => {
    expect(DRAFT_STUDIO_PATHS.map((p) => p.id)).toContain('nonfiction');
    for (const p of DRAFT_STUDIO_PATHS) expect(STUDIO_PATHS.map((x) => x.id)).not.toContain(p.id);
  });

  test('no door, no link, no stored program and no MAIA frame for a draft', () => {
    for (const p of DRAFT_STUDIO_PATHS) {
      expect(pathFromParam(p.id)).toBeNull();
      expect(studioPathById(p.id)).toBeNull();
      expect(pathFrameFor(p.id)).toBeNull();
    }
  });

  test('only the registry and this test name the draft list', () => {
    const users = execSync(`git grep -l --untracked "DRAFT_STUDIO_PATHS" -- app lib components`, { cwd: ROOT, encoding: 'utf8' })
      .trim().split('\n').filter(Boolean).sort();
    expect(users).toEqual(['lib/writersStudio/__tests__/draftStudioPaths.test.ts', 'lib/writersStudio/studioPaths.ts']);
  });

  test('no migration registers a draft program (the seed row comes only with approval)', () => {
    const dir = path.join(ROOT, 'database/migrations');
    const sql = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
    for (const p of DRAFT_STUDIO_PATHS) expect(sql).not.toMatch(new RegExp(`studio_programs[^;]*'${p.id}'`));
  });

  test('a draft is complete enough to approve: same shape the live path keeps', () => {
    for (const p of DRAFT_STUDIO_PATHS) {
      expect(p.id).toMatch(/^[a-z][a-z0-9-]{0,39}$/);
      for (const s of [p.name, p.startLabel, p.arena, p.firstPrompt, p.invitation, p.suggestedTitle, p.reflectionGuide, p.studioPosture]) expect(s.trim().length).toBeGreaterThan(0);
      for (const v of Object.values(p.studioCopy)) expect(v.trim().length).toBeGreaterThan(0);
      const stages = builtStages(p);
      expect(stages.length).toBeGreaterThan(0);
      expect(new Set(stages.map((s) => s.id)).size).toBe(stages.length);
      for (const s of stages) {
        expect(s.id).toMatch(/^[a-z][a-z0-9-]{0,39}$/);
        expect(s.lead && s.guidance && s.posture && s.notesLabel).toBeTruthy();
        expect(s.posture).toMatch(/^STAGE: /);
      }
    }
  });

  test('MAIA’s draft coaching never writes for the writer and never promises results', () => {
    for (const p of DRAFT_STUDIO_PATHS) {
      const posture = [p.studioPosture, ...p.arc.map((s) => s.posture ?? '')].join('\n');
      expect(posture).toMatch(/Never write their chapters/);
      expect(posture).toMatch(/never present the method as a cure or a guarantee/);
      expect(posture).not.toMatch(/\b(will cure|guaranteed|best-?seller)\b/i);
    }
  });
});

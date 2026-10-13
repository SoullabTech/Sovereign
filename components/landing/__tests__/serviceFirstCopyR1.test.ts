import fs from 'node:fs';
import path from 'node:path';

const source = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

describe('Service First R1 — public and professional copy boundaries', () => {
  const canon = source('docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md');
  const hero = source('components/landing/HeroSection.tsx');
  const platform = source('components/landing/PlatformSection.tsx');
  const maia = source('components/landing/MaiaSection.tsx');
  const reflect = source('components/pro-studio/ReflectArrivalView.tsx');
  const editorial = source('docs/marketing/SERVICE_FIRST_CROSS_SURFACE_EDITORIAL_R1_2026-10-13.md');

  test('anchors copy to an already-merged, noncoercive Soullab founding statement', () => {
    expect(canon).toContain('### Service First. Not Self Last.');
    expect(canon).toContain('Soullab supports those in service to self and world.');
    expect(canon).toContain('No one has to identify as “of service” to belong in Soullab.');
    expect(canon).toContain('MAIA may never assign a calling');
  });

  test('public arrival speaks to self and world while retaining one House entry', () => {
    expect(hero).toContain('For those in service to self and world.');
    expect(hero).toContain('A life is not a project to perfect.');
    expect(hero).toContain('href="/home"');
    expect(hero).toContain('Enter Soullab');
    expect(hero).not.toContain('Enter MAIA');
  });

  test('public product explanation protects rest and belonging, preserves facet standing', () => {
    expect(platform).toContain('Care for yourself and for the world both belong here;');
    expect(platform).toContain('no one must prove their usefulness to belong.');
    expect(platform).toContain("status: 'In active build'");
    expect(platform).toContain("status: 'Research + design'");
  });

  test('public MAIA explanation never makes service an AI-assigned duty', () => {
    expect(maia).toContain('never command, diagnosis, or an assignment to serve.');
    expect(maia).toContain('What matters and how you participate remain yours to decide');
    expect(maia).toContain('href="/home"');
  });

  test('Reflect supports helpers themselves while remaining a client-free free-MAIA doorway', () => {
    expect(reflect).toContain('Your work begins with you.');
    expect(reflect).toContain('If your work involves helping others, your own life belongs in that care, too');
    expect(reflect).toContain('Your well-being is not last.');
    expect(reflect).toContain('href="/maia/encounter"');
    expect(reflect).toContain('Reflect workspace and its membership permissions are not yet activated.');
    expect(reflect).not.toContain('Add your first person');
  });

  test('Ganesha Life Flow is explicitly editorial, never silently declared live', () => {
    expect(editorial).toContain('Ganesha Life Flow');
    expect(editorial).toContain('Designed/editorial only');
    expect(editorial).toContain('not a live claim');
    expect(editorial).toContain('No prompt, inference pipeline, steering algorithm');
    expect(editorial).toContain('not a public campaign or permission to merge.');
  });
});

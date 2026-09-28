import fs from 'node:fs';
import path from 'node:path';

const LANDING = fs.readFileSync(path.resolve(process.cwd(), 'components/landing/SoullabLanding.tsx'), 'utf8');
const HERO = fs.readFileSync(path.resolve(process.cwd(), 'components/landing/HeroSection.tsx'), 'utf8');
const NAV = fs.readFileSync(path.resolve(process.cwd(), 'components/landing/LandingNav.tsx'), 'utf8');
const RESEARCH = fs.readFileSync(path.resolve(process.cwd(), 'components/landing/ResearchSection.tsx'), 'utf8');

describe('Soullab public landing architecture', () => {
  it('makes Soullab Home the member entry, never MAIA', () => {
    expect(HERO).toContain('href="/home"');
    expect(HERO).toContain('Enter Soullab');
    expect(HERO).not.toContain('Enter MAIA');
    expect(NAV).toContain('href="/home"');
    expect(NAV).not.toContain('href="/enter"');
  });

  it('keeps one coherent main-scroll story instead of duplicate MAIA/product sections', () => {
    expect(LANDING).toContain('<PlatformSection />');
    expect(LANDING).toContain('<ResearchSection />');
    expect(LANDING).toContain('<MaiaSection />');
    expect(LANDING).not.toContain('<NarrativeSection />');
    expect(LANDING).not.toContain('<PortfolioSection />');
    expect(LANDING).not.toContain('<AskSection />');
    expect(LANDING).toContain('<AskWidget />');
  });

  it('surfaces recent frontier work with explicit standing', () => {
    for (const title of [
      'Living House / Home',
      'Cross-Facet Continuity',
      "Writer's Studio",
      'Teaching Intelligence',
      'Governed Source Fabric',
      'Relational Geometry Reasoning',
    ]) {
      expect(RESEARCH).toContain(title);
    }
    expect(RESEARCH).toContain("'Live'");
    expect(RESEARCH).toContain("'In build'");
    expect(RESEARCH).toContain("'Research'");
  });

  it('uses the hero secondary action for comprehension rather than business contact', () => {
    expect(HERO).toContain("document.getElementById('platform')");
    expect(HERO).toContain('See what&rsquo;s inside');
    expect(HERO).not.toContain("document.getElementById('contact')");
  });
});

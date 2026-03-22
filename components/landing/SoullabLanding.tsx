'use client';

import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { AuditFunnelSections } from './AuditFunnelSections';
import { MaiaSection } from './MaiaSection';
import { AINSection } from './AINSection';
import { ResearchSection } from './ResearchSection';
import { ProjectsSection } from './ProjectsSection';
import { PortfolioSection } from './PortfolioSection';
import { AskSection } from './AskSection';
import { ContactSection } from './ContactSection';
import { AskWidget } from './AskWidget';

export function SoullabLanding() {
  return (
    <div className="bg-maia-navy-950 text-maia-ink-100 min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <MaiaSection />
        <AINSection />
        <AuditFunnelSections />
        <ResearchSection />
        <PortfolioSection />
        <ProjectsSection />
        <AskSection />
        <ContactSection />
      </main>
      <AskWidget />
    </div>
  );
}

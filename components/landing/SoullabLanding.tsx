'use client';

import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { OfferingsSection } from './OfferingsSection';
import { StartHereSection } from './StartHereSection';
import { DifferentSection } from './DifferentSection';
import { ResearchSection } from './ResearchSection';
import { PortfolioSection } from './PortfolioSection';
import { ProjectsSection } from './ProjectsSection';
import { AskSection } from './AskSection';
import { ContactSection } from './ContactSection';
import { AskWidget } from './AskWidget';

export function SoullabLanding() {
  return (
    <div className="bg-maia-navy-950 text-maia-ink-100 min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <OfferingsSection />
        <StartHereSection />
        <DifferentSection />
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

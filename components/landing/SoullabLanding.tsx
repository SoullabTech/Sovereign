'use client';

import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { MaiaSection } from './MaiaSection';
import { ResearchSection } from './ResearchSection';
import { ProjectsSection } from './ProjectsSection';
import { PortfolioSection } from './PortfolioSection';
import { BookAnnouncement } from './BookAnnouncement';
import { PastSitesSection } from './PastSitesSection';
import { AskSection } from './AskSection';
import { ContactSection } from './ContactSection';
import { NarrativeSection } from './NarrativeSection';
import { InquirySection } from './InquirySection';
import { CovenantSection } from './CovenantSection';
import { AskWidget } from './AskWidget';

export function SoullabLanding() {
  return (
    <div className="bg-maia-navy-950 text-maia-ink-100 min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <MaiaSection />
        <ResearchSection />
        <NarrativeSection />
        <InquirySection />
        <PortfolioSection />
        <BookAnnouncement />
        <ProjectsSection />
        <AskSection />
        <PastSitesSection />
        <CovenantSection />
        <ContactSection />
      </main>
      <AskWidget />
    </div>
  );
}

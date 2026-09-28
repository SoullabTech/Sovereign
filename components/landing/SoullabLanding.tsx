'use client';

import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { PlatformSection } from './PlatformSection';
import { MaiaSection } from './MaiaSection';
import { ResearchSection } from './ResearchSection';
import { BookAnnouncement } from './BookAnnouncement';
import { PastSitesSection } from './PastSitesSection';
import { ContactSection } from './ContactSection';
import { InquirySection } from './InquirySection';
import { CovenantSection } from './CovenantSection';
import { AskWidget } from './AskWidget';

export function SoullabLanding() {
  return (
    <div className="bg-maia-navy-950 text-maia-ink-100 min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <PlatformSection />
        <ResearchSection />
        <MaiaSection />
        <InquirySection />
        <PastSitesSection />
        <BookAnnouncement />
        <CovenantSection />
        <ContactSection />
      </main>
      <AskWidget />
    </div>
  );
}

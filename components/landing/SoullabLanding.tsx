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
import { MotionConfig } from 'framer-motion';

export function SoullabLanding() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="sl-focus bg-maia-navy-950 text-maia-ink-100 min-h-[100dvh]">
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
    </MotionConfig>
  );
}

/**
 * Beta Tester Contact List for Ganesha Email Management
 * Consciousness pioneers who have been part of MAIA's evolution
 */

export interface BetaTester {
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive';
  tags: string[];
  contribution?: string;
}

// Your consciousness pioneer community - 50+ amazing souls!
export const betaTesters: BetaTester[] = [
  // EASY IMPORT METHOD - Add your 50+ beta testers here
  // Option 1: If you have a spreadsheet, convert each row to this format:
  // { name: "Name", email: "email@domain.com", joinDate: "2024-01-01", status: "active", tags: ["beta-tester"], contribution: "Early pioneer" },

  // Option 2: Quick batch format (copy/paste and edit):
  /*
  { name: "Pioneer 1", email: "email1@domain.com", joinDate: "2024-01-01", status: "active", tags: ["beta-tester"], contribution: "Consciousness explorer" },
  { name: "Pioneer 2", email: "email2@domain.com", joinDate: "2024-01-01", status: "active", tags: ["beta-tester"], contribution: "Voice feedback" },
  { name: "Pioneer 3", email: "email3@domain.com", joinDate: "2024-01-01", status: "active", tags: ["beta-tester"], contribution: "Early adopter" },
  // ... add all 50+ here
  */

  // Start with your email for testing
  {
    name: "Kelly Nezat",
    email: "kelly@soullab.life",
    joinDate: "2024-01-01",
    status: "active",
    tags: ["beta-tester", "founder"],
    contribution: "Platform architecture and consciousness framework development"
  },

  // 🚀 ADD YOUR 50+ CONSCIOUSNESS PIONEERS HERE 🚀
  // Uncomment and edit the section above, or add them one by one below

];

export function getBetaTesters(): BetaTester[] {
  return betaTesters.filter(tester => tester.status === 'active');
}

export function getBetaTesterEmails(): string[] {
  return getBetaTesters().map(tester => tester.email);
}

export function getBetaTesterCount(): number {
  return getBetaTesters().length;
}
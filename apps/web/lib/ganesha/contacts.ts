/**
 * Ganesha Contact Management System
 * Organized, scalable contact management for consciousness community
 * ADD-friendly system for emails, newsletters, and growth management
 */

export interface GaneshaContact {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  groups: ContactGroup[];
  tags: string[];
  metadata: {
    source?: string; // How they joined (website, referral, etc.)
    contribution?: string;
    lastActive?: string;
    preferences?: {
      newsletters: boolean;
      updates: boolean;
      events: boolean;
    };
  };
}

export type ContactGroup =
  | 'beta-testers'
  | 'newsletter'
  | 'early-adopters'
  | 'consciousness-pioneers'
  | 'power-users'
  | 'community-leaders'
  | 'founders'
  | 'all';

export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  targetGroups: ContactGroup[];
  templateId: string;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sent';
}

// Ganesha Contact Database - Organized for easy management
export const ganeshaContacts: GaneshaContact[] = [
  // 🧠 FOUNDER
  {
    id: 'founder-kelly',
    name: 'Kelly Nezat',
    email: 'kelly@soullab.life',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['founders', 'beta-testers', 'all'],
    tags: ['founder', 'architect', 'consciousness-pioneer'],
    metadata: {
      source: 'founder',
      contribution: 'Platform architecture and consciousness framework development',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  // 🚀 CONSCIOUSNESS PIONEERS - Beta Testers (41 total)
  {
    id: 'beta-001',
    name: 'Nathan Kane',
    email: 'Nathan.Kane@thermofisher.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-NATHAN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-002',
    name: 'Jason Ruder',
    email: 'JHRuder@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-JASON',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-003',
    name: 'Travis Diamond',
    email: 'tcdiamond70@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-TRAVIS',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-004',
    name: 'Andrea Nezat',
    email: 'andreanezat@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-ANDREA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-005',
    name: 'Justin Boucher',
    email: 'justin.boucher@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-JUSTIN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-006',
    name: 'Susan Bragg',
    email: 'phoenixrises123@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-SUSAN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-007',
    name: 'Meagan d\'Aquin',
    email: 'mdaquin@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-MEAGAN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-008',
    name: 'Patrick Koehn',
    email: 'plkoehn@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-PATRICK',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-009',
    name: 'Tamara Moore',
    email: 'tamaramoorecolorado@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-TAMARA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-010',
    name: 'Loralee Geil',
    email: 'loraleegeil@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-LORALEE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-011',
    name: 'Andrea Fagan',
    email: 'andreadfagan@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-ANDREAFAGAN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-012',
    name: 'Cece Campbell',
    email: 'cececampbell1@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-CECE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-013',
    name: 'Zsuzsanna Ferenczi',
    email: 'zsuzsanna.ferenczi@icloud.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-ZSUZSANNA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-014',
    name: 'Angela Economakis',
    email: 'aceconomakis@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-ANGELA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-015',
    name: 'Kristen Nezat',
    email: 'Inhomesanctuary@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-KRISTEN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-016',
    name: 'Doug Foreman',
    email: 'dougaforeman@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-DOUG',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-017',
    name: 'Rick Tessier',
    email: 'richardcteissier27@icloud.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-RICK',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-018',
    name: 'Julie Mountcastle',
    email: 'jmountcastle@slateschool.org',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-JULIE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-019',
    name: 'Kimberly Daugherty',
    email: 'dakotamundi@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-KIMBERLY',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-020',
    name: 'Leonard Ruder',
    email: 'Lruderlcsw@aol.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-LEONARD',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-021',
    name: 'Cynthy Ruder',
    email: 'Dancyn3@aol.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-CYNTHY',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-022',
    name: 'Nina Ruder',
    email: 'Ninaruder11@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-NINA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-023',
    name: 'Augusten Nezat',
    email: 'augustennezat@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-AUGUSTEN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-024',
    name: 'Sophie Nezat',
    email: 'snezat27@sacredhearthamden.org',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-SOPHIE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-025',
    name: 'Romeo',
    email: 'romeo@veydrisresearch.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-ROMEO',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-026',
    name: 'Stephen',
    email: 'sparkles1724@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-STEPHEN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-027',
    name: 'Weezie',
    email: 'weezie.delavergne@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-WEEZIE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-028',
    name: 'Korey',
    email: 'koreyrichey@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-KOREY',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-029',
    name: 'Karen',
    email: 'karenmccullen@hotmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-KAREN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-030',
    name: 'Natasha',
    email: 'tashajam@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-NATASHA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-031',
    name: 'Catherine',
    email: 'catherine@atthefield.uk',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-CATHERINE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-032',
    name: 'Thea',
    email: 'thea@theapagel.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-THEA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-033',
    name: 'Virginia',
    email: 'vmiller@bmfcomms.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-VIRGINIA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-034',
    name: 'Jondi',
    email: 'jondi@eft4results.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-JONDI',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-035',
    name: 'Joseph',
    email: 'crownhouseone@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-JOSEPH',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-036',
    name: 'Kelly Soullab',
    email: 'soullab1@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-KELLY',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-037',
    name: 'Kara',
    email: 'karapylant@outlook.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-KARA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-038',
    name: 'Christian',
    email: 'cl@spiraldynamik.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer', 'spiral-dynamics'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-CHRISTIAN',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-039',
    name: 'Claudia',
    email: 'claudia.bayuelo@studiolabs.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-CLAUDIA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-040',
    name: 'Nicole',
    email: 'nicolecasbarro@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-NICOLE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-041',
    name: 'Marie-Christine',
    email: 'dreyfus@dfpartners.swiss',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-MARIECHRISTINE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-042',
    name: 'Lorna Lamoureux',
    email: 'cookielbl1146@gmail.com',
    joinDate: '2024-11-10',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-LORNA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-043',
    name: 'Yvonne Landry',
    email: 'Yvonneland@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer', 'recent-invite'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-YVONNE',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-044',
    name: 'Anna',
    email: 'abcdunbar@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-ANNA',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-045',
    name: 'Risako',
    email: 'Risako.stepetic@gmail.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-RISAKO',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  },

  {
    id: 'beta-046',
    name: 'Whitey Whitehurst',
    email: 'Whiteysart.katheline@icloud.com',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program',
      contribution: 'Early consciousness exploration and platform feedback',
      passcode: 'SOULLAB-WHITEY',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  }
];

// 🧠 Ganesha Smart Contact Functions
export class GaneshaContactManager {

  /**
   * Get contacts by group for targeted campaigns
   */
  static getContactsByGroup(group: ContactGroup): GaneshaContact[] {
    return ganeshaContacts.filter(contact =>
      contact.status === 'active' &&
      contact.groups.includes(group)
    );
  }

  /**
   * Get all beta testers (legacy compatibility)
   */
  static getBetaTesters(): GaneshaContact[] {
    return this.getContactsByGroup('beta-testers');
  }

  /**
   * Add new contact (for when new testers join)
   */
  static addContact(contact: Omit<GaneshaContact, 'id'>): GaneshaContact {
    const newContact: GaneshaContact = {
      ...contact,
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    ganeshaContacts.push(newContact);
    console.log(`🧠 [Ganesha Contacts] New consciousness pioneer added: ${newContact.name}`);

    return newContact;
  }

  /**
   * Get email list for campaigns
   */
  static getEmailList(groups: ContactGroup[]): string[] {
    const contacts = new Set<string>();

    groups.forEach(group => {
      this.getContactsByGroup(group).forEach(contact => {
        contacts.add(contact.email);
      });
    });

    return Array.from(contacts);
  }

  /**
   * Quick stats for Ganesha dashboard
   */
  static getStats() {
    const activeContacts = ganeshaContacts.filter(c => c.status === 'active');

    return {
      totalActive: activeContacts.length,
      betaTesters: this.getContactsByGroup('beta-testers').length,
      newsletterSubscribers: activeContacts.filter(c =>
        c.metadata.preferences?.newsletters
      ).length,
      recentJoins: activeContacts.filter(c =>
        new Date(c.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    };
  }

  /**
   * Prepare campaign recipients
   */
  static prepareCampaign(campaign: EmailCampaign) {
    const recipients = this.getEmailList(campaign.targetGroups);

    console.log(`🚀 [Ganesha Campaign] "${campaign.name}" ready for ${recipients.length} consciousness pioneers`);

    return {
      campaign,
      recipients,
      recipientCount: recipients.length
    };
  }

  /**
   * Newsletter-specific functions for organized management
   */
  static getNewsletterSubscribers(): GaneshaContact[] {
    return ganeshaContacts.filter(contact =>
      contact.status === 'active' &&
      contact.metadata.preferences?.newsletters === true
    );
  }

  static getContactsByTag(tag: string): GaneshaContact[] {
    return ganeshaContacts.filter(contact =>
      contact.status === 'active' &&
      contact.tags.includes(tag)
    );
  }

  static getRecentJoins(days: number = 30): GaneshaContact[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return ganeshaContacts.filter(contact =>
      contact.status === 'active' &&
      new Date(contact.joinDate) > cutoffDate
    );
  }

  static updateContactPreferences(email: string, preferences: Partial<GaneshaContact['metadata']['preferences']>) {
    const contact = ganeshaContacts.find(c => c.email === email);
    if (contact && contact.metadata.preferences) {
      Object.assign(contact.metadata.preferences, preferences);
      console.log(`🧠 [Ganesha Contacts] Updated preferences for ${contact.name}`);
    }
  }

  static exportContactList(group?: ContactGroup): {
    name: string;
    email: string;
    tags: string[];
    preferences: any;
  }[] {
    const contacts = group ? this.getContactsByGroup(group) : ganeshaContacts.filter(c => c.status === 'active');

    return contacts.map(contact => ({
      name: contact.name,
      email: contact.email,
      tags: contact.tags,
      preferences: contact.metadata.preferences || {}
    }));
  }
}

// 📧 Predefined Email Campaigns for Easy Management
export const campaignTemplates = {
  'consciousness-revolution': {
    id: 'consciousness-revolution',
    name: 'Consciousness Revolution Announcement',
    description: 'Major breakthrough announcement about consciousness architecture',
    targetGroups: ['beta-testers', 'consciousness-pioneers'] as ContactGroup[],
    templateId: 'consciousness-revolution',
    status: 'draft' as const
  },

  'newsletter-monthly': {
    id: 'newsletter-monthly',
    name: 'Monthly Consciousness Newsletter',
    description: 'Regular updates for the consciousness community',
    targetGroups: ['newsletter', 'beta-testers'] as ContactGroup[],
    templateId: 'newsletter-template',
    status: 'draft' as const
  },

  'new-features': {
    id: 'new-features',
    name: 'New Features Announcement',
    description: 'Updates about new platform capabilities',
    targetGroups: ['beta-testers', 'power-users'] as ContactGroup[],
    templateId: 'feature-update',
    status: 'draft' as const
  },

  'consciousness-updates': {
    id: 'consciousness-updates',
    name: 'Consciousness Evolution Updates',
    description: 'Platform evolution and consciousness insights',
    targetGroups: ['consciousness-pioneers', 'newsletter'] as ContactGroup[],
    templateId: 'consciousness-updates',
    status: 'draft' as const
  },

  'community-spotlight': {
    id: 'community-spotlight',
    name: 'Community Pioneer Spotlight',
    description: 'Highlighting consciousness pioneer contributions',
    targetGroups: ['beta-testers', 'community-leaders'] as ContactGroup[],
    templateId: 'community-spotlight',
    status: 'draft' as const
  }
};

// Legacy compatibility for existing email system
export const betaTesters = GaneshaContactManager.getBetaTesters().map(contact => ({
  name: contact.name,
  email: contact.email,
  joinDate: contact.joinDate,
  status: contact.status,
  tags: contact.tags,
  contribution: contact.metadata.contribution
}));

export function getBetaTesters() {
  return betaTesters.filter(tester => tester.status === 'active');
}

export function getBetaTesterEmails(): string[] {
  return getBetaTesters().map(tester => tester.email);
}

export function getBetaTesterCount(): number {
  return getBetaTesters().length;
}
// Switzerland Retreat Types and Interfaces

export interface RetreatParticipant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredName?: string;

  // Onboarding Status
  onboardingStatus:
    | "registered"
    | "welcomed"
    | "oracle_assigned"
    | "intentions_set"
    | "completed";
  welcomedAt?: Date;
  oracleAssignedAt?: Date;

  // Personal Oracle Assignment
  personalOracleId?: string;
  oracleElement?: "fire" | "water" | "earth" | "air" | "aether";
  oracleArchetype?: string;

  // Intentions & State
  currentState?: {
    emotionalTone: string;
    energyLevel: number; // 1-10
    primaryChallenge?: string;
    seekingGuidanceOn?: string[];
  };

  retreatIntentions?: {
    primaryIntention: string;
    secondaryIntentions?: string[];
    desiredOutcomes: string[];
    openToExploring?: string[];
  };

  // Elemental Profile
  elementalProfile?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
    dominantElement: string;
  };

  // Retreat Details
  retreatId: string;
  arrivalDate: Date;
  departureDate: Date;
  accommodationType?: string;
  dietaryRestrictions?: string[];
  specialNeeds?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface RetreatSession {
  id: string;
  name: string;
  location: "switzerland" | "other";
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  status: "upcoming" | "active" | "completed";

  // Retreat Theme
  theme: string;
  description: string;
  guidingQuestions: string[];

  // Schedule
  dailySchedule?: {
    day: number;
    activities: Array<{
      time: string;
      title: string;
      description: string;
      facilitator?: string;
      isOptional?: boolean;
    }>;
  }[];

  // Facilitators
  facilitators: Array<{
    name: string;
    role: string;
    bio?: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingFlow {
  participantId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  startedAt: Date;
  lastUpdatedAt: Date;

  // Step Data
  welcomeData?: {
    personalMessage?: string;
    videoWatched?: boolean;
    agreedToGuidelines?: boolean;
  };

  oracleAssignment?: {
    assignedElement: string;
    assignedArchetype: string;
    introductionMessage: string;
    firstGuidance?: string;
  };

  intentionData?: {
    capturedAt: Date;
    reviewedByFounder?: boolean;
    founderNotes?: string;
  };
}

export type OnboardingStep =
  | "welcome"
  | "retreat_overview"
  | "personal_info"
  | "current_state"
  | "intentions"
  | "oracle_assignment"
  | "confirmation";

export interface WelcomeMessage {
  participantName: string;
  fromFounder: boolean;
  message: string;
  personalizedElements: {
    acknowledgment?: string;
    invitation?: string;
    blessing?: string;
  };
  retreatHighlights: string[];
  nextSteps: string[];
}

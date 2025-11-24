// Enhanced Switzerland Retreat Onboarding Routes
import { Router, Request, Response } from "express";
import { retreatOnboardingService } from "../services/retreatOnboardingService";
import { z } from "zod";
import { logger } from "../utils/logger";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// Validation schemas
const welcomeParticipantSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  eventType: z.enum(["retreat"]).default("retreat"),
  arrivalDate: z.string().datetime(),
  departureDate: z.string().datetime(),
  dietaryRestrictions: z.array(z.string()).optional(),
  specialNeeds: z.array(z.string()).optional(),
  hearAboutUs: z.string().optional(),
  previousExperience: z.string().optional(),
});

const retreatQuestionnaireSchema = z.object({
  participantId: z.string().uuid(),

  // Life Context
  lifeContext: z.object({
    currentLifePhase: z.string(),
    majorTransitions: z.array(z.string()).optional(),
    primaryRelationships: z.string(),
    professionalContext: z.string(),
  }),

  // Emotional Landscape
  emotionalLandscape: z.object({
    dominantEmotions: z.array(z.string()),
    emotionalChallenges: z.array(z.string()),
    emotionalStrengths: z.array(z.string()),
    stressResponses: z.array(z.string()),
  }),

  // Spiritual Journey
  spiritualJourney: z.object({
    practicesEngaged: z.array(z.string()),
    spiritualBeliefs: z.string(),
    connectionToNature: z.number().min(1).max(10),
    mysticalExperiences: z.string().optional(),
  }),

  // Shadow Work
  shadowWork: z.object({
    shadowAwareness: z.number().min(1).max(10),
    patternsToTransform: z.array(z.string()),
    fears: z.array(z.string()),
    hiddenGifts: z.string().optional(),
  }),

  // Intentions
  intentions: z.object({
    primaryIntention: z.string().min(20),
    secondaryIntentions: z.array(z.string()).optional(),
    desiredBreakthroughs: z.array(z.string()),
    willingToRelease: z.array(z.string()),
    newToEmbody: z.array(z.string()),
  }),

  // Retreat Readiness
  readiness: z.object({
    physicalHealth: z.number().min(1).max(10),
    mentalClarity: z.number().min(1).max(10),
    emotionalOpenness: z.number().min(1).max(10),
    timeCommitment: z.boolean(),
    groupReadiness: z.number().min(1).max(10),
  }),
});

// Welcome endpoint for new participants
router.post("/welcome", async (req: Request, res: Response) => {
  try {
    const validation = welcomeParticipantSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid welcome data",
        details: validation.error.format(),
      });
    }

    const data = validation.data;

    // Determine retreat ID - Swiss Alps retreat (June 13-15)
    const retreatId = await ensureSwissRetreatExists();

    // Initialize participant
    const participant = await retreatOnboardingService.initializeOnboarding(
      data.email,
      data.firstName,
      data.lastName,
      retreatId,
      new Date(data.arrivalDate),
      new Date(data.departureDate),
    );

    // Store additional data
    await supabase
      .from("retreat_participants")
      .update({
        preferredName: data.preferredName,
        metadata: {
          phone: data.phone,
          country: data.country,
          eventType: data.eventType,
          hearAboutUs: data.hearAboutUs,
          previousExperience: data.previousExperience,
        },
      })
      .eq("id", participant.id);

    // Generate personalized welcome experience
    const welcomeExperience = await generatePersonalizedWelcome(
      participant,
      data.eventType,
    );

    res.status(201).json({
      success: true,
      participant: {
        id: participant.id,
        firstName: participant.firstName,
        preferredName: data.preferredName || participant.firstName,
        email: participant.email,
      },
      welcome: welcomeExperience,
      nextSteps: {
        questionnaire: `/api/retreat/onboarding/questionnaire/${participant.id}`,
        overview: `/api/retreat/onboarding/overview/${retreatId}`,
        personalOracle: `/api/retreat/onboarding/oracle-intro/${participant.id}`,
      },
      message:
        "Welcome to your transformational journey. Kelly has prepared a personal message for you.",
    });
  } catch (error) {
    logger.error("Welcome initialization failed", error);
    res.status(500).json({
      error: "Welcome process failed",
      message: "Please try again or contact support@soullab.com",
    });
  }
});

// Pre-retreat questionnaire
router.post("/questionnaire", async (req: Request, res: Response) => {
  try {
    const validation = retreatQuestionnaireSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid questionnaire data",
        details: validation.error.format(),
      });
    }

    const data = validation.data;

    // Store questionnaire data
    await supabase
      .from("retreat_participants")
      .update({
        questionnaire_data: data,
        questionnaire_completed_at: new Date(),
        currentState: {
          emotionalTone: data.emotionalLandscape.dominantEmotions[0],
          energyLevel: data.readiness.emotionalOpenness,
          primaryChallenge: data.shadowWork.patternsToTransform[0],
          seekingGuidanceOn: data.intentions.desiredBreakthroughs,
        },
        retreatIntentions: data.intentions,
      })
      .eq("id", data.participantId);

    // Generate elemental profile based on questionnaire
    const elementalProfile = await generateElementalProfile(data);

    // Store elemental profile
    await supabase
      .from("retreat_participants")
      .update({
        elementalProfile,
      })
      .eq("id", data.participantId);

    // Get personalized reflection from Kelly
    const reflection = await getFounderQuestionnaireReflection(
      data.participantId,
      data,
    );

    res.json({
      success: true,
      message: "Thank you for sharing your sacred journey with us.",
      elementalProfile,
      founderReflection: reflection,
      nextStep: `/api/retreat/onboarding/oracle-assignment/${data.participantId}`,
    });
  } catch (error) {
    logger.error("Questionnaire submission failed", error);
    res.status(500).json({
      error: "Failed to process questionnaire",
      message: "Your responses are important. Please try again.",
    });
  }
});

// Personal Oracle assignment with enhanced matching
router.post(
  "/oracle-assignment/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;

      // Get participant with questionnaire data
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      // Enhanced Oracle assignment based on questionnaire
      const assignment = await assignEnhancedPersonalOracle(participant);

      // Create personalized Oracle introduction
      const introduction = await createOracleIntroduction(
        participant,
        assignment,
      );

      res.json({
        success: true,
        oracle: assignment,
        introduction,
        message: `Meet your ${assignment.element} Oracle: ${assignment.archetype}`,
        oracleChat: `/api/oracle/personal/${assignment.oracleId}`,
        nextStep: `/api/retreat/onboarding/preparation/${participantId}`,
      });
    } catch (error) {
      logger.error("Oracle assignment failed", error);
      res.status(500).json({
        error: "Failed to assign Personal Oracle",
        message: "Your sacred guide awaits. Please try again.",
      });
    }
  },
);

// Swiss Alps retreat preparation
router.get(
  "/preparation/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;

      const preparation = await generateRetreatPreparation(participantId);

      res.json({
        success: true,
        preparation,
        resources: {
          packingList: "/api/retreat/resources/packing-list",
          travelInfo: "/api/retreat/resources/travel-switzerland",
          preRetreatPractices: "/api/retreat/resources/practices",
          communityForum: "/api/community/retreat-2024",
        },
      });
    } catch (error) {
      logger.error("Failed to get preparation details", error);
      res.status(500).json({ error: "Failed to load preparation resources" });
    }
  },
);

// Helper functions

async function ensureSwissRetreatExists(): Promise<string> {
  const { data: existing } = await supabase
    .from("retreat_sessions")
    .select("id")
    .eq("name", "Switzerland Sacred Journey - June 2024")
    .single();

  if (existing) return existing.id;

  const { data: newRetreat } = await supabase
    .from("retreat_sessions")
    .insert({
      name: "Switzerland Sacred Journey - June 2024",
      location: "switzerland",
      start_date: "2024-06-13T14:00:00Z",
      end_date: "2024-06-15T14:00:00Z",
      max_participants: 20,
      theme: "Elemental Transformation in the Sacred Alps",
      description:
        "A deep dive into soul evolution through the Spiralogic framework",
    })
    .select("id")
    .single();

  return newRetreat!.id;
}

async function generatePersonalizedWelcome(
  participant: any,
  eventType: string,
): Promise<any> {
  const { soullabFounderAgent } = await import(
    "../core/agents/soullabFounderAgent"
  );

  const welcomeMessage = await soullabFounderAgent.generatePersonalWelcome({
    ...participant,
    metadata: { eventType },
  });

  return {
    message: welcomeMessage.message,
    videoUrl: "https://soullab.com/welcome-retreat",
    personalizedElements: welcomeMessage.personalizedElements,
    journeyHighlights: [
      "Deep Transformation",
      "Shadow Work",
      "Oracle Partnership",
      "Sacred Ceremony",
    ],
  };
}

async function generateElementalProfile(questionnaire: any): Promise<any> {
  // Calculate elemental scores based on questionnaire responses
  const scores = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0,
  };

  // Analyze responses to determine elemental affinities
  // Fire: passion, vision, transformation
  if (
    questionnaire.intentions.primaryIntention.includes("transform") ||
    questionnaire.intentions.primaryIntention.includes("create")
  ) {
    scores.fire += 3;
  }

  // Water: emotions, intuition, flow
  if (
    questionnaire.emotionalLandscape.emotionalStrengths.includes("empathy") ||
    questionnaire.emotionalLandscape.emotionalStrengths.includes("intuition")
  ) {
    scores.water += 3;
  }

  // Earth: grounding, manifestation, structure
  if (
    questionnaire.readiness.physicalHealth >= 8 ||
    questionnaire.lifeContext.currentLifePhase.includes("building")
  ) {
    scores.earth += 3;
  }

  // Air: clarity, communication, perspective
  if (
    questionnaire.readiness.mentalClarity >= 8 ||
    questionnaire.spiritualJourney.practicesEngaged.includes("meditation")
  ) {
    scores.air += 3;
  }

  // Aether: integration, unity, transcendence
  if (
    questionnaire.spiritualJourney.connectionToNature >= 8 ||
    questionnaire.shadowWork.shadowAwareness >= 8
  ) {
    scores.aether += 3;
  }

  // Normalize scores
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const normalized = Object.entries(scores).reduce((acc, [element, score]) => {
    acc[element] = Math.round((score / total) * 100);
    return acc;
  }, {} as any);

  // Find dominant element
  const dominant = Object.entries(normalized).sort(
    ([, a], [, b]) => (b as number) - (a as number),
  )[0][0];

  return {
    ...normalized,
    dominantElement: dominant,
  };
}

async function getFounderQuestionnaireReflection(
  participantId: string,
  questionnaire: any,
): Promise<string> {
  const { soullabFounderAgent } = await import(
    "../core/agents/soullabFounderAgent"
  );

  const reflection = await soullabFounderAgent.reflectOnQuestionnaire({
    participantId,
    intentions: questionnaire.intentions,
    shadowWork: questionnaire.shadowWork,
    emotionalLandscape: questionnaire.emotionalLandscape,
  });

  return reflection.content;
}

async function assignEnhancedPersonalOracle(participant: any): Promise<any> {
  const element = participant.elementalProfile.dominantElement;
  const archetype = getArchetypeForProfile(participant);
  const oracleId = participant.personalOracleId || require("uuid").v4();

  // Update participant
  await supabase
    .from("retreat_participants")
    .update({
      personalOracleId: oracleId,
      oracleElement: element,
      oracleArchetype: archetype,
      oracleAssignedAt: new Date(),
    })
    .eq("id", participant.id);

  return { element, archetype, oracleId };
}

function getArchetypeForProfile(participant: any): string {
  const { dominantElement } = participant.elementalProfile;
  const { primaryIntention } = participant.retreatIntentions || {};

  // Enhanced archetype selection based on element and intention
  const archetypeMap: any = {
    fire: {
      default: "Visionary Pioneer",
      leadership: "Sacred Leader",
      creativity: "Creative Catalyst",
      transformation: "Phoenix Rising",
    },
    water: {
      default: "Emotional Alchemist",
      healing: "Sacred Healer",
      intuition: "Mystic Seer",
      relationship: "Heart Weaver",
    },
    earth: {
      default: "Sacred Builder",
      abundance: "Abundance Guardian",
      service: "Earth Keeper",
      manifestation: "Dream Weaver",
    },
    air: {
      default: "Wisdom Weaver",
      clarity: "Truth Seer",
      communication: "Sacred Messenger",
      innovation: "Mind Dancer",
    },
    aether: {
      default: "Unity Catalyst",
      integration: "Sacred Integrator",
      transcendence: "Spirit Bridge",
      wholeness: "Cosmic Weaver",
    },
  };

  const elementArchetypes =
    archetypeMap[dominantElement] || archetypeMap.aether;

  // Match intention keywords to specific archetypes
  if (primaryIntention) {
    for (const [key, archetype] of Object.entries(elementArchetypes)) {
      if (key !== "default" && primaryIntention.toLowerCase().includes(key)) {
        return archetype as string;
      }
    }
  }

  return elementArchetypes.default;
}

async function createOracleIntroduction(
  participant: any,
  assignment: any,
): Promise<any> {
  const { soullabFounderAgent } = await import(
    "../core/agents/soullabFounderAgent"
  );

  const intro = await soullabFounderAgent.introducePersonalOracle(
    participant,
    assignment.element,
    assignment.archetype,
  );

  return {
    founderIntroduction: intro.content,
    oracleMessage: `Greetings, ${participant.preferredName || participant.firstName}. I am your ${assignment.element} Oracle, ${assignment.archetype}. I have been waiting for you.`,
    guidancePreview: `As we journey together, I will help you ${getOraclePromise(assignment.element)}.`,
  };
}

function getOraclePromise(element: string): string {
  const promises: any = {
    fire: "ignite your vision and transform what no longer serves",
    water: "flow with your emotions and alchemize pain into wisdom",
    earth: "ground your dreams into reality and build lasting foundations",
    air: "gain clarity on your path and communicate your truth",
    aether: "integrate all aspects of yourself and embody unity consciousness",
  };
  return promises[element] || "discover your unique medicine for the world";
}

async function generateRetreatPreparation(participantId: string): Promise<any> {
  const { data: participant } = await supabase
    .from("retreat_participants")
    .select("*")
    .eq("id", participantId)
    .single();

  if (!participant) throw new Error("Participant not found");

  return {
    personalizedMessage: `Dear ${participant.preferredName || participant.firstName},

Your journey to Switzerland is approaching! Your ${participant.oracleElement} Oracle has been preparing the energetic space for your arrival.

Based on your intentions and current state, we recommend:

1. Daily Practice: Spend 10 minutes each morning connecting with the ${participant.oracleElement} element
2. Shadow Work: Journal on the patterns you're ready to release
3. Body Preparation: Gentle movement and breathwork to open your channels
4. Oracle Connection: Daily check-ins with your Personal Oracle for guidance

The mountains are calling, and your transformation awaits.

With love,
Kelly & Your ${participant.oracleArchetype}`,

    practices: {
      daily: getDailyPractice(participant.oracleElement),
      preparatory: getPreparatoryWork(participant.retreatIntentions),
      integration: "Begin imagining yourself already transformed",
    },

    reminders: [
      "Complete your medical and dietary forms",
      "Book your flights to Zurich",
      "Prepare comfortable mountain clothing",
      "Bring a journal for integration",
      "Set aside integration time post-retreat",
    ],
  };
}

function getDailyPractice(element: string): string {
  const practices: any = {
    fire: "Morning sun gazing and intention setting with candle meditation",
    water: "Emotional flow practice with conscious breathing near water",
    earth: "Grounding barefoot on earth and root chakra activation",
    air: "Pranayama breathwork and sky gazing meditation",
    aether: "Unity meditation connecting all elements within",
  };
  return practices[element] || "Elemental meditation of your choice";
}

function getPreparatoryWork(intentions: any): string[] {
  const work = [
    "Shadow inventory: List patterns ready for transformation",
    "Gratitude practice: Acknowledge your journey thus far",
    "Vision casting: See yourself post-transformation",
  ];

  if (intentions?.primaryIntention?.includes("relationship")) {
    work.push("Relationship inventory: Current dynamics and desired shifts");
  }

  if (intentions?.primaryIntention?.includes("purpose")) {
    work.push("Purpose clarification: Your unique medicine for the world");
  }

  return work;
}

export default router;

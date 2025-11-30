import { Router } from "express";
import { HolisticAssessmentService } from "../core/holistic/HolisticAssessmentService";
import { AdaptiveExperienceEngine } from "../core/holistic/AdaptiveExperienceEngine";
import { ElementalDomainMapper } from "../core/holistic/ElementalDomainMapper";
import { PersonalizedPathwayGenerator } from "../core/holistic/PersonalizedPathwayGenerator";
import {
  UserHolisticProfile,
  DevelopmentGoal,
  HolisticDomain,
} from "../core/holistic/types";

const router = Router();

// In-memory storage for demo purposes - replace with actual database
const profiles: Map<string, UserHolisticProfile> = new Map();
const pathways: Map<string, any> = new Map();

// Initialize services
const assessmentService = new HolisticAssessmentService();
const experienceEngine = new AdaptiveExperienceEngine();
const elementalMapper = new ElementalDomainMapper();
const pathwayGenerator = new PersonalizedPathwayGenerator();

// Assessment endpoint
router.post("/assessment", async (req, res) => {
  try {
    const { userId, assessmentData } = req.body;

    const profile = assessmentService.generateHolisticProfile(
      userId,
      assessmentData,
    );
    profiles.set(userId, profile);

    // Generate personalized pathway
    const pathway = pathwayGenerator.generatePersonalizedPathway(profile);
    pathways.set(userId, pathway);

    res.json(profile);
  } catch (error) {
    console.error("Assessment error:", error);
    res.status(500).json({ error: "Assessment failed" });
  }
});

// Get user profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = profiles.get(userId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

// Update user profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedProfile: UserHolisticProfile = req.body;

    // Re-detect user state based on updated information
    updatedProfile.currentState =
      assessmentService.detectUserState(updatedProfile);
    updatedProfile.lastUpdated = new Date();

    profiles.set(userId, updatedProfile);

    res.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get personalized pathway
router.get("/pathway/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const pathway = pathways.get(userId);

    if (!pathway) {
      return res.status(404).json({ error: "Pathway not found" });
    }

    res.json(pathway);
  } catch (error) {
    console.error("Pathway retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve pathway" });
  }
});

// Update pathway progress
router.put("/pathway/:userId/step/:stepId", async (req, res) => {
  try {
    const { userId, stepId } = req.params;
    const { completed } = req.body;

    const pathway = pathways.get(userId);
    if (!pathway) {
      return res.status(404).json({ error: "Pathway not found" });
    }

    const updatedPathway = pathwayGenerator.updatePathwayProgress(
      pathway,
      stepId,
      completed,
    );
    pathways.set(userId, updatedPathway);

    res.json(updatedPathway);
  } catch (error) {
    console.error("Pathway update error:", error);
    res.status(500).json({ error: "Failed to update pathway" });
  }
});

// Get state-responsive guidance
router.post("/guidance", async (req, res) => {
  try {
    const { profile } = req.body;

    const guidance = experienceEngine.generateStateResponsiveGuidance(profile);

    res.json(guidance);
  } catch (error) {
    console.error("Guidance generation error:", error);
    res.status(500).json({ error: "Failed to generate guidance" });
  }
});

// Get adaptive content
router.post("/content/adaptive", async (req, res) => {
  try {
    const { baseContent, userProfile, targetDomains } = req.body;

    const adaptiveContent = experienceEngine.generateAdaptiveContent(
      baseContent,
      userProfile,
      targetDomains,
    );

    res.json(adaptiveContent);
  } catch (error) {
    console.error("Adaptive content error:", error);
    res.status(500).json({ error: "Failed to generate adaptive content" });
  }
});

// Get elemental recommendations
router.post("/elemental/recommendations", async (req, res) => {
  try {
    const { profile, targetElement } = req.body;

    const recommendations = elementalMapper.generateElementalRecommendations(
      profile,
      targetElement,
    );

    res.json(recommendations);
  } catch (error) {
    console.error("Elemental recommendations error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate elemental recommendations" });
  }
});

// Get elemental balance
router.get("/elemental/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = profiles.get(userId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const balance = elementalMapper.createElementalBalance(profile);
    const dominantElement =
      elementalMapper.getDominantElementForProfile(profile);
    const balancingElement = elementalMapper.getBalancingElement(profile);

    res.json({
      balance,
      dominantElement,
      balancingElement,
    });
  } catch (error) {
    console.error("Elemental balance error:", error);
    res.status(500).json({ error: "Failed to calculate elemental balance" });
  }
});

// Create or update development goals
router.post("/goals/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const goals: DevelopmentGoal[] = req.body;

    const profile = profiles.get(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    profile.developmentGoals = goals;
    profile.lastUpdated = new Date();
    profiles.set(userId, profile);

    // Regenerate pathway with new goals
    const updatedPathway = pathwayGenerator.generatePersonalizedPathway(
      profile,
      goals,
    );
    pathways.set(userId, updatedPathway);

    res.json({ profile, pathway: updatedPathway });
  } catch (error) {
    console.error("Goals update error:", error);
    res.status(500).json({ error: "Failed to update goals" });
  }
});

// Get domain-specific assessment questions
router.get("/assessment/questions/:domain", async (req, res) => {
  try {
    const { domain } = req.params;

    // This would typically come from a configuration or database
    const questions = {
      [HolisticDomain.MIND]: [
        {
          question: "How clear and focused do you feel in your daily thinking?",
          options: [
            "very_clear",
            "mostly_clear",
            "somewhat_foggy",
            "very_foggy",
          ],
        },
        {
          question: "How well do you communicate your thoughts and ideas?",
          options: ["excellently", "well", "adequately", "poorly"],
        },
        {
          question:
            "How effectively do you solve problems and learn new concepts?",
          options: ["very_effectively", "effectively", "somewhat", "struggle"],
        },
      ],
      [HolisticDomain.BODY]: [
        {
          question: "How connected do you feel to your physical body?",
          options: ["very_connected", "connected", "somewhat", "disconnected"],
        },
        {
          question: "How would you rate your overall physical energy levels?",
          options: ["high", "good", "moderate", "low"],
        },
        {
          question: "How well do you maintain physical wellness practices?",
          options: ["consistently", "regularly", "occasionally", "rarely"],
        },
      ],
      [HolisticDomain.SPIRIT]: [
        {
          question: "How connected do you feel to your life purpose?",
          options: ["deeply", "connected", "searching", "lost"],
        },
        {
          question:
            "How often do you experience moments of transcendence or deep meaning?",
          options: ["frequently", "regularly", "occasionally", "rarely"],
        },
        {
          question: "How aligned do your actions feel with your values?",
          options: ["fully", "mostly", "somewhat", "misaligned"],
        },
      ],
      [HolisticDomain.EMOTIONS]: [
        {
          question: "How well do you understand and process your emotions?",
          options: ["very_well", "well", "adequately", "poorly"],
        },
        {
          question: "How effectively do you express emotions in healthy ways?",
          options: ["very_effectively", "effectively", "somewhat", "struggle"],
        },
        {
          question: "How resilient are you in emotional challenges?",
          options: ["very_resilient", "resilient", "somewhat", "fragile"],
        },
      ],
    };

    const domainQuestions = questions[domain as HolisticDomain];
    if (!domainQuestions) {
      return res.status(400).json({ error: "Invalid domain" });
    }

    res.json(domainQuestions);
  } catch (error) {
    console.error("Questions retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve questions" });
  }
});

// Get progress metrics
router.get("/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = profiles.get(userId);
    const pathway = pathways.get(userId);

    if (!profile || !pathway) {
      return res.status(404).json({ error: "Data not found" });
    }

    const pathwayProgress = pathwayGenerator.calculatePathwayProgress(pathway);
    const domainBalance = assessmentService.calculateDomainBalance(profile);
    const priorityDomains = assessmentService.identifyPriorityDomains(profile);

    res.json({
      pathwayProgress,
      domainBalance,
      priorityDomains,
      currentPhase: pathway.currentPhase,
      progressMetrics: pathway.progressMetrics,
    });
  } catch (error) {
    console.error("Progress retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve progress" });
  }
});

// Re-assess domain
router.post("/reassess/:userId/:domain", async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const { responses } = req.body;

    const profile = profiles.get(userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const domainProfile = assessmentService.assessUserDomain(
      domain as HolisticDomain,
      responses,
    );

    // Update the specific domain in the profile
    const domainIndex = profile.domains.findIndex((d) => d.domain === domain);
    if (domainIndex >= 0) {
      profile.domains[domainIndex] = domainProfile;
    } else {
      profile.domains.push(domainProfile);
    }

    // Re-detect overall state
    profile.currentState = assessmentService.detectUserState(profile);
    profile.lastUpdated = new Date();

    profiles.set(userId, profile);

    // Regenerate pathway if needed
    const updatedPathway = pathwayGenerator.generatePersonalizedPathway(
      profile,
      profile.developmentGoals,
    );
    pathways.set(userId, updatedPathway);

    res.json({ profile, pathway: updatedPathway });
  } catch (error) {
    console.error("Reassessment error:", error);
    res.status(500).json({ error: "Failed to reassess domain" });
  }
});

export default router;

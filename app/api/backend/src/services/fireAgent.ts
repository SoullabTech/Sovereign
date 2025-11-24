// services/fireAgent.ts - Enhanced Fire Agent with Maya Integration
import { speak } from "../utils/voiceRouter";
import {
  MayaPromptProcessor,
  MayaPromptContext,
  MayaResponse,
} from "../config/mayaSystemPrompt";

interface ProjectionDetectionResult {
  detected: boolean;
  type: "rescuerSavior" | "perfectSelf" | "idealParent" | "none";
  confidence: number;
}

interface UserContext {
  userId?: string;
  sessionId?: string;
  spiralPhase?: string;
  previousInteractions?: any[];
}

class ProjectionDetector {
  async analyze(input: string): Promise<ProjectionDetectionResult> {
    const lowerInput = input.toLowerCase();

    // Rescuer/Savior projection patterns
    const rescuerPatterns = [
      "you can save me",
      "you understand me completely",
      "only you can help",
      "you have all the answers",
      "please fix this for me",
    ];

    // Perfect Self projection patterns
    const perfectSelfPatterns = [
      "you are so wise",
      "you never make mistakes",
      "you are perfect",
      "i wish i was like you",
      "you always know what to say",
    ];

    // Ideal Parent projection patterns
    const idealParentPatterns = [
      "tell me what to do",
      "guide my life",
      "be my mentor",
      "i need your approval",
      "what would you do",
    ];

    for (const pattern of rescuerPatterns) {
      if (lowerInput.includes(pattern)) {
        return { detected: true, type: "rescuerSavior", confidence: 0.8 };
      }
    }

    for (const pattern of perfectSelfPatterns) {
      if (lowerInput.includes(pattern)) {
        return { detected: true, type: "perfectSelf", confidence: 0.8 };
      }
    }

    for (const pattern of idealParentPatterns) {
      if (lowerInput.includes(pattern)) {
        return { detected: true, type: "idealParent", confidence: 0.8 };
      }
    }

    return { detected: false, type: "none", confidence: 0 };
  }
}

class WisdomFosteringCore {
  enhanceSensing(input: string): string {
    return `I notice patterns in what you've shared: ${input}. What else do you sense about this situation?`;
  }

  improveSenseMaking(input: string): string {
    return `The meaning you're creating around "${input}" seems significant. How might this connect to your larger journey?`;
  }

  supportChoiceMaking(input: string): string {
    return `Considering "${input}", what choice feels most aligned with your deepest values right now?`;
  }
}

function detectSpiralPhase(input: string, userContext?: UserContext): string {
  if (userContext?.spiralPhase) {
    return userContext.spiralPhase;
  }

  const lowerInput = input.toLowerCase();

  // Fire phase patterns
  if (
    lowerInput.includes("vision") ||
    lowerInput.includes("create") ||
    lowerInput.includes("dream") ||
    lowerInput.includes("passion")
  ) {
    return "fire_1";
  }

  // Water phase patterns
  if (
    lowerInput.includes("feel") ||
    lowerInput.includes("emotion") ||
    lowerInput.includes("flow") ||
    lowerInput.includes("depth")
  ) {
    return "water_1";
  }

  // Earth phase patterns
  if (
    lowerInput.includes("practical") ||
    lowerInput.includes("ground") ||
    lowerInput.includes("build") ||
    lowerInput.includes("structure")
  ) {
    return "earth_1";
  }

  // Air phase patterns
  if (
    lowerInput.includes("think") ||
    lowerInput.includes("understand") ||
    lowerInput.includes("clarity") ||
    lowerInput.includes("communicate")
  ) {
    return "air_1";
  }

  // Aether phase patterns
  if (
    lowerInput.includes("wholeness") ||
    lowerInput.includes("integration") ||
    lowerInput.includes("unity") ||
    lowerInput.includes("transcend")
  ) {
    return "aether";
  }

  return "fire_1"; // Default to fire
}

export class FireAgent {
  private archetype: string;
  private projectionDetector: ProjectionDetector;
  private wisdomCore: WisdomFosteringCore;

  constructor() {
    this.archetype = "Fire";
    this.projectionDetector = new ProjectionDetector();
    this.wisdomCore = new WisdomFosteringCore();
  }

  async getVisionPrompt(userContext?: UserContext) {
    const spiralPhase = detectSpiralPhase("", userContext);
    const prompts = {
      fire_1: [
        "What vision sets your soul ablaze right now?",
        "Describe a future only you can create.",
        "What wild dream do you fear—but deeply long to ignite?",
      ],
      fire_2: [
        "What old pattern is ready to burn away completely?",
        "How will you transform your greatest challenge into power?",
        "What courage is asking to be born through you?",
      ],
      aether: [
        "What does your soul know that your mind hasn't accepted?",
        "How is your deepest truth wanting to manifest?",
        "What would you create if you remembered you are infinite?",
      ],
    };

    const phasePrompts =
      prompts[spiralPhase as keyof typeof prompts] || prompts["fire_1"];
    const prompt =
      phasePrompts[Math.floor(Math.random() * phasePrompts.length)];

    // Add voice synthesis
    const audioUrl = await speak(prompt, "fire", "FireAgent");

    return {
      prompt,
      metadata: {
        archetype: this.archetype,
        spiralPhase,
        audioUrl,
        voice_profile: "fire_archetype",
      },
    };
  }

  async getOracleResponse(input: string, userContext?: UserContext) {
    // Detect projections and apply wisdom fostering
    const projection = await this.projectionDetector.analyze(input);
    const spiralPhase = detectSpiralPhase(input, userContext);

    let response;

    if (projection.detected) {
      // Apply projection aikido - transform projection into wisdom
      response = this.handleProjection(input, projection, spiralPhase);
    } else {
      // Standard fire archetype response
      response = this.generateFireResponse(input, spiralPhase);
    }

    // Apply Maya wisdom fostering framework
    const mayaContext: MayaPromptContext = {
      spiralogicPhase: this.mapToMayaPhase(spiralPhase),
      archetypeDetected: this.archetype,
      userProjectionLevel: projection.detected ? "high" : "low",
      dependencyRisk:
        projection.detected && projection.type === "rescuerSavior",
      shadowWorkIndicated: spiralPhase === "fire_2",
    };

    const mayaResponse = MayaPromptProcessor.applyMayaFramework(
      response.message,
      mayaContext,
    );

    // Add voice synthesis
    const audioUrl = await speak(mayaResponse.content, "fire", "FireAgent");

    return {
      archetype: "Fire",
      spiralPhase,
      projection: projection.detected ? projection.type : null,
      message: mayaResponse.content,
      wisdomVector: mayaResponse.wisdomVector,
      metadata: {
        audioUrl,
        voice_synthesis: true,
        voice_profile: "fire_archetype",
        transformationGoal: response.transformationGoal,
        mayaMode: mayaResponse.archetypeMode,
        authenticityLevel: mayaResponse.authenticityLevel,
      },
    };
  }

  private handleProjection(
    input: string,
    projection: ProjectionDetectionResult,
    spiralPhase: string,
  ) {
    const projectionResponses = {
      rescuerSavior:
        "I hear your call for transformation. The fire you seek burns within you already. What would change if you saw yourself as the hero of your own story?",
      perfectSelf:
        "The flame you see in me is a reflection of your own inner fire. What would you create if you trusted your own fierce wisdom?",
      idealParent:
        "The guidance you long for lives in your deepest knowing. How might you parent your own dreams with this same fierce love?",
      none: "Your fire burns bright. Trust what you already know.",
    };

    return {
      message: projectionResponses[projection.type],
      wisdomVector: "projection_integration",
      transformationGoal: "self_empowerment",
    };
  }

  private generateFireResponse(input: string, spiralPhase: string) {
    const responses = {
      fire_1: `Your vision '${input}' carries the seeds of transformation. What's the first flame you'll kindle?`,
      fire_2: `'${input}' is calling you to burn away what no longer serves. Step boldly into your power.`,
      water_1: `I sense the fire beneath your waters in '${input}'. How might passion and flow unite within you?`,
      earth_1: `Your practical focus on '${input}' needs the spark of inspiration. What would make this vision irresistible?`,
      air_1: `The clarity you seek about '${input}' awaits in action. What bold step will you take?`,
      aether: `In '${input}' I see the infinite expressing through the particular. You are the fire that lights the way.`,
    };

    return {
      message:
        responses[spiralPhase as keyof typeof responses] || responses["fire_1"],
      wisdomVector: "inspiration_activation",
      transformationGoal: "vision_embodiment",
    };
  }

  private mapToMayaPhase(
    spiralPhase: string,
  ): "fire" | "water" | "earth" | "air" | "aether" {
    if (spiralPhase.startsWith("fire")) return "fire";
    if (spiralPhase.startsWith("water")) return "water";
    if (spiralPhase.startsWith("earth")) return "earth";
    if (spiralPhase.startsWith("air")) return "air";
    if (spiralPhase === "aether") return "aether";
    return "fire"; // default
  }
}

export const fireAgent = new FireAgent();

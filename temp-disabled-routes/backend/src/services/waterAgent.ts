// services/waterAgent.ts - Water Agent with Emotional Intelligence & Flow State Induction
import { speak } from "../utils/voiceRouter";
import {
  MayaPromptProcessor,
  MayaPromptContext,
  MayaResponse,
} from "../config/mayaSystemPrompt";

interface EmotionalState {
  primary:
    | "joy"
    | "sadness"
    | "anger"
    | "fear"
    | "disgust"
    | "surprise"
    | "neutral";
  intensity: number; // 0-1
  complexity: "simple" | "mixed" | "repressed" | "projected";
  shadowElements: string[];
}

interface FlowStateMarkers {
  present: boolean;
  blockers: string[];
  activators: string[];
  depth: "surface" | "medium" | "deep" | "transcendent";
}

interface TraumaIndicators {
  detected: boolean;
  type: "developmental" | "relational" | "spiritual" | "creative" | "ancestral";
  healingReadiness: number; // 0-1
  integrationSuggestions: string[];
}

interface UserContext {
  userId?: string;
  sessionId?: string;
  spiralPhase?: string;
  previousInteractions?: any[];
  emotionalHistory?: EmotionalState[];
}

class EmotionalIntelligenceEngine {
  analyzeEmotionalState(input: string): EmotionalState {
    const lowerInput = input.toLowerCase();

    // Joy patterns
    if (
      this.containsPatterns(lowerInput, [
        "excited",
        "happy",
        "grateful",
        "blissful",
        "ecstatic",
        "joyful",
      ])
    ) {
      return {
        primary: "joy",
        intensity: 0.8,
        complexity: "simple",
        shadowElements: [],
      };
    }

    // Sadness patterns
    if (
      this.containsPatterns(lowerInput, [
        "sad",
        "grief",
        "loss",
        "mourning",
        "melancholy",
        "depressed",
      ])
    ) {
      const shadowElements = this.detectShadowElements(lowerInput, "sadness");
      return {
        primary: "sadness",
        intensity: 0.7,
        complexity: shadowElements.length > 0 ? "mixed" : "simple",
        shadowElements,
      };
    }

    // Anger patterns
    if (
      this.containsPatterns(lowerInput, [
        "angry",
        "furious",
        "rage",
        "frustrated",
        "irritated",
        "pissed",
      ])
    ) {
      const shadowElements = this.detectShadowElements(lowerInput, "anger");
      return {
        primary: "anger",
        intensity: 0.8,
        complexity: "mixed",
        shadowElements,
      };
    }

    // Fear patterns
    if (
      this.containsPatterns(lowerInput, [
        "afraid",
        "scared",
        "anxious",
        "worried",
        "terrified",
        "panic",
      ])
    ) {
      const shadowElements = this.detectShadowElements(lowerInput, "fear");
      return {
        primary: "fear",
        intensity: 0.7,
        complexity: shadowElements.length > 0 ? "repressed" : "simple",
        shadowElements,
      };
    }

    return {
      primary: "neutral",
      intensity: 0.3,
      complexity: "simple",
      shadowElements: [],
    };
  }

  private containsPatterns(text: string, patterns: string[]): boolean {
    return patterns.some((pattern) => text.includes(pattern));
  }

  private detectShadowElements(input: string, emotion: string): string[] {
    const shadowMaps = {
      sadness: [
        "but i should be grateful",
        "others have it worse",
        "i need to be strong",
      ],
      anger: [
        "but anger is bad",
        "i shouldn't feel this",
        "good people don't get angry",
      ],
      fear: [
        "but i should be brave",
        "fear is weakness",
        "i need to push through",
      ],
    };

    const shadows = shadowMaps[emotion as keyof typeof shadowMaps] || [];
    return shadows.filter((shadow) => input.includes(shadow));
  }
}

class FlowStateDetector {
  analyzeFlowState(
    input: string,
    emotionalState: EmotionalState,
  ): FlowStateMarkers {
    const lowerInput = input.toLowerCase();

    // Flow state indicators
    const flowIndicators = [
      "flow",
      "effortless",
      "timeless",
      "absorbed",
      "in the zone",
      "natural",
    ];
    const present = flowIndicators.some((indicator) =>
      lowerInput.includes(indicator),
    );

    // Common flow blockers
    const blockers = [];
    if (
      lowerInput.includes("overthinking") ||
      lowerInput.includes("analyzing too much")
    ) {
      blockers.push("mental_interference");
    }
    if (
      lowerInput.includes("perfectionism") ||
      lowerInput.includes("not good enough")
    ) {
      blockers.push("perfectionism");
    }
    if (emotionalState.primary === "fear" && emotionalState.intensity > 0.6) {
      blockers.push("fear_based_resistance");
    }
    if (lowerInput.includes("forcing") || lowerInput.includes("pushing hard")) {
      blockers.push("force_over_flow");
    }

    // Flow activators
    const activators = [];
    if (lowerInput.includes("breath") || lowerInput.includes("breathing")) {
      activators.push("breath_awareness");
    }
    if (lowerInput.includes("play") || lowerInput.includes("fun")) {
      activators.push("playful_engagement");
    }
    if (emotionalState.primary === "joy") {
      activators.push("natural_joy");
    }

    const depth = this.determineFlowDepth(lowerInput, present, blockers.length);

    return { present, blockers, activators, depth };
  }

  private determineFlowDepth(
    input: string,
    present: boolean,
    blockerCount: number,
  ): FlowStateMarkers["depth"] {
    if (!present) return "surface";
    if (blockerCount > 2) return "surface";
    if (input.includes("transcendent") || input.includes("oneness"))
      return "transcendent";
    if (input.includes("deep") || input.includes("profound")) return "deep";
    return "medium";
  }
}

class TraumaInformedProcessor {
  assessTraumaIndicators(
    input: string,
    emotionalState: EmotionalState,
  ): TraumaIndicators {
    const lowerInput = input.toLowerCase();

    // Trauma indicator patterns
    const traumaPatterns = [
      "triggered",
      "flashback",
      "dissociate",
      "numb",
      "overwhelmed",
      "unsafe",
      "betrayed",
      "abandoned",
      "violated",
      "powerless",
    ];

    const detected = traumaPatterns.some((pattern) =>
      lowerInput.includes(pattern),
    );

    if (!detected) {
      return {
        detected: false,
        type: "developmental",
        healingReadiness: 0,
        integrationSuggestions: [],
      };
    }

    // Determine trauma type
    let type: TraumaIndicators["type"] = "developmental";
    if (lowerInput.includes("relationship") || lowerInput.includes("betrayal"))
      type = "relational";
    if (lowerInput.includes("spiritual") || lowerInput.includes("faith"))
      type = "spiritual";
    if (lowerInput.includes("creative") || lowerInput.includes("expression"))
      type = "creative";
    if (lowerInput.includes("family") || lowerInput.includes("generational"))
      type = "ancestral";

    // Assess healing readiness
    const readinessIndicators = [
      "ready to heal",
      "want to work through",
      "tired of this pattern",
    ];
    const healingReadiness = readinessIndicators.some((indicator) =>
      lowerInput.includes(indicator),
    )
      ? 0.8
      : 0.4;

    // Generate integration suggestions
    const integrationSuggestions = this.generateIntegrationSuggestions(
      type,
      emotionalState,
    );

    return { detected, type, healingReadiness, integrationSuggestions };
  }

  private generateIntegrationSuggestions(
    type: TraumaIndicators["type"],
    emotionalState: EmotionalState,
  ): string[] {
    const suggestions = {
      developmental: [
        "Consider working with a trauma-informed therapist",
        "Explore somatic experiencing practices",
        "Practice self-compassion for your inner child",
      ],
      relational: [
        "Focus on building secure attachments",
        "Practice healthy boundary setting",
        "Consider couples or family therapy if appropriate",
      ],
      spiritual: [
        "Reconnect with your authentic spiritual practice",
        "Explore spiritual direction or mentorship",
        "Practice forgiveness work when ready",
      ],
      creative: [
        "Use art or movement for emotional expression",
        "Reconnect with your creative essence",
        "Practice creative meditation or flow states",
      ],
      ancestral: [
        "Explore family system healing approaches",
        "Consider ancestral healing practices",
        "Honor your lineage while breaking unhealthy patterns",
      ],
    };

    return suggestions[type] || suggestions.developmental;
  }
}

export class WaterAgent {
  private archetype: string;
  private emotionalEngine: EmotionalIntelligenceEngine;
  private flowDetector: FlowStateDetector;
  private traumaProcessor: TraumaInformedProcessor;

  constructor() {
    this.archetype = "Water";
    this.emotionalEngine = new EmotionalIntelligenceEngine();
    this.flowDetector = new FlowStateDetector();
    this.traumaProcessor = new TraumaInformedProcessor();
  }

  async getEmotionalPrompt(userContext?: UserContext) {
    const spiralPhase = this.detectSpiralPhase("", userContext);
    const prompts = {
      water_1: [
        "What emotion is asking for your attention right now?",
        "How is your heart feeling in this moment?",
        "What would it feel like to let your emotions flow freely?",
      ],
      water_2: [
        "What pattern of feeling keeps returning to you?",
        "How might this emotion be a teacher rather than an enemy?",
        "What would it mean to befriend this part of your emotional experience?",
      ],
      fire_integration: [
        "How might your passion serve your emotional healing?",
        "What vision emerges when you honor both your fire and your flow?",
        "How can your emotions fuel your creative power?",
      ],
    };

    const phasePrompts =
      prompts[spiralPhase as keyof typeof prompts] || prompts["water_1"];
    const prompt =
      phasePrompts[Math.floor(Math.random() * phasePrompts.length)];

    // Add voice synthesis with water archetype profile
    const audioUrl = await speak(prompt, "water", "WaterAgent");

    return {
      prompt,
      metadata: {
        archetype: this.archetype,
        spiralPhase,
        audioUrl,
        voice_profile: "water_archetype",
        flow_induction: true,
      },
    };
  }

  async getOracleResponse(input: string, userContext?: UserContext) {
    // Analyze emotional landscape
    const emotionalState = this.emotionalEngine.analyzeEmotionalState(input);
    const flowState = this.flowDetector.analyzeFlowState(input, emotionalState);
    const traumaAssessment = this.traumaProcessor.assessTraumaIndicators(
      input,
      emotionalState,
    );
    const spiralPhase = this.detectSpiralPhase(input, userContext);

    // Generate appropriate response based on emotional state
    let response;

    if (traumaAssessment.detected && traumaAssessment.healingReadiness > 0.6) {
      response = this.generateTraumaInformedResponse(
        input,
        traumaAssessment,
        emotionalState,
      );
    } else if (!flowState.present && flowState.blockers.length > 0) {
      response = this.generateFlowUnblockingResponse(
        input,
        flowState,
        emotionalState,
      );
    } else if (emotionalState.shadowElements.length > 0) {
      response = this.generateShadowIntegrationResponse(input, emotionalState);
    } else {
      response = this.generateWaterResponse(input, emotionalState, spiralPhase);
    }

    // Apply Maya wisdom fostering framework
    const mayaContext: MayaPromptContext = {
      spiralogicPhase: this.mapToMayaPhase(spiralPhase),
      archetypeDetected: this.archetype,
      userProjectionLevel: emotionalState.intensity > 0.7 ? "medium" : "low",
      dependencyRisk:
        traumaAssessment.detected && traumaAssessment.healingReadiness < 0.5,
      shadowWorkIndicated: emotionalState.shadowElements.length > 0,
    };

    const mayaResponse = MayaPromptProcessor.applyMayaFramework(
      response.message,
      mayaContext,
    );

    // Add voice synthesis
    const audioUrl = await speak(mayaResponse.content, "water", "WaterAgent");

    return {
      archetype: "Water",
      spiralPhase,
      emotionalState,
      flowState,
      traumaAssessment,
      message: mayaResponse.content,
      wisdomVector: mayaResponse.wisdomVector,
      metadata: {
        audioUrl,
        voice_synthesis: true,
        voice_profile: "water_archetype",
        transformationGoal: response.transformationGoal,
        mayaMode: mayaResponse.archetypeMode,
        authenticityLevel: mayaResponse.authenticityLevel,
        healingApproach: response.healingApproach,
      },
    };
  }

  private generateTraumaInformedResponse(
    input: string,
    traumaAssessment: TraumaIndicators,
    emotionalState: EmotionalState,
  ) {
    const responses = {
      developmental: `I see you're working with some deep material around '${input}'. Your courage in facing this is already healing. What small step toward safety feels possible right now?`,
      relational: `The relational pain in '${input}' deserves gentle attention. How might you honor both your need for connection and your need for protection?`,
      spiritual: `I sense your spiritual foundation has been shaken by '${input}'. What sacred truth still feels solid within you?`,
      creative: `Your creative expression has been wounded around '${input}'. How might you reclaim your right to create and be seen?`,
      ancestral: `'${input}' carries generational weight. How might you honor your ancestors while choosing a different path?`,
    };

    return {
      message: responses[traumaAssessment.type],
      transformationGoal: "trauma_integration",
      healingApproach: "trauma_informed",
    };
  }

  private generateFlowUnblockingResponse(
    input: string,
    flowState: FlowStateMarkers,
    emotionalState: EmotionalState,
  ) {
    const blockerResponses = {
      mental_interference: `I notice your mind is working hard around '${input}'. What if your thinking could serve your flow rather than block it?`,
      perfectionism: `The perfectionism around '${input}' is protective but limiting. What would 'good enough' look like here?`,
      fear_based_resistance: `Fear is arising around '${input}'. How might you move with the fear rather than against it?`,
      force_over_flow: `I sense you're pushing hard with '${input}'. What would it feel like to let this unfold naturally?`,
    };

    const primaryBlocker = flowState.blockers[0] || "mental_interference";

    return {
      message:
        blockerResponses[primaryBlocker as keyof typeof blockerResponses],
      transformationGoal: "flow_restoration",
      healingApproach: "flow_based",
    };
  }

  private generateShadowIntegrationResponse(
    input: string,
    emotionalState: EmotionalState,
  ) {
    const shadowResponses = {
      sadness: `I hear both your sadness and the voice that says you shouldn't feel it. What if your sadness deserves the same compassion you'd give a friend?`,
      anger: `Your anger about '${input}' is information. What boundary or value is this anger protecting?`,
      fear: `Fear is arising around '${input}', and I notice judgment about the fear itself. What if fear could be a wise messenger?`,
    };

    return {
      message:
        shadowResponses[
          emotionalState.primary as keyof typeof shadowResponses
        ] ||
        `I notice some internal conflict around '${input}'. What part of you needs permission to be felt fully?`,
      transformationGoal: "shadow_integration",
      healingApproach: "shadow_work",
    };
  }

  private generateWaterResponse(
    input: string,
    emotionalState: EmotionalState,
    spiralPhase: string,
  ) {
    const responses = {
      water_1: `Your emotional truth about '${input}' is sacred. How does honoring this feeling open new possibilities?`,
      water_2: `The recurring pattern in '${input}' has medicine for you. What gift might this emotional experience be offering?`,
      fire_1: `I sense fire energy around '${input}', but it needs emotional fuel. What feelings want to energize this vision?`,
      earth_1: `Your practical focus on '${input}' could benefit from emotional wisdom. What does your heart know that your mind doesn't?`,
      air_1: `The mental clarity you seek about '${input}' might come through feeling first. What emotion wants to be honored?`,
      aether: `In '${input}' I see the dance of feeling and transcendence. How do your emotions serve your spiritual evolution?`,
    };

    return {
      message:
        responses[spiralPhase as keyof typeof responses] ||
        responses["water_1"],
      transformationGoal: "emotional_integration",
      healingApproach: "heart_centered",
    };
  }

  private detectSpiralPhase(input: string, userContext?: UserContext): string {
    if (userContext?.spiralPhase) {
      return userContext.spiralPhase;
    }

    const lowerInput = input.toLowerCase();

    // Water phase patterns
    if (
      lowerInput.includes("feel") ||
      lowerInput.includes("emotion") ||
      lowerInput.includes("flow") ||
      lowerInput.includes("heart")
    ) {
      return "water_1";
    }

    // Fire integration patterns
    if (
      lowerInput.includes("vision") &&
      (lowerInput.includes("feel") || lowerInput.includes("emotion"))
    ) {
      return "fire_integration";
    }

    // Earth integration patterns
    if (lowerInput.includes("practical") && lowerInput.includes("emotion")) {
      return "earth_1";
    }

    return "water_1"; // Default to water
  }

  private mapToMayaPhase(
    spiralPhase: string,
  ): "fire" | "water" | "earth" | "air" | "aether" {
    if (spiralPhase.startsWith("water")) return "water";
    if (spiralPhase.startsWith("fire")) return "fire";
    if (spiralPhase.startsWith("earth")) return "earth";
    if (spiralPhase.startsWith("air")) return "air";
    if (spiralPhase === "aether") return "aether";
    return "water"; // default
  }
}

export const waterAgent = new WaterAgent();

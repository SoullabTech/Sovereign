import {
  ElementalAlchemyHoloflower,
  HoloflowerState,
  HoloflowerHouse,
} from "../core/ElementalAlchemyHoloflower";
import { supabase } from "../lib/supabaseClient";
import { WebSocketServer } from "ws";

interface UserAlchemyState {
  userId: string;
  holoflower: ElementalAlchemyHoloflower;
  lastUpdate: Date;
  transformationHistory: AlchemicalTransformation[];
  insightHistory: TransformationInsight[];
}

interface AlchemicalTransformation {
  id: string;
  timestamp: Date;
  fromHouse: number;
  toHouse: number;
  alchemicalProcess: string;
  consciousnessShift: string;
  elementalShift: string;
  intensity: number;
}

interface TransformationInsight {
  id: string;
  timestamp: Date;
  type: "breakthrough" | "integration" | "shadow_work" | "alchemical_process";
  houseNumber: number;
  insight: string;
  metadata: any;
}

interface GroupAlchemyPattern {
  groupId: string;
  participants: string[];
  collectiveState: HoloflowerState;
  alchemicalResonance: Map<string, number>;
  consciousnessField: Map<string, number>;
  emergentWisdom: string[];
}

export class ElementalAlchemyService {
  private userStates: Map<string, UserAlchemyState> = new Map();
  private groupPatterns: Map<string, GroupAlchemyPattern> = new Map();
  private wsServer: WebSocketServer | null = null;
  private sacredTimingInterval: NodeJS.Timer | null = null;

  constructor() {
    this.initializeWebSocketServer();
    this.startSacredTimingUpdates();
  }

  private initializeWebSocketServer() {
    this.wsServer = new WebSocketServer({ port: 5003 });

    this.wsServer.on("connection", (ws, req) => {
      const userId = req.url?.split("/").pop();
      if (!userId) return;

      ws.on("message", async (message) => {
        const data = JSON.parse(message.toString());
        await this.handleClientMessage(userId, data);
      });

      // Send initial state
      this.getUserState(userId).then((userState) => {
        ws.send(
          JSON.stringify({
            type: "initial-state",
            state: userState.holoflower.getState(),
            history: userState.transformationHistory,
          }),
        );
      });
    });
  }

  private async handleClientMessage(userId: string, data: any) {
    const userState = await this.getUserState(userId);

    switch (data.type) {
      case "update-intensity":
        await this.updateHouseIntensity(
          userId,
          data.houseNumber,
          data.intensity,
        );
        break;

      case "activate-transformation":
        await this.activateTransformation(userId, data.fromHouse, data.toHouse);
        break;

      case "integrate-phi-spiral":
        await this.integratePhiSpiral(userId);
        break;

      case "request-insights":
        await this.generatePersonalInsights(userId);
        break;

      case "request-group-alchemy":
        await this.analyzeGroupAlchemy(data.groupId);
        break;
    }
  }

  public async getUserState(userId: string): Promise<UserAlchemyState> {
    if (this.userStates.has(userId)) {
      return this.userStates.get(userId)!;
    }

    // Load saved state from database
    const savedState = await this.loadUserState(userId);
    const holoflower = new ElementalAlchemyHoloflower(savedState);

    const userState: UserAlchemyState = {
      userId,
      holoflower,
      lastUpdate: new Date(),
      transformationHistory: await this.loadTransformationHistory(userId),
      insightHistory: await this.loadInsightHistory(userId),
    };

    this.userStates.set(userId, userState);
    return userState;
  }

  private async loadUserState(
    userId: string,
  ): Promise<Partial<HoloflowerState> | undefined> {
    const { data, error } = await supabase
      .from("elemental_alchemy_states")
      .select("state")
      .eq("user_id", userId)
      .single();

    return data?.state;
  }

  private async loadTransformationHistory(
    userId: string,
  ): Promise<AlchemicalTransformation[]> {
    const { data, error } = await supabase
      .from("alchemical_transformations")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(100);

    return data || [];
  }

  private async loadInsightHistory(
    userId: string,
  ): Promise<TransformationInsight[]> {
    const { data, error } = await supabase
      .from("transformation_insights")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(50);

    return data || [];
  }

  public async updateHouseIntensity(
    userId: string,
    houseNumber: number,
    intensity: number,
  ) {
    const userState = await this.getUserState(userId);
    const previousState = userState.holoflower.getState();

    userState.holoflower.updateHouseIntensity(houseNumber, intensity);
    userState.lastUpdate = new Date();

    const newState = userState.holoflower.getState();

    // Check for significant changes
    await this.detectBreakthroughs(userId, previousState, newState);

    // Broadcast update
    this.broadcastUpdate(userId, newState);

    // Save state
    await this.saveUserState(userId);
  }

  public async activateTransformation(
    userId: string,
    fromHouse: number,
    toHouse: number,
  ) {
    const userState = await this.getUserState(userId);
    const insight = userState.holoflower.getTransformationInsight(
      fromHouse,
      toHouse,
    );

    userState.holoflower.activateTransformation(fromHouse, toHouse);

    // Record transformation
    const transformation: AlchemicalTransformation = {
      id: `${userId}-${Date.now()}`,
      timestamp: new Date(),
      fromHouse,
      toHouse,
      alchemicalProcess: this.determineAlchemicalProcess(fromHouse, toHouse),
      consciousnessShift: this.analyzeConsciousnessShift(fromHouse, toHouse),
      elementalShift: this.analyzeElementalShift(fromHouse, toHouse),
      intensity: 1.0,
    };

    userState.transformationHistory.push(transformation);

    // Save transformation to database
    await supabase.from("alchemical_transformations").insert({
      ...transformation,
      user_id: userId,
      insight,
    });

    // Generate and save insight
    await this.generateTransformationInsight(
      userId,
      fromHouse,
      toHouse,
      insight,
    );

    // Broadcast update
    this.broadcastUpdate(userId, userState.holoflower.getState());
    await this.saveUserState(userId);
  }

  public async integratePhiSpiral(userId: string) {
    const userState = await this.getUserState(userId);
    userState.holoflower.integratePhiSpiral();

    // Record phi integration
    const insight: TransformationInsight = {
      id: `${userId}-phi-${Date.now()}`,
      timestamp: new Date(),
      type: "integration",
      houseNumber: 0, // Center
      insight:
        "Phi spiral integration activated - harmonizing all houses through golden ratio",
      metadata: {
        centerIntegration:
          userState.holoflower.getState().centerSpiral.integration,
      },
    };

    userState.insightHistory.push(insight);

    await supabase.from("transformation_insights").insert({
      ...insight,
      user_id: userId,
    });

    this.broadcastUpdate(userId, userState.holoflower.getState());
    await this.saveUserState(userId);
  }

  private async detectBreakthroughs(
    userId: string,
    previousState: HoloflowerState,
    newState: HoloflowerState,
  ) {
    const userState = await this.getUserState(userId);

    // Check for consciousness level breakthroughs
    for (const [level, newValue] of newState.consciousnessDistribution) {
      const previousValue =
        previousState.consciousnessDistribution.get(level) || 0;

      if (newValue > 0.7 && previousValue <= 0.7) {
        const insight: TransformationInsight = {
          id: `${userId}-breakthrough-${Date.now()}`,
          timestamp: new Date(),
          type: "breakthrough",
          houseNumber: 0,
          insight: `Breakthrough in ${level} consciousness - achieving mastery level`,
          metadata: {
            level,
            value: newValue,
            previousValue,
          },
        };

        userState.insightHistory.push(insight);
        await this.saveInsight(userId, insight);
      }
    }

    // Check for alchemical process mastery
    for (const [process, newValue] of newState.alchemicalBalance) {
      const previousValue = previousState.alchemicalBalance.get(process) || 0;

      if (newValue > 0.8 && previousValue <= 0.8) {
        const insight: TransformationInsight = {
          id: `${userId}-alchemy-${Date.now()}`,
          timestamp: new Date(),
          type: "alchemical_process",
          houseNumber: 0,
          insight: `Alchemical mastery achieved in ${process} - transformation power unlocked`,
          metadata: {
            process,
            value: newValue,
            previousValue,
          },
        };

        userState.insightHistory.push(insight);
        await this.saveInsight(userId, insight);
      }
    }
  }

  private async generateTransformationInsight(
    userId: string,
    fromHouse: number,
    toHouse: number,
    baseInsight: string,
  ) {
    const userState = await this.getUserState(userId);
    const state = userState.holoflower.getState();

    const fromHouseData = state.houses.find((h) => h.number === fromHouse)!;
    const toHouseData = state.houses.find((h) => h.number === toHouse)!;

    const insight: TransformationInsight = {
      id: `${userId}-transform-${Date.now()}`,
      timestamp: new Date(),
      type: "alchemical_process",
      houseNumber: toHouse,
      insight: baseInsight,
      metadata: {
        fromHouse: {
          number: fromHouse,
          element: fromHouseData.element,
          consciousness: fromHouseData.consciousnessLevel,
          intensity: fromHouseData.currentIntensity,
        },
        toHouse: {
          number: toHouse,
          element: toHouseData.element,
          consciousness: toHouseData.consciousnessLevel,
          intensity: toHouseData.currentIntensity,
        },
      },
    };

    userState.insightHistory.push(insight);
    await this.saveInsight(userId, insight);
  }

  private async saveInsight(userId: string, insight: TransformationInsight) {
    await supabase.from("transformation_insights").insert({
      ...insight,
      user_id: userId,
    });
  }

  private async saveUserState(userId: string) {
    const userState = await this.getUserState(userId);
    const state = userState.holoflower.getState();

    await supabase.from("elemental_alchemy_states").upsert({
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    });
  }

  private broadcastUpdate(userId: string, state: HoloflowerState) {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type: "state-update",
      userId,
      state,
      timestamp: new Date(),
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private determineAlchemicalProcess(
    fromHouse: number,
    toHouse: number,
  ): string {
    // Logic to determine the dominant alchemical process
    const state = new ElementalAlchemyHoloflower().getState();
    const toHouseData = state.houses.find((h) => h.number === toHouse);
    return toHouseData?.alchemicalProcess || "unknown";
  }

  private analyzeConsciousnessShift(
    fromHouse: number,
    toHouse: number,
  ): string {
    const state = new ElementalAlchemyHoloflower().getState();
    const fromHouseData = state.houses.find((h) => h.number === fromHouse);
    const toHouseData = state.houses.find((h) => h.number === toHouse);

    if (!fromHouseData || !toHouseData) return "unknown";

    return `${fromHouseData.consciousnessLevel} → ${toHouseData.consciousnessLevel}`;
  }

  private analyzeElementalShift(fromHouse: number, toHouse: number): string {
    const state = new ElementalAlchemyHoloflower().getState();
    const fromHouseData = state.houses.find((h) => h.number === fromHouse);
    const toHouseData = state.houses.find((h) => h.number === toHouse);

    if (!fromHouseData || !toHouseData) return "unknown";

    return `${fromHouseData.element} → ${toHouseData.element}`;
  }

  public async generatePersonalInsights(userId: string) {
    const userState = await this.getUserState(userId);
    const state = userState.holoflower.getState();
    const visualData = userState.holoflower.exportVisualizationData();

    const insights = [];

    // Analyze dominant element
    const dominantQuadrant = state.quadrants.reduce((prev, current) =>
      prev.resonance > current.resonance ? prev : current,
    );

    insights.push({
      type: "elemental_dominance",
      message: `Your ${dominantQuadrant.element} element is currently dominant with ${Math.round(dominantQuadrant.resonance * 100)}% activation`,
      recommendations: this.getElementalRecommendations(
        dominantQuadrant.element,
      ),
    });

    // Analyze consciousness distribution
    const highestConsciousness = Array.from(
      state.consciousnessDistribution.entries(),
    ).reduce((prev, current) => (prev[1] > current[1] ? prev : current));

    insights.push({
      type: "consciousness_focus",
      message: `You're operating primarily from ${highestConsciousness[0]} consciousness`,
      recommendations: this.getConsciousnessRecommendations(
        highestConsciousness[0],
      ),
    });

    // Find shadow work opportunities
    const shadowHouses = state.houses
      .filter((h) => h.currentIntensity < 0.3)
      .sort((a, b) => a.currentIntensity - b.currentIntensity)
      .slice(0, 3);

    if (shadowHouses.length > 0) {
      insights.push({
        type: "shadow_work",
        message: "Shadow work opportunities detected",
        houses: shadowHouses.map((h) => ({
          number: h.number,
          description: h.shadowAspect,
          gift: h.giftAspect,
        })),
      });
    }

    // Broadcast insights
    if (this.wsServer) {
      const message = JSON.stringify({
        type: "personal-insights",
        userId,
        insights,
        timestamp: new Date(),
      });

      this.wsServer.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }

    return insights;
  }

  private getElementalRecommendations(element: string): string[] {
    const recommendations: Record<string, string[]> = {
      fire: [
        "Channel your passion into creative projects",
        "Practice patience and sustained focus",
        "Balance action with reflection",
      ],
      earth: [
        "Ground your visions into practical steps",
        "Cultivate flexibility alongside stability",
        "Honor your body and physical needs",
      ],
      air: [
        "Transform ideas into tangible outcomes",
        "Deepen connections through presence",
        "Balance mental activity with embodiment",
      ],
      water: [
        "Flow with emotional currents without drowning",
        "Set healthy boundaries while remaining open",
        "Trust intuitive wisdom alongside logic",
      ],
    };

    return recommendations[element] || [];
  }

  private getConsciousnessRecommendations(level: string): string[] {
    const recommendations: Record<string, string[]> = {
      "meta-conscious": [
        "Integrate transcendent insights into daily life",
        "Share wisdom through practical teaching",
        "Stay grounded while exploring higher realms",
      ],
      conscious: [
        "Deepen self-awareness through reflection",
        "Expand perception beyond personal concerns",
        "Practice presence in each moment",
      ],
      subconscious: [
        "Explore dreams and symbolic messages",
        "Work with patterns and habits consciously",
        "Trust the wisdom of your deeper self",
      ],
      unconscious: [
        "Illuminate shadow aspects with compassion",
        "Integrate rejected parts of self",
        "Transform fear into power",
      ],
    };

    return recommendations[level] || [];
  }

  public async analyzeGroupAlchemy(groupId: string) {
    const participants = await this.getGroupParticipants(groupId);
    const collectiveState = await this.calculateCollectiveState(participants);

    const alchemicalResonance = new Map<string, number>();
    const consciousnessField = new Map<string, number>();

    // Calculate group resonances
    for (const [process, value] of collectiveState.alchemicalBalance) {
      alchemicalResonance.set(process, value);
    }

    for (const [level, value] of collectiveState.consciousnessDistribution) {
      consciousnessField.set(level, value);
    }

    // Identify emergent wisdom
    const emergentWisdom = this.identifyEmergentWisdom(collectiveState);

    const groupPattern: GroupAlchemyPattern = {
      groupId,
      participants,
      collectiveState,
      alchemicalResonance,
      consciousnessField,
      emergentWisdom,
    };

    this.groupPatterns.set(groupId, groupPattern);

    // Broadcast group pattern
    if (this.wsServer) {
      const message = JSON.stringify({
        type: "group-alchemy-pattern",
        groupId,
        pattern: groupPattern,
        timestamp: new Date(),
      });

      this.wsServer.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }

    return groupPattern;
  }

  private async getGroupParticipants(groupId: string): Promise<string[]> {
    const { data } = await supabase
      .from("group_participants")
      .select("user_id")
      .eq("group_id", groupId);

    return data?.map((p) => p.user_id) || [];
  }

  private async calculateCollectiveState(
    participants: string[],
  ): Promise<HoloflowerState> {
    const collectiveHoloflower = new ElementalAlchemyHoloflower();
    const houseIntensities = new Map<number, number[]>();

    // Aggregate all participant states
    for (const userId of participants) {
      const userState = await this.getUserState(userId);
      const state = userState.holoflower.getState();

      state.houses.forEach((house) => {
        if (!houseIntensities.has(house.number)) {
          houseIntensities.set(house.number, []);
        }
        houseIntensities.get(house.number)!.push(house.currentIntensity);
      });
    }

    // Average intensities
    for (const [houseNumber, intensities] of houseIntensities) {
      const average =
        intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
      collectiveHoloflower.updateHouseIntensity(houseNumber, average);
    }

    return collectiveHoloflower.getState();
  }

  private identifyEmergentWisdom(state: HoloflowerState): string[] {
    const wisdom = [];

    if (state.overallBalance > 0.85) {
      wisdom.push("Collective Harmony Achieved - Group is in sacred balance");
    }

    if (state.centerSpiral.integration > 0.8) {
      wisdom.push("Unified Field Activated - Phi spiral integration strong");
    }

    // Check for balanced consciousness
    const consciousnessValues = Array.from(
      state.consciousnessDistribution.values(),
    );
    const consciousnessVariance = this.calculateVariance(consciousnessValues);

    if (consciousnessVariance < 0.1) {
      wisdom.push(
        "All Consciousness Levels Integrated - Full spectrum awareness",
      );
    }

    // Check for alchemical mastery
    const alchemicalValues = Array.from(state.alchemicalBalance.values());
    const alchemicalMin = Math.min(...alchemicalValues);

    if (alchemicalMin > 0.6) {
      wisdom.push(
        "All Alchemical Processes Active - Complete transformation potential",
      );
    }

    return wisdom;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private startSacredTimingUpdates() {
    // Update based on sacred timing (lunar phases, seasonal shifts)
    this.sacredTimingInterval = setInterval(async () => {
      const lunarPhase = this.calculateLunarPhase();
      const seasonalEnergy = this.calculateSeasonalEnergy();

      // Apply sacred timing influences to all active users
      for (const [userId, userState] of this.userStates) {
        // Apply subtle influences based on timing
        this.applySacredTimingInfluence(userState, lunarPhase, seasonalEnergy);
        this.broadcastUpdate(userId, userState.holoflower.getState());
      }
    }, 3600000); // Every hour
  }

  private calculateLunarPhase(): number {
    const synodicMonth = 29.53059;
    const knownNewMoon = new Date("2024-01-11");
    const now = new Date();

    const daysSince =
      (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = (daysSince % synodicMonth) / synodicMonth;

    return phase;
  }

  private calculateSeasonalEnergy(): string {
    const now = new Date();
    const month = now.getMonth();

    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  }

  private applySacredTimingInfluence(
    userState: UserAlchemyState,
    lunarPhase: number,
    season: string,
  ) {
    // Water houses respond to lunar phases
    const waterHouses = [10, 11, 12];
    const lunarInfluence = Math.sin(lunarPhase * 2 * Math.PI) * 0.1;

    waterHouses.forEach((houseNumber) => {
      const currentIntensity =
        userState.holoflower
          .getState()
          .houses.find((h) => h.number === houseNumber)?.currentIntensity ||
        0.5;

      userState.holoflower.updateHouseIntensity(
        houseNumber,
        currentIntensity + lunarInfluence,
      );
    });

    // Seasonal influences
    const seasonalInfluences: Record<string, number[]> = {
      spring: [1, 2, 3], // Fire houses - new beginnings
      summer: [4, 5, 6], // Earth houses - manifestation
      autumn: [7, 8, 9], // Air houses - balance and reflection
      winter: [10, 11, 12], // Water houses - introspection
    };

    const activeHouses = seasonalInfluences[season] || [];
    activeHouses.forEach((houseNumber) => {
      const currentIntensity =
        userState.holoflower
          .getState()
          .houses.find((h) => h.number === houseNumber)?.currentIntensity ||
        0.5;

      userState.holoflower.updateHouseIntensity(
        houseNumber,
        Math.min(1, currentIntensity * 1.05),
      );
    });
  }

  public cleanup() {
    if (this.sacredTimingInterval) {
      clearInterval(this.sacredTimingInterval);
    }

    if (this.wsServer) {
      this.wsServer.close();
    }
  }
}

export const elementalAlchemyService = new ElementalAlchemyService();

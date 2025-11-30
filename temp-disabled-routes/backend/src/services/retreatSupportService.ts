// Retreat Support Service - Real-time participant management
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabaseClient";
import { logger } from "../utils/logger";
import { soullabFounderAgent } from "../core/agents/soullabFounderAgent";
import { PersonalOracleAgent } from "../core/agents/adjusterAgent";

interface DailyCheckIn {
  participantId: string;
  retreatId: string;
  dayNumber: number;
  morningState: {
    energyLevel: number;
    emotionalTone: string;
    bodyAwareness: number;
    sleepQuality: number;
    dreams?: string;
    intentions: string;
  };
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  shadowWork?: {
    patternsNoticed?: string[];
    triggersExperienced?: string[];
    breakthroughMoments?: string;
    resistanceAreas?: string[];
  };
  oracleInsights?: string;
  gratitudes: string[];
  supportNeeded?: string;
}

interface LiveSession {
  id: string;
  retreatId: string;
  sessionType: string;
  facilitatorId: string;
  intention: string;
  startTime: Date;
  endTime?: Date;
  participantCount: number;
  energyField: any;
  wisdomCaptured: any[];
}

interface CollectiveWisdom {
  id: string;
  retreatId: string;
  sessionId?: string;
  type: "insight" | "revelation" | "pattern" | "teaching" | "vision";
  content: {
    essence: string;
    elaboration?: string;
    contributors: string[];
    element: string;
    tags: string[];
  };
  resonance: {
    immediateImpact: number;
    depthLevel: number;
    shareability: boolean;
  };
  timestamp: Date;
}

export class RetreatSupportService {
  // Record daily check-in
  async recordDailyCheckIn(checkIn: DailyCheckIn): Promise<any> {
    try {
      const checkInId = uuidv4();

      // Store check-in data
      const { data, error } = await supabase.from("daily_checkins").insert({
        id: checkInId,
        participant_id: checkIn.participantId,
        retreat_id: checkIn.retreatId,
        day_number: checkIn.dayNumber,
        morning_state: checkIn.morningState,
        elemental_balance: checkIn.elementalBalance,
        shadow_work: checkIn.shadowWork,
        oracle_insights: checkIn.oracleInsights,
        gratitudes: checkIn.gratitudes,
        support_needed: checkIn.supportNeeded,
        created_at: new Date(),
      });

      if (error) throw error;

      // Update participant's current state
      await this.updateParticipantCurrentState(checkIn.participantId, checkIn);

      // Check if support is needed
      if (checkIn.supportNeeded) {
        await this.flagSupportNeeded(
          checkIn.participantId,
          checkIn.supportNeeded,
        );
      }

      logger.info("Daily check-in recorded", {
        participantId: checkIn.participantId,
        day: checkIn.dayNumber,
      });

      return { id: checkInId, ...checkIn };
    } catch (error) {
      logger.error("Failed to record daily check-in", error);
      throw error;
    }
  }

  // Generate personalized daily guidance
  async generateDailyGuidance(
    participantId: string,
    checkIn: DailyCheckIn,
  ): Promise<any> {
    try {
      // Get participant info
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      if (!participant) throw new Error("Participant not found");

      // Get guidance from Personal Oracle
      const oracleGuidance = await this.getOracleGuidance(participant, checkIn);

      // Get elemental practice for the day
      const elementalPractice = this.getElementalPractice(
        participant.oracleElement,
        checkIn.dayNumber,
      );

      // Shadow work suggestion based on check-in
      const shadowWork = this.getShadowWorkSuggestion(checkIn);

      // Integration practices
      const integrationPractices = this.getIntegrationPractices(checkIn);

      return {
        oracleMessage: oracleGuidance,
        todaysFocus: this.getDailyFocus(checkIn.dayNumber),
        elementalPractice,
        shadowWork,
        integrationPractices,
        groupActivity: await this.getTodaysGroupActivity(
          checkIn.retreatId,
          checkIn.dayNumber,
        ),
        reminderForEvening: "Remember to journal your experiences before sleep",
      };
    } catch (error) {
      logger.error("Failed to generate daily guidance", error);
      throw error;
    }
  }

  // Get Oracle guidance based on check-in
  private async getOracleGuidance(
    participant: any,
    checkIn: DailyCheckIn,
  ): Promise<string> {
    // In production, this would call the PersonalOracleAgent
    const guidance = `Dear ${participant.preferredName || participant.firstName},

Your ${participant.oracleElement} essence is ${this.interpretEnergyLevel(checkIn.morningState.energyLevel)} today.

Based on your check-in, I sense ${checkIn.morningState.emotionalTone} flowing through you.
${checkIn.shadowWork?.breakthroughMoments ? `Beautiful breakthrough: ${checkIn.shadowWork.breakthroughMoments}` : ""}

Today's medicine: ${this.getElementalMedicine(participant.oracleElement, checkIn)}

Trust your journey today.
~ Your ${participant.oracleArchetype}`;

    return guidance;
  }

  private interpretEnergyLevel(level: number): string {
    if (level >= 8) return "vibrant and ready to shine";
    if (level >= 6) return "steady and present";
    if (level >= 4) return "seeking balance";
    return "calling for gentle restoration";
  }

  private getElementalMedicine(element: string, checkIn: DailyCheckIn): string {
    const medicines: any = {
      fire: "Channel your passion into creative expression",
      water: "Flow with your emotions, let them teach you",
      earth: "Ground deeply, feel your solid foundation",
      air: "Breathe clarity into any confusion",
      aether: "Integrate all aspects, embrace the wholeness",
    };
    return medicines[element] || "Trust your inner knowing";
  }

  // Start live session
  async startLiveSession(sessionData: any): Promise<LiveSession> {
    try {
      const session: LiveSession = {
        id: uuidv4(),
        retreatId: sessionData.retreatId,
        sessionType: sessionData.sessionType,
        facilitatorId: sessionData.facilitatorId,
        intention: sessionData.intention,
        startTime: sessionData.startTime,
        participantCount: 0,
        energyField: {
          coherence: 0,
          intensity: 0,
          elements: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
        },
        wisdomCaptured: [],
      };

      // Store session
      await supabase.from("live_sessions").insert(session);

      // Initialize tracking
      await this.initializeSessionTracking(session.id);

      logger.info("Live session started", {
        sessionId: session.id,
        type: session.sessionType,
      });

      return session;
    } catch (error) {
      logger.error("Failed to start live session", error);
      throw error;
    }
  }

  // Initialize session tracking
  async initializeSessionTracking(sessionId: string): Promise<void> {
    // In production, this would set up real-time tracking
    await supabase.from("session_tracking").insert({
      session_id: sessionId,
      tracking_data: {
        participantStates: {},
        energyReadings: [],
        wisdomNuggets: [],
        breakthroughs: [],
      },
      created_at: new Date(),
    });
  }

  // Record participation
  async recordParticipation(participation: any): Promise<any> {
    try {
      const participationId = uuidv4();

      await supabase.from("session_participations").insert({
        id: participationId,
        session_id: participation.sessionId,
        participant_id: participation.participantId,
        engagement: participation.engagement,
        group_resonance: participation.groupResonance,
        timestamp: new Date(),
      });

      // Update session participant count
      await this.updateSessionParticipantCount(participation.sessionId);

      return { id: participationId, ...participation };
    } catch (error) {
      logger.error("Failed to record participation", error);
      throw error;
    }
  }

  // End live session
  async endLiveSession(sessionId: string, closingData: any): Promise<any> {
    try {
      // Get session data
      const { data: session } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!session) throw new Error("Session not found");

      // Calculate session summary
      const summary = await this.generateSessionSummary(sessionId);

      // Update session
      await supabase
        .from("live_sessions")
        .update({
          end_time: new Date(),
          closing_insights: closingData.closingInsights,
          next_steps: closingData.nextSteps,
          summary: summary,
        })
        .eq("id", sessionId);

      // Generate facilitator report
      const report = await this.generateFacilitatorReport(sessionId);

      return {
        summary,
        report,
        wisdomCaptured: session.wisdomCaptured?.length || 0,
        participantCount: session.participantCount,
      };
    } catch (error) {
      logger.error("Failed to end live session", error);
      throw error;
    }
  }

  // Capture collective wisdom
  async captureCollectiveWisdom(wisdomData: any): Promise<CollectiveWisdom> {
    try {
      const wisdom: CollectiveWisdom = {
        id: uuidv4(),
        retreatId: wisdomData.retreatId,
        sessionId: wisdomData.sessionId,
        type: wisdomData.type,
        content: wisdomData.content,
        resonance: wisdomData.resonance,
        timestamp: new Date(),
      };

      // Store wisdom
      await supabase.from("collective_wisdom").insert(wisdom);

      // Update wisdom index
      await this.updateWisdomIndex(wisdom);

      logger.info("Collective wisdom captured", {
        wisdomId: wisdom.id,
        type: wisdom.type,
      });

      return wisdom;
    } catch (error) {
      logger.error("Failed to capture collective wisdom", error);
      throw error;
    }
  }

  // Broadcast wisdom to participants
  async broadcastWisdom(
    retreatId: string,
    wisdom: CollectiveWisdom,
  ): Promise<void> {
    try {
      // Get all participants
      const { data: participants } = await supabase
        .from("retreat_participants")
        .select("id, email, preferredName")
        .eq("retreat_id", retreatId);

      if (!participants) return;

      // Create notifications for each participant
      const notifications = participants.map((p) => ({
        participant_id: p.id,
        type: "wisdom_shared",
        content: {
          wisdomType: wisdom.type,
          essence: wisdom.content.essence,
          element: wisdom.content.element,
        },
        created_at: new Date(),
      }));

      await supabase.from("participant_notifications").insert(notifications);

      // In production, this would also send real-time notifications
    } catch (error) {
      logger.error("Failed to broadcast wisdom", error);
    }
  }

  // Get collective wisdom
  async getCollectiveWisdom(retreatId: string, filters: any): Promise<any[]> {
    try {
      let query = supabase
        .from("collective_wisdom")
        .select("*")
        .eq("retreat_id", retreatId)
        .order("timestamp", { ascending: false });

      if (filters.element) {
        query = query.eq("content->element", filters.element);
      }

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      logger.error("Failed to get collective wisdom", error);
      throw error;
    }
  }

  // Get wisdom by element
  async getWisdomByElement(retreatId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from("collective_wisdom")
        .select("content")
        .eq("retreat_id", retreatId);

      const elementCounts: any = {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0,
        all: 0,
      };

      data?.forEach((item) => {
        const element = item.content?.element || "all";
        elementCounts[element]++;
      });

      return elementCounts;
    } catch (error) {
      logger.error("Failed to get wisdom by element", error);
      throw error;
    }
  }

  // Get participant insights
  async getParticipantInsights(
    participantId: string,
    retreatId: string,
  ): Promise<any> {
    try {
      // Get participant data
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      // Get check-ins
      const { data: checkIns } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("participant_id", participantId)
        .eq("retreat_id", retreatId)
        .order("day_number", { ascending: true });

      // Get participations
      const { data: participations } = await supabase
        .from("session_participations")
        .select("*")
        .eq("participant_id", participantId);

      // Analyze patterns
      const patterns = this.analyzeParticipantPatterns(checkIns || []);
      const growth = this.trackGrowthArc(checkIns || []);
      const elementalEvolution = this.trackElementalEvolution(checkIns || []);

      // Get Oracle recommendations
      const oracleGuidance = await this.getPersonalizedRecommendations(
        participant,
        patterns,
        growth,
      );

      return {
        participant: {
          name: participant?.preferredName || participant?.firstName,
          element: participant?.oracleElement,
          archetype: participant?.oracleArchetype,
        },
        journey: {
          checkInsCompleted: checkIns?.length || 0,
          sessionsAttended: participations?.length || 0,
          breakthroughsRecorded: this.countBreakthroughs(checkIns || []),
        },
        patterns,
        growth,
        elementalEvolution,
        recommendations: this.generateRecommendations(patterns, growth),
        oracleGuidance,
      };
    } catch (error) {
      logger.error("Failed to get participant insights", error);
      throw error;
    }
  }

  // Get facilitator dashboard
  async getFacilitatorDashboard(retreatId: string): Promise<any> {
    try {
      // Get all participants
      const { data: participants } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("retreat_id", retreatId);

      // Get today's check-ins
      const { data: todayCheckIns } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("retreat_id", retreatId)
        .gte(
          "created_at",
          new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        );

      // Get active support requests
      const { data: supportRequests } = await supabase
        .from("support_requests")
        .select("*")
        .eq("retreat_id", retreatId)
        .eq("status", "open");

      // Calculate group metrics
      const groupMetrics = this.calculateGroupMetrics(todayCheckIns || []);
      const elementalBalance = this.calculateElementalBalance(
        participants || [],
      );
      const supportNeeded = this.identifySupportNeeds(todayCheckIns || []);

      // Generate alerts
      const alerts = this.generateFacilitatorAlerts(
        groupMetrics,
        supportRequests || [],
        todayCheckIns || [],
      );

      return {
        overview: {
          totalParticipants: participants?.length || 0,
          checkInsToday: todayCheckIns?.length || 0,
          activeSupport: supportRequests?.length || 0,
        },
        groupMetrics,
        elementalBalance,
        supportNeeded,
        alerts,
        recommendations: this.generateFacilitatorRecommendations(groupMetrics),
        upcomingSessions: await this.getUpcomingSessions(retreatId),
      };
    } catch (error) {
      logger.error("Failed to get facilitator dashboard", error);
      throw error;
    }
  }

  // Request urgent support
  async requestUrgentSupport(supportData: any): Promise<any> {
    try {
      const supportId = uuidv4();

      const support = {
        id: supportId,
        participant_id: supportData.participantId,
        retreat_id: supportData.retreatId,
        issue: supportData.issue,
        urgency_level: supportData.urgencyLevel,
        status: "open",
        created_at: supportData.timestamp,
      };

      await supabase.from("support_requests").insert(support);

      return support;
    } catch (error) {
      logger.error("Failed to request urgent support", error);
      throw error;
    }
  }

  // Alert facilitators
  async alertFacilitators(retreatId: string, support: any): Promise<void> {
    try {
      // Get facilitators
      const { data: facilitators } = await supabase
        .from("retreat_facilitators")
        .select("*")
        .eq("retreat_id", retreatId);

      // Create alerts
      const alerts =
        facilitators?.map((f) => ({
          facilitator_id: f.id,
          type: "urgent_support",
          content: support,
          created_at: new Date(),
        })) || [];

      await supabase.from("facilitator_alerts").insert(alerts);

      // In production, send real-time notifications
    } catch (error) {
      logger.error("Failed to alert facilitators", error);
    }
  }

  // Track integration
  async trackIntegration(integrationData: any): Promise<any> {
    try {
      const integrationId = uuidv4();

      const integration = {
        id: integrationId,
        participant_id: integrationData.participantId,
        retreat_id: integrationData.retreatId,
        insights: integrationData.insights,
        commitments: integrationData.commitments,
        practices_adopted: integrationData.practicesAdopted,
        recorded_at: integrationData.recordedAt,
        follow_up_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      await supabase.from("integration_tracking").insert(integration);

      // Schedule follow-up
      await this.scheduleFollowUp(integration);

      return {
        ...integration,
        followUpDate: integration.follow_up_date,
      };
    } catch (error) {
      logger.error("Failed to track integration", error);
      throw error;
    }
  }

  // Helper methods
  private async updateParticipantCurrentState(
    participantId: string,
    checkIn: DailyCheckIn,
  ): Promise<void> {
    await supabase
      .from("retreat_participants")
      .update({
        current_state: {
          energyLevel: checkIn.morningState.energyLevel,
          emotionalTone: checkIn.morningState.emotionalTone,
          lastCheckIn: new Date(),
          dayNumber: checkIn.dayNumber,
        },
      })
      .eq("id", participantId);
  }

  private async flagSupportNeeded(
    participantId: string,
    supportNeeded: string,
  ): Promise<void> {
    await supabase.from("support_flags").insert({
      participant_id: participantId,
      support_needed: supportNeeded,
      flagged_at: new Date(),
      status: "pending",
    });
  }

  private getElementalPractice(element: string, dayNumber: number): string {
    const practices: any = {
      fire: [
        "Morning sun salutation with intention setting",
        "Creative expression through movement",
        "Passion project activation",
      ],
      water: [
        "Emotional flow meditation by water",
        "Heart coherence breathing",
        "Compassion practice for self and others",
      ],
      earth: [
        "Grounding barefoot on earth",
        "Body scan and root activation",
        "Manifestation ritual with crystals",
      ],
      air: [
        "Breathwork for mental clarity",
        "Sky gazing meditation",
        "Communication practice with the wind",
      ],
      aether: [
        "Unity consciousness meditation",
        "Elemental integration practice",
        "Sacred geometry visualization",
      ],
    };

    const elementPractices = practices[element] || practices.aether;
    return elementPractices[(dayNumber - 1) % elementPractices.length];
  }

  private getDailyFocus(dayNumber: number): string {
    const focuses = [
      "Opening to the sacred container",
      "Elemental assessment and embodiment",
      "Shadow work and transformation",
      "Vision quest and future self",
      "Integration and embodiment",
      "Community weaving and connection",
      "Sacred closing and commitment",
    ];
    return focuses[(dayNumber - 1) % focuses.length];
  }

  private getShadowWorkSuggestion(checkIn: DailyCheckIn): string {
    if (checkIn.shadowWork?.resistanceAreas?.length) {
      return `Notice where ${checkIn.shadowWork.resistanceAreas[0]} shows up today. What is it protecting?`;
    }
    return "Observe what triggers you today. There lies your teacher.";
  }

  private getIntegrationPractices(checkIn: DailyCheckIn): string[] {
    const practices = ["Journaling before bed"];

    if (checkIn.morningState.energyLevel < 5) {
      practices.push("Restorative yoga or gentle movement");
    }

    if (checkIn.shadowWork?.breakthroughMoments) {
      practices.push("Celebrate your breakthrough with creative expression");
    }

    practices.push("Share one insight with a retreat buddy");

    return practices;
  }

  private async getTodaysGroupActivity(
    retreatId: string,
    dayNumber: number,
  ): Promise<string> {
    // In production, this would fetch from the retreat schedule
    const activities = [
      "Opening Circle - Setting Sacred Space",
      "Elemental Journey - Discovering Your Nature",
      "Shadow Dancing - Embracing the Dark",
      "Vision Quest - Meeting Your Future Self",
      "Integration Circle - Weaving the Threads",
      "Community Celebration - Sharing Our Medicine",
      "Closing Ceremony - Sealing the Container",
    ];
    return activities[(dayNumber - 1) % activities.length];
  }

  private async updateSessionParticipantCount(
    sessionId: string,
  ): Promise<void> {
    const { count } = await supabase
      .from("session_participations")
      .select("*", { count: "exact" })
      .eq("session_id", sessionId);

    await supabase
      .from("live_sessions")
      .update({ participant_count: count || 0 })
      .eq("id", sessionId);
  }

  private async generateSessionSummary(sessionId: string): Promise<any> {
    const { data: participations } = await supabase
      .from("session_participations")
      .select("*")
      .eq("session_id", sessionId);

    const { data: wisdom } = await supabase
      .from("collective_wisdom")
      .select("*")
      .eq("session_id", sessionId);

    return {
      participantCount: participations?.length || 0,
      averageEngagement: this.calculateAverageEngagement(participations || []),
      wisdomCaptured: wisdom?.length || 0,
      breakthroughs: this.extractBreakthroughs(participations || []),
      groupCoherence: this.calculateGroupCoherence(participations || []),
    };
  }

  private async generateFacilitatorReport(sessionId: string): Promise<any> {
    const summary = await this.generateSessionSummary(sessionId);

    return {
      summary,
      recommendations: [
        "Follow up with participants who had breakthroughs",
        "Integrate captured wisdom into tomorrow's session",
        "Address any unresolved tensions noticed",
      ],
      highlights: this.extractSessionHighlights(summary),
    };
  }

  private async updateWisdomIndex(wisdom: CollectiveWisdom): Promise<void> {
    // In production, this would update a searchable wisdom index
    logger.info("Wisdom indexed", { wisdomId: wisdom.id });
  }

  private analyzeParticipantPatterns(checkIns: any[]): any {
    if (checkIns.length === 0) return {};

    const patterns = {
      energyTrend: this.calculateTrend(
        checkIns.map((c) => c.morning_state?.energyLevel || 5),
      ),
      emotionalThemes: this.extractEmotionalThemes(checkIns),
      shadowPatterns: this.extractShadowPatterns(checkIns),
      consistentGratitudes: this.findConsistentGratitudes(checkIns),
    };

    return patterns;
  }

  private trackGrowthArc(checkIns: any[]): any {
    return {
      startPoint: checkIns[0]?.morning_state || {},
      currentPoint: checkIns[checkIns.length - 1]?.morning_state || {},
      trajectory: this.calculateGrowthTrajectory(checkIns),
      breakthroughs: checkIns.filter((c) => c.shadow_work?.breakthroughMoments)
        .length,
    };
  }

  private trackElementalEvolution(checkIns: any[]): any {
    const evolution: any = {};

    ["fire", "water", "earth", "air", "aether"].forEach((element) => {
      evolution[element] = {
        start: checkIns[0]?.elemental_balance?.[element] || 5,
        current:
          checkIns[checkIns.length - 1]?.elemental_balance?.[element] || 5,
        trend: this.calculateTrend(
          checkIns.map((c) => c.elemental_balance?.[element] || 5),
        ),
      };
    });

    return evolution;
  }

  private async getPersonalizedRecommendations(
    participant: any,
    patterns: any,
    growth: any,
  ): Promise<string> {
    // In production, this would use the PersonalOracleAgent
    return `Based on your journey, ${participant?.preferredName}, I recommend focusing on ${patterns.shadowPatterns?.[0] || "deeper self-inquiry"} while celebrating your growth in ${growth.trajectory || "presence"}.`;
  }

  private countBreakthroughs(checkIns: any[]): number {
    return checkIns.filter((c) => c.shadow_work?.breakthroughMoments).length;
  }

  private generateRecommendations(patterns: any, growth: any): string[] {
    const recommendations = [];

    if (patterns.energyTrend === "declining") {
      recommendations.push("Schedule extra rest and restoration");
    }

    if (growth.breakthroughs > 2) {
      recommendations.push("Journal extensively about your breakthroughs");
    }

    recommendations.push("Continue your elemental practices daily");

    return recommendations;
  }

  private calculateGroupMetrics(checkIns: any[]): any {
    if (checkIns.length === 0) return {};

    return {
      averageEnergy: this.average(
        checkIns.map((c) => c.morning_state?.energyLevel || 5),
      ),
      emotionalTone: this.getMostCommonEmotion(checkIns),
      groupCoherence: this.calculateCoherence(checkIns),
      supportNeeds: checkIns.filter((c) => c.support_needed).length,
    };
  }

  private calculateElementalBalance(participants: any[]): any {
    const elementCounts: any = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
    };

    participants.forEach((p) => {
      const element = p.oracleElement || "aether";
      elementCounts[element]++;
    });

    return {
      distribution: elementCounts,
      dominant: Object.entries(elementCounts).sort(
        ([, a], [, b]) => (b as number) - (a as number),
      )[0][0],
      missing: Object.entries(elementCounts)
        .filter(([, count]) => count === 0)
        .map(([element]) => element),
    };
  }

  private identifySupportNeeds(checkIns: any[]): any[] {
    return checkIns
      .filter((c) => c.support_needed || c.morning_state?.energyLevel < 4)
      .map((c) => ({
        participantId: c.participant_id,
        need: c.support_needed || "Low energy - check in recommended",
        urgency: c.morning_state?.energyLevel < 3 ? "high" : "medium",
      }));
  }

  private generateFacilitatorAlerts(
    groupMetrics: any,
    supportRequests: any[],
    checkIns: any[],
  ): any[] {
    const alerts = [];

    if (groupMetrics.averageEnergy < 5) {
      alerts.push({
        type: "low_group_energy",
        message: "Group energy is low. Consider energizing practice.",
        severity: "medium",
      });
    }

    if (supportRequests.length > 3) {
      alerts.push({
        type: "multiple_support_needs",
        message: `${supportRequests.length} participants need support`,
        severity: "high",
      });
    }

    if (checkIns.length < groupMetrics.totalParticipants * 0.7) {
      alerts.push({
        type: "low_checkin_rate",
        message: "Less than 70% have checked in today",
        severity: "low",
      });
    }

    return alerts;
  }

  private generateFacilitatorRecommendations(groupMetrics: any): string[] {
    const recommendations = [];

    if (groupMetrics.averageEnergy < 6) {
      recommendations.push("Start with energizing breathwork or movement");
    }

    if (groupMetrics.supportNeeds > 2) {
      recommendations.push(
        "Schedule individual check-ins with those needing support",
      );
    }

    recommendations.push("Celebrate the group's journey so far");

    return recommendations;
  }

  private async getUpcomingSessions(retreatId: string): Promise<any[]> {
    const { data } = await supabase
      .from("retreat_sessions")
      .select("*")
      .eq("retreat_id", retreatId)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(3);

    return data || [];
  }

  private async scheduleFollowUp(integration: any): Promise<void> {
    // In production, this would schedule actual follow-up communications
    logger.info("Follow-up scheduled", {
      participantId: integration.participant_id,
      date: integration.follow_up_date,
    });
  }

  // Utility methods
  private calculateTrend(values: number[]): string {
    if (values.length < 2) return "stable";
    const start = this.average(values.slice(0, 2));
    const end = this.average(values.slice(-2));
    if (end > start + 1) return "rising";
    if (end < start - 1) return "declining";
    return "stable";
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private extractEmotionalThemes(checkIns: any[]): string[] {
    const emotions = checkIns
      .map((c) => c.morning_state?.emotionalTone)
      .filter(Boolean);
    const counts: any = {};
    emotions.forEach((e) => (counts[e] = (counts[e] || 0) + 1));
    return Object.entries(counts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }

  private extractShadowPatterns(checkIns: any[]): string[] {
    const patterns = new Set<string>();
    checkIns.forEach((c) => {
      c.shadow_work?.patternsNoticed?.forEach((p: string) => patterns.add(p));
    });
    return Array.from(patterns);
  }

  private findConsistentGratitudes(checkIns: any[]): string[] {
    const gratitudeCounts: any = {};
    checkIns.forEach((c) => {
      c.gratitudes?.forEach((g: string) => {
        gratitudeCounts[g] = (gratitudeCounts[g] || 0) + 1;
      });
    });
    return Object.entries(gratitudeCounts)
      .filter(([, count]) => (count as number) > checkIns.length / 2)
      .map(([gratitude]) => gratitude);
  }

  private calculateGrowthTrajectory(checkIns: any[]): string {
    const energyTrend = this.calculateTrend(
      checkIns.map((c) => c.morning_state?.energyLevel || 5),
    );
    const breakthroughs = checkIns.filter(
      (c) => c.shadow_work?.breakthroughMoments,
    ).length;

    if (breakthroughs > 2 && energyTrend === "rising")
      return "transformational";
    if (breakthroughs > 0 || energyTrend === "rising") return "expanding";
    if (energyTrend === "declining") return "integrating";
    return "steady";
  }

  private getMostCommonEmotion(checkIns: any[]): string {
    const emotions = checkIns
      .map((c) => c.morning_state?.emotionalTone)
      .filter(Boolean);
    if (emotions.length === 0) return "neutral";

    const counts: any = {};
    emotions.forEach((e) => (counts[e] = (counts[e] || 0) + 1));

    return (
      Object.entries(counts).sort(
        ([, a], [, b]) => (b as number) - (a as number),
      )[0]?.[0] || "varied"
    );
  }

  private calculateCoherence(checkIns: any[]): number {
    if (checkIns.length < 2) return 0;

    const energyLevels = checkIns.map((c) => c.morning_state?.energyLevel || 5);
    const variance = this.calculateVariance(energyLevels);

    // Lower variance = higher coherence
    return Math.max(0, 10 - variance);
  }

  private calculateVariance(values: number[]): number {
    const mean = this.average(values);
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(this.average(squaredDiffs));
  }

  private calculateAverageEngagement(participations: any[]): number {
    if (participations.length === 0) return 0;

    const engagementScores =
      participations.map(
        (p) =>
          (p.engagement?.presenceLevel || 0) + (p.engagement?.shareDepth || 0),
      ) / 2;

    return this.average(engagementScores);
  }

  private extractBreakthroughs(participations: any[]): string[] {
    const breakthroughs: string[] = [];
    participations.forEach((p) => {
      p.engagement?.breakthroughs?.forEach((b: string) =>
        breakthroughs.push(b),
      );
    });
    return breakthroughs;
  }

  private calculateGroupCoherence(participations: any[]): number {
    if (participations.length === 0) return 0;

    const coherenceScores = participations.map(
      (p) => p.group_resonance?.groupCoherence || 0,
    );
    return this.average(coherenceScores);
  }

  private extractSessionHighlights(summary: any): string[] {
    const highlights = [];

    if (summary.breakthroughs.length > 0) {
      highlights.push(`${summary.breakthroughs.length} breakthrough moments`);
    }

    if (summary.groupCoherence > 7) {
      highlights.push("High group coherence achieved");
    }

    if (summary.wisdomCaptured > 5) {
      highlights.push(`${summary.wisdomCaptured} wisdom nuggets captured`);
    }

    return highlights;
  }
}

// Export singleton instance
export const retreatSupportService = new RetreatSupportService();

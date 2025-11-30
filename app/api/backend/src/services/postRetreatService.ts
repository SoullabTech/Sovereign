// Post-Retreat Service - Long-term transformation support
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabaseClient";
import { logger } from "../utils/logger";
import { soullabFounderAgent } from "../core/agents/soullabFounderAgent";
import { PersonalOracleAgent } from "../core/agents/adjusterAgent";

interface TransformationUpdate {
  participantId: string;
  retreatId: string;
  currentState: {
    overallWellbeing: number;
    emotionalClarity: number;
    spiritualConnection: number;
    lifeAlignment: number;
    shadowIntegration: number;
  };
  transformations: {
    implemented: Array<{
      area: string;
      description: string;
      impact: number;
      sustainabilityLevel: number;
    }>;
    inProgress: Array<{
      area: string;
      description: string;
      challenges?: string[];
      supportNeeded?: string;
    }>;
    emerging: Array<{
      area: string;
      description: string;
      readinessLevel: number;
    }>;
  };
  practices: {
    dailyPractices: string[];
    weeklyPractices: string[];
    elementalWork: {
      primaryElement: string;
      practices: string[];
      balance: number;
    };
  };
  challenges?: Array<{
    type: string;
    description: string;
    impactLevel: number;
    resourcesNeeded?: string[];
  }>;
  celebrations?: Array<{
    achievement: string;
    date: string;
    significance: string;
  }>;
  oracleQuestions?: string[];
}

interface TransformationAnalysis {
  overallProgress: number;
  growthTrajectory: "accelerating" | "steady" | "plateauing" | "integrating";
  strengths: string[];
  edges: string[];
  patterns: {
    consistent: string[];
    emerging: string[];
    challenging: string[];
  };
  recommendations: string[];
}

interface Milestone {
  id: string;
  participantId: string;
  type:
    | "breakthrough"
    | "integration"
    | "mastery"
    | "service"
    | "shadow_work"
    | "celebration";
  title: string;
  description: string;
  impact: {
    personal: string;
    relational?: string;
    collective?: string;
  };
  wisdomGained: string;
  date: Date;
  shareWithCommunity: boolean;
}

export class PostRetreatService {
  // Record transformation update
  async recordTransformationUpdate(update: TransformationUpdate): Promise<any> {
    try {
      const updateId = uuidv4();

      // Store transformation update
      const { data, error } = await supabase
        .from("transformation_updates")
        .insert({
          id: updateId,
          participant_id: update.participantId,
          retreat_id: update.retreatId,
          current_state: update.currentState,
          transformations: update.transformations,
          practices: update.practices,
          challenges: update.challenges,
          celebrations: update.celebrations,
          oracle_questions: update.oracleQuestions,
          created_at: new Date(),
        });

      if (error) throw error;

      // Update participant's integration status
      await this.updateIntegrationStatus(update.participantId, update);

      // Calculate next check-in date
      const nextCheckInDate = this.calculateNextCheckIn(update);

      logger.info("Transformation update recorded", {
        participantId: update.participantId,
        updateId,
      });

      return {
        id: updateId,
        ...update,
        nextCheckInDate,
      };
    } catch (error) {
      logger.error("Failed to record transformation update", error);
      throw error;
    }
  }

  // Analyze transformation journey
  async analyzeTransformationJourney(
    participantId: string,
  ): Promise<TransformationAnalysis> {
    try {
      // Get all transformation updates
      const { data: updates } = await supabase
        .from("transformation_updates")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: true });

      if (!updates || updates.length === 0) {
        return this.getDefaultAnalysis();
      }

      // Analyze progress over time
      const overallProgress = this.calculateOverallProgress(updates);
      const growthTrajectory = this.determineGrowthTrajectory(updates);
      const strengths = this.identifyStrengths(updates);
      const edges = this.identifyGrowthEdges(updates);
      const patterns = this.identifyPatterns(updates);
      const recommendations = this.generateRecommendations(
        updates[updates.length - 1],
        patterns,
        growthTrajectory,
      );

      return {
        overallProgress,
        growthTrajectory,
        strengths,
        edges,
        patterns,
        recommendations,
      };
    } catch (error) {
      logger.error("Failed to analyze transformation journey", error);
      throw error;
    }
  }

  // Generate integration guidance
  async generateIntegrationGuidance(
    participantId: string,
    currentUpdate: TransformationUpdate,
    analysis: TransformationAnalysis,
  ): Promise<any> {
    try {
      // Get participant's retreat data
      const retreatContext =
        await this.getParticipantRetreatContext(participantId);

      // Generate personalized guidance
      const guidance = await this.createPersonalizedGuidance(
        retreatContext,
        currentUpdate,
        analysis,
      );

      // Get relevant practices
      const practices = this.selectIntegrationPractices(
        retreatContext.element,
        currentUpdate,
        analysis,
      );

      // Find relevant wisdom from community
      const communityWisdom = await this.findRelevantCommunityWisdom(
        currentUpdate.challenges,
        currentUpdate.transformations.inProgress,
      );

      return {
        oracleMessage: guidance.message,
        keyInsights: guidance.insights,
        practices,
        resources: guidance.resources,
        communityWisdom,
        nextFocus: this.determineNextFocus(analysis, currentUpdate),
      };
    } catch (error) {
      logger.error("Failed to generate integration guidance", error);
      throw error;
    }
  }

  // Get transformation timeline
  async getTransformationTimeline(
    participantId: string,
    retreatId?: string,
  ): Promise<any> {
    try {
      let query = supabase
        .from("transformation_updates")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: true });

      if (retreatId) {
        query = query.eq("retreat_id", retreatId);
      }

      const { data: updates } = await query;

      if (!updates || updates.length === 0) {
        return {
          timeline: [],
          metrics: {},
          growthChart: [],
          elementalEvolution: [],
          practiceConsistency: [],
        };
      }

      // Build timeline
      const timeline = updates.map((update) => ({
        date: update.created_at,
        overallWellbeing: update.current_state.overallWellbeing,
        keyTransformations: update.transformations.implemented,
        challenges: update.challenges,
        celebrations: update.celebrations,
      }));

      // Calculate metrics
      const metrics = this.calculateTimelineMetrics(updates);

      // Generate visualizations data
      const growthChart = this.generateGrowthChart(updates);
      const elementalEvolution = this.generateElementalEvolution(updates);
      const practiceConsistency = this.generatePracticeConsistency(updates);

      return {
        timeline,
        metrics,
        growthChart,
        elementalEvolution,
        practiceConsistency,
      };
    } catch (error) {
      logger.error("Failed to get transformation timeline", error);
      throw error;
    }
  }

  // Get participant retreat context
  async getParticipantRetreatContext(participantId: string): Promise<any> {
    try {
      // Get participant data
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      // Get retreat insights
      const { data: insights } = await supabase
        .from("retreat_insights")
        .select("*")
        .eq("participant_id", participantId);

      // Get latest transformation
      const { data: latestUpdate } = await supabase
        .from("transformation_updates")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        element: participant?.oracleElement || "aether",
        archetype: participant?.oracleArchetype || "Soul Guide",
        insights: insights || [],
        currentTransformations: latestUpdate?.transformations || {},
        retreatIntentions: participant?.retreatIntentions || {},
        shadowWork: participant?.shadowWork || {},
      };
    } catch (error) {
      logger.error("Failed to get retreat context", error);
      throw error;
    }
  }

  // Generate sacred guidance
  async generateSacredGuidance(params: any): Promise<any> {
    try {
      // Use Personal Oracle for guidance
      const oracleResponse = await this.invokePersonalOracle(params);

      // Get relevant practices
      const practices = this.selectGuidancePractices(
        params.element,
        params.lifeArea,
        params.context,
      );

      // Find related wisdom
      const relatedWisdom = await this.findRelatedWisdom(
        params.question,
        params.lifeArea,
        params.element,
      );

      // Generate next steps
      const nextSteps = this.generateNextSteps(
        params,
        oracleResponse,
        practices,
      );

      return {
        message: oracleResponse,
        practices,
        resources: this.selectResources(
          params.lifeArea,
          params.currentTransformations,
        ),
        relatedWisdom,
        nextSteps,
      };
    } catch (error) {
      logger.error("Failed to generate sacred guidance", error);
      throw error;
    }
  }

  // Record guidance session
  async recordGuidanceSession(
    participantId: string,
    guidance: any,
  ): Promise<void> {
    try {
      await supabase.from("guidance_sessions").insert({
        participant_id: participantId,
        guidance,
        created_at: new Date(),
      });
    } catch (error) {
      logger.error("Failed to record guidance session", error);
    }
  }

  // Schedule Oracle check-ins
  async scheduleOracleCheckIns(params: any): Promise<any> {
    try {
      const schedule = {
        participantId: params.participantId,
        frequency: params.frequency,
        preferredTime: params.preferredTime,
        focusAreas: params.focusAreas,
        nextCheckIn: this.calculateNextScheduledCheckIn(params.frequency),
        reminders: this.generateReminderSchedule(params.frequency),
      };

      // Store schedule
      await supabase.from("oracle_checkin_schedules").upsert({
        participant_id: params.participantId,
        ...schedule,
        created_at: new Date(),
      });

      return schedule;
    } catch (error) {
      logger.error("Failed to schedule check-ins", error);
      throw error;
    }
  }

  // Record milestone
  async recordMilestone(milestoneData: any): Promise<Milestone> {
    try {
      const milestone: Milestone = {
        id: uuidv4(),
        participantId: milestoneData.participantId,
        type: milestoneData.type,
        title: milestoneData.title,
        description: milestoneData.description,
        impact: milestoneData.impact,
        wisdomGained: milestoneData.wisdomGained,
        date: new Date(),
        shareWithCommunity: milestoneData.shareWithCommunity,
      };

      // Store milestone
      await supabase.from("milestones").insert(milestone);

      // Update participant stats
      await this.updateMilestoneStats(milestone.participantId, milestone.type);

      logger.info("Milestone recorded", {
        milestoneId: milestone.id,
        type: milestone.type,
      });

      return milestone;
    } catch (error) {
      logger.error("Failed to record milestone", error);
      throw error;
    }
  }

  // Generate celebration
  async generateCelebration(
    participantId: string,
    milestone: Milestone,
  ): Promise<any> {
    try {
      // Get participant info
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      // Generate personalized celebration message
      const message = await soullabFounderAgent.generateCelebrationMessage(
        participant,
        milestone,
      );

      // Create celebration ritual
      const ritual = this.createCelebrationRitual(
        participant?.oracleElement,
        milestone.type,
      );

      // Get community celebration if shared
      let communityCelebration = null;
      if (milestone.shareWithCommunity) {
        communityCelebration = await this.createCommunityCelebration(milestone);
      }

      return {
        personalMessage: message,
        ritual,
        communityCelebration,
        wisdomKeeper: `This ${milestone.type} has been recorded in your sacred journey archive.`,
      };
    } catch (error) {
      logger.error("Failed to generate celebration", error);
      throw error;
    }
  }

  // Share with alumni community
  async shareWithAlumniCommunity(milestone: Milestone): Promise<void> {
    try {
      await supabase.from("community_shares").insert({
        type: "milestone",
        content: milestone,
        shared_by: milestone.participantId,
        visibility: "alumni",
        created_at: new Date(),
      });

      // Notify community members
      await this.notifyAlumniOfShare(milestone);
    } catch (error) {
      logger.error("Failed to share with community", error);
    }
  }

  // Get milestones
  async getMilestones(participantId: string, filters: any): Promise<any> {
    try {
      let query = supabase
        .from("milestones")
        .select("*")
        .eq("participant_id", participantId)
        .order("date", { ascending: false });

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data: milestones, count } = await query;

      // Get statistics
      const stats = await this.getMilestoneStatistics(participantId);

      return {
        milestones: milestones || [],
        total: count || 0,
        byType: stats.byType,
        recent: milestones?.slice(0, 5) || [],
      };
    } catch (error) {
      logger.error("Failed to get milestones", error);
      throw error;
    }
  }

  // Generate challenge support
  async generateChallengeSupport(params: any): Promise<any> {
    try {
      // Get participant context
      const context = await this.getParticipantRetreatContext(
        params.participantId,
      );

      // Analyze challenge pattern
      const challengeAnalysis = this.analyzeChallengePattern(
        params.challengeType,
        params.description,
        context,
      );

      // Generate support strategy
      const support = await this.createSupportStrategy(
        params,
        context,
        challengeAnalysis,
      );

      // Get relevant resources
      const resources = await this.gatherChallengeResources(
        params.challengeType,
        context.element,
      );

      // Create practice recommendations
      const practices = this.createChallengePractices(
        params.challengeType,
        context.element,
        challengeAnalysis,
      );

      // Schedule follow-up
      const followUpDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks

      return {
        analysis: challengeAnalysis,
        strategy: support,
        resources,
        practices,
        followUpDate,
      };
    } catch (error) {
      logger.error("Failed to generate challenge support", error);
      throw error;
    }
  }

  // Find similar journeys
  async findSimilarJourneys(
    participantId: string,
    challengeType: string,
  ): Promise<any[]> {
    try {
      // Get participants with similar challenges
      const { data: similarParticipants } = await supabase
        .from("transformation_updates")
        .select("participant_id")
        .contains("challenges", [{ type: challengeType }])
        .neq("participant_id", participantId)
        .limit(10);

      if (!similarParticipants || similarParticipants.length === 0) {
        return [];
      }

      // Get their successful transformations
      const connections = await Promise.all(
        similarParticipants.map(async (p) => {
          const { data: participant } = await supabase
            .from("retreat_participants")
            .select("firstName, oracleElement")
            .eq("id", p.participant_id)
            .single();

          const { data: successes } = await supabase
            .from("transformation_updates")
            .select("transformations")
            .eq("participant_id", p.participant_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            participantId: p.participant_id,
            name: participant?.firstName || "Fellow Journeyer",
            element: participant?.oracleElement,
            sharedChallenge: challengeType,
            insights: successes?.transformations?.implemented || [],
          };
        }),
      );

      return connections;
    } catch (error) {
      logger.error("Failed to find similar journeys", error);
      return [];
    }
  }

  // Get integration reminders
  async getIntegrationReminders(participantId: string): Promise<any> {
    try {
      // Get scheduled check-ins
      const { data: schedule } = await supabase
        .from("oracle_checkin_schedules")
        .select("*")
        .eq("participant_id", participantId)
        .single();

      // Get upcoming milestones
      const upcomingMilestones =
        await this.predictUpcomingMilestones(participantId);

      // Get suggested practices
      const practices = await this.getSuggestedPractices(participantId);

      // Get community events
      const events = await this.getUpcomingCommunityEvents(participantId);

      return {
        scheduled: schedule?.reminders || [],
        practices,
        events,
        upcomingMilestones,
      };
    } catch (error) {
      logger.error("Failed to get integration reminders", error);
      throw error;
    }
  }

  // Get alumni community
  async getAlumniCommunity(retreatId: string, filters: any): Promise<any> {
    try {
      // Get alumni members
      let query = supabase
        .from("retreat_participants")
        .select("*")
        .eq("retreat_id", retreatId);

      if (filters.element) {
        query = query.eq("oracleElement", filters.element);
      }

      const { data: members } = await query;

      // Get recent shared wisdom
      const { data: recentWisdom } = await supabase
        .from("community_shares")
        .select("*")
        .eq("visibility", "alumni")
        .order("created_at", { ascending: false })
        .limit(10);

      // Get upcoming gatherings
      const { data: gatherings } = await supabase
        .from("community_gatherings")
        .select("*")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      return {
        members: members || [],
        recentWisdom: recentWisdom || [],
        gatherings: gatherings || [],
      };
    } catch (error) {
      logger.error("Failed to get alumni community", error);
      throw error;
    }
  }

  // Generate annual review
  async generateAnnualReview(
    participantId: string,
    year: number,
  ): Promise<any> {
    try {
      // Get year's transformation updates
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const { data: updates } = await supabase
        .from("transformation_updates")
        .select("*")
        .eq("participant_id", participantId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (!updates || updates.length === 0) {
        return { year, message: "No transformation data for this year." };
      }

      // Generate comprehensive review
      const review = {
        year,
        journeyHighlights: this.extractYearHighlights(updates),
        transformationMap: this.createTransformationMap(updates),
        growthSpiral: this.createGrowthSpiral(updates),
        elementalJourney: this.trackElementalJourney(updates),
        challengesNavigated: this.summarizeChallenges(updates),
        wisdomGained: this.compileYearWisdom(updates),
        practiceEvolution: this.analyzePracticeEvolution(updates),
        communityContributions: await this.getYearCommunityContributions(
          participantId,
          year,
        ),
        recommendationsForNextYear:
          this.generateNextYearRecommendations(updates),
      };

      // Generate narrative summary
      const narrative = await this.createAnnualNarrative(participantId, review);
      review["narrative"] = narrative;

      return review;
    } catch (error) {
      logger.error("Failed to generate annual review", error);
      throw error;
    }
  }

  // Check retreat anniversary
  async checkRetreatAnniversary(participantId: string): Promise<any> {
    try {
      // Get participant's retreat date
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("created_at, retreatId")
        .eq("id", participantId)
        .single();

      if (!participant) {
        return { isAnniversary: false };
      }

      const retreatDate = new Date(participant.created_at);
      const today = new Date();

      // Check if it's anniversary (same month and day)
      const isAnniversary =
        retreatDate.getMonth() === today.getMonth() &&
        retreatDate.getDate() === today.getDate();

      const yearsElapsed = today.getFullYear() - retreatDate.getFullYear();

      if (isAnniversary && yearsElapsed > 0) {
        // Get transformation summary
        const transformation =
          await this.getTransformationSummary(participantId);

        return {
          isAnniversary: true,
          years: yearsElapsed,
          retreatDate,
          transformation,
          reflection: await this.generateAnniversaryReflection(
            participantId,
            yearsElapsed,
          ),
          invitation: this.createAnniversaryInvitation(yearsElapsed),
        };
      }

      // Calculate next anniversary
      const nextAnniversary = new Date(retreatDate);
      nextAnniversary.setFullYear(today.getFullYear());
      if (nextAnniversary < today) {
        nextAnniversary.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil(
        (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        isAnniversary: false,
        nextDate: nextAnniversary,
        daysUntil,
      };
    } catch (error) {
      logger.error("Failed to check anniversary", error);
      throw error;
    }
  }

  // Generate anniversary message
  async generateAnniversaryMessage(
    participantId: string,
    anniversary: any,
  ): Promise<string> {
    try {
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      return await soullabFounderAgent.generateAnniversaryMessage(
        participant,
        anniversary.years,
        anniversary.transformation,
      );
    } catch (error) {
      logger.error("Failed to generate anniversary message", error);
      throw error;
    }
  }

  // Helper methods
  private calculateNextCheckIn(update: TransformationUpdate): Date {
    const baseInterval = 30; // days
    const wellbeingFactor = update.currentState.overallWellbeing / 10;
    const intervalDays = Math.round(baseInterval * wellbeingFactor);

    return new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  }

  private async updateIntegrationStatus(
    participantId: string,
    update: TransformationUpdate,
  ): Promise<void> {
    const integrationScore = this.calculateIntegrationScore(update);

    await supabase
      .from("retreat_participants")
      .update({
        integration_status: {
          lastUpdate: new Date(),
          integrationScore,
          activeTransformations:
            update.transformations.implemented.length +
            update.transformations.inProgress.length,
          consistencyScore: this.calculateConsistencyScore(update.practices),
        },
      })
      .eq("id", participantId);
  }

  private calculateIntegrationScore(update: TransformationUpdate): number {
    const weights = {
      wellbeing: 0.2,
      transformations: 0.3,
      practices: 0.2,
      challenges: 0.15,
      celebrations: 0.15,
    };

    const wellbeingScore =
      Object.values(update.currentState).reduce((a, b) => a + b, 0) / 50;
    const transformationScore =
      (update.transformations.implemented.length * 10 +
        update.transformations.inProgress.length * 5) /
      100;
    const practiceScore =
      (update.practices.dailyPractices.length +
        update.practices.weeklyPractices.length) /
      10;
    const challengeScore = update.challenges
      ? (10 - update.challenges.length) / 10
      : 1;
    const celebrationScore = update.celebrations
      ? update.celebrations.length / 5
      : 0;

    return (
      Math.min(
        10,
        wellbeingScore * weights.wellbeing +
          transformationScore * weights.transformations +
          practiceScore * weights.practices +
          challengeScore * weights.challenges +
          celebrationScore * weights.celebrations,
      ) * 10
    );
  }

  private calculateConsistencyScore(practices: any): number {
    // In production, this would analyze practice history
    return (
      (practices.dailyPractices.length * 10 +
        practices.weeklyPractices.length * 5) /
      15
    );
  }

  private getDefaultAnalysis(): TransformationAnalysis {
    return {
      overallProgress: 0,
      growthTrajectory: "steady",
      strengths: [],
      edges: [],
      patterns: {
        consistent: [],
        emerging: [],
        challenging: [],
      },
      recommendations: ["Begin tracking your transformation journey"],
    };
  }

  private calculateOverallProgress(updates: any[]): number {
    if (updates.length === 0) return 0;

    const latest = updates[updates.length - 1];
    const earliest = updates[0];

    const startScore =
      Object.values(earliest.current_state).reduce(
        (a: number, b: any) => a + b,
        0,
      ) / 5;
    const currentScore =
      Object.values(latest.current_state).reduce(
        (a: number, b: any) => a + b,
        0,
      ) / 5;

    return Math.round(((currentScore - startScore) / startScore) * 100);
  }

  private determineGrowthTrajectory(
    updates: any[],
  ): TransformationAnalysis["growthTrajectory"] {
    if (updates.length < 3) return "steady";

    const recent = updates.slice(-3);
    const scores = recent.map(
      (u) =>
        Object.values(u.current_state).reduce((a: number, b: any) => a + b, 0) /
        5,
    );

    const trend = scores[2] - scores[0];

    if (trend > 1) return "accelerating";
    if (trend < -0.5) return "integrating";
    if (Math.abs(trend) < 0.2) return "plateauing";
    return "steady";
  }

  private identifyStrengths(updates: any[]): string[] {
    const latest = updates[updates.length - 1];
    const strengths: string[] = [];

    if (latest.current_state.emotionalClarity >= 8)
      strengths.push("Emotional mastery");
    if (latest.current_state.spiritualConnection >= 8)
      strengths.push("Deep spiritual connection");
    if (latest.current_state.lifeAlignment >= 8)
      strengths.push("Living in alignment");
    if (latest.current_state.shadowIntegration >= 8)
      strengths.push("Shadow integration");

    if (latest.transformations.implemented.length > 5)
      strengths.push("Implementation power");
    if (latest.practices.dailyPractices.length >= 3)
      strengths.push("Consistent practice");

    return strengths;
  }

  private identifyGrowthEdges(updates: any[]): string[] {
    const latest = updates[updates.length - 1];
    const edges: string[] = [];

    Object.entries(latest.current_state).forEach(([key, value]) => {
      if (value < 5) {
        edges.push(key.replace(/([A-Z])/g, " $1").toLowerCase());
      }
    });

    if (latest.challenges && latest.challenges.length > 3) {
      edges.push("Challenge navigation");
    }

    if (
      latest.transformations.inProgress.length >
      latest.transformations.implemented.length
    ) {
      edges.push("Completion and integration");
    }

    return edges;
  }

  private identifyPatterns(updates: any[]): any {
    const patterns = {
      consistent: [] as string[],
      emerging: [] as string[],
      challenging: [] as string[],
    };

    // Analyze consistent practices
    const allPractices = updates.flatMap((u) => u.practices.dailyPractices);
    const practiceCounts: any = {};
    allPractices.forEach(
      (p) => (practiceCounts[p] = (practiceCounts[p] || 0) + 1),
    );

    Object.entries(practiceCounts).forEach(([practice, count]) => {
      if ((count as number) > updates.length * 0.7) {
        patterns.consistent.push(practice);
      }
    });

    // Analyze emerging patterns
    if (updates.length >= 3) {
      const recent = updates.slice(-3);
      const recentPractices = recent.flatMap((u) => u.practices.dailyPractices);
      const emerging = [...new Set(recentPractices)].filter(
        (p) => !patterns.consistent.includes(p),
      );
      patterns.emerging = emerging;
    }

    // Analyze challenges
    const allChallenges = updates
      .flatMap((u) => u.challenges || [])
      .map((c) => c.type);
    const challengeCounts: any = {};
    allChallenges.forEach(
      (c) => (challengeCounts[c] = (challengeCounts[c] || 0) + 1),
    );

    patterns.challenging = Object.entries(challengeCounts)
      .filter(([, count]) => (count as number) > 2)
      .map(([challenge]) => challenge);

    return patterns;
  }

  private generateRecommendations(
    latest: any,
    patterns: any,
    trajectory: string,
  ): string[] {
    const recommendations: string[] = [];

    // Trajectory-based recommendations
    if (trajectory === "plateauing") {
      recommendations.push(
        "Consider a new practice or challenge to reignite growth",
      );
      recommendations.push("Schedule an Oracle session for fresh perspective");
    }

    if (trajectory === "integrating") {
      recommendations.push(
        "Honor this integration phase with gentle practices",
      );
      recommendations.push("Journal about what is settling and rooting");
    }

    // Pattern-based recommendations
    if (patterns.challenging.length > 0) {
      recommendations.push(
        `Focus support on recurring challenge: ${patterns.challenging[0]}`,
      );
    }

    if (patterns.emerging.length > 0) {
      recommendations.push(
        `Deepen into emerging practice: ${patterns.emerging[0]}`,
      );
    }

    // State-based recommendations
    Object.entries(latest.current_state).forEach(([key, value]) => {
      if (value < 5) {
        recommendations.push(
          `Gentle attention to ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
      }
    });

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private async createPersonalizedGuidance(
    context: any,
    update: TransformationUpdate,
    analysis: TransformationAnalysis,
  ): Promise<any> {
    // In production, this would use the PersonalOracleAgent
    const insights = [];

    if (analysis.growthTrajectory === "accelerating") {
      insights.push(
        "Your rapid growth is beautiful. Remember to ground and integrate.",
      );
    }

    if (update.challenges && update.challenges.length > 0) {
      insights.push(
        `The ${update.challenges[0].type} you face is a teacher in disguise.`,
      );
    }

    insights.push(
      `Your ${context.element} nature is calling for ${this.getElementalNeed(context.element, update)}.`,
    );

    return {
      message: `Dear one, ${insights.join(" ")} Trust your journey.`,
      insights,
      resources: [],
    };
  }

  private getElementalNeed(
    element: string,
    update: TransformationUpdate,
  ): string {
    const needs: any = {
      fire: "creative expression and passion projects",
      water: "emotional flow and deep feeling",
      earth: "grounding practices and manifestation",
      air: "mental clarity and new perspectives",
      aether: "integration and unity consciousness",
    };

    // Adjust based on current state
    if (update.currentState.overallWellbeing < 6) {
      needs.fire = "gentle rekindling of your inner flame";
      needs.water = "compassionate self-care";
      needs.earth = "rest and restoration";
      needs.air = "breathing space";
      needs.aether = "gentle integration";
    }

    return needs[element] || "balanced attention";
  }

  private selectIntegrationPractices(
    element: string,
    update: TransformationUpdate,
    analysis: TransformationAnalysis,
  ): string[] {
    const practices: string[] = [];

    // Element-specific practices
    const elementPractices: any = {
      fire: [
        "Morning intention setting",
        "Creative expression",
        "Passion activation",
      ],
      water: [
        "Emotional flow practice",
        "Heart coherence",
        "Compassion meditation",
      ],
      earth: ["Grounding ritual", "Nature connection", "Body wisdom practice"],
      air: ["Breathwork", "Mind clearing", "Vision meditation"],
      aether: ["Unity meditation", "Integration practice", "Sacred geometry"],
    };

    practices.push(...(elementPractices[element] || elementPractices.aether));

    // Trajectory-specific practices
    if (analysis.growthTrajectory === "integrating") {
      practices.push("Gentle yoga", "Journaling", "Rest");
    }

    // Challenge-specific practices
    if (update.challenges && update.challenges.length > 0) {
      practices.push("Shadow work journaling", "Support circle connection");
    }

    return practices.slice(0, 5);
  }

  private async findRelevantCommunityWisdom(
    challenges: any[] | undefined,
    inProgress: any[],
  ): Promise<any[]> {
    // In production, this would search the wisdom database
    return [
      {
        type: "insight",
        content: "Trust the spiral nature of growth",
        contributor: "Alumni Member",
        relevance: "transformation",
      },
    ];
  }

  private determineNextFocus(
    analysis: TransformationAnalysis,
    update: TransformationUpdate,
  ): string {
    // Prioritize based on lowest scores
    const stateScores = Object.entries(update.currentState).sort(
      ([, a], [, b]) => a - b,
    );

    const lowestArea = stateScores[0][0];

    return `Gentle focus on ${lowestArea.replace(/([A-Z])/g, " $1").toLowerCase()}`;
  }

  private calculateTimelineMetrics(updates: any[]): any {
    return {
      totalUpdates: updates.length,
      averageWellbeing: this.calculateAverageWellbeing(updates),
      transformationVelocity: this.calculateTransformationVelocity(updates),
      consistencyScore: this.calculateTimelineConsistency(updates),
      growthRate: this.calculateGrowthRate(updates),
    };
  }

  private calculateAverageWellbeing(updates: any[]): number {
    const total = updates.reduce(
      (sum, update) => sum + update.current_state.overallWellbeing,
      0,
    );
    return Math.round((total / updates.length) * 10) / 10;
  }

  private calculateTransformationVelocity(updates: any[]): number {
    if (updates.length < 2) return 0;

    const totalTransformations = updates.reduce(
      (sum, update) => sum + update.transformations.implemented.length,
      0,
    );

    const timeSpan =
      new Date(updates[updates.length - 1].created_at).getTime() -
      new Date(updates[0].created_at).getTime();
    const months = timeSpan / (1000 * 60 * 60 * 24 * 30);

    return Math.round((totalTransformations / months) * 10) / 10;
  }

  private calculateTimelineConsistency(updates: any[]): number {
    if (updates.length < 2) return 10;

    // Calculate intervals between updates
    const intervals: number[] = [];
    for (let i = 1; i < updates.length; i++) {
      const interval =
        new Date(updates[i].created_at).getTime() -
        new Date(updates[i - 1].created_at).getTime();
      intervals.push(interval);
    }

    // Calculate variance
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
        0,
      ) / intervals.length;

    // Convert to 0-10 score (lower variance = higher score)
    const consistencyScore = Math.max(
      0,
      10 - Math.sqrt(variance) / (avgInterval * 0.5),
    );
    return Math.round(consistencyScore * 10) / 10;
  }

  private calculateGrowthRate(updates: any[]): number {
    if (updates.length < 2) return 0;

    const firstWellbeing = updates[0].current_state.overallWellbeing;
    const lastWellbeing =
      updates[updates.length - 1].current_state.overallWellbeing;

    const growth = ((lastWellbeing - firstWellbeing) / firstWellbeing) * 100;
    return Math.round(growth * 10) / 10;
  }

  private generateGrowthChart(updates: any[]): any[] {
    return updates.map((update) => ({
      date: update.created_at,
      wellbeing: update.current_state.overallWellbeing,
      emotionalClarity: update.current_state.emotionalClarity,
      spiritualConnection: update.current_state.spiritualConnection,
      lifeAlignment: update.current_state.lifeAlignment,
      shadowIntegration: update.current_state.shadowIntegration,
    }));
  }

  private generateElementalEvolution(updates: any[]): any[] {
    return updates.map((update) => ({
      date: update.created_at,
      element: update.practices.elementalWork.primaryElement,
      balance: update.practices.elementalWork.balance,
      practices: update.practices.elementalWork.practices.length,
    }));
  }

  private generatePracticeConsistency(updates: any[]): any[] {
    return updates.map((update) => ({
      date: update.created_at,
      dailyPractices: update.practices.dailyPractices.length,
      weeklyPractices: update.practices.weeklyPractices.length,
      total:
        update.practices.dailyPractices.length +
        update.practices.weeklyPractices.length,
    }));
  }

  private async invokePersonalOracle(params: any): Promise<string> {
    // In production, this would call the PersonalOracleAgent
    return `Beloved ${params.participantId}, your question about ${params.lifeArea} resonates deeply. ${params.question} Trust your ${params.element} wisdom.`;
  }

  private selectGuidancePractices(
    element: string,
    lifeArea: string,
    context: string,
  ): string[] {
    const practices: string[] = [];

    // Base elemental practice
    practices.push(`${element} meditation for ${lifeArea}`);

    // Context-specific practices
    if (context.includes("challenge")) {
      practices.push("Shadow work journaling", "Support circle activation");
    }

    if (context.includes("celebration")) {
      practices.push("Gratitude practice", "Sharing your gifts");
    }

    return practices;
  }

  private async findRelatedWisdom(
    question: string,
    lifeArea: string,
    element: string,
  ): Promise<any[]> {
    // In production, search wisdom database
    return [
      {
        type: "guidance",
        content: "Trust the wisdom already within you",
        element,
        relevance: lifeArea,
      },
    ];
  }

  private generateNextSteps(
    params: any,
    oracleResponse: string,
    practices: string[],
  ): string[] {
    return [
      `Sit with the Oracle's message: "${oracleResponse.substring(0, 50)}..."`,
      `Begin with ${practices[0]}`,
      "Journal any insights that arise",
      "Check in again in one week",
    ];
  }

  private selectResources(lifeArea: string, transformations: any): any[] {
    // In production, this would select from resource library
    return [
      {
        type: "article",
        title: `Navigating ${lifeArea} with grace`,
        url: "#",
      },
      {
        type: "practice",
        title: "Daily integration ritual",
        url: "#",
      },
    ];
  }

  private calculateNextScheduledCheckIn(frequency: string): Date {
    const intervals: any = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
    };

    const days = intervals[frequency] || 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private generateReminderSchedule(frequency: string): any[] {
    const base = this.calculateNextScheduledCheckIn(frequency);

    return [
      {
        type: "advance",
        date: new Date(base.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before
        message: "Oracle check-in coming up",
      },
      {
        type: "day_of",
        date: base,
        message: "Time for your Oracle check-in",
      },
    ];
  }

  private async updateMilestoneStats(
    participantId: string,
    type: string,
  ): Promise<void> {
    // Update participant statistics
    const { data: stats } = await supabase
      .from("participant_stats")
      .select("*")
      .eq("participant_id", participantId)
      .single();

    const milestoneCount = stats?.milestone_count || {};
    milestoneCount[type] = (milestoneCount[type] || 0) + 1;

    await supabase.from("participant_stats").upsert({
      participant_id: participantId,
      milestone_count: milestoneCount,
      last_milestone: new Date(),
    });
  }

  private createCelebrationRitual(element: string, milestoneType: string): any {
    const rituals: any = {
      fire: {
        practice: "Light a candle for your achievement",
        reflection: "How has your inner fire grown?",
        offering: "Write your breakthrough and safely burn it as offering",
      },
      water: {
        practice: "Take a ritual bath with salts",
        reflection: "How have your emotions evolved?",
        offering: "Offer water to a plant while stating your growth",
      },
      earth: {
        practice: "Plant something to honor your growth",
        reflection: "What have you manifested?",
        offering: "Create an earth altar with your symbols",
      },
      air: {
        practice: "Breathwork celebration sequence",
        reflection: "What new perspectives have emerged?",
        offering: "Release a biodegradable balloon with your message",
      },
      aether: {
        practice: "Sacred geometry meditation",
        reflection: "How has integration served you?",
        offering: "Create art representing your journey",
      },
    };

    return rituals[element] || rituals.aether;
  }

  private async createCommunityCelebration(milestone: Milestone): Promise<any> {
    return {
      sharedWith: "retreat_alumni",
      celebrationCircle: true,
      message: "Your journey inspires the collective",
    };
  }

  private async notifyAlumniOfShare(milestone: Milestone): Promise<void> {
    // In production, send notifications
    logger.info("Alumni notified of milestone share", {
      milestoneId: milestone.id,
    });
  }

  private async getMilestoneStatistics(participantId: string): Promise<any> {
    const { data: stats } = await supabase
      .from("participant_stats")
      .select("milestone_count")
      .eq("participant_id", participantId)
      .single();

    return {
      byType: stats?.milestone_count || {},
    };
  }

  private analyzeChallengePattern(
    type: string,
    description: string,
    context: any,
  ): any {
    return {
      pattern: "recurring",
      rootElement: context.element,
      shadowAspect: this.identifyShadowAspect(type, description),
      previousApproaches: [], // Would analyze history
      recommendations: [`Work with ${context.element} shadow`],
    };
  }

  private identifyShadowAspect(type: string, description: string): string {
    const shadowMap: any = {
      relationship: "Intimacy and boundaries",
      career: "Purpose and worth",
      health: "Body wisdom and care",
      spiritual: "Trust and surrender",
      financial: "Abundance and security",
    };

    return shadowMap[type] || "Integration opportunity";
  }

  private async createSupportStrategy(
    params: any,
    context: any,
    analysis: any,
  ): Promise<any> {
    return {
      approach: `${context.element}-based navigation`,
      practices: [
        `Daily ${context.element} practice for ${params.challengeType}`,
      ],
      mindset: "This challenge is a teacher",
      support: "Oracle guidance + community wisdom",
    };
  }

  private async gatherChallengeResources(
    type: string,
    element: string,
  ): Promise<any[]> {
    return [
      {
        type: "guide",
        title: `${element} approach to ${type}`,
        content: "Wisdom from your element",
      },
    ];
  }

  private createChallengePractices(
    type: string,
    element: string,
    analysis: any,
  ): string[] {
    return [
      `Morning ${element} practice`,
      `Shadow work on ${analysis.shadowAspect}`,
      "Evening integration ritual",
      "Weekly Oracle check-in",
    ];
  }

  private async predictUpcomingMilestones(
    participantId: string,
  ): Promise<any[]> {
    // Analyze patterns to predict
    return [
      {
        type: "integration",
        predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        area: "Shadow work completion",
      },
    ];
  }

  private async getSuggestedPractices(
    participantId: string,
  ): Promise<string[]> {
    const context = await this.getParticipantRetreatContext(participantId);
    return [
      `Daily ${context.element} meditation`,
      "Integration journaling",
      "Community connection",
    ];
  }

  private async getUpcomingCommunityEvents(
    participantId: string,
  ): Promise<any[]> {
    return [
      {
        type: "online_circle",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        title: "Monthly Integration Circle",
      },
    ];
  }

  private extractYearHighlights(updates: any[]): any[] {
    return updates
      .filter((u) => u.celebrations && u.celebrations.length > 0)
      .flatMap((u) => u.celebrations)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  private createTransformationMap(updates: any[]): any {
    const map: any = {
      implemented: new Set(),
      areas: new Set(),
      timeline: [],
    };

    updates.forEach((update) => {
      update.transformations.implemented.forEach((t: any) => {
        map.implemented.add(t.area);
        map.timeline.push({
          date: update.created_at,
          transformation: t.area,
          impact: t.impact,
        });
      });
    });

    return {
      totalAreas: map.implemented.size,
      timeline: map.timeline,
    };
  }

  private createGrowthSpiral(updates: any[]): any[] {
    return updates.map((update, index) => ({
      angle: (index / updates.length) * 360,
      radius: update.current_state.overallWellbeing * 10,
      date: update.created_at,
      state: update.current_state,
    }));
  }

  private trackElementalJourney(updates: any[]): any {
    const journey: any = {};

    updates.forEach((update) => {
      const element = update.practices.elementalWork.primaryElement;
      if (!journey[element]) {
        journey[element] = {
          visits: 0,
          totalBalance: 0,
          practices: new Set(),
        };
      }

      journey[element].visits++;
      journey[element].totalBalance += update.practices.elementalWork.balance;
      update.practices.elementalWork.practices.forEach((p: string) =>
        journey[element].practices.add(p),
      );
    });

    // Calculate averages
    Object.keys(journey).forEach((element) => {
      journey[element].averageBalance =
        journey[element].totalBalance / journey[element].visits;
      journey[element].practiceCount = journey[element].practices.size;
    });

    return journey;
  }

  private summarizeChallenges(updates: any[]): any {
    const challenges: any = {};

    updates.forEach((update) => {
      update.challenges?.forEach((challenge) => {
        if (!challenges[challenge.type]) {
          challenges[challenge.type] = {
            occurrences: 0,
            totalImpact: 0,
            descriptions: [],
          };
        }

        challenges[challenge.type].occurrences++;
        challenges[challenge.type].totalImpact += challenge.impactLevel;
        challenges[challenge.type].descriptions.push(challenge.description);
      });
    });

    return challenges;
  }

  private compileYearWisdom(updates: any[]): string[] {
    const wisdom: string[] = [];

    updates.forEach((update) => {
      // Extract wisdom from transformations
      update.transformations.implemented.forEach((t: any) => {
        if (t.impact >= 8) {
          wisdom.push(`${t.area}: ${t.description}`);
        }
      });
    });

    return wisdom;
  }

  private analyzePracticeEvolution(updates: any[]): any {
    const evolution: any = {
      started: updates[0].practices,
      current: updates[updates.length - 1].practices,
      consistency: {},
      dropped: [],
      added: [],
    };

    // Track practice consistency
    const allPractices = new Set<string>();
    updates.forEach((update) => {
      update.practices.dailyPractices.forEach((p: string) =>
        allPractices.add(p),
      );
    });

    allPractices.forEach((practice) => {
      const count = updates.filter((u) =>
        u.practices.dailyPractices.includes(practice),
      ).length;
      evolution.consistency[practice] = count / updates.length;
    });

    return evolution;
  }

  private async getYearCommunityContributions(
    participantId: string,
    year: number,
  ): Promise<any> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const { data: contributions } = await supabase
      .from("community_shares")
      .select("*")
      .eq("shared_by", participantId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    return {
      totalShares: contributions?.length || 0,
      types: this.categorizeContributions(contributions || []),
    };
  }

  private categorizeContributions(contributions: any[]): any {
    const types: any = {};
    contributions.forEach((c) => {
      types[c.type] = (types[c.type] || 0) + 1;
    });
    return types;
  }

  private generateNextYearRecommendations(updates: any[]): string[] {
    const latest = updates[updates.length - 1];
    const recommendations: string[] = [];

    // Based on current state
    const lowestState = Object.entries(latest.current_state).sort(
      ([, a], [, b]) => (a as number) - (b as number),
    )[0];

    recommendations.push(
      `Focus on elevating ${lowestState[0].replace(/([A-Z])/g, " $1").toLowerCase()}`,
    );

    // Based on patterns
    if (latest.transformations.inProgress.length > 3) {
      recommendations.push(
        "Complete in-progress transformations before starting new ones",
      );
    }

    recommendations.push("Deepen your elemental practice");
    recommendations.push("Share your wisdom with the community");
    recommendations.push("Consider mentoring newer retreat participants");

    return recommendations;
  }

  private async createAnnualNarrative(
    participantId: string,
    review: any,
  ): Promise<string> {
    // In production, use AI to create narrative
    return `This year has been a profound journey of ${review.transformationMap.totalAreas} transformation areas...`;
  }

  private async getTransformationSummary(participantId: string): Promise<any> {
    const { data: updates } = await supabase
      .from("transformation_updates")
      .select("*")
      .eq("participant_id", participantId)
      .order("created_at", { ascending: false })
      .limit(1);

    return updates?.[0] || {};
  }

  private async generateAnniversaryReflection(
    participantId: string,
    years: number,
  ): Promise<string> {
    return `${years} year${years > 1 ? "s" : ""} of integration and growth. Your journey continues to spiral deeper.`;
  }

  private createAnniversaryInvitation(years: number): string {
    return `Consider joining us for an anniversary integration session or returning for an advanced retreat.`;
  }
}

// Export singleton instance
export const postRetreatService = new PostRetreatService();

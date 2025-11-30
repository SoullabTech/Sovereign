import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  UserHolisticProfile,
  HolisticDomain,
  DevelopmentStage,
  UserState,
  IntegrationArchitecture,
  SpiralProgressPoint,
  BypassingDetection,
  IntegrationGate,
  EmbodiedWisdomTracking,
} from "../core/integration/types";

interface SupabaseUserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  account_type: "user" | "professional" | "mentor" | "researcher" | "admin";
  professional_type?:
    | "therapist"
    | "coach"
    | "spiritual_director"
    | "counselor"
    | "somatic_practitioner";
  current_state: UserState;
  stress_level: number;
  energy_level: number;
  integration_stage: string;
  community_visibility: string;
  professional_support_consent: boolean;
  research_participation_consent: boolean;
  professional_credentials?: any;
  verified_professional: boolean;
  created_at: string;
  updated_at: string;
  last_active: string;
}

interface SupabaseDomainProfile {
  id: string;
  user_id: string;
  domain: HolisticDomain;
  current_level: number;
  development_stage: DevelopmentStage;
  strengths: string[];
  growth_edges: string[];
  practices_engaged: string[];
  last_assessment_date?: string;
  assessment_responses?: any;
  created_at: string;
  updated_at: string;
}

export class SupabaseIntegrationService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // User Profile Management
  async createUserProfile(
    userId: string,
    profileData: Partial<SupabaseUserProfile>,
  ): Promise<SupabaseUserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        display_name: profileData.display_name,
        bio: profileData.bio,
        account_type: profileData.account_type || "user",
        professional_type: profileData.professional_type,
        current_state: profileData.current_state || "balanced",
        stress_level: profileData.stress_level || 5,
        energy_level: profileData.energy_level || 5,
        community_visibility: profileData.community_visibility || "supportive",
        professional_support_consent:
          profileData.professional_support_consent || false,
        research_participation_consent:
          profileData.research_participation_consent || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string): Promise<SupabaseUserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<SupabaseUserProfile>,
  ): Promise<SupabaseUserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Domain Profile Management
  async createDomainProfile(
    userId: string,
    domain: HolisticDomain,
    profileData: any,
  ): Promise<SupabaseDomainProfile> {
    const { data, error } = await this.supabase
      .from("domain_profiles")
      .insert({
        user_id: userId,
        domain,
        current_level: profileData.currentLevel,
        development_stage: profileData.developmentStage,
        strengths: profileData.strengths,
        growth_edges: profileData.growthEdges,
        practices_engaged: profileData.practicesEngaged,
        assessment_responses: profileData.assessmentResponses,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDomainProfiles(userId: string): Promise<SupabaseDomainProfile[]> {
    const { data, error } = await this.supabase
      .from("domain_profiles")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  }

  async updateDomainProfile(
    userId: string,
    domain: HolisticDomain,
    updates: any,
  ): Promise<SupabaseDomainProfile> {
    const { data, error } = await this.supabase
      .from("domain_profiles")
      .update(updates)
      .eq("user_id", userId)
      .eq("domain", domain)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Spiral Progress Tracking
  async createSpiralProgress(userId: string, progressData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("spiral_progress")
      .insert({
        user_id: userId,
        theme: progressData.theme,
        depth: progressData.depth,
        phase: progressData.phase,
        visit_date: progressData.visitDate,
        previous_visits: progressData.previousVisits,
        integration_quality: progressData.integrationQuality,
        real_world_application: progressData.realWorldApplication,
        struggles_encountered: progressData.strugglesEncountered,
        ordinary_moments: progressData.ordinaryMoments,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSpiralProgress(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("spiral_progress")
      .select("*")
      .eq("user_id", userId)
      .order("visit_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async validateSpiralProgress(
    spiralId: string,
    validatorId: string,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("spiral_progress")
      .update({
        community_validated: true,
        validated_by: validatorId,
        validation_date: new Date().toISOString(),
      })
      .eq("id", spiralId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Integration Journey Tracking
  async createIntegrationJourney(
    userId: string,
    journeyData: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("integration_journeys")
      .insert({
        user_id: userId,
        insight_content: journeyData.insightContent,
        content_source: journeyData.contentSource,
        real_world_applications: journeyData.realWorldApplications,
        challenges_encountered: journeyData.challengesEncountered,
        adaptations_made: journeyData.adaptationsMade,
        timeframe: journeyData.timeframe,
        ongoing_practice: journeyData.ongoingPractice,
        integration_evidence: journeyData.integrationEvidence,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIntegrationJourneys(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("integration_journeys")
      .select("*")
      .eq("user_id", userId)
      .order("journey_start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateIntegrationJourney(
    journeyId: string,
    updates: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("integration_journeys")
      .update(updates)
      .eq("id", journeyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Embodied Wisdom Tracking
  async createEmbodiedWisdom(userId: string, wisdomData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("embodied_wisdom")
      .insert({
        user_id: userId,
        type: wisdomData.type,
        title: wisdomData.title,
        description: wisdomData.description,
        somatic_awareness: wisdomData.somaticAwareness,
        physical_practice: wisdomData.physicalPractice,
        body_wisdom: wisdomData.bodyWisdom,
        struggle_details: wisdomData.struggleDetails,
        lessons_learned: wisdomData.lessonsLearned,
        ongoing_challenges: wisdomData.ongoingChallenges,
        humility_developed: wisdomData.humilityDeveloped,
        moment_description: wisdomData.momentDescription,
        awareness_quality: wisdomData.awarenessQuality,
        practice_applied: wisdomData.practiceApplied,
        humanness_acknowledged: wisdomData.humannessAcknowledged,
        practice_name: wisdomData.practiceName,
        frequency: wisdomData.frequency,
        consistency_rating: wisdomData.consistencyRating,
        maintained_days: wisdomData.maintainedDays,
        embodiment_quality: wisdomData.embodimentQuality,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEmbodiedWisdom(userId: string, type?: string): Promise<any[]> {
    let query = this.supabase
      .from("embodied_wisdom")
      .select("*")
      .eq("user_id", userId);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async validateEmbodiedWisdom(
    wisdomId: string,
    validationNotes: string,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("embodied_wisdom")
      .update({
        validated: true,
        validation_notes: validationNotes,
      })
      .eq("id", wisdomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Spiritual Bypassing Detection
  async createBypassingDetection(
    userId: string,
    detectionData: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("bypassing_detections")
      .insert({
        user_id: userId,
        pattern: detectionData.pattern,
        severity: detectionData.severity,
        trigger_events: detectionData.triggerEvents,
        behavior_indicators: detectionData.behaviorIndicators,
        pattern_frequency: detectionData.patternFrequency,
        intervention_recommended: detectionData.interventionRecommended,
        professional_referral_suggested:
          detectionData.professionalReferralSuggested,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBypassingDetections(
    userId: string,
    unaddressedOnly: boolean = false,
  ): Promise<any[]> {
    let query = this.supabase
      .from("bypassing_detections")
      .select("*")
      .eq("user_id", userId);

    if (unaddressedOnly) {
      query = query.eq("addressed", false);
    }

    const { data, error } = await query.order("detected_date", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async addressBypassingDetection(
    detectionId: string,
    resolutionNotes: string,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("bypassing_detections")
      .update({
        addressed: true,
        addressed_date: new Date().toISOString(),
        resolution_notes: resolutionNotes,
      })
      .eq("id", detectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Integration Gates Management
  async createIntegrationGate(userId: string, gateData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("integration_gates")
      .insert({
        user_id: userId,
        content_to_unlock: gateData.contentToUnlock,
        gate_type: gateData.gateType,
        minimum_integration_days: gateData.minimumIntegrationDays,
        requirements: gateData.requirements,
        real_world_application_required: gateData.realWorldApplicationRequired,
        community_validation_required: gateData.communityValidationRequired,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getIntegrationGates(
    userId: string,
    unlockedOnly: boolean = false,
  ): Promise<any[]> {
    let query = this.supabase
      .from("integration_gates")
      .select("*")
      .eq("user_id", userId);

    if (unlockedOnly) {
      query = query.eq("unlocked", false);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async unlockIntegrationGate(gateId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("integration_gates")
      .update({
        unlocked: true,
        unlocked_date: new Date().toISOString(),
      })
      .eq("id", gateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async recordBypassAttempt(gateId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("integration_gates")
      .update({
        bypass_attempts: this.supabase.rpc("increment_bypass_attempts", {
          gate_id: gateId,
        }),
        last_bypass_attempt: new Date().toISOString(),
      })
      .eq("id", gateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reflection Gaps Management
  async createReflectionGap(userId: string, gapData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("reflection_gaps")
      .insert({
        user_id: userId,
        content_id: gapData.contentId,
        minimum_duration_hours: gapData.minimumDurationHours,
        reflection_prompts: gapData.reflectionPrompts,
        reality_check_questions: gapData.realityCheckQuestions,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveReflectionGaps(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("reflection_gaps")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "processing")
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateReflectionGap(gapId: string, updates: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("reflection_gaps")
      .update(updates)
      .eq("id", gapId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Community Interactions
  async createCommunityInteraction(
    userId: string,
    interactionData: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("community_interactions")
      .insert({
        user_id: userId,
        interaction_type: interactionData.interactionType,
        content: interactionData.content,
        context: interactionData.context,
        target_user_id: interactionData.targetUserId,
        group_context: interactionData.groupContext,
        visibility: interactionData.visibility || "supportive",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCommunityInteractions(
    userId?: string,
    interactionType?: string,
  ): Promise<any[]> {
    let query = this.supabase.from("community_interactions").select(`
        *,
        user_profiles!community_interactions_user_id_fkey(display_name, community_visibility)
      `);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (interactionType) {
      query = query.eq("interaction_type", interactionType);
    }

    // Filter by visibility and ensure proper access
    query = query.or(
      `visibility.eq.open,and(visibility.eq.supportive,user_profiles.community_visibility.in.("supportive","open"))`,
    );

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async updateCommunityInteraction(
    interactionId: string,
    updates: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("community_interactions")
      .update(updates)
      .eq("id", interactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Professional Connections
  async createProfessionalConnection(
    userId: string,
    professionalId: string,
    connectionData: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("professional_connections")
      .insert({
        user_id: userId,
        professional_id: professionalId,
        connection_type: connectionData.connectionType,
        initiated_by: connectionData.initiatedBy,
        connection_reason: connectionData.connectionReason,
        platform_integration_consent:
          connectionData.platformIntegrationConsent || false,
        data_sharing_level: connectionData.dataSharingLevel || "minimal",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfessionalConnections(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("professional_connections")
      .select(
        `
        *,
        professional:user_profiles!professional_connections_professional_id_fkey(display_name, professional_type, verified_professional),
        user:user_profiles!professional_connections_user_id_fkey(display_name)
      `,
      )
      .or(`user_id.eq.${userId},professional_id.eq.${userId}`);

    if (error) throw error;
    return data || [];
  }

  async updateProfessionalConnection(
    connectionId: string,
    updates: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("professional_connections")
      .update(updates)
      .eq("id", connectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Content Interaction Tracking
  async trackContentInteraction(
    userId: string,
    interactionData: any,
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("content_interactions")
      .insert({
        user_id: userId,
        content_id: interactionData.contentId,
        content_type: interactionData.contentType,
        content_title: interactionData.contentTitle,
        elemental_association: interactionData.elementalAssociation,
        access_granted: interactionData.accessGranted,
        access_denied_reason: interactionData.accessDeniedReason,
        integration_requirements_met:
          interactionData.integrationRequirementsMet,
        time_spent_minutes: interactionData.timeSpentMinutes,
        completion_percentage: interactionData.completionPercentage,
        grounding_prompts_delivered: interactionData.groundingPromptsDelivered,
        bypassing_warnings_given: interactionData.bypassingWarningsGiven,
        reality_checks_prompted: interactionData.realityChecksPrompted,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getContentInteractions(
    userId: string,
    contentType?: string,
  ): Promise<any[]> {
    let query = this.supabase
      .from("content_interactions")
      .select("*")
      .eq("user_id", userId);

    if (contentType) {
      query = query.eq("content_type", contentType);
    }

    const { data, error } = await query.order("accessed_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  // Analytics (Anonymized)
  async recordAnalytics(userHash: string, analyticsData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("platform_analytics")
      .insert({
        user_hash: userHash,
        cohort_identifier: analyticsData.cohortIdentifier,
        integration_effectiveness_score:
          analyticsData.integrationEffectivenessScore,
        bypassing_reduction_score: analyticsData.bypassingReductionScore,
        community_health_contribution:
          analyticsData.communityHealthContribution,
        long_term_development_trend: analyticsData.longTermDevelopmentTrend,
        session_data: analyticsData.sessionData,
        content_interaction_patterns: analyticsData.contentInteractionPatterns,
        community_participation_patterns:
          analyticsData.communityParticipationPatterns,
        professional_support_utilization:
          analyticsData.professionalSupportUtilization,
        self_reported_wellbeing_change:
          analyticsData.selfReportedWellbeingChange,
        integration_quality_improvement:
          analyticsData.integrationQualityImprovement,
        research_consent: analyticsData.researchConsent,
        data_retention_end_date: analyticsData.dataRetentionEndDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Utility functions for data conversion
  convertToUserHolisticProfile(
    userProfile: SupabaseUserProfile,
    domainProfiles: SupabaseDomainProfile[],
  ): UserHolisticProfile {
    return {
      userId: userProfile.user_id,
      domains: domainProfiles.map((dp) => ({
        domain: dp.domain,
        currentLevel: dp.current_level,
        developmentStage: dp.development_stage,
        strengths: dp.strengths,
        growthEdges: dp.growth_edges,
        practicesEngaged: dp.practices_engaged,
        lastAssessment: dp.last_assessment_date
          ? new Date(dp.last_assessment_date)
          : new Date(),
      })),
      currentState: userProfile.current_state,
      stressLevel: userProfile.stress_level,
      energyLevel: userProfile.energy_level,
      lifeCircumstances: [], // Would need additional table
      preferredLearningStyle: "mixed", // Would need to add to schema
      developmentGoals: [], // Would need additional table
      lastUpdated: new Date(userProfile.updated_at),
    };
  }

  // Helper function to hash user ID for analytics
  async hashUserId(userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer =
      (await globalThis.crypto?.subtle?.digest("SHA-256", data)) ||
      new ArrayBuffer(32);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

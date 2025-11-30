// Switzerland Retreat Onboarding Service
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabaseClient";
import { soullabFounderAgent } from "../core/agents/soullabFounderAgent";
import { PersonalOracleAgent } from "../core/agents/adjusterAgent";
import {
  RetreatParticipant,
  RetreatSession,
  OnboardingFlow,
  OnboardingStep,
} from "../types/retreat";
import { logger } from "../utils/logger";

export class RetreatOnboardingService {
  // Element assignment based on participant energy
  private readonly elementalAssignment = {
    assessDominantElement: (participant: RetreatParticipant): string => {
      // In production, this would use the elemental assessment quiz
      // For now, using a simple algorithm based on registration data
      const elements = ["fire", "water", "earth", "air", "aether"];
      const nameHash =
        participant.firstName.charCodeAt(0) +
        participant.lastName.charCodeAt(0);
      return elements[nameHash % 5];
    },

    getArchetypeForElement: (element: string): string => {
      const archetypes = {
        fire: "Visionary Pioneer",
        water: "Emotional Alchemist",
        earth: "Sacred Builder",
        air: "Wisdom Weaver",
        aether: "Unity Catalyst",
      };
      return archetypes[element as keyof typeof archetypes] || "Soul Guide";
    },
  };

  // Initialize onboarding for new participant
  async initializeOnboarding(
    email: string,
    firstName: string,
    lastName: string,
    retreatId: string,
    arrivalDate: Date,
    departureDate: Date,
  ): Promise<RetreatParticipant> {
    try {
      const participant: RetreatParticipant = {
        id: uuidv4(),
        email,
        firstName,
        lastName,
        onboardingStatus: "registered",
        retreatId,
        arrivalDate,
        departureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in database
      const { error } = await supabase
        .from("retreat_participants")
        .insert(participant);

      if (error) {
        throw new Error(`Failed to create participant: ${error.message}`);
      }

      // Initialize onboarding flow
      await this.createOnboardingFlow(participant.id);

      // Send welcome message
      await this.sendFounderWelcome(participant);

      return participant;
    } catch (error) {
      logger.error("Failed to initialize onboarding", error);
      throw error;
    }
  }

  // Create onboarding flow tracking
  private async createOnboardingFlow(participantId: string): Promise<void> {
    const flow: OnboardingFlow = {
      participantId,
      currentStep: "welcome",
      completedSteps: [],
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
    };

    await supabase.from("onboarding_flows").insert(flow);
  }

  // Send personalized welcome from Kelly
  async sendFounderWelcome(participant: RetreatParticipant): Promise<void> {
    try {
      const welcomeMessage =
        await soullabFounderAgent.generatePersonalWelcome(participant);

      // Store the welcome message
      await supabase.from("retreat_messages").insert({
        participant_id: participant.id,
        type: "founder_welcome",
        content: welcomeMessage.message,
        metadata: welcomeMessage.personalizedElements,
        created_at: new Date(),
      });

      // Update participant status
      await this.updateParticipantStatus(participant.id, "welcomed");

      // Log the welcome
      logger.info("Founder welcome sent", {
        participantId: participant.id,
        name: `${participant.firstName} ${participant.lastName}`,
      });
    } catch (error) {
      logger.error("Failed to send founder welcome", error);
      throw error;
    }
  }

  // Capture participant's current state
  async captureCurrentState(
    participantId: string,
    state: {
      emotionalTone: string;
      energyLevel: number;
      primaryChallenge?: string;
      seekingGuidanceOn?: string[];
    },
  ): Promise<void> {
    try {
      await supabase
        .from("retreat_participants")
        .update({
          currentState: state,
          updatedAt: new Date(),
        })
        .eq("id", participantId);

      // Update onboarding flow
      await this.updateOnboardingStep(participantId, "current_state");

      logger.info("Current state captured", { participantId });
    } catch (error) {
      logger.error("Failed to capture current state", error);
      throw error;
    }
  }

  // Capture retreat intentions
  async captureIntentions(
    participantId: string,
    intentions: {
      primaryIntention: string;
      secondaryIntentions?: string[];
      desiredOutcomes: string[];
      openToExploring?: string[];
    },
  ): Promise<void> {
    try {
      // Get participant
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      if (!participant) {
        throw new Error("Participant not found");
      }

      // Update participant with intentions
      await supabase
        .from("retreat_participants")
        .update({
          retreatIntentions: intentions,
          updatedAt: new Date(),
        })
        .eq("id", participantId);

      // Get founder reflection on intentions
      const reflection = await soullabFounderAgent.reflectOnIntentions(
        participant as RetreatParticipant,
        [
          intentions.primaryIntention,
          ...(intentions.secondaryIntentions || []),
        ],
      );

      // Store the reflection
      await supabase.from("retreat_messages").insert({
        participant_id: participantId,
        type: "intention_reflection",
        content: reflection.content,
        created_at: new Date(),
      });

      // Update onboarding step
      await this.updateOnboardingStep(participantId, "intentions");

      logger.info("Intentions captured and reflected", { participantId });
    } catch (error) {
      logger.error("Failed to capture intentions", error);
      throw error;
    }
  }

  // Assign Personal Oracle Agent
  async assignPersonalOracle(participantId: string): Promise<{
    element: string;
    archetype: string;
    oracleId: string;
  }> {
    try {
      // Get participant
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single();

      if (!participant) {
        throw new Error("Participant not found");
      }

      // Determine elemental assignment
      const element = this.elementalAssignment.assessDominantElement(
        participant as RetreatParticipant,
      );
      const archetype =
        this.elementalAssignment.getArchetypeForElement(element);
      const oracleId = uuidv4();

      // Update participant with Oracle assignment
      await supabase
        .from("retreat_participants")
        .update({
          personalOracleId: oracleId,
          oracleElement: element,
          oracleArchetype: archetype,
          oracleAssignedAt: new Date(),
          onboardingStatus: "oracle_assigned",
          updatedAt: new Date(),
        })
        .eq("id", participantId);

      // Get introduction from founder
      const introduction = await soullabFounderAgent.introducePersonalOracle(
        participant as RetreatParticipant,
        element,
        archetype,
      );

      // Store the introduction
      await supabase.from("retreat_messages").insert({
        participant_id: participantId,
        type: "oracle_introduction",
        content: introduction.content,
        metadata: { element, archetype, oracleId },
        created_at: new Date(),
      });

      // Create Personal Oracle instance (would be stored in production)
      await this.createPersonalOracleInstance(
        oracleId,
        participantId,
        element,
        archetype,
      );

      // Update onboarding step
      await this.updateOnboardingStep(participantId, "oracle_assignment");

      logger.info("Personal Oracle assigned", {
        participantId,
        element,
        archetype,
        oracleId,
      });

      return { element, archetype, oracleId };
    } catch (error) {
      logger.error("Failed to assign Personal Oracle", error);
      throw error;
    }
  }

  // Create Personal Oracle instance
  private async createPersonalOracleInstance(
    oracleId: string,
    participantId: string,
    element: string,
    archetype: string,
  ): Promise<void> {
    // In production, this would create a personalized Oracle configuration
    await supabase.from("personal_oracles").insert({
      id: oracleId,
      participant_id: participantId,
      element,
      archetype,
      configuration: {
        voiceTone: this.getVoiceToneForElement(element),
        guidanceStyle: this.getGuidanceStyleForArchetype(archetype),
        personalizations: {},
      },
      created_at: new Date(),
    });
  }

  // Get voice tone for element
  private getVoiceToneForElement(element: string): string {
    const tones = {
      fire: "inspiring and energetic",
      water: "flowing and intuitive",
      earth: "grounding and practical",
      air: "clear and insightful",
      aether: "integrative and transcendent",
    };
    return tones[element as keyof typeof tones] || "balanced and wise";
  }

  // Get guidance style for archetype
  private getGuidanceStyleForArchetype(archetype: string): string {
    const styles = {
      "Visionary Pioneer": "future-focused and innovative",
      "Emotional Alchemist": "deep feeling and transformative",
      "Sacred Builder": "structured and manifestation-oriented",
      "Wisdom Weaver": "conceptual and connective",
      "Unity Catalyst": "holistic and synthesizing",
    };
    return (
      styles[archetype as keyof typeof styles] || "adaptive and supportive"
    );
  }

  // Complete onboarding
  async completeOnboarding(participantId: string): Promise<void> {
    try {
      await supabase
        .from("retreat_participants")
        .update({
          onboardingStatus: "completed",
          updatedAt: new Date(),
        })
        .eq("id", participantId);

      // Update onboarding flow
      await this.updateOnboardingStep(participantId, "confirmation");

      // Send completion message
      await this.sendOnboardingComplete(participantId);

      logger.info("Onboarding completed", { participantId });
    } catch (error) {
      logger.error("Failed to complete onboarding", error);
      throw error;
    }
  }

  // Send onboarding completion message
  private async sendOnboardingComplete(participantId: string): Promise<void> {
    const { data: participant } = await supabase
      .from("retreat_participants")
      .select("*")
      .eq("id", participantId)
      .single();

    if (!participant) return;

    const message = `Dear ${participant.firstName},

Your sacred journey preparation is complete.

You've been welcomed by Kelly, shared your intentions, met your Personal Oracle (${participant.oracleElement} - ${participant.oracleArchetype}), and set your container for transformation.

As you prepare for Switzerland, know that:
- Your Oracle is already working with your energy
- The retreat container is being woven with your intentions
- The mountains are calling you home

Until we meet in person, your Oracle is available for guidance and support.

With love and anticipation,
The Soullab Team 🌀`;

    await supabase.from("retreat_messages").insert({
      participant_id: participantId,
      type: "onboarding_complete",
      content: message,
      created_at: new Date(),
    });
  }

  // Update participant status
  private async updateParticipantStatus(
    participantId: string,
    status: RetreatParticipant["onboardingStatus"],
  ): Promise<void> {
    await supabase
      .from("retreat_participants")
      .update({
        onboardingStatus: status,
        updatedAt: new Date(),
      })
      .eq("id", participantId);
  }

  // Update onboarding step
  private async updateOnboardingStep(
    participantId: string,
    step: OnboardingStep,
  ): Promise<void> {
    const { data: flow } = await supabase
      .from("onboarding_flows")
      .select("*")
      .eq("participant_id", participantId)
      .single();

    if (!flow) return;

    const completedSteps = flow.completedSteps || [];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    await supabase
      .from("onboarding_flows")
      .update({
        currentStep: step,
        completedSteps,
        lastUpdatedAt: new Date(),
      })
      .eq("participant_id", participantId);
  }

  // Get retreat overview
  async getRetreatOverview(retreatId: string): Promise<RetreatSession | null> {
    const { data } = await supabase
      .from("retreat_sessions")
      .select("*")
      .eq("id", retreatId)
      .single();

    return data;
  }

  // Get participant progress
  async getParticipantProgress(participantId: string): Promise<{
    participant: RetreatParticipant;
    onboardingFlow: OnboardingFlow;
    messages: any[];
  }> {
    const [participantResult, flowResult, messagesResult] = await Promise.all([
      supabase
        .from("retreat_participants")
        .select("*")
        .eq("id", participantId)
        .single(),
      supabase
        .from("onboarding_flows")
        .select("*")
        .eq("participant_id", participantId)
        .single(),
      supabase
        .from("retreat_messages")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false }),
    ]);

    return {
      participant: participantResult.data as RetreatParticipant,
      onboardingFlow: flowResult.data as OnboardingFlow,
      messages: messagesResult.data || [],
    };
  }
}

// Export singleton instance
export const retreatOnboardingService = new RetreatOnboardingService();

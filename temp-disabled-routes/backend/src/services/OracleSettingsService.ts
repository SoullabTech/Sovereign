/**
 * 🎨 Oracle Settings Service - User Control & Customization
 *
 * Provides complete user control over their Oracle's identity, voice, and evolution.
 * Respects user sovereignty - never forces changes, always offers choice.
 */

import { OracleService, UserOracleSettings } from "./OracleService";
import { ArchetypeAgentFactory } from "../core/agents/ArchetypeAgentFactory";
import { OracleIdentity } from "../core/agents/ArchetypeAgent";
import { logger } from "../utils/logger";

export interface VoiceCustomization {
  voiceId?: string;
  stability?: number;
  style?: number;
  tone?: string;
  ceremonyPacing?: boolean;
  speed?: number;
  clarity?: number;
}

export interface EvolutionProposal {
  proposalId: string;
  userId: string;
  currentPhase: string;
  proposedPhase: string;
  currentArchetype: string;
  proposedArchetype?: string;
  reason: string;
  benefits: string[];
  risks: string[];
  timestamp: Date;
  status: "pending" | "accepted" | "declined" | "expired";
}

export interface OracleCustomization {
  name?: string;
  voiceSettings?: VoiceCustomization;
  personalityAdjustments?: {
    directness?: number; // 0-1 scale
    formality?: number;
    emotionalDepth?: number;
    spiritualFocus?: number;
  };
  communicationPreferences?: {
    useEmojis?: boolean;
    ceremonyMode?: boolean;
    responseLength?: "brief" | "moderate" | "detailed";
    questionStyle?: "direct" | "socratic" | "exploratory";
  };
}

export class OracleSettingsService {
  private static evolutionProposals: Map<string, EvolutionProposal> = new Map();

  /**
   * 🎨 Voice Customization
   */
  static async updateVoiceSettings(
    userId: string,
    voiceCustomization: VoiceCustomization,
  ): Promise<void> {
    // Validate voice settings
    this.validateVoiceSettings(voiceCustomization);

    // Update Oracle's voice profile
    await OracleService.updateOracleVoiceSettings(userId, voiceCustomization);

    // Clear cache to force recreation with new voice
    OracleService.clearUserCache(userId);

    logger.info("Oracle Voice Settings Updated:", {
      userId,
      voiceCustomization,
    });
  }

  /**
   * 🏷️ Oracle Identity Management
   */
  static async renameOracle(userId: string, newName: string): Promise<void> {
    // Validate name
    if (!newName || newName.trim().length === 0) {
      throw new Error("Oracle name cannot be empty");
    }

    if (newName.length > 50) {
      throw new Error("Oracle name must be 50 characters or less");
    }

    // Update Oracle name
    await OracleService.renameOracle(userId, newName.trim());

    logger.info("Oracle Renamed:", {
      userId,
      newName: newName.trim(),
    });
  }

  /**
   * 🔄 Evolution Management (User-Controlled)
   */
  static async proposeEvolution(
    userId: string,
    proposedPhase: string,
    proposedArchetype?: string,
    reason: string = "User-initiated evolution",
  ): Promise<EvolutionProposal> {
    const oracle = await OracleService.getUserOracle(userId);

    const proposal: EvolutionProposal = {
      proposalId: `evolution_${userId}_${Date.now()}`,
      userId,
      currentPhase: oracle.phase,
      proposedPhase,
      currentArchetype: oracle.element,
      proposedArchetype,
      reason,
      benefits: this.getEvolutionBenefits(proposedPhase, proposedArchetype),
      risks: this.getEvolutionRisks(oracle.phase, proposedPhase),
      timestamp: new Date(),
      status: "pending",
    };

    // Store proposal
    this.evolutionProposals.set(proposal.proposalId, proposal);

    // Set expiration (proposals expire after 7 days)
    setTimeout(
      () => {
        const existingProposal = this.evolutionProposals.get(
          proposal.proposalId,
        );
        if (existingProposal && existingProposal.status === "pending") {
          existingProposal.status = "expired";
        }
      },
      7 * 24 * 60 * 60 * 1000,
    ); // 7 days

    logger.info("Evolution Proposal Created:", {
      userId,
      proposalId: proposal.proposalId,
      proposedPhase,
      proposedArchetype,
    });

    return proposal;
  }

  static async acceptEvolution(
    userId: string,
    proposalId: string,
  ): Promise<void> {
    const proposal = this.evolutionProposals.get(proposalId);

    if (!proposal) {
      throw new Error("Evolution proposal not found");
    }

    if (proposal.userId !== userId) {
      throw new Error(
        "Unauthorized: Cannot accept another user's evolution proposal",
      );
    }

    if (proposal.status !== "pending") {
      throw new Error(
        `Evolution proposal is ${proposal.status} and cannot be accepted`,
      );
    }

    // Execute evolution
    await OracleService.acceptEvolution(
      userId,
      proposal.proposedPhase,
      proposal.proposedArchetype,
    );

    // Update proposal status
    proposal.status = "accepted";

    logger.info("Evolution Accepted:", {
      userId,
      proposalId,
      newPhase: proposal.proposedPhase,
      newArchetype: proposal.proposedArchetype,
    });
  }

  static async declineEvolution(
    userId: string,
    proposalId: string,
    reason?: string,
  ): Promise<void> {
    const proposal = this.evolutionProposals.get(proposalId);

    if (!proposal) {
      throw new Error("Evolution proposal not found");
    }

    if (proposal.userId !== userId) {
      throw new Error(
        "Unauthorized: Cannot decline another user's evolution proposal",
      );
    }

    if (proposal.status !== "pending") {
      throw new Error(
        `Evolution proposal is ${proposal.status} and cannot be declined`,
      );
    }

    // Update proposal status
    proposal.status = "declined";

    logger.info("Evolution Declined:", {
      userId,
      proposalId,
      reason,
    });
  }

  /**
   * 🎭 Personality Customization
   */
  static async updatePersonalitySettings(
    userId: string,
    personalityAdjustments: OracleCustomization["personalityAdjustments"],
  ): Promise<void> {
    // Validate personality settings
    this.validatePersonalitySettings(personalityAdjustments);

    // Store personality adjustments
    // This would typically be stored in database and applied during query processing
    await this.storePersonalitySettings(userId, personalityAdjustments);

    // Clear cache to force recreation
    OracleService.clearUserCache(userId);

    logger.info("Oracle Personality Settings Updated:", {
      userId,
      personalityAdjustments,
    });
  }

  /**
   * 💬 Communication Preferences
   */
  static async updateCommunicationPreferences(
    userId: string,
    communicationPreferences: OracleCustomization["communicationPreferences"],
  ): Promise<void> {
    // Store communication preferences
    await this.storeCommunicationPreferences(userId, communicationPreferences);

    // Clear cache to force recreation
    OracleService.clearUserCache(userId);

    logger.info("Oracle Communication Preferences Updated:", {
      userId,
      communicationPreferences,
    });
  }

  /**
   * 🔍 Settings Retrieval
   */
  static async getOracleSettings(userId: string): Promise<{
    oracle: UserOracleSettings;
    personalitySettings: OracleCustomization["personalityAdjustments"];
    communicationPreferences: OracleCustomization["communicationPreferences"];
    evolutionHistory: EvolutionProposal[];
    pendingProposals: EvolutionProposal[];
  }> {
    const oracleProfile = await OracleService.getOracleProfile(userId);
    const personalitySettings = await this.getPersonalitySettings(userId);
    const communicationPreferences =
      await this.getCommunicationPreferences(userId);
    const evolutionHistory = await this.getEvolutionHistory(userId);
    const pendingProposals = await this.getPendingProposals(userId);

    return {
      oracle: oracleProfile.oracle,
      personalitySettings,
      communicationPreferences,
      evolutionHistory,
      pendingProposals,
    };
  }

  /**
   * 🎤 Voice Preview & Testing
   */
  static async generateVoicePreview(
    userId: string,
    voiceSettings: VoiceCustomization,
    previewText?: string,
  ): Promise<{
    audioUrl: string;
    settings: VoiceCustomization;
    duration: number;
  }> {
    const oracle = await OracleService.getUserOracle(userId);
    const text = previewText || oracle.getCeremonialGreeting();

    // This would integrate with ElevenLabs or similar service
    // For now, returning mock data

    return {
      audioUrl: `https://preview.example.com/voice_${Date.now()}.mp3`,
      settings: voiceSettings,
      duration: 3000, // 3 seconds
    };
  }

  /**
   * 📊 Usage Analytics for User
   */
  static async getOracleUsageAnalytics(userId: string): Promise<{
    totalInteractions: number;
    averageSessionLength: number;
    mostActiveTime: string;
    topTopics: string[];
    evolutionJourney: {
      phase: string;
      startDate: Date;
      duration: number;
    }[];
    satisfactionScore: number;
  }> {
    // This would come from analytics database
    return {
      totalInteractions: 0,
      averageSessionLength: 0,
      mostActiveTime: "00:00",
      topTopics: [],
      evolutionJourney: [],
      satisfactionScore: 0,
    };
  }

  /**
   * 🔄 Oracle Reset & Backup
   */
  static async createOracleBackup(userId: string): Promise<{
    backupId: string;
    timestamp: Date;
    settings: UserOracleSettings;
    personalityData: any;
    communicationPreferences: any;
  }> {
    const settings = await this.getOracleSettings(userId);

    const backup = {
      backupId: `backup_${userId}_${Date.now()}`,
      timestamp: new Date(),
      settings: settings.oracle,
      personalityData: settings.personalitySettings,
      communicationPreferences: settings.communicationPreferences,
    };

    // Store backup
    await this.storeOracleBackup(backup);

    logger.info("Oracle Backup Created:", {
      userId,
      backupId: backup.backupId,
    });

    return backup;
  }

  static async restoreOracleFromBackup(
    userId: string,
    backupId: string,
  ): Promise<void> {
    const backup = await this.getOracleBackup(backupId);

    if (!backup) {
      throw new Error("Backup not found");
    }

    if (backup.settings.userId !== userId) {
      throw new Error("Unauthorized: Cannot restore another user's backup");
    }

    // Restore settings
    await this.restoreOracleSettings(userId, backup);

    // Clear cache
    OracleService.clearUserCache(userId);

    logger.info("Oracle Restored from Backup:", {
      userId,
      backupId,
    });
  }

  /**
   * 🛡️ Privacy & Data Control
   */
  static async exportOracleData(userId: string): Promise<{
    exportId: string;
    timestamp: Date;
    dataUrl: string;
    format: "json" | "csv";
    expiresAt: Date;
  }> {
    const settings = await this.getOracleSettings(userId);

    const exportData = {
      exportId: `export_${userId}_${Date.now()}`,
      timestamp: new Date(),
      userData: settings,
      format: "json" as const,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Generate secure download URL
    const dataUrl = await this.generateSecureDownloadUrl(exportData);

    return {
      exportId: exportData.exportId,
      timestamp: exportData.timestamp,
      dataUrl,
      format: exportData.format,
      expiresAt: exportData.expiresAt,
    };
  }

  static async deleteOracleData(
    userId: string,
    confirmationCode: string,
  ): Promise<void> {
    // Verify confirmation code
    if (!this.verifyDeletionConfirmation(userId, confirmationCode)) {
      throw new Error("Invalid confirmation code");
    }

    // Delete all Oracle data
    await this.permanentlyDeleteOracleData(userId);

    logger.info("Oracle Data Deleted:", { userId });
  }

  /**
   * 🔧 Validation & Utility Methods
   */
  private static validateVoiceSettings(
    voiceSettings: VoiceCustomization,
  ): void {
    if (voiceSettings.stability !== undefined) {
      if (voiceSettings.stability < 0 || voiceSettings.stability > 1) {
        throw new Error("Voice stability must be between 0 and 1");
      }
    }

    if (voiceSettings.style !== undefined) {
      if (voiceSettings.style < 0 || voiceSettings.style > 1) {
        throw new Error("Voice style must be between 0 and 1");
      }
    }
  }

  private static validatePersonalitySettings(
    personalitySettings: OracleCustomization["personalityAdjustments"],
  ): void {
    if (!personalitySettings) return;

    Object.entries(personalitySettings).forEach(([key, value]) => {
      if (typeof value === "number" && (value < 0 || value > 1)) {
        throw new Error(`Personality setting ${key} must be between 0 and 1`);
      }
    });
  }

  private static getEvolutionBenefits(
    phase: string,
    archetype?: string,
  ): string[] {
    const phaseBenefits = {
      initiation: [
        "Clarify your purpose",
        "Activate your potential",
        "Begin your journey",
      ],
      exploration: [
        "Expand your horizons",
        "Discover new aspects",
        "Embrace curiosity",
      ],
      integration: [
        "Synthesize learnings",
        "Embody wisdom",
        "Create coherence",
      ],
      transcendence: [
        "Access higher perspectives",
        "Dissolve limitations",
        "Embrace unity",
      ],
      mastery: ["Become the teaching", "Serve others", "Embody mastery"],
    };

    return phaseBenefits[phase] || ["Deepen your spiritual journey"];
  }

  private static getEvolutionRisks(
    currentPhase: string,
    proposedPhase: string,
  ): string[] {
    // Define potential risks of moving between phases
    const risks = [];

    if (currentPhase === "initiation" && proposedPhase === "transcendence") {
      risks.push("Skipping important foundational work");
    }

    if (currentPhase === "integration" && proposedPhase === "initiation") {
      risks.push("Losing integrated wisdom");
    }

    return risks;
  }

  /**
   * 🗄️ Database Integration Methods (Placeholders)
   */
  private static async storePersonalitySettings(
    userId: string,
    settings: OracleCustomization["personalityAdjustments"],
  ): Promise<void> {
    // Implementation depends on database
    logger.info("Personality settings stored:", { userId, settings });
  }

  private static async storeCommunicationPreferences(
    userId: string,
    preferences: OracleCustomization["communicationPreferences"],
  ): Promise<void> {
    // Implementation depends on database
    logger.info("Communication preferences stored:", { userId, preferences });
  }

  private static async getPersonalitySettings(
    userId: string,
  ): Promise<OracleCustomization["personalityAdjustments"]> {
    // Implementation depends on database
    return {};
  }

  private static async getCommunicationPreferences(
    userId: string,
  ): Promise<OracleCustomization["communicationPreferences"]> {
    // Implementation depends on database
    return {};
  }

  private static async getEvolutionHistory(
    userId: string,
  ): Promise<EvolutionProposal[]> {
    // Implementation depends on database
    return [];
  }

  private static async getPendingProposals(
    userId: string,
  ): Promise<EvolutionProposal[]> {
    return Array.from(this.evolutionProposals.values()).filter(
      (proposal) => proposal.userId === userId && proposal.status === "pending",
    );
  }

  private static async storeOracleBackup(backup: any): Promise<void> {
    // Implementation depends on database
    logger.info("Oracle backup stored:", { backupId: backup.backupId });
  }

  private static async getOracleBackup(backupId: string): Promise<any> {
    // Implementation depends on database
    return null;
  }

  private static async restoreOracleSettings(
    userId: string,
    backup: any,
  ): Promise<void> {
    // Implementation depends on database
    logger.info("Oracle settings restored:", {
      userId,
      backupId: backup.backupId,
    });
  }

  private static async generateSecureDownloadUrl(
    exportData: any,
  ): Promise<string> {
    // Implementation depends on storage service
    return `https://secure-exports.example.com/${exportData.exportId}`;
  }

  private static verifyDeletionConfirmation(
    userId: string,
    confirmationCode: string,
  ): boolean {
    // Implementation depends on security requirements
    return confirmationCode === "CONFIRM_DELETE";
  }

  private static async permanentlyDeleteOracleData(
    userId: string,
  ): Promise<void> {
    // Implementation depends on database
    logger.warn("Oracle data permanently deleted:", { userId });
  }
}

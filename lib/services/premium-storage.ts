// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/utils/encryption';
import path from 'path';
import fs from 'fs/promises';
import archiver from 'archiver';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export interface StorageEstimate {
  current_usage_gb: number;
  projected_annual_gb: number;
  recommended_tier: string;
  storage_optimization_suggestions: string[];
}

export interface ConversationAnalysisData {
  consciousness_level: number;
  archetype_patterns: Record<string, any>;
  shadow_work_insights: string[];
  sacred_geometry_connections: Record<string, any>;
  developmental_stage: string;
  transformation_indicators: Record<string, any>;
}

export class PremiumStorageService {
  private static instance: PremiumStorageService;
  private readonly storageBasePath = '/maia/premium_storage';

  static getInstance(): PremiumStorageService {
    if (!PremiumStorageService.instance) {
      PremiumStorageService.instance = new PremiumStorageService();
    }
    return PremiumStorageService.instance;
  }

  /**
   * Initialize premium storage for a user
   */
  async initializePremiumStorage(
    userId: string,
    subscriptionTier: string,
    preferences?: Partial<{
      localStorageEnabled: boolean;
      cloudBackupEnabled: boolean;
      userControlledEncryption: boolean;
      zeroKnowledgeStorage: boolean;
    }>
  ) {
    const config = await prisma.premiumMemberStorage.upsert({
      where: { userId },
      create: {
        userId,
        subscriptionTier,
        localStorageEnabled: preferences?.localStorageEnabled ?? true,
        cloudBackupEnabled: preferences?.cloudBackupEnabled ?? false,
        userControlledEncryption: preferences?.userControlledEncryption ?? true,
        zeroKnowledgeStorage: preferences?.zeroKnowledgeStorage ?? true,
        dataRetentionYears: this.getRetentionYears(subscriptionTier),
        maxStorageGB: this.getStorageLimit(subscriptionTier),
        compressionEnabled: true,
        autoArchiveOlderThan: subscriptionTier === 'eternal' ? null : 730, // 2 years
      },
      update: {
        subscriptionTier,
        ...preferences,
        maxStorageGB: this.getStorageLimit(subscriptionTier),
        dataRetentionYears: this.getRetentionYears(subscriptionTier),
      },
    });

    // Create user storage directory
    if (config.localStorageEnabled) {
      await this.ensureUserStorageDirectory(userId);
    }

    return config;
  }

  /**
   * Store enhanced conversation with consciousness analysis
   */
  async storeEnhancedConversation(
    userId: string,
    conversationId: string,
    analysisData: ConversationAnalysisData,
    fullTranscript: string
  ) {
    const storage = await this.getPremiumStorage(userId);
    if (!storage) {
      throw new Error('Premium storage not initialized for user');
    }

    // Store enhanced analysis
    const analysis = await prisma.enhancedConversationAnalysis.create({
      data: {
        userId,
        conversationId,
        consciousnessLevel: analysisData.consciousness_level,
        archetypePatterns: analysisData.archetype_patterns,
        shadowWorkInsights: analysisData.shadow_work_insights,
        sacredGeometryConnections: analysisData.sacred_geometry_connections,
        developmentalStage: analysisData.developmental_stage,
        transformationIndicators: analysisData.transformation_indicators,
        fullTranscriptHash: createHash('sha256').update(fullTranscript).digest('hex'),
      },
    });

    // Store encrypted transcript locally if enabled
    if (storage.localStorageEnabled) {
      await this.storeEncryptedTranscript(userId, conversationId, fullTranscript, storage.userControlledEncryption);
    }

    return analysis;
  }

  /**
   * Generate consciousness journey map
   */
  async generateConsciousnessJourney(userId: string): Promise<any> {
    const analyses = await prisma.enhancedConversationAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (analyses.length === 0) {
      return null;
    }

    // Process consciousness journey progression
    const journeyData = {
      consciousness_progression: this.analyzeConsciousnessProgression(analyses),
      archetype_evolution: this.analyzeArchetypeEvolution(analyses),
      shadow_integration: this.analyzeShadowIntegration(analyses),
      sacred_geometry_patterns: this.analyzeSacredGeometryPatterns(analyses),
      transformation_milestones: this.identifyTransformationMilestones(analyses),
    };

    // Store journey map
    const journeyMap = await prisma.consciousnessJourneyMap.create({
      data: {
        userId,
        journeyData,
        consciousnessProgression: journeyData.consciousness_progression,
        archetypeEvolution: journeyData.archetype_evolution,
        shadowIntegration: journeyData.shadow_integration,
        sacredGeometryPatterns: journeyData.sacred_geometry_patterns,
        transformationMilestones: journeyData.transformation_milestones,
        sessionCount: analyses.length,
        averageConsciousnessLevel: this.calculateAverageConsciousness(analyses),
        latestDevelopmentalStage: analyses[analyses.length - 1]?.developmentalStage || 'unknown',
      },
    });

    return journeyMap;
  }

  /**
   * Create export archive for user
   */
  async createExportArchive(userId: string, exportType: 'full' | 'conversations' | 'journey_maps' | 'analysis'): Promise<string> {
    const storage = await this.getPremiumStorage(userId);
    if (!storage) {
      throw new Error('Premium storage not initialized');
    }

    const exportData = await this.gatherExportData(userId, exportType);
    const archiveFileName = `maia_export_${userId}_${exportType}_${Date.now()}.zip`;
    const archivePath = path.join(await this.getUserStoragePath(userId), 'exports', archiveFileName);

    // Create encrypted archive
    await this.createEncryptedArchive(exportData, archivePath, storage.userControlledEncryption);

    // Store export record
    const exportRecord = await prisma.exportArchive.create({
      data: {
        userId,
        exportType,
        fileName: archiveFileName,
        filePath: archivePath,
        fileSizeBytes: (await fs.stat(archivePath)).size,
        isEncrypted: storage.userControlledEncryption,
        compressionRatio: 0.7, // Estimated compression
        exportMetadata: {
          exportType,
          recordCount: exportData.recordCount,
          dateRange: exportData.dateRange,
          includedDataTypes: exportData.includedDataTypes,
        },
      },
    });

    return archivePath;
  }

  /**
   * Estimate user storage needs
   */
  async estimateUserStorageNeeds(userId: string): Promise<StorageEstimate> {
    const currentUsage = await this.calculateCurrentUsage(userId);
    const projectedGrowth = await this.projectGrowthPattern(userId, currentUsage);

    return {
      current_usage_gb: currentUsage.total / (1024 * 1024 * 1024),
      projected_annual_gb: projectedGrowth.annual,
      recommended_tier: this.recommendTier(projectedGrowth.annual),
      storage_optimization_suggestions: this.getOptimizationSuggestions(currentUsage),
    };
  }

  /**
   * Manage data lifecycle and archiving
   */
  async manageDataLifecycle(userId: string): Promise<void> {
    const storage = await this.getPremiumStorage(userId);
    if (!storage) return;

    const currentUsage = await this.calculateCurrentUsage(userId);

    // Auto-archive old conversations if near storage limit
    if (currentUsage.total > storage.maxStorageGB * 0.8 * 1024 * 1024 * 1024) {
      await this.archiveOldConversations(userId, storage.autoArchiveOlderThan);
    }

    // Clean up old exports if enabled
    if (storage.autoCleanupOldExports) {
      await this.cleanupOldExports(userId, storage.exportRetentionDays || 90);
    }
  }

  // Private helper methods

  private getRetentionYears(tier: string): number {
    const retentionMap: Record<string, number> = {
      pioneer: 2,
      seeker: 5,
      alchemist: 10,
      sage: 25,
      eternal: 999,
    };
    return retentionMap[tier] || 2;
  }

  private getStorageLimit(tier: string): number {
    const limitMap: Record<string, number> = {
      pioneer: 10,    // 10GB
      seeker: 50,     // 50GB
      alchemist: 200, // 200GB
      sage: 1000,     // 1TB
      eternal: 10000, // 10TB
    };
    return limitMap[tier] || 10;
  }

  private async ensureUserStorageDirectory(userId: string): Promise<void> {
    const userPath = await this.getUserStoragePath(userId);
    await fs.mkdir(path.join(userPath, 'conversations'), { recursive: true });
    await fs.mkdir(path.join(userPath, 'exports'), { recursive: true });
    await fs.mkdir(path.join(userPath, 'backups'), { recursive: true });
    await fs.mkdir(path.join(userPath, 'journey_maps'), { recursive: true });
  }

  private async getUserStoragePath(userId: string): Promise<string> {
    const hashedUserId = createHash('sha256').update(userId).digest('hex').slice(0, 16);
    return path.join(this.storageBasePath, hashedUserId);
  }

  private async getPremiumStorage(userId: string) {
    return await prisma.premiumMemberStorage.findUnique({
      where: { userId },
    });
  }

  private async storeEncryptedTranscript(
    userId: string,
    conversationId: string,
    transcript: string,
    encryptionEnabled: boolean
  ): Promise<void> {
    const userPath = await this.getUserStoragePath(userId);
    const transcriptPath = path.join(userPath, 'conversations', `${conversationId}.json`);

    const data = {
      conversationId,
      transcript,
      timestamp: new Date().toISOString(),
      encrypted: encryptionEnabled,
    };

    const content = encryptionEnabled ?
      await encrypt(JSON.stringify(data)) :
      JSON.stringify(data);

    await fs.writeFile(transcriptPath, content, 'utf8');
  }

  private analyzeConsciousnessProgression(analyses: any[]): any[] {
    return analyses.map(a => ({
      timestamp: a.createdAt,
      level: a.consciousnessLevel,
      stage: a.developmentalStage,
    }));
  }

  private analyzeArchetypeEvolution(analyses: any[]): any {
    // Analyze how archetypes evolve over time
    const evolution: Record<string, any[]> = {};
    analyses.forEach(a => {
      Object.keys(a.archetypePatterns || {}).forEach(archetype => {
        if (!evolution[archetype]) evolution[archetype] = [];
        evolution[archetype].push({
          timestamp: a.createdAt,
          strength: a.archetypePatterns[archetype],
        });
      });
    });
    return evolution;
  }

  private analyzeShadowIntegration(analyses: any[]): any[] {
    return analyses.map(a => ({
      timestamp: a.createdAt,
      insights: a.shadowWorkInsights || [],
      integration_depth: (a.shadowWorkInsights || []).length,
    }));
  }

  private analyzeSacredGeometryPatterns(analyses: any[]): any {
    // Analyze sacred geometry pattern emergence
    const patterns: Record<string, number> = {};
    analyses.forEach(a => {
      Object.keys(a.sacredGeometryConnections || {}).forEach(pattern => {
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      });
    });
    return patterns;
  }

  private identifyTransformationMilestones(analyses: any[]): any[] {
    const milestones: any[] = [];

    // Identify consciousness level jumps
    for (let i = 1; i < analyses.length; i++) {
      const prev = analyses[i - 1];
      const curr = analyses[i];

      if (curr.consciousnessLevel > prev.consciousnessLevel + 10) {
        milestones.push({
          type: 'consciousness_breakthrough',
          timestamp: curr.createdAt,
          from_level: prev.consciousnessLevel,
          to_level: curr.consciousnessLevel,
          associated_insights: curr.shadowWorkInsights,
        });
      }
    }

    return milestones;
  }

  private calculateAverageConsciousness(analyses: any[]): number {
    if (analyses.length === 0) return 0;
    const sum = analyses.reduce((acc, a) => acc + (a.consciousnessLevel || 0), 0);
    return sum / analyses.length;
  }

  private async gatherExportData(userId: string, exportType: string): Promise<any> {
    const data: any = { recordCount: 0, dateRange: {}, includedDataTypes: [] };

    switch (exportType) {
      case 'full':
        data.conversations = await prisma.enhancedConversationAnalysis.findMany({
          where: { userId },
        });
        data.journeyMaps = await prisma.consciousnessJourneyMap.findMany({
          where: { userId },
        });
        data.includedDataTypes = ['conversations', 'analysis', 'journey_maps'];
        data.recordCount = data.conversations.length + data.journeyMaps.length;
        break;

      case 'conversations':
        data.conversations = await prisma.enhancedConversationAnalysis.findMany({
          where: { userId },
        });
        data.includedDataTypes = ['conversations', 'analysis'];
        data.recordCount = data.conversations.length;
        break;

      case 'journey_maps':
        data.journeyMaps = await prisma.consciousnessJourneyMap.findMany({
          where: { userId },
        });
        data.includedDataTypes = ['journey_maps'];
        data.recordCount = data.journeyMaps.length;
        break;
    }

    return data;
  }

  private async createEncryptedArchive(data: any, archivePath: string, encrypted: boolean): Promise<void> {
    // Create archive directory if it doesn't exist
    await fs.mkdir(path.dirname(archivePath), { recursive: true });

    // For now, create a simple JSON export
    const content = encrypted ?
      await encrypt(JSON.stringify(data, null, 2)) :
      JSON.stringify(data, null, 2);

    await fs.writeFile(archivePath, content, 'utf8');
  }

  private async calculateCurrentUsage(userId: string): Promise<{ total: number; breakdown: Record<string, number> }> {
    const userPath = await this.getUserStoragePath(userId);
    const breakdown: Record<string, number> = {};
    let total = 0;

    try {
      // Check conversations directory
      const conversationsPath = path.join(userPath, 'conversations');
      const convStats = await this.getDirectorySize(conversationsPath);
      breakdown.conversations = convStats;
      total += convStats;

      // Check exports directory
      const exportsPath = path.join(userPath, 'exports');
      const exportStats = await this.getDirectorySize(exportsPath);
      breakdown.exports = exportStats;
      total += exportStats;

      // Check backups directory
      const backupsPath = path.join(userPath, 'backups');
      const backupStats = await this.getDirectorySize(backupsPath);
      breakdown.backups = backupStats;
      total += backupStats;

    } catch (error) {
      // Directory doesn't exist yet
    }

    return { total, breakdown };
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const files = await fs.readdir(dirPath);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return totalSize;
    } catch {
      return 0;
    }
  }

  private async projectGrowthPattern(userId: string, currentUsage: any): Promise<{ annual: number }> {
    // Simple projection based on current usage and subscription tier
    const storage = await this.getPremiumStorage(userId);
    const dailyEstimate = this.getDailyStorageEstimate(storage?.subscriptionTier || 'pioneer');

    return {
      annual: (dailyEstimate * 365) / (1024 * 1024 * 1024), // Convert to GB
    };
  }

  private getDailyStorageEstimate(tier: string): number {
    const dailyEstimates: Record<string, number> = {
      pioneer: 5 * 1024 * 1024,    // 5MB per day
      seeker: 11.5 * 1024 * 1024,  // 11.5MB per day
      alchemist: 25 * 1024 * 1024, // 25MB per day
      sage: 40 * 1024 * 1024,      // 40MB per day
      eternal: 75 * 1024 * 1024,   // 75MB per day
    };
    return dailyEstimates[tier] || dailyEstimates.pioneer;
  }

  private recommendTier(annualGB: number): string {
    if (annualGB <= 2) return 'pioneer';
    if (annualGB <= 10) return 'seeker';
    if (annualGB <= 50) return 'alchemist';
    if (annualGB <= 200) return 'sage';
    return 'eternal';
  }

  private getOptimizationSuggestions(usage: any): string[] {
    const suggestions: string[] = [];

    if (usage.exports > usage.total * 0.3) {
      suggestions.push('Consider cleaning up old export archives to save space');
    }

    if (usage.backups > usage.total * 0.4) {
      suggestions.push('Enable compression for backups to reduce storage usage');
    }

    if (usage.total > 1024 * 1024 * 1024) { // > 1GB
      suggestions.push('Consider enabling auto-archiving for conversations older than 2 years');
    }

    return suggestions;
  }

  private async archiveOldConversations(userId: string, olderThanDays: number | null): Promise<void> {
    if (!olderThanDays) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Archive old conversations by creating compressed exports
    const oldAnalyses = await prisma.enhancedConversationAnalysis.findMany({
      where: {
        userId,
        createdAt: { lt: cutoffDate },
      },
    });

    if (oldAnalyses.length > 0) {
      const archivePath = await this.createExportArchive(userId, 'conversations');
      console.log(`Archived ${oldAnalyses.length} conversations to ${archivePath}`);
    }
  }

  private async cleanupOldExports(userId: string, retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldExports = await prisma.exportArchive.findMany({
      where: {
        userId,
        createdAt: { lt: cutoffDate },
      },
    });

    for (const exportRecord of oldExports) {
      try {
        await fs.unlink(exportRecord.filePath);
        await prisma.exportArchive.delete({
          where: { id: exportRecord.id },
        });
      } catch (error) {
        console.error(`Failed to cleanup export ${exportRecord.id}:`, error);
      }
    }
  }
}
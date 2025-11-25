/**
 * Soulprint Sync Manager
 * Orchestrates the complete markdown generation and file sync process
 */

import { soulprintTracker, Soulprint } from '../beta/SoulprintTracking';
import { SoulprintMarkdownExporter } from '../beta/SoulprintMarkdownExporter';
import { SoulprintFileWriter } from './fileWriter';
import {
  generateSymbolMarkdown,
  generateMilestoneMarkdown,
  generateDriftAlertMarkdown,
  generateTimelineEntry,
  generateFieldDashboardMarkdown
} from './markdownTemplates';

export interface SyncResult {
  success: boolean;
  filesWritten: string[];
  errors: Array<{ file: string; error: string }>;
  timestamp: Date;
}

export interface SyncOptions {
  syncSoulprint?: boolean;
  syncSymbols?: boolean;
  syncMilestones?: boolean;
  syncAlerts?: boolean;
  syncTimeline?: boolean;
  force?: boolean; // Force regeneration even if not changed
}

export class SoulprintSyncManager {
  private fileWriter: SoulprintFileWriter;
  private lastSync: Map<string, Date> = new Map();

  constructor(baseDir?: string) {
    this.fileWriter = new SoulprintFileWriter(baseDir);
  }

  /**
   * Sync everything for a user
   */
  async syncAll(
    userId: string,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    console.log(`🔄 Starting full sync for user: ${userId}`);

    const {
      syncSoulprint = true,
      syncSymbols = true,
      syncMilestones = true,
      syncAlerts = true,
      syncTimeline = true,
      force = false
    } = options;

    const result: SyncResult = {
      success: true,
      filesWritten: [],
      errors: [],
      timestamp: new Date()
    };

    try {
      // Get soulprint data
      const soulprint = soulprintTracker.getSoulprint(userId);

      if (!soulprint) {
        console.log(`⚠️ No soulprint found for user: ${userId}`);
        return result;
      }

      // Sync main soulprint file
      if (syncSoulprint) {
        try {
          const markdown = SoulprintMarkdownExporter.generateMarkdown(soulprint);
          const filePath = await this.fileWriter.writeSoulprint(userId, markdown);
          result.filesWritten.push(filePath);
        } catch (error) {
          result.errors.push({
            file: 'Soulprint.md',
            error: (error as Error).message
          });
        }
      }

      // Sync individual symbols
      if (syncSymbols && soulprint.activeSymbols.length > 0) {
        for (const symbol of soulprint.activeSymbols) {
          try {
            const markdown = generateSymbolMarkdown(
              symbol,
              userId,
              soulprint.userName
            );
            const filePath = await this.fileWriter.writeSymbol(
              userId,
              symbol.symbol,
              markdown
            );
            result.filesWritten.push(filePath);
          } catch (error) {
            result.errors.push({
              file: `Symbols/${symbol.symbol}.md`,
              error: (error as Error).message
            });
          }
        }
      }

      // Sync milestones
      if (syncMilestones && soulprint.milestones.length > 0) {
        for (const milestone of soulprint.milestones) {
          try {
            const markdown = generateMilestoneMarkdown(
              milestone,
              userId,
              soulprint.userName
            );
            const filePath = await this.fileWriter.writeMilestone(
              userId,
              milestone.type,
              milestone.timestamp,
              markdown
            );
            result.filesWritten.push(filePath);
          } catch (error) {
            result.errors.push({
              file: `Milestones/${milestone.type}.md`,
              error: (error as Error).message
            });
          }
        }
      }

      // Sync drift alerts
      if (syncAlerts && soulprint.emotionalState.volatility > 0.4) {
        try {
          const markdown = generateDriftAlertMarkdown(
            soulprint.emotionalState,
            userId,
            soulprint.userName
          );
          const filePath = await this.fileWriter.writeDriftAlert(
            userId,
            soulprint.emotionalState.timestamp,
            markdown
          );
          result.filesWritten.push(filePath);
        } catch (error) {
          result.errors.push({
            file: `Alerts/drift.md`,
            error: (error as Error).message
          });
        }
      }

      // Sync timeline
      if (syncTimeline) {
        try {
          const timelineMarkdown = this.generateFullTimeline(soulprint);
          const filePath = await this.fileWriter.writeTimeline(
            userId,
            timelineMarkdown
          );
          result.filesWritten.push(filePath);
        } catch (error) {
          result.errors.push({
            file: 'Timeline.md',
            error: (error as Error).message
          });
        }
      }

      // Update last sync timestamp
      this.lastSync.set(userId, new Date());

      console.log(`✅ Sync complete: ${result.filesWritten.length} files written`);
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} errors occurred during sync`);
        result.success = false;
      }

    } catch (error) {
      console.error('❌ Sync failed:', error);
      result.success = false;
      result.errors.push({
        file: 'sync',
        error: (error as Error).message
      });
    }

    return result;
  }

  /**
   * Sync only new/changed items (incremental sync)
   */
  async syncIncremental(userId: string): Promise<SyncResult> {
    console.log(`🔄 Incremental sync for user: ${userId}`);

    const soulprint = soulprintTracker.getSoulprint(userId);
    if (!soulprint) {
      return {
        success: false,
        filesWritten: [],
        errors: [{ file: 'sync', error: 'No soulprint found' }],
        timestamp: new Date()
      };
    }

    const lastSyncTime = this.lastSync.get(userId);

    // Sync new items only
    return this.syncAll(userId, {
      syncSoulprint: true, // Always sync main file
      syncSymbols: !lastSyncTime || soulprint.lastUpdated > lastSyncTime,
      syncMilestones: this.hasNewMilestones(soulprint, lastSyncTime),
      syncAlerts: soulprint.emotionalState.volatility > 0.4,
      syncTimeline: true
    });
  }

  /**
   * Append a new timeline entry (for real-time updates)
   */
  async appendTimelineEntry(
    userId: string,
    eventType: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = generateTimelineEntry(
      new Date(),
      userId,
      eventType,
      description,
      metadata
    );

    await this.fileWriter.appendToTimeline(userId, entry);
    console.log(`✅ Timeline entry appended for ${userId}`);
  }

  /**
   * Generate field dashboard for all users
   */
  async syncFieldDashboard(): Promise<string> {
    console.log('🌐 Generating field dashboard...');

    const allUsers = soulprintTracker.getAllSoulprints();
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Calculate stats
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(
        s => s.lastUpdated.getTime() > oneWeekAgo
      ).length,
      totalSymbols: allUsers.reduce((sum, s) => sum + s.activeSymbols.length, 0),
      totalMilestones: allUsers.reduce((sum, s) => sum + s.milestones.length, 0),
      totalAlerts: allUsers.filter(s => s.emotionalState.volatility > 0.4).length,
      averageJourneyDays: Math.floor(
        allUsers.reduce(
          (sum, s) => sum + (now - s.created.getTime()) / (1000 * 60 * 60 * 24),
          0
        ) / allUsers.length
      ),
      dominantElements: this.aggregateElements(allUsers),
      topSymbols: this.aggregateSymbols(allUsers),
      recentMilestones: this.getRecentMilestones(allUsers, 10)
    };

    const markdown = generateFieldDashboardMarkdown(stats);
    const filePath = await this.fileWriter.writeFieldDashboard(markdown);

    console.log(`✅ Field dashboard written: ${filePath}`);
    return filePath;
  }

  /**
   * Backfill: Sync all historical data for a user
   */
  async backfillUser(userId: string): Promise<SyncResult> {
    console.log(`🔙 Backfilling user: ${userId}`);
    return this.syncAll(userId, { force: true });
  }

  /**
   * Backfill: Sync all users
   */
  async backfillAll(): Promise<Map<string, SyncResult>> {
    console.log('🔙 Starting full backfill for all users...');

    const allUsers = soulprintTracker.getAllSoulprints();
    const results = new Map<string, SyncResult>();

    for (const soulprint of allUsers) {
      const result = await this.backfillUser(soulprint.userId);
      results.set(soulprint.userId, result);
    }

    // Also sync field dashboard and users index
    await this.syncFieldDashboard();
    await this.syncUsersIndex();

    console.log(`✅ Backfill complete: ${results.size} users processed`);
    return results;
  }

  /**
   * Sync users index with navigation to all user vaults
   */
  async syncUsersIndex(): Promise<string> {
    console.log('📇 Generating users index...');

    const allSoulprints = soulprintTracker.getAllSoulprints();

    let markdown = `---
type: index
created: ${new Date().toISOString().split('T')[0]}
totalUsers: ${allSoulprints.length}
tags: [index, navigation, maia]
---

# Users Index

*Central navigation to all soul journeys tracked by MAIA*

---

## All Explorers

Total: **${allSoulprints.length}**
Last Updated: **${new Date().toLocaleDateString()}**

---

`;

    allSoulprints
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .forEach(soulprint => {
        const userName = soulprint.userName || 'Unknown';
        const userId = soulprint.userId;
        const phase = soulprint.currentPhase;
        const archetype = soulprint.currentArchetype || 'Undefined';
        const symbolCount = soulprint.activeSymbols.length;
        const lastUpdated = soulprint.lastUpdated.toLocaleDateString();

        markdown += `### [[${userId}/Soulprint|${userName}]]

- **User ID:** \`${userId}\`
- **Phase:** ${phase}
- **Archetype:** ${archetype}
- **Active Symbols:** ${symbolCount}
- **Last Active:** ${lastUpdated}
- **Quick Links:** [[${userId}/Timeline|Timeline]] | [[${userId}/Symbols|Symbols]] | [[${userId}/Milestones|Milestones]]

---

`;
      });

    markdown += `\n*Generated by MAIA Field Intelligence | ${new Date().toLocaleDateString()}*\n`;

    const filePath = await this.fileWriter.writeUsersIndex(markdown);
    console.log(`✅ Users index written: ${filePath}`);
    return filePath;
  }

  /**
   * Log sync activity
   */
  async logSync(userId: string, filesWritten: string[]): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `### ${timestamp}
- **User:** ${userId}
- **Files Written:** ${filesWritten.length}
- **Files:** ${filesWritten.map(f => `\`${f}\``).join(', ')}
`;

    await this.fileWriter.writeSyncLog(logEntry);
  }

  // === PRIVATE HELPER METHODS ===

  private generateFullTimeline(soulprint: Soulprint): string {
    let timeline = `---
userId: ${soulprint.userId}
userName: ${soulprint.userName || 'Unknown'}
created: ${soulprint.created.toISOString().split('T')[0]}
tags: [timeline, journey, maia]
---

# Soul Journey Timeline: ${soulprint.userName || soulprint.userId}

*A chronological view of the complete journey*

---

`;

    // Combine all events into chronological order
    const events: Array<{ date: Date; type: string; description: string }> = [];

    // Add milestones
    soulprint.milestones.forEach(m => {
      events.push({
        date: m.timestamp,
        type: `Milestone: ${m.type}`,
        description: m.description
      });
    });

    // Add symbol discoveries
    soulprint.activeSymbols.forEach(s => {
      events.push({
        date: s.firstAppeared,
        type: 'Symbol Emerged',
        description: `Symbol "${s.symbol}" first appeared`
      });
    });

    // Add archetype shifts
    soulprint.archetypeHistory.forEach(a => {
      events.push({
        date: a.timestamp,
        type: 'Archetype Shift',
        description: `Shifted to ${a.toArchetype}${a.trigger ? ` (${a.trigger})` : ''}`
      });
    });

    // Sort chronologically, most recent first
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Generate entries
    events.forEach(event => {
      timeline += generateTimelineEntry(
        event.date,
        soulprint.userId,
        event.type,
        event.description
      );
      timeline += '\n\n';
    });

    timeline += `\n---\n\n*Generated by MAIA Soul System | ${new Date().toLocaleDateString()}*`;

    return timeline;
  }

  private hasNewMilestones(soulprint: Soulprint, lastSync?: Date): boolean {
    if (!lastSync) return soulprint.milestones.length > 0;

    return soulprint.milestones.some(
      m => m.timestamp.getTime() > lastSync.getTime()
    );
  }

  private aggregateElements(soulprints: Soulprint[]): Record<string, number> {
    const elementCounts: Record<string, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    soulprints.forEach(s => {
      const dominant = s.elementalBalance.dominant;
      if (dominant && elementCounts[dominant] !== undefined) {
        elementCounts[dominant]++;
      }
    });

    return elementCounts;
  }

  private aggregateSymbols(
    soulprints: Soulprint[]
  ): Array<{ symbol: string; count: number }> {
    const symbolCounts: Map<string, number> = new Map();

    soulprints.forEach(s => {
      s.activeSymbols.forEach(sym => {
        const current = symbolCounts.get(sym.symbol) || 0;
        symbolCounts.set(sym.symbol, current + sym.frequency);
      });
    });

    return Array.from(symbolCounts.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getRecentMilestones(
    soulprints: Soulprint[],
    limit: number
  ): Array<{
    userId: string;
    userName?: string;
    type: string;
    date: Date;
  }> {
    const milestones: Array<{
      userId: string;
      userName?: string;
      type: string;
      date: Date;
    }> = [];

    soulprints.forEach(s => {
      s.milestones.forEach(m => {
        milestones.push({
          userId: s.userId,
          userName: s.userName,
          type: m.type,
          date: m.timestamp
        });
      });
    });

    return milestones
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }
}

// Export singleton instance
// Use Obsidian vault path if configured, otherwise use project-relative ./AIN
const getVaultPath = (): string => {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (vaultPath) {
    return `${vaultPath}/AIN`;
  }
  return './AIN';
};

export const soulprintSyncManager = new SoulprintSyncManager(getVaultPath());
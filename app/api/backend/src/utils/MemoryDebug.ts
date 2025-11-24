/**
 * Memory Debug Logger for Maya Development
 * 
 * Provides objective validation of memory layer access during conversations.
 * Enable with: MAYA_DEBUG_MEMORY=true
 */

import chalk from 'chalk';

interface MemoryContext {
  session?: {
    turns: Array<{ role: string; content: string }>;
    count: number;
  };
  journals?: {
    entries: Array<{ date: string; content: string; relevance: number }>;
    count: number;
    avgRelevance: number;
  };
  profile?: {
    userId: string;
    archetype?: string;
    element?: string;
    phase?: string;
    themes?: string[];
  };
  symbolic?: {
    active: boolean;
    tags?: string[];
    element?: string;
    archetype?: string;
  };
}

interface MemoryAccessLog {
  timestamp: string;
  userId: string;
  messageId: string;
  layersAccessed: {
    session: boolean;
    journals: boolean;
    profile: boolean;
    symbolic: boolean;
  };
  tokenCounts: {
    session: number;
    journals: number;
    profile: number;
    symbolic: number;
    total: number;
  };
  warnings: string[];
}

export class MemoryDebugger {
  private enabled: boolean;
  private logs: MemoryAccessLog[] = [];
  
  constructor() {
    this.enabled = process.env.MAYA_DEBUG_MEMORY === 'true';
  }

  /**
   * Log memory context before sending to LLM
   */
  logMemoryContext(
    userId: string,
    messageId: string,
    context: MemoryContext
  ): void {
    if (!this.enabled) return;

    const log: MemoryAccessLog = {
      timestamp: new Date().toISOString(),
      userId,
      messageId,
      layersAccessed: {
        session: !!(context.session?.count && context.session.count > 0),
        journals: !!(context.journals?.count && context.journals.count > 0),
        profile: !!context.profile,
        symbolic: !!(context.symbolic?.active),
      },
      tokenCounts: {
        session: this.estimateTokens(context.session),
        journals: this.estimateTokens(context.journals),
        profile: this.estimateTokens(context.profile),
        symbolic: this.estimateTokens(context.symbolic),
        total: 0,
      },
      warnings: [],
    };

    // Calculate total tokens
    log.tokenCounts.total = Object.values(log.tokenCounts)
      .filter(v => typeof v === 'number')
      .reduce((sum, count) => sum + count, 0);

    // Add warnings
    if (log.tokenCounts.total > 4000) {
      log.warnings.push(`Token budget exceeded: ${log.tokenCounts.total}/4000`);
    }

    const layersActive = Object.values(log.layersAccessed).filter(Boolean).length;
    if (layersActive < 2) {
      log.warnings.push(`Only ${layersActive} memory layer(s) active - target is 3+`);
    }

    if (!log.layersAccessed.session) {
      log.warnings.push('Session memory not loaded - conversation continuity at risk');
    }

    this.logs.push(log);
    this.printLog(log, context);
  }

  /**
   * Print formatted debug output to console
   */
  private printLog(log: MemoryAccessLog, context: MemoryContext): void {
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold('[MAYA_DEBUG] Memory Context'));
    console.log(chalk.cyan('═'.repeat(60)));
    
    // Session Memory
    const sessionStatus = log.layersAccessed.session 
      ? chalk.green('✓ ACTIVE') 
      : chalk.red('✗ INACTIVE');
    console.log(chalk.white('Session Memory:'), sessionStatus);
    if (context.session?.count) {
      console.log(chalk.gray(`  → ${context.session.count} turns loaded (${log.tokenCounts.session} tokens)`));
    }

    // Journal Memory
    const journalStatus = log.layersAccessed.journals 
      ? chalk.green('✓ ACTIVE') 
      : chalk.yellow('○ NO MATCHES');
    console.log(chalk.white('Journal Memory:'), journalStatus);
    if (context.journals?.count) {
      console.log(chalk.gray(`  → ${context.journals.count} entries matched`));
      console.log(chalk.gray(`  → Avg relevance: ${context.journals.avgRelevance.toFixed(2)}`));
      console.log(chalk.gray(`  → Tokens: ${log.tokenCounts.journals}`));
    }

    // Profile Memory
    const profileStatus = log.layersAccessed.profile 
      ? chalk.green('✓ ACTIVE') 
      : chalk.red('✗ INACTIVE');
    console.log(chalk.white('Profile Memory:'), profileStatus);
    if (context.profile) {
      console.log(chalk.gray(`  → Archetype: ${context.profile.archetype || 'None'}`));
      console.log(chalk.gray(`  → Element: ${context.profile.element || 'None'}`));
      console.log(chalk.gray(`  → Phase: ${context.profile.phase || 'None'}`));
      console.log(chalk.gray(`  → Tokens: ${log.tokenCounts.profile}`));
    }

    // Symbolic Memory
    const symbolicStatus = log.layersAccessed.symbolic 
      ? chalk.green('✓ ACTIVE') 
      : chalk.gray('○ NOT RELEVANT');
    console.log(chalk.white('Symbolic Memory:'), symbolicStatus);
    if (context.symbolic?.active) {
      console.log(chalk.gray(`  → Tags: ${context.symbolic.tags?.join(', ') || 'None'}`));
      console.log(chalk.gray(`  → Element: ${context.symbolic.element || 'None'}`));
      console.log(chalk.gray(`  → Tokens: ${log.tokenCounts.symbolic}`));
    }

    // Token Summary
    console.log(chalk.cyan('─'.repeat(60)));
    console.log(chalk.white('Token Budget:'));
    console.log(chalk.gray(`  → Total: ${log.tokenCounts.total}/4000`));
    
    const budgetBar = this.renderProgressBar(log.tokenCounts.total, 4000);
    console.log(chalk.gray(`  → Usage: ${budgetBar}`));

    // Warnings
    if (log.warnings.length > 0) {
      console.log(chalk.cyan('─'.repeat(60)));
      console.log(chalk.yellow.bold('⚠ Warnings:'));
      log.warnings.forEach(warning => {
        console.log(chalk.yellow(`  → ${warning}`));
      });
    }

    // Quality Score
    const qualityScore = this.calculateQualityScore(log);
    console.log(chalk.cyan('─'.repeat(60)));
    console.log(chalk.white('Quality Score:'), this.getQualityBadge(qualityScore));
    
    console.log(chalk.cyan('═'.repeat(60)) + '\n');
  }

  /**
   * Estimate token count for any data structure
   */
  private estimateTokens(data: any): number {
    if (!data) return 0;
    
    const jsonString = JSON.stringify(data);
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(jsonString.length / 4);
  }

  /**
   * Render a visual progress bar for token usage
   */
  private renderProgressBar(current: number, max: number): string {
    const percentage = Math.min(100, (current / max) * 100);
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const color = percentage > 90 ? chalk.red : percentage > 70 ? chalk.yellow : chalk.green;
    
    return color(bar) + chalk.gray(` ${percentage.toFixed(0)}%`);
  }

  /**
   * Calculate quality score based on memory layer usage
   */
  private calculateQualityScore(log: MemoryAccessLog): number {
    let score = 0;
    
    // Base points for each active layer
    if (log.layersAccessed.session) score += 25;
    if (log.layersAccessed.journals) score += 25;
    if (log.layersAccessed.profile) score += 25;
    if (log.layersAccessed.symbolic) score += 15;
    
    // Bonus for good token management
    if (log.tokenCounts.total < 3000) score += 10;
    
    // Penalties
    if (log.warnings.length > 0) score -= log.warnings.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get quality badge based on score
   */
  private getQualityBadge(score: number): string {
    if (score >= 80) return chalk.green.bold(`EXCELLENT (${score}/100)`);
    if (score >= 60) return chalk.yellow.bold(`GOOD (${score}/100)`);
    if (score >= 40) return chalk.yellow(`FAIR (${score}/100)`);
    return chalk.red.bold(`NEEDS IMPROVEMENT (${score}/100)`);
  }

  /**
   * Get summary statistics for the session
   */
  getSessionStats(): {
    totalLogs: number;
    avgLayersActive: number;
    avgTokensUsed: number;
    warningCount: number;
    avgQualityScore: number;
  } {
    if (this.logs.length === 0) {
      return {
        totalLogs: 0,
        avgLayersActive: 0,
        avgTokensUsed: 0,
        warningCount: 0,
        avgQualityScore: 0,
      };
    }

    const avgLayersActive = this.logs.reduce((sum, log) => {
      const active = Object.values(log.layersAccessed).filter(Boolean).length;
      return sum + active;
    }, 0) / this.logs.length;

    const avgTokensUsed = this.logs.reduce((sum, log) => {
      return sum + log.tokenCounts.total;
    }, 0) / this.logs.length;

    const warningCount = this.logs.reduce((sum, log) => {
      return sum + log.warnings.length;
    }, 0);

    const avgQualityScore = this.logs.reduce((sum, log) => {
      return sum + this.calculateQualityScore(log);
    }, 0) / this.logs.length;

    return {
      totalLogs: this.logs.length,
      avgLayersActive,
      avgTokensUsed,
      warningCount,
      avgQualityScore,
    };
  }

  /**
   * Print session summary
   */
  printSessionSummary(): void {
    if (!this.enabled) return;
    
    const stats = this.getSessionStats();
    
    console.log('\n' + chalk.magenta('═'.repeat(60)));
    console.log(chalk.magenta.bold('[MAYA_DEBUG] Session Summary'));
    console.log(chalk.magenta('═'.repeat(60)));
    
    console.log(chalk.white('Total Interactions:'), stats.totalLogs);
    console.log(chalk.white('Avg Layers Active:'), stats.avgLayersActive.toFixed(1));
    console.log(chalk.white('Avg Tokens Used:'), Math.round(stats.avgTokensUsed));
    console.log(chalk.white('Total Warnings:'), stats.warningCount);
    console.log(chalk.white('Avg Quality Score:'), this.getQualityBadge(stats.avgQualityScore));
    
    console.log(chalk.magenta('═'.repeat(60)) + '\n');
  }

  /**
   * Export logs to JSON for analysis
   */
  exportLogs(): string {
    return JSON.stringify({
      session: {
        timestamp: new Date().toISOString(),
        stats: this.getSessionStats(),
        logs: this.logs,
      }
    }, null, 2);
  }
}

// Singleton instance
export const memoryDebugger = new MemoryDebugger();

// Usage example in ConversationalPipeline or memory builder:
/*
import { memoryDebugger } from './utils/MemoryDebug';

// Before sending to LLM:
memoryDebugger.logMemoryContext(userId, messageId, {
  session: {
    turns: recentTurns,
    count: recentTurns.length
  },
  journals: {
    entries: journalMatches,
    count: journalMatches.length,
    avgRelevance: 0.82
  },
  profile: userProfile,
  symbolic: {
    active: true,
    tags: ['fire', 'transformation'],
    element: 'fire'
  }
});

// At session end:
memoryDebugger.printSessionSummary();
*/
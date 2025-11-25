/**
 * Obsidian Markdown Exporter
 * Exports soulprint metrics and symbolic data to Obsidian vault
 * Vault Path: /Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/
 */

import * as fs from 'fs';
import * as path from 'path';
import { Soulprint, soulprintTracker } from '../beta/SoulprintTracking';
import { metricsEngine, ComprehensiveMetricsSnapshot } from '../metrics/PsychospiritualMetricsEngine';

export interface ObsidianExportConfig {
  vaultPath: string;
  createBacklinks: boolean;
  addFrontmatter: boolean;
  autoSync: boolean;
}

export class ObsidianExporter {
  private config: ObsidianExportConfig;

  constructor(config: Partial<ObsidianExportConfig> = {}) {
    this.config = {
      vaultPath: config.vaultPath || '/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN',
      createBacklinks: config.createBacklinks ?? true,
      addFrontmatter: config.addFrontmatter ?? true,
      autoSync: config.autoSync ?? false
    };
  }

  /**
   * Export complete soulprint snapshot
   */
  async exportSoulprint(userId: string): Promise<{ success: boolean; files: string[] }> {
    const soulprint = soulprintTracker.getSoulprint(userId);
    const metrics = metricsEngine.generateComprehensiveSnapshot(userId);

    if (!soulprint || !metrics) {
      return { success: false, files: [] };
    }

    const files: string[] = [];

    try {
      // 1. User profile
      const profilePath = await this.exportUserProfile(userId, soulprint, metrics);
      files.push(profilePath);

      // 2. Symbols
      for (const symbol of soulprint.activeSymbols) {
        const symbolPath = await this.exportSymbol(userId, symbol);
        files.push(symbolPath);
      }

      // 3. Milestones
      for (const milestone of soulprint.milestones) {
        const milestonePath = await this.exportMilestone(userId, milestone);
        files.push(milestonePath);
      }

      // 4. Growth report
      const growthPath = await this.exportGrowthReport(userId, metrics);
      files.push(growthPath);

      // 5. Alerts (if any)
      if (metrics.alerts.length > 0) {
        const alertPath = await this.exportAlerts(userId, metrics);
        files.push(alertPath);
      }

      return { success: true, files };
    } catch (error) {
      console.error('Obsidian export failed:', error);
      return { success: false, files };
    }
  }

  /**
   * Export user profile
   */
  private async exportUserProfile(
    userId: string,
    soulprint: Soulprint,
    metrics: ComprehensiveMetricsSnapshot
  ): Promise<string> {
    const dir = path.join(this.config.vaultPath, 'Users', this.sanitizeFilename(userId));
    this.ensureDir(dir);

    const content = this.generateUserProfileMarkdown(soulprint, metrics);
    const filePath = path.join(dir, 'Profile.md');

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Export individual symbol
   */
  private async exportSymbol(userId: string, symbol: any): Promise<string> {
    const dir = path.join(this.config.vaultPath, 'Symbols');
    this.ensureDir(dir);

    const content = this.generateSymbolMarkdown(userId, symbol);
    const filePath = path.join(dir, `${this.sanitizeFilename(symbol.symbol)}.md`);

    // Append if exists, create if not
    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, 'utf-8');
      if (!existing.includes(userId)) {
        fs.appendFileSync(filePath, `\n\n${content}`);
      }
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    return filePath;
  }

  /**
   * Export milestone
   */
  private async exportMilestone(userId: string, milestone: any): Promise<string> {
    const dir = path.join(this.config.vaultPath, 'Milestones', this.sanitizeFilename(userId));
    this.ensureDir(dir);

    const content = this.generateMilestoneMarkdown(userId, milestone);
    const dateStr = this.formatDate(milestone.timestamp);
    const filePath = path.join(dir, `${dateStr}-${this.sanitizeFilename(milestone.type)}.md`);

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Export growth report
   */
  private async exportGrowthReport(userId: string, metrics: ComprehensiveMetricsSnapshot): Promise<string> {
    const dir = path.join(this.config.vaultPath, 'Growth', this.sanitizeFilename(userId));
    this.ensureDir(dir);

    const content = this.generateGrowthReportMarkdown(metrics);
    const dateStr = this.formatDate(new Date());
    const filePath = path.join(dir, `growth-${dateStr}.md`);

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Export alerts
   */
  private async exportAlerts(userId: string, metrics: ComprehensiveMetricsSnapshot): Promise<string> {
    const dir = path.join(this.config.vaultPath, 'Alerts', this.sanitizeFilename(userId));
    this.ensureDir(dir);

    const content = this.generateAlertsMarkdown(metrics);
    const dateStr = this.formatDate(new Date());
    const filePath = path.join(dir, `alerts-${dateStr}.md`);

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Markdown generators
   */
  private generateUserProfileMarkdown(soulprint: Soulprint, metrics: ComprehensiveMetricsSnapshot): string {
    const fm = this.config.addFrontmatter ? this.generateFrontmatter({
      type: 'user-profile',
      userId: soulprint.userId,
      created: soulprint.created.toISOString(),
      updated: new Date().toISOString(),
      phase: metrics.spiralogicPhase.currentPhase,
      growthScore: metrics.growthIndex.overallScore
    }) : '';

    return `${fm}# ${soulprint.userName || soulprint.userId}

> **Journey Duration:** ${metrics.journeyDuration} days
> **Current Phase:** ${metrics.spiralogicPhase.currentPhase}
> **Growth Score:** ${(metrics.growthIndex.overallScore * 100).toFixed(1)}%

---

## 🎭 Current Archetype

${metrics.archetypeCoherence.activeArchetypes.join(', ')}

**Coherence Score:** ${(metrics.archetypeCoherence.score * 100).toFixed(1)}%

---

## 🔮 Active Symbols

${soulprint.activeSymbols.slice(0, 10).map(s =>
  `- [[${s.symbol}]] (${s.frequency}x) - ${s.elementalResonance || 'neutral'}`
).join('\n')}

---

## 💫 Emotional State

**Trend:** ${metrics.emotionalLandscape.trendDirection}
**Volatility:** ${(metrics.emotionalLandscape.volatilityIndex * 100).toFixed(1)}%

**Dominant Emotions:**
${metrics.emotionalLandscape.dominantEmotions.map(e => `- ${e.emotion}`).join('\n')}

---

## 🌀 Elemental Balance

| Element | % |
|---------|---|
| 🔥 Fire | ${(soulprint.elementalBalance.fire * 100).toFixed(0)}% |
| 💧 Water | ${(soulprint.elementalBalance.water * 100).toFixed(0)}% |
| 🌍 Earth | ${(soulprint.elementalBalance.earth * 100).toFixed(0)}% |
| 💨 Air | ${(soulprint.elementalBalance.air * 100).toFixed(0)}% |
| ✨ Aether | ${(soulprint.elementalBalance.aether * 100).toFixed(0)}% |

**Dominant:** ${soulprint.elementalBalance.dominant}
**Deficient:** ${soulprint.elementalBalance.deficient}

---

## 📈 Growth Metrics

| Component | Score |
|-----------|-------|
| Shadow Integration | ${(metrics.growthIndex.components.shadowIntegration * 100).toFixed(0)}% |
| Phase Completion | ${(metrics.growthIndex.components.phaseCompletion * 100).toFixed(0)}% |
| Emotional Coherence | ${(metrics.growthIndex.components.emotionalCoherence * 100).toFixed(0)}% |
| Archetype Alignment | ${(metrics.growthIndex.components.archetypeAlignment * 100).toFixed(0)}% |
| Ritual Depth | ${(metrics.growthIndex.components.ritualDepth * 100).toFixed(0)}% |

---

## 🌟 Recent Milestones

${soulprint.milestones.slice(-5).reverse().map(m =>
  `- **${m.timestamp.toLocaleDateString()}** — ${m.type} (${m.significance}): ${m.description}`
).join('\n')}

---

## 💡 Recommendations

${metrics.recommendations.map(r => `- ${r}`).join('\n') || 'No recommendations at this time.'}

---

*Last updated: ${new Date().toLocaleString()}*
*Generated by: Spiralogic Oracle System + MAIA*
`;
  }

  private generateSymbolMarkdown(userId: string, symbol: any): string {
    const fm = this.config.addFrontmatter ? this.generateFrontmatter({
      type: 'symbol',
      symbol: symbol.symbol,
      element: symbol.elementalResonance,
      frequency: symbol.frequency,
      firstSeen: symbol.firstAppeared.toISOString(),
      lastSeen: symbol.lastMentioned.toISOString()
    }) : '';

    return `${fm}# ${symbol.symbol}

> **Element:** ${symbol.elementalResonance || 'neutral'}
> **Frequency:** ${symbol.frequency}
> **First Appeared:** ${symbol.firstAppeared.toLocaleDateString()}
> **Last Mentioned:** ${symbol.lastMentioned.toLocaleDateString()}

---

## Context

${symbol.context.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n\n')}

---

## Users

- [[${userId}]]

---

*Auto-generated by Symbol Extraction Engine*
`;
  }

  private generateMilestoneMarkdown(userId: string, milestone: any): string {
    const fm = this.config.addFrontmatter ? this.generateFrontmatter({
      type: 'milestone',
      milestoneType: milestone.type,
      significance: milestone.significance,
      element: milestone.element,
      phase: milestone.spiralogicPhase,
      date: milestone.timestamp.toISOString()
    }) : '';

    return `${fm}# ${milestone.type} — ${milestone.timestamp.toLocaleDateString()}

> **Significance:** ${milestone.significance}
> **Phase:** ${milestone.spiralogicPhase || 'unknown'}
> **Element:** ${milestone.element || 'none'}

---

## Description

${milestone.description}

---

## Context

**User:** [[${userId}]]
**Date:** ${milestone.timestamp.toLocaleString()}

---

*Auto-generated by Soulprint Tracker*
`;
  }

  private generateGrowthReportMarkdown(metrics: ComprehensiveMetricsSnapshot): string {
    const fm = this.config.addFrontmatter ? this.generateFrontmatter({
      type: 'growth-report',
      userId: metrics.userId,
      date: metrics.timestamp.toISOString(),
      growthScore: metrics.growthIndex.overallScore,
      trend: metrics.growthIndex.trend
    }) : '';

    return `${fm}# Growth Report — ${metrics.timestamp.toLocaleDateString()}

> **Overall Growth Score:** ${(metrics.growthIndex.overallScore * 100).toFixed(1)}%
> **Trend:** ${metrics.growthIndex.trend}
> **Journey Duration:** ${metrics.journeyDuration} days

---

## 📊 Component Breakdown

| Component | Score | Bar |
|-----------|-------|-----|
| Shadow Integration | ${(metrics.growthIndex.components.shadowIntegration * 100).toFixed(0)}% | ${'█'.repeat(Math.round(metrics.growthIndex.components.shadowIntegration * 10))} |
| Phase Completion | ${(metrics.growthIndex.components.phaseCompletion * 100).toFixed(0)}% | ${'█'.repeat(Math.round(metrics.growthIndex.components.phaseCompletion * 10))} |
| Emotional Coherence | ${(metrics.growthIndex.components.emotionalCoherence * 100).toFixed(0)}% | ${'█'.repeat(Math.round(metrics.growthIndex.components.emotionalCoherence * 10))} |
| Archetype Alignment | ${(metrics.growthIndex.components.archetypeAlignment * 100).toFixed(0)}% | ${'█'.repeat(Math.round(metrics.growthIndex.components.archetypeAlignment * 10))} |
| Ritual Depth | ${(metrics.growthIndex.components.ritualDepth * 100).toFixed(0)}% | ${'█'.repeat(Math.round(metrics.growthIndex.components.ritualDepth * 10))} |

---

## 🎭 Archetype Dynamics

**Active:** ${metrics.archetypeCoherence.activeArchetypes.join(', ')}
**Coherence:** ${(metrics.archetypeCoherence.score * 100).toFixed(1)}%

${metrics.archetypeCoherence.tensions.length > 0 ? `
### Tensions
${metrics.archetypeCoherence.tensions.map(t =>
  `- ${t.from} ⚡ ${t.to} (${(t.tensionLevel * 100).toFixed(0)}%)`
).join('\n')}
` : ''}

---

## 🌑 Shadow Work

**Integration Score:** ${(metrics.shadowIntegration.integrationScore * 100).toFixed(1)}%
**Work Frequency:** ${metrics.shadowIntegration.shadowWorkFrequency}/month
**Suppressed Archetypes:** ${metrics.shadowIntegration.suppressedArchetypes.join(', ') || 'None'}

---

## 🌀 Narrative Progression

- **Active Threads:** ${metrics.narrativeProgression.activeThreads}
- **Completed:** ${metrics.narrativeProgression.completedThreads}
- **Coherence:** ${(metrics.narrativeProgression.narrativeCoherence * 100).toFixed(1)}%
- **Breakthroughs (30d):** ${metrics.narrativeProgression.breakthroughFrequency}

---

## 🔮 Symbolic Evolution

**Active Symbols:** ${metrics.symbolicEvolution.activeSymbolCount}
**Diversity:** ${(metrics.symbolicEvolution.symbolDiversity * 100).toFixed(1)}%
**Stagnation Risk:** ${metrics.symbolicEvolution.stagnationRisk ? '⚠️ Yes' : '✅ No'}

### Top Symbols
${metrics.symbolicEvolution.topSymbols.map(s =>
  `- [[${s.symbol}]] (${s.frequency}x) — ${s.elementalResonance || 'neutral'}`
).join('\n')}

---

*Generated: ${metrics.timestamp.toLocaleString()}*
`;
  }

  private generateAlertsMarkdown(metrics: ComprehensiveMetricsSnapshot): string {
    const fm = this.config.addFrontmatter ? this.generateFrontmatter({
      type: 'alerts',
      userId: metrics.userId,
      date: new Date().toISOString(),
      alertCount: metrics.alerts.length
    }) : '';

    return `${fm}# ⚠️ Alerts — ${new Date().toLocaleDateString()}

${metrics.alerts.map(alert => `## ${alert}\n`).join('\n')}

---

## Recommendations

${metrics.recommendations.map(r => `- ${r}`).join('\n')}

---

*Generated: ${new Date().toLocaleString()}*
`;
  }

  /**
   * Helpers
   */
  private generateFrontmatter(data: Record<string, any>): string {
    const yaml = Object.entries(data)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    return `---
${yaml}
---

`;
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Batch export all users
   */
  async exportAll(): Promise<{ success: boolean; totalFiles: number }> {
    const soulprints = soulprintTracker.getAllSoulprints();
    let totalFiles = 0;

    for (const soulprint of soulprints) {
      const result = await this.exportSoulprint(soulprint.userId);
      if (result.success) {
        totalFiles += result.files.length;
      }
    }

    return { success: true, totalFiles };
  }
}

export const obsidianExporter = new ObsidianExporter();
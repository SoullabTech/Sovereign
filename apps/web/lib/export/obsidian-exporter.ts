import fs from 'fs/promises';
import path from 'path';
import { DateTime } from 'luxon';

interface SessionData {
  id: string;
  user_id: string;
  therapist_id?: string;
  timestamp: string;
  risk_level: 'none' | 'moderate' | 'high' | 'crisis';
  status: 'active' | 'resolved' | 'escalated';
  safety_events: SafetyEvent[];
  growth_metrics: GrowthMetrics;
  breakthroughs: Breakthrough[];
  coherence: CoherenceData;
  themes: string[];
  synchronicities: string[];
  therapist_notes?: string;
  conversation_context: {
    message_count: number;
    session_duration_minutes: number;
    emotional_signature: string;
  };
}

interface SafetyEvent {
  timestamp: string;
  type: 'detection' | 'escalation' | 'intervention' | 'resolution';
  description: string;
  risk_level: string;
  action_taken: string;
  therapist_involved?: boolean;
}

interface GrowthMetrics {
  emotional_weather: {
    fire: number;    // Passion, energy, transformation
    water: number;   // Flow, intuition, emotional depth
    earth: number;   // Grounding, stability, practical wisdom
    air: number;     // Mental clarity, communication, perspective
  };
  wellness_scores: {
    phq2: number;
    gad2: number;
    session_mood: number;
  };
  mindfulness_minutes: number;
  session_quality: number;
}

interface Breakthrough {
  timestamp: string;
  type: 'insight' | 'emotional_release' | 'pattern_recognition' | 'integration';
  summary: string;
  intensity: number;
  archetypal_resonance?: string;
}

interface CoherenceData {
  current: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  hrv_score?: number;
  meditation_coherence?: number;
}

export class ObsidianExporter {
  private vaultPath: string;
  private sessionNotesPath: string;
  private canvasPath: string;
  private indexPath: string;

  constructor(vaultPath: string = process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault') {
    this.vaultPath = vaultPath;
    this.sessionNotesPath = path.join(vaultPath, 'Sessions');
    this.canvasPath = path.join(vaultPath, 'Canvas');
    this.indexPath = path.join(vaultPath, 'Index');
  }

  async initialize(): Promise<void> {
    // Create directory structure
    await fs.mkdir(this.vaultPath, { recursive: true });
    await fs.mkdir(this.sessionNotesPath, { recursive: true });
    await fs.mkdir(this.canvasPath, { recursive: true });
    await fs.mkdir(this.indexPath, { recursive: true });

    // Create index files if they don't exist
    await this.createIndexFiles();
  }

  async exportSession(sessionData: SessionData): Promise<{ mdPath: string; canvasPath: string }> {
    await this.initialize();

    const sessionId = sessionData.id;
    const timestamp = DateTime.fromISO(sessionData.timestamp);
    const dateString = timestamp.toFormat('yyyy-MM-dd');
    const timeString = timestamp.toFormat('HH-mm');

    // Generate file paths
    const mdPath = path.join(this.sessionNotesPath, `${dateString}_${timeString}_${sessionId.slice(-6)}.md`);
    const canvasFilePath = path.join(this.canvasPath, `${dateString}_${timeString}_${sessionId.slice(-6)}.canvas`);

    // Generate content
    const mdContent = this.renderMarkdown(sessionData);
    const canvasContent = this.renderCanvas(sessionData);

    // Write files
    await fs.writeFile(mdPath, mdContent, 'utf-8');
    await fs.writeFile(canvasFilePath, canvasContent, 'utf-8');

    // Update indexes
    await this.updateIndexes(sessionData, mdPath, canvasFilePath);

    return { mdPath, canvasPath: canvasFilePath };
  }

  private renderMarkdown(data: SessionData): string {
    const timestamp = DateTime.fromISO(data.timestamp);
    const riskEmoji = {
      none: '🟢',
      moderate: '🟡',
      high: '🟠',
      crisis: '🔴'
    }[data.risk_level];

    return `# Session Log — ${data.id.slice(-8)}

> **Generated:** ${DateTime.now().toFormat('yyyy-MM-dd HH:mm')}

## 📋 Session Overview

| Field | Value |
|-------|-------|
| **Date** | ${timestamp.toFormat('MMMM dd, yyyy')} |
| **Time** | ${timestamp.toFormat('HH:mm')} |
| **Duration** | ${data.conversation_context.session_duration_minutes} minutes |
| **User ID** | \`${data.user_id.slice(-8)}\` |
| **Therapist** | ${data.therapist_id ? `[[Therapist-${data.therapist_id}]]` : 'N/A'} |
| **Risk Level** | ${riskEmoji} ${data.risk_level.toUpperCase()} |
| **Status** | ${data.status.toUpperCase()} |
| **Messages** | ${data.conversation_context.message_count} |

---

## 🛡️ Safety Events

${data.safety_events.length > 0 ?
  data.safety_events.map(event => {
    const eventTime = DateTime.fromISO(event.timestamp);
    const eventEmoji = {
      detection: '🔍',
      escalation: '⚠️',
      intervention: '🚑',
      resolution: '✅'
    }[event.type];

    return `### ${eventEmoji} ${event.type.toUpperCase()} — ${eventTime.toFormat('HH:mm')}

**Description:** ${event.description}
**Risk Level:** ${event.risk_level}
**Action Taken:** ${event.action_taken}
${event.therapist_involved ? '**Therapist Involved:** Yes' : ''}

---`;
  }).join('\n') :
  '*No safety events recorded*'
}

## 🌟 Growth Indicators

### Emotional Weather (4-Element Balance)

\`\`\`
🔥 Fire (Passion/Energy):     ${'█'.repeat(Math.round(data.growth_metrics.emotional_weather.fire * 10))} ${data.growth_metrics.emotional_weather.fire.toFixed(1)}
🌊 Water (Flow/Intuition):    ${'█'.repeat(Math.round(data.growth_metrics.emotional_weather.water * 10))} ${data.growth_metrics.emotional_weather.water.toFixed(1)}
🌍 Earth (Grounding/Wisdom):  ${'█'.repeat(Math.round(data.growth_metrics.emotional_weather.earth * 10))} ${data.growth_metrics.emotional_weather.earth.toFixed(1)}
🌪️ Air (Clarity/Perspective): ${'█'.repeat(Math.round(data.growth_metrics.emotional_weather.air * 10))} ${data.growth_metrics.emotional_weather.air.toFixed(1)}
\`\`\`

### Wellness Assessment Scores

| Assessment | Score | Interpretation |
|------------|-------|----------------|
| **PHQ-2** (Depression) | ${data.growth_metrics.wellness_scores.phq2}/6 | ${this.interpretPHQ2(data.growth_metrics.wellness_scores.phq2)} |
| **GAD-2** (Anxiety) | ${data.growth_metrics.wellness_scores.gad2}/6 | ${this.interpretGAD2(data.growth_metrics.wellness_scores.gad2)} |
| **Session Mood** | ${data.growth_metrics.wellness_scores.session_mood}/10 | ${this.interpretMood(data.growth_metrics.wellness_scores.session_mood)} |

### Coherence & Mindfulness

- **Coherence Score:** ${data.coherence.current.toFixed(2)} (${data.coherence.trend})
- **Mindfulness Minutes:** ${data.growth_metrics.mindfulness_minutes}
- **Session Quality:** ${data.growth_metrics.session_quality.toFixed(1)}/10
${data.coherence.hrv_score ? `- **HRV Score:** ${data.coherence.hrv_score}` : ''}

---

## 💡 Breakthrough Timeline

${data.breakthroughs.length > 0 ?
  data.breakthroughs.map((breakthrough, index) => {
    const btTime = DateTime.fromISO(breakthrough.timestamp);
    const btEmoji = {
      insight: '💡',
      emotional_release: '🌊',
      pattern_recognition: '🔍',
      integration: '🔗'
    }[breakthrough.type];

    return `### ${btEmoji} ${breakthrough.type.toUpperCase()} — ${btTime.toFormat('HH:mm')}

**Summary:** ${breakthrough.summary}
**Intensity:** ${'⭐'.repeat(Math.round(breakthrough.intensity * 5))} (${breakthrough.intensity.toFixed(1)}/1.0)
${breakthrough.archetypal_resonance ? `**Archetypal Resonance:** ${breakthrough.archetypal_resonance}` : ''}

---`;
  }).join('\n') :
  '*No breakthroughs recorded*'
}

## 🧭 Analysis & Insights

### Key Themes
${data.themes.length > 0 ?
  data.themes.map(theme => `- #${theme.replace(/\s+/g, '-')}`).join('\n') :
  '*No major themes identified*'
}

### Synchronicities & Patterns
${data.synchronicities.length > 0 ?
  data.synchronicities.map(sync => `> ${sync}`).join('\n\n') :
  '*No notable synchronicities*'
}

### Therapist Notes
${data.therapist_notes ? `\`\`\`
${data.therapist_notes}
\`\`\`` : '*No therapist notes available*'}

---

## 🔗 Related Notes

- [[MAIA Sessions Index]]
- [[Growth Tracking Dashboard]]
- [[Crisis Protocol Documentation]]
${data.therapist_id ? `- [[Therapist-${data.therapist_id}]]` : ''}
${data.themes.map(theme => `- [[Theme-${theme.replace(/\s+/g, '-')}]]`).join('\n')}

---

**Tags:** #maia-session #${data.risk_level}-risk #${data.status} ${data.themes.map(t => `#${t.replace(/\s+/g, '-')}`).join(' ')}
`;
  }

  private renderCanvas(data: SessionData): string {
    const sessionNode = {
      id: 'session-overview',
      type: 'file',
      file: `Sessions/${DateTime.fromISO(data.timestamp).toFormat('yyyy-MM-dd_HH-mm')}_${data.id.slice(-6)}.md`,
      x: 0,
      y: 0,
      width: 400,
      height: 300,
      color: data.risk_level === 'crisis' ? '5' : data.risk_level === 'high' ? '3' : '1'
    };

    const emotionalWeatherNode = {
      id: 'emotional-weather',
      type: 'text',
      text: `🌦️ Emotional Weather\n\n🔥 Fire: ${data.growth_metrics.emotional_weather.fire.toFixed(1)}\n🌊 Water: ${data.growth_metrics.emotional_weather.water.toFixed(1)}\n🌍 Earth: ${data.growth_metrics.emotional_weather.earth.toFixed(1)}\n🌪️ Air: ${data.growth_metrics.emotional_weather.air.toFixed(1)}`,
      x: 500,
      y: 0,
      width: 300,
      height: 200,
      color: '2'
    };

    const coherenceNode = {
      id: 'coherence',
      type: 'text',
      text: `📊 Coherence & Wellness\n\nCoherence: ${data.coherence.current.toFixed(2)}\nTrend: ${data.coherence.trend}\nPHQ-2: ${data.growth_metrics.wellness_scores.phq2}/6\nGAD-2: ${data.growth_metrics.wellness_scores.gad2}/6\nMood: ${data.growth_metrics.wellness_scores.session_mood}/10`,
      x: 900,
      y: 0,
      width: 300,
      height: 200,
      color: '4'
    };

    const breakthroughsNode = {
      id: 'breakthroughs',
      type: 'text',
      text: `💡 Breakthrough Timeline\n\n${data.breakthroughs.map(bt =>
        `${DateTime.fromISO(bt.timestamp).toFormat('HH:mm')} - ${bt.type}\n${bt.summary.slice(0, 50)}...`
      ).join('\n\n')}`,
      x: 0,
      y: 400,
      width: 500,
      height: 300,
      color: '6'
    };

    const safetyNode = {
      id: 'safety-events',
      type: 'text',
      text: `🛡️ Safety Events\n\n${data.safety_events.map(event =>
        `${DateTime.fromISO(event.timestamp).toFormat('HH:mm')} - ${event.type}\n${event.description.slice(0, 40)}...`
      ).join('\n\n')}`,
      x: 600,
      y: 400,
      width: 400,
      height: 300,
      color: data.safety_events.length > 0 ? '5' : '1'
    };

    const canvas = {
      nodes: [sessionNode, emotionalWeatherNode, coherenceNode, breakthroughsNode, safetyNode],
      edges: [
        { id: 'session-to-weather', fromNode: 'session-overview', toNode: 'emotional-weather', color: '2' },
        { id: 'session-to-coherence', fromNode: 'session-overview', toNode: 'coherence', color: '4' },
        { id: 'session-to-breakthroughs', fromNode: 'session-overview', toNode: 'breakthroughs', color: '6' },
        { id: 'session-to-safety', fromNode: 'session-overview', toNode: 'safety-events', color: '5' }
      ]
    };

    return JSON.stringify(canvas, null, 2);
  }

  private async createIndexFiles(): Promise<void> {
    const sessionIndexPath = path.join(this.indexPath, 'MAIA Sessions Index.md');
    const growthIndexPath = path.join(this.indexPath, 'Growth Tracking Dashboard.md');
    const crisisIndexPath = path.join(this.indexPath, 'Crisis Protocol Documentation.md');

    const sessionIndexContent = `# MAIA Sessions Index

This note automatically tracks all MAIA sessions exported to the vault.

## Recent Sessions

\`\`\`dataview
TABLE
  file.mtime as "Last Modified",
  risk-level as "Risk Level",
  status as "Status"
FROM "Sessions"
SORT file.mtime DESC
LIMIT 50
\`\`\`

## Sessions by Risk Level

### Crisis Sessions
\`\`\`dataview
LIST
FROM "Sessions" AND #crisis-risk
SORT file.mtime DESC
\`\`\`

### High Risk Sessions
\`\`\`dataview
LIST
FROM "Sessions" AND #high-risk
SORT file.mtime DESC
\`\`\`

## Growth Patterns

\`\`\`dataview
TABLE
  coherence-score as "Coherence",
  wellness-scores as "Wellness",
  breakthroughs as "Breakthroughs"
FROM "Sessions"
WHERE coherence-score
SORT file.mtime DESC
\`\`\`
`;

    const growthIndexContent = `# Growth Tracking Dashboard

## Overview

This dashboard aggregates growth metrics across all MAIA sessions.

## Emotional Weather Trends

\`\`\`dataview
TABLE
  emotional-weather-fire as "🔥 Fire",
  emotional-weather-water as "🌊 Water",
  emotional-weather-earth as "🌍 Earth",
  emotional-weather-air as "🌪️ Air"
FROM "Sessions"
WHERE emotional-weather-fire
SORT file.mtime DESC
LIMIT 20
\`\`\`

## Wellness Score Progression

\`\`\`dataview
TABLE
  phq2-score as "PHQ-2",
  gad2-score as "GAD-2",
  session-mood as "Mood"
FROM "Sessions"
WHERE phq2-score
SORT file.mtime DESC
LIMIT 20
\`\`\`

## Breakthrough Analysis

\`\`\`dataview
LIST
FROM "Sessions"
WHERE contains(file.content, "💡 BREAKTHROUGH")
SORT file.mtime DESC
\`\`\`
`;

    const crisisIndexContent = `# Crisis Protocol Documentation

## Active Crisis Procedures

1. **Immediate Assessment**
   - Risk level determination (moderate/high/crisis)
   - Safety plan activation
   - Therapist escalation if warranted

2. **72-Hour Follow-up Protocol**
   - 1 hour: Therapist reminder
   - 6 hours: User check-in
   - 24 hours: Safety assessment
   - 48 hours: Stability check
   - 72 hours: Care planning

3. **Escalation Pathways**
   - High risk: Assigned therapist notification
   - Crisis: Immediate intervention + emergency contacts

## Crisis Session Archive

\`\`\`dataview
TABLE
  risk-level as "Risk",
  safety-events as "Events",
  therapist-involved as "Therapist"
FROM "Sessions"
WHERE contains(tags, "#crisis-risk") OR contains(tags, "#high-risk")
SORT file.mtime DESC
\`\`\`
`;

    await fs.writeFile(sessionIndexPath, sessionIndexContent, 'utf-8');
    await fs.writeFile(growthIndexPath, growthIndexContent, 'utf-8');
    await fs.writeFile(crisisIndexPath, crisisIndexContent, 'utf-8');
  }

  private async updateIndexes(sessionData: SessionData, mdPath: string, canvasPath: string): Promise<void> {
    // Update session index with new entry
    const indexPath = path.join(this.indexPath, 'MAIA Sessions Index.md');
    const timestamp = DateTime.fromISO(sessionData.timestamp);

    const newEntry = `- [[${path.basename(mdPath, '.md')}]] - ${timestamp.toFormat('MMM dd, yyyy HH:mm')} - ${sessionData.risk_level} risk - ${sessionData.status}\n`;

    try {
      const existingContent = await fs.readFile(indexPath, 'utf-8');
      const lines = existingContent.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('## Recent Sessions')) + 3;
      lines.splice(insertIndex, 0, newEntry);
      await fs.writeFile(indexPath, lines.join('\n'), 'utf-8');
    } catch (error) {
      // Index file doesn't exist yet, will be created on next initialization
    }
  }

  // Helper methods for score interpretation
  private interpretPHQ2(score: number): string {
    return score >= 3 ? 'Positive screen for depression' : 'Negative screen';
  }

  private interpretGAD2(score: number): string {
    return score >= 3 ? 'Positive screen for anxiety' : 'Negative screen';
  }

  private interpretMood(score: number): string {
    if (score >= 8) return 'Very positive mood';
    if (score >= 6) return 'Generally positive';
    if (score >= 4) return 'Neutral/mixed';
    return 'Low mood concerns';
  }

  // Batch export functionality
  async batchExportSessions(sessions: SessionData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const session of sessions) {
      try {
        await this.exportSession(session);
        success++;
      } catch (error) {
        console.error(`Failed to export session ${session.id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  // Scheduled export job
  async scheduledExport(): Promise<void> {
    // This would be called by a cron job or scheduled task
    // Fetch recent sessions from database and export them
    console.log('Running scheduled Obsidian export...');

    // Implementation would query Supabase for sessions created since last export
    // and call batchExportSessions()
  }
}
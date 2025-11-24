/**
 * Obsidian Journal Exporter
 * Exports journal entries and MAIA reflections to Obsidian
 * Vault Path: /Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/Journals/
 */

import * as fs from 'fs';
import * as path from 'path';
import { JournalingMode, JournalingResponse } from './JournalingPrompts';

export interface JournalEntry {
  id: string;
  userId: string;
  mode: JournalingMode;
  entry: string;
  reflection: JournalingResponse;
  timestamp: Date;
  element?: string;
}

export interface ObsidianJournalConfig {
  vaultPath: string;
  createDailyNotes: boolean;
  addFrontmatter: boolean;
  groupByMode: boolean;
}

export class ObsidianJournalExporter {
  private config: ObsidianJournalConfig;

  constructor(config: Partial<ObsidianJournalConfig> = {}) {
    this.config = {
      vaultPath: config.vaultPath || '/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/Journals',
      createDailyNotes: config.createDailyNotes ?? true,
      addFrontmatter: config.addFrontmatter ?? true,
      groupByMode: config.groupByMode ?? false
    };
  }

  async exportJournalEntry(journalEntry: JournalEntry): Promise<{ success: boolean; filePath?: string }> {
    try {
      const yearMonth = this.getYearMonth(journalEntry.timestamp);
      const dateStr = this.formatDate(journalEntry.timestamp);

      const dir = this.config.groupByMode
        ? path.join(this.config.vaultPath, yearMonth, journalEntry.mode)
        : path.join(this.config.vaultPath, yearMonth);

      this.ensureDir(dir);

      const content = this.generateJournalMarkdown(journalEntry);

      const fileName = this.config.createDailyNotes
        ? `${dateStr}.md`
        : `${dateStr}-${this.formatTime(journalEntry.timestamp)}-${journalEntry.mode}.md`;

      const filePath = path.join(dir, fileName);

      if (this.config.createDailyNotes && fs.existsSync(filePath)) {
        fs.appendFileSync(filePath, `\n\n---\n\n${content}`);
      } else {
        fs.writeFileSync(filePath, content, 'utf-8');
      }

      return { success: true, filePath };
    } catch (error) {
      console.error('Journal export error:', error);
      return { success: false };
    }
  }

  private generateJournalMarkdown(journalEntry: JournalEntry): string {
    const { mode, entry, reflection, timestamp, element } = journalEntry;

    const modeEmoji = {
      free: '🌀',
      dream: '🔮',
      emotional: '💓',
      shadow: '🌓',
      direction: '🧭'
    };

    const frontmatter = this.config.addFrontmatter ? this.generateFrontmatter({
      type: 'journal-entry',
      mode,
      element: element || 'aether',
      symbols: reflection.symbols,
      archetypes: reflection.archetypes,
      emotionalTone: reflection.emotionalTone,
      date: timestamp.toISOString(),
      userId: journalEntry.userId
    }) : '';

    return `${frontmatter}## ${modeEmoji[mode]} ${this.getModeTitle(mode)} — ${timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}

### Your Entry

${entry}

---

### 🪞 MAIA Reflected

**Symbols Detected:** ${reflection.symbols.map(s => `[[${s}]]`).join(', ')}
**Archetypes:** ${reflection.archetypes.join(', ')}
**Emotional Tone:** ${reflection.emotionalTone}

#### Reflection

${reflection.reflection}

#### Invitation

${reflection.prompt}

#### Closing

${reflection.closing}

${reflection.metadata ? `
---

**Metadata**
${Object.entries(reflection.metadata).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
` : ''}

---

*Journaled with MAIA • ${timestamp.toLocaleString()}*
`;
  }

  private getModeTitle(mode: JournalingMode): string {
    const titles = {
      free: 'Free Expression',
      dream: 'Dream Integration',
      emotional: 'Emotional Processing',
      shadow: 'Shadow Work',
      direction: 'Life Direction'
    };
    return titles[mode];
  }

  private generateFrontmatter(data: Record<string, any>): string {
    const yaml = Object.entries(data)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    return `---
${yaml}
---

`;
  }

  private getYearMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0].replace(/:/g, '-');
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async exportBatch(entries: JournalEntry[]): Promise<{ success: boolean; exported: number }> {
    let exported = 0;

    for (const entry of entries) {
      const result = await this.exportJournalEntry(entry);
      if (result.success) {
        exported++;
      }
    }

    return { success: true, exported };
  }
}

export const obsidianJournalExporter = new ObsidianJournalExporter();
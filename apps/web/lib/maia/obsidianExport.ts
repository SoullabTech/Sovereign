import { JournalEntry } from './state';
import { JOURNALING_MODE_DESCRIPTIONS } from '../journaling/JournalingPrompts';

export interface ObsidianExportOptions {
  includeFrontmatter: boolean;
  includeReflection: boolean;
  includeMetadata: boolean;
  folderPath?: string;
}

export function generateObsidianMarkdown(
  entry: JournalEntry,
  options: ObsidianExportOptions = {
    includeFrontmatter: true,
    includeReflection: true,
    includeMetadata: true
  }
): string {
  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[entry.mode];
  const date = new Date(entry.timestamp);
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let markdown = '';

  if (options.includeFrontmatter) {
    markdown += '---\n';
    markdown += `title: "${modeInfo.name} Entry"\n`;
    markdown += `date: ${date.toISOString()}\n`;
    markdown += `mode: ${entry.mode}\n`;
    markdown += `type: journal\n`;

    if (entry.reflection) {
      markdown += `tags:\n`;
      entry.reflection.symbols.forEach(symbol => {
        markdown += `  - ${symbol.replace(/\s+/g, '-').toLowerCase()}\n`;
      });
      entry.reflection.archetypes.forEach(archetype => {
        markdown += `  - ${archetype.replace(/\s+/g, '-').toLowerCase()}\n`;
      });
      markdown += `emotional-tone: ${entry.reflection.emotionalTone}\n`;
    }

    markdown += `word-count: ${entry.wordCount}\n`;
    if (entry.duration) {
      markdown += `duration: ${Math.floor(entry.duration / 60)}m ${entry.duration % 60}s\n`;
    }
    markdown += `voice-entry: ${entry.isVoice}\n`;
    markdown += '---\n\n';
  }

  markdown += `# ${modeInfo.icon} ${modeInfo.name}\n\n`;
  markdown += `**${dateStr} at ${timeStr}**\n\n`;

  if (entry.mode && modeInfo) {
    markdown += `> *${modeInfo.prompt}*\n\n`;
  }

  markdown += `## Entry\n\n`;
  markdown += `${entry.content}\n\n`;

  if (options.includeReflection && entry.reflection) {
    markdown += `## MAIA's Reflection\n\n`;
    markdown += `${entry.reflection.reflection}\n\n`;

    if (entry.reflection.symbols.length > 0) {
      markdown += `### Symbols\n`;
      entry.reflection.symbols.forEach(symbol => {
        markdown += `- ${symbol}\n`;
      });
      markdown += '\n';
    }

    if (entry.reflection.archetypes.length > 0) {
      markdown += `### Archetypes\n`;
      entry.reflection.archetypes.forEach(archetype => {
        markdown += `- ${archetype}\n`;
      });
      markdown += '\n';
    }

    markdown += `### Emotional Tone\n`;
    markdown += `${entry.reflection.emotionalTone}\n\n`;

    markdown += `### Invitation\n`;
    markdown += `> *${entry.reflection.prompt}*\n\n`;

    markdown += `---\n\n`;
    markdown += `*${entry.reflection.closing}*\n`;
  }

  if (options.includeMetadata) {
    markdown += `\n---\n\n`;
    markdown += `**Session Info:**\n`;
    markdown += `- Words: ${entry.wordCount}\n`;
    if (entry.duration) {
      markdown += `- Duration: ${Math.floor(entry.duration / 60)}m ${entry.duration % 60}s\n`;
    }
    markdown += `- Mode: ${modeInfo.name}\n`;
    markdown += `- Voice: ${entry.isVoice ? 'Yes' : 'No'}\n`;
  }

  return markdown;
}

export function exportToObsidian(entry: JournalEntry, options?: ObsidianExportOptions): void {
  const markdown = generateObsidianMarkdown(entry, options);
  const date = new Date(entry.timestamp);
  const dateStr = date.toISOString().split('T')[0];
  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[entry.mode];
  const filename = `${dateStr}-${modeInfo.name.replace(/\s+/g, '-')}.md`;

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAllToObsidian(entries: JournalEntry[], options?: ObsidianExportOptions): void {
  const markdown = entries
    .map(entry => generateObsidianMarkdown(entry, options))
    .join('\n\n---\n\n');

  const filename = `MAIA-Journal-Export-${new Date().toISOString().split('T')[0]}.md`;

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const obsidianExportService = {
  generateMarkdown: generateObsidianMarkdown,
  exportEntry: exportToObsidian,
  exportAll: exportAllToObsidian
};
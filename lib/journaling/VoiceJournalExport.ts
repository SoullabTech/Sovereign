import { VoiceJournalSession } from './VoiceJournalingService';
import { JOURNALING_MODES } from './JournalingPrompts';

export interface ExportOptions {
  includeMetadata: boolean;
  includeTranscript: boolean;
  includeAnalysis: boolean;
  includeSymbols: boolean;
  includeTimestamps: boolean;
  format: 'obsidian' | 'pdf';
}

export class VoiceJournalExporter {
  generateObsidianMarkdown(
    session: VoiceJournalSession,
    options: Partial<ExportOptions> = {}
  ): string {
    const opts: ExportOptions = {
      includeMetadata: true,
      includeTranscript: true,
      includeAnalysis: true,
      includeSymbols: true,
      includeTimestamps: true,
      format: 'obsidian',
      ...options,
    };

    const modeInfo = JOURNALING_MODES[session.mode];
    const date = new Date(session.startTime);
    let markdown = '';

    if (opts.includeMetadata) {
      markdown += '---\n';
      markdown += `title: "Voice Journal - ${modeInfo.name}"\n`;
      markdown += `date: ${date.toISOString()}\n`;
      markdown += `type: voice-journal\n`;
      markdown += `mode: ${session.mode}\n`;
      markdown += `element: ${session.element}\n`;
      markdown += `duration: ${session.duration || 0}s\n`;
      markdown += `word-count: ${session.wordCount}\n`;

      if (session.analysis?.transformationScore) {
        markdown += `transformation-score: ${session.analysis.transformationScore}\n`;
      }

      markdown += 'tags:\n';
      markdown += `  - voice-journal\n`;
      markdown += `  - ${session.mode}\n`;
      markdown += `  - ${session.element}\n`;

      if (opts.includeSymbols && session.analysis?.symbols) {
        session.analysis.symbols.forEach(symbol => {
          markdown += `  - ${symbol.replace(/\s+/g, '-').toLowerCase()}\n`;
        });
      }

      markdown += '---\n\n';
    }

    markdown += `# 🎙️ Voice Journal: ${modeInfo.name}\n\n`;

    if (opts.includeTimestamps) {
      markdown += `**Date:** ${date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}\n`;
      markdown += `**Time:** ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}\n`;
      markdown += `**Duration:** ${this.formatDuration(session.duration || 0)}\n`;
      markdown += `**Element:** ${this.getElementEmoji(session.element)} ${session.element}\n\n`;
    }

    markdown += `> *${modeInfo.prompt}*\n\n`;

    markdown += '---\n\n';

    if (opts.includeTranscript) {
      markdown += '## 📝 Transcript\n\n';
      markdown += `${session.transcript}\n\n`;
      markdown += `*${session.wordCount} words spoken*\n\n`;
    }

    if (opts.includeAnalysis && session.analysis) {
      markdown += '---\n\n';
      markdown += '## 🔮 MAIA\'s Reflection\n\n';
      markdown += `${session.analysis.reflection}\n\n`;

      if (session.analysis.transformationScore) {
        markdown += `**Transformation Score:** ${session.analysis.transformationScore}%\n\n`;
      }

      if (opts.includeSymbols) {
        if (session.analysis.symbols && session.analysis.symbols.length > 0) {
          markdown += '### Symbols Detected\n\n';
          session.analysis.symbols.forEach(symbol => {
            markdown += `- ${symbol}\n`;
          });
          markdown += '\n';
        }

        if (session.analysis.archetypes && session.analysis.archetypes.length > 0) {
          markdown += '### Archetypes Present\n\n';
          session.analysis.archetypes.forEach(archetype => {
            markdown += `- ${archetype}\n`;
          });
          markdown += '\n';
        }

        if (session.analysis.emotionalTone) {
          markdown += `### Emotional Tone\n\n${session.analysis.emotionalTone}\n\n`;
        }
      }
    }

    markdown += '---\n\n';
    markdown += `*Recorded with MAIA Voice Journal*\n`;

    return markdown;
  }

  generateHTMLForPDF(
    session: VoiceJournalSession,
    options: Partial<ExportOptions> = {}
  ): string {
    const opts: ExportOptions = {
      includeMetadata: true,
      includeTranscript: true,
      includeAnalysis: true,
      includeSymbols: true,
      includeTimestamps: true,
      format: 'pdf',
      ...options,
    };

    const modeInfo = JOURNALING_MODES[session.mode];
    const date = new Date(session.startTime);

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Voice Journal - ${modeInfo.name}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #9333ea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #9333ea;
      font-size: 2.5em;
      margin: 0;
    }
    .metadata {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .metadata-item {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #9333ea;
      font-size: 1.5em;
      margin-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }
    .transcript {
      font-family: 'Courier New', monospace;
      background: #f9f9f9;
      padding: 20px;
      border-left: 4px solid #9333ea;
      margin: 20px 0;
    }
    .reflection {
      background: #faf5ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #9333ea;
    }
    .symbols {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 15px 0;
    }
    .symbol {
      background: #e0e7ff;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #999;
      font-size: 0.9em;
    }
    .element-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      color: white;
    }
    .element-fire { background: linear-gradient(135deg, #ef4444, #f97316); }
    .element-water { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
    .element-earth { background: linear-gradient(135deg, #16a34a, #10b981); }
    .element-air { background: linear-gradient(135deg, #0ea5e9, #6366f1); }
    .element-aether { background: linear-gradient(135deg, #a855f7, #8b5cf6); }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎙️ Voice Journal</h1>
    <h2>${modeInfo.name}</h2>
  </div>

  ${opts.includeTimestamps ? `
  <div class="metadata">
    <div class="metadata-item">
      <strong>Date:</strong>
      <span>${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
    <div class="metadata-item">
      <strong>Time:</strong>
      <span>${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    <div class="metadata-item">
      <strong>Duration:</strong>
      <span>${this.formatDuration(session.duration || 0)}</span>
    </div>
    <div class="metadata-item">
      <strong>Word Count:</strong>
      <span>${session.wordCount} words</span>
    </div>
    <div class="metadata-item">
      <strong>Element:</strong>
      <span class="element-badge element-${session.element}">${this.getElementEmoji(session.element)} ${session.element}</span>
    </div>
    ${session.analysis?.transformationScore ? `
    <div class="metadata-item">
      <strong>Transformation Score:</strong>
      <span>${session.analysis.transformationScore}%</span>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div class="section">
    <p><em>${modeInfo.prompt}</em></p>
  </div>

  ${opts.includeTranscript ? `
  <div class="section">
    <div class="section-title">📝 Transcript</div>
    <div class="transcript">${this.escapeHtml(session.transcript)}</div>
  </div>
  ` : ''}

  ${opts.includeAnalysis && session.analysis ? `
  <div class="section">
    <div class="section-title">🔮 MAIA's Reflection</div>
    <div class="reflection">
      ${this.escapeHtml(session.analysis.reflection)}
    </div>
  </div>

  ${opts.includeSymbols && session.analysis.symbols && session.analysis.symbols.length > 0 ? `
  <div class="section">
    <div class="section-title">✨ Symbols Detected</div>
    <div class="symbols">
      ${session.analysis.symbols.map(symbol => `<span class="symbol">${this.escapeHtml(symbol)}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${opts.includeSymbols && session.analysis.archetypes && session.analysis.archetypes.length > 0 ? `
  <div class="section">
    <div class="section-title">🎭 Archetypes Present</div>
    <div class="symbols">
      ${session.analysis.archetypes.map(archetype => `<span class="symbol">${this.escapeHtml(archetype)}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${opts.includeSymbols && session.analysis.emotionalTone ? `
  <div class="section">
    <div class="section-title">💫 Emotional Tone</div>
    <p>${this.escapeHtml(session.analysis.emotionalTone)}</p>
  </div>
  ` : ''}
  ` : ''}

  <div class="footer">
    Recorded with MAIA Voice Journal
  </div>
</body>
</html>
`;

    return html;
  }

  downloadAsMarkdown(session: VoiceJournalSession, options?: Partial<ExportOptions>): void {
    const markdown = this.generateObsidianMarkdown(session, options);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-journal-${new Date(session.startTime).toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async downloadAsPDF(session: VoiceJournalSession, options?: Partial<ExportOptions>): Promise<void> {
    const html = this.generateHTMLForPDF(session, options);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  private getElementEmoji(element: string): string {
    const emojis: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '⛰️',
      air: '💨',
      aether: '✨',
    };
    return emojis[element] || '✨';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const voiceJournalExporter = new VoiceJournalExporter();
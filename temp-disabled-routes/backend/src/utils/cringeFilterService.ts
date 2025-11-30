// src/utils/cringeFilterService.ts

interface CringePattern {
  pattern: RegExp;
  replacement: string;
  severity: 'high' | 'medium' | 'low';
}

const patterns: CringePattern[] = [
  // High severity - immediately cringe-worthy phrases
  { pattern: /\b(blessed be|namaste|divine light|cosmic energy)\b/gi, replacement: '', severity: 'high' },
  { pattern: /\byour journey is so (beautiful|sacred|blessed)\b/gi, replacement: 'your path forward', severity: 'high' },
  { pattern: /\bI see your beautiful soul\b/gi, replacement: "I understand where you're coming from", severity: 'high' },
  { pattern: /\bthe universe has a plan\b/gi, replacement: 'patterns often emerge', severity: 'high' },
  
  // Medium severity - overly flowery or dated expressions
  { pattern: /\bmuch love and light\b/gi, replacement: '', severity: 'medium' },
  { pattern: /\bsending you (positive vibes|good energy)\b/gi, replacement: 'hope this helps', severity: 'medium' },
  { pattern: /\byour aura is\b/gi, replacement: 'you seem', severity: 'medium' },
  { pattern: /\bI'm getting (strong vibes|energy) that\b/gi, replacement: 'it seems like', severity: 'medium' },
  
  // Low severity - stilted AI-speak
  { pattern: /\bas an AI,? I (cannot|can't|am not able to)\b/gi, replacement: "I can't", severity: 'low' },
  { pattern: /\bit's important to (remember|note|understand) that\b/gi, replacement: '', severity: 'low' },
  { pattern: /\bplease feel free to\b/gi, replacement: 'you can', severity: 'low' },
  { pattern: /\bI hope this helps!?\s*$/gi, replacement: '', severity: 'low' },
  
  // Contemporary language improvements
  { pattern: /\bthat being said\b/gi, replacement: '', severity: 'low' },
  { pattern: /\bat the end of the day\b/gi, replacement: 'ultimately', severity: 'low' },
  { pattern: /\bto be honest with you\b/gi, replacement: '', severity: 'low' },
  
  // Remove excessive qualifiers that weaken the message
  { pattern: /\bI think perhaps maybe\b/gi, replacement: 'perhaps', severity: 'medium' },
  { pattern: /\bif you don't mind me saying\b/gi, replacement: '', severity: 'medium' },
];

export const cringeFilterService = {
  /**
   * Filters out cringe patterns with modern, intelligent language
   * @param text The original text
   * @param mode 'gentle' | 'standard' | 'aggressive' - how strict to be
   */
  filter(text: string, mode: 'gentle' | 'standard' | 'aggressive' = 'standard'): string {
    let filtered = text;
    
    const severityThresholds = {
      gentle: ['high'],
      standard: ['high', 'medium'],
      aggressive: ['high', 'medium', 'low']
    };
    
    const activePatterns = patterns.filter(p => 
      severityThresholds[mode].includes(p.severity)
    );
    
    for (const { pattern, replacement } of activePatterns) {
      filtered = filtered.replace(pattern, replacement);
    }
    
    // Clean up extra spaces and punctuation
    return filtered
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([,.!?])/g, '$1')
      .replace(/^\.\s*/gm, '')  // Remove lines that start with just punctuation
      .trim();
  },

  /**
   * Adaptive filtering based on user's communication style
   * @param text The text to filter
   * @param userStyle 'casual' | 'formal' | 'spiritual' - detected user preference
   */
  adaptiveFilter(text: string, userStyle: 'casual' | 'formal' | 'spiritual' = 'casual'): string {
    // Be less aggressive with spiritual language if user uses it
    if (userStyle === 'spiritual') {
      return this.filter(text, 'gentle');
    }
    
    // Standard filtering for most interactions
    if (userStyle === 'casual') {
      return this.filter(text, 'standard');
    }
    
    // More conservative filtering for formal contexts
    return this.filter(text, 'aggressive');
  }
};
/**
 * Poetic Modes Service
 * Controls greeting style formatting between prose, verse, and auto modes
 */

/**
 * Blends lines into smooth prose with natural transitions
 */
export function poeticBlend(lines: string[]): string {
  if (lines.length === 0) return '';
  if (lines.length === 1) return lines[0];

  // Transition words for natural flow
  const transitions = {
    temporal: ['and', 'while', 'as', 'when'],
    causal: ['because', 'since', 'for'],
    additive: ['also', 'moreover', 'and'],
    contrastive: ['yet', 'though', 'but'],
    sequential: ['then', 'now', 'next']
  };

  const blended: string[] = [];
  
  lines.forEach((line, index) => {
    if (index === 0) {
      // First line stands alone
      blended.push(line);
    } else if (index === lines.length - 1) {
      // Last line often a question or invitation
      if (line.includes('?') || line.startsWith('What') || line.startsWith('How')) {
        blended.push(line);
      } else {
        // Connect with a flowing transition
        const connector = pickRandom(transitions.sequential);
        blended.push(`${connector} ${line.toLowerCase()}`);
      }
    } else {
      // Middle lines get varied connectors
      const transitionType = getTransitionType(lines[index - 1], line);
      const connector = pickRandom(transitions[transitionType]);
      blended.push(`${connector} ${line.toLowerCase()}`);
    }
  });

  // Join with appropriate punctuation
  let result = blended[0];
  for (let i = 1; i < blended.length; i++) {
    const prev = blended[i - 1];
    const curr = blended[i];
    
    // Add comma or semicolon based on sentence weight
    if (prev.length > 50 && !prev.endsWith('.') && !prev.endsWith('?')) {
      result += '; ' + curr;
    } else if (curr.includes('?')) {
      result += ' ' + curr;
    } else {
      result += ', ' + curr;
    }
  }

  return result;
}

/**
 * Determines transition type based on content
 */
function getTransitionType(prevLine: string, currLine: string): keyof typeof transitionTypes {
  // If talking about time
  if (/yesterday|today|tomorrow|days|weeks|time/.test(currLine.toLowerCase())) {
    return 'temporal';
  }
  
  // If contrasting elements
  if ((prevLine.includes('fire') && currLine.includes('water')) ||
      (prevLine.includes('light') && currLine.includes('dark'))) {
    return 'contrastive';
  }
  
  // If building on previous thought
  if (currLine.includes('also') || currLine.includes('too')) {
    return 'additive';
  }
  
  // Default to sequential
  return 'sequential';
}

const transitionTypes = {
  temporal: 0,
  causal: 1,
  additive: 2,
  contrastive: 3,
  sequential: 4
};

/**
 * Format greeting based on style preference
 */
export function formatGreeting(
  lines: string[], 
  style: 'prose' | 'poetic' | 'auto' = 'auto',
  symbolDensity: number = 0
): string {
  if (lines.length === 0) return '';

  // Clean up lines first
  const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0);

  if (style === 'poetic') {
    // Return as verse with line breaks
    return formatAsVerse(cleanLines);
  }

  if (style === 'prose') {
    // Smooth blend into paragraph
    return poeticBlend(cleanLines);
  }

  // Auto mode: decide based on context
  // Higher chance of poetry if symbol-dense or emotionally charged
  const poetryChance = calculatePoetryChance(cleanLines, symbolDensity);
  
  if (Math.random() < poetryChance) {
    return formatAsVerse(cleanLines);
  }
  
  return poeticBlend(cleanLines);
}

/**
 * Format lines as poetic verse
 */
function formatAsVerse(lines: string[]): string {
  // Add subtle formatting for verse
  return lines
    .map((line, index) => {
      // First line gets no indent
      if (index === 0) return line;
      
      // Questions stay unindented
      if (line.includes('?')) return '\n' + line;
      
      // Short lines (< 40 chars) get indented
      if (line.length < 40) return '\n  ' + line;
      
      // Regular lines
      return '\n' + line;
    })
    .join('');
}

/**
 * Calculate probability of using poetic format
 */
function calculatePoetryChance(lines: string[], symbolDensity: number): number {
  let chance = 0.15; // Base 15% chance
  
  // Increase chance based on symbol density
  chance += symbolDensity * 0.1;
  
  // Increase if contains poetic keywords
  const poeticWords = ['moon', 'star', 'dream', 'soul', 'spirit', 'shadow', 'light', 'dance', 'weave'];
  const wordCount = lines.join(' ').toLowerCase().split(' ');
  const poeticCount = wordCount.filter(word => 
    poeticWords.some(pw => word.includes(pw))
  ).length;
  
  chance += (poeticCount / wordCount.length) * 0.3;
  
  // Increase if short, punchy lines
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  if (avgLineLength < 50) chance += 0.1;
  
  // Cap at 60% to maintain some unpredictability
  return Math.min(chance, 0.6);
}

/**
 * Helper to pick random element
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Detect if content suggests poetic mode
 */
export function suggestPoetic(content: string): boolean {
  const poeticIndicators = [
    /\bdream/i,
    /\bpoem/i,
    /\bverse/i,
    /\bsong/i,
    /\brhythm/i,
    /\bmetaphor/i,
    /\bsymbol/i,
    /\bmyth/i
  ];
  
  return poeticIndicators.some(pattern => pattern.test(content));
}
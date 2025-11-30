/**
 * Poetic Blender - Merges prompt lines into flowing, natural prose
 * Prevents modular feel by creating fluid transitions
 */

interface BlendOptions {
  style?: 'prose' | 'verse' | 'haiku';
  maxLength?: number;
  preserveEmojis?: boolean;
}

// Connector types with weights for selection
const connectorGroups = {
  flowing: [
    " — ",
    ", and ",
    " as ",
    " while ",
    ", where ",
    " though "
  ],
  punctuated: [
    ". ",
    "; ",
    "... "
  ],
  contrasting: [
    " yet ",
    ", but ",
    " although ",
    " even as "
  ],
  causal: [
    " because ",
    " since ",
    " for ",
    ", so "
  ],
  temporal: [
    " now ",
    " when ",
    " until ",
    " after "
  ]
};

/**
 * Main blending function - takes multiple prompt lines and merges them
 */
export function poeticBlend(lines: string[], options: BlendOptions = {}): string {
  const { style = 'prose', preserveEmojis = true } = options;
  
  if (lines.length === 0) return "";
  
  // Clean and prepare lines
  const cleaned = lines.map(l => l.trim()).filter(Boolean);
  
  if (cleaned.length === 1) return cleaned[0];
  
  switch (style) {
    case 'verse':
      return blendAsVerse(cleaned);
    case 'haiku':
      return blendAsHaiku(cleaned);
    default:
      return blendAsProse(cleaned, preserveEmojis);
  }
}

/**
 * Blend lines into flowing prose
 */
function blendAsProse(lines: string[], preserveEmojis: boolean): string {
  // Separate emojis if needed
  const emojis: string[] = [];
  const textLines = lines.map(line => {
    if (preserveEmojis) {
      const emojiMatch = line.match(/^([🔥💧⛰🌬✨]+)\s*/);
      if (emojiMatch) {
        emojis.push(emojiMatch[1]);
        return line.replace(emojiMatch[0], '');
      }
    }
    return line;
  });
  
  // Smart connector selection based on content
  const connectors = selectConnectors(textLines);
  
  let result = textLines[0];
  
  for (let i = 1; i < textLines.length; i++) {
    const connector = connectors[i - 1];
    const nextLine = textLines[i];
    
    // Handle punctuation at end of previous segment
    if (result.endsWith('.') || result.endsWith('!') || result.endsWith('?')) {
      result += ' ' + capitalizeFirst(nextLine);
    } else if (connector.startsWith('.') || connector.startsWith(';')) {
      result += connector + capitalizeFirst(nextLine);
    } else {
      // Lowercase the first letter for fluid connection
      result += connector + lowercaseFirst(nextLine);
    }
  }
  
  // Add back the first emoji if preserved
  if (preserveEmojis && emojis.length > 0) {
    result = emojis[0] + ' ' + result;
  }
  
  return ensureProperEnding(capitalizeFirst(result));
}

/**
 * Blend lines into verse format
 */
function blendAsVerse(lines: string[]): string {
  if (lines.length <= 2) {
    return lines.join('\n');
  }
  
  // Group lines into couplets or tercets
  const verses: string[] = [];
  
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      // Create couplet with internal rhyme or assonance
      const couplet = createCouplet(lines[i], lines[i + 1]);
      verses.push(couplet);
    } else {
      // Odd line becomes its own verse
      verses.push(lines[i]);
    }
  }
  
  return verses.join('\n\n');
}

/**
 * Create a couplet from two lines
 */
function createCouplet(line1: string, line2: string): string {
  // Remove ending punctuation for flow
  const clean1 = line1.replace(/[.,;:]$/, '');
  const clean2 = line2.replace(/[.,;:]$/, '');
  
  // Find a rhythmic connection
  const connectors = [
    ` —\n${clean2}`,
    `,\n${lowercaseFirst(clean2)}`,
    `;\n${clean2}`,
    `\n   where ${lowercaseFirst(clean2)}`,
    `\n   and ${lowercaseFirst(clean2)}`
  ];
  
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  return clean1 + connector;
}

/**
 * Blend lines into haiku-inspired format (5-7-5 feeling, not strict syllables)
 */
function blendAsHaiku(lines: string[]): string {
  if (lines.length === 0) return "";
  
  // Extract key images from lines
  const images = lines.map(extractKeyImage);
  
  // Build three-line structure
  const haiku: string[] = [];
  
  // First line - setting/element
  haiku.push(images[0] || lines[0].split(/[—,;]/)[0].trim());
  
  // Second line - movement/transformation
  if (lines.length > 1) {
    const middle = findMovementPhrase(lines[1]) || images[1] || "mystery deepens, turns";
    haiku.push(middle);
  } else {
    haiku.push("the spiral turns, deepens");
  }
  
  // Third line - insight/landing
  if (lines.length > 2) {
    const ending = extractEnding(lines[lines.length - 1]);
    haiku.push(ending);
  } else {
    haiku.push("presence holds all");
  }
  
  return haiku.map(line => line.toLowerCase()).join('\n');
}

/**
 * Extract key image from a line
 */
function extractKeyImage(line: string): string {
  // Look for strong nouns and their descriptors
  const patterns = [
    /(\w+\s+)?(moon|sun|river|tree|fire|water|earth|air|stag|phoenix|butterfly|ocean|mountain|wolf|snake)/i,
    /(sacred|deep|ancient|wild|golden|silver|shadow|light)\s+\w+/i,
    /\b(transformation|initiation|descent|integration|wholeness|return)\b/i
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) return match[0];
  }
  
  // Fallback to first few words
  return line.split(/[—,;.]/)[0].trim().split(' ').slice(0, 3).join(' ');
}

/**
 * Find movement/verb phrase
 */
function findMovementPhrase(line: string): string | null {
  const patterns = [
    /(rises|falls|flows|burns|transforms|shifts|opens|closes|deepens|spirals)/i,
    /(calling|teaching|guiding|holding|carrying|weaving)/i,
    /(stirs|awakens|emerges|unfolds|gathers)/i
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      // Get surrounding context
      const words = line.split(' ');
      const idx = words.findIndex(w => w.includes(match[1]));
      if (idx > 0) {
        return words.slice(Math.max(0, idx - 1), Math.min(words.length, idx + 3)).join(' ');
      }
      return match[0];
    }
  }
  
  return null;
}

/**
 * Extract a poetic ending from a line
 */
function extractEnding(line: string): string {
  // Look for phrases after dashes or last clause
  const parts = line.split(/[—]/);
  if (parts.length > 1) {
    return parts[parts.length - 1].trim().split(' ').slice(0, 4).join(' ');
  }
  
  // Take last few meaningful words
  const words = line.split(' ').filter(w => w.length > 2);
  return words.slice(-3).join(' ');
}

/**
 * Select appropriate connectors based on content analysis
 */
function selectConnectors(lines: string[]): string[] {
  const connectors: string[] = [];
  
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i].toLowerCase();
    const next = lines[i + 1].toLowerCase();
    
    // Determine relationship between lines
    if (hasContrast(current, next)) {
      connectors.push(pickRandom(connectorGroups.contrasting));
    } else if (hasCausalRelation(current, next)) {
      connectors.push(pickRandom(connectorGroups.causal));
    } else if (hasTemporal(current, next)) {
      connectors.push(pickRandom(connectorGroups.temporal));
    } else if (Math.random() > 0.7) {
      // Sometimes use punctuation for variety
      connectors.push(pickRandom(connectorGroups.punctuated));
    } else {
      // Default to flowing connectors
      connectors.push(pickRandom(connectorGroups.flowing));
    }
  }
  
  return connectors;
}

/**
 * Detect contrast between lines
 */
function hasContrast(line1: string, line2: string): boolean {
  const contrastPairs = [
    ['light', 'dark'],
    ['fire', 'water'],
    ['earth', 'air'],
    ['strong', 'gentle'],
    ['rise', 'fall'],
    ['expand', 'contract']
  ];
  
  return contrastPairs.some(([word1, word2]) => 
    (line1.includes(word1) && line2.includes(word2)) ||
    (line1.includes(word2) && line2.includes(word1))
  );
}

/**
 * Detect causal relationship
 */
function hasCausalRelation(line1: string, line2: string): boolean {
  const causalWords = ['therefore', 'thus', 'hence', 'so', 'because'];
  return causalWords.some(word => line2.includes(word));
}

/**
 * Detect temporal markers
 */
function hasTemporal(line1: string, line2: string): boolean {
  const temporalWords = ['now', 'then', 'when', 'after', 'before', 'until'];
  return temporalWords.some(word => line2.includes(word));
}

/**
 * Utility functions
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowercaseFirst(str: string): string {
  if (!str) return str;
  // Preserve if it starts with "I" or a proper noun
  if (str.startsWith('I ') || /^[A-Z][a-z]+/.test(str.split(' ')[0])) {
    return str;
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function ensureProperEnding(str: string): string {
  if (!str) return str;
  // Add period if no ending punctuation
  if (!/[.!?]$/.test(str)) {
    return str + '.';
  }
  return str;
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Advanced blending with symbol weaving
 */
export function weaveSymbols(
  primary: string,
  symbols: string[],
  elements: string[]
): string {
  // Start with primary message
  let woven = primary;
  
  // Weave in symbols subtly
  if (symbols.length > 0) {
    const symbolPhrase = symbols.length === 1
      ? `${symbols[0]} guides the way`
      : `${symbols[0]} and ${symbols[1]} dance together`;
    
    woven = poeticBlend([woven, symbolPhrase]);
  }
  
  // Add elemental layer if present
  if (elements.length > 0) {
    const elementPhrase = `${elements[0]} energy flows through`;
    woven = poeticBlend([woven, elementPhrase], { preserveEmojis: true });
  }
  
  return woven;
}

/**
 * Generate a blessing-style greeting
 */
export function createBlessing(elements: string[]): string {
  const blessings: Record<string, string[]> = {
    fire: [
      "May your fire burn true",
      "Let flame guide transformation",
      "Fire bless your courage"
    ],
    water: [
      "May waters flow gently",
      "Let feelings find their course",
      "Water bless your depths"
    ],
    earth: [
      "May earth hold you steady",
      "Let roots deepen in truth",
      "Earth bless your foundation"
    ],
    air: [
      "May clarity find you",
      "Let breath bring perspective",
      "Air bless your thoughts"
    ],
    aether: [
      "May mystery guide you",
      "Let spirit illuminate the path",
      "Aether bless your journey"
    ]
  };
  
  const selectedBlessings = elements
    .map(elem => blessings[elem]?.[Math.floor(Math.random() * blessings[elem].length)])
    .filter(Boolean);
  
  if (selectedBlessings.length === 0) {
    return "May your path unfold with grace.";
  }
  
  return poeticBlend(selectedBlessings, { style: 'verse' });
}
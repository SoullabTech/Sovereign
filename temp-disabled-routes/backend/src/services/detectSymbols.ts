/**
 * Symbol Detection Service
 * Detects archetypal symbols in user content and tracks patterns
 */

import { SYMBOL_DICTIONARY, SymbolEntry } from './symbolDictionary';

export interface DetectedSymbol {
  label: string;
  element?: string;
  archetype?: string;
  meaning?: string;
  weight?: number;
  frequency?: number;  // How many times it appeared
  context?: string;    // Snippet of text where it was found
}

/**
 * Detect symbols in content
 */
export function detectSymbols(content: string): DetectedSymbol[] {
  const startTime = performance.now();
  const matches: DetectedSymbol[] = [];
  const foundLabels = new Set<string>();

  SYMBOL_DICTIONARY.forEach(entry => {
    const matchArray = content.match(entry.regex);
    if (matchArray) {
      // Avoid duplicate labels
      if (!foundLabels.has(entry.label)) {
        foundLabels.add(entry.label);
        
        // Extract context snippet around the match
        const matchIndex = content.search(entry.regex);
        const contextStart = Math.max(0, matchIndex - 30);
        const contextEnd = Math.min(content.length, matchIndex + matchArray[0].length + 30);
        const context = content.substring(contextStart, contextEnd).trim();
        
        matches.push({
          label: entry.label,
          element: entry.element,
          archetype: entry.archetype,
          meaning: entry.meaning,
          weight: entry.weight || 5,
          frequency: 1,
          context: contextStart > 0 ? '...' + context : context
        });
      }
    }
  });

  const processingTime = performance.now() - startTime;
  
  // Warn if symbol detection is taking too long
  if (processingTime > 20) {
    console.warn(`[SYMBOL_DETECTION] Slow processing: ${processingTime.toFixed(1)}ms for ${content.length} chars`);
  }

  // Sort by weight (most significant symbols first)
  return matches.sort((a, b) => (b.weight || 5) - (a.weight || 5));
}

/**
 * Detect symbols across multiple pieces of content
 * Aggregates frequencies and identifies patterns
 */
export function detectSymbolPatterns(contents: string[]): {
  symbols: DetectedSymbol[];
  dominantElement?: string;
  dominantArchetype?: string;
  recurringSymbols: DetectedSymbol[];
} {
  const symbolMap = new Map<string, DetectedSymbol>();
  const elementCounts = new Map<string, number>();
  const archetypeCounts = new Map<string, number>();

  // Process each content piece
  contents.forEach(content => {
    const detected = detectSymbols(content);
    
    detected.forEach(symbol => {
      // Aggregate symbol frequencies
      if (symbolMap.has(symbol.label)) {
        const existing = symbolMap.get(symbol.label)!;
        existing.frequency = (existing.frequency || 1) + 1;
      } else {
        symbolMap.set(symbol.label, { ...symbol });
      }
      
      // Count elements
      if (symbol.element) {
        elementCounts.set(symbol.element, (elementCounts.get(symbol.element) || 0) + 1);
      }
      
      // Count archetypes
      if (symbol.archetype) {
        archetypeCounts.set(symbol.archetype, (archetypeCounts.get(symbol.archetype) || 0) + 1);
      }
    });
  });

  // Convert map to array and sort by frequency
  const allSymbols = Array.from(symbolMap.values())
    .sort((a, b) => (b.frequency || 1) - (a.frequency || 1));

  // Find recurring symbols (appeared 2+ times)
  const recurringSymbols = allSymbols.filter(s => (s.frequency || 1) >= 2);

  // Find dominant element
  let dominantElement: string | undefined;
  if (elementCounts.size > 0) {
    dominantElement = Array.from(elementCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // Find dominant archetype
  let dominantArchetype: string | undefined;
  if (archetypeCounts.size > 0) {
    dominantArchetype = Array.from(archetypeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  return {
    symbols: allSymbols,
    dominantElement,
    dominantArchetype,
    recurringSymbols
  };
}

/**
 * Generate narrative thread from detected symbols
 */
export function generateSymbolNarrative(symbols: DetectedSymbol[]): string {
  if (symbols.length === 0) return '';

  const recurring = symbols.filter(s => (s.frequency || 1) >= 2);
  
  if (recurring.length === 0) {
    // Single appearance narrative
    const topSymbol = symbols[0];
    return `The ${topSymbol.label} appears in your spiral${topSymbol.meaning ? `, speaking of ${topSymbol.meaning.toLowerCase()}` : ''}.`;
  }

  // Multiple/recurring narrative
  const topTwo = recurring.slice(0, 2);
  
  if (topTwo.length === 1) {
    const symbol = topTwo[0];
    return `The ${symbol.label} keeps returning to you, ${symbol.frequency} times now${symbol.meaning ? ` — a persistent call toward ${symbol.meaning.toLowerCase()}` : ''}.`;
  }

  // Two or more recurring symbols
  const symbolNames = topTwo.map(s => s.label).join(' and ');
  const meanings = topTwo
    .filter(s => s.meaning)
    .map(s => s.meaning!.toLowerCase());
  
  if (meanings.length > 0) {
    return `Both ${symbolNames} weave through your journey, speaking of ${meanings.join(' and ')}.`;
  }
  
  return `The ${symbolNames} dance together through your spiral path.`;
}

/**
 * Map symbols to elemental balance insights
 */
export function analyzeElementalBalance(symbols: DetectedSymbol[]): Record<string, string> {
  const elementCounts: Record<string, number> = {};
  
  // Count element appearances
  symbols.forEach(symbol => {
    if (symbol.element) {
      elementCounts[symbol.element] = (elementCounts[symbol.element] || 0) + (symbol.frequency || 1);
    }
  });

  const total = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
  const balance: Record<string, string> = {};

  // Determine balance state for each element
  ['fire', 'water', 'earth', 'air', 'spirit', 'void'].forEach(element => {
    const count = elementCounts[element] || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    if (percentage >= 40) {
      balance[element] = 'dominant';
    } else if (percentage >= 20) {
      balance[element] = 'present';
    } else if (percentage > 0) {
      balance[element] = 'emerging';
    } else {
      balance[element] = 'absent';
    }
  });

  return balance;
}
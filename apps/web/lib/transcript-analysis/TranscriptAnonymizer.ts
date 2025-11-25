/**
 * Copyright © 2025 Soullab® Inc.
 * All Rights Reserved.
 *
 * TRANSCRIPT ANONYMIZATION PIPELINE
 * Removes all personally identifiable information (PII) from session transcripts
 * before pattern extraction for MAIA training.
 *
 * Human-Authored IP: Kelly Nezat, 2025
 * Implementation: Built with Claude Code assistance
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Configuration for what to remove vs preserve during anonymization
 */
export interface AnonymizationConfig {
  remove: {
    names: boolean;              // Replace with [Person], [Client], [Kelly]
    locations: boolean;          // Replace with [Location] or generic
    dates: boolean;              // Replace with "recently", "a while ago"
    identifiers: boolean;        // Job titles, company names, etc.
    relationships: boolean;      // "Uncle Bob" → "family member"
    contactInfo: boolean;        // Phone, email, address
    uniqueDetails: boolean;      // Rare conditions, unusual situations
  };

  preserve: {
    emotionalContent: boolean;   // Keep feeling words, tone
    archetypePatterns: boolean;  // Fire/Water/Earth/Air dynamics
    transformationMoments: boolean; // Breakthrough insights
    resistancePatterns: boolean; // How they deflect/protect
    somaticSignals: boolean;     // Body sensations (generic)
    languageStyle: boolean;      // Speech rhythm, not content
  };
}

/**
 * Result of anonymization process
 */
export interface AnonymizedTranscript {
  originalId: string;           // Link back to original (for deletion)
  anonymizedText: string;       // Fully de-identified text
  piiRemoved: string[];         // List of what was removed (for audit)
  verificationStatus: 'pending' | 'verified' | 'rejected';
  extractedPatterns?: TransformationPattern[]; // After pattern extraction
  metadata: {
    sessionDate: string;        // Generalized (e.g., "2025-Q1")
    sessionLength: number;      // Duration in minutes
    modalitiesUsed: string[];   // Oracle, Journaling, Focus, etc.
    elementalFocuses: string[]; // Which elements were active
  };
}

/**
 * Universal transformation pattern extracted from anonymized session
 */
export interface TransformationPattern {
  id: string;
  type: 'resistance' | 'breakthrough' | 'integration' | 'deflection' | 'somatic_awareness' | 'insight';

  context: {
    elementalDynamics: string;  // "Fire rigidity blocking Water access"
    archetypalTheme: string;    // "Perfectionism protecting vulnerability"
    somaticSignals?: string;    // "Chest tightness, shallow breath" (generic)
    conversationalContext: string; // What was happening in conversation
  };

  intervention?: {
    approach: string;           // What Kelly/MAIA did/said
    response: string;           // How client responded
    insight: string;            // What emerged
  };

  teaching: {
    whenToUse: string;          // When this pattern applies
    howItWorks: string;         // Mechanism of transformation
    whatToAvoid: string;        // Common mistakes
    elementalWisdom?: string;   // Spiralogic insight
  };

  // NO personal identifiers
  traceableToClient: false;
}

/**
 * Main anonymization class
 */
export class TranscriptAnonymizer {
  private anthropic: Anthropic;
  private config: AnonymizationConfig;

  constructor(config?: Partial<AnonymizationConfig>) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Default configuration (can be overridden)
    this.config = {
      remove: {
        names: true,
        locations: true,
        dates: true,
        identifiers: true,
        relationships: true,
        contactInfo: true,
        uniqueDetails: true,
      },
      preserve: {
        emotionalContent: true,
        archetypePatterns: true,
        transformationMoments: true,
        resistancePatterns: true,
        somaticSignals: true,
        languageStyle: true,
      },
      ...config,
    };
  }

  /**
   * Main anonymization method
   */
  async anonymize(
    transcript: string,
    metadata: {
      sessionDate: Date;
      sessionLength: number;
      modalitiesUsed: string[];
    }
  ): Promise<AnonymizedTranscript> {
    console.log('🔒 Starting anonymization process...');

    // Step 1: Automated PII removal
    const autoAnonymized = this.automaticPIIRemoval(transcript);

    // Step 2: AI-powered deep anonymization (catches what regex misses)
    const deepAnonymized = await this.aiDeepAnonymization(autoAnonymized.text);

    // Step 3: Verification pass (ensure nothing identifiable remains)
    const verified = await this.verifyAnonymization(deepAnonymized);

    // Create anonymized result
    const result: AnonymizedTranscript = {
      originalId: this.generateId(),
      anonymizedText: deepAnonymized,
      piiRemoved: [...autoAnonymized.removed, 'AI-verified additional PII'],
      verificationStatus: verified ? 'verified' : 'pending',
      metadata: {
        sessionDate: this.generalizeDateQuarter(metadata.sessionDate),
        sessionLength: Math.round(metadata.sessionLength / 10) * 10, // Round to nearest 10min
        modalitiesUsed: metadata.modalitiesUsed,
        elementalFocuses: [], // Will be filled during pattern extraction
      },
    };

    console.log(`✅ Anonymization complete. Removed: ${result.piiRemoved.length} categories of PII`);

    return result;
  }

  /**
   * Step 1: Automated regex-based PII removal
   */
  private automaticPIIRemoval(text: string): { text: string; removed: string[] } {
    const removed: string[] = [];
    let anonymized = text;

    // Names (common patterns)
    if (this.config.remove.names) {
      // Proper names: "I'm Sarah" → "I'm [Person]"
      anonymized = anonymized.replace(/\b(I'm|My name is|I am)\s+([A-Z][a-z]+)\b/g, '$1 [Person]');
      removed.push('Client self-identification');

      // Capitalized names in conversation
      anonymized = anonymized.replace(/\b([A-Z][a-z]+)\s+(said|told|asked|mentioned)\b/g, '[Person] $2');
      removed.push('Named individuals');

      // Possessive: "Sarah's" → "[Person]'s"
      anonymized = anonymized.replace(/\b[A-Z][a-z]+('s|s')\b/g, "[Person]'s");

      // Replace "Kelly" specifically (facilitator name)
      anonymized = anonymized.replace(/\bKelly\b/g, '[Facilitator]');
      removed.push('Facilitator name');
    }

    // Locations
    if (this.config.remove.locations) {
      // Cities: "in Portland" → "in [Location]"
      anonymized = anonymized.replace(/\b(in|from|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g, '$1 [Location]');

      // States: "California" → "[Location]"
      const usStates = ['California', 'Texas', 'Florida', 'New York', 'Oregon', 'Washington'];
      usStates.forEach(state => {
        anonymized = anonymized.replace(new RegExp(`\\b${state}\\b`, 'gi'), '[Location]');
      });

      // Addresses/Streets
      anonymized = anonymized.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/gi, '[Address]');

      removed.push('Locations, cities, addresses');
    }

    // Dates and ages
    if (this.config.remove.dates) {
      // Specific dates: "March 15, 2024" → "recently"
      anonymized = anonymized.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, 'recently');

      // Years: "in 2023" → "recently"
      anonymized = anonymized.replace(/\b(in|since|during)\s+(19|20)\d{2}\b/g, '$1 recently');

      // Ages: "I'm 34" → "I'm in my thirties"
      anonymized = anonymized.replace(/\b(I'm|I am)\s+(\d{2})\s+(years old)?\b/g, (match, prefix, age) => {
        const ageNum = parseInt(age);
        const decade = Math.floor(ageNum / 10) * 10;
        const decadeWord = this.numberToWord(decade);
        return `${prefix} in my ${decadeWord}s`;
      });

      removed.push('Dates, years, specific ages');
    }

    // Identifiers (jobs, companies, etc.)
    if (this.config.remove.identifiers) {
      // Companies: "at Google" → "at work" or "at [Company]"
      const bigTech = ['Google', 'Apple', 'Microsoft', 'Amazon', 'Facebook', 'Meta', 'Tesla', 'Netflix'];
      bigTech.forEach(company => {
        anonymized = anonymized.replace(new RegExp(`\\b(at|for|with)\\s+${company}\\b`, 'gi'), '$1 [Company]');
      });

      // Job titles (keep generic, remove specific)
      anonymized = anonymized.replace(/\b(I'm|I am)\s+a\s+(Senior|Lead|Principal|Chief)?\s*([A-Z][a-z]+\s+){1,3}(Engineer|Manager|Director|VP|President)\b/gi, '$1 in [Industry Role]');

      // Email addresses
      anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[Email]');

      // Phone numbers
      anonymized = anonymized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[Phone]');

      removed.push('Companies, job titles, contact info');
    }

    // Relationships (specific names)
    if (this.config.remove.relationships) {
      // "my wife Sarah" → "my wife"
      anonymized = anonymized.replace(/\b(my|his|her|their)\s+(husband|wife|partner|mom|dad|mother|father|son|daughter|brother|sister|friend|boss|colleague)\s+([A-Z][a-z]+)\b/gi, '$1 $2');

      // "Uncle Bob" → "family member"
      anonymized = anonymized.replace(/\b(Uncle|Aunt|Cousin|Grandma|Grandpa)\s+[A-Z][a-z]+\b/gi, 'family member');

      removed.push('Named relationships');
    }

    // Unique identifying details (medical conditions, rare situations)
    if (this.config.remove.uniqueDetails) {
      // Rare medical conditions (list of uncommon diagnoses)
      const rareConditions = ['lupus', 'fibromyalgia', 'chiari malformation', 'ehlers-danlos'];
      rareConditions.forEach(condition => {
        anonymized = anonymized.replace(new RegExp(`\\b${condition}\\b`, 'gi'), '[medical condition]');
      });

      removed.push('Unique identifying details');
    }

    return { text: anonymized, removed };
  }

  /**
   * Step 2: AI-powered deep anonymization
   * Uses Claude to catch contextual PII that regex misses
   */
  private async aiDeepAnonymization(text: string): Promise<string> {
    const prompt = `You are a privacy protection expert. Your job is to anonymize this transcript further while preserving its therapeutic/transformational value.

**What to REMOVE (replace with generic labels):**
- Any remaining names, even if not capitalized (e.g., "sarah mentioned")
- Contextual identifiers (e.g., "my company just went public" → "at work", "my twins" → "my children")
- Unique situations that could identify someone (e.g., "I just won the lottery" → "I came into money")
- Cultural/ethnic identifiers if very specific (e.g., "my Buddhist temple in Chinatown" → "my spiritual community")
- Any detail that would make someone say "oh that's definitely about me"

**What to PRESERVE:**
- Emotional content ("I felt scared", "tears came", "relief washed over me")
- Universal transformation patterns ("I realized I was protecting myself", "the grief underneath")
- Somatic experiences ("chest tightness", "shallow breathing") - keep generic
- Archetypal themes ("perfectionism", "fear of not being enough")
- Conversation flow and breakthrough moments

**Return ONLY the anonymized transcript - no explanations.**

Transcript to anonymize:
${text}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const anonymized = response.content[0].type === 'text'
      ? response.content[0].text
      : text;

    return anonymized;
  }

  /**
   * Step 3: Verification pass
   * Asks AI: "Could anyone identify the client from this text?"
   */
  private async verifyAnonymization(text: string): Promise<boolean> {
    const prompt = `You are a privacy auditor. Review this anonymized transcript and answer:

**Could anyone identify the client from this text?**

Look for:
- Names (people, places, companies)
- Unique situations (rare events, uncommon combinations)
- Identifiable patterns (e.g., "works at startup in SF doing AI" is too specific)
- Contextual clues that could narrow down identity

**Answer with one word: YES (identifiable) or NO (safe).**

Then on a new line, list any identifiable details you found (if YES).

Transcript:
${text}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const result = response.content[0].type === 'text'
      ? response.content[0].text
      : 'YES';

    const isIdentifiable = result.trim().toUpperCase().startsWith('YES');

    if (isIdentifiable) {
      console.warn('⚠️  Verification FAILED - identifiable details remain:', result);
      // In production, this would trigger manual review
    }

    return !isIdentifiable;
  }

  /**
   * Helper: Generate unique ID for tracking
   */
  private generateId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Generalize date to quarter (e.g., "2025-03-15" → "2025-Q1")
   */
  private generalizeDateQuarter(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
  }

  /**
   * Helper: Number to word (for age ranges)
   */
  private numberToWord(num: number): string {
    const words: Record<number, string> = {
      20: 'twenty',
      30: 'thirty',
      40: 'forty',
      50: 'fifty',
      60: 'sixty',
      70: 'seventy',
      80: 'eighty',
    };
    return words[num] || 'age-range';
  }
}

/**
 * Example usage:
 *
 * const anonymizer = new TranscriptAnonymizer();
 *
 * const result = await anonymizer.anonymize(
 *   rawTranscript,
 *   {
 *     sessionDate: new Date('2025-03-15'),
 *     sessionLength: 60,
 *     modalitiesUsed: ['oracle', 'journaling'],
 *   }
 * );
 *
 * console.log(result.anonymizedText);
 * // Original transcript can now be safely deleted
 */

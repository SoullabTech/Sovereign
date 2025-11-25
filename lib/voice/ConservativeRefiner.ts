/**
 * Conservative Refiner
 * ONLY catches therapy-speak, filler, and cringe
 * Does NOT rewrite good responses from Claude/EO
 *
 * Philosophy: Claude/EO are already intelligent. Give them better instructions
 * upfront, then only fix when they slip into bad patterns.
 */

export interface ConservativeRefinement {
  refined: string;
  hadIssues: boolean;
  issuesFixed: string[];
}

export class ConservativeRefiner {
  /**
   * Conservative refinement - only fix bad patterns, don't rewrite good responses
   */
  static refine(text: string): ConservativeRefinement {
    const issuesFixed: string[] = [];
    let refined = text;

    // 1. THERAPY-SPEAK (always bad, always fix)
    const therapySpeakPatterns: Array<[RegExp, string, string]> = [
      [/\bIt sounds like you're (feeling|experiencing)\b/gi, "You're", 'therapy:removed'],
      [/\bI want to help you explore\b/gi, "Let's explore", 'therapy:removed'],
      [/\bHave you considered\b/gi, "What if", 'therapy:removed'],
      [/\bIt's important to remember that\b/gi, '', 'therapy:removed'],
      [/\bI encourage you to\b/gi, 'Consider', 'therapy:removed'],
      [/\bLet me help you understand\b/gi, "Let's look at", 'therapy:removed'],
    ];

    for (const [regex, replacement, label] of therapySpeakPatterns) {
      const before = refined;
      refined = refined.replace(regex, replacement);
      if (before !== refined) {
        issuesFixed.push(label);
      }
    }

    // 2. MYSTICAL CRINGE (oracle cosplay, always bad)
    const cringePatterns: Array<[RegExp, string, string]> = [
      [/\bThe (Fire|Waters|Earth|Air|Aether|Winds|Flames) (calls?|invites?|holds?|reveals?)\b/gi,
       (match, element) => {
         const alternatives: Record<string, string> = {
           'Fire': 'Your energy',
           'Waters': 'That feeling',
           'Water': 'That feeling',
           'Earth': 'Your body',
           'Air': 'The clarity',
           'Aether': 'The pattern',
           'Winds': 'Your insight',
           'Flames': 'Your spark'
         };
         return alternatives[element] || 'This';
       },
       'cringe:removed'],
      [/\bthe mystery holds\b/gi, 'there\'s a pattern', 'cringe:removed'],
      [/\bthe void invites\b/gi, 'you might', 'cringe:removed'],
      [/\bsacred container\b/gi, 'space', 'cringe:removed'],
      [/\bdivine feminine\b/gi, 'feminine energy', 'cringe:removed'],
    ];

    for (const [regex, replacement, label] of cringePatterns) {
      const before = refined;
      refined = refined.replace(regex, replacement as any);
      if (before !== refined) {
        issuesFixed.push(label);
      }
    }

    // 3. EXCESSIVE FILLER (only remove if excessive - 3+ in one response)
    const fillerWords = ['kind of', 'sort of', 'basically', 'literally', 'actually', 'honestly'];
    let fillerCount = 0;
    const lowerText = refined.toLowerCase();

    fillerWords.forEach(filler => {
      const count = (lowerText.match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length;
      fillerCount += count;
    });

    if (fillerCount >= 3) {
      for (const filler of fillerWords) {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        const before = refined;
        refined = refined.replace(regex, '');
        if (before !== refined) {
          issuesFixed.push('filler:excessive');
        }
      }
    }

    // 4. COMMANDS → INVITATIONS (only if direct command)
    const commandPatterns: Array<[RegExp, string, string]> = [
      [/\bYou need to\b/gi, 'You might', 'command:softened'],
      [/\bYou must\b/gi, 'You could', 'command:softened'],
      [/\bYou should definitely\b/gi, 'Consider', 'command:softened'],
    ];

    for (const [regex, replacement, label] of commandPatterns) {
      const before = refined;
      refined = refined.replace(regex, replacement);
      if (before !== refined) {
        issuesFixed.push(label);
      }
    }

    // Clean up spacing
    refined = refined.replace(/\s{2,}/g, ' ').replace(/ ,/g, ',').trim();

    return {
      refined,
      hadIssues: issuesFixed.length > 0,
      issuesFixed: [...new Set(issuesFixed)] // Remove duplicates
    };
  }

  /**
   * Check if response has good phenomenological language already
   * (so we don't need to add anything)
   */
  static hasGoodLanguage(text: string): boolean {
    const goodMarkers = [
      'i see', 'i hear', 'i feel', 'i sense',
      'that lands', 'that\'s real', 'that\'s big',
      'mm-hmm', 'yeah', 'whoa', 'go on',
      'i\'m here', 'i\'m with you'
    ];

    const lowerText = text.toLowerCase();
    return goodMarkers.some(marker => lowerText.includes(marker));
  }

  /**
   * Check if response needs elemental phrase (only if very generic)
   */
  static needsElementalPhrase(text: string): boolean {
    const veryGenericPatterns = [
      /^(I understand|That makes sense|I see|Okay|Got it)\.?$/i,
      /^(Tell me more|Go on|Continue)\.?$/i,
    ];

    const trimmed = text.trim();
    return veryGenericPatterns.some(pattern => pattern.test(trimmed));
  }
}

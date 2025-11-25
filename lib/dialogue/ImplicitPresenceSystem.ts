// lib/dialogue/ImplicitPresenceSystem.ts
// Pure presence - no explaining, just being
"use strict";

export class ImplicitPresenceSystem {
  /**
   * Remove all self-referential and explanatory language
   */
  public static stripExplanations(text: string): string {
    // Remove all "I am here to..." type statements
    const explanatoryPatterns = [
      /I am here to .+?\./g,
      /I'm here to .+?\./g,
      /My purpose is .+?\./g,
      /My role is .+?\./g,
      /I exist to .+?\./g,
      /I can help you .+?\./g,
      /I will .+?\./g,
      /I'll .+? for you\./g,
      /Let me .+?\./g,
      /Allow me to .+?\./g,
      /I'm going to .+?\./g,
      /I want to .+?\./g,
      /I'd like to .+?\./g,
      /I feel .+?\./g,
      /I sense .+?\./g,
      /I notice .+?\./g,
      /I'm noticing .+?\./g,
      /I'm sensing .+?\./g,
      /I'm feeling .+?\./g,
      /I understand that .+?\./g,
      /I hear that .+?\./g,
      /I see that .+?\./g,
      /I think .+?\./g,
      /I believe .+?\./g,
      /It seems to me .+?\./g,
      /What I'm hearing is .+?\./g,
      /What I notice is .+?\./g,
      /As your .+?, I .+?\./g,
      /As someone who .+?\./g,
    ];

    let cleaned = text;
    explanatoryPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove ability declarations
    const abilityPatterns = [
      /I can .+?\./g,
      /I could .+?\./g,
      /I'm able to .+?\./g,
      /I have the ability to .+?\./g,
      /I'm capable of .+?\./g,
      /I know how to .+?\./g,
    ];

    abilityPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove intention statements
    const intentionPatterns = [
      /I intend to .+?\./g,
      /I hope to .+?\./g,
      /I aim to .+?\./g,
      /I seek to .+?\./g,
      /I strive to .+?\./g,
      /My intention is .+?\./g,
      /My goal is .+?\./g,
    ];

    intentionPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove meta-commentary about the conversation
    const metaPatterns = [
      /This conversation .+?\./g,
      /Our dialogue .+?\./g,
      /This space .+?\./g,
      /This moment .+?\./g,
      /Here, .+?\./g,
      /In this .+?\./g,
      /Together we .+?\./g,
    ];

    metaPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Clean up any double spaces or empty sentences
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\.\s*\./g, '.');
    cleaned = cleaned.trim();

    // If we've removed everything, return something simple
    if (cleaned.length === 0 || cleaned === '.') {
      return '';
    }

    return cleaned;
  }

  /**
   * Transform "telling" into "being"
   */
  public static makeImplicit(text: string): string {
    // First strip all explanations
    let implicit = this.stripExplanations(text);

    // Transform remaining text to be more implicit
    const tellingToShowing = new Map([
      // Instead of "I understand" → just reflect understanding
      [/I understand\./g, ''],
      [/I get it\./g, ''],
      [/I see\./g, ''],
      [/I hear you\./g, ''],

      // Instead of describing emotions → just be present
      [/That must be .+?\./g, ''],
      [/That sounds .+?\./g, ''],
      [/That seems .+?\./g, ''],
      [/You must be feeling .+?\./g, ''],
      [/You seem .+?\./g, ''],

      // Remove validations - just accept
      [/That's valid\./g, ''],
      [/That makes sense\./g, ''],
      [/That's understandable\./g, ''],
      [/That's natural\./g, ''],
      [/That's okay\./g, ''],
    ]);

    tellingToShowing.forEach((replacement, pattern) => {
      implicit = implicit.replace(pattern, replacement);
    });

    // Clean up
    implicit = implicit.replace(/\s+/g, ' ').trim();

    // If only questions remain, that's perfect
    // If statements remain, make them simpler
    const sentences = implicit.split(/(?<=[.!?])\s+/);
    const filtered = sentences.filter(s => {
      // Keep questions
      if (s.includes('?')) return true;
      // Keep very short observations
      if (s.split(' ').length <= 5) return true;
      // Skip everything else
      return false;
    });

    return filtered.join(' ').trim();
  }

  /**
   * Get a response that's pure presence, no explanation
   */
  public static getPureResponse(context: 'greeting' | 'listening' | 'curious' | 'closing'): string {
    const responses = {
      greeting: [
        'Hey.',
        'Hi.',
        'Hello.',
        '',  // Sometimes no greeting at all is most natural
      ],
      listening: [
        'Mm.',
        'Yeah.',
        'Okay.',
        'Right.',
        'Go on.',
        '',  // Just space
      ],
      curious: [
        'Tell me more.',
        'What else?',
        'And?',
        'How so?',
        'Yeah?',
        'What happened?',
        'Then what?',
      ],
      closing: [
        'Take care.',
        'See you.',
        'Bye.',
        'Later.',
        '',
      ]
    };

    const options = responses[context] || [''];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Remove any coaching or therapeutic language
   */
  public static removeTherapySpeak(text: string): string {
    const therapyPatterns = [
      /explore/gi,
      /process/gi,
      /validate/gi,
      /honor/gi,
      /hold space/gi,
      /sit with/gi,
      /be present with/gi,
      /witness/gi,
      /sacred/gi,
      /divine/gi,
      /manifest/gi,
      /transform/gi,
      /journey/gi,
      /healing/gi,
      /growth/gi,
      /evolution/gi,
      /consciousness/gi,
      /awareness/gi,
      /mindful/gi,
      /centered/gi,
      /grounded/gi,
      /aligned/gi,
    ];

    let cleaned = text;
    therapyPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
  }

  /**
   * Final cleanup to ensure natural flow
   */
  public static ensureNatural(text: string): string {
    // If it's empty, that's fine
    if (!text.trim()) return '';

    // If it's just a question, perfect
    if (text.trim().endsWith('?') && text.split('?').length === 2) {
      return text.trim();
    }

    // If it's very short (under 10 words), keep it
    const wordCount = text.split(' ').filter(w => w.length > 0).length;
    if (wordCount <= 10) {
      return text.trim();
    }

    // Otherwise, take just the most essential part (usually the question)
    const sentences = text.split(/[.!?]+/);
    const question = sentences.find(s => s.includes('?'));
    if (question) {
      return question.trim() + '?';
    }

    // Or the shortest meaningful sentence
    const shortest = sentences
      .filter(s => s.trim().split(' ').length >= 2)
      .sort((a, b) => a.length - b.length)[0];

    return shortest ? shortest.trim() + '.' : text.trim();
  }
}

export const implicitPresence = new ImplicitPresenceSystem();
// Lightweight, in-flight stream refiner for Maya's voice.
// Inserts elemental tone, gentle punctuation, breath markers, and
// optional safety softening without blocking the stream.
// Enhanced with conversational intelligence rules for authentic interaction.

import { cringeFilterService } from '../utils/cringeFilterService';
import { ConversationalRules, type SpiralogicPhase } from '../config/conversationalRules';

export type Element = 'air' | 'fire' | 'water' | 'earth' | 'aether';

export interface RefinerOptions {
  element: Element;
  userId?: string;
  tts?: { breathMarks?: boolean; phraseMinChars?: number; phraseMaxChars?: number };
  safetySoften?: boolean;        // keep content but soften phrasing
  styleTightening?: boolean;     // trim filler, tighten hedges
  addClosers?: boolean;          // ensure responses end complete
  cringeFilter?: boolean;        // apply modern language filtering
  userStyle?: 'casual' | 'formal' | 'spiritual'; // adaptive communication style
}

export class SesameMayaRefiner {
  private buf = '';
  private opts: Required<RefinerOptions> & { userStyle: 'casual' | 'formal' | 'spiritual' };

  constructor(opts: RefinerOptions) {
    this.opts = {
      element: opts.element,
      userId: opts.userId || 'anonymous',
      safetySoften: opts.safetySoften ?? true,
      styleTightening: opts.styleTightening ?? true,
      addClosers: opts.addClosers ?? true,
      cringeFilter: opts.cringeFilter ?? true,
      userStyle: opts.userStyle ?? 'casual',
      tts: {
        breathMarks: opts.tts?.breathMarks ?? true,
        phraseMinChars: Math.max(24, opts.tts?.phraseMinChars ?? 36),
        phraseMaxChars: Math.max(64, opts.tts?.phraseMaxChars ?? 120),
      },
    };
  }

  /** Single-pass, non-stream refinement (for /message POST path) */
  refineText(full: string): string {
    let t = full;
    if (this.opts.cringeFilter) t = cringeFilterService.adaptiveFilter(t, this.opts.userStyle);
    t = this.applyElementalTone(t);
    if (this.opts.styleTightening) t = this.tightenStyle(t);
    if (this.opts.safetySoften)   t = this.softenEdges(t);
    if (this.opts.addClosers)     t = this.ensureClosure(t);
    if (this.opts.tts.breathMarks) t = this.addBreaths(t);
    return t;
  }

  /** Stream wrapper: yields refined phrases as they become natural units */
  async *refineStream(src: AsyncGenerator<string>): AsyncGenerator<string> {
    for await (const chunk of src) {
      this.buf += chunk;

      // opportunistic punctuation smoothing
      this.buf = this.normalizeWhitespace(this.buf);

      // cut by natural phrase boundaries to keep SSE snappy but coherent
      let cutIdx = this.findCutIndex(this.buf);
      while (cutIdx > -1) {
        let phrase = this.buf.slice(0, cutIdx + 1);
        this.buf = this.buf.slice(cutIdx + 1);

        if (this.opts.cringeFilter) phrase = cringeFilterService.adaptiveFilter(phrase, this.opts.userStyle);
        phrase = this.applyElementalTone(phrase);
        if (this.opts.styleTightening) phrase = this.tightenStyle(phrase);
        if (this.opts.safetySoften)   phrase = this.softenEdges(phrase);
        if (this.opts.tts.breathMarks) phrase = this.addBreaths(phrase);

        yield phrase;
        cutIdx = this.findCutIndex(this.buf);
      }

      // guard long runs with soft chunking
      if (this.buf.length > this.opts.tts.phraseMaxChars) {
        const slice = this.buf.slice(0, this.opts.tts.phraseMaxChars);
        this.buf = this.buf.slice(this.opts.tts.phraseMaxChars);
        let phrase = slice;
        if (this.opts.cringeFilter) phrase = cringeFilterService.adaptiveFilter(phrase, this.opts.userStyle);
        phrase = this.applyElementalTone(phrase);
        if (this.opts.styleTightening) phrase = this.tightenStyle(phrase);
        if (this.opts.safetySoften)   phrase = this.softenEdges(phrase);
        if (this.opts.tts.breathMarks) phrase = this.addBreaths(phrase);
        yield phrase;
      }
    }

    // flush tail
    if (this.buf.trim()) {
      let tail = this.buf;
      if (this.opts.cringeFilter) tail = cringeFilterService.adaptiveFilter(tail, this.opts.userStyle);
      if (this.opts.addClosers) tail = this.ensureClosure(tail);
      if (this.opts.styleTightening) tail = this.tightenStyle(tail);
      if (this.opts.safetySoften)   tail = this.softenEdges(tail);
      if (this.opts.tts.breathMarks) tail = this.addBreaths(tail);
      yield tail;
    }
  }

  // ---------- helpers

  private normalizeWhitespace(t: string) {
    return t.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n');
  }

  /** choose phrase cuts: punctuation > emdash > newline > length */
  private findCutIndex(t: string) {
    // prefer full stop boundaries
    const re = /[.!?…](?:["'"])?(?=\s|$)/g;
    let m: RegExpExecArray | null;
    let last = -1;
    while ((m = re.exec(t))) last = m.index;
    if (last > -1 && last + 1 >= this.opts.tts.phraseMinChars) return last;

    // fallback: semicolon or long comma breath
    const c = t.lastIndexOf(';');
    if (c > -1 && c >= this.opts.tts.phraseMinChars) return c;

    // soft break on newline
    const n = t.indexOf('\n');
    if (n > -1 && n >= this.opts.tts.phraseMinChars) return n;

    return -1;
  }

  private applyElementalTone(s: string) {
    // micro-tonal tweaks that don't "rewrite" content, just voice
    const prefaceMap: Record<Element, string> = {
      air:   '',
      fire:  '',
      water: '',
      earth: '',
      aether:''
    };
    // lightweight diction nudge per element
    const swaps: Record<Element, Array<[RegExp, string]>> = {
      air: [
        [/\bI think\b/gi, 'I sense'],  // Witnessing language
        [/\b(maybe|perhaps)\b/gi, ''],  // Remove uncertainty
        [/\bvery\s+([a-z]+)\b/gi, '$1'],  // "very good" -> "good"
        [/\bquite\b/gi, ''],
        [/\bI understand\b/gi, 'I witness'],  // Never claim understanding
        [/\blet me help\b/gi, "let's explore"],  // Collaborative
      ],
      fire: [
        [/\btry to\b/gi, ''],  // Remove tentative language in fire mode
        [/\bmaybe we could\b/gi, "let's"],
        [/\bperhaps\b/gi, ''],  // Remove uncertainty
        [/\bI understand\b/gi, 'I witness the fire in'],  // Elemental witnessing
        [/\byou should\b/gi, 'the fire calls you to'],  // Archetypal calling
      ],
      water: [
        [/\bshould consider\b/gi, 'might explore'],
        [/\bmust\b/gi, 'can'],
        [/\bhave to\b/gi, 'are invited to'],
        [/\bI understand\b/gi, 'the waters hold'],  // Elemental holding
        [/\bit's okay\b/gi, 'rest here'],  // Gentle containment
        [/\bdon't worry\b/gi, 'let the waters carry this'],  // Water metaphor
      ],
      earth: [
        [/\bmaybe try\b/gi, "let's ground into"],
        [/\btry\s+(\w+ing)\b/gi, 'practice $1'],  // "try meditating" -> "practice meditating"
        [/\bpossibly\b/gi, 'practically'],
        [/\bI understand\b/gi, 'the earth witnesses'],  // Grounded witnessing
        [/\byou need to\b/gi, 'the earth invites you to'],  // Earth invitation
      ],
      aether: [
        [/\bproblem\b/gi, 'pattern'],
        [/\bfix\s+this\b/gi, 'integrate this'],
        [/\bissue\b/gi, 'dynamic'],
        [/\bI understand\b/gi, 'the mystery holds'],  // Mystery language
        [/\bI know\b/gi, 'the aether reveals'],  // Revelation language
        [/\byou must\b/gi, 'the void invites'],  // Spacious invitation
      ],
    };
    let t = s;
    for (const [re, rep] of swaps[this.opts.element]) {
      t = t.replace(re, rep).replace(/\s+/g, ' ').trimStart();
    }
    if (prefaceMap[this.opts.element] && !t.trimStart().startsWith(prefaceMap[this.opts.element])) {
      t = prefaceMap[this.opts.element] + t;
    }
    return t;
  }

  private tightenStyle(s: string) {
    // Aggressive removal for true economy of words
    return s
      // Core filler removal - expanded list
      .replace(/\b(kind of|sort of|a bit|just|really|like,|you know,)\b/gi, '')
      .replace(/\bI\s+mean,?\s*/gi, '')
      .replace(/\bactually,?\s*/gi, '')
      .replace(/\bhonestly,?\s*/gi, '')
      .replace(/\bliterally,?\s*/gi, '')
      .replace(/\bI\s+guess\b/gi, '')
      .replace(/\bI\s+suppose\b/gi, '')

      // Remove ALL explanatory phrases - be ruthless
      .replace(/\bI'm\s+here\s+to\s+[^.!?]*\./gi, '')
      .replace(/\blet's\s+explore\s+that\s+together\b/gi, 'tell me')
      .replace(/\blet's\s+explore\b/gi, 'tell me')
      .replace(/\bI'm\s+curious\s+about\s+how\b/gi, 'how')
      .replace(/\bthat\s+sounds\s+[^.!?]+\./gi, 'I hear you.')
      .replace(/\bone\s+step\s+at\s+a\s+time\b/gi, '')
      .replace(/\bwhat\s+would\s+you\s+like\s+to\s+start\s+with\b/gi, 'where to begin?')
      .replace(/\bPlease\s+feel\s+free\s+to\s+share\s+[^.!?]+\./gi, 'Share with me.')
      .replace(/\bI'm\s+ready\s+to\s+[^.!?]+\./gi, '')

      // Remove hedging
      .replace(/\bit\s+seems\s+like\b/gi, '')
      .replace(/\bit\s+appears\s+that\b/gi, '')
      .replace(/\bmaybe\s+we\s+could\b/gi, "let's")
      .replace(/\bperhaps\s+you\s+might\b/gi, 'you could')

      // Remove redundant explanations
      .replace(/\bwhat\s+I'm\s+hearing\s+is\b/gi, '')
      .replace(/\bwhat\s+you're\s+saying\s+is\b/gi, '')
      .replace(/\bif\s+I\s+understand\s+correctly\b/gi, '')
      .replace(/\bto\s+reflect\s+on\b/gi, 'about')
      .replace(/\bI'm\s+witnessing\b/gi, 'I see')
      .replace(/\bwhat\s+insights\s+naturally\s+arise\b/gi, 'what comes up')

      // Maya Angelou mode - remove everything that isn't essential
      .replace(/\bHow\s+are\s+you\s+feeling\s+in\s+this\s+moment\?/gi, 'How are you?')
      .replace(/\bI'm\s+here\s+to\s+listen\s+without\s+[^.!?]+\./gi, '')
      .replace(/\bwhatever\s+it\s+may\s+be\b/gi, '')
      .replace(/\bPlease\s+feel\s+free\s+to\b/gi, '')
      .replace(/\bI'm\s+ready\s+to\s+hold\s+space\s+[^.!?]+\./gi, '')
      .replace(/\bwith\s+compassion\b/gi, '')
      .replace(/\bwithout\s+judgment\b/gi, '')

      // Original cleanups
      .replace(/\bI\s+think\s+that\b/gi, 'I sense')
      .replace(/\bthat\s+being\s+said\b/gi, '')
      .replace(/\byou\s+can\s+you\s+can\b/gi, 'you can')
      .replace(/\bat\s+the\s+end\s+of\s+the\s+day\b/gi, 'ultimately')
      .replace(/\bbasically\b/gi, '')
      .replace(/\bobviously\b/gi, '')
      .replace(/\bsimply\b/gi, '')

      // Clean up spacing and punctuation
      .replace(/\s{2,}/g, ' ')
      .replace(/ ,/g, ',')
      .replace(/^\s*,\s*/gm, '') // Remove orphaned commas
      .trim();
  }

  private softenEdges(s: string) {
    // Intimate, soulful phrasing - direct yet compassionate
    return s
      .replace(/\b(you need to|you have to)\b/gi, 'you might')
      .replace(/\byou should\b/gi, 'consider')
      .replace(/\bdon\'t\s+worry\b/gi, 'rest easy')
      .replace(/\bdon\'t\s+be\s+afraid\b/gi, 'trust')
      .replace(/\byou must\b/gi, 'you could')
      // More natural, less clinical
      .replace(/\bconsider not ([a-z]+)ing\b/gi, 'ease up on $1ing')
      // Remove overly formal language
      .replace(/\bit\s+is\s+important\s+to\s+note\s+that\b/gi, '')
      .replace(/\bone\s+might\s+say\b/gi, '')
      .replace(/\bin\s+other\s+words\b/gi, '')
      .replace(/\blet\s+me\s+simply\b/gi, "I'll");
  }

  private addBreaths(s: string) {
    // Optimized breath markers for natural, flowing speech
    return s
      .replace(/—/g, ' — <breath/0.25> ')  // Shorter em-dash pause
      .replace(/: /g, ': <breath/0.15>')    // Minimal colon pause
      .replace(/\. /g, '. <breath/0.25>')   // Natural sentence breaks
      .replace(/, (?![<])/g, ', <breath/0.1>') // Very light comma pauses
      .replace(/\?\s*/g, '? <breath/0.2>')  // Question pause
      .replace(/!\s*/g, '! <breath/0.2>')   // Exclamation pause
      .replace(/\.\.\./g, '... <breath/0.3>'); // Ellipsis pause
  }

  private ensureClosure(s: string) {
    const trimmed = s.trimRight();
    if (/[.!?…]$/.test(trimmed)) return trimmed + '\n';
    return trimmed + '.\n';
  }
}
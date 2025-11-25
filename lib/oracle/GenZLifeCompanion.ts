/**
 * Gen Z Life Companion System
 * Based on Robert A Johnson's Inner Gold concept
 * Holds their projections and reflects their brilliance until they own it
 */

export interface LifeDomain {
  dating: DatingContext;
  sexuality: SexualityContext;
  school: SchoolContext;
  schedule: ScheduleContext;
  consciousness: ConsciousnessContext;
  innerGold: GoldProjection[];
  spirals: SpiralPattern[];
}

export interface DatingContext {
  stage: 'exploring' | 'crushing' | 'talking' | 'dating' | 'situationship' | 'relationship' | 'breakup';
  platform: 'irl' | 'snapchat' | 'instagram' | 'discord' | 'hinge' | 'mixed';
  concerns: string[];
  patterns: string[];
}

export interface SexualityContext {
  exploration: 'questioning' | 'curious' | 'experimenting' | 'confident' | 'fluid';
  orientation: string | 'figuring it out';
  identity: string | 'exploring';
  supportNeeded: 'validation' | 'information' | 'community' | 'processing';
}

export interface SchoolContext {
  academicStress: number; // 1-10
  socialDynamics: 'thriving' | 'managing' | 'struggling' | 'isolated';
  teacherRelations: Map<string, 'supportive' | 'neutral' | 'challenging'>;
  workload: 'manageable' | 'heavy' | 'overwhelming';
  extracurriculars: string[];
}

export interface ScheduleContext {
  balance: 'healthy' | 'stretched' | 'overwhelmed';
  priorities: ('school' | 'social' | 'family' | 'work' | 'self')[];
  conflicts: string[];
  copingStrategies: string[];
}

export interface ConsciousnessContext {
  questions: string[];
  interests: ('reality' | 'consciousness' | 'philosophy' | 'spirituality' | 'psychology')[];
  currentExploration: string;
  insights: string[];
}

export interface GoldProjection {
  projectedOnto: string; // who they're projecting onto
  quality: string; // what quality they see in others but not themselves
  timestamp: Date;
  readyToReclaim: boolean;
}

export interface SpiralPattern {
  type: 'anxiety' | 'comparison' | 'perfectionism' | 'rejection' | 'identity';
  trigger: string;
  frequency: number;
  lastOccurrence: Date;
  interventionsUsed: string[];
  progress: number; // 0-100
}

export class GenZLifeCompanion {
  private lifeDomain: LifeDomain = {
    dating: {
      stage: 'exploring',
      platform: 'mixed',
      concerns: [],
      patterns: []
    },
    sexuality: {
      exploration: 'figuring it out',
      orientation: 'figuring it out',
      identity: 'exploring',
      supportNeeded: 'validation'
    },
    school: {
      academicStress: 5,
      socialDynamics: 'managing',
      teacherRelations: new Map(),
      workload: 'manageable',
      extracurriculars: []
    },
    schedule: {
      balance: 'stretched',
      priorities: ['school', 'social', 'family'],
      conflicts: [],
      copingStrategies: []
    },
    consciousness: {
      questions: [],
      interests: [],
      currentExploration: '',
      insights: []
    },
    innerGold: [],
    spirals: []
  };

  // DATING & RELATIONSHIPS
  getDatingSupport(input: string): string {
    const patterns = {
      // Situationships
      situationship: [
        /what are we/i,
        /undefined relationship/i,
        /exclusive but not official/i,
        /talking stage/i,
        /we\'re just hanging out/i
      ],
      // Texting anxiety
      textingAnxiety: [
        /left me on read/i,
        /hasn\'t texted back/i,
        /double texted/i,
        /dry texter/i,
        /green bubble/i
      ],
      // Red flags
      redFlags: [
        /love bombing/i,
        /gaslighting/i,
        /toxic/i,
        /red flag/i,
        /controlling/i
      ],
      // Heartbreak
      heartbreak: [
        /just got dumped/i,
        /they broke up with me/i,
        /heartbroken/i,
        /miss them so much/i,
        /can\'t stop thinking about/i
      ]
    };

    // Check situationship confusion
    for (const pattern of patterns.situationship) {
      if (pattern.test(input)) {
        return "Situationships are exhausting because you're doing relationship labor without relationship security. Your need for clarity isn't clingy - it's healthy.";
      }
    }

    // Check texting anxiety
    for (const pattern of patterns.textingAnxiety) {
      if (pattern.test(input)) {
        return "Being left on read hits different when your whole generation equates response time with care level. But sometimes people are just bad at texting, not bad at caring.";
      }
    }

    // Check red flags
    for (const pattern of patterns.redFlags) {
      if (pattern.test(input)) {
        return "You're not crazy for noticing red flags. Your gut knows the difference between butterflies and warning signals. Trust that instinct.";
      }
    }

    // Check heartbreak
    for (const pattern of patterns.heartbreak) {
      if (pattern.test(input)) {
        return "First heartbreaks hit differently because your brain is literally forming its attachment patterns. This pain is real and it's also temporary, even when it feels eternal.";
      }
    }

    return "Dating in your generation means navigating digital and IRL simultaneously. That's twice the complexity of previous generations.";
  }

  // SEXUALITY & ORIENTATION
  getSexualitySupport(input: string): string {
    const patterns = {
      questioning: [
        /think i might be/i,
        /questioning my/i,
        /not sure if i\'m/i,
        /confused about/i,
        /figuring out/i
      ],
      comingOut: [
        /come out/i,
        /tell my parents/i,
        /tell my friends/i,
        /ready to be open/i,
        /hiding who i am/i
      ],
      identity: [
        /am i gay/i,
        /am i bi/i,
        /am i trans/i,
        /am i asexual/i,
        /am i non-binary/i
      ]
    };

    // Check questioning
    for (const pattern of patterns.questioning) {
      if (pattern.test(input)) {
        return "Sexuality and identity aren't puzzles to solve - they're experiences to explore. You don't need to have it all figured out. You're allowed to be in process.";
      }
    }

    // Check coming out
    for (const pattern of patterns.comingOut) {
      if (pattern.test(input)) {
        return "Coming out is yours to control - the timeline, the method, the audience. You don't owe anyone your truth until you're ready to share it safely.";
      }
    }

    // Check identity exploration
    for (const pattern of patterns.identity) {
      if (pattern.test(input)) {
        return "Labels can be helpful maps, but you're not required to choose one. Some people know immediately, some take years, some stay fluid. All paths are valid.";
      }
    }

    return "Your generation has more language for identity than ever before. That's freeing AND overwhelming. You're allowed to take your time finding what fits.";
  }

  // SCHOOL CHALLENGES
  getSchoolSupport(input: string): string {
    const patterns = {
      teacherIssues: [
        /teacher hates me/i,
        /unfair teacher/i,
        /teacher doesn\'t understand/i,
        /teacher is targeting/i
      ],
      homework: [
        /too much homework/i,
        /can\'t finish/i,
        /assignment due/i,
        /haven\'t started/i,
        /procrastinating/i
      ],
      socialDynamics: [
        /no friends at school/i,
        /eating alone/i,
        /group project/i,
        /popular kids/i,
        /feeling left out/i
      ],
      academicPressure: [
        /need perfect grades/i,
        /college applications/i,
        /GPA dropping/i,
        /failed a test/i,
        /parents expect/i
      ]
    };

    // Check teacher issues
    for (const pattern of patterns.teacherIssues) {
      if (pattern.test(input)) {
        return "Some teachers forget they're teaching humans, not robots. Document everything, advocate for yourself, and remember: their opinion of you isn't your truth.";
      }
    }

    // Check homework overwhelm
    for (const pattern of patterns.homework) {
      if (pattern.test(input)) {
        return "Executive dysfunction + homework = paralysis. Start with 5 minutes of the easiest part. Momentum is easier to maintain than to create.";
      }
    }

    // Check social dynamics
    for (const pattern of patterns.socialDynamics) {
      if (pattern.test(input)) {
        return "High school social dynamics are temporary hierarchies in a mandatory prison. Your real people might not be there yet. That's not about you - it's about timing.";
      }
    }

    // Check academic pressure
    for (const pattern of patterns.academicPressure) {
      if (pattern.test(input)) {
        return "The college admissions system is broken - it's not a meritocracy, it's a lottery for the privileged. Your worth isn't your GPA or your college acceptance.";
      }
    }

    return "School asks you to excel at everything simultaneously while your brain is still developing. That's an impossible ask. Surviving is succeeding.";
  }

  // SCHEDULE BALANCE
  getScheduleSupport(input: string): string {
    const patterns = {
      overwhelmed: [
        /too much to do/i,
        /no time for/i,
        /juggling everything/i,
        /can\'t keep up/i,
        /falling behind/i
      ],
      familyConflict: [
        /parents want me to/i,
        /family expects/i,
        /have to help at home/i,
        /family obligations/i
      ],
      socialFomo: [
        /missing out/i,
        /everyone\'s hanging out/i,
        /can\'t go because/i,
        /have to choose between/i
      ]
    };

    for (const pattern of patterns.overwhelmed) {
      if (pattern.test(input)) {
        return "You're managing school, social, family, maybe work, plus your own needs. That's 5 full-time jobs. Something has to give, and that's not failure - it's physics.";
      }
    }

    for (const pattern of patterns.familyConflict) {
      if (pattern.test(input)) {
        return "Balancing your family's needs with your own development is the hardest thing. You can honor them without sacrificing yourself entirely.";
      }
    }

    for (const pattern of patterns.socialFomo) {
      if (pattern.test(input)) {
        return "FOMO hits different when every hangout is documented. But the best moments often happen off-camera, including the moment you choose rest over performance.";
      }
    }

    return "Your generation has to be 'on' 24/7 - available to school, family, friends, and social media. No wonder you're exhausted. Rest is resistance.";
  }

  // CONSCIOUSNESS & PHILOSOPHY
  getConsciousnessSupport(input: string): string {
    const patterns = {
      existential: [
        /what\'s the point/i,
        /why are we here/i,
        /meaning of life/i,
        /nothing matters/i,
        /simulation theory/i
      ],
      identity: [
        /who am i really/i,
        /finding myself/i,
        /don\'t know who i am/i,
        /identity crisis/i,
        /authentic self/i
      ],
      reality: [
        /is reality real/i,
        /consciousness/i,
        /free will/i,
        /determinism/i,
        /quantum/i
      ]
    };

    for (const pattern of patterns.existential) {
      if (pattern.test(input)) {
        return "Questioning existence while existing is the most human thing you can do. The fact that you can ask 'why' is more interesting than any answer.";
      }
    }

    for (const pattern of patterns.identity) {
      if (pattern.test(input)) {
        return "You're forming identity while performing it publicly. Previous generations got to be cringe in private. You're doing the hardest identity work in history.";
      }
    }

    for (const pattern of patterns.reality) {
      if (pattern.test(input)) {
        return "Your generation is the first to grow up with virtual reality, AI, and simulation theory as normal concepts. No wonder you question what's 'real.'";
      }
    }

    return "Big questions deserve space to breathe. You don't have to solve consciousness today. Sometimes sitting with the mystery is the wisdom.";
  }

  // INNER GOLD TRACKING
  trackInnerGold(input: string): void {
    // Detect projections
    const projectionPatterns = [
      /wish i was like/i,
      /they\'re so much better/i,
      /i could never be/i,
      /they have it all/i,
      /why can\'t i be/i
    ];

    for (const pattern of projectionPatterns) {
      if (pattern.test(input)) {
        // Extract who/what they're projecting onto
        const projection: GoldProjection = {
          projectedOnto: this.extractProjectionTarget(input),
          quality: this.extractProjectedQuality(input),
          timestamp: new Date(),
          readyToReclaim: false
        };
        this.lifeDomain.innerGold.push(projection);
      }
    }
  }

  // SPIRAL TRACKING (Without burden)
  trackSpiral(input: string): void {
    const spiralTypes = {
      anxiety: /anxious|anxiety|panicking|worried|scared/i,
      comparison: /everyone else|better than me|comparing|behind/i,
      perfectionism: /perfect|not good enough|failed|disappointed/i,
      rejection: /rejected|ignored|left out|nobody cares/i,
      identity: /who am i|don\'t know myself|lost|confused about myself/i
    };

    for (const [type, pattern] of Object.entries(spiralTypes)) {
      if (pattern.test(input)) {
        const existingSpiral = this.lifeDomain.spirals.find(s => s.type === type as any);
        if (existingSpiral) {
          existingSpiral.frequency++;
          existingSpiral.lastOccurrence = new Date();
        } else {
          this.lifeDomain.spirals.push({
            type: type as any,
            trigger: this.extractTrigger(input),
            frequency: 1,
            lastOccurrence: new Date(),
            interventionsUsed: [],
            progress: 0
          });
        }
      }
    }
  }

  // REFLECTION SYSTEM - Holding their gold until they're ready
  reflectInnerGold(): string {
    const recentProjection = this.lifeDomain.innerGold[this.lifeDomain.innerGold.length - 1];
    if (!recentProjection) return "";

    const reflections = [
      `That ${recentProjection.quality} you see in ${recentProjection.projectedOnto}? That's your own gold shining back at you.`,
      `You wouldn't recognize ${recentProjection.quality} if you didn't have it yourself. You're seeing your own unlived potential.`,
      `${recentProjection.projectedOnto} is holding a mirror to your own ${recentProjection.quality}. When you're ready, you'll claim it.`,
      `The ${recentProjection.quality} isn't theirs - it's yours. You've just asked them to carry it for a while.`
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  // Helper methods
  private extractProjectionTarget(input: string): string {
    // Simple extraction - could be enhanced
    const match = input.match(/wish i was like (.+)|they\'re|them|her|him/i);
    return match?.[1] || "them";
  }

  private extractProjectedQuality(input: string): string {
    // Extract what quality they're seeing in others
    const qualities = ['confidence', 'talent', 'beauty', 'intelligence', 'success', 'happiness', 'creativity'];
    for (const quality of qualities) {
      if (input.toLowerCase().includes(quality)) return quality;
    }
    return 'brilliance';
  }

  private extractTrigger(input: string): string {
    // Simple trigger extraction
    return input.substring(0, 50) + "...";
  }

  // Progress tracking without burden
  getProgressSummary(): string {
    const spiralProgress = this.lifeDomain.spirals.reduce((acc, s) => acc + s.progress, 0) / this.lifeDomain.spirals.length || 0;
    const goldReclaimed = this.lifeDomain.innerGold.filter(g => g.readyToReclaim).length;

    return `You've been navigating ${this.lifeDomain.spirals.length} patterns, reclaiming ${goldReclaimed} projections, and growing through it all. I see your progress even when you can't.`;
  }
}
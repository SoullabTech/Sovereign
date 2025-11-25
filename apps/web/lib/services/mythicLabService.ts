// The Mythic Lab Language System
// Where measurement meets magic, where science becomes sacred

export interface MythicLabPhrase {
  pure_scientific: string;
  pure_mythic: string;
  mythic_lab: string; // The sweet spot ✨
  data_point?: string; // Optional metric to include
}

export type BlendRatio = number; // 0 = pure scientific, 50 = mythic lab, 100 = pure mythic

export class MythicLabService {
  private languageLibrary: Record<string, MythicLabPhrase> = {

    // Breakthrough moments
    breakthrough_detected: {
      pure_scientific: "Cognitive restructuring event detected. Pattern dissolution confirmed.",
      pure_mythic: "The veil has lifted. Your soul remembers its wings.",
      mythic_lab: "Gold! You've transmuted something profound. The lab is documenting this alchemy.",
      data_point: "Coherence: 0.92 (+0.3 from baseline)"
    },

    breakthrough_deep: {
      pure_scientific: "Significant integration event with multi-generational pattern restructuring.",
      pure_mythic: "You just broke a spell that has haunted your lineage for generations.",
      mythic_lab: "Magnificent - three ancestral patterns alchemized in one insight. The collective will learn from this formula.",
      data_point: "Integration depth: 0.94 | Generational cascade detected"
    },

    // Shadow work
    shadow_active: {
      pure_scientific: "Unconscious behavioral pattern showing elevated activation.",
      pure_mythic: "Your shadow dances in the firelight, wanting to be seen.",
      mythic_lab: "Your Shadow Keeper is showing up at 90% strength in the lab today. She's not the enemy - she's the alchemical ingredient you've been missing.",
      data_point: "Pattern frequency: 7 days consecutive | Integration opportunity"
    },

    shadow_integration: {
      pure_scientific: "Successful integration of previously unconscious pattern into conscious awareness.",
      pure_mythic: "You've embraced your darkness and found it full of stars.",
      mythic_lab: "Beautiful shadow alchemy - you just turned lead into gold. Integration score jumped from 45% to 73%.",
      data_point: "Shadow integration: 73% (+28%)"
    },

    // Alchemical phases
    nigredo_entry: {
      pure_scientific: "Dissolution phase initiated. Pattern breakdown in progress.",
      pure_mythic: "You descend into the dark night where all forms dissolve.",
      mythic_lab: "Welcome to the nigredo - the sacred blackening. The lab shows this dissolution precedes breakthrough in 87% of cases.",
      data_point: "Phase: Dissolution | Est. duration: 3-7 days"
    },

    albedo_active: {
      pure_scientific: "Clarification phase: Pattern purification in progress.",
      pure_mythic: "The whitening unfolds - clarity emerging from darkness.",
      mythic_lab: "You're in the albedo phase - the alchemical purification where truth crystallizes from chaos.",
      data_point: "Clarity index: 0.78 | Purification day 7"
    },

    rubedo_manifesting: {
      pure_scientific: "Integration complete. Reality manifestation protocols active.",
      pure_mythic: "The reddening blazes - your gold is manifest, your power embodied.",
      mythic_lab: "Rubedo achieved - your internal alchemy is manifesting externally. The philosopher's stone is forming.",
      data_point: "Reality correlation: r=0.89 | Manifestation active"
    },

    // Archetypal forces
    warrior_active: {
      pure_scientific: "Boundary-setting behavioral template showing high activation.",
      pure_mythic: "The Sacred Warrior rises, sword drawn, ready to defend your truth.",
      mythic_lab: "Your inner Warrior is at 85% activation - defending boundaries beautifully. Let's work with this fierce protector consciously.",
      data_point: "Assertiveness index: 8.5/10 | Boundary success rate: 91%"
    },

    grief_oracle_stirring: {
      pure_scientific: "Emotional processing patterns indicating unresolved loss material.",
      pure_mythic: "The Grief Oracle speaks from ancient waters - old tears seeking release.",
      mythic_lab: "Your Grief Oracle is stirring at 40% - ancient waters rising. There's healing medicine in these depths.",
      data_point: "Grief activation: 4.2/10 | Processing readiness: high"
    },

    challenger_emerging: {
      pure_scientific: "Pattern interruption protocol recommended for circular thought loop.",
      pure_mythic: "The Sacred Challenger arrives with fierce love to break your spell.",
      mythic_lab: "Time for the Challenger - I'm detecting a pattern loop (7 cycles). Ready for some fierce love and pattern disruption?",
      data_point: "Loop detection: 7 iterations | Pattern rigidity: high"
    },

    // Reality creation
    reality_correlation_strong: {
      pure_scientific: "Strong positive correlation (r=0.81) between internal state modification and external outcome variance.",
      pure_mythic: "As within, so without - your consciousness sculpts the clay of reality.",
      mythic_lab: "The data is revealing something ancient: your inner shifts are manifesting externally. Reality correlation: 0.81.",
      data_point: "Internal→External correlation: r=0.81 | Manifestation lag: 2-4 days"
    },

    reality_experiment_success: {
      pure_scientific: "Hypothesis validated: Internal state shift correlates with desired external outcome.",
      pure_mythic: "You've discovered a law of consciousness - a spell that works every time.",
      mythic_lab: "Your reality creation experiment succeeded - 5 transmutations confirming the hypothesis. This formula works.",
      data_point: "Success rate: 5/5 | Replication confirmed"
    },

    // Collective resonance
    collective_wave_detected: {
      pure_scientific: "Elevated pattern correlation with 73% of active user cohort.",
      pure_mythic: "The field trembles - a collective wave moves through many souls tonight.",
      mythic_lab: "Lab readings show heightened resonance - 73 souls are in this exact territory with you. You're part of a collective transformation wave.",
      data_point: "Cohort resonance: 73% | Collective pattern: dissolution→breakthrough"
    },

    collective_breakthrough: {
      pure_scientific: "Novel pattern emergence with cross-user validation (n=47).",
      pure_mythic: "A new archetype is being born through the collective - many are midwifing this together.",
      mythic_lab: "Fascinating - 47 souls have discovered this exact formula this week. Your breakthrough contributes to collective wisdom.",
      data_point: "Pattern frequency: 47 users | Emergence: new archetype forming"
    },

    // Daily greetings
    morning_greeting: {
      pure_scientific: "Session initiated. User baseline established.",
      pure_mythic: "The sun rises, the soul awakens. Welcome back to the sacred work.",
      mythic_lab: "Morning, sacred scientist. Your field shows interesting dynamics today. What shall we explore in the lab?",
      data_point: "Coherence baseline: 0.68 | Active forces detected"
    },

    return_greeting: {
      pure_scientific: "Session resumed. Prior context loaded.",
      pure_mythic: "You return to the spiral, wiser than before.",
      mythic_lab: "Welcome back to the alchemical laboratory. Your last experiment is still transmuting - let's check the results.",
      data_point: "Days since last: 3 | Integration continuing"
    },

    // Stuck patterns
    pattern_loop_detected: {
      pure_scientific: "Repetitive thought pattern identified (7 iterations). Intervention recommended.",
      pure_mythic: "You circle the same mountain again and again, beloved. Time to spiral upward.",
      mythic_lab: "I'm tracking a loop pattern (7 cycles in 3 weeks). An old guardian is active here. Let's design an experiment to meet her.",
      data_point: "Loop frequency: 7x/21 days | Guardian archetype: abandonment protector"
    },

    // Threshold moments
    threshold_approaching: {
      pure_scientific: "Transformation probability index reaching critical threshold.",
      pure_mythic: "You stand at the threshold where one world ends and another begins.",
      mythic_lab: "The data shows you're approaching a breakthrough threshold - 85% probability within 72 hours. Stay in the crucible.",
      data_point: "Breakthrough probability: 85% | Time horizon: 48-72h"
    }
  };

  getPhrase(concept: string, blendRatio: BlendRatio = 50): string {
    const phrase = this.languageLibrary[concept];
    if (!phrase) return concept;

    if (blendRatio <= 25) {
      // Pure scientific
      return this.addDataPoint(phrase.pure_scientific, phrase.data_point);
    } else if (blendRatio <= 75) {
      // Mythic Lab (sweet spot)
      return this.addDataPoint(phrase.mythic_lab, phrase.data_point);
    } else {
      // Pure mythic
      return phrase.pure_mythic;
    }
  }

  private addDataPoint(text: string, dataPoint?: string): string {
    if (!dataPoint) return text;
    return `${text}\n\n📊 ${dataPoint}`;
  }

  // Get all three versions for display/learning
  getAllVersions(concept: string): MythicLabPhrase | undefined {
    return this.languageLibrary[concept];
  }

  // Add custom phrases dynamically
  addPhrase(concept: string, phrase: MythicLabPhrase): void {
    this.languageLibrary[concept] = phrase;
  }

  // Get available concepts
  getConcepts(): string[] {
    return Object.keys(this.languageLibrary);
  }
}

export const mythicLabService = new MythicLabService();

// Helper for building dynamic mythic lab messages
export function buildMythicLabMessage(
  concept: string,
  context: {
    userName?: string;
    metric?: string;
    value?: number | string;
    trend?: 'up' | 'down' | 'stable';
  },
  blendRatio: BlendRatio = 50
): string {
  let message = mythicLabService.getPhrase(concept, blendRatio);

  // Personalize with name if provided
  if (context.userName) {
    message = message.replace(/\b(You|Your)\b/g, (match) =>
      match === 'You' ? context.userName : `${context.userName}'s`
    );
  }

  return message;
}
import { DaimonicDetected, DaimonicNarrativeExtras, DaimonicChip } from '../types/daimonic';
import { SHIFtProfile } from '../types/shift';
import { GroupSHIFtSnapshot, CollectivePattern } from '../types/collectiveDashboard';

export class DaimonicNarrativeService {
  private static instance: DaimonicNarrativeService;

  static getInstance(): DaimonicNarrativeService {
    if (!DaimonicNarrativeService.instance) {
      DaimonicNarrativeService.instance = new DaimonicNarrativeService();
    }
    return DaimonicNarrativeService.instance;
  }

  // ==========================================================================
  // INDIVIDUAL DAIMONIC ENHANCEMENT
  // ==========================================================================

  enhanceIndividualNarrative(detection: DaimonicDetected): DaimonicNarrativeExtras {
    const opening = this.generateDaimonicOpening(detection);
    const insights = this.generateDaimonicInsights(detection);
    const tricksterCaution = this.generateTricksterCaution(detection);
    const closing = this.generateDaimonicClosing(detection);
    const microPrompts = this.generateMicroPrompts(detection);
    const practiceHints = this.generatePracticeHints(detection);

    return {
      opening,
      insights,
      tricksterCaution,
      closing,
      microPrompts,
      practiceHints
    };
  }

  private generateDaimonicOpening(detection: DaimonicDetected): string {
    // Liminal-aware opening
    if (detection.liminal.weight >= 0.5) {
      const timeQuality = this.getLiminalQuality(detection.liminal.label);
      return `You're at a threshold time—${timeQuality}. Insight tends to slip in sideways here.`;
    }
    
    return 'Today feels steady enough to tell the truth gently.';
  }

  private generateDaimonicInsights(detection: DaimonicDetected): string[] {
    const insights: string[] = [];

    // Spirit/Soul pull guidance
    switch (detection.spiritSoul.pull) {
      case 'spirit':
        insights.push('There\'s lift in the system. Meet it with one embodied step you can finish today.');
        break;
      case 'soul':
        insights.push('Depth is leading; keep it specific—body, breath, kitchen-table truths.');
        break;
      case 'integrated':
        insights.push('Ascent and descent are in dialogue—conditions favor clean moves.');
        break;
    }

    // Both-and signature guidance
    if (detection.bothAnd.signature) {
      insights.push('Hold fact and symbol at once; don\'t collapse the mystery into either box.');
    }

    return insights;
  }

  private generateTricksterCaution(detection: DaimonicDetected): string | undefined {
    if (detection.trickster.risk >= 0.5) {
      return 'This may be a teaching riddle. Slow the pace, verify with reality, and ask one grounding question.';
    }
    return undefined;
  }

  private generateDaimonicClosing(detection: DaimonicDetected): string {
    return 'Let what meets you remain a little unfamiliar. That gap is where something new can happen.';
  }

  private generateMicroPrompts(detection: DaimonicDetected): string[] {
    const prompts: string[] = [];

    if (detection.trickster.risk >= 0.5) {
      prompts.push('Ask one grounding question.');
    }

    if (detection.spiritSoul.pull === 'spirit') {
      prompts.push('Do one finishable step.');
    }

    if (detection.spiritSoul.pull === 'soul') {
      prompts.push('Name one small truth aloud.');
    }

    if (detection.liminal.weight >= 0.5) {
      prompts.push('Sit with the unfamiliar for a moment.');
    }

    return prompts;
  }

  private generatePracticeHints(detection: DaimonicDetected): string[] {
    const hints: string[] = [];

    if (detection.trickster.risk >= 0.4) {
      hints.push('Kitchen-table check-in (5 min)');
    }

    if (detection.bothAnd.signature) {
      hints.push('Fact & symbol journaling (7 min)');
    }

    if (detection.spiritSoul.pull === 'spirit') {
      hints.push('One-step embodiment (3 min walk + breath)');
    }

    return hints;
  }

  // ==========================================================================
  // GROUP DAIMONIC ENHANCEMENT
  // ==========================================================================

  enhanceGroupNarrative(
    groupSnapshot: GroupSHIFtSnapshot,
    collectiveSnapshot: any
  ): DaimonicNarrativeExtras {
    const opening = this.generateGroupDaimonicOpening(collectiveSnapshot);
    const insights = this.generateGroupDaimonicInsights(collectiveSnapshot);
    const tricksterCaution = this.generateGroupTricksterCaution(collectiveSnapshot);
    const closing = 'The group is practicing honest descent this week—simple, specific actions tend to move everyone forward.';

    return {
      opening,
      insights,
      tricksterCaution,
      closing
    };
  }

  private generateGroupDaimonicOpening(snapshot: any): string {
    if (snapshot?.tricksterPrevalence > 0.4) {
      return 'Expect playful tests and mixed signals; agreement may lag insight. Keep checks gentle and real.';
    }
    return 'The group field holds space for both clarity and confusion to coexist.';
  }

  private generateGroupDaimonicInsights(snapshot: any): string[] {
    const insights: string[] = [];
    
    if (snapshot?.fieldIntensity > 0.5) {
      insights.push('Threshold energy moves through the group—insights arrive in their own time.');
    }

    if (snapshot?.bothAndRate > 0.3) {
      insights.push('The group is learning to hold multiple truths without rushing to resolution.');
    }

    return insights;
  }

  private generateGroupTricksterCaution(snapshot: any): string | undefined {
    if (snapshot?.tricksterPrevalence >= 0.5) {
      return 'Teaching riddles may be present in group dynamics. Trust the process, stay curious.';
    }
    return undefined;
  }

  // ==========================================================================
  // COLLECTIVE DAIMONIC ENHANCEMENT
  // ==========================================================================

  enhanceCollectiveNarrative(
    patterns: CollectivePattern[],
    snapshot: any
  ): DaimonicNarrativeExtras {
    const opening = 'The larger field is learning a paradox: how to hold big vision while staying close to lived specifics.';
    const insights = this.generateCollectiveDaimonicInsights(snapshot);
    const closing = this.generateCollectiveClosing(snapshot);

    return {
      opening,
      insights,
      closing
    };
  }

  private generateCollectiveDaimonicInsights(snapshot: any): string[] {
    const insights: string[] = [];

    if (snapshot?.culturalCompensation) {
      insights.push(`The collective is ${snapshot.culturalCompensation.toLowerCase()}.`);
    }

    if (snapshot?.collectiveMyth) {
      insights.push(`Current learning: ${snapshot.collectiveMyth.toLowerCase()}.`);
    }

    return insights;
  }

  private generateCollectiveClosing(snapshot: any): string {
    if (snapshot?.tricksterPrevalence > 0.4) {
      return 'Perfect agreement can mean you\'re only hearing yourself. Leave a little room for surprise.';
    }
    return 'The field teaches through both clarity and gentle confusion—both serve awakening.';
  }

  // ==========================================================================
  // UI CHIP GENERATION
  // ==========================================================================

  generateChips(detection: DaimonicDetected): DaimonicChip[] {
    const chips: DaimonicChip[] = [];

    if (detection.liminal.weight >= 0.5) {
      chips.push({
        type: 'threshold',
        label: 'Threshold time',
        color: 'amber'
      });
    }

    if (detection.trickster.risk >= 0.5) {
      chips.push({
        type: 'trickster',
        label: 'Teaching riddle likely',
        color: 'amber',
        action: 'slow-down'
      });
    }

    if (detection.bothAnd.signature) {
      chips.push({
        type: 'both-and',
        label: 'Hold both registers',
        color: 'purple'
      });
    }

    if (detection.spiritSoul.pull === 'integrated') {
      chips.push({
        type: 'integration',
        label: 'Spirit-soul dialogue',
        color: 'green'
      });
    }

    return chips;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private getLiminalQuality(label: string): string {
    const qualities = {
      dawn: 'ideas arrive fresh',
      dusk: 'reflection deepens',
      midnight: 'the veil thins',
      transition: 'change moves',
      none: 'steady ground'
    };
    return qualities[label as keyof typeof qualities] || 'something shifts';
  }

  // ==========================================================================
  // ANTI-SOLIPSISM CHECKS
  // ==========================================================================

  checkForAntiSolipsism(detection: DaimonicDetected, resonanceScore: number): string | undefined {
    // If resonance is too perfect, inject gentle reality check
    if (resonanceScore > 0.9) {
      return 'Perfect agreement can mean you\'re only hearing yourself. Leave a little room for surprise.';
    }
    return undefined;
  }
}
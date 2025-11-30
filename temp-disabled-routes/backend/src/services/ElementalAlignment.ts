/**
 * Elemental Alignment Service
 * 
 * Maps Bernardo Kastrup's Natural vs Adaptive Self distinction onto Spiralogic's Elemental framework.
 * Assesses whether elemental expressions stem from Nature's call (diamond) or adaptive overlays.
 */

import { Element, SHIFtProfile } from '../types/shift';
import { GroupSHIFtSnapshot, CollectivePattern } from '../types/collectiveDashboard';

export interface AlignmentAssessment {
  element: Element;
  mode: 'natural' | 'adaptive' | 'unclear';
  narrative: string;
}

export class ElementalAlignment {
  
  /**
   * Assess individual elemental patterns for Natural vs Adaptive expression
   */
  static assessIndividual(profile: SHIFtProfile): AlignmentAssessment[] {
    return Object.entries(profile.elements).map(([element, score]) => {
      if (element === 'confidence') return null;
      
      const confidence = profile.confidence;

      // Natural Self indicators: steady, effortless flow
      const steady = score > 55 && score < 75 && confidence > 0.6;
      const effortless = score > 65 && !this.hasElementalShadow(profile, element as Element);

      // Adaptive Self indicators: compensatory patterns
      const overdriven = score > 80;
      const undercut = score < 30;
      const shadowTied = this.hasElementalShadow(profile, element as Element);
      const lowConfidence = confidence < 0.4;

      if (steady || effortless) {
        return {
          element: element as Element,
          mode: 'natural',
          narrative: `Your ${element} expresses itself with quiet steadiness — this feels close to Nature's will.`
        };
      }

      if (overdriven || shadowTied) {
        return {
          element: element as Element,
          mode: 'adaptive',
          narrative: `Your ${element} blazes strongly, yet may be compensatory — driven more by adaptive urgency than natural flow.`
        };
      }

      if (undercut || lowConfidence) {
        return {
          element: element as Element,
          mode: 'adaptive',
          narrative: `Your ${element} feels thin or suppressed — perhaps an adaptive strategy that dims Nature's call.`
        };
      }

      return {
        element: element as Element,
        mode: 'unclear',
        narrative: `Your ${element} is present, yet its origin remains uncertain — attend closely to whether it serves wholeness or survival.`
      };
    }).filter(Boolean) as AlignmentAssessment[];
  }

  /**
   * Assess group elemental patterns for Natural vs Adaptive collective expression
   */
  static assessGroup(snapshot: GroupSHIFtSnapshot): AlignmentAssessment[] {
    const { elementMeans, coherenceScore, dominantElement, lowestElement } = snapshot;

    return Object.entries(elementMeans).map(([element, mean]) => {
      const isDominant = element === dominantElement;
      const isLowest = element === lowestElement;

      if (isDominant && coherenceScore > 0.6) {
        return {
          element: element as Element,
          mode: 'natural',
          narrative: `The group's ${element} flows with harmony — a shared current aligned with Nature's will.`
        };
      }

      if (isDominant && coherenceScore < 0.4) {
        return {
          element: element as Element,
          mode: 'adaptive',
          narrative: `The group's ${element} is strong but fragmented — perhaps driven by collective adaptation rather than deep resonance.`
        };
      }

      if (isLowest) {
        return {
          element: element as Element,
          mode: 'adaptive',
          narrative: `The group's ${element} feels thin — collectively avoided or suppressed, needing gentle invitation.`
        };
      }

      return {
        element: element as Element,
        mode: 'unclear',
        narrative: `The group's ${element} moves in balance — not yet clear whether this stems from diamond clarity or adaptive consensus.`
      };
    });
  }

  /**
   * Assess collective patterns for Natural vs Adaptive expression at scale
   */
  static assessCollective(patterns: CollectivePattern[]): AlignmentAssessment[] {
    return patterns.map(pattern => {
      const element = (pattern.data?.element || 'aether') as Element;

      if (pattern.confidence > 0.7 && pattern.strength > 0.5) {
        return {
          element,
          mode: 'natural',
          narrative: `The collective field expresses ${pattern.description} — a current aligned with the wider intelligence of Nature.`
        };
      }

      if (pattern.confidence < 0.4 || pattern.strength < 0.3) {
        return {
          element,
          mode: 'adaptive',
          narrative: `The collective shows ${pattern.description}, yet this may be an adaptive overlay — requiring deeper attention.`
        };
      }

      return {
        element,
        mode: 'unclear',
        narrative: `The collective pattern of ${pattern.description} is emergent — time will reveal whether it serves wholeness or survival.`
      };
    });
  }

  /**
   * Generate Natural vs Adaptive synthesis for narrative integration
   */
  static synthesizeAlignment(assessments: AlignmentAssessment[]): {
    natural: AlignmentAssessment[];
    adaptive: AlignmentAssessment[];
    guidance: string;
  } {
    const natural = assessments.filter(a => a.mode === 'natural');
    const adaptive = assessments.filter(a => a.mode === 'adaptive');
    const unclear = assessments.filter(a => a.mode === 'unclear');

    let guidance = '';
    
    if (natural.length > adaptive.length) {
      guidance = 'Your diamond nature shines clearly — trust these natural currents and let them guide the work of rebalancing what feels forced.';
    } else if (adaptive.length > natural.length) {
      guidance = 'Much energy moves through adaptive strategies — gently attend to what serves survival versus what serves wholeness.';
    } else {
      guidance = 'Elements dance between natural flow and adaptive overlay — patient attention will reveal the deeper currents.';
    }

    if (unclear.length > 2) {
      guidance += ' What remains unclear invites deeper listening — the body knows more than the mind can grasp immediately.';
    }

    return { natural, adaptive, guidance };
  }

  /**
   * Check if an element shows shadow/compensatory patterns
   */
  private static hasElementalShadow(profile: SHIFtProfile, element: Element): boolean {
    // Check facets for shadow indicators (this would need to be refined based on actual facet structure)
    const shadowKeywords = ['over', 'under', 'rigid', 'chaotic', 'avoidant', 'compulsive'];
    
    return profile.facets?.some(facet => 
      facet.code.includes(element) && 
      shadowKeywords.some(keyword => facet.code.includes(keyword)) &&
      facet.score > 70
    ) || false;
  }

  /**
   * Detect dominant alignment mode across all assessments
   */
  static getDominantAlignmentMode(assessments: AlignmentAssessment[]): 'natural' | 'adaptive' | 'mixed' {
    const naturalCount = assessments.filter(a => a.mode === 'natural').length;
    const adaptiveCount = assessments.filter(a => a.mode === 'adaptive').length;
    
    if (naturalCount > adaptiveCount * 1.5) return 'natural';
    if (adaptiveCount > naturalCount * 1.5) return 'adaptive';
    return 'mixed';
  }
}
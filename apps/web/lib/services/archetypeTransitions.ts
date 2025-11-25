import { ArchetypeKey } from './archetypeService';

export interface ArchetypeTransition {
  from: ArchetypeKey;
  to: ArchetypeKey;
  message: string;
  reason?: string;
}

export class ArchetypeTransitionService {

  private transitionMap: Record<string, string> = {
    'LAB_PARTNER_to_LAB_GUIDE':
      "Let me shift into guide mode for a moment...",

    'LAB_PARTNER_to_MENTOR':
      "This calls for some deeper wisdom from the lab's collective experience...",

    'LAB_PARTNER_to_WITNESS':
      "I'm going to simply hold space for this...",

    'LAB_PARTNER_to_CHALLENGER':
      "I need to challenge something I'm seeing here...",

    'LAB_PARTNER_to_ORACLE':
      "The field has something to show us...",

    'LAB_PARTNER_to_ALCHEMIST':
      "This is a transformation moment. Let me work with you as alchemist...",

    'LAB_GUIDE_to_LAB_PARTNER':
      "Now that you have orientation, let's explore together...",

    'LAB_GUIDE_to_ORACLE':
      "The collective field has something to say about this...",

    'LAB_GUIDE_to_ALCHEMIST':
      "This guidance needs alchemical wisdom...",

    'MENTOR_to_LAB_PARTNER':
      "Now let's experiment with what we've learned...",

    'MENTOR_to_WITNESS':
      "Before more teaching, let me simply be present...",

    'WITNESS_to_LAB_PARTNER':
      "Thank you for sharing that. Shall we explore it together?",

    'WITNESS_to_LAB_GUIDE':
      "Thank you for sharing that. Now let me offer some guidance...",

    'WITNESS_to_MENTOR':
      "What you've shared touches something ancient. Let me speak to that...",

    'CHALLENGER_to_LAB_PARTNER':
      "Good. You faced that. Now let's investigate together...",

    'CHALLENGER_to_MENTOR':
      "Good, you faced that. Now let me share what this teaches...",

    'CHALLENGER_to_WITNESS':
      "I see that landed hard. Let me just be present with you...",

    'ORACLE_to_LAB_PARTNER':
      "The field has spoken. Now let's work with what's been revealed...",

    'ORACLE_to_ALCHEMIST':
      "The pattern is clear. Now the work of transformation begins...",

    'ALCHEMIST_to_LAB_PARTNER':
      "The transformation is underway. Let's observe it together...",

    'ALCHEMIST_to_WITNESS':
      "This process needs space. I'm here to hold it...",

    'ALCHEMIST_to_ORACLE':
      "Your transformation connects to a larger pattern..."
  };

  async transitionArchetype(
    from: ArchetypeKey,
    to: ArchetypeKey,
    reason?: string
  ): Promise<ArchetypeTransition> {

    // If same archetype, no transition needed
    if (from === to) {
      return {
        from,
        to,
        message: '',
        reason
      };
    }

    const key = `${from}_to_${to}`;
    const message = this.transitionMap[key] || this.generateGenericTransition(from, to);

    return {
      from,
      to,
      message,
      reason
    };
  }

  private generateGenericTransition(from: ArchetypeKey, to: ArchetypeKey): string {
    const fromName = from.toLowerCase().replace('_', ' ');
    const toName = to.toLowerCase().replace('_', ' ');

    return `Shifting from ${fromName} to ${toName}...`;
  }

  shouldAnnounceTransition(from: ArchetypeKey, to: ArchetypeKey): boolean {
    // Always announce when moving to WITNESS (sacred space)
    if (to === 'WITNESS') return true;

    // Always announce when moving to CHALLENGER (prepare them)
    if (to === 'CHALLENGER') return true;

    // Announce major shifts (LAB_PARTNER to MENTOR, ORACLE, ALCHEMIST)
    const majorShifts = [
      'LAB_PARTNER_to_MENTOR',
      'LAB_PARTNER_to_ORACLE',
      'LAB_PARTNER_to_ALCHEMIST'
    ];

    return majorShifts.includes(`${from}_to_${to}`);
  }

  getTransitionStyle(from: ArchetypeKey, to: ArchetypeKey): 'explicit' | 'subtle' | 'silent' {
    // Explicit transitions (announced clearly)
    if (to === 'WITNESS' || to === 'CHALLENGER') {
      return 'explicit';
    }

    // Subtle transitions (brief mention)
    if (from === 'LAB_PARTNER' && ['MENTOR', 'ORACLE', 'ALCHEMIST'].includes(to)) {
      return 'subtle';
    }

    // Silent transitions (no announcement, just shift voice)
    return 'silent';
  }

  async blendArchetypes(
    primary: ArchetypeKey,
    secondary: ArchetypeKey,
    blendRatio: number = 0.7
  ): Promise<{
    primary: ArchetypeKey;
    secondary: ArchetypeKey;
    blendRatio: number;
    description: string;
  }> {
    const blends: Record<string, string> = {
      'LAB_PARTNER_MENTOR': 'Exploring together while offering wisdom',
      'LAB_GUIDE_CHALLENGER': 'Guiding with fierce love',
      'WITNESS_MENTOR': 'Holding space while offering teaching',
      'ORACLE_ALCHEMIST': 'Revealing patterns while facilitating transformation',
      'LAB_PARTNER_ORACLE': 'Collaborative exploration with collective insights'
    };

    const key = `${primary}_${secondary}`;
    const description = blends[key] || `Blending ${primary} with ${secondary}`;

    return {
      primary,
      secondary,
      blendRatio,
      description
    };
  }
}

export const archetypeTransitionService = new ArchetypeTransitionService();
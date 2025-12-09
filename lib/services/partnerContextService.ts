/**
 * Partner Context Service
 * Handles integration of institutional profiles and custom professional context into MAIA's system prompt
 */

import { PartnerContextData, InstitutionalProfile, CustomProfessionalContext } from '@/lib/types/partnerContext';

/**
 * Generate system prompt addition for partner context
 */
export function generatePartnerContextPrompt(partnerContextData: PartnerContextData): string {
  if (!partnerContextData) return '';

  let contextPrompt = `\n## PARTNER CONTEXT AWARENESS\n\n`;

  // Add institutional profile information
  if (partnerContextData.profile) {
    const profile = partnerContextData.profile;

    contextPrompt += `The user is engaging through the **${profile.name}** partnership context.\n\n`;
    contextPrompt += `### Institutional Context:\n`;
    contextPrompt += `- **Institution**: ${profile.institution.toUpperCase()}\n`;
    contextPrompt += `- **Context**: ${profile.context}\n`;
    contextPrompt += `- **Description**: ${profile.description}\n`;

    if (profile.culturalNotes) {
      contextPrompt += `- **Cultural Context**: ${profile.culturalNotes}\n`;
    }

    contextPrompt += `\n### Common Challenges in This Context:\n`;
    profile.commonChallenges.forEach((challenge, i) => {
      contextPrompt += `${i + 1}. ${challenge}\n`;
    });

    contextPrompt += `\n### Suggested Areas of Focus:\n`;
    profile.suggestedFocus.forEach((focus, i) => {
      contextPrompt += `${i + 1}. ${focus}\n`;
    });
  }

  // Add custom professional context
  if (partnerContextData.customContext) {
    const custom = partnerContextData.customContext;

    contextPrompt += `\n### User's Professional Context:\n`;

    if (custom.role) {
      contextPrompt += `- **Role/Position**: ${custom.role}\n`;
    }

    if (custom.department) {
      contextPrompt += `- **Department/Area**: ${custom.department}\n`;
    }

    if (custom.currentProjects && custom.currentProjects.length > 0) {
      contextPrompt += `- **Current Projects**:\n`;
      custom.currentProjects.forEach((project, i) => {
        contextPrompt += `  ${i + 1}. ${project}\n`;
      });
    }

    if (custom.mainChallenges && custom.mainChallenges.length > 0) {
      contextPrompt += `- **Main Professional Challenges**:\n`;
      custom.mainChallenges.forEach((challenge, i) => {
        contextPrompt += `  ${i + 1}. ${challenge}\n`;
      });
    }

    if (custom.workStyle) {
      contextPrompt += `- **Work Style**: ${custom.workStyle}\n`;
    }

    if (custom.stressLevel) {
      const stressLevelDescription = {
        'low': 'Low - feeling balanced and manageable',
        'medium': 'Medium - manageable pressure but noticeable',
        'high': 'High - feeling overwhelmed or stretched thin'
      }[custom.stressLevel];
      contextPrompt += `- **Current Stress Level**: ${stressLevelDescription}\n`;
    }

    if (custom.timeAtInstitution) {
      contextPrompt += `- **Time at Institution**: ${custom.timeAtInstitution}\n`;
    }
  }

  // Add guidance for MAIA
  contextPrompt += `\n### Guidance for Your Response:\n`;
  contextPrompt += `- Acknowledge their institutional context naturally when relevant\n`;
  contextPrompt += `- Draw connections between their professional challenges and inner development\n`;
  contextPrompt += `- Offer insights that bridge their work environment with personal growth\n`;

  if (partnerContextData.profile?.suggestedFocus) {
    contextPrompt += `- Consider focusing on: ${partnerContextData.profile.suggestedFocus.slice(0, 3).join(', ')}\n`;
  }

  if (partnerContextData.customContext?.stressLevel === 'high') {
    contextPrompt += `- Pay special attention to stress management and overwhelm\n`;
    contextPrompt += `- Offer grounding practices appropriate for high-pressure environments\n`;
  }

  contextPrompt += `- Maintain your authentic MAIA voice while being contextually aware\n`;
  contextPrompt += `- Remember this is a sacred space for transformation, not just professional development\n\n`;

  return contextPrompt;
}

/**
 * Extract partner context from stored session data
 */
export function extractPartnerContext(sessionStorage: any, localStorage: any): PartnerContextData | null {
  try {
    const partnerContextData = sessionStorage.getItem('partner_context_data');
    if (partnerContextData) {
      return JSON.parse(partnerContextData);
    }

    // Fallback to legacy partner context
    const legacyPartnerContext = sessionStorage.getItem('partner_context') || localStorage.getItem('sl_partner_context');
    if (legacyPartnerContext && legacyPartnerContext !== 'general') {
      return {
        institution: legacyPartnerContext.split('_')[0] || '',
        context: legacyPartnerContext.split('_')[1] || '',
        entryType: 'preloaded',
        lastUpdated: new Date()
      };
    }

    return null;
  } catch (error) {
    console.warn('Failed to extract partner context:', error);
    return null;
  }
}
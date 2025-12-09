/**
 * Partner Context Types for Institutional Integrations
 * Supports both preloaded institutional profiles and custom professional contexts
 */

export interface InstitutionalProfile {
  id: string;
  institution: string;
  context: string;
  name: string;
  description: string;
  defaultRole?: string;
  commonChallenges: string[];
  suggestedFocus: string[];
  culturalNotes?: string;
}

export interface CustomProfessionalContext {
  role: string;
  department?: string;
  currentProjects?: string[];
  mainChallenges?: string[];
  workStyle?: 'collaborative' | 'independent' | 'mixed';
  stressLevel?: 'low' | 'medium' | 'high';
  timeAtInstitution?: string;
}

export interface PartnerContextData {
  institution: string;
  context: string;
  profile?: InstitutionalProfile;
  customContext?: CustomProfessionalContext;
  entryType: 'preloaded' | 'custom' | 'hybrid';
  lastUpdated: Date;
}

export interface PartnerChoiceOptions {
  useInstitutionalFocus: boolean;
  addCustomContext: boolean;
  professionalContext?: CustomProfessionalContext;
  preferredExperience: 'work_focused' | 'balanced' | 'personal_growth';
}
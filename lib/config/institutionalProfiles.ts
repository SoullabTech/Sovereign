/**
 * Preloaded Institutional Profiles
 * Configuration for partner institutions with tailored contexts
 */

import { InstitutionalProfile } from '@/lib/types/partnerContext';

export const INSTITUTIONAL_PROFILES: InstitutionalProfile[] = [
  {
    id: 'yale_tsai',
    institution: 'yale',
    context: 'tsai',
    name: 'Yale Tsai Center for Innovative Thinking',
    description: 'Innovation and entrepreneurship ecosystem at Yale',
    defaultRole: 'Innovation Fellow',
    commonChallenges: [
      'Balancing academic rigor with entrepreneurial ambition',
      'Managing uncertainty in innovation projects',
      'Collaborating across disciplines and departments',
      'Translating research into practical applications',
      'Navigating institutional vs. startup cultures'
    ],
    suggestedFocus: [
      'Creative problem-solving approaches',
      'Leadership in uncertainty',
      'Cross-functional collaboration',
      'Innovation mindset development',
      'Academic-industry bridge building'
    ],
    culturalNotes: 'Yale culture values intellectual excellence, tradition, and innovation. Tsai Center specifically focuses on bridging academic research with real-world application.'
  },
  {
    id: 'yale_som',
    institution: 'yale',
    context: 'som',
    name: 'Yale School of Management',
    description: 'Business education with mission-driven leadership focus',
    defaultRole: 'MBA Student',
    commonChallenges: [
      'Competitive academic environment',
      'Career transition and networking',
      'Balancing analytical and intuitive decision-making',
      'Mission-driven vs. profit-driven tensions',
      'Leadership development under pressure'
    ],
    suggestedFocus: [
      'Authentic leadership development',
      'Mission-driven decision making',
      'Network relationship building',
      'Strategic thinking integration',
      'Work-life integration strategies'
    ],
    culturalNotes: 'SOM emphasizes mission-driven leadership and integrated thinking across sectors.'
  },
  {
    id: 'yale_research',
    institution: 'yale',
    context: 'research',
    name: 'Yale Research Community',
    description: 'Academic researchers and graduate students',
    defaultRole: 'Research Fellow',
    commonChallenges: [
      'Research isolation and collaboration needs',
      'Publication pressure and creative blocks',
      'Work-life balance in academic careers',
      'Imposter syndrome in competitive environments',
      'Translating research impact to broader audiences'
    ],
    suggestedFocus: [
      'Creative research methodologies',
      'Academic collaboration strategies',
      'Research-life integration',
      'Confidence building and authenticity',
      'Knowledge translation and communication'
    ],
    culturalNotes: 'Yale research culture values intellectual rigor, collaboration, and pushing disciplinary boundaries.'
  },
  {
    id: 'yale_undergrad',
    institution: 'yale',
    context: 'undergrad',
    name: 'Yale Undergraduate Community',
    description: 'Yale College students and residential college life',
    defaultRole: 'Student',
    commonChallenges: [
      'Academic pressure and perfectionism',
      'Social dynamics and belonging',
      'Future planning and career uncertainty',
      'Extracurricular overcommitment',
      'Identity formation in competitive environment'
    ],
    suggestedFocus: [
      'Authentic self-discovery',
      'Healthy achievement perspectives',
      'Community building and relationships',
      'Purpose exploration and values clarification',
      'Stress management and wellbeing practices'
    ],
    culturalNotes: 'Yale undergraduate culture emphasizes excellence, tradition, and community within the residential college system.'
  },
  {
    id: 'qri_research',
    institution: 'qri',
    context: 'research',
    name: 'Qualia Research Institute',
    description: 'Consciousness research focused on mapping the mathematical structure of experience',
    defaultRole: 'Research Fellow',
    commonChallenges: [
      'Bridging subjective experience with mathematical formalism',
      'Communicating consciousness research to broader audiences',
      'Navigating the hard problem of consciousness methodologically',
      'Integrating phenomenology with computational approaches',
      'Managing existential implications of consciousness research',
      'Balancing scientific rigor with experiential validity'
    ],
    suggestedFocus: [
      'First-person research methodologies',
      'Integration of objective and subjective approaches',
      'Consciousness state mapping and navigation',
      'Phenomenological precision and clarity',
      'Ethical implications of consciousness technology',
      'Personal practice informing research insights'
    ],
    culturalNotes: 'QRI culture values mathematical precision, phenomenological rigor, and the systematic study of consciousness. Research often involves personal experimentation and first-person investigation alongside formal methods.'
  },
  {
    id: 'qri_collaboration',
    institution: 'qri',
    context: 'collaboration',
    name: 'QRI Collaborative Network',
    description: 'Researchers, philosophers, and practitioners collaborating on consciousness studies',
    defaultRole: 'Collaborator',
    commonChallenges: [
      'Coordinating interdisciplinary consciousness research',
      'Maintaining research quality across diverse methodologies',
      'Balancing theoretical work with practical applications',
      'Navigating philosophical disagreements constructively',
      'Integrating contemplative practices with scientific research',
      'Managing the pace and scope of consciousness exploration'
    ],
    suggestedFocus: [
      'Collaborative research methodologies',
      'Cross-disciplinary communication skills',
      'Personal consciousness exploration practices',
      'Theoretical framework integration',
      'Research ethics and responsibility',
      'Community building in consciousness research'
    ],
    culturalNotes: 'QRI collaborative network values open inquiry, methodological diversity, and the integration of multiple approaches to consciousness research. Emphasis on both rigorous investigation and responsible exploration.'
  },
  {
    id: 'qri_applied',
    institution: 'qri',
    context: 'applied',
    name: 'QRI Applied Consciousness Technology',
    description: 'Developing practical applications of consciousness research for wellbeing and optimization',
    defaultRole: 'Applied Researcher',
    commonChallenges: [
      'Translating theoretical insights into practical interventions',
      'Ensuring safety in consciousness technology development',
      'Validating subjective improvements with objective measures',
      'Navigating regulatory and ethical considerations',
      'Scaling personalized consciousness interventions',
      'Maintaining research integrity while developing applications'
    ],
    suggestedFocus: [
      'Technology-assisted consciousness development',
      'Safety protocols for consciousness exploration',
      'Measurement and validation methodologies',
      'Ethical technology development practices',
      'User experience in consciousness applications',
      'Integration of research findings with practical tools'
    ],
    culturalNotes: 'QRI applied research culture emphasizes responsible innovation, user safety, and the careful translation of consciousness research into beneficial technologies and practices.'
  }
];

export const getInstitutionalProfile = (institution: string, context: string): InstitutionalProfile | undefined => {
  return INSTITUTIONAL_PROFILES.find(profile =>
    profile.institution === institution && profile.context === context
  );
};

export const getInstitutionProfiles = (institution: string): InstitutionalProfile[] => {
  return INSTITUTIONAL_PROFILES.filter(profile => profile.institution === institution);
};

export const getAllInstitutions = (): string[] => {
  return [...new Set(INSTITUTIONAL_PROFILES.map(profile => profile.institution))];
};
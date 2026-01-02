import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * Clinical Framework Registry and Loader API
 * Manages clinical frameworks and controls access to them
 */

export interface ClinicalFramework {
  frameworkId: string;
  frameworkName: string;
  version: string;
  description: string;

  // Requirements
  certification: CertificationRequirement[];
  licenseRequirements: LicenseRequirement[];
  supervisionRequirements: SupervisionRequirement[];
  trainingRequirements: TrainingRequirement[];

  // Features and capabilities
  features: FrameworkFeature[];
  assessmentTools: AssessmentTool[];
  interventionLibrary: Intervention[];
  protocolPhases: ProtocolPhase[];

  // Subscription and pricing
  subscription: SubscriptionConfig;

  // Technical configuration
  apiEndpoints: APIEndpoint[];
  uiComponents: UIComponentConfig[];
  dataModel: DataModelConfig;

  // Status and metadata
  status: 'active' | 'beta' | 'deprecated' | 'development';
  publishedDate: Date;
  lastUpdated: Date;
  publisher: string;
}

export interface CertificationRequirement {
  type: string;
  issuer: string;
  requiredTrainingHours: number;
  renewalPeriod: string;
  required: boolean;
}

export interface LicenseRequirement {
  licenseType: string;
  states: string[];
  professions: string[];
  minimumExperience?: number;
}

export interface SupervisionRequirement {
  required: boolean;
  frequency: string;
  qualifications: string[];
  minimumHours?: number;
}

export interface TrainingRequirement {
  trainingName: string;
  provider: string;
  hours: number;
  certificateRequired: boolean;
}

export interface FrameworkFeature {
  featureId: string;
  name: string;
  description: string;
  accessLevel: 'basic' | 'standard' | 'advanced' | 'supervisor';
}

export interface AssessmentTool {
  assessmentId: string;
  name: string;
  description: string;
  questionCount: number;
  timeEstimate: string;
  scoringMethod: string;
}

export interface Intervention {
  interventionId: string;
  name: string;
  description: string;
  duration: string;
  targetSymptoms: string[];
  contraindications: string[];
}

export interface ProtocolPhase {
  phaseId: string;
  name: string;
  description: string;
  duration: string;
  prerequisites: string[];
  objectives: string[];
}

export interface SubscriptionConfig {
  monthlyFee: number;
  setupFee: number;
  trialPeriod: number; // days
  features: string[];
}

export interface APIEndpoint {
  endpoint: string;
  method: string;
  description: string;
  requiredRole: string[];
}

export interface UIComponentConfig {
  componentId: string;
  componentType: string;
  location: string;
  requiredAccess: string;
}

export interface DataModelConfig {
  tables: string[];
  relationships: string[];
  encryptionRequired: boolean;
}

// Framework Registry
const clinicalFrameworks: Map<string, ClinicalFramework> = new Map();

// Initialize with IPP framework
const ippFramework: ClinicalFramework = {
  frameworkId: 'ipp-spiralogic-v2.1',
  frameworkName: 'Spiralogic Ideal Parenting Protocol',
  version: '2.1.0',
  description: 'Comprehensive trauma-informed parenting assessment and intervention protocol using 5-element framework',

  certification: [{
    type: 'IPP_CERTIFIED_PRACTITIONER',
    issuer: 'Spiralogic Institute',
    requiredTrainingHours: 120,
    renewalPeriod: '24 months',
    required: true
  }],

  licenseRequirements: [{
    licenseType: 'Mental Health Professional',
    states: ['all'],
    professions: ['Licensed Psychologist', 'Licensed Clinical Social Worker', 'Licensed Marriage and Family Therapist', 'Licensed Professional Counselor'],
    minimumExperience: 2
  }],

  supervisionRequirements: {
    required: true,
    frequency: 'Monthly',
    qualifications: ['IPP Advanced Practitioner', 'IPP Supervisor Certification'],
    minimumHours: 2
  },

  trainingRequirements: [{
    trainingName: 'IPP Foundation Training',
    provider: 'Spiralogic Institute',
    hours: 40,
    certificateRequired: true
  }, {
    trainingName: 'IPP Advanced Practitioner',
    provider: 'Spiralogic Institute',
    hours: 80,
    certificateRequired: true
  }],

  features: [
    { featureId: 'ipp_assessment', name: 'Full IPP Assessment', description: '40-question comprehensive assessment', accessLevel: 'basic' },
    { featureId: 'elemental_analysis', name: 'Elemental Pattern Analysis', description: '5-element pattern identification and interpretation', accessLevel: 'standard' },
    { featureId: 'treatment_planning', name: 'Automated Treatment Planning', description: 'AI-generated treatment plans based on assessment results', accessLevel: 'standard' },
    { featureId: 'protocol_execution', name: 'Protocol Execution Engine', description: 'Systematic implementation of IPP protocols', accessLevel: 'advanced' },
    { featureId: 'supervision_dashboard', name: 'Supervision Dashboard', description: 'Supervisor oversight and case management tools', accessLevel: 'supervisor' }
  ],

  assessmentTools: [{
    assessmentId: 'ipp_full_assessment',
    name: 'IPP Comprehensive Assessment',
    description: 'Complete 40-question IPP assessment with elemental analysis',
    questionCount: 40,
    timeEstimate: '45-60 minutes',
    scoringMethod: 'Elemental pattern scoring with trauma indicators'
  }],

  interventionLibrary: [
    {
      interventionId: 'earth_grounding',
      name: 'Earth Element Grounding',
      description: 'Stability and security-focused interventions',
      duration: '20-30 minutes',
      targetSymptoms: ['Anxiety', 'Insecurity', 'Hypervigilance'],
      contraindications: ['Acute dissociation']
    },
    {
      interventionId: 'water_flow',
      name: 'Water Element Flow Work',
      description: 'Emotional regulation and intuition development',
      duration: '30-45 minutes',
      targetSymptoms: ['Emotional dysregulation', 'Disconnection from intuition'],
      contraindications: ['Active psychosis']
    }
  ],

  protocolPhases: [
    {
      phaseId: 'assessment',
      name: 'Assessment and Stabilization',
      description: 'Initial assessment and safety/stability establishment',
      duration: '2-4 sessions',
      prerequisites: ['Professional verification', 'Supervision arrangement'],
      objectives: ['Complete IPP assessment', 'Establish therapeutic alliance', 'Ensure client safety']
    },
    {
      phaseId: 'intervention',
      name: 'Active Intervention',
      description: 'Implementation of elemental-specific interventions',
      duration: '8-16 sessions',
      prerequisites: ['Completed assessment', 'Treatment plan approval'],
      objectives: ['Address primary elemental imbalances', 'Build parenting capacity', 'Process trauma as indicated']
    }
  ],

  subscription: {
    monthlyFee: 149.99,
    setupFee: 299.99,
    trialPeriod: 14,
    features: [
      'Full IPP assessment access',
      'Elemental pattern analysis',
      'Treatment planning automation',
      'Progress tracking and outcomes',
      'Supervision dashboard access',
      'Research participation eligibility'
    ]
  },

  apiEndpoints: [
    { endpoint: '/api/clinical/ipp/assessment', method: 'POST', description: 'Create new IPP assessment', requiredRole: ['ipp_practitioner'] },
    { endpoint: '/api/clinical/ipp/protocol', method: 'GET', description: 'Get IPP protocol recommendations', requiredRole: ['ipp_practitioner'] },
    { endpoint: '/api/clinical/ipp/supervision', method: 'GET', description: 'Access supervision dashboard', requiredRole: ['ipp_supervisor'] }
  ],

  uiComponents: [
    { componentId: 'ipp_assessment_form', componentType: 'assessment_form', location: '/clinical/ipp/assessment', requiredAccess: 'basic' },
    { componentId: 'ipp_dashboard', componentType: 'dashboard', location: '/clinical/ipp/dashboard', requiredAccess: 'standard' }
  ],

  dataModel: {
    tables: ['ipp_assessments', 'ipp_treatment_plans', 'ipp_session_notes', 'ipp_outcomes'],
    relationships: ['user_assessments', 'assessment_treatment_plans'],
    encryptionRequired: true
  },

  status: 'active',
  publishedDate: new Date('2024-01-15'),
  lastUpdated: new Date('2024-11-29'),
  publisher: 'Spiralogic Institute'
};

// Add additional frameworks
const emdrFramework: ClinicalFramework = {
  frameworkId: 'emdr-integration-v1.0',
  frameworkName: 'EMDR Integration Module',
  version: '1.0.0',
  description: 'EMDR preparation, processing support, and integration tools',

  certification: [{
    type: 'EMDR_THERAPIST',
    issuer: 'EMDR International Association',
    requiredTrainingHours: 50,
    renewalPeriod: '24 months',
    required: true
  }],

  licenseRequirements: [{
    licenseType: 'Mental Health Professional',
    states: ['all'],
    professions: ['Licensed Psychologist', 'Licensed Clinical Social Worker', 'Licensed Marriage and Family Therapist', 'Licensed Professional Counselor']
  }],

  supervisionRequirements: {
    required: true,
    frequency: 'Monthly',
    qualifications: ['EMDR Approved Consultant'],
    minimumHours: 2
  },

  trainingRequirements: [{
    trainingName: 'EMDR Basic Training',
    provider: 'EMDR International Association',
    hours: 50,
    certificateRequired: true
  }],

  features: [
    { featureId: 'resource_development', name: 'Resource Development', description: 'Positive resource installation and strengthening', accessLevel: 'basic' },
    { featureId: 'processing_support', name: 'Processing Support', description: 'Between-session processing support', accessLevel: 'standard' },
    { featureId: 'integration_tracking', name: 'Integration Tracking', description: 'Monitor processing integration over time', accessLevel: 'advanced' }
  ],

  assessmentTools: [{
    assessmentId: 'emdr_readiness',
    name: 'EMDR Readiness Assessment',
    description: 'Assessment of client readiness for EMDR processing',
    questionCount: 25,
    timeEstimate: '30 minutes',
    scoringMethod: 'Readiness indicators and contraindication screening'
  }],

  interventionLibrary: [
    {
      interventionId: 'safe_place',
      name: 'Safe Place Installation',
      description: 'Develop and strengthen internal safe place resource',
      duration: '30 minutes',
      targetSymptoms: ['Anxiety', 'Hypervigilance'],
      contraindications: ['Severe dissociation']
    }
  ],

  protocolPhases: [
    {
      phaseId: 'preparation',
      name: 'Preparation and Stabilization',
      description: 'Resource development and stabilization',
      duration: '4-8 sessions',
      prerequisites: ['EMDR training completion', 'Client assessment'],
      objectives: ['Develop sufficient resources', 'Establish dual awareness', 'Ensure window of tolerance']
    }
  ],

  subscription: {
    monthlyFee: 99.99,
    setupFee: 199.99,
    trialPeriod: 14,
    features: [
      'Resource development tools',
      'Processing support protocols',
      'Integration tracking',
      'Bilateral stimulation guidance',
      'Safety monitoring'
    ]
  },

  apiEndpoints: [
    { endpoint: '/api/clinical/emdr/assessment', method: 'POST', description: 'EMDR readiness assessment', requiredRole: ['emdr_therapist'] },
    { endpoint: '/api/clinical/emdr/resources', method: 'GET', description: 'Access resource library', requiredRole: ['emdr_therapist'] }
  ],

  uiComponents: [
    { componentId: 'emdr_resource_builder', componentType: 'resource_tool', location: '/clinical/emdr/resources', requiredAccess: 'basic' }
  ],

  dataModel: {
    tables: ['emdr_assessments', 'emdr_resources', 'emdr_sessions'],
    relationships: ['user_resources', 'session_processing'],
    encryptionRequired: true
  },

  status: 'beta',
  publishedDate: new Date('2024-06-01'),
  lastUpdated: new Date('2024-11-29'),
  publisher: 'EMDR Integration Team'
};

// Initialize frameworks
clinicalFrameworks.set(ippFramework.frameworkId, ippFramework);
clinicalFrameworks.set(emdrFramework.frameworkId, emdrFramework);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const frameworkId = searchParams.get('frameworkId');

    if (frameworkId) {
      // Get specific framework
      const framework = clinicalFrameworks.get(frameworkId);
      if (!framework) {
        return NextResponse.json(
          { success: false, error: 'Framework not found' },
          { status: 404 }
        );
      }

      // Check user access
      const accessCheck = await checkFrameworkAccess(userId, frameworkId);

      return NextResponse.json({
        success: true,
        framework: accessCheck.authorized ? framework : getPublicFrameworkInfo(framework),
        access: accessCheck
      });
    }

    // Get all frameworks with access levels
    const frameworks = Array.from(clinicalFrameworks.values());
    const frameworksWithAccess = await Promise.all(
      frameworks.map(async (framework) => {
        const accessCheck = await checkFrameworkAccess(userId, framework.frameworkId);
        return {
          framework: accessCheck.authorized ? framework : getPublicFrameworkInfo(framework),
          access: accessCheck
        };
      })
    );

    return NextResponse.json({
      success: true,
      frameworks: frameworksWithAccess
    });

  } catch (error) {
    console.error('❌ [FRAMEWORKS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch frameworks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, frameworkId, data } = body;

    switch (action) {
      case 'request_access':
        return await handleAccessRequest(userId, frameworkId, data);

      case 'register_framework':
        return await handleFrameworkRegistration(data);

      case 'update_framework':
        return await handleFrameworkUpdate(frameworkId, data);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [FRAMEWORKS] Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function checkFrameworkAccess(userId: string | null, frameworkId: string) {
  if (!userId || userId === 'guest') {
    return { authorized: false, reason: 'Authentication required' };
  }

  try {
    // Check user roles and framework access
    const rolesResponse = await fetch(`/api/auth/roles?userId=${userId}`);
    if (!rolesResponse.ok) {
      return { authorized: false, reason: 'Unable to verify user roles' };
    }

    const rolesData = await rolesResponse.json();
    const frameworkAccess = rolesData.frameworks?.find((fw: any) => fw.frameworkId === frameworkId);

    if (!frameworkAccess) {
      return { authorized: false, reason: 'No framework subscription' };
    }

    if (frameworkAccess.subscriptionStatus !== 'active') {
      return { authorized: false, reason: 'Inactive subscription' };
    }

    if (frameworkAccess.certification.required && !frameworkAccess.certification.certified) {
      return { authorized: false, reason: 'Certification required' };
    }

    return {
      authorized: true,
      accessLevel: frameworkAccess.accessLevel,
      subscriptionStatus: frameworkAccess.subscriptionStatus
    };

  } catch (error) {
    return { authorized: false, reason: 'Access verification failed' };
  }
}

function getPublicFrameworkInfo(framework: ClinicalFramework) {
  // Return limited public information for unauthorized users
  return {
    frameworkId: framework.frameworkId,
    frameworkName: framework.frameworkName,
    version: framework.version,
    description: framework.description,
    certification: framework.certification,
    subscription: framework.subscription,
    status: framework.status,
    publisher: framework.publisher
  };
}

async function handleAccessRequest(userId: string, frameworkId: string, requestData: any) {
  // Process access request (would integrate with billing system)
  return NextResponse.json({
    success: true,
    message: 'Access request received',
    requestId: `access_${Date.now()}`,
    nextSteps: [
      'Complete professional verification',
      'Subscribe to framework',
      'Complete required training',
      'Arrange supervision if required'
    ]
  });
}

async function handleFrameworkRegistration(frameworkData: ClinicalFramework) {
  // Register new framework (admin only)
  clinicalFrameworks.set(frameworkData.frameworkId, frameworkData);

  return NextResponse.json({
    success: true,
    message: 'Framework registered successfully',
    frameworkId: frameworkData.frameworkId
  });
}

async function handleFrameworkUpdate(frameworkId: string, updateData: any) {
  // Update existing framework (admin only)
  const existingFramework = clinicalFrameworks.get(frameworkId);
  if (!existingFramework) {
    return NextResponse.json(
      { success: false, error: 'Framework not found' },
      { status: 404 }
    );
  }

  const updatedFramework = { ...existingFramework, ...updateData };
  clinicalFrameworks.set(frameworkId, updatedFramework);

  return NextResponse.json({
    success: true,
    message: 'Framework updated successfully',
    framework: updatedFramework
  });
}
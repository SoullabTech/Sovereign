import { NextRequest, NextResponse } from 'next/server';

/**
 * IPP Elemental Pattern Analysis API
 * Provides sophisticated analysis of IPP assessment results using 5-element framework
 */

interface ElementalAnalysisRequest {
  userId: string;
  assessmentId: string;
  elementScores: ElementScores;
  traumaIndicators: TraumaIndicatorResults;
  attachmentPatterns: AttachmentPatternResults;
  demographicFactors?: DemographicFactors;
}

interface ElementScores {
  earth: ElementScore;
  water: ElementScore;
  fire: ElementScore;
  air: ElementScore;
  aether: ElementScore;
}

interface ElementScore {
  rawScore: number;
  percentileScore: number;
  balanceLevel: 'deficient' | 'low' | 'balanced' | 'high' | 'excessive';
  subscaleScores: { [key: string]: number };
}

interface TraumaIndicatorResults {
  overallRisk: 'low' | 'moderate' | 'high' | 'severe';
  traumaTypes: TraumaType[];
  elementalAssociations: ElementalTraumaPattern[];
  developmentalImpact: DevelopmentalImpactProfile;
}

interface TraumaType {
  type: 'attachment' | 'developmental' | 'complex' | 'acute' | 'intergenerational';
  severity: number;
  confidence: number;
  indicators: string[];
}

interface ElementalTraumaPattern {
  element: Element;
  traumaSignatures: string[];
  compensatoryPatterns: string[];
  treatmentPriority: number;
}

interface AttachmentPatternResults {
  primaryStyle: 'secure' | 'anxious-preoccupied' | 'dismissive-avoidant' | 'disorganized';
  elementalSignature: ElementalAttachmentProfile;
  caregivingCapacity: CaregivingAssessment;
  intergenerationalPatterns: IntergenerationalPattern[];
}

interface ElementalAttachmentProfile {
  dominantElements: Element[];
  deficientElements: Element[];
  attachmentStrengths: string[];
  attachmentChallenges: string[];
  elementalInterplay: ElementInteraction[];
}

interface CaregivingAssessment {
  overallCapacity: number;
  strengths: CaregivingStrength[];
  challenges: CaregivingChallenge[];
  supportNeeds: SupportNeed[];
}

interface IntergenerationalPattern {
  patternType: string;
  elementalOrigin: Element;
  transmissionMechanism: string;
  interventionOpportunity: string;
}

interface ElementInteraction {
  elements: [Element, Element];
  relationship: 'supportive' | 'creative' | 'destructive' | 'neutral';
  strength: number;
  clinicalSignificance: string;
}

interface DemographicFactors {
  age?: number;
  culturalBackground?: string;
  socioeconomicStatus?: string;
  familyStructure?: string;
  parentingExperience?: number;
}

interface AnalysisResults {
  overallProfile: ElementalProfile;
  detailedAnalysis: DetailedElementalAnalysis;
  clinicalInsights: ClinicalInsight[];
  treatmentRecommendations: TreatmentRecommendation[];
  riskFactors: RiskFactor[];
  strengthsAndResources: StrengthResource[];
  monitoringPlan: MonitoringPlan;
}

interface ElementalProfile {
  dominantPattern: ElementalPatternType;
  balanceScore: number;
  adaptabilityIndex: number;
  resilenceCapacity: number;
  elementalMaturity: ElementalMaturity;
}

interface DetailedElementalAnalysis {
  earthAnalysis: ElementAnalysis;
  waterAnalysis: ElementAnalysis;
  fireAnalysis: ElementAnalysis;
  airAnalysis: ElementAnalysis;
  aetherAnalysis: ElementAnalysis;
  elementInteractions: ElementInteractionAnalysis[];
}

interface ElementAnalysis {
  element: Element;
  currentState: ElementState;
  historicalContext: HistoricalContext;
  functionalCapacity: FunctionalCapacity;
  traumaSignatures: TraumaSignature[];
  developmentalNeeds: DevelopmentalNeed[];
  interventionTargets: InterventionTarget[];
}

interface TreatmentRecommendation {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  targetElement: Element;
  interventionType: InterventionType;
  specificTechniques: string[];
  estimatedDuration: string;
  successMetrics: string[];
  contraindications: string[];
}

type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';
type ElementalPatternType = 'earth-dominant' | 'water-dominant' | 'fire-dominant' | 'air-dominant' | 'aether-dominant' | 'balanced' | 'chaotic' | 'depleted';
type InterventionType = 'grounding' | 'emotional_regulation' | 'activation' | 'cognitive_restructuring' | 'spiritual_integration' | 'somatic' | 'relational';

export async function POST(request: NextRequest) {
  try {
    const body: ElementalAnalysisRequest = await request.json();
    const { userId, assessmentId, elementScores, traumaIndicators, attachmentPatterns, demographicFactors } = body;

    // Validate user access
    const accessCheck = await checkAnalysisAccess(userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.reason },
        { status: 403 }
      );
    }

    // Perform comprehensive elemental analysis
    const analysisResults = await performElementalAnalysis({
      elementScores,
      traumaIndicators,
      attachmentPatterns,
      demographicFactors
    });

    // Store analysis results
    await storeAnalysisResults(userId, assessmentId, analysisResults);

    return NextResponse.json({
      success: true,
      analysis: analysisResults,
      analysisId: generateAnalysisId(),
      timestamp: new Date().toISOString(),
      clinicalNote: "This analysis is generated by AI and should be reviewed by a qualified clinician"
    });

  } catch (error) {
    console.error('❌ [IPP-ANALYSIS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform elemental analysis' },
      { status: 500 }
    );
  }
}

async function checkAnalysisAccess(userId: string) {
  try {
    const rolesResponse = await fetch(`/api/auth/roles?userId=${userId}`);
    if (!rolesResponse.ok) {
      return { authorized: false, reason: 'Unable to verify access' };
    }

    const rolesData = await rolesResponse.json();
    const authorizedRoles = ['ipp_practitioner', 'clinical_supervisor', 'licensed_professional'];

    const hasAccess = rolesData.roles?.some((role: string) => authorizedRoles.includes(role));

    if (!hasAccess) {
      return { authorized: false, reason: 'Clinical analysis access required' };
    }

    return { authorized: true, roles: rolesData.roles };

  } catch (error) {
    return { authorized: false, reason: 'Access verification failed' };
  }
}

async function performElementalAnalysis(data: {
  elementScores: ElementScores;
  traumaIndicators: TraumaIndicatorResults;
  attachmentPatterns: AttachmentPatternResults;
  demographicFactors?: DemographicFactors;
}): Promise<AnalysisResults> {

  const { elementScores, traumaIndicators, attachmentPatterns, demographicFactors } = data;

  // 1. Determine overall elemental profile
  const overallProfile = analyzeElementalProfile(elementScores);

  // 2. Perform detailed elemental analysis
  const detailedAnalysis = performDetailedElementalAnalysis(elementScores, traumaIndicators, attachmentPatterns);

  // 3. Generate clinical insights
  const clinicalInsights = generateClinicalInsights(elementScores, traumaIndicators, attachmentPatterns, overallProfile);

  // 4. Develop treatment recommendations
  const treatmentRecommendations = generateTreatmentRecommendations(detailedAnalysis, overallProfile);

  // 5. Identify risk factors
  const riskFactors = identifyRiskFactors(traumaIndicators, elementScores, attachmentPatterns);

  // 6. Map strengths and resources
  const strengthsAndResources = identifyStrengthsAndResources(elementScores, attachmentPatterns);

  // 7. Create monitoring plan
  const monitoringPlan = createMonitoringPlan(treatmentRecommendations, riskFactors);

  return {
    overallProfile,
    detailedAnalysis,
    clinicalInsights,
    treatmentRecommendations,
    riskFactors,
    strengthsAndResources,
    monitoringPlan
  };
}

function analyzeElementalProfile(elementScores: ElementScores): ElementalProfile {
  // Determine dominant pattern based on element scores
  const scores = Object.entries(elementScores).map(([element, score]) => ({
    element: element as Element,
    score: score.percentileScore
  }));

  // Sort by score to find dominant pattern
  scores.sort((a, b) => b.score - a.score);
  const highest = scores[0];
  const lowest = scores[scores.length - 1];

  // Calculate balance score (lower variance = more balanced)
  const mean = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s.score - mean, 2), 0) / scores.length;
  const balanceScore = Math.max(0, 100 - Math.sqrt(variance));

  // Determine dominant pattern
  let dominantPattern: ElementalPatternType;
  if (balanceScore > 80) {
    dominantPattern = 'balanced';
  } else if (highest.score - lowest.score > 40) {
    dominantPattern = `${highest.element}-dominant` as ElementalPatternType;
  } else if (mean < 40) {
    dominantPattern = 'depleted';
  } else {
    dominantPattern = 'chaotic';
  }

  // Calculate adaptability and resilience
  const adaptabilityIndex = calculateAdaptabilityIndex(elementScores);
  const resilenceCapacity = calculateResilienceCapacity(elementScores, dominantPattern);

  // Assess elemental maturity
  const elementalMaturity = assessElementalMaturity(elementScores);

  return {
    dominantPattern,
    balanceScore,
    adaptabilityIndex,
    resilenceCapacity,
    elementalMaturity
  };
}

function performDetailedElementalAnalysis(
  elementScores: ElementScores,
  traumaIndicators: TraumaIndicatorResults,
  attachmentPatterns: AttachmentPatternResults
): DetailedElementalAnalysis {

  // Analyze each element in detail
  const earthAnalysis = analyzeIndividualElement('earth', elementScores.earth, traumaIndicators, attachmentPatterns);
  const waterAnalysis = analyzeIndividualElement('water', elementScores.water, traumaIndicators, attachmentPatterns);
  const fireAnalysis = analyzeIndividualElement('fire', elementScores.fire, traumaIndicators, attachmentPatterns);
  const airAnalysis = analyzeIndividualElement('air', elementScores.air, traumaIndicators, attachmentPatterns);
  const aetherAnalysis = analyzeIndividualElement('aether', elementScores.aether, traumaIndicators, attachmentPatterns);

  // Analyze element interactions
  const elementInteractions = analyzeElementInteractions(elementScores);

  return {
    earthAnalysis,
    waterAnalysis,
    fireAnalysis,
    airAnalysis,
    aetherAnalysis,
    elementInteractions
  };
}

function analyzeIndividualElement(
  element: Element,
  elementScore: ElementScore,
  traumaIndicators: TraumaIndicatorResults,
  attachmentPatterns: AttachmentPatternResults
): ElementAnalysis {

  // Define element-specific analysis based on IPP framework
  const elementDefinitions = {
    earth: {
      qualities: ['stability', 'grounding', 'structure', 'material security', 'embodiment'],
      traumaSignatures: ['abandonment fears', 'survival anxiety', 'body disconnection', 'material insecurity'],
      functionalAspects: ['routine establishment', 'boundary setting', 'resource management', 'physical presence']
    },
    water: {
      qualities: ['emotional flow', 'intuition', 'empathy', 'adaptation', 'nurturing'],
      traumaSignatures: ['emotional overwhelm', 'boundary dissolution', 'empathic overload', 'emotional numbing'],
      functionalAspects: ['emotional regulation', 'intuitive guidance', 'relational attunement', 'healing presence']
    },
    fire: {
      qualities: ['passion', 'motivation', 'transformation', 'personal power', 'creativity'],
      traumaSignatures: ['rage patterns', 'power struggles', 'creative blocks', 'motivation collapse'],
      functionalAspects: ['goal achievement', 'creative expression', 'leadership capacity', 'transformational energy']
    },
    air: {
      qualities: ['mental clarity', 'communication', 'perspective', 'flexibility', 'learning'],
      traumaSignatures: ['overthinking patterns', 'dissociation', 'communication breakdowns', 'rigid thinking'],
      functionalAspects: ['clear thinking', 'effective communication', 'perspective-taking', 'learning integration']
    },
    aether: {
      qualities: ['spiritual connection', 'meaning-making', 'transcendence', 'integration', 'purpose'],
      traumaSignatures: ['spiritual bypassing', 'existential despair', 'meaning-making difficulties', 'integration challenges'],
      functionalAspects: ['purpose clarity', 'spiritual practices', 'meaning integration', 'transcendent perspective']
    }
  };

  const definition = elementDefinitions[element];

  // Assess current state
  const currentState: ElementState = {
    balanceLevel: elementScore.balanceLevel,
    functionalCapacity: assessFunctionalCapacity(element, elementScore, definition),
    compensatoryPatterns: identifyCompensatoryPatterns(element, elementScore),
    integrationLevel: calculateIntegrationLevel(element, elementScore)
  };

  // Identify trauma signatures for this element
  const traumaSignatures = identifyElementalTraumaSignatures(element, traumaIndicators, definition);

  // Determine developmental needs
  const developmentalNeeds = identifyDevelopmentalNeeds(element, elementScore, currentState);

  // Generate intervention targets
  const interventionTargets = generateInterventionTargets(element, currentState, traumaSignatures);

  // Historical context (simulated based on patterns)
  const historicalContext = analyzeHistoricalContext(element, traumaSignatures, attachmentPatterns);

  return {
    element,
    currentState,
    historicalContext,
    functionalCapacity: currentState.functionalCapacity,
    traumaSignatures,
    developmentalNeeds,
    interventionTargets
  };
}

function generateClinicalInsights(
  elementScores: ElementScores,
  traumaIndicators: TraumaIndicatorResults,
  attachmentPatterns: AttachmentPatternResults,
  overallProfile: ElementalProfile
): ClinicalInsight[] {

  const insights: ClinicalInsight[] = [];

  // Primary clinical pattern insight
  insights.push({
    type: 'primary_pattern',
    priority: 'high',
    insight: `Primary elemental pattern shows ${overallProfile.dominantPattern} configuration with ${overallProfile.balanceScore}% balance score. This suggests ${getPatternImplication(overallProfile.dominantPattern)}.`,
    clinicalSignificance: 'Foundation for treatment planning and intervention sequencing',
    supportingEvidence: generatePatternEvidence(elementScores, overallProfile)
  });

  // Attachment-element integration insight
  const attachmentElementInsight = analyzeAttachmentElementIntegration(attachmentPatterns, elementScores);
  insights.push(attachmentElementInsight);

  // Trauma-element interaction insight
  const traumaElementInsight = analyzeTraumaElementInteraction(traumaIndicators, elementScores);
  insights.push(traumaElementInsight);

  // Adaptive capacity insight
  insights.push({
    type: 'adaptive_capacity',
    priority: 'medium',
    insight: `Adaptability index of ${overallProfile.adaptabilityIndex}% indicates ${getAdaptabilityInterpretation(overallProfile.adaptabilityIndex)} capacity for therapeutic change.`,
    clinicalSignificance: 'Informs treatment pacing and intervention intensity',
    supportingEvidence: generateAdaptabilityEvidence(elementScores)
  });

  // Resource identification insight
  const resourceInsight = identifyPrimaryResources(elementScores, attachmentPatterns);
  insights.push(resourceInsight);

  return insights;
}

function generateTreatmentRecommendations(
  detailedAnalysis: DetailedElementalAnalysis,
  overallProfile: ElementalProfile
): TreatmentRecommendation[] {

  const recommendations: TreatmentRecommendation[] = [];

  // Prioritize recommendations based on elemental analysis
  const elementAnalyses = [
    detailedAnalysis.earthAnalysis,
    detailedAnalysis.waterAnalysis,
    detailedAnalysis.fireAnalysis,
    detailedAnalysis.airAnalysis,
    detailedAnalysis.aetherAnalysis
  ];

  // Generate element-specific recommendations
  elementAnalyses.forEach(analysis => {
    const elementRecommendations = generateElementSpecificRecommendations(analysis, overallProfile);
    recommendations.push(...elementRecommendations);
  });

  // Sort by priority and therapeutic sequence
  recommendations.sort((a, b) => {
    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return recommendations.slice(0, 8); // Return top 8 recommendations
}

function generateElementSpecificRecommendations(
  analysis: ElementAnalysis,
  overallProfile: ElementalProfile
): TreatmentRecommendation[] {

  const recommendations: TreatmentRecommendation[] = [];
  const element = analysis.element;

  // Element-specific intervention mapping
  const interventionMap = {
    earth: {
      grounding: ['body-based practices', 'nature connection', 'routine establishment', 'resource mapping'],
      somatic: ['breathwork', 'movement therapy', 'body awareness', 'nervous system regulation']
    },
    water: {
      emotional_regulation: ['emotion identification', 'boundary work', 'flow practices', 'empathy training'],
      relational: ['attachment repair', 'interpersonal skills', 'emotional attunement', 'nurturing practices']
    },
    fire: {
      activation: ['goal setting', 'motivation enhancement', 'creative expression', 'personal power work'],
      cognitive_restructuring: ['limiting belief work', 'empowerment practices', 'transformation skills']
    },
    air: {
      cognitive_restructuring: ['thought pattern analysis', 'communication skills', 'perspective practices'],
      relational: ['listening skills', 'dialogue practices', 'conflict resolution', 'mental flexibility']
    },
    aether: {
      spiritual_integration: ['meaning-making practices', 'purpose exploration', 'transcendent practices'],
      grounding: ['integration practices', 'embodied spirituality', 'practical wisdom application']
    }
  };

  // Generate recommendations based on current state and intervention targets
  analysis.interventionTargets.forEach(target => {
    const interventionType = determineInterventionType(element, target);
    const techniques = interventionMap[element][interventionType] || [];

    recommendations.push({
      priority: target.priority,
      targetElement: element,
      interventionType,
      specificTechniques: techniques,
      estimatedDuration: target.estimatedDuration,
      successMetrics: target.successMetrics,
      contraindications: target.contraindications || []
    });
  });

  return recommendations;
}

// Helper functions for analysis components
function calculateAdaptabilityIndex(elementScores: ElementScores): number {
  // Calculate based on element score distribution and balance
  const scores = Object.values(elementScores).map(s => s.percentileScore);
  const range = Math.max(...scores) - Math.min(...scores);
  const adaptability = Math.max(0, 100 - range);
  return Math.round(adaptability);
}

function calculateResilienceCapacity(elementScores: ElementScores, pattern: ElementalPatternType): number {
  // Resilience based on elemental strengths and pattern stability
  const baseResilience = pattern === 'balanced' ? 80 : 60;
  const elementalStrength = Object.values(elementScores)
    .reduce((sum, score) => sum + Math.max(0, score.percentileScore - 50), 0) / 5;

  return Math.round(Math.min(100, baseResilience + elementalStrength));
}

function assessElementalMaturity(elementScores: ElementScores): ElementalMaturity {
  // Assess developmental integration of elements
  const maturityScores = Object.entries(elementScores).map(([element, score]) => ({
    element: element as Element,
    maturity: calculateElementMaturity(element as Element, score)
  }));

  return {
    overallMaturity: maturityScores.reduce((sum, m) => sum + m.maturity, 0) / 5,
    elementMaturity: maturityScores,
    developmentalStage: determineDevelopmentalStage(maturityScores)
  };
}

async function storeAnalysisResults(userId: string, assessmentId: string, results: AnalysisResults) {
  // In production, store in database with proper encryption
  console.log(`💾 [IPP-ANALYSIS] Storing analysis results for user ${userId}, assessment ${assessmentId}`);
  return true;
}

function generateAnalysisId(): string {
  return `ipp_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Type definitions for helper interfaces
interface ElementState {
  balanceLevel: string;
  functionalCapacity: any;
  compensatoryPatterns: string[];
  integrationLevel: number;
}

interface HistoricalContext {
  developmentalOrigins: string[];
  traumaHistory: string[];
  familialPatterns: string[];
}

interface FunctionalCapacity {
  currentCapacity: number;
  potentialCapacity: number;
  limitingFactors: string[];
}

interface TraumaSignature {
  signatureType: string;
  severity: number;
  elementalExpression: string;
}

interface DevelopmentalNeed {
  needType: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  developmentalStage: string;
}

interface InterventionTarget {
  targetType: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration: string;
  successMetrics: string[];
  contraindications?: string[];
}

interface ElementInteractionAnalysis {
  primaryInteraction: ElementInteraction;
  secondaryInteractions: ElementInteraction[];
  systemicImpact: string;
}

interface ClinicalInsight {
  type: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  insight: string;
  clinicalSignificance: string;
  supportingEvidence: string[];
}

interface RiskFactor {
  riskType: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  elementalAssociation: Element[];
  mitigationStrategies: string[];
}

interface StrengthResource {
  resourceType: string;
  elementalSource: Element;
  applicationMethods: string[];
  leverageStrategies: string[];
}

interface MonitoringPlan {
  assessmentFrequency: string;
  keyIndicators: string[];
  progressMarkers: string[];
  alertCriteria: string[];
}

interface ElementalMaturity {
  overallMaturity: number;
  elementMaturity: { element: Element; maturity: number }[];
  developmentalStage: string;
}

interface CaregivingStrength {
  strengthType: string;
  elementalBasis: Element;
  expression: string;
}

interface CaregivingChallenge {
  challengeType: string;
  elementalSource: Element;
  impact: string;
  interventionNeeded: boolean;
}

interface SupportNeed {
  needType: string;
  urgency: 'immediate' | 'short-term' | 'long-term';
  supportMethods: string[];
}

// Placeholder implementations for helper functions
function assessFunctionalCapacity(element: Element, score: ElementScore, definition: any): any {
  return {
    currentCapacity: score.percentileScore,
    potentialCapacity: Math.min(100, score.percentileScore + 20),
    limitingFactors: score.balanceLevel === 'deficient' ? definition.traumaSignatures : []
  };
}

function identifyCompensatoryPatterns(element: Element, score: ElementScore): string[] {
  if (score.balanceLevel === 'excessive') {
    return [`Over-reliance on ${element} qualities`, `Compensating for other elemental deficits`];
  }
  return [];
}

function calculateIntegrationLevel(element: Element, score: ElementScore): number {
  return score.percentileScore;
}

function identifyElementalTraumaSignatures(element: Element, trauma: TraumaIndicatorResults, definition: any): TraumaSignature[] {
  return trauma.elementalAssociations
    .filter(pattern => pattern.element === element)
    .map(pattern => ({
      signatureType: pattern.traumaSignatures[0] || 'general trauma',
      severity: trauma.overallRisk === 'severe' ? 4 : 2,
      elementalExpression: pattern.compensatoryPatterns[0] || 'elemental compensation'
    }));
}

function identifyDevelopmentalNeeds(element: Element, score: ElementScore, state: ElementState): DevelopmentalNeed[] {
  const needs: DevelopmentalNeed[] = [];

  if (score.balanceLevel === 'deficient' || score.balanceLevel === 'low') {
    needs.push({
      needType: `${element} development`,
      priority: 'high',
      developmentalStage: 'remedial'
    });
  }

  return needs;
}

function generateInterventionTargets(element: Element, state: ElementState, signatures: TraumaSignature[]): InterventionTarget[] {
  const targets: InterventionTarget[] = [];

  if (state.balanceLevel === 'deficient') {
    targets.push({
      targetType: `${element} strengthening`,
      priority: 'high',
      estimatedDuration: '3-6 months',
      successMetrics: [`Increased ${element} function`, 'Improved elemental balance']
    });
  }

  return targets;
}

function analyzeHistoricalContext(element: Element, signatures: TraumaSignature[], attachment: AttachmentPatternResults): HistoricalContext {
  return {
    developmentalOrigins: [`Early ${element} development patterns`],
    traumaHistory: signatures.map(s => s.signatureType),
    familialPatterns: [`Intergenerational ${element} patterns`]
  };
}

function analyzeElementInteractions(elementScores: ElementScores): ElementInteractionAnalysis[] {
  const interactions: ElementInteractionAnalysis[] = [];

  // Analyze key element pairs
  const elementPairs: [Element, Element][] = [
    ['earth', 'water'], ['water', 'fire'], ['fire', 'air'], ['air', 'aether'], ['aether', 'earth']
  ];

  elementPairs.forEach(([elem1, elem2]) => {
    const interaction = analyzeElementPair(elem1, elem2, elementScores[elem1], elementScores[elem2]);
    interactions.push({
      primaryInteraction: interaction,
      secondaryInteractions: [],
      systemicImpact: `${elem1}-${elem2} interaction affects overall elemental flow`
    });
  });

  return interactions;
}

function analyzeElementPair(elem1: Element, elem2: Element, score1: ElementScore, score2: ElementScore): ElementInteraction {
  const scoreDiff = Math.abs(score1.percentileScore - score2.percentileScore);
  let relationship: 'supportive' | 'creative' | 'destructive' | 'neutral' = 'neutral';

  if (scoreDiff < 20) relationship = 'supportive';
  else if (score1.percentileScore > score2.percentileScore + 30) relationship = 'destructive';
  else relationship = 'creative';

  return {
    elements: [elem1, elem2],
    relationship,
    strength: 100 - scoreDiff,
    clinicalSignificance: `${relationship} interaction between ${elem1} and ${elem2}`
  };
}

function getPatternImplication(pattern: ElementalPatternType): string {
  const implications = {
    'earth-dominant': 'strong grounding capacity but may need emotional and creative development',
    'water-dominant': 'high emotional sensitivity requiring structure and boundaries',
    'fire-dominant': 'strong motivation but may need regulation and grounding',
    'air-dominant': 'clear thinking but may need embodiment and emotional integration',
    'aether-dominant': 'spiritual awareness requiring practical grounding',
    'balanced': 'well-integrated elemental development with balanced capacities',
    'chaotic': 'inconsistent elemental expression requiring stabilization',
    'depleted': 'overall elemental exhaustion requiring comprehensive restoration'
  };

  return implications[pattern] || 'complex elemental pattern requiring individualized approach';
}

function getAdaptabilityInterpretation(index: number): string {
  if (index >= 80) return 'high';
  if (index >= 60) return 'moderate';
  if (index >= 40) return 'limited';
  return 'low';
}

function generatePatternEvidence(scores: ElementScores, profile: ElementalProfile): string[] {
  return [
    `Balance score: ${profile.balanceScore}%`,
    `Dominant element scoring: ${Math.max(...Object.values(scores).map(s => s.percentileScore))}%`,
    `Elemental range: ${Math.max(...Object.values(scores).map(s => s.percentileScore)) - Math.min(...Object.values(scores).map(s => s.percentileScore))}%`
  ];
}

function generateAdaptabilityEvidence(scores: ElementScores): string[] {
  return [
    `Elemental flexibility score`,
    `Cross-element integration capacity`,
    `Adaptive response patterns`
  ];
}

function analyzeAttachmentElementIntegration(attachment: AttachmentPatternResults, scores: ElementScores): ClinicalInsight {
  return {
    type: 'attachment_integration',
    priority: 'high',
    insight: `${attachment.primaryStyle} attachment style shows integration with ${attachment.elementalSignature.dominantElements.join(', ')} elemental dominance.`,
    clinicalSignificance: 'Informs relational intervention approaches and attachment repair strategies',
    supportingEvidence: [`Primary style: ${attachment.primaryStyle}`, `Elemental signature present`]
  };
}

function analyzeTraumaElementInteraction(trauma: TraumaIndicatorResults, scores: ElementScores): ClinicalInsight {
  return {
    type: 'trauma_interaction',
    priority: trauma.overallRisk === 'high' || trauma.overallRisk === 'severe' ? 'urgent' : 'high',
    insight: `${trauma.overallRisk} trauma risk level with ${trauma.elementalAssociations.length} elemental associations requiring specialized intervention.`,
    clinicalSignificance: 'Critical for trauma-informed treatment planning and safety considerations',
    supportingEvidence: [`Risk level: ${trauma.overallRisk}`, `Elemental trauma patterns identified`]
  };
}

function identifyPrimaryResources(scores: ElementScores, attachment: AttachmentPatternResults): ClinicalInsight {
  const highestElement = Object.entries(scores).reduce((max, [element, score]) =>
    score.percentileScore > max.score ? { element: element as Element, score: score.percentileScore } : max
  , { element: 'earth' as Element, score: 0 });

  return {
    type: 'resource_identification',
    priority: 'medium',
    insight: `Primary resource strength identified in ${highestElement.element} element (${highestElement.score}%) with ${attachment.caregivingCapacity.strengths.length} caregiving strengths.`,
    clinicalSignificance: 'Foundation for strength-based intervention approach',
    supportingEvidence: [`${highestElement.element} elemental strength`, `Caregiving capacity assets`]
  };
}

function determineInterventionType(element: Element, target: InterventionTarget): InterventionType {
  const typeMapping = {
    earth: 'grounding',
    water: 'emotional_regulation',
    fire: 'activation',
    air: 'cognitive_restructuring',
    aether: 'spiritual_integration'
  };

  return typeMapping[element] as InterventionType;
}

function calculateElementMaturity(element: Element, score: ElementScore): number {
  // Simple maturity calculation based on balance and integration
  const balanceBonus = score.balanceLevel === 'balanced' ? 20 : 0;
  return Math.min(100, score.percentileScore + balanceBonus);
}

function determineDevelopmentalStage(maturityScores: { element: Element; maturity: number }[]): string {
  const avgMaturity = maturityScores.reduce((sum, m) => sum + m.maturity, 0) / 5;

  if (avgMaturity >= 80) return 'integrated';
  if (avgMaturity >= 60) return 'developing';
  if (avgMaturity >= 40) return 'emerging';
  return 'foundational';
}
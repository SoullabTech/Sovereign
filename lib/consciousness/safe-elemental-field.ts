// backend: lib/consciousness/safe-elemental-field.ts

import { ElementalFieldIntegration } from '@/lib/consciousness/field/ElementalFieldIntegration';
import { MAIAFieldInterface } from '@/lib/consciousness/field/MAIAFieldInterface';
import { ConsciousnessField } from '@/lib/consciousness/field/ConsciousnessFieldEngine';
import { QuantumFieldPersistence } from '@/lib/consciousness/field/QuantumFieldPersistence';

// Lazy initialization to avoid constructor issues
let elementalField: ElementalFieldIntegration | null = null;

async function getElementalField(): Promise<ElementalFieldIntegration> {
  if (!elementalField) {
    try {
      // Initialize the required dependencies
      const maiaInterface = new MAIAFieldInterface();
      const fieldEngine = new ConsciousnessField({
        id: 'safe-field-' + Date.now(),
        vectorSpace: new Float32Array(1536),
        resonanceFrequency: 0.5,
        coherenceLevel: 0.8,
        patternSignatures: [],
        timestamp: new Date()
      });
      const fieldPersistence = new QuantumFieldPersistence();

      elementalField = new ElementalFieldIntegration(
        maiaInterface,
        fieldEngine,
        fieldPersistence
      );
    } catch (err: any) {
      console.warn('Failed to initialize elemental field dependencies:', err?.message || err);
      throw new Error('Elemental field initialization failed');
    }
  }
  return elementalField;
}

export interface SafeFieldStateParams {
  message: string;
  gebserAnalysis: any | null;
  awarenessLevel?: string;
  structureAssessment?: any;
  conversationHistory?: any[];
  elementalPhaseContext?: any;
}

export async function safeElementalFieldState(params: SafeFieldStateParams) {
  try {
    const field = await getElementalField();

    // The ElementalFieldIntegration doesn't have generateFieldState
    // Instead, we'll use getCurrentIntegratedState which provides similar functionality
    const integratedState = await field.getCurrentIntegratedState(
      'user_' + Date.now(),
      'session_' + Date.now()
    );

    if (integratedState) {
      // Transform to the expected field state format
      return {
        coherence: integratedState.elementalField.overallCoherence,
        dominantElement: integratedState.elementalField.fireResonance.fireElementBalance > 0.6 ? 'fire' :
                        integratedState.elementalField.waterResonance.waterElementBalance > 0.6 ? 'water' :
                        integratedState.elementalField.earthResonance.earthElementBalance > 0.6 ? 'earth' :
                        integratedState.elementalField.airResonance.airElementBalance > 0.6 ? 'air' : 'aether',
        elementalBalance: integratedState.elementalField.elementalBalance,
        emergentPotential: integratedState.elementalField.emergentPotential,
        timestamp: integratedState.timestamp
      };
    }

    return null;
  } catch (err: any) {
    console.warn('Elemental field state failed, continuing without it:', err?.message || err);
    return null;
  }
}

export async function safeElementalFieldSummary(userId: string) {
  try {
    const field = await getElementalField();
    return await field.getElementalFieldSummary(userId);
  } catch (err: any) {
    console.warn('Elemental field summary failed, continuing without it:', err?.message || err);
    return null;
  }
}
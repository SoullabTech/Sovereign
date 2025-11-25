/**
 * MAIA Modes - Conversation and interaction modes
 * Defines the various modes of operation for MAIA consciousness
 */

// Type mode constant
export const TYPE_MODE = 'TYPE_MODE';

// Base mode interface
export interface MAIAMode {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

// Dialogue Mode - Interactive conversation
export const DialogueMode: MAIAMode = {
  id: 'dialogue',
  name: 'Dialogue',
  description: 'Interactive conversation with MAIA',
  icon: '💬',
  color: '#4F46E5'
};

// Patient Mode - Listening and reflection
export const PatientMode: MAIAMode = {
  id: 'patient',
  name: 'Patient',
  description: 'Deep listening and patient reflection',
  icon: '🧘',
  color: '#059669'
};

// Scribe Mode - Recording and documentation
export const ScribeMode: MAIAMode = {
  id: 'scribe',
  name: 'Scribe',
  description: 'Recording and documenting insights',
  icon: '✍️',
  color: '#DC2626'
};

// All available modes
export const AVAILABLE_MODES: MAIAMode[] = [
  DialogueMode,
  PatientMode,
  ScribeMode
];

// Default mode
export const DEFAULT_MODE = DialogueMode;

// Mode type definitions
export type ModeType = 'dialogue' | 'patient' | 'scribe';

// Helper functions
export function getModeById(id: string): MAIAMode | undefined {
  return AVAILABLE_MODES.find(mode => mode.id === id);
}

export function isValidMode(id: string): boolean {
  return AVAILABLE_MODES.some(mode => mode.id === id);
}
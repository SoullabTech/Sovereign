/**
 * Memory Layer Registry
 * Central export for all memory layer implementations
 */

export { sessionMemory } from './sessionMemory';
export { journalMemory } from './journalMemory'; 
export { profileMemory } from './profileMemory';
export { symbolicMemory } from './symbolicMemory';
export { externalMemory } from './externalMemory';
export type { MemoryResult, MemoryLayer, MemoryConfig } from './types';

// Memory layer registry for dynamic loading
export const memoryLayers = {
  session: sessionMemory,
  journal: journalMemory,
  profile: profileMemory,
  symbolic: symbolicMemory,
  external: externalMemory
} as const;

// Helper function to get enabled layers
export function getEnabledLayers(config?: { enabledLayers?: string[] }) {
  const defaultEnabled = ['session', 'journal', 'profile', 'symbolic'];
  const enabled = config?.enabledLayers || defaultEnabled;
  
  return Object.fromEntries(
    enabled
      .filter(layerName => layerName in memoryLayers)
      .map(layerName => [layerName, memoryLayers[layerName as keyof typeof memoryLayers]])
  );
}
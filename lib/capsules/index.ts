/**
 * Reflection Capsules Module
 *
 * Philosophy: MAIA does not store experience as the primary object.
 * MAIA witnesses experience and remembers what mattered.
 */

// Types & Schemas
export * from './types';

// Service Layer
export * from './capsuleService';

// Distillation Engine
export {
  distillCapsuleFromText,
  distillCapsuleFromChatWindow,
  generateSourceExcerpt,
} from './distillCapsule';

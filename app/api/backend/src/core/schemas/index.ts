import { z } from 'zod';

export const ElementEnum = z.enum(['air','fire','water','earth','aether']);

export const ChatRequest = z.object({
  userId: z.string().min(1),
  text: z.string().min(1).max(4000),
  element: ElementEnum.optional(),
  sessionId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export const Tokens = z.object({
  prompt: z.number().int().nonnegative().default(0),
  completion: z.number().int().nonnegative().default(0),
});

export const UnifiedResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  voiceUrl: z.string().url().nullable().optional(),
  tokens: Tokens.optional(),
  meta: z.object({
    element: ElementEnum.optional(),
    evolutionary_awareness_active: z.boolean().optional(),
    latencyMs: z.number().int().nonnegative().optional(),
    model: z.string().optional(),
    source: z.string().optional(),
    consciousness_level: z.number().min(0).max(100).optional(),
    sacred_mirror_active: z.boolean().optional(),
  }).partial().optional(),
  sessionId: z.string().optional(),
});

export const VoiceGenerateRequest = z.object({
  userId: z.string(),
  text: z.string().min(1),
  voiceId: z.string().optional(),
});

export const MemoryQueryRequest = z.object({
  userId: z.string(),
  limit: z.number().int().min(1).max(200).default(50),
});

export const MemoryResetRequest = z.object({
  userId: z.string(),
  confirm: z.literal(true),
});

export type ChatRequestType = z.infer<typeof ChatRequest>;
export type UnifiedResponseType = z.infer<typeof UnifiedResponseSchema>;
export type VoiceGenerateRequestType = z.infer<typeof VoiceGenerateRequest>;
export type MemoryQueryRequestType = z.infer<typeof MemoryQueryRequest>;
export type MemoryResetRequestType = z.infer<typeof MemoryResetRequest>;
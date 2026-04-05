/**
 * Session Follow-up Schemas — Zod validation for generated drafts
 *
 * Locked foundation: structure validation before anything is saved or sent.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Draft blocks (parent update structure)
// ---------------------------------------------------------------------------

const NonEmptyTrimmedString = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, 'Field cannot be empty');

const OptionalWatchForSchema = z
  .union([
    z.string().transform((s) => s.trim()),
    z.null(),
  ])
  .transform((value) => {
    if (value === null) return null;
    return value.length === 0 ? null : value;
  });

export const ParentUpdateBlocksSchema = z
  .object({
    whatWeWorkedOn: NonEmptyTrimmedString,
    whatINoticed: NonEmptyTrimmedString,
    whatMayHelpThisWeek: NonEmptyTrimmedString,
    whatToWatchFor: OptionalWatchForSchema,
  })
  .strict();

export type ParentUpdateBlocks = z.infer<typeof ParentUpdateBlocksSchema>;

// ---------------------------------------------------------------------------
// Tone
// ---------------------------------------------------------------------------

export const FollowupToneSchema = z.enum(['brief', 'standard', 'detailed']);
export type FollowupTone = z.infer<typeof FollowupToneSchema>;

// ---------------------------------------------------------------------------
// Artifact type — determines prompt framing, not structure
// ---------------------------------------------------------------------------

export const ArtifactTypeSchema = z.enum(['parent_update', 'client_summary', 'integration_note']);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

// ---------------------------------------------------------------------------
// Generate request
// ---------------------------------------------------------------------------

export const GenerateFollowupRequestSchema = z.object({
  sessionId: z.string().uuid(),
  clientName: z.string().min(1),
  clientId: z.string().uuid().nullable().optional(),
  artifactType: ArtifactTypeSchema.optional().default('parent_update'),
  tone: FollowupToneSchema.optional().default('brief'),
  practitionerName: z.string().optional(),
  goals: z.string().optional(),
});

export type GenerateFollowupRequest = z.infer<typeof GenerateFollowupRequestSchema>;

// ---------------------------------------------------------------------------
// Send request
// ---------------------------------------------------------------------------

export const SendFollowupRequestSchema = z.object({
  artifactId: z.string().uuid(),
  sessionId: z.string().uuid(),
  clientId: z.string().uuid().nullable().optional(),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  practitionerName: z.string().min(1),
  clientName: z.string().min(1),
  draft: ParentUpdateBlocksSchema,
  humanEdited: z.literal(true),
  consentConfirmed: z.literal(true),
  sendVia: z.enum(['email', 'in_app', 'both']).default('email'),
});

export type SendFollowupRequest = z.infer<typeof SendFollowupRequestSchema>;

/**
 * Dream Handler Types
 */
import { z } from 'zod';

export const RecordDreamInput = z.object({
  userId: z.string().min(1),
  dreamText: z.string().min(1),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  occurredAt: z.string().optional(), // ISO string
});

export type RecordDreamInput = z.infer<typeof RecordDreamInput>;

export const AnalyzeDreamInput = z.object({
  userId: z.string().min(1),
  dreamText: z.string().min(1),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type AnalyzeDreamInput = z.infer<typeof AnalyzeDreamInput>;

// Stub for retreat schemas
import { z } from 'zod';

export const retreat = {
  z: z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    participants: z.array(z.string()),
    theme: z.string().optional()
  })
};

export const retreatParticipant = z.object({
  userId: z.string(),
  retreatId: z.string(),
  role: z.enum(['participant', 'facilitator', 'observer']),
  joinedAt: z.date()
});

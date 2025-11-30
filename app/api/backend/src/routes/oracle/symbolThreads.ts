// 📁 BACKEND: /routes/oracle/symbolThreads.ts Zod validation
import { z } from "zod";

export const SymbolThreadRequestSchema = z.object({
  symbol: z.string().min(1),
});

export const SymbolThreadResponseSchema = z.object({
  dreams: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      symbols: z.array(z.string()),
      phase: z.string(),
      archetype: z.string(),
    }),
  ),
});

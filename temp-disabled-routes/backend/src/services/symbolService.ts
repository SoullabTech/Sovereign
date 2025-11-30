// oracle-backend/src/services/symbolService.ts

import { detectFacetFromInput } from '../utils/facetUtil';
import { SymbolicTag } from "../types";
import { v4 as uuidv4 } from "uuid";

export function extractSymbolicTags(
  input: string,
  sourceAgent = "system",
): SymbolicTag[] {
  const cleaned = input.trim().toLowerCase();

  if (!cleaned) return [];

  const element = detectFacetFromInput(cleaned);

  const symbolTag: SymbolicTag = {
    symbol: cleaned.slice(0, 25), // crude default
    agent: sourceAgent,
    element,
    facet: undefined,
    phase: undefined,
    timestamp: new Date().toISOString(),
    confidence: 0.8,
  };

  return [symbolTag];
}

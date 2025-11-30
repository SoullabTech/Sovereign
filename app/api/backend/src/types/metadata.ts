// oracle-backend/src/types/metadata.ts

/**
 * Optional metadata block used in memory records and symbolic tags.
 * You can extend this as needed to capture more structured data.
 */
export interface Metadata {
  topic?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  language?: string;
  sentiment?: "positive" | "neutral" | "negative";
  symbols?: string[];
  [key: string]: any; // Allows for additional dynamic keys
}

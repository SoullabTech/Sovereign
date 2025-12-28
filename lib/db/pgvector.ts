/**
 * pgvector Serialization Helpers
 *
 * pgvector expects vector literals in square bracket format: [0.1, 0.2, 0.3]
 * NOT Postgres array format with curly braces: {0.1, 0.2, 0.3}
 *
 * Use these helpers when inserting/querying vector columns.
 */

/**
 * Convert a number array to pgvector literal format.
 *
 * @param vec - Array of numbers (embedding)
 * @returns String in format "[0.1,0.2,0.3]" suitable for pgvector
 * @throws Error if vec is empty or not an array
 *
 * @example
 * // Insert with explicit cast
 * await db.query(
 *   'INSERT INTO table (embedding) VALUES ($1::vector)',
 *   [toPgVectorLiteral(embeddingArray)]
 * );
 */
export function toPgVectorLiteral(vec: number[]): string {
  if (!Array.isArray(vec) || vec.length === 0) {
    throw new Error('toPgVectorLiteral: empty or invalid vector');
  }

  // Ensure finite numbers only (avoid NaN/Infinity poisoning inserts)
  const safe = vec.map((v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return n;
  });

  // pgvector accepts: [0.1,0.2,0.3]
  return `[${safe.join(',')}]`;
}

/**
 * Safely convert embedding to pgvector literal, or null if empty/invalid.
 *
 * @param vec - Array of numbers or null/undefined
 * @returns String in pgvector format, or null
 */
export function toPgVectorLiteralOrNull(vec: number[] | null | undefined): string | null {
  if (!vec || !Array.isArray(vec) || vec.length === 0) {
    return null;
  }
  return toPgVectorLiteral(vec);
}

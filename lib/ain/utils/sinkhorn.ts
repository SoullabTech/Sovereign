/**
 * Sinkhorn-Knopp Normalization
 *
 * Transforms a matrix of nonnegative scores into a doubly stochastic matrix
 * (rows and columns both sum to 1). This prevents any single agent/framing
 * from dominating while ensuring all roles get balanced attention.
 *
 * Use case: Weight committee responses before synthesis so that
 * - no framing monopolizes the synthesis
 * - no role gets all the attention
 *
 * Feature-flagged via AIN_SINKHORN_ROUTING=1
 */

export interface SinkhornResult {
  /** Normalized weights (doubly stochastic or close to it) */
  weights: number[][];
  /** Number of iterations performed */
  iterations: number;
  /** Whether convergence was achieved */
  converged: boolean;
  /** Diagnostics for debugging */
  diagnostics: {
    entropyBefore: number;
    entropyAfter: number;
    maxWeightBefore: number;
    maxWeightAfter: number;
    rowSumsAfter: number[];
    colSumsAfter: number[];
  };
}

/**
 * Check if Sinkhorn routing is enabled via environment
 */
export function isSinkhornEnabled(): boolean {
  return process.env.AIN_SINKHORN_ROUTING === '1';
}

/**
 * Calculate Shannon entropy of a matrix (flattened)
 * Higher entropy = more uniform distribution
 */
export function matrixEntropy(mat: number[][]): number {
  const flat = mat.flat().filter(v => v > 0);
  if (flat.length === 0) return 0;

  const sum = flat.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;

  const normalized = flat.map(v => v / sum);
  return -normalized.reduce((h, p) => {
    if (p > 0) return h + p * Math.log2(p);
    return h;
  }, 0);
}

/**
 * Get maximum value in matrix
 */
export function matrixMax(mat: number[][]): number {
  return Math.max(...mat.flat());
}

/**
 * Normalize rows to sum to 1
 */
export function normalizeRows(mat: number[][], eps: number): number[][] {
  return mat.map(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    if (sum < eps) {
      // Uniform fallback for zero/near-zero rows
      return row.map(() => 1 / row.length);
    }
    return row.map(v => v / sum);
  });
}

/**
 * Normalize columns to sum to 1
 */
export function normalizeCols(mat: number[][], eps: number): number[][] {
  const rows = mat.length;
  const cols = mat[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return mat;

  // Calculate column sums
  const colSums = new Array(cols).fill(0);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      colSums[j] += mat[i][j];
    }
  }

  // Normalize each column
  return mat.map(row =>
    row.map((v, j) => {
      if (colSums[j] < eps) {
        // Uniform fallback for zero/near-zero columns
        return 1 / rows;
      }
      return v / colSums[j];
    })
  );
}

/**
 * Check for NaN or Infinity in matrix
 */
function hasInvalidValues(mat: number[][]): boolean {
  return mat.some(row => row.some(v => !Number.isFinite(v)));
}

/**
 * Create uniform matrix as fallback
 */
function uniformMatrix(rows: number, cols: number): number[][] {
  const val = 1 / (rows * cols);
  return Array(rows).fill(null).map(() => Array(cols).fill(val));
}

/**
 * Deep copy a matrix
 */
function copyMatrix(mat: number[][]): number[][] {
  return mat.map(row => [...row]);
}

/**
 * Sinkhorn-Knopp normalization
 *
 * Alternately normalizes rows and columns until the matrix is
 * approximately doubly stochastic (both rows and columns sum to 1).
 *
 * @param mat - N×M matrix of nonnegative scores
 * @param iters - Maximum iterations (default: 8, usually converges fast)
 * @param eps - Small value to prevent division by zero (default: 1e-8)
 * @returns Normalized matrix with diagnostics
 */
export function sinkhornNormalize(
  mat: number[][],
  iters: number = 8,
  eps: number = 1e-8
): SinkhornResult {
  const rows = mat.length;
  const cols = mat[0]?.length ?? 0;

  // Handle empty matrix
  if (rows === 0 || cols === 0) {
    return {
      weights: [],
      iterations: 0,
      converged: true,
      diagnostics: {
        entropyBefore: 0,
        entropyAfter: 0,
        maxWeightBefore: 0,
        maxWeightAfter: 0,
        rowSumsAfter: [],
        colSumsAfter: [],
      },
    };
  }

  // Capture "before" diagnostics
  const entropyBefore = matrixEntropy(mat);
  const maxWeightBefore = matrixMax(mat);

  // Add epsilon floor to all values (prevents zeros from staying zeros)
  let current = mat.map(row => row.map(v => Math.max(v, eps)));

  // Check for invalid input
  if (hasInvalidValues(current)) {
    console.warn('[Sinkhorn] Invalid input values, returning uniform weights');
    const uniform = uniformMatrix(rows, cols);
    return {
      weights: uniform,
      iterations: 0,
      converged: false,
      diagnostics: {
        entropyBefore,
        entropyAfter: matrixEntropy(uniform),
        maxWeightBefore,
        maxWeightAfter: matrixMax(uniform),
        rowSumsAfter: Array(rows).fill(1),
        colSumsAfter: Array(cols).fill(1),
      },
    };
  }

  // Sinkhorn iterations: alternate row and column normalization
  let converged = false;
  let iteration = 0;

  for (iteration = 0; iteration < iters; iteration++) {
    const before = copyMatrix(current);

    // Normalize rows
    current = normalizeRows(current, eps);

    // Check for NaN after row normalization
    if (hasInvalidValues(current)) {
      console.warn(`[Sinkhorn] NaN after row norm at iteration ${iteration}, reverting`);
      current = before;
      break;
    }

    // Normalize columns
    current = normalizeCols(current, eps);

    // Check for NaN after column normalization
    if (hasInvalidValues(current)) {
      console.warn(`[Sinkhorn] NaN after col norm at iteration ${iteration}, reverting`);
      current = normalizeRows(before, eps);
      break;
    }

    // Check convergence: are row and column sums close to 1?
    const rowSums = current.map(row => row.reduce((a, b) => a + b, 0));
    const colSums = Array(cols).fill(0);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        colSums[j] += current[i][j];
      }
    }

    const rowError = Math.max(...rowSums.map(s => Math.abs(s - 1)));
    const colError = Math.max(...colSums.map(s => Math.abs(s - 1)));

    if (rowError < 1e-6 && colError < 1e-6) {
      converged = true;
      break;
    }
  }

  // Calculate final diagnostics
  const entropyAfter = matrixEntropy(current);
  const maxWeightAfter = matrixMax(current);

  const rowSumsAfter = current.map(row => row.reduce((a, b) => a + b, 0));
  const colSumsAfter = Array(cols).fill(0);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      colSumsAfter[j] += current[i][j];
    }
  }

  return {
    weights: current,
    iterations: iteration + 1,
    converged,
    diagnostics: {
      entropyBefore,
      entropyAfter,
      maxWeightBefore,
      maxWeightAfter,
      rowSumsAfter,
      colSumsAfter,
    },
  };
}

/**
 * Single-column Sinkhorn (simplified vector normalization)
 *
 * For cases where you don't have roles yet—just normalizes
 * a vector of scores so nothing dominates.
 *
 * @param scores - Array of nonnegative scores
 * @param eps - Small value to prevent division by zero
 * @returns Normalized weights that sum to 1
 */
export function normalizeScores(
  scores: number[],
  eps: number = 1e-8
): { weights: number[]; maxBefore: number; maxAfter: number } {
  if (scores.length === 0) {
    return { weights: [], maxBefore: 0, maxAfter: 0 };
  }

  const maxBefore = Math.max(...scores);

  // Add epsilon floor
  const floored = scores.map(s => Math.max(s, eps));
  const sum = floored.reduce((a, b) => a + b, 0);

  if (sum < eps) {
    // Uniform fallback
    const uniform = 1 / scores.length;
    return {
      weights: scores.map(() => uniform),
      maxBefore,
      maxAfter: uniform,
    };
  }

  const weights = floored.map(s => s / sum);
  const maxAfter = Math.max(...weights);

  return { weights, maxBefore, maxAfter };
}

/**
 * Aggregate weights from a framings × roles matrix
 *
 * After Sinkhorn normalization, you often want a single weight per framing.
 * This sums across roles to get total "attention" each framing should receive.
 *
 * @param mat - Sinkhorn-normalized N×M matrix
 * @returns Per-framing weights (sum of each row)
 */
export function aggregateFramingWeights(mat: number[][]): number[] {
  return mat.map(row => row.reduce((a, b) => a + b, 0));
}

/**
 * Build base score matrix from framing responses
 *
 * Creates an initial N×M matrix based on available signals.
 * This is the input to Sinkhorn normalization.
 *
 * @param responses - Framing responses with optional confidence
 * @param roles - Role definitions (column headers)
 * @returns Base score matrix ready for Sinkhorn
 */
export function buildBaseScoreMatrix(
  responses: Array<{ framingId: string; response: string; confidence?: number }>,
  roles: string[] = ['direct', 'critical', 'integrative']
): number[][] {
  // For now, use simple heuristics since we don't have per-role scores yet
  // This can be refined as we learn what works

  return responses.map(r => {
    // Base confidence (0.5 if not provided)
    const confidence = r.confidence ?? 0.5;

    // Response quality heuristics
    const hasSubstance = r.response.length > 100;
    const notError = !r.response.includes('[Error');
    const qualityBonus = hasSubstance && notError ? 0.2 : 0;

    // Base score per role (can be refined)
    const base = confidence + qualityBonus;

    // Slight variation by role to create meaningful matrix structure
    // These can be tuned based on what we learn
    return roles.map((role, i) => {
      // Small noise to break symmetry
      const roleVariation = 1 + (i * 0.05);
      return Math.max(0.1, base * roleVariation);
    });
  });
}

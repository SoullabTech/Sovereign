/**
 * Lisp Oracle Client
 *
 * Connects to live Lisp SBCL server for Spiralogic oracle wisdom.
 * Alternative to database lookups - testing if "live" feels different.
 */

export interface LispOracleResponse {
  status: string;
  facet?: string;
  element?: string;
  intensity?: number;
  title?: string;
  oracleText?: string;
  keywords?: string[];
  reflectionQuestions?: string[];
  message?: string;
  availableFacets?: string[];
  availableElements?: string[];
}

export interface LispOracleRequest {
  facet: string;
  element: string;
}

const LISP_ORACLE_URL = process.env.LISP_ORACLE_URL || 'http://localhost:4444';

/**
 * Query the live Lisp oracle server
 */
export async function queryLispOracle(
  facet: string,
  element: string
): Promise<LispOracleResponse> {
  try {
    const response = await fetch(`${LISP_ORACLE_URL}/oracle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ facet, element }),
    });

    if (!response.ok) {
      throw new Error(`Lisp oracle HTTP error: ${response.status}`);
    }

    // Lisp oracle returns flat array format: ["key1", "value1", "key2", "value2", ...]
    const flatArray = await response.json();

    // Convert to object
    const result: any = {};
    for (let i = 0; i < flatArray.length; i += 2) {
      result[flatArray[i]] = flatArray[i + 1];
    }

    return result as LispOracleResponse;
  } catch (error: any) {
    console.error('[Lisp Oracle Client] Query failed:', error.message);
    throw error;
  }
}

/**
 * Health check for Lisp oracle server
 */
export async function checkLispOracleHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${LISP_ORACLE_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) return false;

    const flatArray = await response.json();
    const result: any = {};
    for (let i = 0; i < flatArray.length; i += 2) {
      result[flatArray[i]] = flatArray[i + 1];
    }

    return result.status === 'healthy';
  } catch (error) {
    return false;
  }
}

/**
 * Get available facets and elements from Lisp oracle
 */
export async function getLispOracleMappings(): Promise<{
  facets: string[];
  elements: string[];
}> {
  try {
    // Query with invalid combo to get available mappings
    const response = await queryLispOracle('invalid_facet', 'invalid_element');

    if (response.status === 'not_found') {
      return {
        facets: response.availableFacets || [],
        elements: response.availableElements || [],
      };
    }

    return { facets: [], elements: [] };
  } catch (error) {
    return { facets: [], elements: [] };
  }
}

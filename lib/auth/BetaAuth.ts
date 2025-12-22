/**
 * Beta Authentication System
 * Simple code-based auth for beta testers
 * Maps beta codes to explorer IDs
 *
 * PostgreSQL implementation (sovereign, no Supabase)
 */

import { query } from '@/lib/db/postgres';

export interface BetaTester {
  explorerId: string;
  name: string;
  email: string;
  betaCode: string;
  registered: boolean;
  joinedAt: Date;
}

export class BetaAuth {
  /**
   * Verify beta code and return explorer ID
   */
  async verifyBetaCode(betaCode: string): Promise<{ valid: boolean; explorerId?: string; name?: string }> {
    try {
      // Query beta_explorers table
      const result = await query(
        'SELECT explorer_id, name, registered FROM beta_explorers WHERE beta_code = $1',
        [betaCode.trim()]
      );

      if (result.rows.length === 0) {
        console.warn('❌ Invalid beta code:', betaCode);
        return { valid: false };
      }

      const data = result.rows[0];
      console.log('✅ Valid beta code verified:', { explorerId: data.explorer_id, name: data.name });

      return {
        valid: true,
        explorerId: data.explorer_id,
        name: data.name
      };
    } catch (error) {
      console.error('Beta code verification error:', error);
      return { valid: false };
    }
  }

  /**
   * Register beta tester (mark as registered in DB)
   */
  async registerBetaTester(betaCode: string): Promise<boolean> {
    try {
      await query(
        'UPDATE beta_explorers SET registered = true, joined_at = NOW() WHERE beta_code = $1',
        [betaCode]
      );

      console.log('✅ Beta tester registered:', betaCode);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  /**
   * Get explorer info by ID
   */
  async getExplorerInfo(explorerId: string): Promise<BetaTester | null> {
    try {
      const result = await query(
        'SELECT * FROM beta_explorers WHERE explorer_id = $1',
        [explorerId]
      );

      if (result.rows.length === 0) return null;

      const data = result.rows[0];
      return {
        explorerId: data.explorer_id,
        name: data.name,
        email: data.email,
        betaCode: data.beta_code,
        registered: data.registered,
        joinedAt: new Date(data.joined_at)
      };
    } catch (error) {
      console.error('Get explorer info error:', error);
      return null;
    }
  }

  /**
   * Extract userId from request (from session, header, or query)
   */
  static getUserIdFromRequest(req: Request): string | null {
    try {
      // Try to get from Authorization header (if using tokens)
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        // Extract explorer ID from token
        const match = authHeader.match(/Explorer\s+(.+)/);
        if (match) return match[1];
      }

      // Try to get from custom header
      const explorerIdHeader = req.headers.get('x-explorer-id');
      if (explorerIdHeader) return explorerIdHeader;

      // Try to get from query params (for GET requests)
      const url = new URL(req.url);
      const explorerIdQuery = url.searchParams.get('explorerId');
      if (explorerIdQuery) return explorerIdQuery;

      return null;
    } catch (error) {
      console.error('Extract userId error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const betaAuth = new BetaAuth();

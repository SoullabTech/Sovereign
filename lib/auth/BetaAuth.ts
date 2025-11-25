/**
 * Beta Authentication System
 * Simple code-based auth for beta testers
 * Maps beta codes to explorer IDs
 */

import { createClient } from '@supabase/supabase-js';

export interface BetaTester {
  explorerId: string;
  name: string;
  email: string;
  betaCode: string;
  registered: boolean;
  joinedAt: Date;
}

export class BetaAuth {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey
    );
  }

  /**
   * Verify beta code and return explorer ID
   */
  async verifyBetaCode(betaCode: string): Promise<{ valid: boolean; explorerId?: string; name?: string }> {
    try {
      // Query beta_explorers table
      const { data, error } = await this.supabase
        .from('beta_explorers')
        .select('explorer_id, name, registered')
        .eq('beta_code', betaCode.trim())
        .single();

      if (error || !data) {
        console.warn('❌ Invalid beta code:', betaCode);
        return { valid: false };
      }

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
      const { error } = await this.supabase
        .from('beta_explorers')
        .update({ registered: true, joined_at: new Date().toISOString() })
        .eq('beta_code', betaCode);

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

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
      const { data, error } = await this.supabase
        .from('beta_explorers')
        .select('*')
        .eq('explorer_id', explorerId)
        .single();

      if (error || !data) return null;

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

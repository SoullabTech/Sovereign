import { IMemory, Session, Turn } from "../../core/interfaces/IMemory";
import { supabase } from "../../lib/supabase";
import { logger } from "../../utils/logger";

export class SupabaseMemory implements IMemory {
  
  async getSession(userId: string): Promise<Session | null> {
    try {
      // Get conversation turns from Supabase
      const { data: turns, error } = await supabase
        .from('conversation_turns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Failed to get session from Supabase', { userId, error: error.message });
        return null;
      }

      if (!turns || turns.length === 0) {
        // Return empty session for new users
        return {
          userId,
          turns: []
        };
      }

      // Convert Supabase data to Turn format
      const sessionTurns: Turn[] = turns.map(turn => ({
        role: turn.role as 'user' | 'assistant',
        text: turn.content,
        ts: new Date(turn.created_at).getTime()
      }));

      return {
        userId,
        turns: sessionTurns
      };

    } catch (error) {
      logger.error('SupabaseMemory getSession error', { userId, error });
      return null;
    }
  }

  async append(userId: string, turn: Turn): Promise<void> {
    try {
      // Insert turn into Supabase
      const { error } = await supabase
        .from('conversation_turns')
        .insert({
          user_id: userId,
          role: turn.role,
          content: turn.text,
          created_at: new Date(turn.ts).toISOString(),
          metadata: {
            timestamp: turn.ts,
            source: 'consciousness-api'
          }
        });

      if (error) {
        logger.error('Failed to append turn to Supabase', { 
          userId, 
          role: turn.role, 
          error: error.message 
        });
        throw new Error(`Failed to store conversation turn: ${error.message}`);
      }

      logger.debug('Turn stored in Supabase', { 
        userId, 
        role: turn.role, 
        textLength: turn.text.length 
      });

      // Clean up old turns if needed (keep last 1000 per user)
      await this.cleanupOldTurns(userId);

    } catch (error) {
      logger.error('SupabaseMemory append error', { userId, turn, error });
      throw error;
    }
  }

  /**
   * Clean up old conversation turns to prevent unlimited growth
   */
  private async cleanupOldTurns(userId: string): Promise<void> {
    try {
      // Count total turns for user
      const { count, error: countError } = await supabase
        .from('conversation_turns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError || !count) {
        return; // Skip cleanup if count fails
      }

      const maxTurns = 1000;
      if (count <= maxTurns) {
        return; // No cleanup needed
      }

      // Get oldest turn IDs to delete
      const turnsToDelete = count - maxTurns;
      const { data: oldTurns, error: selectError } = await supabase
        .from('conversation_turns')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(turnsToDelete);

      if (selectError || !oldTurns || oldTurns.length === 0) {
        return;
      }

      // Delete old turns
      const oldTurnIds = oldTurns.map(turn => turn.id);
      const { error: deleteError } = await supabase
        .from('conversation_turns')
        .delete()
        .in('id', oldTurnIds);

      if (deleteError) {
        logger.warn('Failed to cleanup old turns', { userId, error: deleteError.message });
      } else {
        logger.debug('Cleaned up old conversation turns', { 
          userId, 
          deletedCount: turnsToDelete 
        });
      }

    } catch (error) {
      logger.warn('Turn cleanup failed', { userId, error });
      // Don't throw - cleanup failure shouldn't break the main flow
    }
  }

  /**
   * Get conversation statistics for analytics
   */
  async getConversationStats(userId: string): Promise<{
    totalTurns: number;
    userTurns: number;
    assistantTurns: number;
    firstInteraction?: Date;
    lastInteraction?: Date;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('conversation_turns')
        .select('role, created_at')
        .eq('user_id', userId);

      if (error || !stats) {
        return {
          totalTurns: 0,
          userTurns: 0,
          assistantTurns: 0
        };
      }

      const userTurns = stats.filter(t => t.role === 'user').length;
      const assistantTurns = stats.filter(t => t.role === 'assistant').length;
      
      const dates = stats.map(t => new Date(t.created_at)).sort((a, b) => a.getTime() - b.getTime());
      const firstInteraction = dates.length > 0 ? dates[0] : undefined;
      const lastInteraction = dates.length > 0 ? dates[dates.length - 1] : undefined;

      return {
        totalTurns: stats.length,
        userTurns,
        assistantTurns,
        firstInteraction,
        lastInteraction
      };

    } catch (error) {
      logger.error('Failed to get conversation stats', { userId, error });
      return {
        totalTurns: 0,
        userTurns: 0,
        assistantTurns: 0
      };
    }
  }
}
/**
 * Field State Calculator
 * Calculates collective field atmosphere for channels
 * Run this periodically (e.g., every 5 minutes via cron or serverless function)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export class FieldStateCalculator {
  private supabase = createClient(supabaseUrl, supabaseServiceKey);

  /**
   * Calculate and update field state for all channels
   */
  async calculateAllChannels() {
    try {
      const { data: channels, error } = await this.supabase
        .from('community_channels')
        .select('id, slug')
        .eq('is_active', true);

      if (error) throw error;

      for (const channel of channels || []) {
        await this.calculateChannelFieldState(channel.id);
      }

      console.log(`Field state calculated for ${channels?.length || 0} channels`);
    } catch (error) {
      console.error('Failed to calculate field states:', error);
      throw error;
    }
  }

  /**
   * Calculate field state for a specific channel
   */
  async calculateChannelFieldState(channelId: string) {
    try {
      // 1. Get recent threads (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: threads } = await this.supabase
        .from('community_threads')
        .select('*, session_elements')
        .eq('channel_id', channelId)
        .eq('is_hidden', false)
        .gte('created_at', oneDayAgo);

      // 2. Get recent replies (last 24 hours)
      const { data: replies } = await this.supabase
        .from('community_replies')
        .select('thread_id, content, created_at')
        .eq('is_hidden', false)
        .gte('created_at', oneDayAgo);

      // 3. Get active users (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: presence } = await this.supabase
        .from('community_presence')
        .select('user_id')
        .eq('current_channel_id', channelId)
        .gte('last_seen_at', oneHourAgo);

      // 4. Calculate metrics
      const threadCount = threads?.length || 0;
      const replyCount = replies?.length || 0;
      const messageCount = threadCount + replyCount;
      const messagesPerHour = messageCount / 24; // Average over last 24h

      const activeUsersCount = new Set(presence?.map((p) => p.user_id) || []).size;

      // 5. Calculate elemental balance
      // Start with neutral balance
      let earth = 0.25;
      let water = 0.25;
      let air = 0.25;
      let fire = 0.25;

      // Accumulate from session shares
      const sessionThreads = (threads || []).filter(
        (t) => t.thread_type === 'session_share' && t.session_elements
      );

      if (sessionThreads.length > 0) {
        const elementSums = sessionThreads.reduce(
          (acc, thread) => {
            if (thread.session_elements) {
              acc.earth += thread.session_elements.earth || 0;
              acc.water += thread.session_elements.water || 0;
              acc.air += thread.session_elements.air || 0;
              acc.fire += thread.session_elements.fire || 0;
            }
            return acc;
          },
          { earth: 0, water: 0, air: 0, fire: 0 }
        );

        // Average and normalize
        const count = sessionThreads.length;
        earth = elementSums.earth / count;
        water = elementSums.water / count;
        air = elementSums.air / count;
        fire = elementSums.fire / count;

        // Ensure they sum to 1
        const total = earth + water + air + fire;
        if (total > 0) {
          earth /= total;
          water /= total;
          air /= total;
          fire /= total;
        }
      }

      // 6. Calculate atmosphere metrics

      // Intensity: Based on message volume and frequency
      let intensity = Math.min(1, messagesPerHour / 10); // 0-1 scale, 10+ msgs/hr = max intensity

      // Depth: Based on message length and session shares
      const avgMessageLength =
        messageCount > 0
          ? ((threads || []).reduce((sum, t) => sum + t.content.length, 0) +
              (replies || []).reduce((sum, r) => sum + r.content.length, 0)) /
            messageCount
          : 0;
      const depth = Math.min(1, avgMessageLength / 500); // 500+ chars = deep

      // Coherence: Based on reply ratio (high replies = engaged, coherent discussion)
      const coherence =
        threadCount > 0 ? Math.min(1, replyCount / (threadCount * 3)) : 0.5; // 3+ replies per thread = high coherence

      // 7. Upsert field state
      const { error } = await this.supabase.from('community_field_state').upsert(
        {
          channel_id: channelId,
          earth_energy: earth,
          water_energy: water,
          air_energy: air,
          fire_energy: fire,
          active_users_count: activeUsersCount,
          messages_per_hour: messagesPerHour,
          avg_message_length: avgMessageLength,
          intensity_level: intensity,
          depth_level: depth,
          coherence_level: coherence,
          calculated_at: new Date().toISOString(),
        },
        {
          onConflict: 'channel_id',
        }
      );

      if (error) {
        console.error(`Failed to update field state for channel ${channelId}:`, error);
        throw error;
      }

      console.log(
        `Field state updated for channel ${channelId}: intensity=${intensity.toFixed(
          2
        )}, depth=${depth.toFixed(2)}, coherence=${coherence.toFixed(2)}`
      );
    } catch (error) {
      console.error(`Failed to calculate field state for channel ${channelId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const fieldStateCalculator = new FieldStateCalculator();

// CLI runner for testing
if (require.main === module) {
  fieldStateCalculator
    .calculateAllChannels()
    .then(() => {
      console.log('Field state calculation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Field state calculation failed:', error);
      process.exit(1);
    });
}

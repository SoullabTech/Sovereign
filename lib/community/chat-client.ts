/**
 * Community Chat Client
 * Supabase interface for threaded discussions with field awareness
 */

import { createClient } from '@supabase/supabase-js';

export interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  field_archetype: 'earth' | 'water' | 'air' | 'fire';
  sort_order: number;
}

export interface Thread {
  id: string;
  channel_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  thread_type: 'discussion' | 'question' | 'session_share' | 'field_note';

  // Session share metadata
  shared_session_id?: string;
  session_exchange_count?: number;
  session_elements?: {
    earth: number;
    water: number;
    air: number;
    fire: number;
  };
  session_silence_rate?: number;

  // Engagement
  reply_count: number;
  reaction_count: number;
  view_count: number;
  last_activity_at: string;

  // Field state
  collective_field_state?: any;

  // Moderation
  is_pinned: boolean;
  is_locked: boolean;

  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  thread_id: string;
  parent_reply_id?: string;
  author_id: string;
  author_name: string;
  content: string;
  reaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  thread_id?: string;
  reply_id?: string;
  reaction_type: 'earth' | 'water' | 'air' | 'fire' | 'resonance' | 'witnessed' | 'integration';
  created_at: string;
}

export interface FieldState {
  channel_id: string;
  earth_energy: number;
  water_energy: number;
  air_energy: number;
  fire_energy: number;
  active_users_count: number;
  messages_per_hour: number;
  intensity_level: number; // 0-1
  depth_level: number; // 0-1
  coherence_level: number; // 0-1
  calculated_at: string;
}

export interface Presence {
  user_id: string;
  user_name: string;
  status: 'online' | 'in_session' | 'reflecting' | 'away';
  current_channel_id?: string;
  last_seen_at: string;
}

export class CommunityChat {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ==================== CHANNELS ====================

  async getChannels(): Promise<Channel[]> {
    const { data, error } = await this.supabase
      .from('community_channels')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getChannel(slug: string): Promise<Channel | null> {
    const { data, error } = await this.supabase
      .from('community_channels')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  // ==================== THREADS ====================

  async getThreads(channelId: string, limit = 50): Promise<Thread[]> {
    const { data, error } = await this.supabase
      .from('community_threads')
      .select('*')
      .eq('channel_id', channelId)
      .eq('is_hidden', false)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getThread(threadId: string): Promise<Thread | null> {
    const { data, error } = await this.supabase
      .from('community_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error) return null;

    // Increment view count
    await this.supabase
      .from('community_threads')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', threadId);

    return data;
  }

  async createThread(params: {
    channel_id: string;
    title: string;
    content: string;
    thread_type?: Thread['thread_type'];
    session_data?: {
      session_id: string;
      exchange_count: number;
      elements: { earth: number; water: number; air: number; fire: number };
      silence_rate: number;
    };
  }): Promise<Thread> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('community_threads')
      .insert({
        channel_id: params.channel_id,
        author_id: user.id,
        author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
        title: params.title,
        content: params.content,
        thread_type: params.thread_type || 'discussion',
        shared_session_id: params.session_data?.session_id,
        session_exchange_count: params.session_data?.exchange_count,
        session_elements: params.session_data?.elements,
        session_silence_rate: params.session_data?.silence_rate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== REPLIES ====================

  async getReplies(threadId: string): Promise<Reply[]> {
    const { data, error } = await this.supabase
      .from('community_replies')
      .select('*')
      .eq('thread_id', threadId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createReply(params: {
    thread_id: string;
    content: string;
    parent_reply_id?: string;
  }): Promise<Reply> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('community_replies')
      .insert({
        thread_id: params.thread_id,
        parent_reply_id: params.parent_reply_id,
        author_id: user.id,
        author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
        content: params.content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== REACTIONS ====================

  async getReactions(targetId: string, targetType: 'thread' | 'reply'): Promise<Reaction[]> {
    const filter = targetType === 'thread'
      ? { thread_id: targetId }
      : { reply_id: targetId };

    const { data, error } = await this.supabase
      .from('community_reactions')
      .select('*')
      .match(filter);

    if (error) throw error;
    return data || [];
  }

  async addReaction(params: {
    target_id: string;
    target_type: 'thread' | 'reply';
    reaction_type: Reaction['reaction_type'];
  }): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const insert = {
      user_id: user.id,
      reaction_type: params.reaction_type,
      ...(params.target_type === 'thread'
        ? { thread_id: params.target_id, reply_id: null }
        : { reply_id: params.target_id, thread_id: null }
      ),
    };

    const { error } = await this.supabase
      .from('community_reactions')
      .insert(insert);

    // Ignore duplicate key errors (user already reacted)
    if (error && !error.message.includes('unique_user_reaction')) {
      throw error;
    }
  }

  async removeReaction(params: {
    target_id: string;
    target_type: 'thread' | 'reply';
    reaction_type: Reaction['reaction_type'];
  }): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const filter = {
      user_id: user.id,
      reaction_type: params.reaction_type,
      ...(params.target_type === 'thread'
        ? { thread_id: params.target_id }
        : { reply_id: params.target_id }
      ),
    };

    const { error } = await this.supabase
      .from('community_reactions')
      .delete()
      .match(filter);

    if (error) throw error;
  }

  // ==================== FIELD STATE ====================

  async getFieldState(channelId: string): Promise<FieldState | null> {
    const { data, error } = await this.supabase
      .from('community_field_state')
      .select('*')
      .eq('channel_id', channelId)
      .single();

    if (error) return null;
    return data;
  }

  // ==================== PRESENCE ====================

  async getPresence(channelId?: string): Promise<Presence[]> {
    let query = this.supabase
      .from('community_presence')
      .select('*')
      .gte('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 min

    if (channelId) {
      query = query.eq('current_channel_id', channelId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updatePresence(params: {
    status: Presence['status'];
    channel_id?: string;
  }): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase
      .from('community_presence')
      .upsert({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
        status: params.status,
        current_channel_id: params.channel_id,
        last_seen_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
}

export const communityChat = new CommunityChat();

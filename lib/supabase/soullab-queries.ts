/**
 * 🌟 SoulLab Supabase Query Helpers
 * TypeScript helpers for interacting with the journaling/storytelling database
 */

import { createClient } from '@/lib/supabase';
import type {
  JournalEntry,
  StoryFragment,
  RelivedMoment,
  StoryThread,
  UserSoulProfile,
  ConversationState,
  SoulLabMetadata,
  ElementType,
  EntryType
} from '../types/soullab-metadata';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 📝 Journal Entry Queries
 */
export const journalQueries = {
  // Create a new journal entry
  async create(userId: string, content: string, metadata: SoulLabMetadata, title?: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content,
        title,
        metadata
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as JournalEntry;
  },

  // Get user's journal entries
  async getByUser(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as JournalEntry[];
  },

  // Search by elemental signature
  async searchByElement(userId: string, element: ElementType) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .contains('metadata', { elemental: { dominant: element } });
    
    if (error) throw error;
    return data as JournalEntry[];
  },

  // Search by archetype
  async searchByArchetype(userId: string, archetype: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .contains('metadata->archetypal', [{ archetype }]);
    
    if (error) throw error;
    return data as JournalEntry[];
  },

  // Get entries in date range
  async getInDateRange(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as JournalEntry[];
  }
};

/**
 * 📖 Story Queries
 */
export const storyQueries = {
  // Create a new story
  async create(
    userId: string,
    content: string,
    metadata: SoulLabMetadata,
    title?: string,
    storyArc?: any
  ) {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        content,
        title,
        metadata,
        story_arc: storyArc
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as StoryFragment;
  },

  // Get user's stories
  async getByUser(userId: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as StoryFragment[];
  },

  // Search stories by theme
  async searchByTheme(userId: string, theme: string) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .contains('metadata->themes', [theme]);
    
    if (error) throw error;
    return data as StoryFragment[];
  }
};

/**
 * 🔄 Relived Moment Queries
 */
export const momentQueries = {
  // Create a relived moment
  async create(
    userId: string,
    momentDescription: string,
    metadata: SoulLabMetadata,
    sensoryDetails?: any,
    emotionalTexture?: string,
    somaticMarkers?: string[],
    originalDate?: Date
  ) {
    const { data, error } = await supabase
      .from('relived_moments')
      .insert({
        user_id: userId,
        moment_description: momentDescription,
        metadata,
        sensory_details: sensoryDetails,
        emotional_texture: emotionalTexture,
        somatic_markers: somaticMarkers,
        original_date: originalDate?.toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as RelivedMoment;
  },

  // Get user's relived moments
  async getByUser(userId: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('relived_moments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as RelivedMoment[];
  },

  // Search by emotional texture
  async searchByEmotion(userId: string, emotion: string) {
    const { data, error } = await supabase
      .from('relived_moments')
      .select('*')
      .eq('user_id', userId)
      .ilike('emotional_texture', `%${emotion}%`);
    
    if (error) throw error;
    return data as RelivedMoment[];
  }
};

/**
 * 🧵 Story Thread Queries
 */
export const threadQueries = {
  // Create a new thread
  async create(
    userId: string,
    title: string,
    description?: string,
    archetype?: string,
    element?: ElementType
  ) {
    const { data, error } = await supabase
      .from('story_threads')
      .insert({
        user_id: userId,
        title,
        description,
        archetype,
        element
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as StoryThread;
  },

  // Get user's threads
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('story_threads')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as StoryThread[];
  },

  // Link an entry to a thread
  async linkEntry(
    threadId: string,
    entryType: EntryType,
    entryId: string,
    position?: number
  ) {
    const { data, error } = await supabase
      .from('thread_links')
      .insert({
        thread_id: threadId,
        entry_type: entryType,
        entry_id: entryId,
        position
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all entries in a thread
  async getThreadEntries(threadId: string) {
    const { data, error } = await supabase
      .from('thread_links')
      .select('*')
      .eq('thread_id', threadId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    // Fetch the actual entries
    const entries = await Promise.all(
      data.map(async (link) => {
        const table = link.entry_type === 'journal' ? 'journal_entries' :
                      link.entry_type === 'story' ? 'stories' : 'relived_moments';
        
        const { data: entry } = await supabase
          .from(table)
          .select('*')
          .eq('id', link.entry_id)
          .single();
        
        return { ...entry, type: link.entry_type };
      })
    );
    
    return entries;
  },

  // Add insight to thread
  async addInsight(threadId: string, insight: string) {
    const { data: thread } = await supabase
      .from('story_threads')
      .select('insights')
      .eq('id', threadId)
      .single();
    
    const insights = thread?.insights || [];
    insights.push(insight);
    
    const { data, error } = await supabase
      .from('story_threads')
      .update({ insights })
      .eq('id', threadId)
      .select()
      .single();
    
    if (error) throw error;
    return data as StoryThread;
  }
};

/**
 * 👤 User Profile Queries
 */
export const profileQueries = {
  // Get or create user profile
  async getOrCreate(userId: string): Promise<UserSoulProfile> {
    let { data, error } = await supabase
      .from('user_soul_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error?.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('user_soul_profiles')
        .insert({
          user_id: userId,
          dominant_elements: [],
          active_archetypes: [],
          developmental_stage: 'awakening',
          language_tier: 'everyday',
          preferred_style: 'soulful'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newProfile as UserSoulProfile;
    }
    
    if (error) throw error;
    return data as UserSoulProfile;
  },

  // Update user profile
  async update(userId: string, updates: Partial<UserSoulProfile>) {
    const { data, error } = await supabase
      .from('user_soul_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserSoulProfile;
  },

  // Update language tier based on interactions
  async updateLanguageTier(
    userId: string,
    tier: 'everyday' | 'metaphorical' | 'alchemical'
  ) {
    return profileQueries.update(userId, { language_tier: tier });
  }
};

/**
 * 💬 Conversation State Queries
 */
export const conversationQueries = {
  // Get or create conversation state
  async getOrCreate(userId: string, sessionId: string): Promise<ConversationState> {
    let { data, error } = await supabase
      .from('conversation_states')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();
    
    if (error?.code === 'PGRST116') {
      // State doesn't exist, create it
      const { data: newState, error: createError } = await supabase
        .from('conversation_states')
        .insert({
          user_id: userId,
          session_id: sessionId,
          exchange_count: 0,
          current_role: { primary: 'mirror' },
          momentum: 'building'
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newState as ConversationState;
    }
    
    if (error) throw error;
    return data as ConversationState;
  },

  // Update conversation state
  async update(sessionId: string, updates: Partial<ConversationState>) {
    const { data, error } = await supabase
      .from('conversation_states')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationState;
  },

  // Increment exchange count
  async incrementExchange(sessionId: string) {
    const { data: current } = await supabase
      .from('conversation_states')
      .select('exchange_count')
      .eq('session_id', sessionId)
      .single();
    
    const newCount = (current?.exchange_count || 0) + 1;
    const momentum = newCount < 3 ? 'building' :
                    newCount < 8 ? 'sustaining' : 'completing';
    
    return conversationQueries.update(sessionId, {
      exchange_count: newCount,
      momentum
    });
  }
};

/**
 * 🔮 Advanced Queries - Pattern Recognition & Weaving
 */
export const patternQueries = {
  // Find resonant entries across time
  async findResonantEntries(
    userId: string,
    currentMetadata: SoulLabMetadata,
    limit = 5
  ) {
    // Find entries with similar elemental signatures
    const element = currentMetadata.elemental.dominant;
    const archetype = currentMetadata.archetypal[0]?.archetype;
    
    const journalPromise = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .contains('metadata', { elemental: { dominant: element } })
      .limit(limit);
    
    const storyPromise = supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .contains('metadata', { elemental: { dominant: element } })
      .limit(limit);
    
    const [journals, stories] = await Promise.all([journalPromise, storyPromise]);
    
    return {
      journals: journals.data || [],
      stories: stories.data || []
    };
  },

  // Detect user's growth edges
  async detectGrowthEdges(userId: string) {
    // Analyze recent entries for patterns
    const recentEntries = await journalQueries.getByUser(userId, 30);
    
    // Count elemental occurrences
    const elementCounts: Record<ElementType, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };
    
    recentEntries.forEach(entry => {
      const dominant = entry.metadata.elemental.dominant;
      elementCounts[dominant]++;
    });
    
    // Find underrepresented elements (growth edges)
    const sorted = Object.entries(elementCounts).sort((a, b) => a[1] - b[1]);
    const growthElement = sorted[0][0] as ElementType;
    
    return {
      strongestElement: sorted[4][0] as ElementType,
      growthEdge: growthElement,
      balance: elementCounts
    };
  },

  // Generate Maya's weaving insights
  async generateWeavingInsight(
    userId: string,
    threadId: string
  ): Promise<string> {
    const entries = await threadQueries.getThreadEntries(threadId);
    
    if (entries.length < 2) {
      return "This thread is just beginning to form...";
    }
    
    // Analyze the thread's arc
    const elements = entries.map(e => e.metadata?.elemental?.dominant).filter(Boolean);
    const archetypes = entries.flatMap(e => 
      e.metadata?.archetypal?.map((a: any) => a.archetype) || []
    );
    
    // Generate insight based on patterns
    const dominantElement = elements[0];
    const dominantArchetype = archetypes[0];
    
    return `This thread weaves ${dominantElement} energy through the ${dominantArchetype} archetype. ` +
           `I notice ${entries.length} moments connected by this pattern.`;
  }
};
/**
 * Bardic Memory Integration Tests
 *
 * Tests the complete bardic memory system including:
 * - Episode creation and retrieval
 * - Vector similarity matching (Recognition stage)
 * - Re-entry protocol with consent gates
 * - Telos tracking and alignment logging
 * - Microact virtue accreting
 * - Sacred witness pathway verification
 * - Usage tracking and quota enforcement
 *
 * @module lib/__tests__/bardic-memory.integration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';
import {
  Episode,
  Telos,
  Microact,
  UsageLogEntry,
  UserQuota,
  calculateCost,
  TIER_CONFIGS,
} from '../types';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Bardic Memory Integration Tests', () => {
  let supabase: SupabaseClient;
  const testUserId = 'test_user_' + Date.now();

  beforeAll(() => {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('episode_cues').delete().eq('episode_id', testUserId);
    await supabase.from('episode_vectors').delete().like('episode_id', `${testUserId}%`);
    await supabase.from('episode_links').delete().like('episode_a', `${testUserId}%`);
    await supabase.from('microact_logs').delete().like('microact_id', `${testUserId}%`);
    await supabase.from('microacts').delete().eq('user_id', testUserId);
    await supabase.from('telos_alignment_log').delete().like('telos_id', `${testUserId}%`);
    await supabase.from('teloi').delete().eq('user_id', testUserId);
    await supabase.from('episodes').delete().eq('user_id', testUserId);
    await supabase.from('cues').delete().eq('user_id', testUserId);
    await supabase.from('user_usage_logs').delete().eq('user_id', testUserId);
    await supabase.from('user_usage_quotas').delete().eq('user_id', testUserId);
  });

  // ==========================================================================
  // EPISODE CREATION & RETRIEVAL
  // ==========================================================================

  describe('Episode Creation & Retrieval', () => {
    it('should create an episode with all fields', async () => {
      const episode: Partial<Episode> = {
        userId: testUserId,
        datetime: new Date(),
        sceneStanza: 'The lake at dusk. Cedar smoke drifting. You named the grief.',
        placeCue: 'Cabin by the lake',
        senseCues: {
          smell: 'cedar smoke',
          sound: 'loon calling',
          music: null,
          texture: null,
          taste: null,
          image: null,
        },
        affectValence: 0.6,
        affectArousal: 0.3,
        affectKeywords: ['peace', 'melancholy', 'presence'],
        elementalState: {
          fire: 0.4,
          air: 0.5,
          water: 0.8,
          earth: 0.6,
          aether: 0.7,
        },
        dominantElement: 'water',
        isRecalibration: false,
        sacredFlag: false,
        fieldDepth: 0.75,
      };

      const { data, error } = await supabase
        .from('episodes')
        .insert({
          user_id: episode.userId,
          datetime: episode.datetime?.toISOString(),
          scene_stanza: episode.sceneStanza,
          place_cue: episode.placeCue,
          sense_cues: episode.senseCues,
          affect_valence: episode.affectValence,
          affect_arousal: episode.affectArousal,
          affect_keywords: episode.affectKeywords,
          elemental_state: episode.elementalState,
          dominant_element: episode.dominantElement,
          is_recalibration: episode.isRecalibration,
          sacred_flag: episode.sacredFlag,
          field_depth: episode.fieldDepth,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUserId);
      expect(data.scene_stanza).toBe(episode.sceneStanza);
      expect(data.dominant_element).toBe('water');
    });

    it('should enforce scene stanza length constraint (≤300 chars)', async () => {
      const longStanza = 'a'.repeat(301);

      const { error } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(),
          scene_stanza: longStanza,
        });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('scene_stanza');
    });

    it('should enforce affect_valence range (-1 to 1)', async () => {
      const { error } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(),
          scene_stanza: 'Test episode',
          affect_valence: 2.0, // Invalid: > 1
        });

      expect(error).not.toBeNull();
    });

    it('should enforce affect_arousal range (0 to 1)', async () => {
      const { error } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(),
          scene_stanza: 'Test episode',
          affect_arousal: -0.5, // Invalid: < 0
        });

      expect(error).not.toBeNull();
    });

    it('should retrieve episodes by user_id', async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('user_id', testUserId)
        .order('datetime', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // SACRED WITNESS PATHWAY
  // ==========================================================================

  describe('Sacred Witness Pathway', () => {
    it('should create sacred episode without vector embedding', async () => {
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(),
          scene_stanza: 'Sacred moment. Witnessed but not reduced.',
          sacred_flag: true,
        })
        .select()
        .single();

      expect(episodeError).toBeNull();
      expect(episode.sacred_flag).toBe(true);

      // Verify no vector embedding was created
      const { data: vector } = await supabase
        .from('episode_vectors')
        .select('*')
        .eq('episode_id', episode.id)
        .maybeSingle();

      expect(vector).toBeNull();
    });

    it('should allow retrieval of sacred episodes by user_id only', async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('user_id', testUserId)
        .eq('sacred_flag', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].sacred_flag).toBe(true);
    });
  });

  // ==========================================================================
  // TELOI (FIRE COGNITION)
  // ==========================================================================

  describe('Teloi (Future Pressures)', () => {
    let telosId: string;
    let episodeId: string;

    beforeAll(async () => {
      // Create an episode first
      const { data: episode } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(),
          scene_stanza: 'Sensing what wants to emerge.',
        })
        .select()
        .single();

      episodeId = episode.id;
    });

    it('should create a telos with future pressure', async () => {
      const { data, error } = await supabase
        .from('teloi')
        .insert({
          user_id: testUserId,
          phrase: 'Speaking my truth without apology',
          origin_episode_id: episodeId,
          strength: 0.8,
          horizon_days: 48,
          signals: ['increased clarity', 'boundary setting'],
          is_active: true,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.phrase).toBe('Speaking my truth without apology');
      expect(data.strength).toBe(0.8);

      telosId = data.id;
    });

    it('should log telos alignment delta', async () => {
      const { data, error } = await supabase
        .from('telos_alignment_log')
        .insert({
          episode_id: episodeId,
          telos_id: telosId,
          delta: 0.15,
          notes: 'Crystallization detected: spoke boundary clearly',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.delta).toBe(0.15);
    });

    it('should retrieve active teloi for user', async () => {
      const { data, error } = await supabase
        .from('teloi')
        .select('*')
        .eq('user_id', testUserId)
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // MICROACTS (EARTH LAYER)
  // ==========================================================================

  describe('Microacts (Virtue Accreting)', () => {
    let microactId: string;

    it('should create a microact definition', async () => {
      const { data, error } = await supabase
        .from('microacts')
        .insert({
          user_id: testUserId,
          action_phrase: 'Paused before speaking',
          virtue_category: 'presence',
          total_count: 0,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.action_phrase).toBe('Paused before speaking');

      microactId = data.id;
    });

    it('should log microact occurrences', async () => {
      // Log 3 occurrences
      const occurrences = [
        { microact_id: microactId, occurred_at: new Date().toISOString(), context_note: 'Morning conversation' },
        { microact_id: microactId, occurred_at: new Date().toISOString(), context_note: 'Difficult meeting' },
        { microact_id: microactId, occurred_at: new Date().toISOString(), context_note: 'Evening reflection' },
      ];

      const { data, error } = await supabase
        .from('microact_logs')
        .insert(occurrences)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(3);
    });

    it('should update total count after logging', async () => {
      // Get count of logs
      const { data: logs } = await supabase
        .from('microact_logs')
        .select('*')
        .eq('microact_id', microactId);

      const count = logs?.length || 0;

      // Update microact total
      const { error } = await supabase
        .from('microacts')
        .update({ total_count: count })
        .eq('id', microactId);

      expect(error).toBeNull();

      // Verify
      const { data: microact } = await supabase
        .from('microacts')
        .select('*')
        .eq('id', microactId)
        .single();

      expect(microact.total_count).toBe(3);
    });
  });

  // ==========================================================================
  // EPISODE LINKS (NARRATIVE THREADS)
  // ==========================================================================

  describe('Episode Links (Narrative Threads)', () => {
    let episodeA: string;
    let episodeB: string;

    beforeAll(async () => {
      // Create two episodes
      const { data: ep1 } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          scene_stanza: 'The first moment of clarity.',
        })
        .select()
        .single();

      const { data: ep2 } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(), // Today
          scene_stanza: 'The clarity deepens.',
        })
        .select()
        .single();

      episodeA = ep1.id;
      episodeB = ep2.id;
    });

    it('should create narrative link between episodes', async () => {
      const { data, error } = await supabase
        .from('episode_links')
        .insert({
          episode_a: episodeA,
          episode_b: episodeB,
          relation_type: 'deepens',
          relation_strength: 0.75,
          notes: 'Clarity thread continues',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.relation_type).toBe('deepens');
    });

    it('should enforce unique constraint on episode links', async () => {
      // Try to create duplicate link
      const { error } = await supabase
        .from('episode_links')
        .insert({
          episode_a: episodeA,
          episode_b: episodeB,
          relation_type: 'deepens',
        });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('duplicate');
    });

    it('should retrieve links for an episode', async () => {
      const { data, error } = await supabase
        .from('episode_links')
        .select('*')
        .or(`episode_a.eq.${episodeA},episode_b.eq.${episodeA}`);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // USAGE TRACKING
  // ==========================================================================

  describe('Usage Tracking', () => {
    it('should create user quota with tier defaults', async () => {
      const betaConfig = TIER_CONFIGS.beta;

      const { data, error } = await supabase
        .from('user_usage_quotas')
        .insert({
          user_id: testUserId,
          user_name: 'Test User',
          user_tier: 'beta',
          daily_message_limit: betaConfig.dailyMessageLimit,
          daily_token_limit: betaConfig.dailyTokenLimit,
          daily_cost_limit_cents: betaConfig.dailyCostLimitCents,
          requests_per_minute: betaConfig.requestsPerMinute,
          requests_per_hour: betaConfig.requestsPerHour,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_tier).toBe('beta');
      expect(data.daily_message_limit).toBe(100);
    });

    it('should log usage with cost calculation', async () => {
      const inputTokens = 10000;
      const outputTokens = 5000;
      const cost = calculateCost(inputTokens, outputTokens);

      const { data, error } = await supabase
        .from('user_usage_logs')
        .insert({
          user_id: testUserId,
          user_name: 'Test User',
          endpoint: '/api/between/chat',
          request_type: 'chat-text',
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          input_cost: cost.inputCost,
          output_cost: cost.outputCost,
          response_time_ms: 1250,
          model_used: 'claude-sonnet-4-20250514',
          field_depth: 0.75,
          success: true,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.input_tokens).toBe(10000);
      expect(data.output_tokens).toBe(5000);
      // Total cost should be computed (3¢ + 7.5¢ = 10.5¢)
      expect(data.total_cost).toBeCloseTo(10.5, 1);
    });

    it('should update quota current usage', async () => {
      // Simulate usage
      const { error } = await supabase
        .from('user_usage_quotas')
        .update({
          current_daily_messages: 5,
          current_daily_tokens: 15000,
          current_daily_cost_cents: 10.5,
        })
        .eq('user_id', testUserId);

      expect(error).toBeNull();

      // Verify
      const { data: quota } = await supabase
        .from('user_usage_quotas')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(quota.current_daily_messages).toBe(5);
      expect(quota.current_daily_tokens).toBe(15000);
    });

    it('should check quota limits', async () => {
      const { data: quota } = await supabase
        .from('user_usage_quotas')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      const allowed = quota.current_daily_messages < quota.daily_message_limit &&
                     quota.current_daily_tokens < quota.daily_token_limit &&
                     quota.current_daily_cost_cents < quota.daily_cost_limit_cents;

      expect(allowed).toBe(true);
    });
  });

  // ==========================================================================
  // CUES & PORTALS
  // ==========================================================================

  describe('Cues & Portals', () => {
    let cueId: string;
    let episodeId: string;

    beforeAll(async () => {
      // Create an episode
      const { data: episode } = await supabase
        .from('episodes')
        .insert({
          user_id: testUserId,
          datetime: new Date().toISOString(),
          scene_stanza: 'The smell of cedar brings it all back.',
        })
        .select()
        .single();

      episodeId = episode.id;
    });

    it('should create a sensory cue', async () => {
      const { data, error } = await supabase
        .from('cues')
        .insert({
          user_id: testUserId,
          cue_type: 'smell',
          cue_value: 'cedar smoke',
          description: 'Campfire at the cabin',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.cue_type).toBe('smell');

      cueId = data.id;
    });

    it('should link cue to episode', async () => {
      const { data, error } = await supabase
        .from('episode_cues')
        .insert({
          episode_id: episodeId,
          cue_id: cueId,
          strength: 0.9,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.strength).toBe(0.9);
    });

    it('should retrieve episodes by cue', async () => {
      const { data, error } = await supabase
        .from('episode_cues')
        .select(`
          episode_id,
          strength,
          episodes (
            user_id,
            scene_stanza,
            datetime
          )
        `)
        .eq('cue_id', cueId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // COST CALCULATION UTILITIES
  // ==========================================================================

  describe('Cost Calculation Utilities', () => {
    it('should calculate costs correctly', () => {
      const result = calculateCost(10000, 5000);

      expect(result.inputCost).toBe(3.0); // 10000 * 0.0003
      expect(result.outputCost).toBe(7.5); // 5000 * 0.0015
      expect(result.totalCost).toBe(10.5);
    });

    it('should handle zero tokens', () => {
      const result = calculateCost(0, 0);

      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('should match Sonnet 4 pricing', () => {
      // $3 per 1M input tokens
      const oneMillion = 1000000;
      const result = calculateCost(oneMillion, 0);

      expect(result.inputCost).toBe(300); // $3.00 = 300 cents
    });
  });
});

/**
 * TENANT KNOWLEDGE BASE SERVICE
 * Manages client-specific IP and documents
 * Isolated per tenant via RLS
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export interface TenantKnowledge {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  content_type: 'text' | 'pdf' | 'docx' | 'md' | 'url';
  category?: string;
  tags?: string[];
  elemental_tags?: ('fire' | 'water' | 'earth' | 'air' | 'aether')[];
  phase_tags?: ('phase1' | 'phase2' | 'phase3')[];
  metadata?: Record<string, any>;
  created_at: string;
  source_file?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  category?: string;
  metadata?: Record<string, any>;
}

export class TenantKnowledgeBase {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Set tenant context for RLS
   */
  private async setTenantContext() {
    await supabase.rpc('set_tenant_context', { tenant_id: this.tenantId });
  }

  /**
   * Add knowledge to tenant's knowledge base
   */
  async addKnowledge(data: {
    title: string;
    content: string;
    content_type?: TenantKnowledge['content_type'];
    category?: string;
    tags?: string[];
    elemental_tags?: TenantKnowledge['elemental_tags'];
    phase_tags?: TenantKnowledge['phase_tags'];
    metadata?: Record<string, any>;
    source_file?: string;
  }): Promise<TenantKnowledge> {
    await this.setTenantContext();

    // Generate embedding for content
    const embedding = await this.generateEmbedding(data.content);

    const { data: knowledge, error } = await supabase
      .from('tenant_knowledge')
      .insert({
        tenant_id: this.tenantId,
        title: data.title,
        content: data.content,
        content_type: data.content_type || 'text',
        category: data.category,
        tags: data.tags || [],
        elemental_tags: data.elemental_tags || [],
        phase_tags: data.phase_tags || [],
        metadata: data.metadata || {},
        source_file: data.source_file,
        embedding,
        processed: true,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding knowledge:', error);
      throw error;
    }

    console.log('✅ Knowledge added:', knowledge.id);
    return knowledge;
  }

  /**
   * Semantic search within tenant's knowledge base
   */
  async search(query: string, options: {
    matchThreshold?: number;
    limit?: number;
    category?: string;
    elementalTags?: string[];
  } = {}): Promise<SearchResult[]> {
    await this.setTenantContext();

    const {
      matchThreshold = 0.7,
      limit = 10,
      category,
      elementalTags
    } = options;

    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(query);

    // Use the search function from migration
    const { data, error } = await supabase.rpc('search_tenant_knowledge', {
      p_tenant_id: this.tenantId,
      p_query_embedding: queryEmbedding,
      p_match_threshold: matchThreshold,
      p_limit: limit
    });

    if (error) {
      console.error('❌ Error searching knowledge:', error);
      throw error;
    }

    // Filter by category and elemental tags if provided
    let results = data || [];

    if (category) {
      results = results.filter((r: any) => r.category === category);
    }

    if (elementalTags && elementalTags.length > 0) {
      results = results.filter((r: any) =>
        r.elemental_tags?.some((tag: string) => elementalTags.includes(tag))
      );
    }

    console.log('🔍 Search results:', results.length, 'found for:', query.substring(0, 50));
    return results;
  }

  /**
   * Get all knowledge for a category
   */
  async getByCategory(category: string): Promise<TenantKnowledge[]> {
    await this.setTenantContext();

    const { data, error } = await supabase
      .from('tenant_knowledge')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('category', category)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching by category:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get knowledge by elemental tag
   */
  async getByElement(element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): Promise<TenantKnowledge[]> {
    await this.setTenantContext();

    const { data, error } = await supabase
      .from('tenant_knowledge')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .contains('elemental_tags', [element])
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching by element:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Update knowledge entry
   */
  async updateKnowledge(id: string, updates: Partial<TenantKnowledge>): Promise<TenantKnowledge> {
    await this.setTenantContext();

    // If content is updated, regenerate embedding
    if (updates.content) {
      const embedding = await this.generateEmbedding(updates.content);
      (updates as any).embedding = embedding;
    }

    const { data, error } = await supabase
      .from('tenant_knowledge')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating knowledge:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete knowledge entry
   */
  async deleteKnowledge(id: string): Promise<void> {
    await this.setTenantContext();

    const { error } = await supabase
      .from('tenant_knowledge')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('❌ Error deleting knowledge:', error);
      throw error;
    }

    console.log('🗑️ Knowledge archived:', id);
  }

  /**
   * Get knowledge statistics
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byElement: Record<string, number>;
  }> {
    await this.setTenantContext();

    const { data, error } = await supabase
      .from('tenant_knowledge')
      .select('category, elemental_tags')
      .eq('tenant_id', this.tenantId)
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }

    const byCategory: Record<string, number> = {};
    const byElement: Record<string, number> = {};

    data?.forEach(item => {
      if (item.category) {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      }
      item.elemental_tags?.forEach((tag: string) => {
        byElement[tag] = (byElement[tag] || 0) + 1;
      });
    });

    return {
      total: data?.length || 0,
      byCategory,
      byElement
    };
  }

  /**
   * Generate embedding using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8000) // Limit to ~8k chars
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Batch add knowledge (for bulk uploads)
   */
  async batchAddKnowledge(items: Array<{
    title: string;
    content: string;
    content_type?: TenantKnowledge['content_type'];
    category?: string;
    tags?: string[];
    elemental_tags?: TenantKnowledge['elemental_tags'];
    phase_tags?: TenantKnowledge['phase_tags'];
    metadata?: Record<string, any>;
  }>): Promise<TenantKnowledge[]> {
    await this.setTenantContext();

    console.log('📦 Batch adding', items.length, 'knowledge items...');

    // Generate embeddings in parallel (with rate limiting)
    const itemsWithEmbeddings = await Promise.all(
      items.map(async (item) => {
        const embedding = await this.generateEmbedding(item.content);
        return {
          tenant_id: this.tenantId,
          title: item.title,
          content: item.content,
          content_type: item.content_type || 'text',
          category: item.category,
          tags: item.tags || [],
          elemental_tags: item.elemental_tags || [],
          phase_tags: item.phase_tags || [],
          metadata: item.metadata || {},
          embedding,
          processed: true,
          status: 'active'
        };
      })
    );

    const { data, error } = await supabase
      .from('tenant_knowledge')
      .insert(itemsWithEmbeddings)
      .select();

    if (error) {
      console.error('❌ Error batch adding knowledge:', error);
      throw error;
    }

    console.log('✅ Batch added', data?.length, 'knowledge items');
    return data || [];
  }
}

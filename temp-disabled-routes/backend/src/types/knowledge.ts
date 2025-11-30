export interface KnowledgeEntry {
  id?: string;
  title: string;
  content: string;
  category: string;
  element?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  source: string;
  validation_status?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  content: string;
  properties: Record<string, any>;
}

export interface KnowledgeQueryParams {
  category?: string;
  element?: string;
  query?: string;
  minConfidence?: number;
  limit?: number;
}

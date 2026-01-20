/**
 * STELLIUM MARKETING LIBRARY
 *
 * Marketing automation for practitioners
 * "Your voice, amplified. Your presence, consistent. Your practice, growing."
 */

import { query, queryOne, transaction } from '@/lib/db/postgres';

// ============================================
// TYPES
// ============================================

export type ContactStatus = 'lead' | 'engaged' | 'qualified' | 'opportunity' | 'converted' | 'unsubscribed';
export type ContactSource = 'organic' | 'referral' | 'ad' | 'lead_magnet' | 'webinar' | 'social';
export type CampaignType = 'sequence' | 'broadcast' | 'automation' | 'transit_alert';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type ContentPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'threads';
export type ContentType = 'post' | 'story' | 'carousel' | 'reel_script' | 'thread';
export type ContentPillar = 'educational' | 'inspirational' | 'promotional' | 'personal' | 'seasonal';

export interface MarketingContact {
  id: string;
  practitioner_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  source: ContactSource;
  source_detail?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  status: ContactStatus;
  lead_score: number;
  emails_received: number;
  emails_opened: number;
  emails_clicked: number;
  last_email_at?: Date;
  last_opened_at?: Date;
  last_clicked_at?: Date;
  converted_to_client_id?: string;
  converted_at?: Date;
  conversion_value?: number;
  tags: string[];
  birth_data?: {
    date?: string;
    time?: string;
    location?: string;
  };
  email_consent: boolean;
  consent_timestamp?: Date;
  consent_source?: string;
  custom_fields: Record<string, unknown>;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmailTemplate {
  id: string;
  practitioner_id: string;
  name: string;
  category?: string;
  subject: string;
  preview_text?: string;
  body_html: string;
  body_text?: string;
  generated_by_maia: boolean;
  maia_prompt?: string;
  voice_match_score?: number;
  personalization_tokens: string[];
  template_theme: string;
  times_used: number;
  avg_open_rate?: number;
  avg_click_rate?: number;
  status: 'draft' | 'active' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface MarketingCampaign {
  id: string;
  practitioner_id: string;
  name: string;
  description?: string;
  type: CampaignType;
  target_segment?: Record<string, unknown>;
  estimated_recipients?: number;
  sequence_emails?: Array<{
    order: number;
    template_id: string;
    delay_days: number;
    delay_hours?: number;
  }>;
  send_at?: Date;
  template_id?: string;
  trigger_type?: string;
  trigger_config?: Record<string, unknown>;
  transit_config?: Record<string, unknown>;
  status: CampaignStatus;
  started_at?: Date;
  completed_at?: Date;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  unsubscribes: number;
  conversions: number;
  created_at: Date;
  updated_at: Date;
}

export interface SocialContent {
  id: string;
  practitioner_id: string;
  platform?: ContentPlatform;
  content_type?: ContentType;
  content_text: string;
  hashtags: string[];
  media_urls: string[];
  carousel_slides?: Array<{
    text: string;
    media_url?: string;
  }>;
  generated_by_maia: boolean;
  maia_prompt?: string;
  voice_match_score?: number;
  topic?: string;
  content_pillar?: ContentPillar;
  transit_context?: {
    planet?: string;
    sign?: string;
    aspect?: string;
    interpretation?: string;
  };
  scheduled_for?: Date;
  published_at?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeadMagnet {
  id: string;
  practitioner_id: string;
  name: string;
  description?: string;
  type?: string;
  content_url?: string;
  landing_page_config?: Record<string, unknown>;
  thank_you_config?: Record<string, unknown>;
  required_fields: string[];
  optional_fields: string[];
  auto_tag: string[];
  follow_up_campaign_id?: string;
  page_views: number;
  submissions: number;
  conversion_rate?: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface TransitAlert {
  id: string;
  practitioner_id: string;
  name: string;
  description?: string;
  transiting_planet: string;
  natal_planet?: string;
  aspect_type?: string;
  target_sign?: string;
  orb_degrees: number;
  email_template_id?: string;
  social_content_template?: string;
  target_segment?: Record<string, unknown>;
  send_to_natal_affected: boolean;
  advance_notice_days: number;
  status: 'active' | 'paused';
  last_triggered_at?: Date;
  times_triggered: number;
  created_at: Date;
  updated_at: Date;
}

export interface AutomationWorkflow {
  id: string;
  practitioner_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: Record<string, unknown>;
  steps: Array<{
    order: number;
    type: 'send_email' | 'add_tag' | 'remove_tag' | 'update_field' | 'notify_practitioner' | 'wait' | 'condition';
    config: Record<string, unknown>;
    delay?: { days?: number; hours?: number };
  }>;
  status: 'draft' | 'active' | 'paused';
  contacts_entered: number;
  contacts_completed: number;
  contacts_active: number;
  created_at: Date;
  updated_at: Date;
}

export interface MarketingAnalytics {
  period_type: 'day' | 'week' | 'month';
  period_start: Date;
  period_end: Date;
  new_contacts: number;
  contacts_by_source: Record<string, number>;
  contacts_converted: number;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  unsubscribes: number;
  posts_published: number;
  total_engagement: number;
  bookings: number;
  revenue: number;
  open_rate?: number;
  click_rate?: number;
  conversion_rate?: number;
  revenue_per_contact?: number;
}

// ============================================
// CONTACTS
// ============================================

export async function getContacts(
  practitionerId: string,
  options: {
    status?: ContactStatus;
    source?: ContactSource;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'created_at' | 'lead_score' | 'last_email_at';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{ contacts: MarketingContact[]; total: number }> {
  const {
    status,
    source,
    tags,
    search,
    limit = 50,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  const conditions: string[] = ['practitioner_id = $1'];
  const params: unknown[] = [practitionerId];
  let paramIndex = 2;

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }

  if (source) {
    conditions.push(`source = $${paramIndex++}`);
    params.push(source);
  }

  if (tags && tags.length > 0) {
    conditions.push(`tags && $${paramIndex++}`);
    params.push(tags);
  }

  if (search) {
    conditions.push(`(
      email ILIKE $${paramIndex} OR
      first_name ILIKE $${paramIndex} OR
      last_name ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const sortColumn = {
    name: 'COALESCE(first_name, email)',
    created_at: 'created_at',
    lead_score: 'lead_score',
    last_email_at: 'last_email_at',
  }[sortBy];

  // Get total count
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM marketing_contacts WHERE ${whereClause}`,
    params
  );

  // Get paginated results
  const contacts = await query<MarketingContact>(
    `SELECT * FROM marketing_contacts
     WHERE ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder === 'asc' ? 'ASC' : 'DESC'} NULLS LAST
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, limit, offset]
  );

  return {
    contacts,
    total: parseInt(countResult?.count || '0'),
  };
}

export async function getContact(contactId: string): Promise<MarketingContact | null> {
  return queryOne<MarketingContact>(
    'SELECT * FROM marketing_contacts WHERE id = $1',
    [contactId]
  );
}

export async function createContact(
  practitionerId: string,
  data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    source?: ContactSource;
    source_detail?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    tags?: string[];
    birth_data?: Record<string, unknown>;
    consent_source?: string;
    custom_fields?: Record<string, unknown>;
    notes?: string;
  }
): Promise<MarketingContact> {
  const result = await queryOne<MarketingContact>(
    `INSERT INTO marketing_contacts (
      practitioner_id, email, first_name, last_name, phone,
      source, source_detail, utm_source, utm_medium, utm_campaign,
      tags, birth_data, email_consent, consent_timestamp, consent_source,
      custom_fields, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), $13, $14, $15)
    RETURNING *`,
    [
      practitionerId,
      data.email,
      data.first_name,
      data.last_name,
      data.phone,
      data.source || 'organic',
      data.source_detail,
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
      data.tags || [],
      data.birth_data ? JSON.stringify(data.birth_data) : null,
      data.consent_source,
      data.custom_fields ? JSON.stringify(data.custom_fields) : '{}',
      data.notes,
    ]
  );

  if (!result) throw new Error('Failed to create contact');
  return result;
}

export async function updateContact(
  contactId: string,
  data: Partial<Omit<MarketingContact, 'id' | 'practitioner_id' | 'created_at'>>
): Promise<MarketingContact> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'email', 'first_name', 'last_name', 'phone', 'status', 'tags',
    'birth_data', 'custom_fields', 'notes', 'lead_score'
  ];

  for (const field of allowedFields) {
    if (data[field as keyof typeof data] !== undefined) {
      updates.push(`${field} = $${paramIndex++}`);
      const value = data[field as keyof typeof data];
      params.push(
        typeof value === 'object' && !Array.isArray(value)
          ? JSON.stringify(value)
          : value
      );
    }
  }

  updates.push(`updated_at = NOW()`);
  params.push(contactId);

  const result = await queryOne<MarketingContact>(
    `UPDATE marketing_contacts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (!result) throw new Error('Contact not found');
  return result;
}

export async function addContactTags(contactId: string, tags: string[]): Promise<MarketingContact> {
  const result = await queryOne<MarketingContact>(
    `UPDATE marketing_contacts
     SET tags = array_cat(tags, $1::text[]), updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [tags, contactId]
  );
  if (!result) throw new Error('Contact not found');
  return result;
}

export async function removeContactTags(contactId: string, tags: string[]): Promise<MarketingContact> {
  const result = await queryOne<MarketingContact>(
    `UPDATE marketing_contacts
     SET tags = array_remove_all(tags, $1::text[]), updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [tags, contactId]
  );
  if (!result) throw new Error('Contact not found');
  return result;
}

export async function convertContactToClient(
  contactId: string,
  clientId: string,
  conversionValue?: number
): Promise<MarketingContact> {
  const result = await queryOne<MarketingContact>(
    `UPDATE marketing_contacts
     SET status = 'converted',
         converted_to_client_id = $1,
         converted_at = NOW(),
         conversion_value = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [clientId, conversionValue, contactId]
  );
  if (!result) throw new Error('Contact not found');
  return result;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export async function getEmailTemplates(
  practitionerId: string,
  options: {
    category?: string;
    status?: string;
  } = {}
): Promise<EmailTemplate[]> {
  const conditions: string[] = ['practitioner_id = $1'];
  const params: unknown[] = [practitionerId];
  let paramIndex = 2;

  if (options.category) {
    conditions.push(`category = $${paramIndex++}`);
    params.push(options.category);
  }

  if (options.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(options.status);
  }

  return query<EmailTemplate>(
    `SELECT * FROM email_templates WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
}

export async function createEmailTemplate(
  practitionerId: string,
  data: {
    name: string;
    category?: string;
    subject: string;
    preview_text?: string;
    body_html: string;
    body_text?: string;
    generated_by_maia?: boolean;
    maia_prompt?: string;
    voice_match_score?: number;
    personalization_tokens?: string[];
    template_theme?: string;
  }
): Promise<EmailTemplate> {
  const result = await queryOne<EmailTemplate>(
    `INSERT INTO email_templates (
      practitioner_id, name, category, subject, preview_text,
      body_html, body_text, generated_by_maia, maia_prompt,
      voice_match_score, personalization_tokens, template_theme
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      practitionerId,
      data.name,
      data.category,
      data.subject,
      data.preview_text,
      data.body_html,
      data.body_text,
      data.generated_by_maia || false,
      data.maia_prompt,
      data.voice_match_score,
      data.personalization_tokens || [],
      data.template_theme || 'minimal',
    ]
  );

  if (!result) throw new Error('Failed to create email template');
  return result;
}

// ============================================
// CAMPAIGNS
// ============================================

export async function getCampaigns(
  practitionerId: string,
  options: {
    type?: CampaignType;
    status?: CampaignStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ campaigns: MarketingCampaign[]; total: number }> {
  const { type, status, limit = 50, offset = 0 } = options;

  const conditions: string[] = ['practitioner_id = $1'];
  const params: unknown[] = [practitionerId];
  let paramIndex = 2;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    params.push(type);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }

  const whereClause = conditions.join(' AND ');

  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM marketing_campaigns WHERE ${whereClause}`,
    params
  );

  const campaigns = await query<MarketingCampaign>(
    `SELECT * FROM marketing_campaigns
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, limit, offset]
  );

  return {
    campaigns,
    total: parseInt(countResult?.count || '0'),
  };
}

export async function createCampaign(
  practitionerId: string,
  data: {
    name: string;
    description?: string;
    type: CampaignType;
    target_segment?: Record<string, unknown>;
    sequence_emails?: unknown[];
    send_at?: Date;
    template_id?: string;
    trigger_type?: string;
    trigger_config?: Record<string, unknown>;
    transit_config?: Record<string, unknown>;
  }
): Promise<MarketingCampaign> {
  const result = await queryOne<MarketingCampaign>(
    `INSERT INTO marketing_campaigns (
      practitioner_id, name, description, type, target_segment,
      sequence_emails, send_at, template_id, trigger_type, trigger_config, transit_config
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      practitionerId,
      data.name,
      data.description,
      data.type,
      data.target_segment ? JSON.stringify(data.target_segment) : null,
      data.sequence_emails ? JSON.stringify(data.sequence_emails) : null,
      data.send_at,
      data.template_id,
      data.trigger_type,
      data.trigger_config ? JSON.stringify(data.trigger_config) : null,
      data.transit_config ? JSON.stringify(data.transit_config) : null,
    ]
  );

  if (!result) throw new Error('Failed to create campaign');
  return result;
}

export async function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus
): Promise<MarketingCampaign> {
  const updates: Record<CampaignStatus, string> = {
    draft: 'status = $1',
    scheduled: 'status = $1',
    active: 'status = $1, started_at = COALESCE(started_at, NOW())',
    paused: 'status = $1',
    completed: 'status = $1, completed_at = NOW()',
  };

  const result = await queryOne<MarketingCampaign>(
    `UPDATE marketing_campaigns SET ${updates[status]}, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, campaignId]
  );

  if (!result) throw new Error('Campaign not found');
  return result;
}

// ============================================
// SOCIAL CONTENT
// ============================================

export async function getSocialContent(
  practitionerId: string,
  options: {
    platform?: ContentPlatform;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Promise<SocialContent[]> {
  const { platform, status, startDate, endDate, limit = 50, offset = 0 } = options;

  const conditions: string[] = ['practitioner_id = $1'];
  const params: unknown[] = [practitionerId];
  let paramIndex = 2;

  if (platform) {
    conditions.push(`platform = $${paramIndex++}`);
    params.push(platform);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }

  if (startDate) {
    conditions.push(`scheduled_for >= $${paramIndex++}`);
    params.push(startDate);
  }

  if (endDate) {
    conditions.push(`scheduled_for <= $${paramIndex++}`);
    params.push(endDate);
  }

  return query<SocialContent>(
    `SELECT * FROM social_content
     WHERE ${conditions.join(' AND ')}
     ORDER BY scheduled_for ASC NULLS LAST, created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, limit, offset]
  );
}

export async function createSocialContent(
  practitionerId: string,
  data: {
    platform?: ContentPlatform;
    content_type?: ContentType;
    content_text: string;
    hashtags?: string[];
    media_urls?: string[];
    carousel_slides?: unknown[];
    generated_by_maia?: boolean;
    maia_prompt?: string;
    voice_match_score?: number;
    topic?: string;
    content_pillar?: ContentPillar;
    transit_context?: Record<string, unknown>;
    scheduled_for?: Date;
  }
): Promise<SocialContent> {
  const result = await queryOne<SocialContent>(
    `INSERT INTO social_content (
      practitioner_id, platform, content_type, content_text, hashtags,
      media_urls, carousel_slides, generated_by_maia, maia_prompt,
      voice_match_score, topic, content_pillar, transit_context, scheduled_for
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    [
      practitionerId,
      data.platform,
      data.content_type,
      data.content_text,
      data.hashtags || [],
      data.media_urls || [],
      data.carousel_slides ? JSON.stringify(data.carousel_slides) : null,
      data.generated_by_maia || false,
      data.maia_prompt,
      data.voice_match_score,
      data.topic,
      data.content_pillar,
      data.transit_context ? JSON.stringify(data.transit_context) : null,
      data.scheduled_for,
    ]
  );

  if (!result) throw new Error('Failed to create social content');
  return result;
}

// ============================================
// LEAD MAGNETS
// ============================================

export async function getLeadMagnets(
  practitionerId: string,
  status?: string
): Promise<LeadMagnet[]> {
  const conditions: string[] = ['practitioner_id = $1'];
  const params: unknown[] = [practitionerId];

  if (status) {
    conditions.push('status = $2');
    params.push(status);
  }

  return query<LeadMagnet>(
    `SELECT * FROM lead_magnets WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
}

export async function createLeadMagnet(
  practitionerId: string,
  data: {
    name: string;
    description?: string;
    type?: string;
    content_url?: string;
    landing_page_config?: Record<string, unknown>;
    thank_you_config?: Record<string, unknown>;
    required_fields?: string[];
    optional_fields?: string[];
    auto_tag?: string[];
    follow_up_campaign_id?: string;
  }
): Promise<LeadMagnet> {
  const result = await queryOne<LeadMagnet>(
    `INSERT INTO lead_magnets (
      practitioner_id, name, description, type, content_url,
      landing_page_config, thank_you_config, required_fields,
      optional_fields, auto_tag, follow_up_campaign_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      practitionerId,
      data.name,
      data.description,
      data.type,
      data.content_url,
      data.landing_page_config ? JSON.stringify(data.landing_page_config) : null,
      data.thank_you_config ? JSON.stringify(data.thank_you_config) : null,
      data.required_fields || ['email'],
      data.optional_fields || [],
      data.auto_tag || [],
      data.follow_up_campaign_id,
    ]
  );

  if (!result) throw new Error('Failed to create lead magnet');
  return result;
}

export async function recordLeadMagnetSubmission(
  leadMagnetId: string,
  data: {
    email: string;
    form_data: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }
): Promise<string> {
  // Create submission record
  const submission = await queryOne<{ id: string }>(
    `INSERT INTO lead_magnet_submissions (
      lead_magnet_id, email, form_data, ip_address, user_agent,
      referrer, utm_source, utm_medium, utm_campaign
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id`,
    [
      leadMagnetId,
      data.email,
      JSON.stringify(data.form_data),
      data.ip_address,
      data.user_agent,
      data.referrer,
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
    ]
  );

  // Update lead magnet stats
  await query(
    `UPDATE lead_magnets
     SET submissions = submissions + 1,
         conversion_rate = (submissions + 1)::decimal / NULLIF(page_views, 0) * 100,
         updated_at = NOW()
     WHERE id = $1`,
    [leadMagnetId]
  );

  return submission?.id || '';
}

// ============================================
// ANALYTICS
// ============================================

export async function getMarketingDashboard(
  practitionerId: string
): Promise<{
  contacts: { total: number; byStatus: Record<string, number>; recent: number };
  campaigns: { active: number; paused: number; total_sent: number };
  email_metrics: { open_rate: number; click_rate: number };
  content: { scheduled: number; published_this_month: number };
  lead_magnets: { active: number; total_submissions: number };
}> {
  const [
    contactStats,
    campaignStats,
    emailMetrics,
    contentStats,
    leadMagnetStats,
  ] = await Promise.all([
    // Contact stats
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM marketing_contacts
       WHERE practitioner_id = $1 GROUP BY status`,
      [practitionerId]
    ),
    // Campaign stats
    queryOne<{ active: string; paused: string; total_sent: string }>(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'paused') as paused,
        COALESCE(SUM(emails_sent), 0) as total_sent
       FROM marketing_campaigns WHERE practitioner_id = $1`,
      [practitionerId]
    ),
    // Email metrics (last 30 days)
    queryOne<{ open_rate: string; click_rate: string }>(
      `SELECT
        COALESCE(AVG(CASE WHEN opened_at IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100, 0) as open_rate,
        COALESCE(AVG(CASE WHEN clicked_at IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100, 0) as click_rate
       FROM campaign_sends cs
       JOIN marketing_campaigns mc ON cs.campaign_id = mc.id
       WHERE mc.practitioner_id = $1 AND cs.sent_at > NOW() - INTERVAL '30 days'`,
      [practitionerId]
    ),
    // Content stats
    queryOne<{ scheduled: string; published: string }>(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'published' AND published_at > date_trunc('month', NOW())) as published
       FROM social_content WHERE practitioner_id = $1`,
      [practitionerId]
    ),
    // Lead magnet stats
    queryOne<{ active: string; total_submissions: string }>(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COALESCE(SUM(submissions), 0) as total_submissions
       FROM lead_magnets WHERE practitioner_id = $1`,
      [practitionerId]
    ),
  ]);

  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of contactStats?.rows || []) {
    byStatus[row.status] = parseInt(row.count);
    total += parseInt(row.count);
  }

  // Recent contacts (last 7 days)
  const recentResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM marketing_contacts
     WHERE practitioner_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
    [practitionerId]
  );

  return {
    contacts: {
      total,
      byStatus,
      recent: parseInt(recentResult?.count || '0'),
    },
    campaigns: {
      active: parseInt(campaignStats?.active || '0'),
      paused: parseInt(campaignStats?.paused || '0'),
      total_sent: parseInt(campaignStats?.total_sent || '0'),
    },
    email_metrics: {
      open_rate: parseFloat(emailMetrics?.open_rate || '0'),
      click_rate: parseFloat(emailMetrics?.click_rate || '0'),
    },
    content: {
      scheduled: parseInt(contentStats?.scheduled || '0'),
      published_this_month: parseInt(contentStats?.published || '0'),
    },
    lead_magnets: {
      active: parseInt(leadMagnetStats?.active || '0'),
      total_submissions: parseInt(leadMagnetStats?.total_submissions || '0'),
    },
  };
}

export async function getMarketingAnalytics(
  practitionerId: string,
  periodType: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
): Promise<MarketingAnalytics[]> {
  return query<MarketingAnalytics>(
    `SELECT * FROM marketing_analytics
     WHERE practitioner_id = $1
       AND period_type = $2
       AND period_start >= $3
       AND period_end <= $4
     ORDER BY period_start ASC`,
    [practitionerId, periodType, startDate, endDate]
  );
}

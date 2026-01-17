/**
 * Practitioner Service
 *
 * Core business logic for managing practitioners and their portals.
 * Handles CRUD operations, onboarding, and portal configuration.
 */

import { query, getOne, getMany } from '../db/postgres';
import type {
  PractitionerProfile,
  AICompanionConfig,
  PractitionerTheme,
  PractitionerDomain,
  PractitionerFeatures,
  PractitionerOnboarding,
  OnboardingStep,
  PractitionerClient,
} from './types';
import { buildSystemPrompt } from './systemPromptBuilder';

// ============== PRACTITIONER PROFILE ==============

export async function createPractitioner(
  data: Omit<PractitionerProfile, 'id' | 'createdAt' | 'status' | 'revenueSharePercent'>
): Promise<PractitionerProfile> {
  const result = await query(
    `INSERT INTO practitioners (slug, name, email, business_name, tagline, bio, status, revenue_share_percent)
     VALUES ($1, $2, $3, $4, $5, $6, 'onboarding', 12)
     RETURNING *`,
    [data.slug, data.name, data.email, data.businessName, data.tagline, data.bio]
  );

  return mapPractitionerRow(result.rows[0]);
}

export async function getPractitionerById(id: string): Promise<PractitionerProfile | null> {
  const row = await getOne(
    `SELECT * FROM practitioners WHERE id = $1`,
    [id]
  );

  return row ? mapPractitionerRow(row) : null;
}

export async function getPractitionerBySlug(slug: string): Promise<PractitionerProfile | null> {
  const row = await getOne(
    `SELECT * FROM practitioners WHERE slug = $1`,
    [slug]
  );

  return row ? mapPractitionerRow(row) : null;
}

export async function getPractitionerByDomain(domain: string): Promise<PractitionerProfile | null> {
  // First check custom domains
  const customDomainRow = await getOne(
    `SELECT p.* FROM practitioners p
     JOIN practitioner_domains pd ON p.id = pd.practitioner_id
     WHERE pd.custom_domain = $1 AND pd.custom_domain_verified = true`,
    [domain]
  );

  if (customDomainRow) {
    return mapPractitionerRow(customDomainRow);
  }

  // Check subdomains (e.g., loralee.soullab.life)
  const subdomain = domain.replace('.soullab.life', '');
  const subdomainRow = await getOne(
    `SELECT p.* FROM practitioners p
     JOIN practitioner_domains pd ON p.id = pd.practitioner_id
     WHERE pd.subdomain = $1`,
    [subdomain]
  );

  return subdomainRow ? mapPractitionerRow(subdomainRow) : null;
}

export async function updatePractitioner(
  id: string,
  data: Partial<PractitionerProfile>
): Promise<PractitionerProfile | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.businessName !== undefined) {
    fields.push(`business_name = $${paramIndex++}`);
    values.push(data.businessName);
  }
  if (data.tagline !== undefined) {
    fields.push(`tagline = $${paramIndex++}`);
    values.push(data.tagline);
  }
  if (data.bio !== undefined) {
    fields.push(`bio = $${paramIndex++}`);
    values.push(data.bio);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.stripeAccountId !== undefined) {
    fields.push(`stripe_account_id = $${paramIndex++}`);
    values.push(data.stripeAccountId);
  }
  if (data.revenueSharePercent !== undefined) {
    fields.push(`revenue_share_percent = $${paramIndex++}`);
    values.push(data.revenueSharePercent);
  }

  if (fields.length === 0) return getPractitionerById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE practitioners SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ? mapPractitionerRow(result.rows[0]) : null;
}

export async function listPractitioners(
  status?: PractitionerProfile['status']
): Promise<PractitionerProfile[]> {
  const rows = status
    ? await getMany(`SELECT * FROM practitioners WHERE status = $1 ORDER BY created_at DESC`, [status])
    : await getMany(`SELECT * FROM practitioners ORDER BY created_at DESC`);

  return rows.map(mapPractitionerRow);
}

// ============== AI COMPANION CONFIG ==============

export async function getAICompanionConfig(practitionerId: string): Promise<AICompanionConfig | null> {
  const row = await getOne(
    `SELECT * FROM ai_companion_configs WHERE practitioner_id = $1`,
    [practitionerId]
  );

  return row ? mapAIConfigRow(row) : null;
}

export async function saveAICompanionConfig(
  practitionerId: string,
  config: Omit<AICompanionConfig, 'practitionerId'>
): Promise<AICompanionConfig> {
  const existing = await getAICompanionConfig(practitionerId);

  if (existing) {
    await query(
      `UPDATE ai_companion_configs SET
        name = $2,
        pronouns = $3,
        voice_style = $4,
        tone = $5,
        frameworks = $6,
        primary_framework = $7,
        specialties = $8,
        boundaries = $9,
        knowledge_base = $10,
        system_prompt_template = $11,
        updated_at = NOW()
       WHERE practitioner_id = $1`,
      [
        practitionerId,
        config.name,
        config.pronouns,
        config.voiceStyle,
        JSON.stringify(config.tone),
        JSON.stringify(config.frameworks),
        config.primaryFramework,
        JSON.stringify(config.specialties),
        JSON.stringify(config.boundaries),
        JSON.stringify(config.knowledgeBase),
        config.systemPromptTemplate,
      ]
    );
  } else {
    await query(
      `INSERT INTO ai_companion_configs
        (practitioner_id, name, pronouns, voice_style, tone, frameworks, primary_framework, specialties, boundaries, knowledge_base, system_prompt_template)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        practitionerId,
        config.name,
        config.pronouns,
        config.voiceStyle,
        JSON.stringify(config.tone),
        JSON.stringify(config.frameworks),
        config.primaryFramework,
        JSON.stringify(config.specialties),
        JSON.stringify(config.boundaries),
        JSON.stringify(config.knowledgeBase),
        config.systemPromptTemplate,
      ]
    );
  }

  return { practitionerId, ...config };
}

/**
 * Generate the full system prompt for a practitioner's AI companion.
 * This combines the config with the practitioner profile to create
 * a prompt that speaks in their voice.
 */
export async function generateSystemPrompt(practitionerId: string): Promise<string | null> {
  const practitioner = await getPractitionerById(practitionerId);
  const config = await getAICompanionConfig(practitionerId);

  if (!practitioner || !config) return null;

  return buildSystemPrompt(config, practitioner);
}

// ============== PRACTITIONER THEME ==============

export async function getPractitionerTheme(practitionerId: string): Promise<PractitionerTheme | null> {
  const row = await getOne(
    `SELECT * FROM practitioner_themes WHERE practitioner_id = $1`,
    [practitionerId]
  );

  return row ? mapThemeRow(row) : null;
}

export async function savePractitionerTheme(
  practitionerId: string,
  theme: Omit<PractitionerTheme, 'practitionerId'>
): Promise<PractitionerTheme> {
  const existing = await getPractitionerTheme(practitionerId);

  if (existing) {
    await query(
      `UPDATE practitioner_themes SET
        logo = $2,
        favicon = $3,
        hero_image = $4,
        color_palette = $5,
        typography = $6,
        vibe_preset = $7,
        custom_css = $8,
        updated_at = NOW()
       WHERE practitioner_id = $1`,
      [
        practitionerId,
        theme.logo,
        theme.favicon,
        theme.heroImage,
        JSON.stringify(theme.colorPalette),
        JSON.stringify(theme.typography),
        theme.vibePreset,
        theme.customCss,
      ]
    );
  } else {
    await query(
      `INSERT INTO practitioner_themes
        (practitioner_id, logo, favicon, hero_image, color_palette, typography, vibe_preset, custom_css)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        practitionerId,
        theme.logo,
        theme.favicon,
        theme.heroImage,
        JSON.stringify(theme.colorPalette),
        JSON.stringify(theme.typography),
        theme.vibePreset,
        theme.customCss,
      ]
    );
  }

  return { practitionerId, ...theme };
}

// ============== PRACTITIONER DOMAIN ==============

export async function getPractitionerDomain(practitionerId: string): Promise<PractitionerDomain | null> {
  const row = await getOne(
    `SELECT * FROM practitioner_domains WHERE practitioner_id = $1`,
    [practitionerId]
  );

  return row ? mapDomainRow(row) : null;
}

export async function savePractitionerDomain(
  practitionerId: string,
  domain: Omit<PractitionerDomain, 'practitionerId'>
): Promise<PractitionerDomain> {
  const existing = await getPractitionerDomain(practitionerId);

  if (existing) {
    await query(
      `UPDATE practitioner_domains SET
        subdomain = $2,
        custom_domain = $3,
        custom_domain_verified = $4,
        custom_domain_ssl = $5,
        dns_records = $6,
        updated_at = NOW()
       WHERE practitioner_id = $1`,
      [
        practitionerId,
        domain.subdomain,
        domain.customDomain,
        domain.customDomainVerified,
        domain.customDomainSsl,
        JSON.stringify(domain.dnsRecords),
      ]
    );
  } else {
    await query(
      `INSERT INTO practitioner_domains
        (practitioner_id, subdomain, custom_domain, custom_domain_verified, custom_domain_ssl, dns_records)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        practitionerId,
        domain.subdomain,
        domain.customDomain,
        domain.customDomainVerified,
        domain.customDomainSsl,
        JSON.stringify(domain.dnsRecords),
      ]
    );
  }

  return { practitionerId, ...domain };
}

// ============== PRACTITIONER FEATURES ==============

export async function getPractitionerFeatures(practitionerId: string): Promise<PractitionerFeatures | null> {
  const row = await getOne(
    `SELECT * FROM practitioner_features WHERE practitioner_id = $1`,
    [practitionerId]
  );

  return row ? mapFeaturesRow(row) : null;
}

export async function getDefaultFeatures(practitionerId: string): Promise<PractitionerFeatures> {
  return {
    practitionerId,
    // Core features (always on)
    birthChart: true,
    transits: true,
    synastry: true,
    aiCompanion: true,
    // Optional features (off by default)
    chineseAstrology: false,
    mayanAstrology: false,
    lifeCycles: false,
    dreamJournal: false,
    sessionNotes: false,
    resourceLibrary: false,
    // Advanced features
    progressedCharts: false,
    solarReturns: false,
    compositeCharts: false,
    horary: false,
    electional: false,
    // Business features
    booking: false,
    payments: false,
    packages: false,
    giftCertificates: false,
    emailSequences: false,
    crm: false,
    // Sovereign-only
    customDomain: false,
    customCss: false,
    whiteLabel: false,
    apiAccess: false,
  };
}

export async function savePractitionerFeatures(
  practitionerId: string,
  features: Omit<PractitionerFeatures, 'practitionerId'>
): Promise<PractitionerFeatures> {
  const existing = await getPractitionerFeatures(practitionerId);

  const columns = Object.keys(features).filter(k => k !== 'practitionerId');
  const values = columns.map(c => (features as Record<string, unknown>)[c]);

  if (existing) {
    const setClause = columns.map((c, i) => `${camelToSnake(c)} = $${i + 2}`).join(', ');
    await query(
      `UPDATE practitioner_features SET ${setClause}, updated_at = NOW() WHERE practitioner_id = $1`,
      [practitionerId, ...values]
    );
  } else {
    const columnNames = columns.map(camelToSnake).join(', ');
    const valuePlaceholders = columns.map((_, i) => `$${i + 2}`).join(', ');
    await query(
      `INSERT INTO practitioner_features (practitioner_id, ${columnNames}) VALUES ($1, ${valuePlaceholders})`,
      [practitionerId, ...values]
    );
  }

  return { practitionerId, ...features };
}

// ============== ONBOARDING ==============

export async function getOnboardingProgress(practitionerId: string): Promise<PractitionerOnboarding | null> {
  const row = await getOne(
    `SELECT * FROM practitioner_onboarding WHERE practitioner_id = $1`,
    [practitionerId]
  );

  return row ? mapOnboardingRow(row) : null;
}

export async function updateOnboardingStep(
  practitionerId: string,
  step: OnboardingStep
): Promise<void> {
  const existing = await getOnboardingProgress(practitionerId);

  if (existing) {
    const completedSteps = existing.completedSteps.includes(step)
      ? existing.completedSteps
      : [...existing.completedSteps, step];

    await query(
      `UPDATE practitioner_onboarding SET
        current_step = $2,
        completed_steps = $3,
        updated_at = NOW()
       WHERE practitioner_id = $1`,
      [practitionerId, step, JSON.stringify(completedSteps)]
    );
  } else {
    await query(
      `INSERT INTO practitioner_onboarding (practitioner_id, current_step, completed_steps, spiral_sessions)
       VALUES ($1, $2, $3, '[]')`,
      [practitionerId, step, JSON.stringify([step])]
    );
  }
}

// ============== CLIENT MANAGEMENT ==============

export async function getClientsByPractitioner(practitionerId: string): Promise<PractitionerClient[]> {
  const rows = await getMany(
    `SELECT * FROM practitioner_clients WHERE practitioner_id = $1 ORDER BY created_at DESC`,
    [practitionerId]
  );

  return rows.map(mapClientRow);
}

export async function getClientById(clientId: string): Promise<PractitionerClient | null> {
  const row = await getOne(
    `SELECT * FROM practitioner_clients WHERE id = $1`,
    [clientId]
  );

  return row ? mapClientRow(row) : null;
}

export async function createClient(
  practitionerId: string,
  data: Pick<PractitionerClient, 'email' | 'name' | 'birthData'>
): Promise<PractitionerClient> {
  const result = await query(
    `INSERT INTO practitioner_clients
      (practitioner_id, email, name, birth_data, status, tier, tags, total_sessions, total_ai_conversations)
     VALUES ($1, $2, $3, $4, 'invited', 'free', '[]', 0, 0)
     RETURNING *`,
    [practitionerId, data.email, data.name, JSON.stringify(data.birthData)]
  );

  return mapClientRow(result.rows[0]);
}

export async function updateClient(
  clientId: string,
  data: Partial<PractitionerClient>
): Promise<PractitionerClient | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.birthData !== undefined) {
    fields.push(`birth_data = $${paramIndex++}`);
    values.push(JSON.stringify(data.birthData));
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.tier !== undefined) {
    fields.push(`tier = $${paramIndex++}`);
    values.push(data.tier);
  }
  if (data.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    values.push(JSON.stringify(data.tags));
  }

  if (fields.length === 0) return getClientById(clientId);

  fields.push(`updated_at = NOW()`);
  values.push(clientId);

  const result = await query(
    `UPDATE practitioner_clients SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ? mapClientRow(result.rows[0]) : null;
}

// ============== REVENUE TRACKING ==============

export async function recordRevenue(
  practitionerId: string,
  data: {
    type: 'session' | 'subscription' | 'package' | 'product' | 'gift';
    amount: number;
    currency: string;
    stripePaymentId: string;
    clientId?: string;
    clientEmail?: string;
  }
): Promise<void> {
  const practitioner = await getPractitionerById(practitionerId);
  if (!practitioner) throw new Error('Practitioner not found');

  const sharePercent = practitioner.revenueSharePercent;
  const platformShare = Math.round(data.amount * (sharePercent / 100));
  const practitionerShare = data.amount - platformShare;

  await query(
    `INSERT INTO revenue_records
      (practitioner_id, type, amount, currency, platform_share, practitioner_share, share_percent, stripe_payment_id, client_id, client_email, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')`,
    [
      practitionerId,
      data.type,
      data.amount,
      data.currency,
      platformShare,
      practitionerShare,
      sharePercent,
      data.stripePaymentId,
      data.clientId,
      data.clientEmail,
    ]
  );
}

export async function getRevenueStats(practitionerId: string): Promise<{
  totalRevenue: number;
  totalPlatformShare: number;
  totalPractitionerShare: number;
  revenueByType: Record<string, number>;
  monthlyRevenue: { month: string; amount: number }[];
}> {
  // Total revenue
  const totalRow = await getOne(
    `SELECT
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM(platform_share), 0) as total_platform_share,
      COALESCE(SUM(practitioner_share), 0) as total_practitioner_share
     FROM revenue_records
     WHERE practitioner_id = $1 AND status = 'completed'`,
    [practitionerId]
  );

  // Revenue by type
  const typeRows = await getMany(
    `SELECT type, SUM(amount) as amount
     FROM revenue_records
     WHERE practitioner_id = $1 AND status = 'completed'
     GROUP BY type`,
    [practitionerId]
  );

  const revenueByType: Record<string, number> = {};
  for (const row of typeRows) {
    revenueByType[row.type] = parseInt(row.amount, 10);
  }

  // Monthly revenue (last 12 months)
  const monthlyRows = await getMany(
    `SELECT
      TO_CHAR(created_at, 'YYYY-MM') as month,
      SUM(amount) as amount
     FROM revenue_records
     WHERE practitioner_id = $1 AND status = 'completed'
       AND created_at >= NOW() - INTERVAL '12 months'
     GROUP BY TO_CHAR(created_at, 'YYYY-MM')
     ORDER BY month`,
    [practitionerId]
  );

  return {
    totalRevenue: parseInt(totalRow?.total_revenue || '0', 10),
    totalPlatformShare: parseInt(totalRow?.total_platform_share || '0', 10),
    totalPractitionerShare: parseInt(totalRow?.total_practitioner_share || '0', 10),
    revenueByType,
    monthlyRevenue: monthlyRows.map(r => ({
      month: r.month,
      amount: parseInt(r.amount, 10),
    })),
  };
}

// ============== HELPER FUNCTIONS ==============

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function mapPractitionerRow(row: Record<string, unknown>): PractitionerProfile {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    email: row.email as string,
    businessName: row.business_name as string | undefined,
    tagline: row.tagline as string | undefined,
    bio: row.bio as string | undefined,
    status: row.status as PractitionerProfile['status'],
    createdAt: new Date(row.created_at as string),
    launchedAt: row.launched_at ? new Date(row.launched_at as string) : undefined,
    stripeAccountId: row.stripe_account_id as string | undefined,
    revenueSharePercent: row.revenue_share_percent as number,
  };
}

function mapAIConfigRow(row: Record<string, unknown>): AICompanionConfig {
  return {
    practitionerId: row.practitioner_id as string,
    name: row.name as string,
    pronouns: row.pronouns as AICompanionConfig['pronouns'],
    voiceStyle: row.voice_style as AICompanionConfig['voiceStyle'],
    tone: typeof row.tone === 'string' ? JSON.parse(row.tone) : row.tone,
    frameworks: typeof row.frameworks === 'string' ? JSON.parse(row.frameworks) : row.frameworks,
    primaryFramework: row.primary_framework as AICompanionConfig['primaryFramework'],
    specialties: typeof row.specialties === 'string' ? JSON.parse(row.specialties) : row.specialties,
    boundaries: typeof row.boundaries === 'string' ? JSON.parse(row.boundaries) : row.boundaries,
    knowledgeBase: typeof row.knowledge_base === 'string' ? JSON.parse(row.knowledge_base) : row.knowledge_base,
    systemPromptTemplate: row.system_prompt_template as string | undefined,
  };
}

function mapThemeRow(row: Record<string, unknown>): PractitionerTheme {
  return {
    practitionerId: row.practitioner_id as string,
    logo: row.logo as string | undefined,
    favicon: row.favicon as string | undefined,
    heroImage: row.hero_image as string | undefined,
    colorPalette: typeof row.color_palette === 'string' ? JSON.parse(row.color_palette) : row.color_palette,
    typography: typeof row.typography === 'string' ? JSON.parse(row.typography) : row.typography,
    vibePreset: row.vibe_preset as PractitionerTheme['vibePreset'] | undefined,
    customCss: row.custom_css as string | undefined,
  };
}

function mapDomainRow(row: Record<string, unknown>): PractitionerDomain {
  return {
    practitionerId: row.practitioner_id as string,
    subdomain: row.subdomain as string,
    customDomain: row.custom_domain as string | undefined,
    customDomainVerified: row.custom_domain_verified as boolean,
    customDomainSsl: row.custom_domain_ssl as boolean,
    dnsRecords: typeof row.dns_records === 'string' ? JSON.parse(row.dns_records) : row.dns_records,
  };
}

function mapFeaturesRow(row: Record<string, unknown>): PractitionerFeatures {
  return {
    practitionerId: row.practitioner_id as string,
    birthChart: row.birth_chart as boolean,
    transits: row.transits as boolean,
    synastry: row.synastry as boolean,
    aiCompanion: row.ai_companion as boolean,
    chineseAstrology: row.chinese_astrology as boolean,
    mayanAstrology: row.mayan_astrology as boolean,
    lifeCycles: row.life_cycles as boolean,
    dreamJournal: row.dream_journal as boolean,
    sessionNotes: row.session_notes as boolean,
    resourceLibrary: row.resource_library as boolean,
    progressedCharts: row.progressed_charts as boolean,
    solarReturns: row.solar_returns as boolean,
    compositeCharts: row.composite_charts as boolean,
    horary: row.horary as boolean,
    electional: row.electional as boolean,
    booking: row.booking as boolean,
    payments: row.payments as boolean,
    packages: row.packages as boolean,
    giftCertificates: row.gift_certificates as boolean,
    emailSequences: row.email_sequences as boolean,
    crm: row.crm as boolean,
    customDomain: row.custom_domain as boolean,
    customCss: row.custom_css as boolean,
    whiteLabel: row.white_label as boolean,
    apiAccess: row.api_access as boolean,
  };
}

function mapOnboardingRow(row: Record<string, unknown>): PractitionerOnboarding {
  return {
    practitionerId: row.practitioner_id as string,
    currentStep: row.current_step as OnboardingStep,
    completedSteps: typeof row.completed_steps === 'string' ? JSON.parse(row.completed_steps) : row.completed_steps,
    spiralSessions: typeof row.spiral_sessions === 'string' ? JSON.parse(row.spiral_sessions) : row.spiral_sessions,
    extractedVoice: row.extracted_voice
      ? (typeof row.extracted_voice === 'string' ? JSON.parse(row.extracted_voice) : row.extracted_voice)
      : undefined,
    extractedFramework: row.extracted_framework
      ? (typeof row.extracted_framework === 'string' ? JSON.parse(row.extracted_framework) : row.extracted_framework)
      : undefined,
    extractedAesthetics: row.extracted_aesthetics
      ? (typeof row.extracted_aesthetics === 'string' ? JSON.parse(row.extracted_aesthetics) : row.extracted_aesthetics)
      : undefined,
  };
}

function mapClientRow(row: Record<string, unknown>): PractitionerClient {
  return {
    id: row.id as string,
    practitionerId: row.practitioner_id as string,
    email: row.email as string,
    name: row.name as string,
    birthData: row.birth_data
      ? (typeof row.birth_data === 'string' ? JSON.parse(row.birth_data) : row.birth_data)
      : undefined,
    status: row.status as PractitionerClient['status'],
    tier: row.tier as PractitionerClient['tier'],
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    firstSessionAt: row.first_session_at ? new Date(row.first_session_at as string) : undefined,
    lastSessionAt: row.last_session_at ? new Date(row.last_session_at as string) : undefined,
    totalSessions: row.total_sessions as number,
    totalAIConversations: row.total_ai_conversations as number,
    stripeCustomerId: row.stripe_customer_id as string | undefined,
    subscriptionId: row.subscription_id as string | undefined,
    subscriptionStatus: row.subscription_status as PractitionerClient['subscriptionStatus'] | undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/**
 * TIER PRICING SERVICE
 *
 * Handles practitioner tier pricing configuration.
 * Each practitioner can set their own pricing for subscriber/vip tiers.
 */

import { query, insertOne, transaction } from '@/lib/db/postgres';
import { v4 as uuid } from 'uuid';

// ================================================
// TYPES
// ================================================

export type ClientTier = 'free' | 'subscriber' | 'vip';
export type BillingInterval = 'monthly' | 'annual';

export interface TierPricing {
  id: string;
  practitioner_id: string;
  tier: 'subscriber' | 'vip';
  monthly_price_cents: number;
  annual_price_cents: number | null;
  name: string | null;
  description: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTierPricingInput {
  tier: 'subscriber' | 'vip';
  monthly_price_cents: number;
  annual_price_cents?: number;
  name?: string;
  description?: string;
  features?: string[];
  is_active?: boolean;
}

export interface UpdateTierPricingInput {
  monthly_price_cents?: number;
  annual_price_cents?: number;
  name?: string;
  description?: string;
  features?: string[];
  is_active?: boolean;
}

export interface PublicTierPricing {
  tier: 'subscriber' | 'vip';
  name: string;
  description: string | null;
  features: string[];
  monthly_price_cents: number;
  annual_price_cents: number | null;
}

// ================================================
// PRICING OPERATIONS
// ================================================

/**
 * Get all tier pricing for a practitioner
 */
export async function getTierPricing(
  practitionerId: string
): Promise<TierPricing[]> {
  const result = await query<TierPricing>(
    `SELECT * FROM practitioner_tier_pricing
     WHERE practitioner_id = $1
     ORDER BY
       CASE tier WHEN 'subscriber' THEN 1 WHEN 'vip' THEN 2 END`,
    [practitionerId]
  );
  return result.rows;
}

/**
 * Get pricing for a specific tier
 */
export async function getTierPricingByTier(
  practitionerId: string,
  tier: 'subscriber' | 'vip'
): Promise<TierPricing | null> {
  const result = await query<TierPricing>(
    `SELECT * FROM practitioner_tier_pricing
     WHERE practitioner_id = $1 AND tier = $2`,
    [practitionerId, tier]
  );
  return result.rows[0] || null;
}

/**
 * Create or update tier pricing (upsert)
 */
export async function saveTierPricing(
  practitionerId: string,
  input: CreateTierPricingInput
): Promise<TierPricing> {
  const existing = await getTierPricingByTier(practitionerId, input.tier);

  if (existing) {
    // Update existing
    return updateTierPricing(practitionerId, input.tier, {
      monthly_price_cents: input.monthly_price_cents,
      annual_price_cents: input.annual_price_cents,
      name: input.name,
      description: input.description,
      features: input.features,
      is_active: input.is_active,
    }) as Promise<TierPricing>;
  }

  // Create new
  const result = await query<TierPricing>(
    `INSERT INTO practitioner_tier_pricing (
      id, practitioner_id, tier, monthly_price_cents, annual_price_cents,
      name, description, features, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      uuid(),
      practitionerId,
      input.tier,
      input.monthly_price_cents,
      input.annual_price_cents || null,
      input.name || getDefaultTierName(input.tier),
      input.description || null,
      JSON.stringify(input.features || getDefaultFeatures(input.tier)),
      input.is_active !== false,
    ]
  );

  return result.rows[0];
}

/**
 * Update tier pricing
 */
export async function updateTierPricing(
  practitionerId: string,
  tier: 'subscriber' | 'vip',
  input: UpdateTierPricingInput
): Promise<TierPricing | null> {
  const updates: string[] = [];
  const values: any[] = [practitionerId, tier];
  let paramIndex = 3;

  const allowedFields = [
    'monthly_price_cents',
    'annual_price_cents',
    'name',
    'description',
    'features',
    'is_active',
  ];

  for (const field of allowedFields) {
    if (field in input && input[field as keyof UpdateTierPricingInput] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      const value = field === 'features'
        ? JSON.stringify(input[field as keyof UpdateTierPricingInput])
        : input[field as keyof UpdateTierPricingInput];
      values.push(value);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return getTierPricingByTier(practitionerId, tier);
  }

  const result = await query<TierPricing>(
    `UPDATE practitioner_tier_pricing
     SET ${updates.join(', ')}
     WHERE practitioner_id = $1 AND tier = $2
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete tier pricing
 */
export async function deleteTierPricing(
  practitionerId: string,
  tier: 'subscriber' | 'vip'
): Promise<boolean> {
  const result = await query(
    `DELETE FROM practitioner_tier_pricing
     WHERE practitioner_id = $1 AND tier = $2`,
    [practitionerId, tier]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get public pricing for a practitioner (by slug)
 * Used for client-facing checkout pages
 */
export async function getPublicTierPricing(
  slug: string
): Promise<PublicTierPricing[]> {
  const result = await query<TierPricing>(
    `SELECT tp.* FROM practitioner_tier_pricing tp
     JOIN practitioners p ON p.id = tp.practitioner_id
     WHERE p.slug = $1 AND tp.is_active = true
     ORDER BY
       CASE tp.tier WHEN 'subscriber' THEN 1 WHEN 'vip' THEN 2 END`,
    [slug]
  );

  return result.rows.map(row => ({
    tier: row.tier,
    name: row.name || getDefaultTierName(row.tier),
    description: row.description,
    features: Array.isArray(row.features) ? row.features : [],
    monthly_price_cents: row.monthly_price_cents,
    annual_price_cents: row.annual_price_cents,
  }));
}

/**
 * Initialize default pricing for a new practitioner
 */
export async function initializeDefaultPricing(
  practitionerId: string
): Promise<TierPricing[]> {
  const defaultPricing: CreateTierPricingInput[] = [
    {
      tier: 'subscriber',
      monthly_price_cents: 1500, // $15/month
      annual_price_cents: 15000, // $150/year (save $30)
      name: 'Subscriber',
      description: 'Access to exclusive content and resources',
      features: [
        'Monthly insights and guidance',
        'Access to resource library',
        'Email support',
      ],
      is_active: false, // Inactive by default until practitioner enables
    },
    {
      tier: 'vip',
      monthly_price_cents: 5000, // $50/month
      annual_price_cents: 50000, // $500/year (save $100)
      name: 'VIP',
      description: 'Premium access with priority support',
      features: [
        'Everything in Subscriber tier',
        'Priority session booking',
        'Direct messaging access',
        'Exclusive VIP content',
      ],
      is_active: false,
    },
  ];

  const results: TierPricing[] = [];
  for (const pricing of defaultPricing) {
    const result = await saveTierPricing(practitionerId, pricing);
    results.push(result);
  }

  return results;
}

// ================================================
// HELPERS
// ================================================

function getDefaultTierName(tier: 'subscriber' | 'vip'): string {
  return tier === 'subscriber' ? 'Subscriber' : 'VIP';
}

function getDefaultFeatures(tier: 'subscriber' | 'vip'): string[] {
  if (tier === 'subscriber') {
    return [
      'Monthly insights',
      'Resource library access',
      'Email support',
    ];
  }
  return [
    'Everything in Subscriber',
    'Priority booking',
    'Direct messaging',
    'VIP content',
  ];
}

// ================================================
// EXPORTS
// ================================================

export const TierPricingService = {
  getTierPricing,
  getTierPricingByTier,
  saveTierPricing,
  updateTierPricing,
  deleteTierPricing,
  getPublicTierPricing,
  initializeDefaultPricing,
};

export default TierPricingService;

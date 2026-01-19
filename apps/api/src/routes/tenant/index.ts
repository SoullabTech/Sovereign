/**
 * Tenant Routes
 *
 * Multi-tenant configuration for building other sites.
 * Enables rapid deployment of new practitioner portals and partner sites.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Site Factory Backbone
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Each tenant (site) gets:
 * - Config: branding, modules enabled, feature flags
 * - Theme: colors, fonts, logo
 * - Content: pages, articles, FAQs
 *
 * New sites become trivial: create tenant config, deploy frontend.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, Errors } from '../../middleware/error.js';
import { query } from '../../db/postgres.js';

const router = Router();

/**
 * Tenant configuration interface
 */
interface TenantConfig {
  slug: string;
  name: string;
  type: 'portal' | 'partner' | 'internal';
  brand: {
    name: string;
    tagline?: string;
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_heading: string;
    font_body: string;
  };
  modules: {
    booking: boolean;
    articles: boolean;
    faq: boolean;
    chat: boolean;
    leadMagnets: boolean;
    store: boolean;
    membership: boolean;
  };
  features: {
    aiChat: boolean;
    voiceMode: boolean;
    journaling: boolean;
    astrology: boolean;
  };
  navigation: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  social: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  meta: {
    created_at: string;
    updated_at: string;
  };
}

/**
 * GET /v1/tenant/:slug/config
 * Get tenant configuration
 */
router.get('/:slug/config', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw Errors.badRequest('Tenant slug required');
  }

  // Try to find practitioner-based tenant
  const result = await query(
    `SELECT
      p.id,
      p.slug,
      p.name,
      p.business_name,
      p.tagline,
      p.social_links,
      p.settings,
      mp.brand_colors
    FROM practitioners p
    LEFT JOIN maia_personas mp ON mp.practitioner_id = p.id
    WHERE p.slug = $1 AND p.status = 'active'`,
    [slug]
  );

  if (result.rows.length === 0) {
    throw Errors.notFound('Tenant');
  }

  const practitioner = result.rows[0];
  const settings = practitioner.settings || {};
  const brandColors = practitioner.brand_colors || {};
  const socialLinks = practitioner.social_links || {};

  const config: TenantConfig = {
    slug: practitioner.slug,
    name: practitioner.business_name || practitioner.name,
    type: 'portal',
    brand: {
      name: practitioner.business_name || practitioner.name,
      tagline: practitioner.tagline || '',
      logo_url: settings.logo_url || null,
      primary_color: brandColors.primary || settings.primary_color || '#1a1a2e',
      secondary_color: brandColors.secondary || settings.secondary_color || '#16213e',
      accent_color: brandColors.accent || settings.accent_color || '#D4AF37',
      font_heading: settings.font_heading || 'Inter',
      font_body: settings.font_body || 'Inter',
    },
    modules: {
      booking: settings.modules?.booking ?? true,
      articles: settings.modules?.articles ?? true,
      faq: settings.modules?.faq ?? true,
      chat: settings.modules?.chat ?? true,
      leadMagnets: settings.modules?.leadMagnets ?? false,
      store: settings.modules?.store ?? false,
      membership: settings.modules?.membership ?? false,
    },
    features: {
      aiChat: settings.features?.aiChat ?? true,
      voiceMode: settings.features?.voiceMode ?? false,
      journaling: settings.features?.journaling ?? false,
      astrology: settings.features?.astrology ?? true,
    },
    navigation: settings.navigation || [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'FAQ', href: '/faq' },
    ],
    social: {
      instagram: socialLinks.instagram || null,
      facebook: socialLinks.facebook || null,
      linkedin: socialLinks.linkedin || null,
      twitter: socialLinks.twitter || null,
      website: socialLinks.website || null,
    },
    meta: {
      created_at: practitioner.created_at || new Date().toISOString(),
      updated_at: practitioner.updated_at || new Date().toISOString(),
    },
  };

  return res.json({
    success: true,
    data: { config }
  });
}));

/**
 * GET /v1/tenant/:slug/theme
 * Get tenant theme/branding
 */
router.get('/:slug/theme', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const result = await query(
    `SELECT
      p.settings,
      mp.brand_colors
    FROM practitioners p
    LEFT JOIN maia_personas mp ON mp.practitioner_id = p.id
    WHERE p.slug = $1 AND p.status = 'active'`,
    [slug]
  );

  if (result.rows.length === 0) {
    throw Errors.notFound('Tenant');
  }

  const practitioner = result.rows[0];
  const settings = practitioner.settings || {};
  const brandColors = practitioner.brand_colors || {};

  const theme = {
    colors: {
      primary: brandColors.primary || settings.primary_color || '#1a1a2e',
      secondary: brandColors.secondary || settings.secondary_color || '#16213e',
      accent: brandColors.accent || settings.accent_color || '#D4AF37',
      background: settings.background_color || '#0a0a0f',
      surface: settings.surface_color || '#1a1a2e',
      text: settings.text_color || '#ffffff',
      textSecondary: settings.text_secondary_color || 'rgba(255, 255, 255, 0.7)',
    },
    fonts: {
      heading: settings.font_heading || 'Inter',
      body: settings.font_body || 'Inter',
    },
    logo: {
      url: settings.logo_url || null,
      alt: settings.logo_alt || '',
    },
    hero: {
      image: settings.hero_image || null,
      overlay: settings.hero_overlay || 'rgba(0, 0, 0, 0.5)',
    },
  };

  return res.json({
    success: true,
    data: { theme }
  });
}));

/**
 * GET /v1/tenant/:slug/content
 * Get tenant content configuration
 */
router.get('/:slug/content', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const result = await query(
    `SELECT
      p.bio,
      p.tagline,
      p.settings,
      p.specialties,
      p.certifications
    FROM practitioners p
    WHERE p.slug = $1 AND p.status = 'active'`,
    [slug]
  );

  if (result.rows.length === 0) {
    throw Errors.notFound('Tenant');
  }

  const practitioner = result.rows[0];
  const settings = practitioner.settings || {};

  const content = {
    about: {
      bio: practitioner.bio || '',
      specialties: practitioner.specialties || [],
      certifications: practitioner.certifications || [],
    },
    hero: {
      headline: settings.hero_headline || '',
      subheadline: settings.hero_subheadline || practitioner.tagline || '',
      cta_text: settings.hero_cta_text || 'Book a Session',
      cta_link: settings.hero_cta_link || '/services',
    },
    footer: {
      text: settings.footer_text || '',
      copyright: settings.copyright || `© ${new Date().getFullYear()}`,
    },
    seo: {
      title: settings.seo_title || '',
      description: settings.seo_description || practitioner.bio?.substring(0, 160) || '',
      keywords: settings.seo_keywords || [],
    },
  };

  return res.json({
    success: true,
    data: { content }
  });
}));

export default router;

/**
 * Portal Config Endpoint
 *
 * Returns practitioner portal configuration including branding, navigation, and social links.
 */

import { Request, Response } from 'express';
import { query } from '../../db/postgres.js';
import { Errors } from '../../middleware/error.js';

export async function getPortalConfig(req: Request, res: Response) {
  const { slug } = req.params;

  if (!slug) {
    throw Errors.badRequest('Portal slug required');
  }

  // Get practitioner profile
  const result = await query(
    `SELECT
      p.id as practitioner_id,
      p.member_id as practitioner_member_id,
      p.name as practitioner_name,
      p.slug,
      p.business_name,
      p.tagline,
      p.bio,
      p.photo_url,
      p.specialties,
      p.certifications,
      p.years_experience,
      p.location,
      p.social_links,
      p.settings,
      mp.name as persona_name,
      mp.voice_style,
      mp.brand_colors
    FROM practitioners p
    LEFT JOIN maia_personas mp ON mp.practitioner_id = p.id
    WHERE p.slug = $1 AND p.status = 'active'`,
    [slug]
  );

  if (result.rows.length === 0) {
    throw Errors.notFound('Portal');
  }

  const practitioner = result.rows[0];
  const settings = practitioner.settings || {};
  const brandColors = practitioner.brand_colors || {};
  const socialLinks = practitioner.social_links || {};

  const config = {
    practitioner_id: practitioner.practitioner_id,
    practitioner_member_id: practitioner.practitioner_member_id,
    practitioner_name: practitioner.practitioner_name,
    slug: practitioner.slug,
    brand: {
      name: practitioner.business_name || practitioner.practitioner_name,
      tagline: practitioner.tagline || '',
      logo_url: settings.logo_url || null,
      primary_color: brandColors.primary || settings.primary_color || '#1a1a2e',
      secondary_color: brandColors.secondary || settings.secondary_color || '#16213e',
      accent_color: brandColors.accent || settings.accent_color || '#D4AF37',
      font_heading: settings.font_heading || 'Inter',
      font_body: settings.font_body || 'Inter',
    },
    navigation: settings.navigation || [],
    social: {
      instagram: socialLinks.instagram || null,
      facebook: socialLinks.facebook || null,
      linkedin: socialLinks.linkedin || null,
      twitter: socialLinks.twitter || null,
      website: socialLinks.website || null,
    },
    footer_text: settings.footer_text || null,
  };

  return res.json({
    success: true,
    data: { config }
  });
}

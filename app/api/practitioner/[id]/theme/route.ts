export const dynamic = 'force-dynamic';

/**
 * Practitioner Theme API
 *
 * GET /api/practitioner/[id]/theme - Get portal theme
 * PUT /api/practitioner/[id]/theme - Update portal theme
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPractitionerById,
  getPractitionerTheme,
  savePractitionerTheme,
} from '@/lib/practitioner/practitionerService';
import type { PractitionerTheme } from '@/lib/practitioner/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Default color palettes for each vibe preset
const VIBE_PRESETS = {
  celestial: {
    primary: '#8B5CF6',
    secondary: '#D946EF',
    background: '#0f0d1a',
    surface: '#1a1625',
    text: '#e8e6f0',
    textSecondary: '#a09cb0',
    accent: '#FBBF24',
    border: '#2d2640',
  },
  mystical: {
    primary: '#7C3AED',
    secondary: '#A855F7',
    background: '#0c0a14',
    surface: '#15121f',
    text: '#e4e0f0',
    textSecondary: '#9590a8',
    accent: '#F59E0B',
    border: '#251f35',
  },
  warm: {
    primary: '#F59E0B',
    secondary: '#FB923C',
    background: '#1a1410',
    surface: '#251f1a',
    text: '#f5f0e8',
    textSecondary: '#b8a896',
    accent: '#FBBF24',
    border: '#3d3428',
  },
  earthy: {
    primary: '#059669',
    secondary: '#10B981',
    background: '#0f1512',
    surface: '#1a201c',
    text: '#e8f0ec',
    textSecondary: '#96b0a4',
    accent: '#A78BFA',
    border: '#2d4038',
  },
  minimal: {
    primary: '#6366F1',
    secondary: '#818CF8',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    accent: '#6366F1',
    border: '#e2e8f0',
  },
  clinical: {
    primary: '#0891B2',
    secondary: '#22D3EE',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    accent: '#0891B2',
    border: '#cbd5e1',
  },
};

// Get portal theme
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify practitioner exists
    const practitioner = await getPractitionerById(id);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const theme = await getPractitionerTheme(id);

    return NextResponse.json({
      theme,
      vibePresets: VIBE_PRESETS,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Get theme error:', error);
    return NextResponse.json(
      { error: 'Failed to get theme' },
      { status: 500 }
    );
  }
}

// Update portal theme
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify practitioner exists
    const practitioner = await getPractitionerById(id);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const {
      logo,
      favicon,
      heroImage,
      colorPalette,
      typography,
      vibePreset,
      customCss,
    } = body;

    // If a vibe preset is specified but no color palette, use the preset colors
    let finalColorPalette = colorPalette;
    if (vibePreset && !colorPalette && VIBE_PRESETS[vibePreset as keyof typeof VIBE_PRESETS]) {
      finalColorPalette = VIBE_PRESETS[vibePreset as keyof typeof VIBE_PRESETS];
    }

    // Build theme object
    const theme: Omit<PractitionerTheme, 'practitionerId'> = {
      logo,
      favicon,
      heroImage,
      colorPalette: finalColorPalette || VIBE_PRESETS.celestial,
      typography: typography || {
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Inter',
        fontSize: 'base',
      },
      vibePreset,
      customCss,
    };

    const savedTheme = await savePractitionerTheme(id, theme);

    return NextResponse.json({
      success: true,
      theme: savedTheme,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Update theme error:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

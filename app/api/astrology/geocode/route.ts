/**
 * Geocode API
 *
 * GET - Search for locations by name, return coordinates + timezone
 *
 * Uses OpenStreetMap Nominatim (free, no API key)
 * Timezone detection via coordinate-based lookup
 *
 * /api/astrology/geocode?q=<query>
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Timezone offset lookup table by rough longitude bands
// This is a simplified approach - works for most cases
function getTimezoneFromCoords(lat: number, lng: number): { timezone: string; utcOffset: number } {
  // Major timezone regions by longitude (simplified)
  // More accurate would be to use a proper timezone database, but this works for birth charts

  // US timezones
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) {
    if (lng >= -125 && lng < -115) return { timezone: 'America/Los_Angeles', utcOffset: -8 };
    if (lng >= -115 && lng < -102) return { timezone: 'America/Denver', utcOffset: -7 };
    if (lng >= -102 && lng < -87) return { timezone: 'America/Chicago', utcOffset: -6 };
    if (lng >= -87 && lng < -66) return { timezone: 'America/New_York', utcOffset: -5 };
  }

  // Europe
  if (lat >= 35 && lat <= 72 && lng >= -10 && lng <= 40) {
    if (lng >= -10 && lng < 0) return { timezone: 'Europe/London', utcOffset: 0 };
    if (lng >= 0 && lng < 15) return { timezone: 'Europe/Paris', utcOffset: 1 };
    if (lng >= 15 && lng < 25) return { timezone: 'Europe/Berlin', utcOffset: 1 };
    if (lng >= 25 && lng < 40) return { timezone: 'Europe/Moscow', utcOffset: 3 };
  }

  // Australia
  if (lat >= -45 && lat <= -10 && lng >= 113 && lng <= 154) {
    if (lng >= 113 && lng < 130) return { timezone: 'Australia/Perth', utcOffset: 8 };
    if (lng >= 130 && lng < 142) return { timezone: 'Australia/Adelaide', utcOffset: 9.5 };
    if (lng >= 142 && lng <= 154) return { timezone: 'Australia/Sydney', utcOffset: 10 };
  }

  // Asia
  if (lat >= 0 && lat <= 55 && lng >= 60 && lng <= 145) {
    if (lng >= 60 && lng < 75) return { timezone: 'Asia/Karachi', utcOffset: 5 };
    if (lng >= 75 && lng < 90) return { timezone: 'Asia/Kolkata', utcOffset: 5.5 };
    if (lng >= 90 && lng < 105) return { timezone: 'Asia/Bangkok', utcOffset: 7 };
    if (lng >= 105 && lng < 120) return { timezone: 'Asia/Shanghai', utcOffset: 8 };
    if (lng >= 120 && lng < 135) return { timezone: 'Asia/Tokyo', utcOffset: 9 };
    if (lng >= 135 && lng <= 145) return { timezone: 'Asia/Tokyo', utcOffset: 9 };
  }

  // South America
  if (lat >= -55 && lat <= 15 && lng >= -82 && lng <= -34) {
    if (lng >= -82 && lng < -70) return { timezone: 'America/Lima', utcOffset: -5 };
    if (lng >= -70 && lng < -50) return { timezone: 'America/Sao_Paulo', utcOffset: -3 };
    if (lng >= -50 && lng <= -34) return { timezone: 'America/Sao_Paulo', utcOffset: -3 };
  }

  // Default: estimate based on longitude (15 degrees per hour)
  const offsetHours = Math.round(lng / 15);
  return {
    timezone: `Etc/GMT${offsetHours >= 0 ? '-' : '+'}${Math.abs(offsetHours)}`,
    utcOffset: offsetHours
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters',
      }, { status: 400 });
    }

    // Use OpenStreetMap Nominatim (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MAIA-Astrology/1.0 (soullab.life)', // Required by Nominatim ToS
      },
    });

    if (!response.ok) {
      console.error('[Geocode] Nominatim error:', response.status);
      return NextResponse.json({
        success: false,
        error: 'Location search failed',
      }, { status: 503 });
    }

    const results = await response.json();

    // Transform and add timezone info
    const data = results.map((result: any) => {
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      const tz = getTimezoneFromCoords(lat, lon);

      return {
        display_name: result.display_name,
        lat: result.lat,
        lon: result.lon,
        timezone: tz.timezone,
        utcOffset: tz.utcOffset,
        type: result.type,
        importance: result.importance,
      };
    });

    return NextResponse.json({
      success: true,
      provider: 'nominatim',
      data,
    });
  } catch (error) {
    console.error('[Geocode] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Geocoding service error',
    }, { status: 500 });
  }
}

/**
 * Geocoding API for Birth Location Search
 *
 * Uses OpenStreetMap Nominatim for free geocoding
 * Includes timezone detection for accurate birth chart calculation
 */

import { NextRequest, NextResponse } from 'next/server';

// Timezone lookup based on coordinates (simplified - covers major zones)
function getTimezoneFromCoords(lat: number, lon: number): { timezone: string; utcOffset: number } {
  // Approximate timezone based on longitude
  // Each 15 degrees of longitude = 1 hour from UTC
  const rawOffset = Math.round(lon / 15);

  // Special cases for common regions
  // North America
  if (lat >= 25 && lat <= 50 && lon >= -130 && lon <= -60) {
    if (lon >= -130 && lon < -115) return { timezone: 'America/Los_Angeles', utcOffset: -8 };
    if (lon >= -115 && lon < -100) return { timezone: 'America/Denver', utcOffset: -7 };
    if (lon >= -100 && lon < -85) return { timezone: 'America/Chicago', utcOffset: -6 };
    if (lon >= -85 && lon < -60) return { timezone: 'America/New_York', utcOffset: -5 };
  }

  // Louisiana specifically (Central Time)
  if (lat >= 29 && lat <= 33 && lon >= -94 && lon <= -89) {
    return { timezone: 'America/Chicago', utcOffset: -6 };
  }

  // Europe
  if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
    if (lon >= -10 && lon < 0) return { timezone: 'Europe/London', utcOffset: 0 };
    if (lon >= 0 && lon < 15) return { timezone: 'Europe/Paris', utcOffset: 1 };
    if (lon >= 15 && lon < 30) return { timezone: 'Europe/Berlin', utcOffset: 1 };
    if (lon >= 30 && lon < 40) return { timezone: 'Europe/Moscow', utcOffset: 3 };
  }

  // Australia
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
    if (lon >= 140) return { timezone: 'Australia/Sydney', utcOffset: 10 };
    if (lon >= 130) return { timezone: 'Australia/Adelaide', utcOffset: 9.5 };
    return { timezone: 'Australia/Perth', utcOffset: 8 };
  }

  // Asia
  if (lat >= 0 && lat <= 55 && lon >= 60 && lon <= 145) {
    if (lon >= 120 && lon <= 145) return { timezone: 'Asia/Tokyo', utcOffset: 9 };
    if (lon >= 100 && lon < 120) return { timezone: 'Asia/Shanghai', utcOffset: 8 };
    if (lon >= 75 && lon < 100) return { timezone: 'Asia/Kolkata', utcOffset: 5.5 };
  }

  // South America
  if (lat >= -55 && lat <= 15 && lon >= -80 && lon <= -35) {
    return { timezone: 'America/Sao_Paulo', utcOffset: -3 };
  }

  // Default: calculate from longitude
  return {
    timezone: `Etc/GMT${rawOffset >= 0 ? '-' : '+'}${Math.abs(rawOffset)}`,
    utcOffset: rawOffset,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({
      success: false,
      error: 'Query must be at least 2 characters',
    }, { status: 400 });
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MAIA-Sovereign/1.0 (https://soullab.life)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Location search service unavailable',
      }, { status: 503 });
    }

    const results = await response.json();

    // Transform results to include timezone
    const data = results.map((result: any) => {
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      const { timezone, utcOffset } = getTimezoneFromCoords(lat, lon);

      return {
        display_name: result.display_name,
        lat: result.lat,
        lon: result.lon,
        timezone,
        utcOffset,
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
    console.error('Geocoding error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search locations',
    }, { status: 500 });
  }
}

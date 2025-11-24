import { NextRequest, NextResponse } from 'next/server';
import { detectTimezone } from '@/lib/astrology/timezoneDetection';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Geocoding API Route
 *
 * Provides location search and geocoding for birth chart calculations
 * Uses multiple fallback strategies for reliability
 * Automatically detects timezone from coordinates
 */

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  timezone?: string;
  utcOffset?: number;
}

/**
 * Geocode using OpenStreetMap Nominatim
 * Free, no API key required, but has rate limits
 */
async function geocodeWithNominatim(query: string): Promise<GeocodingResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SpiralogicOracleSystem/1.0 (https://spiralogic.app)',
      'Accept': 'application/json',
      'Referer': 'https://spiralogic.app',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.statusText}`);
  }

  const results = await response.json();
  return results;
}

/**
 * Fallback geocoding using geocode.maps.co (free, no API key)
 */
async function geocodeWithMapsCo(query: string): Promise<GeocodingResult[]> {
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&limit=8`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Maps.co API error: ${response.statusText}`);
  }

  const results = await response.json();
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter "q" must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    console.log('[Geocoding] Searching for:', query);

    let results: GeocodingResult[] = [];
    let provider = '';

    // Try Nominatim first (most accurate)
    try {
      results = await geocodeWithNominatim(query);
      provider = 'nominatim';
      console.log(`[Geocoding] Nominatim returned ${results.length} results`);
    } catch (nominatimError) {
      console.error('[Geocoding] Nominatim failed:', nominatimError);

      // Fallback to Maps.co
      try {
        results = await geocodeWithMapsCo(query);
        provider = 'maps.co';
        console.log(`[Geocoding] Maps.co returned ${results.length} results`);
      } catch (mapsCoError) {
        console.error('[Geocoding] Maps.co failed:', mapsCoError);

        return NextResponse.json(
          {
            success: false,
            error: 'All geocoding services are currently unavailable. Please try again in a moment.',
          },
          { status: 503 }
        );
      }
    }

    // Format results consistently and add timezone info to first result
    const formattedResults = await Promise.all(
      results.map(async (result, index) => {
        const baseResult = {
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon,
          address: result.address,
        };

        // Only detect timezone for the first result to save API calls
        if (index === 0) {
          try {
            const timezoneInfo = await detectTimezone(
              parseFloat(result.lat),
              parseFloat(result.lon)
            );
            return {
              ...baseResult,
              timezone: timezoneInfo.timezone,
              utcOffset: timezoneInfo.utcOffset,
            };
          } catch (error) {
            console.error('[Geocoding] Timezone detection failed:', error);
            return baseResult;
          }
        }

        return baseResult;
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedResults,
      provider,
    });

  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to geocode location',
      },
      { status: 500 }
    );
  }
}

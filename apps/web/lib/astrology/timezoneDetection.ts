/**
 * Timezone Detection Utilities
 *
 * Converts geographic coordinates to IANA timezone identifiers
 * Essential for accurate birth chart calculations
 */

interface TimezoneResult {
  timezone: string;
  utcOffset: number;
  name: string;
}

/**
 * Get timezone from coordinates using GeoNames API
 * Free tier: 20,000 credits per day with username
 */
async function getTimezoneFromGeoNames(lat: number, lng: number): Promise<TimezoneResult | null> {
  try {
    // Using GeoNames free API - requires username
    const username = 'spiralogic'; // You may want to register your own username at geonames.org
    const url = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${username}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.timezoneId) {
      return {
        timezone: data.timezoneId,
        utcOffset: data.rawOffset || 0,
        name: data.timezoneId,
      };
    }

    return null;
  } catch (error) {
    console.error('GeoNames timezone lookup failed:', error);
    return null;
  }
}

/**
 * Get timezone using TimeZoneDB API
 * Fallback option with free tier
 */
async function getTimezoneFromTimeZoneDB(lat: number, lng: number): Promise<TimezoneResult | null> {
  try {
    // Free API key from timezonedb.com - you may want to get your own
    const apiKey = process.env.NEXT_PUBLIC_TIMEZONEDB_API_KEY || 'demo';
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${lat}&lng=${lng}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.zoneName) {
      return {
        timezone: data.zoneName,
        utcOffset: data.gmtOffset / 3600, // Convert seconds to hours
        name: data.zoneName,
      };
    }

    return null;
  } catch (error) {
    console.error('TimeZoneDB lookup failed:', error);
    return null;
  }
}

/**
 * Simple timezone estimation based on longitude
 * Fallback when APIs are unavailable
 */
function estimateTimezoneFromLongitude(lng: number): TimezoneResult {
  // Very rough estimation: each 15° of longitude ≈ 1 hour
  const utcOffset = Math.round(lng / 15);

  // Common timezone mappings (simplified)
  const timezoneMap: Record<number, string> = {
    '-12': 'Pacific/Kwajalein',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Athens',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Singapore',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Noumea',
    '12': 'Pacific/Auckland',
  };

  const timezone = timezoneMap[utcOffset.toString()] || 'UTC';

  return {
    timezone,
    utcOffset,
    name: timezone,
  };
}

/**
 * Main timezone detection function with multiple fallbacks
 */
export async function detectTimezone(lat: number, lng: number): Promise<TimezoneResult> {
  console.log(`[Timezone] Detecting timezone for coordinates: ${lat}, ${lng}`);

  // Try GeoNames first (most reliable, free)
  const geoNamesResult = await getTimezoneFromGeoNames(lat, lng);
  if (geoNamesResult) {
    console.log(`[Timezone] GeoNames result:`, geoNamesResult);
    return geoNamesResult;
  }

  // Try TimeZoneDB as fallback
  const timeZoneDBResult = await getTimezoneFromTimeZoneDB(lat, lng);
  if (timeZoneDBResult) {
    console.log(`[Timezone] TimeZoneDB result:`, timeZoneDBResult);
    return timeZoneDBResult;
  }

  // Last resort: estimate from longitude
  const estimated = estimateTimezoneFromLongitude(lng);
  console.log(`[Timezone] Using estimated timezone:`, estimated);
  return estimated;
}

/**
 * Format timezone for display
 */
export function formatTimezone(tz: TimezoneResult): string {
  const offset = tz.utcOffset >= 0 ? `+${tz.utcOffset}` : tz.utcOffset;
  return `${tz.timezone} (UTC${offset})`;
}

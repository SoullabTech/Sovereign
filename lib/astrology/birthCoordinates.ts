/**
 * Shared birth-location coordinate normalization for profile reads and hook inputs.
 * Geographic bounds here do not replace stricter astronomical admission policy.
 */
export interface BirthCoordinates {
  lat: number;
  lng: number;
}

// Decimal notation, optionally with an exponent. Hexadecimal and partial parses
// are not coordinates; Number() is used only after the complete string matches.
const DECIMAL_COORDINATE = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

function coordinateNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') return null;

  const text = value.trim();
  if (!text || !DECIMAL_COORDINATE.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/**
 * Normalize the pair together. A missing or invalid value invalidates the pair;
 * failures are never replaced with zero. Numeric zero remains a valid position.
 */
export function normalizeBirthCoordinates(
  lat: unknown,
  lng: unknown,
): BirthCoordinates | null {
  const latitude = coordinateNumber(lat);
  const longitude = coordinateNumber(lng);
  if (latitude === null || longitude === null ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180) {
    return null;
  }
  return { lat: latitude, lng: longitude };
}

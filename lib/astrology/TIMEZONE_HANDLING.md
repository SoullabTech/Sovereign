# Timezone Handling in Ephemeris Calculator

## Critical Requirement

**Birth times must ALWAYS be converted from LOCAL time to UTC before calculation.**

Failing to do this will result in planetary positions being off by several degrees or even completely wrong signs.

## How Timezone Conversion Works

### The Problem
- Users enter birth time in **local time** (e.g., 10:29 PM CST)
- Astronomy calculations require **UTC time**
- Timezone offset must be calculated and applied

### The Solution

1. **Calculate timezone offset from longitude**
   ```typescript
   const timezoneOffsetHours = Math.round(longitude / 15);
   ```

   - Earth rotates 360° in 24 hours = 15°/hour
   - Western longitudes are negative (e.g., Baton Rouge = -91°)
   - Eastern longitudes are positive (e.g., Tokyo = +139°)

2. **Convert local time to UTC**
   ```typescript
   const birthDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
   birthDate.setUTCHours(birthDate.getUTCHours() - timezoneOffsetHours);
   ```

   **Example: Baton Rouge, LA**
   - Longitude: -91.19° W
   - Timezone offset: -91.19 / 15 = -6.08 ≈ -6 hours (CST)
   - Birth time: Dec 9, 1966, 10:29 PM local
   - Convert to UTC: 10:29 PM - (-6h) = 10:29 PM + 6h = 4:29 AM Dec 10, UTC

3. **Use UTC time for all calculations**
   ```typescript
   const time = Astronomy.MakeTime(birthDate);
   ```

## Testing

The file `__tests__/ephemeris.test.ts` contains tests that verify:

1. **Kelly Nezat's Chart (CST timezone)**
   - Verifies correct sign and degree for all planets
   - Checks Ascendant (most sensitive to timezone errors)

2. **Multiple timezones**
   - EST (Eastern US)
   - CST (Central US)
   - UTC (zero offset)
   - JST (Eastern hemisphere, positive longitude)

3. **Edge cases**
   - Birth at midnight
   - Birth near midnight
   - Birth at noon

## Common Pitfalls

### ❌ WRONG: Treating local time as UTC
```typescript
// This ignores timezone - VERY WRONG!
const birthDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
```

Result: Planets will be in wrong positions by ~6 hours worth of movement.

### ✅ CORRECT: Convert local to UTC
```typescript
// Calculate offset and convert
const timezoneOffsetHours = Math.round(longitude / 15);
const birthDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
birthDate.setUTCHours(birthDate.getUTCHours() - timezoneOffsetHours);
```

## Verification Checklist

When making changes to ephemeris calculations:

- [ ] Run test suite: `npm test lib/astrology/__tests__/ephemeris.test.ts`
- [ ] Verify Kelly Nezat's chart against Time Passages data
- [ ] Check that Ascendant matches expected sign/degree
- [ ] Test with at least one chart from Eastern hemisphere
- [ ] Verify midnight births don't crash or give wrong day

## Known Limitations

### Daylight Saving Time (DST)
Current implementation uses longitude-based timezone offset, which doesn't account for DST.

For births during DST periods:
- Standard offset: longitude / 15
- DST offset: (longitude / 15) + 1

**TODO**: Integrate timezone database (e.g., `luxon`, `moment-timezone`) for accurate DST handling.

### Longitude-based approximation
Real timezone boundaries don't perfectly align with 15° meridians.

Examples of edge cases:
- China uses single timezone (UTC+8) across entire country
- Spain and France use CET despite longitude suggesting UTC
- Nepal uses UTC+5:45 (not a whole hour)

For production use, should integrate proper timezone database.

## Resources

- [Astronomy Engine Documentation](https://github.com/cosinekitty/astronomy)
- [Time Passages](https://www.astrograph.com/) - Reference astrology software
- [Astro.com](https://www.astro.com/) - Free chart calculations for verification
- [Swiss Ephemeris](https://www.astro.com/swisseph/) - Professional ephemeris standard

## Contact

If you find timezone-related bugs:
1. Run the test suite
2. Compare with Time Passages or Astro.com
3. Document the discrepancy with exact birth data
4. File an issue with reproduction steps

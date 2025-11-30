# Archived Astrology Services

This directory contains astrology service implementations that were built during development but are not currently active in the Spiralogic system.

## Why Archived

These services represent different approaches and iterations during the development of the astrology engine. They are preserved here for reference and potential future use, but the active system has consolidated around simpler, more focused implementations.

## Files

### `astrologyService.ts`
- **Purpose**: Full-featured astrology service with natal/transit/compatibility readings
- **Status**: Mock/placeholder from early development
- **Why Archived**: Uses simulated calculations instead of real ephemeris. Replaced by `ephemerisCalculator.ts` in the frontend
- **Could Be Useful For**: Reference for API structure, understanding the evolution of the codebase

### `astrologicalService.ts`
- **Purpose**: Comprehensive service with transit tracking, WebSocket updates, periodic ephemeris updates
- **Status**: Advanced features built but not currently integrated
- **Why Archived**: Features like continuous transit tracking, real-time updates, and group astrology analysis are not yet needed
- **Could Be Useful For**: Future activation when MAIA needs real-time transit awareness

### `comprehensiveAstrologicalService.ts`
- **Purpose**: Most comprehensive - includes group astrology, sacred timing, transit events, chart pattern detection
- **Status**: Feature-rich implementation overlapping with `astrologicalService.ts`
- **Why Archived**: Overlaps heavily with other services, features not currently active
- **Could Be Useful For**: Reference for advanced features like grand trines, T-squares, stellium detection, group dynamics

## Active Services

The following services remain active:

- **Frontend**: `lib/astrology/ephemerisCalculator.ts` - Core calculation engine using Astronomy Engine, Porphyry default
- **Backend (dormant)**: `spiralogicAstrologyService.ts` - Swiss Ephemeris integration for PDF report generation
- **Backend (dormant)**: `maiaAstrologicalIntelligence.ts` - MAIA integration for archetypal wisdom
- **Backend (optional)**: `astroOracleService.ts` - Oracle/divination readings with astrological archetypes

## Philosophy

These archives are **traces of life, not clutter**. They show the breathing, iterative process of building the system. They may be reactivated when their time comes, or they may simply stand as witnesses to the journey.

The current approach: **Porphyry houses, precise calculations, background support for MAIA, visible only when it serves clarity.**

---

*Archived: January 2025*

/**
 * Dev check: chartSummaryText whole-chart shape lines vs the two hand-verified
 * charts (portraits/nathan.ts, portraits/andrea.ts — both verified against
 * Astrograph natal reports). Run: npx tsx scripts/dev-portrait-shape-check.ts
 *
 * Expected (from the portrait files' documented signatures):
 *   Nathan  — funnel focal Saturn in Aries (12th) · leading Pluto in Virgo (5th)
 *             Air 5 (Moon, Venus, Mars, Jupiter, Uranus) · Cardinal 6
 *   Andrea  — funnel focal Saturn in Taurus · 8th-house gathering of 4
 *             (Moon, Uranus, Jupiter, Pluto) · Neptune conjunct the Midheaven
 */
import { calculateBirthChart } from '../lib/astrology/ephemerisCalculator';
import { chartSummaryText } from '../lib/soulPortrait/generator/portraitPrompt';

async function main() {
  const nathan = await calculateBirthChart({
    date: '1968-12-23',
    time: '14:00',
    location: { lat: 39.9526, lng: -75.1652, timezone: 'America/New_York' },
  });
  console.log('── NATHAN ──────────────────────────────');
  console.log(chartSummaryText(nathan));

  const andrea = await calculateBirthChart({
    date: '1969-12-31',
    time: '09:06',
    location: { lat: 42.3601, lng: -71.0589, timezone: 'America/New_York' },
  });
  console.log('\n── ANDREA ──────────────────────────────');
  console.log(chartSummaryText(andrea));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

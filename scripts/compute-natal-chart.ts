/**
 * Compute and persist a member's natal chart.
 *
 * Reads birth_* fields from members, runs them through the canonical
 * ephemeris engine, writes the result to members.natal_chart_json +
 * members.natal_chart_computed_at.
 *
 * Run: npx tsx scripts/compute-natal-chart.ts <member-uuid>
 * Example: npx tsx scripts/compute-natal-chart.ts ce284751-e457-42f6-89b6-bc07d0876682
 */

import { query } from "@/lib/db/postgres";
import { calculateBirthChart } from "@/lib/astrology/ephemerisCalculator";

interface BirthRow {
  birth_date: Date | string | null;
  birth_time: string | null;
  birth_location_name: string | null;
  birth_location_lat: string | number | null;
  birth_location_lng: string | number | null;
  birth_timezone: string | null;
}

function fmtDate(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 10);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  const memberId = process.argv[2];
  if (!memberId) {
    console.error("Usage: npx tsx scripts/compute-natal-chart.ts <member-uuid>");
    process.exit(1);
  }

  const res = await query<BirthRow>(
    `SELECT birth_date, birth_time, birth_location_name,
            birth_location_lat, birth_location_lng, birth_timezone
       FROM members
      WHERE id = $1::uuid`,
    [memberId],
  );

  if (res.rows.length === 0) {
    console.error(`No member found for id ${memberId}`);
    process.exit(2);
  }

  const r = res.rows[0];
  if (!r.birth_date || !r.birth_time || r.birth_location_lat == null || r.birth_location_lng == null) {
    console.error("Member is missing one or more birth_* fields:", r);
    process.exit(3);
  }

  const birthData = {
    date: fmtDate(r.birth_date),
    time: String(r.birth_time).slice(0, 5),
    location: {
      lat: Number(r.birth_location_lat),
      lng: Number(r.birth_location_lng),
      timezone: r.birth_timezone || "UTC",
    },
  };

  console.log("Computing chart for:", memberId);
  console.log("Input:", birthData);

  const chart = await calculateBirthChart(birthData);

  await query(
    `UPDATE members
        SET natal_chart_json = $1::jsonb,
            natal_chart_computed_at = NOW()
      WHERE id = $2::uuid`,
    [JSON.stringify(chart), memberId],
  );

  console.log("\nChart computed and stored.");
  console.log("Sun:       ", chart.sun?.sign, chart.sun?.degree?.toFixed(2) + "°", "House", chart.sun?.house);
  console.log("Moon:      ", chart.moon?.sign, chart.moon?.degree?.toFixed(2) + "°", "House", chart.moon?.house);
  console.log("Ascendant: ", chart.ascendant?.sign, chart.ascendant?.degree?.toFixed(2) + "°");
  console.log("Chiron:    ", chart.chiron?.sign, chart.chiron?.degree?.toFixed(2) + "°", "House", chart.chiron?.house);
  console.log("Saturn:    ", chart.saturn?.sign, chart.saturn?.degree?.toFixed(2) + "°", "House", chart.saturn?.house);
  console.log("Top-level keys:", Object.keys(chart).join(", "));
  process.exit(0);
}

main().catch((err) => {
  console.error("Compute failed:", err);
  process.exit(99);
});

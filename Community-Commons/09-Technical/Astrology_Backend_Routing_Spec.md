# Astrology Backend Routing Spec

## Overview

This spec defines how MAIA detects, parses, routes, and responds to astrology-related inputs.

---

## A) Intake Types to Detect

MAIA should recognize four input types:

### 1. Birth Data
Contains date/time/location for chart calculation.

### 2. Placements List
Explicit planetary positions.

### 3. Chart Dump
Multi-line tables, aspect grids from astrology software.

### 4. Timing Data
Transits, progressions, returns.

---

## B) Zod Schema (Production-Ready)

```typescript
// file: src/lib/astrology/astrologyIntakeSchema.ts

import { z } from "zod";

/**
 * Notes:
 * - Keep this schema permissive: members paste partial data.
 * - Normalize later (e.g., "Scorpio 18°" -> sign="Scorpio", degree=18).
 */

export const houseSystemEnum = z.enum([
  "whole_sign",
  "placidus",
  "porphyry",
  "equal",
  "koch",
  "campanus",
  "regiomontanus",
  "topocentric",
]);

export const lensEnum = z.enum([
  "developmental",
  "mythic",
  "timing",
  "integration",
  "spiralogic",
]);

export const aspectTypeEnum = z.enum([
  "conjunction",
  "opposition",
  "trine",
  "square",
  "sextile",
  "quincunx",
  "semisextile",
  "semisquare",
  "sesquisquare",
  "quintile",
  "biquintile",
  "novile",
  "parallel",
  "contraparallel",
  "other",
]);

export const bodyEnum = z.enum([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Chiron",
  "North Node",
  "South Node",
  "ASC",
  "MC",
  "IC",
  "DSC",
]);

export const signEnum = z.enum([
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
]);

export const placementSchema = z.object({
  body: bodyEnum,
  // Allow either structured sign/degree or raw "pos" string from chart dumps.
  sign: signEnum.optional(),
  degree: z.number().min(0).max(29.9999).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  second: z.number().int().min(0).max(59).optional(),
  house: z.number().int().min(1).max(12).optional(),
  retrograde: z.boolean().optional(),
  pos: z.string().min(1).optional(), // e.g., "Scorpio 18°23'"
});

export const aspectSchema = z.object({
  a: bodyEnum,
  b: bodyEnum,
  type: aspectTypeEnum,
  orbDeg: z.number().min(0).max(12).optional(), // keep permissive
  note: z.string().optional(),
});

export const birthDataSchema = z.object({
  date: z.string().min(4), // "YYYY-MM-DD" preferred, but allow loose
  time: z.string().optional(), // "HH:MM" (24h) preferred
  location: z.string().optional(), // "City, State, Country"
  timezone: z.string().optional(), // IANA if known
});

export const timingTransitSchema = z.object({
  transitingBody: bodyEnum,
  toNatalBody: bodyEnum,
  type: aspectTypeEnum,
  orbDeg: z.number().min(0).max(12).optional(),
  exactDate: z.string().optional(), // "YYYY-MM-DD"
  note: z.string().optional(),
});

export const timingSchema = z.object({
  transits: z.array(timingTransitSchema).default([]),
  rangeStart: z.string().optional(),
  rangeEnd: z.string().optional(),
});

export const astrologyIntakeSchema = z.object({
  version: z.string().default("1.0"),
  lens: z.union([lensEnum, z.array(lensEnum)]).optional(),
  houseSystem: houseSystemEnum.optional().default("whole_sign"),

  // Accept either birth data OR a pre-parsed chart OR raw text.
  birth: birthDataSchema.optional(),

  natal: z
    .object({
      placements: z.array(placementSchema).default([]),
      aspects: z.array(aspectSchema).default([]),
      notes: z.string().optional(),
    })
    .optional(),

  timing: timingSchema.optional(),

  // Raw paste support (chart dump, notes, etc.)
  rawText: z.string().optional(),

  // The user's intent/question is what routes the lens.
  question: z.string().min(3),

  // Optional metadata
  meta: z
    .object({
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      source: z.enum(["member_paste", "chart_dump", "api", "other"]).optional(),
    })
    .optional(),
});

export type AstrologyIntake = z.infer<typeof astrologyIntakeSchema>;
```

---

## C) Parser Function

```typescript
// file: src/lib/astrology/parseAstrologyIntake.ts

import { astrologyIntakeSchema, type AstrologyIntake } from "./astrologyIntakeSchema";

/**
 * Parse & validate incoming payload.
 * - Accepts either a structured object or a plain text paste.
 * - Always returns a valid AstrologyIntake object.
 */
export function parseAstrologyIntake(input: unknown): AstrologyIntake {
  // If user sends plain string, wrap it.
  if (typeof input === "string") {
    return astrologyIntakeSchema.parse({
      rawText: input,
      question: "Interpret this chart/paste through the best lens for growth.",
      meta: { source: "member_paste" },
    });
  }

  // If object already, validate.
  return astrologyIntakeSchema.parse(input);
}
```

---

## D) Lens Selection Logic

```typescript
// file: src/lib/astrology/pickLenses.ts

import type { AstrologyIntake } from "./astrologyIntakeSchema";

type Lens = "developmental" | "mythic" | "timing" | "integration" | "spiralogic";

const KEYWORDS: Record<Lens, string[]> = {
  developmental: ["pattern", "stuck", "shadow", "heal", "trauma", "lesson", "growth", "mature", "attachment"],
  mythic: ["meaning", "purpose", "calling", "soul", "initiation", "archetype", "destiny", "myth"],
  timing: ["when", "next", "coming", "this year", "transit", "progression", "return", "retrograde", "date"],
  integration: ["what do i do", "how do i", "practice", "steps", "ground", "nervous system", "help me", "plan"],
  spiralogic: ["element", "facet", "phase", "alchemy", "coherence", "spiralogic", "fire", "water", "earth", "air", "aether"],
};

function normalize(s: string) {
  return s.toLowerCase();
}

/**
 * Lens selection rules:
 * - If user explicitly chose lens: respect it.
 * - Else default: developmental + integration
 * - Add timing if timing data exists OR question asks for timing.
 * - Add spiralogic if user signals it.
 */
export function pickLenses(intake: AstrologyIntake): Lens[] {
  const explicit = intake.lens
    ? Array.isArray(intake.lens)
      ? intake.lens
      : [intake.lens]
    : null;

  if (explicit?.length) return explicit as Lens[];

  const q = normalize(intake.question || "");
  const raw = normalize(intake.rawText || "");
  const blob = `${q}\n${raw}`;

  const hits = (lens: Lens) => KEYWORDS[lens].some((k) => blob.includes(k));

  const lenses: Lens[] = ["developmental", "integration"];

  if (intake.timing?.transits?.length || hits("timing")) lenses.push("timing");
  if (hits("mythic")) lenses.push("mythic");
  if (hits("spiralogic")) lenses.push("spiralogic");

  // de-dupe while preserving order
  return Array.from(new Set(lenses));
}
```

---

## E) Output Composer Rules

### Always Return (Core Response)

1. **Core Pattern** (1-2 paragraphs)
   - The essential signature of the chart
   - What's structurally true regardless of lens

2. **Current Activation** (if timing data exists)
   - What transits/progressions are live
   - What they're activating in the natal chart

3. **Integration Path** (3-7 bullets)
   - Practical next steps
   - What to do this week/month

### Lens-Specific Additions

**When Developmental lens active:**
- Maturation Tasks
- Shadow patterns to integrate
- Growth edge to lean into

**When Mythic lens active:**
- Archetypal Story (which gods are active)
- Symbolic Practice (ritual aligned with the myth)

**When Timing lens active:**
- Timing Windows table
- Pacing Guidance (what to do now vs. later)

**When Integration lens active:**
- Somatic Support
- Journaling Prompts
- This Week's Move

**When Spiralogic lens active:**
- Elemental Balance table
- Facet Phase
- Coherence Practice

---

## F) Compare House Systems Behavior

When `compareHouseSystems: true`:

1. Run interpretation twice (Whole Sign + Placidus)
2. Output: What stays the same, What shifts, Recommendation

---

## G) Frontend JSON Example (Optional)

Members can optionally paste structured JSON:

```json
{
  "houseSystem": "whole_sign",
  "question": "What is being initiated in me right now and how do I cooperate with it?",
  "natal": {
    "placements": [
      {"body":"Sun","pos":"Scorpio 18°"},
      {"body":"Moon","pos":"Aquarius 5°"},
      {"body":"Saturn","pos":"Capricorn 12°","house":1}
    ],
    "aspects": [
      {"a":"Moon","b":"Pluto","type":"square","orbDeg":1.0}
    ]
  },
  "timing": {
    "transits": [
      {"transitingBody":"Pluto","toNatalBody":"Sun","type":"conjunction","orbDeg":0.5}
    ]
  }
}
```

---

## H) API Endpoint Structure

```typescript
// POST /api/astrology/reading
interface AstrologyReadingRequest {
  input: string | object;     // Raw text OR structured object
  lens?: string | string[];   // Optional lens override
  houseSystem?: string;       // Optional house system
  depth?: string;             // short | medium | deep
  compareHouseSystems?: boolean;
  memberId?: string;          // For personalization
}

interface AstrologyReadingResponse {
  success: boolean;
  intake: AstrologyIntake;    // Parsed/normalized input
  lensesApplied: string[];    // Which lenses were used
  reading: {
    corePattern: string;
    currentActivation?: string;
    integrationPath: string[];
    sections: Record<string, string>;  // Lens-specific sections
  };
  metadata: {
    houseSystem: string;
    processingTime: number;
    chartCalculated: boolean;
  };
}
```

---

## I) API Handler Skeleton

```typescript
// file: app/api/astrology/reading/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parseAstrologyIntake } from '@/lib/astrology/parseAstrologyIntake';
import { pickLenses } from '@/lib/astrology/pickLenses';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Parse input (accepts plain text or JSON)
    const intake = parseAstrologyIntake(body.input ?? body);

    // 2. Pick lenses based on question + data
    const lenses = pickLenses(intake);

    // 3. Build chart if birth data provided (use astronomy-engine)
    // const chart = intake.birth ? calculateChart(intake.birth) : null;

    // 4. Generate reading through MAIA with lens context
    // const reading = await generateAstrologyReading(intake, lenses);

    // 5. Return response
    return NextResponse.json({
      success: true,
      intake,
      lensesApplied: lenses,
      reading: {
        corePattern: "...",
        integrationPath: [],
        sections: {},
      },
      metadata: {
        houseSystem: intake.houseSystem,
        processingTime: 0,
        chartCalculated: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 }
    );
  }
}
```

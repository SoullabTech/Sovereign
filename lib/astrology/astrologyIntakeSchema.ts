import { z } from "zod";

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
  orbDeg: z.number().min(0).max(12).optional(),
  note: z.string().optional(),
});

export const birthDataSchema = z.object({
  date: z.string().min(4), // "YYYY-MM-DD" preferred; allow loose
  time: z.string().optional(), // "HH:MM"
  location: z.string().optional(),
  timezone: z.string().optional(), // IANA if known
});

export const timingTransitSchema = z.object({
  transitingBody: bodyEnum,
  toNatalBody: bodyEnum,
  type: aspectTypeEnum,
  orbDeg: z.number().min(0).max(12).optional(),
  exactDate: z.string().optional(),
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

  birth: birthDataSchema.optional(),

  natal: z
    .object({
      placements: z.array(placementSchema).default([]),
      aspects: z.array(aspectSchema).default([]),
      notes: z.string().optional(),
    })
    .optional(),

  timing: timingSchema.optional(),

  rawText: z.string().optional(),

  question: z.string().min(3),

  meta: z
    .object({
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      source: z.enum(["member_paste", "chart_dump", "api", "other"]).optional(),
    })
    .optional(),
});

export type AstrologyIntake = z.infer<typeof astrologyIntakeSchema>;

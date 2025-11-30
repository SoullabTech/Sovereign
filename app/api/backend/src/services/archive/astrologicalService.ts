import {
  AstrologicalHoloflower,
  Planet,
  ZodiacSign,
  PlanetaryTransit,
  NatalPlacement,
} from "../core/AstrologicalHoloflower";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";
import { GenerateReportFlow } from "../flows/generateReportFlow";
import {
  SpiralogicReportInput,
  SpiralogicReportOutput,
  ArchetypalElement,
} from "../types/oracle";
import { logger } from "../lib/logger";

interface EphemerisData {
  date: Date;
  planets: Map<
    Planet,
    { sign: ZodiacSign; degree: number; retrograde: boolean }
  >;
}

interface UserAstrologicalData {
  userId: string;
  birthData?: {
    date: Date;
    time: string;
    location: { lat: number; lng: number };
  };
  natalChart?: any;
  currentTransits: PlanetaryTransit[];
  lastUpdate: Date;
}

export class AstrologicalService {
  private userAstroData: Map<string, UserAstrologicalData> = new Map();
  private currentEphemeris: EphemerisData | null = null;
  private ephemerisUpdateInterval: NodeJS.Timer | null = null;

  constructor() {
    this.startEphemerisUpdates();
  }

  // Start periodic ephemeris updates
  private startEphemerisUpdates() {
    // Update immediately
    this.updateCurrentEphemeris();

    // Then update every hour
    this.ephemerisUpdateInterval = setInterval(() => {
      this.updateCurrentEphemeris();
    }, 3600000); // 1 hour
  }

  // Update current planetary positions
  private async updateCurrentEphemeris() {
    try {
      // In production, this would call a real ephemeris API
      // For now, we'll use calculated positions
      const now = new Date();
      const positions = this.calculateCurrentPositions(now);

      this.currentEphemeris = {
        date: now,
        planets: positions,
      };

      // Update all active user holoflowers
      await this.updateAllUserTransits();
    } catch (error) {
      console.error("Error updating ephemeris:", error);
    }
  }

  // Calculate current planetary positions (simplified)
  private calculateCurrentPositions(
    date: Date,
  ): Map<Planet, { sign: ZodiacSign; degree: number; retrograde: boolean }> {
    const positions = new Map<
      Planet,
      { sign: ZodiacSign; degree: number; retrograde: boolean }
    >();

    // Simplified calculations - in production would use Swiss Ephemeris or similar
    const dayOfYear = this.getDayOfYear(date);
    const year = date.getFullYear();

    // Sun position (approximately 1 degree per day)
    const sunDegree = (dayOfYear - 80) % 360; // Spring equinox around day 80
    positions.set("sun", {
      sign: this.getSignFromDegree(sunDegree),
      degree: sunDegree % 30,
      retrograde: false,
    });

    // Moon position (approximately 13 degrees per day)
    const moonDegree = (dayOfYear * 13.176) % 360;
    positions.set("moon", {
      sign: this.getSignFromDegree(moonDegree),
      degree: moonDegree % 30,
      retrograde: false,
    });

    // Mercury (approximately 4 degrees per day when direct)
    const mercuryDegree = (dayOfYear * 4.09) % 360;
    positions.set("mercury", {
      sign: this.getSignFromDegree(mercuryDegree),
      degree: mercuryDegree % 30,
      retrograde: this.isMercuryRetrograde(date),
    });

    // Venus (approximately 1.6 degrees per day)
    const venusDegree = (dayOfYear * 1.6) % 360;
    positions.set("venus", {
      sign: this.getSignFromDegree(venusDegree),
      degree: venusDegree % 30,
      retrograde: false,
    });

    // Mars (approximately 0.5 degrees per day)
    const marsDegree = (dayOfYear * 0.524) % 360;
    positions.set("mars", {
      sign: this.getSignFromDegree(marsDegree),
      degree: marsDegree % 30,
      retrograde: false,
    });

    // Jupiter (approximately 0.083 degrees per day - 12 year cycle)
    const jupiterDegree = ((year - 2020) * 30 + dayOfYear * 0.083) % 360;
    positions.set("jupiter", {
      sign: this.getSignFromDegree(jupiterDegree),
      degree: jupiterDegree % 30,
      retrograde: false,
    });

    // Saturn (approximately 0.033 degrees per day - 29.5 year cycle)
    const saturnDegree = ((year - 2020) * 12.2 + dayOfYear * 0.033) % 360;
    positions.set("saturn", {
      sign: this.getSignFromDegree(saturnDegree),
      degree: saturnDegree % 30,
      retrograde: false,
    });

    // Outer planets move very slowly
    positions.set("uranus", {
      sign: "taurus",
      degree: 15 + (year - 2020) * 4.3,
      retrograde: false,
    });

    positions.set("neptune", {
      sign: "pisces",
      degree: 25 + (year - 2020) * 2.1,
      retrograde: false,
    });

    positions.set("pluto", {
      sign: "aquarius",
      degree: 0 + (year - 2024) * 1.5,
      retrograde: false,
    });

    return positions;
  }

  // Get day of year
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Get zodiac sign from absolute degree
  private getSignFromDegree(degree: number): ZodiacSign {
    const signs: ZodiacSign[] = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ];
    const index = Math.floor((degree % 360) / 30);
    return signs[index];
  }

  // Check if Mercury is retrograde (simplified)
  private isMercuryRetrograde(date: Date): boolean {
    // Mercury retrograde approximately 3 times per year for 3 weeks each
    const dayOfYear = this.getDayOfYear(date);
    const retroPeriods = [
      { start: 14, end: 35 }, // Mid-Jan to early Feb
      { start: 134, end: 155 }, // Mid-May to early June
      { start: 254, end: 275 }, // Mid-Sept to early Oct
    ];

    return retroPeriods.some(
      (period) => dayOfYear >= period.start && dayOfYear <= period.end,
    );
  }

  // Update all user transits
  private async updateAllUserTransits() {
    if (!this.currentEphemeris) return;

    for (const [userId, userData] of this.userAstroData) {
      await this.updateUserTransits(userId);
    }
  }

  // Set user birth data and calculate natal chart
  public async setUserBirthData(
    userId: string,
    birthData: {
      date: Date;
      time: string;
      location: { lat: number; lng: number };
    },
  ) {
    try {
      // Save birth data
      await supabase.from("user_birth_data").upsert({
        user_id: userId,
        birth_date: birthData.date.toISOString(),
        birth_time: birthData.time,
        birth_lat: birthData.location.lat,
        birth_lng: birthData.location.lng,
        updated_at: new Date().toISOString(),
      });

      // Calculate natal chart (simplified)
      const natalChart = await this.calculateNatalChart(birthData);

      // Store in memory
      this.userAstroData.set(userId, {
        userId,
        birthData,
        natalChart,
        currentTransits: [],
        lastUpdate: new Date(),
      });

      // Update user's holoflower with natal data
      return natalChart;
    } catch (error) {
      console.error("Error setting birth data:", error);
      throw error;
    }
  }

  // Calculate natal chart (simplified)
  private async calculateNatalChart(birthData: {
    date: Date;
    time: string;
    location: { lat: number; lng: number };
  }) {
    // In production, this would use a proper astrology calculation library
    // For now, we'll create a simplified natal chart

    const natalPlanets = new Map<Planet, NatalPlacement>();

    // Example natal placements (would be calculated based on birth data)
    natalPlanets.set("sun", {
      planet: "sun",
      sign: "leo",
      degree: 15,
      retrograde: false,
      strength: 0.9,
      interpretation: "Strong sense of self and creative expression",
    });

    natalPlanets.set("moon", {
      planet: "moon",
      sign: "cancer",
      degree: 22,
      retrograde: false,
      strength: 0.95,
      interpretation: "Deep emotional intelligence and nurturing nature",
    });

    natalPlanets.set("mercury", {
      planet: "mercury",
      sign: "virgo",
      degree: 8,
      retrograde: false,
      strength: 0.85,
      interpretation: "Analytical mind with attention to detail",
    });

    // Calculate ascendant and midheaven based on birth time and location
    const ascendant = this.calculateAscendant(birthData);
    const midheaven = this.calculateMidheaven(birthData);

    return {
      birthData,
      ascendant,
      midheaven,
      planets: natalPlanets,
      houses: this.calculateHouseCusps(ascendant),
    };
  }

  // Calculate ascendant (simplified)
  private calculateAscendant(birthData: any): ZodiacSign {
    // Simplified calculation based on birth time
    const hour = parseInt(birthData.time.split(":")[0]);
    const signs: ZodiacSign[] = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ];
    return signs[Math.floor(hour / 2) % 12];
  }

  // Calculate midheaven (simplified)
  private calculateMidheaven(birthData: any): ZodiacSign {
    // Simplified - would use actual calculations
    const ascIndex = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ].indexOf(this.calculateAscendant(birthData));
    const signs: ZodiacSign[] = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ];
    return signs[(ascIndex + 9) % 12]; // MC is roughly 9 signs from ASC
  }

  // Calculate house cusps
  private calculateHouseCusps(ascendant: ZodiacSign): number[] {
    // Simplified equal house system
    const ascIndex = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ].indexOf(ascendant);
    const cusps: number[] = [];

    for (let i = 0; i < 12; i++) {
      cusps.push((ascIndex * 30 + i * 30) % 360);
    }

    return cusps;
  }

  // Get user's current astrological state
  public async getUserAstrologicalState(userId: string) {
    let userData = this.userAstroData.get(userId);

    if (!userData) {
      // Load from database
      const { data: birthData } = await supabase
        .from("user_birth_data")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (birthData) {
        userData = {
          userId,
          birthData: {
            date: new Date(birthData.birth_date),
            time: birthData.birth_time,
            location: { lat: birthData.birth_lat, lng: birthData.birth_lng },
          },
          currentTransits: [],
          lastUpdate: new Date(),
        };

        // Calculate natal chart
        userData.natalChart = await this.calculateNatalChart(
          userData.birthData,
        );
        this.userAstroData.set(userId, userData);
      }
    }

    // Update current transits
    if (userData) {
      await this.updateUserTransits(userId);
    }

    return userData;
  }

  // Update user's current transits
  private async updateUserTransits(userId: string) {
    const userData = this.userAstroData.get(userId);
    if (!userData || !this.currentEphemeris) return;

    const transits: PlanetaryTransit[] = [];

    // Calculate which houses are being transited
    this.currentEphemeris.planets.forEach((position, planet) => {
      const houseNumber = this.getTransitedHouse(position, userData.natalChart);

      if (houseNumber) {
        transits.push({
          planet,
          sign: position.sign,
          degree: position.degree,
          retrograde: position.retrograde,
          orb: 0, // Would calculate actual orb
          influence: this.getTransitInterpretation(planet, houseNumber),
          startDate: new Date(), // Would calculate actual dates
          exactDate: new Date(),
          endDate: new Date(),
        });
      }
    });

    userData.currentTransits = transits;
    userData.lastUpdate = new Date();

    // Save to database
    await supabase.from("user_transits").upsert({
      user_id: userId,
      transits,
      updated_at: new Date().toISOString(),
    });
  }

  // Get which house is being transited
  private getTransitedHouse(
    position: { sign: ZodiacSign; degree: number },
    natalChart: any,
  ): number | null {
    if (!natalChart || !natalChart.houses) return null;

    const absoluteDegree = this.getAbsoluteDegree(
      position.sign,
      position.degree,
    );

    for (let i = 0; i < 12; i++) {
      const houseCusp = natalChart.houses[i];
      const nextCusp = natalChart.houses[(i + 1) % 12];

      if (this.isDegreeInHouse(absoluteDegree, houseCusp, nextCusp)) {
        return i + 1;
      }
    }

    return null;
  }

  // Check if degree is in house
  private isDegreeInHouse(
    degree: number,
    cuspStart: number,
    cuspEnd: number,
  ): boolean {
    if (cuspEnd < cuspStart) {
      // House crosses 0 degrees
      return degree >= cuspStart || degree < cuspEnd;
    }
    return degree >= cuspStart && degree < cuspEnd;
  }

  // Get absolute degree from sign and degree
  private getAbsoluteDegree(sign: ZodiacSign, degree: number): number {
    const signs: ZodiacSign[] = [
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ];
    const signIndex = signs.indexOf(sign);
    return signIndex * 30 + degree;
  }

  // Get transit interpretation
  private getTransitInterpretation(
    planet: Planet,
    houseNumber: number,
  ): string {
    const interpretations: Record<Planet, Record<number, string>> = {
      sun: {
        1: "Time to shine and express your authentic self",
        2: "Focus on building resources and self-worth",
        3: "Communication and learning are highlighted",
        4: "Attention turns to home and emotional foundations",
        5: "Creative self-expression and joy are emphasized",
        6: "Health and daily routines need attention",
        7: "Relationships come into focus",
        8: "Deep transformation and shared resources",
        9: "Expanding horizons through learning and travel",
        10: "Career and public life are illuminated",
        11: "Social connections and future visions",
        12: "Spiritual reflection and inner work",
      },
      moon: {
        1: "Emotional awareness of self",
        2: "Feelings about security and values",
        3: "Emotional communication",
        4: "Deep feelings about home and family",
        5: "Emotional creativity and play",
        6: "Feelings about health and service",
        7: "Emotional needs in relationships",
        8: "Deep emotional transformation",
        9: "Emotional expansion and belief",
        10: "Public emotional expression",
        11: "Emotional connections with groups",
        12: "Hidden emotions surface",
      },
      // ... other planets
    };

    return (
      interpretations[planet]?.[houseNumber] ||
      `${planet} activating house ${houseNumber}`
    );
  }

  // Get current lunar phase
  public getCurrentLunarPhase(): { phase: string; percentage: number } {
    const synodicMonth = 29.53059;
    const knownNewMoon = new Date("2024-01-11");
    const now = new Date();

    const daysSince =
      (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phasePercentage = (daysSince % synodicMonth) / synodicMonth;

    let phase = "New Moon";
    if (phasePercentage < 0.125) phase = "New Moon";
    else if (phasePercentage < 0.25) phase = "Waxing Crescent";
    else if (phasePercentage < 0.375) phase = "First Quarter";
    else if (phasePercentage < 0.5) phase = "Waxing Gibbous";
    else if (phasePercentage < 0.625) phase = "Full Moon";
    else if (phasePercentage < 0.75) phase = "Waning Gibbous";
    else if (phasePercentage < 0.875) phase = "Last Quarter";
    else phase = "Waning Crescent";

    return { phase, percentage: phasePercentage };
  }

  // Get seasonal energy
  public getCurrentSeasonalEnergy(): { season: string; energy: string } {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Approximate seasonal boundaries
    if (
      (month === 2 && day >= 20) ||
      month === 3 ||
      month === 4 ||
      (month === 5 && day < 21)
    ) {
      return { season: "Spring", energy: "New beginnings and growth" };
    } else if (
      (month === 5 && day >= 21) ||
      month === 6 ||
      month === 7 ||
      (month === 8 && day < 23)
    ) {
      return { season: "Summer", energy: "Full expression and abundance" };
    } else if (
      (month === 8 && day >= 23) ||
      month === 9 ||
      month === 10 ||
      (month === 11 && day < 21)
    ) {
      return { season: "Autumn", energy: "Harvest and reflection" };
    } else {
      return { season: "Winter", energy: "Rest and regeneration" };
    }
  }

  // Get void of course moon periods
  public getVoidOfCoursePeriods(): { start: Date; end: Date }[] {
    // Simplified - would calculate actual VOC periods
    const periods: { start: Date; end: Date }[] = [];
    const now = new Date();

    // Example VOC period
    periods.push({
      start: new Date(now.getTime() + 3600000), // 1 hour from now
      end: new Date(now.getTime() + 7200000), // 2 hours from now
    });

    return periods;
  }

  // Get retrograde planets
  public getRetrogradePlanets(): Planet[] {
    if (!this.currentEphemeris) return [];

    const retrogrades: Planet[] = [];
    this.currentEphemeris.planets.forEach((position, planet) => {
      if (position.retrograde) {
        retrogrades.push(planet);
      }
    });

    return retrogrades;
  }

  // Cleanup
  public cleanup() {
    if (this.ephemerisUpdateInterval) {
      clearInterval(this.ephemerisUpdateInterval);
    }
  }

  // Generate Spiralogic Astrology Report
  public async generateSpiralogicReport(
    userId: string,
    options?: {
      lifeStage?: string;
      personalityNotes?: string[];
    },
  ): Promise<SpiralogicReportOutput> {
    try {
      logger.info(`Generating Spiralogic report for user ${userId}`);

      // Get user's birth data and natal chart
      const userData = await this.getUserAstrologicalData(userId);
      if (!userData || !userData.birthData || !userData.natalChart) {
        throw new Error(
          "User birth data not found. Please set birth information first.",
        );
      }

      // Get user's elemental profile from the database
      const { data: profileData, error } = await supabase
        .from("user_profiles")
        .select("name, elemental_profile, archetypes")
        .eq("user_id", userId)
        .single();

      if (error || !profileData) {
        throw new Error("User profile not found");
      }

      // Calculate dominant and underactive elements
      const elementalProfile = profileData.elemental_profile || {};
      const elements = this.analyzeElementalBalance(userData.natalChart);

      // Prepare report input
      const reportInput: SpiralogicReportInput = {
        userId,
        name: profileData.name || "Soul Seeker",
        birthDate: userData.birthData.date.toISOString().split("T")[0],
        birthTime: userData.birthData.time,
        birthLocation: `${userData.birthData.location.lat}, ${userData.birthData.location.lng}`, // Would convert to city name
        chartData: {
          sun: this.getPlanetInfo(userData.natalChart.planets.get("sun")),
          moon: this.getPlanetInfo(userData.natalChart.planets.get("moon")),
          rising: userData.natalChart.ascendant,
          northNode: { sign: "pisces", house: 12 }, // Would calculate actual nodes
          southNode: { sign: "virgo", house: 6 }, // Would calculate actual nodes
        },
        dominantElement: elements.dominant,
        underactiveElement: elements.underactive,
        archetypes: profileData.archetypes || ["Mystic", "Creator", "Sage"],
        lifeStage: options?.lifeStage,
        personalityNotes: options?.personalityNotes,
      };

      // Generate the report
      const reportFlow = new GenerateReportFlow();
      const reportOutput = await reportFlow.generateReport(reportInput);

      // Enhance with rituals
      const enhancedReport = await reportFlow.enhanceWithRituals(
        reportOutput.report,
        { dominant: elements.dominant, underactive: elements.underactive },
      );

      // Save report to database
      const reportId = await this.saveReport(userId, enhancedReport);

      return {
        ...reportOutput,
        report: enhancedReport,
      };
    } catch (error) {
      logger.error("Error generating Spiralogic report:", error);
      throw error;
    }
  }

  // Analyze elemental balance from natal chart
  private analyzeElementalBalance(natalChart: any): {
    dominant: ArchetypalElement;
    underactive: ArchetypalElement;
  } {
    const elementCounts: Record<ArchetypalElement, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0,
    };

    // Count planets in each element
    natalChart.planets.forEach((placement: NatalPlacement) => {
      const element = this.getElementForSign(placement.sign);
      if (element) {
        elementCounts[element]++;
      }
    });

    // Find dominant and underactive
    let dominant: ArchetypalElement = "fire";
    let underactive: ArchetypalElement = "water";
    let maxCount = 0;
    let minCount = 10;

    Object.entries(elementCounts).forEach(([element, count]) => {
      if (count > maxCount && element !== "aether") {
        maxCount = count;
        dominant = element as ArchetypalElement;
      }
      if (count < minCount && element !== "aether") {
        minCount = count;
        underactive = element as ArchetypalElement;
      }
    });

    return { dominant, underactive };
  }

  // Get element for zodiac sign
  private getElementForSign(sign: ZodiacSign): ArchetypalElement | null {
    const elementMap: Record<ZodiacSign, ArchetypalElement> = {
      aries: "fire",
      leo: "fire",
      sagittarius: "fire",
      taurus: "earth",
      virgo: "earth",
      capricorn: "earth",
      gemini: "air",
      libra: "air",
      aquarius: "air",
      cancer: "water",
      scorpio: "water",
      pisces: "water",
    };

    return elementMap[sign] || null;
  }

  // Convert planetary placement to report format
  private getPlanetInfo(placement?: NatalPlacement): {
    sign: string;
    house: number;
  } {
    if (!placement) {
      return { sign: "unknown", house: 1 };
    }

    // Calculate house (simplified - would use actual house calculation)
    const house = Math.floor(placement.degree / 30) + 1;

    return {
      sign: placement.sign,
      house: house,
    };
  }

  // Save report to database
  private async saveReport(userId: string, report: any): Promise<string> {
    const { data, error } = await supabase
      .from("spiralogic_reports")
      .insert({
        user_id: userId,
        report_type: "astrology",
        content: report.content,
        sections: report.sections,
        metadata: report.metadata,
        generated_at: report.generatedAt,
        version: report.version,
      })
      .select("id")
      .single();

    if (error) {
      logger.error("Error saving report:", error);
      throw error;
    }

    return data.id;
  }

  // Get user's previous reports
  public async getUserReports(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("spiralogic_reports")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false });

    if (error) {
      logger.error("Error fetching user reports:", error);
      throw error;
    }

    return data || [];
  }
}

export const astrologicalService = new AstrologicalService();

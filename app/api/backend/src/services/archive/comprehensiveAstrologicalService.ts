import {
  AstrologicalHoloflower,
  Planet,
  ZodiacSign,
  AspectType,
  PlanetaryTransit,
  NatalPlacement,
} from "../core/AstrologicalHoloflower";
import { supabase } from "../lib/supabaseClient";
import { WebSocketServer } from "ws";

interface ComprehensiveBirthChart {
  userId: string;
  birthData: {
    date: Date;
    time: string;
    location: { lat: number; lng: number; timezone: string };
  };
  planets: Map<
    Planet,
    {
      sign: ZodiacSign;
      degree: number;
      house: number;
      retrograde: boolean;
      dignity: string; // domicile, exaltation, detriment, fall, peregrine
    }
  >;
  houses: {
    cusps: number[]; // 12 house cusps in degrees
    system: "placidus" | "whole" | "equal";
  };
  aspects: ChartAspect[];
  patterns: ChartPattern[];
  dominantElements: Map<string, number>;
  dominantModalities: Map<string, number>;
}

interface ChartAspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  orb: number;
  exact: boolean;
  applying: boolean;
  strength: number; // 0-1
  interpretation: string;
}

interface ChartPattern {
  type:
    | "grand-trine"
    | "grand-cross"
    | "t-square"
    | "yod"
    | "stellium"
    | "mystic-rectangle";
  planets: Planet[];
  element?: string;
  interpretation: string;
  transformationPotential: number; // 0-1
}

interface TransitEvent {
  id: string;
  userId: string;
  transit: PlanetaryTransit;
  type: "ingress" | "exact" | "station" | "eclipse" | "lunation";
  timestamp: Date;
  duration: number; // days
  intensity: number; // 0-1
  transformationOpportunity: string;
  houseActivated: number;
  natalPlanetAspected?: Planet;
}

interface SacredTiming {
  userId: string;
  recommendations: TimingRecommendation[];
  cosmicSupport: CosmicSupportPeriod[];
  lunarCycle: LunarPhaseInfo;
  eclipseWindows: EclipseWindow[];
  retrogradePeriods: RetrogradePeriod[];
}

interface TimingRecommendation {
  houseNumber: number;
  startDate: Date;
  endDate: Date;
  quality: "excellent" | "good" | "neutral" | "challenging";
  planets: Planet[];
  description: string;
  transformationType: string;
  practices: string[];
}

interface CosmicSupportPeriod {
  startDate: Date;
  endDate: Date;
  supportType: "breakthrough" | "integration" | "release" | "initiation";
  intensity: number; // 0-1
  description: string;
  supportedHouses: number[];
}

interface LunarPhaseInfo {
  currentPhase: string;
  percentIlluminated: number;
  nextNewMoon: Date;
  nextFullMoon: Date;
  moonSign: ZodiacSign;
  moonHouse: number;
  monthlyActivations: { date: Date; house: number; theme: string }[];
}

interface EclipseWindow {
  date: Date;
  type: "solar" | "lunar";
  degree: number;
  sign: ZodiacSign;
  housesImpacted: number[];
  transformationTheme: string;
  duration: number; // months of influence
}

interface RetrogradePeriod {
  planet: Planet;
  startDate: Date;
  endDate: Date;
  stationDates: { retrograde: Date; direct: Date };
  housesAffected: number[];
  reviewThemes: string[];
}

interface GroupAstrologyData {
  groupId: string;
  participants: string[];
  compositeChart: CompositeChartData;
  synastryPatterns: SynastryPattern[];
  collectiveTransits: CollectiveTransit[];
  groupDynamics: GroupDynamic[];
  optimalTiming: GroupTimingWindow[];
}

interface CompositeChartData {
  planets: Map<Planet, { sign: ZodiacSign; degree: number; house: number }>;
  dominantThemes: string[];
  challengeAreas: string[];
  harmonyPoints: string[];
}

interface SynastryPattern {
  participant1: string;
  participant2: string;
  aspects: ChartAspect[];
  compatibility: number; // 0-1
  growthAreas: string[];
  supportAreas: string[];
}

interface CollectiveTransit {
  transit: PlanetaryTransit;
  impactedParticipants: string[];
  collectiveTheme: string;
  groupOpportunity: string;
}

interface GroupDynamic {
  type: "harmony" | "tension" | "catalyst" | "support";
  participants: string[];
  description: string;
  transformationPotential: number;
}

interface GroupTimingWindow {
  startDate: Date;
  endDate: Date;
  quality: "optimal" | "supportive" | "neutral" | "challenging";
  theme: string;
  practices: string[];
}

export class ComprehensiveAstrologicalService {
  private birthCharts: Map<string, ComprehensiveBirthChart> = new Map();
  private activeTransits: Map<string, TransitEvent[]> = new Map();
  private sacredTimings: Map<string, SacredTiming> = new Map();
  private groupData: Map<string, GroupAstrologyData> = new Map();
  private wsServer: WebSocketServer | null = null;
  private updateInterval: NodeJS.Timer | null = null;

  constructor() {
    this.initializeWebSocketServer();
    this.startContinuousTracking();
  }

  private initializeWebSocketServer() {
    this.wsServer = new WebSocketServer({ port: 5004 });

    this.wsServer.on("connection", (ws, req) => {
      const userId = req.url?.split("/").pop();
      if (!userId) return;

      ws.on("message", async (message) => {
        const data = JSON.parse(message.toString());
        await this.handleAstrologicalMessage(userId, data);
      });

      // Send initial astrological state
      this.sendUserAstrologicalState(userId, ws);
    });
  }

  private async handleAstrologicalMessage(userId: string, data: any) {
    switch (data.type) {
      case "set-birth-data":
        await this.calculateComprehensiveBirthChart(userId, data.birthData);
        break;

      case "request-timing":
        await this.generateSacredTiming(userId);
        break;

      case "request-group-analysis":
        await this.analyzeGroupAstrology(data.groupId, data.participantIds);
        break;

      case "track-transformation":
        await this.trackTransformationWithAstrology(
          userId,
          data.transformation,
        );
        break;
    }
  }

  // Calculate comprehensive birth chart with all details
  public async calculateComprehensiveBirthChart(
    userId: string,
    birthData: {
      date: Date;
      time: string;
      location: { lat: number; lng: number; timezone: string };
    },
  ): Promise<ComprehensiveBirthChart> {
    // In production, use Swiss Ephemeris or professional astrology API
    // This is a comprehensive structure for the data

    const planets = await this.calculatePlanetaryPositions(birthData);
    const houses = await this.calculateHouses(birthData);
    const aspects = this.calculateAllAspects(planets);
    const patterns = this.identifyChartPatterns(planets, aspects);

    const chart: ComprehensiveBirthChart = {
      userId,
      birthData,
      planets,
      houses,
      aspects,
      patterns,
      dominantElements: this.calculateElementBalance(planets),
      dominantModalities: this.calculateModalityBalance(planets),
    };

    this.birthCharts.set(userId, chart);

    // Save to database
    await this.saveBirthChart(chart);

    // Update holoflower with natal positions
    await this.updateHoloflowerWithNatal(userId, chart);

    return chart;
  }

  // Calculate planetary positions at birth
  private async calculatePlanetaryPositions(
    birthData: any,
  ): Promise<Map<Planet, any>> {
    const positions = new Map<Planet, any>();

    // Example calculation (would use ephemeris)
    const planets: Planet[] = [
      "sun",
      "moon",
      "mercury",
      "venus",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
      "pluto",
    ];

    planets.forEach((planet, index) => {
      positions.set(planet, {
        sign: this.calculatePlanetSign(planet, birthData),
        degree: Math.random() * 30, // Would calculate actual degree
        house: this.calculatePlanetHouse(planet, birthData),
        retrograde: this.isPlanetRetrograde(planet, birthData.date),
        dignity: this.calculateDignity(
          planet,
          this.calculatePlanetSign(planet, birthData),
        ),
      });
    });

    return positions;
  }

  // Calculate house cusps
  private async calculateHouses(birthData: any): Promise<any> {
    // Would use house calculation formula based on birth location and time
    const cusps: number[] = [];
    const ascendant = this.calculateAscendant(birthData);

    // Equal house system for simplicity
    for (let i = 0; i < 12; i++) {
      cusps.push((ascendant + i * 30) % 360);
    }

    return {
      cusps,
      system: "equal" as const,
    };
  }

  // Calculate all aspects in the chart
  private calculateAllAspects(planets: Map<Planet, any>): ChartAspect[] {
    const aspects: ChartAspect[] = [];
    const planetList = Array.from(planets.keys());

    for (let i = 0; i < planetList.length; i++) {
      for (let j = i + 1; j < planetList.length; j++) {
        const aspect = this.calculateAspectBetweenPlanets(
          planetList[i],
          planets.get(planetList[i])!,
          planetList[j],
          planets.get(planetList[j])!,
        );

        if (aspect) {
          aspects.push(aspect);
        }
      }
    }

    return aspects;
  }

  // Calculate aspect between two planets
  private calculateAspectBetweenPlanets(
    planet1: Planet,
    pos1: any,
    planet2: Planet,
    pos2: any,
  ): ChartAspect | null {
    const angle = Math.abs(
      this.getAbsoluteDegree(pos1.sign, pos1.degree) -
        this.getAbsoluteDegree(pos2.sign, pos2.degree),
    );

    const aspectTypes: { angle: number; type: AspectType; orb: number }[] = [
      { angle: 0, type: "conjunction", orb: 8 },
      { angle: 60, type: "sextile", orb: 6 },
      { angle: 90, type: "square", orb: 8 },
      { angle: 120, type: "trine", orb: 8 },
      { angle: 180, type: "opposition", orb: 8 },
    ];

    for (const aspectDef of aspectTypes) {
      if (
        Math.abs(angle - aspectDef.angle) <= aspectDef.orb ||
        Math.abs(360 - angle - aspectDef.angle) <= aspectDef.orb
      ) {
        const orb = Math.min(
          Math.abs(angle - aspectDef.angle),
          Math.abs(360 - angle - aspectDef.angle),
        );

        return {
          planet1,
          planet2,
          type: aspectDef.type,
          orb,
          exact: orb < 1,
          applying: this.isAspectApplying(pos1, pos2),
          strength: 1 - orb / aspectDef.orb,
          interpretation: this.interpretAspect(
            planet1,
            planet2,
            aspectDef.type,
          ),
        };
      }
    }

    return null;
  }

  // Identify chart patterns
  private identifyChartPatterns(
    planets: Map<Planet, any>,
    aspects: ChartAspect[],
  ): ChartPattern[] {
    const patterns: ChartPattern[] = [];

    // Check for Grand Trine
    const grandTrines = this.findGrandTrines(aspects);
    patterns.push(...grandTrines);

    // Check for T-Squares
    const tSquares = this.findTSquares(aspects);
    patterns.push(...tSquares);

    // Check for Grand Cross
    const grandCrosses = this.findGrandCrosses(aspects);
    patterns.push(...grandCrosses);

    // Check for Yods
    const yods = this.findYods(aspects);
    patterns.push(...yods);

    // Check for Stelliums
    const stelliums = this.findStelliums(planets);
    patterns.push(...stelliums);

    return patterns;
  }

  // Real-time transit tracking
  public async trackCurrentTransits(userId: string): Promise<TransitEvent[]> {
    const birthChart = this.birthCharts.get(userId);
    if (!birthChart) return [];

    const currentPositions = await this.getCurrentPlanetaryPositions();
    const transitEvents: TransitEvent[] = [];

    // Check each transiting planet
    currentPositions.forEach((transitPos, transitPlanet) => {
      // Check house transits
      const transitedHouse = this.getTransitedHouse(
        transitPos,
        birthChart.houses,
      );

      if (transitedHouse) {
        const event: TransitEvent = {
          id: `${userId}-${transitPlanet}-${Date.now()}`,
          userId,
          transit: {
            planet: transitPlanet,
            sign: transitPos.sign,
            degree: transitPos.degree,
            retrograde: transitPos.retrograde,
            orb: 0,
            influence: this.getTransitInfluence(
              transitPlanet,
              transitedHouse,
              birthChart,
            ),
            startDate: new Date(),
            exactDate: new Date(),
            endDate: new Date(),
          },
          type: "ingress",
          timestamp: new Date(),
          duration: this.calculateTransitDuration(transitPlanet),
          intensity: this.calculateTransitIntensity(
            transitPlanet,
            transitedHouse,
          ),
          transformationOpportunity: this.getTransformationOpportunity(
            transitPlanet,
            transitedHouse,
          ),
          houseActivated: transitedHouse,
        };

        transitEvents.push(event);
      }

      // Check natal planet aspects
      birthChart.planets.forEach((natalPos, natalPlanet) => {
        const aspect = this.calculateAspectBetweenPlanets(
          transitPlanet,
          transitPos,
          natalPlanet,
          natalPos,
        );

        if (aspect && aspect.orb < 3) {
          const event: TransitEvent = {
            id: `${userId}-${transitPlanet}-${natalPlanet}-${Date.now()}`,
            userId,
            transit: {
              planet: transitPlanet,
              sign: transitPos.sign,
              degree: transitPos.degree,
              retrograde: transitPos.retrograde,
              orb: aspect.orb,
              influence: aspect.interpretation,
              startDate: new Date(),
              exactDate: new Date(),
              endDate: new Date(),
            },
            type: "exact",
            timestamp: new Date(),
            duration: this.calculateAspectDuration(transitPlanet, aspect.type),
            intensity: aspect.strength,
            transformationOpportunity: this.getAspectTransformationOpportunity(
              transitPlanet,
              natalPlanet,
              aspect.type,
            ),
            houseActivated: natalPos.house,
            natalPlanetAspected: natalPlanet,
          };

          transitEvents.push(event);
        }
      });
    });

    this.activeTransits.set(userId, transitEvents);
    return transitEvents;
  }

  // Generate sacred timing recommendations
  public async generateSacredTiming(userId: string): Promise<SacredTiming> {
    const birthChart = this.birthCharts.get(userId);
    if (!birthChart) throw new Error("Birth chart not found");

    const recommendations = await this.calculateTimingRecommendations(userId);
    const cosmicSupport = await this.identifyCosmicSupportPeriods(userId);
    const lunarCycle = await this.getCurrentLunarCycle(userId);
    const eclipseWindows = await this.getUpcomingEclipses(userId);
    const retrogradePeriods = await this.getRetrogradePeriods();

    const sacredTiming: SacredTiming = {
      userId,
      recommendations,
      cosmicSupport,
      lunarCycle,
      eclipseWindows,
      retrogradePeriods,
    };

    this.sacredTimings.set(userId, sacredTiming);

    // Broadcast to user
    this.broadcastSacredTiming(userId, sacredTiming);

    return sacredTiming;
  }

  // Calculate timing recommendations for each house
  private async calculateTimingRecommendations(
    userId: string,
  ): Promise<TimingRecommendation[]> {
    const birthChart = this.birthCharts.get(userId);
    if (!birthChart) return [];

    const recommendations: TimingRecommendation[] = [];
    const currentTransits = await this.trackCurrentTransits(userId);
    const upcomingTransits = await this.projectUpcomingTransits(userId, 90); // 90 days

    // Analyze each house
    for (let house = 1; house <= 12; house++) {
      const houseTransits = currentTransits.filter(
        (t) => t.houseActivated === house,
      );
      const upcomingHouseTransits = upcomingTransits.filter(
        (t) => t.houseActivated === house,
      );

      if (houseTransits.length > 0 || upcomingHouseTransits.length > 0) {
        const quality = this.assessTimingQuality(
          houseTransits,
          upcomingHouseTransits,
        );
        const planets = [
          ...new Set([
            ...houseTransits.map((t) => t.transit.planet),
            ...upcomingHouseTransits.map((t) => t.transit.planet),
          ]),
        ];

        recommendations.push({
          houseNumber: house,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          quality,
          planets,
          description: this.generateTimingDescription(house, planets, quality),
          transformationType: this.getHouseTransformationType(house),
          practices: this.getRecommendedPractices(house, planets, quality),
        });
      }
    }

    return recommendations;
  }

  // Identify cosmic support periods
  private async identifyCosmicSupportPeriods(
    userId: string,
  ): Promise<CosmicSupportPeriod[]> {
    const periods: CosmicSupportPeriod[] = [];
    const birthChart = this.birthCharts.get(userId);
    if (!birthChart) return periods;

    // Check for major beneficial transits
    const currentPositions = await this.getCurrentPlanetaryPositions();

    // Jupiter transits
    const jupiterPos = currentPositions.get("jupiter");
    if (jupiterPos) {
      birthChart.planets.forEach((natalPos, natalPlanet) => {
        const aspect = this.calculateAspectBetweenPlanets(
          "jupiter",
          jupiterPos,
          natalPlanet,
          natalPos,
        );

        if (aspect && (aspect.type === "trine" || aspect.type === "sextile")) {
          periods.push({
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            supportType: "breakthrough",
            intensity: aspect.strength,
            description: `Jupiter blessing your natal ${natalPlanet} - excellent for expansion`,
            supportedHouses: [natalPos.house],
          });
        }
      });
    }

    // Venus transits for integration
    const venusPos = currentPositions.get("venus");
    if (venusPos) {
      const venusHouse = this.getTransitedHouse(venusPos, birthChart.houses);
      if (venusHouse) {
        periods.push({
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          supportType: "integration",
          intensity: 0.7,
          description: `Venus in your ${this.getHouseOrdinal(venusHouse)} house - harmonizing energies`,
          supportedHouses: [venusHouse],
        });
      }
    }

    return periods;
  }

  // Get current lunar cycle information
  private async getCurrentLunarCycle(userId: string): Promise<LunarPhaseInfo> {
    const birthChart = this.birthCharts.get(userId);
    if (!birthChart) throw new Error("Birth chart not found");

    const currentMoonPos = await this.getCurrentMoonPosition();
    const lunarPhase = this.calculateLunarPhase();
    const moonHouse = this.getTransitedHouse(currentMoonPos, birthChart.houses);

    // Calculate monthly house activations
    const monthlyActivations: { date: Date; house: number; theme: string }[] =
      [];
    for (let i = 0; i < 30; i++) {
      const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const futureMoonPos = await this.getMoonPositionForDate(futureDate);
      const futureHouse = this.getTransitedHouse(
        futureMoonPos,
        birthChart.houses,
      );

      if (
        futureHouse &&
        (i === 0 ||
          futureHouse !==
            monthlyActivations[monthlyActivations.length - 1]?.house)
      ) {
        monthlyActivations.push({
          date: futureDate,
          house: futureHouse,
          theme: this.getLunarHouseTheme(futureHouse),
        });
      }
    }

    return {
      currentPhase: lunarPhase.phase,
      percentIlluminated: lunarPhase.illumination,
      nextNewMoon: this.getNextNewMoon(),
      nextFullMoon: this.getNextFullMoon(),
      moonSign: currentMoonPos.sign,
      moonHouse: moonHouse || 1,
      monthlyActivations,
    };
  }

  // Group astrology analysis
  public async analyzeGroupAstrology(
    groupId: string,
    participantIds: string[],
  ): Promise<GroupAstrologyData> {
    // Ensure all participants have birth charts
    const participantCharts: ComprehensiveBirthChart[] = [];
    for (const participantId of participantIds) {
      const chart = this.birthCharts.get(participantId);
      if (chart) {
        participantCharts.push(chart);
      }
    }

    if (participantCharts.length < 2) {
      throw new Error("Need at least 2 participants with birth data");
    }

    const compositeChart = this.calculateCompositeChart(participantCharts);
    const synastryPatterns = this.calculateSynastryPatterns(participantCharts);
    const collectiveTransits =
      await this.analyzeCollectiveTransits(participantIds);
    const groupDynamics = this.identifyGroupDynamics(
      participantCharts,
      synastryPatterns,
    );
    const optimalTiming = await this.calculateGroupTiming(participantIds);

    const groupData: GroupAstrologyData = {
      groupId,
      participants: participantIds,
      compositeChart,
      synastryPatterns,
      collectiveTransits,
      groupDynamics,
      optimalTiming,
    };

    this.groupData.set(groupId, groupData);

    // Broadcast to group
    this.broadcastGroupAstrology(groupId, groupData);

    return groupData;
  }

  // Calculate composite chart for group
  private calculateCompositeChart(
    charts: ComprehensiveBirthChart[],
  ): CompositeChartData {
    const compositePlanets = new Map<Planet, any>();
    const planets: Planet[] = [
      "sun",
      "moon",
      "mercury",
      "venus",
      "mars",
      "jupiter",
      "saturn",
    ];

    // Calculate midpoints for each planet
    planets.forEach((planet) => {
      const positions = charts.map((chart) => {
        const pos = chart.planets[planet];
        return pos ? this.getAbsoluteDegree(pos.sign, pos.degree) : 0;
      });

      const avgDegree =
        positions.reduce((sum, deg) => sum + deg, 0) / positions.length;

      compositePlanets.set(planet, {
        sign: this.getSignFromDegree(avgDegree),
        degree: avgDegree % 30,
        house: Math.floor(avgDegree / 30) + 1,
      });
    });

    return {
      planets: compositePlanets,
      dominantThemes: this.identifyCompositeThemes(compositePlanets),
      challengeAreas: this.identifyCompositeChallenges(compositePlanets),
      harmonyPoints: this.identifyCompositeHarmony(compositePlanets),
    };
  }

  // Calculate synastry patterns between participants
  private calculateSynastryPatterns(
    charts: ComprehensiveBirthChart[],
  ): SynastryPattern[] {
    const patterns: SynastryPattern[] = [];

    for (let i = 0; i < charts.length; i++) {
      for (let j = i + 1; j < charts.length; j++) {
        const synastry = this.calculatePairSynastry(charts[i], charts[j]);
        patterns.push(synastry);
      }
    }

    return patterns;
  }

  // Calculate synastry between two charts
  private calculatePairSynastry(
    chart1: ComprehensiveBirthChart,
    chart2: ComprehensiveBirthChart,
  ): SynastryPattern {
    const aspects: ChartAspect[] = [];

    // Compare each planet in chart1 with each planet in chart2
    chart1.planets.forEach((pos1, planet1) => {
      chart2.planets.forEach((pos2, planet2) => {
        const aspect = this.calculateAspectBetweenPlanets(
          planet1,
          pos1,
          planet2,
          pos2,
        );

        if (aspect) {
          aspects.push(aspect);
        }
      });
    });

    const compatibility = this.calculateCompatibilityScore(aspects);

    return {
      participant1: chart1.userId,
      participant2: chart2.userId,
      aspects,
      compatibility,
      growthAreas: this.identifyGrowthAreas(aspects),
      supportAreas: this.identifySupportAreas(aspects),
    };
  }

  // Helper methods
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
    return signs.indexOf(sign) * 30 + degree;
  }

  private getSignFromDegree(absoluteDegree: number): ZodiacSign {
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
    return signs[Math.floor((absoluteDegree % 360) / 30)];
  }

  private calculateAscendant(birthData: any): number {
    // Simplified calculation - would use proper formula
    const hour = parseInt(birthData.time.split(":")[0]);
    return (hour * 15) % 360;
  }

  private calculatePlanetSign(planet: Planet, birthData: any): ZodiacSign {
    // Simplified - would use ephemeris
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
    return signs[Math.floor(Math.random() * 12)];
  }

  private calculatePlanetHouse(planet: Planet, birthData: any): number {
    // Simplified - would calculate based on houses
    return Math.floor(Math.random() * 12) + 1;
  }

  private isPlanetRetrograde(planet: Planet, date: Date): boolean {
    // Simplified - would check ephemeris
    return Math.random() < 0.2;
  }

  private calculateDignity(planet: Planet, sign: ZodiacSign): string {
    // Planetary dignities
    const dignities: Record<Planet, Record<string, ZodiacSign[]>> = {
      sun: {
        domicile: ["leo"],
        exaltation: ["aries"],
        detriment: ["aquarius"],
        fall: ["libra"],
      },
      moon: {
        domicile: ["cancer"],
        exaltation: ["taurus"],
        detriment: ["capricorn"],
        fall: ["scorpio"],
      },
      // ... other planets
    };

    const planetDignities = dignities[planet];
    if (!planetDignities) return "peregrine";

    if (planetDignities.domicile?.includes(sign)) return "domicile";
    if (planetDignities.exaltation?.includes(sign)) return "exaltation";
    if (planetDignities.detriment?.includes(sign)) return "detriment";
    if (planetDignities.fall?.includes(sign)) return "fall";

    return "peregrine";
  }

  // Broadcast methods
  private broadcastSacredTiming(userId: string, timing: SacredTiming) {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type: "sacred-timing-update",
      userId,
      timing,
      timestamp: new Date(),
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private broadcastGroupAstrology(groupId: string, data: GroupAstrologyData) {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type: "group-astrology-update",
      groupId,
      data,
      timestamp: new Date(),
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  // Continuous tracking
  private startContinuousTracking() {
    // Update every 5 minutes
    this.updateInterval = setInterval(async () => {
      // Update all user transits
      for (const userId of this.birthCharts.keys()) {
        await this.trackCurrentTransits(userId);
        await this.checkTransformationTriggers(userId);
      }

      // Update group dynamics
      for (const [groupId, groupData] of this.groupData) {
        await this.updateGroupTransits(groupId, groupData.participants);
      }
    }, 300000); // 5 minutes
  }

  // Check for transformation triggers
  private async checkTransformationTriggers(userId: string) {
    const transits = this.activeTransits.get(userId) || [];
    const birthChart = this.birthCharts.get(userId);
    if (!birthChart) return;

    // Look for powerful configurations
    const triggers = transits.filter((t) => {
      // Outer planet transits to personal planets
      if (
        ["saturn", "uranus", "neptune", "pluto"].includes(t.transit.planet) &&
        t.natalPlanetAspected &&
        ["sun", "moon", "mercury", "venus", "mars"].includes(
          t.natalPlanetAspected,
        )
      ) {
        return true;
      }

      // Transits to natal Sun or Moon
      if (
        t.natalPlanetAspected &&
        ["sun", "moon"].includes(t.natalPlanetAspected)
      ) {
        return true;
      }

      // Transits to angles (1st, 4th, 7th, 10th houses)
      if ([1, 4, 7, 10].includes(t.houseActivated)) {
        return true;
      }

      return false;
    });

    if (triggers.length > 0) {
      this.broadcastTransformationTriggers(userId, triggers);
    }
  }

  private broadcastTransformationTriggers(
    userId: string,
    triggers: TransitEvent[],
  ) {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type: "transformation-triggers",
      userId,
      triggers,
      timestamp: new Date(),
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  // Additional helper methods would go here...

  public cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.wsServer) {
      this.wsServer.close();
    }
  }
}

export const comprehensiveAstrologicalService =
  new ComprehensiveAstrologicalService();

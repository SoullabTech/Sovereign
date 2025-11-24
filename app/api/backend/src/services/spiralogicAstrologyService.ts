// Real Swiss Ephemeris for accurate astronomical calculations
import swisseph from 'swisseph';

import { supabase } from "../lib/supabaseClient";

// 36 Faces Decan System Integration
import {
  calculateBirthChartDecans,
  calculatePlanetaryDecan,
  getDecanSummary,
  calculateDecanElementDistribution,
  getStrongestDecanInfluence,
  type BirthChartDecans,
  type PlanetaryDecan,
} from '../../../../../lib/astrology/decanCalculator';

import {
  getDecanByDegree,
  interpretPlanetInDecan,
  type Decan,
} from '../../../../../lib/astrology/decanSystem';

// Mock ComprehensiveBirthChart - TODO: fix import
interface ComprehensiveBirthChart {
  planets: any[];
  houses: any[];
  aspects: any[];
}

// Initialize Swiss Ephemeris with ephemeris data path
try {
  swisseph.swe_set_ephe_path(__dirname + "/../../node_modules/swisseph/ephe");
} catch (error) {
  console.warn("Swiss Ephemeris data path not set, calculations may use less accurate algorithms");
}

export interface SpiralogicBirthData {
  date: Date;
  time: string; // HH:MM format
  location: {
    lat: number;
    lng: number;
    timezone: string;
    placeName?: string;
  };
}

export interface SpiralogicPhaseMapping {
  fire: PlanetPlacement[]; // Houses 1, 5, 9
  water: PlanetPlacement[]; // Houses 4, 8, 12
  earth: PlanetPlacement[]; // Houses 2, 6, 10
  air: PlanetPlacement[]; // Houses 3, 7, 11
}

export interface PlanetPlacement {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  retrograde: boolean;
  dignity?: string;
  // 36 Faces Decan Enhancement
  decan?: Decan;
  decanNumber?: 1 | 2 | 3;
  decanRuler?: string;
  decanName?: string;
  tarotCard?: string;
}

export interface SpiralogicReport {
  userId: string;
  birthChartId: string;
  personalOverview: string;
  beingArchetype: string;
  becomingArchetype: string;
  elementalInsights: {
    fire: ElementalInsight;
    water: ElementalInsight;
    earth: ElementalInsight;
    air: ElementalInsight;
  };
  karmicAxis: {
    northNode: KarmicPoint;
    southNode: KarmicPoint;
    saturn: KarmicPoint;
    pluto: KarmicPoint;
  };
  reflectiveProtocols: ReflectiveProtocol[];
  // 36 Faces Decan Enhancement
  decanPlacements?: BirthChartDecans;
  decanSummary?: string;
  strongestDecanInfluence?: {
    ruler: string;
    count: number;
    interpretation: string;
  };
  generatedAt: Date;
}

export interface ElementalInsight {
  element: string;
  strength: number; // 0-100
  planets: PlanetPlacement[];
  interpretation: string;
  challenges: string[];
  gifts: string[];
  practices: string[];
}

export interface KarmicPoint {
  placement: PlanetPlacement;
  interpretation: string;
  lessons: string[];
  evolutionary_direction: string;
}

export interface ReflectiveProtocol {
  name: string;
  element: string;
  description: string;
  steps: string[];
  timing: string;
  materials?: string[];
}

class SpiralogicAstrologyService {
  /**
   * Calculate precise birth chart using Swiss Ephemeris
   */
  async calculatePreciseBirthChart(
    birthData: SpiralogicBirthData,
  ): Promise<ComprehensiveBirthChart> {
    const { date, time, location } = birthData;

    // Convert birth time to Julian Day
    const [hours, minutes] = time.split(":").map(Number);
    const julianDay = this.dateToJulianDay(
      date,
      hours,
      minutes,
      location.timezone,
    );

    // Calculate houses using Placidus system
    const houses = this.calculateHouses(julianDay, location.lat, location.lng);

    // Calculate planetary positions
    const planets = await this.calculatePlanetaryPositions(julianDay);

    // Calculate aspects
    const aspects = this.calculateAspects(planets);

    // Identify chart patterns
    const patterns = this.identifyChartPatterns(planets, aspects);

    // Calculate dominant elements and modalities
    const { elements, modalities } = this.calculateDominance(planets);

    return {
      userId: "", // Will be set by caller
      birthData,
      planets,
      houses: {
        cusps: houses,
        system: "placidus",
      },
      aspects,
      patterns,
      dominantElements: elements,
      dominantModalities: modalities,
    };
  }

  /**
   * Map planets to Spiralogic elemental phases
   */
  mapToSpiralogicPhases(
    chart: ComprehensiveBirthChart,
  ): SpiralogicPhaseMapping {
    const mapping: SpiralogicPhaseMapping = {
      fire: [], // Houses 1, 5, 9
      water: [], // Houses 4, 8, 12
      earth: [], // Houses 2, 6, 10
      air: [], // Houses 3, 7, 11
    };

    const elementalHouses = {
      fire: [1, 5, 9],
      water: [4, 8, 12],
      earth: [2, 6, 10],
      air: [3, 7, 11],
    };

    // Map each planet to its elemental phase based on house placement
    chart.planets.forEach((placement, planet) => {
      const house = placement.house;

      for (const [element, houses] of Object.entries(elementalHouses)) {
        if (houses.includes(house)) {
          mapping[element as keyof SpiralogicPhaseMapping].push({
            planet: planet.toString(),
            sign: placement.sign.toString(),
            house: placement.house,
            degree: placement.degree,
            retrograde: placement.retrograde,
            dignity: placement.dignity,
          });
        }
      }
    });

    return mapping;
  }

  /**
   * Generate comprehensive Spiralogic report
   */
  async generateSpiralogicReport(
    userId: string,
    birthChartId: string,
    chart: ComprehensiveBirthChart,
    phaseMapping: SpiralogicPhaseMapping,
  ): Promise<SpiralogicReport> {
    // Generate personal overview based on Sun, Moon, Rising
    const personalOverview = this.generatePersonalOverview(chart);

    // Determine Being and Becoming archetypes
    const { beingArchetype, becomingArchetype } =
      this.determineArchetypes(chart);

    // Generate elemental insights
    const elementalInsights = this.generateElementalInsights(
      phaseMapping,
      chart,
    );

    // Analyze karmic axis
    const karmicAxis = this.analyzeKarmicAxis(chart);

    // Create reflective protocols
    const reflectiveProtocols = this.createReflectiveProtocols(
      elementalInsights,
      karmicAxis,
    );

    // 36 FACES DECAN INTEGRATION
    // Calculate decan placements for all planets
    const decanPlacements = calculateBirthChartDecans(chart.planets);
    const decanSummary = getDecanSummary(decanPlacements);
    const strongestDecanInfluence = getStrongestDecanInfluence(decanPlacements);

    return {
      userId,
      birthChartId,
      personalOverview,
      beingArchetype,
      becomingArchetype,
      elementalInsights,
      karmicAxis,
      reflectiveProtocols,
      // Austin Coppock's 36 Faces Integration
      decanPlacements,
      decanSummary,
      strongestDecanInfluence,
      generatedAt: new Date(),
    };
  }

  /**
   * Save birth chart to database
   */
  async saveBirthChart(
    userId: string,
    birthData: SpiralogicBirthData,
    chartData: any,
  ) {
    const { data, error } = await supabase
      .from("birth_charts")
      .insert({
        user_id: userId,
        birth_date: birthData.date,
        birth_time: birthData.time,
        birth_location: birthData.location,
        chart_data: chartData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Save report to database
   */
  async saveReport(report: SpiralogicReport, pdfUrl?: string) {
    const { data, error } = await supabase
      .from("spiralogic_reports")
      .insert({
        user_id: report.userId,
        birth_chart_id: report.birthChartId,
        report_type: "natal",
        report_data: report,
        pdf_url: pdfUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Private helper methods

  private dateToJulianDay(
    date: Date,
    hours: number,
    minutes: number,
    timezone: string,
  ): number {
    // Implement Julian Day calculation
    // This is a simplified version - in production, use proper timezone handling
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const ut = hours + minutes / 60;

    return swisseph.swe_julday(year, month, day, ut, 1); // 1 = Gregorian calendar
  }

  private calculateHouses(
    julianDay: number,
    lat: number,
    lng: number,
  ): number[] {
    const houses = new Array(12);
    const cusps = new Array(13); // 12 houses + Ascendant
    const ascmc = new Array(10);

    swisseph.swe_houses(
      julianDay,
      lat,
      lng,
      "P", // Placidus
      cusps,
      ascmc,
    );

    // Return house cusps (skip first element as it's duplicate of ASC)
    return cusps.slice(1, 13);
  }

  private async calculatePlanetaryPositions(
    julianDay: number,
  ): Promise<Map<string, any>> {
    const planets = new Map();
    const planetList = [
      { id: 0, name: "Sun" },      // SE_SUN
      { id: 1, name: "Moon" },     // SE_MOON
      { id: 2, name: "Mercury" },  // SE_MERCURY
      { id: 3, name: "Venus" },    // SE_VENUS
      { id: 4, name: "Mars" },     // SE_MARS
      { id: 5, name: "Jupiter" },  // SE_JUPITER
      { id: 6, name: "Saturn" },   // SE_SATURN
      { id: 7, name: "Uranus" },   // SE_URANUS
      { id: 8, name: "Neptune" },  // SE_NEPTUNE
      { id: 9, name: "Pluto" },    // SE_PLUTO
      { id: 11, name: "NorthNode" }, // SE_TRUE_NODE
    ];

    for (const planet of planetList) {
      try {
        const result = swisseph.swe_calc_ut(
          julianDay,
          planet.id,
          2 | 256, // SEFLG_SWIEPH | SEFLG_SPEED
        );

        if (result && result.longitude !== undefined) {
          // Calculate decan placement
          const decan = getDecanByDegree(result.longitude);

          planets.set(planet.name, {
            degree: result.longitude,
            speed: result.longitudeSpeed || 0,
            retrograde: (result.longitudeSpeed || 0) < 0,
            sign: this.getZodiacSign(result.longitude),
            house: 0, // Will be calculated based on house cusps
            // 36 Faces Decan Data
            decan: decan,
            decanNumber: decan?.decanNumber,
            decanRuler: decan?.ruler,
            decanName: decan?.name,
            tarotCard: decan?.tarotCard,
          });
        }
      } catch (error) {
        console.error(`Error calculating ${planet.name}:`, error);
      }
    }

    return planets;
  }

  private getZodiacSign(degree: number): string {
    const signs = [
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
    ];
    return signs[Math.floor(degree / 30)];
  }

  private calculateAspects(planets: Map<string, any>): any[] {
    const aspects = [];
    const aspectTypes = [
      { angle: 0, name: "Conjunction", orb: 8 },
      { angle: 60, name: "Sextile", orb: 6 },
      { angle: 90, name: "Square", orb: 8 },
      { angle: 120, name: "Trine", orb: 8 },
      { angle: 180, name: "Opposition", orb: 8 },
    ];

    const planetNames = Array.from(planets.keys());

    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planets.get(planetNames[i]);
        const planet2 = planets.get(planetNames[j]);

        for (const aspectType of aspectTypes) {
          const angle = Math.abs(planet1.degree - planet2.degree);
          const normalizedAngle = angle > 180 ? 360 - angle : angle;
          const orb = Math.abs(normalizedAngle - aspectType.angle);

          if (orb <= aspectType.orb) {
            aspects.push({
              planet1: planetNames[i],
              planet2: planetNames[j],
              type: aspectType.name,
              angle: normalizedAngle,
              orb,
              exact: orb < 1,
              applying: this.isApplying(planet1, planet2, aspectType.angle),
            });
          }
        }
      }
    }

    return aspects;
  }

  private isApplying(planet1: any, planet2: any, targetAngle: number): boolean {
    // Simplified version - check if faster planet is moving toward exact aspect
    const currentAngle = Math.abs(planet1.degree - planet2.degree);
    const fasterPlanet =
      Math.abs(planet1.speed) > Math.abs(planet2.speed) ? planet1 : planet2;
    return fasterPlanet.speed > 0 && currentAngle < targetAngle;
  }

  private identifyChartPatterns(
    planets: Map<string, any>,
    aspects: any[],
  ): any[] {
    const patterns = [];

    // Look for Grand Trines
    const trines = aspects.filter((a) => a.type === "Trine");
    // Implement pattern detection logic...

    // Look for T-Squares
    const squares = aspects.filter((a) => a.type === "Square");
    const oppositions = aspects.filter((a) => a.type === "Opposition");
    // Implement T-Square detection...

    // Look for Stelliums (3+ planets in same sign or house)
    // Implement stellium detection...

    return patterns;
  }

  private calculateDominance(planets: Map<string, any>): {
    elements: Map<string, number>;
    modalities: Map<string, number>;
  } {
    const elements = new Map([
      ["Fire", 0],
      ["Earth", 0],
      ["Air", 0],
      ["Water", 0],
    ]);

    const modalities = new Map([
      ["Cardinal", 0],
      ["Fixed", 0],
      ["Mutable", 0],
    ]);

    const signElements = {
      Aries: "Fire",
      Leo: "Fire",
      Sagittarius: "Fire",
      Taurus: "Earth",
      Virgo: "Earth",
      Capricorn: "Earth",
      Gemini: "Air",
      Libra: "Air",
      Aquarius: "Air",
      Cancer: "Water",
      Scorpio: "Water",
      Pisces: "Water",
    };

    const signModalities = {
      Aries: "Cardinal",
      Cancer: "Cardinal",
      Libra: "Cardinal",
      Capricorn: "Cardinal",
      Taurus: "Fixed",
      Leo: "Fixed",
      Scorpio: "Fixed",
      Aquarius: "Fixed",
      Gemini: "Mutable",
      Virgo: "Mutable",
      Sagittarius: "Mutable",
      Pisces: "Mutable",
    };

    planets.forEach((planet, name) => {
      const weight = this.getPlanetWeight(name);
      const element = signElements[planet.sign as keyof typeof signElements];
      const modality =
        signModalities[planet.sign as keyof typeof signModalities];

      if (element) elements.set(element, elements.get(element)! + weight);
      if (modality)
        modalities.set(modality, modalities.get(modality)! + weight);
    });

    return { elements, modalities };
  }

  private getPlanetWeight(planet: string): number {
    const weights: { [key: string]: number } = {
      Sun: 4,
      Moon: 4,
      Mercury: 2,
      Venus: 2,
      Mars: 2,
      Jupiter: 1,
      Saturn: 1,
      Uranus: 0.5,
      Neptune: 0.5,
      Pluto: 0.5,
      NorthNode: 1,
    };
    return weights[planet] || 1;
  }

  private generatePersonalOverview(chart: ComprehensiveBirthChart): string {
    const sun = chart.planets["Sun"];
    const moon = chart.planets["Moon"];
    const rising = this.getRisingSign(chart);

    return (
      `You are a ${sun?.sign} Sun with a ${moon?.sign} Moon and ${rising} Rising. ` +
      `This cosmic trinity reveals a soul journey of ${this.interpretTrinity(sun?.sign, moon?.sign, rising)}. ` +
      `Your dominant element is ${this.getDominantElement(chart.dominantElements)}, ` +
      `suggesting a natural affinity for ${this.getElementalGifts(chart.dominantElements)}.`
    );
  }

  private getRisingSign(chart: ComprehensiveBirthChart): string {
    // Rising sign is determined by the first house cusp
    const ascDegree = chart.houses.cusps[0];
    return this.getZodiacSign(ascDegree);
  }

  private interpretTrinity(
    sun?: string,
    moon?: string,
    rising?: string,
  ): string {
    // Implement sophisticated interpretation based on sun/moon/rising combination
    return `conscious expression through ${sun}, emotional wisdom via ${moon}, and worldly interface as ${rising}`;
  }

  private getDominantElement(elements: Map<string, number>): string {
    let dominant = "";
    let maxScore = 0;

    elements.forEach((score, element) => {
      if (score > maxScore) {
        maxScore = score;
        dominant = element;
      }
    });

    return dominant;
  }

  private getElementalGifts(elements: Map<string, number>): string {
    const dominant = this.getDominantElement(elements);
    const gifts: { [key: string]: string } = {
      Fire: "inspiration, leadership, and creative manifestation",
      Water: "emotional depth, intuitive wisdom, and healing presence",
      Earth: "practical wisdom, grounding energy, and material mastery",
      Air: "mental clarity, communication gifts, and innovative thinking",
    };
    return gifts[dominant] || "balanced elemental expression";
  }

  private determineArchetypes(chart: ComprehensiveBirthChart): {
    beingArchetype: string;
    becomingArchetype: string;
  } {
    // Being archetype based on Sun/Moon/Rising
    const sun = chart.planets["Sun"];
    const moon = chart.planets["Moon"];

    // Becoming archetype based on North Node and progressed positions
    const northNode = chart.planets["NorthNode"];

    // Implement archetype determination logic
    const beingArchetype = this.calculateBeingArchetype(sun, moon, chart);
    const becomingArchetype = this.calculateBecomingArchetype(northNode, chart);

    return { beingArchetype, becomingArchetype };
  }

  private calculateBeingArchetype(
    sun: any,
    moon: any,
    chart: ComprehensiveBirthChart,
  ): string {
    // Sophisticated archetype calculation based on planetary positions
    // This is a simplified version
    const archetypes = {
      Fire: ["The Pioneer", "The Warrior", "The Visionary"],
      Water: ["The Healer", "The Mystic", "The Empath"],
      Earth: ["The Builder", "The Guardian", "The Provider"],
      Air: ["The Messenger", "The Teacher", "The Innovator"],
    };

    const dominant = this.getDominantElement(chart.dominantElements);
    const options =
      archetypes[dominant as keyof typeof archetypes] || archetypes.Fire;

    // Select based on sun sign characteristics
    return options[0]; // Simplified - would use more complex logic
  }

  private calculateBecomingArchetype(
    northNode: any,
    chart: ComprehensiveBirthChart,
  ): string {
    // Calculate evolutionary direction based on North Node
    const nodeSign = northNode?.sign || "Aries";
    const nodeHouse = northNode?.house || 1;

    // Map node placement to becoming archetype
    const becomingArchetypes: { [key: string]: string } = {
      Aries: "The Sovereign Self",
      Taurus: "The Sacred Guardian",
      Gemini: "The Bridge Builder",
      Cancer: "The Sacred Mother",
      Leo: "The Radiant Creator",
      Virgo: "The Sacred Servant",
      Libra: "The Harmonizer",
      Scorpio: "The Alchemist",
      Sagittarius: "The Wisdom Keeper",
      Capricorn: "The Master Builder",
      Aquarius: "The Revolutionary",
      Pisces: "The Mystic Dreamer",
    };

    return becomingArchetypes[nodeSign] || "The Evolving Soul";
  }

  private generateElementalInsights(
    phaseMapping: SpiralogicPhaseMapping,
    chart: ComprehensiveBirthChart,
  ): { [key: string]: ElementalInsight } {
    const insights: { [key: string]: ElementalInsight } = {};

    for (const [element, planets] of Object.entries(phaseMapping)) {
      insights[element] = {
        element: element.charAt(0).toUpperCase() + element.slice(1),
        strength: this.calculateElementalStrength(element, chart),
        planets,
        interpretation: this.interpretElementalPresence(element, planets),
        challenges: this.identifyElementalChallenges(element, planets),
        gifts: this.identifyElementalGifts(element, planets),
        practices: this.suggestElementalPractices(element, planets),
      };
    }

    return insights;
  }

  private calculateElementalStrength(
    element: string,
    chart: ComprehensiveBirthChart,
  ): number {
    const elementMap = {
      fire: "Fire",
      water: "Water",
      earth: "Earth",
      air: "Air",
    };

    const elementScore =
      chart.dominantElements.get(
        elementMap[element as keyof typeof elementMap],
      ) || 0;
    const totalScore = Array.from(chart.dominantElements.values()).reduce(
      (a, b) => a + b,
      0,
    );

    return Math.round((elementScore / totalScore) * 100);
  }

  private interpretElementalPresence(
    element: string,
    planets: PlanetPlacement[],
  ): string {
    const interpretations: { [key: string]: string } = {
      fire: `Your Fire houses contain ${planets.length} planetary activations, igniting themes of identity, creativity, and spiritual expansion. `,
      water: `Your Water houses hold ${planets.length} celestial bodies, deepening your connection to emotion, transformation, and mystical wisdom. `,
      earth: `Your Earth houses are blessed with ${planets.length} planetary presences, grounding you in material mastery, service, and worldly achievement. `,
      air: `Your Air houses dance with ${planets.length} planetary energies, enhancing communication, relationships, and intellectual pursuits. `,
    };

    let interpretation = interpretations[element] || "";

    // Add specific planet interpretations
    if (planets.length > 0) {
      const keyPlanet = planets.find((p) =>
        ["Sun", "Moon", "Mars", "Venus"].includes(p.planet),
      );
      if (keyPlanet) {
        interpretation += `${keyPlanet.planet} in the ${keyPlanet.house}th house particularly emphasizes ${this.getPlanetHouseTheme(keyPlanet.planet, keyPlanet.house)}.`;
      }
    }

    return interpretation;
  }

  private getPlanetHouseTheme(planet: string, house: number): string {
    // Simplified interpretation - would be much more detailed
    const themes: { [key: number]: string } = {
      1: "self-expression and identity",
      2: "values and resources",
      3: "communication and learning",
      4: "home and emotional foundations",
      5: "creativity and joy",
      6: "service and health",
      7: "partnerships and balance",
      8: "transformation and shared resources",
      9: "philosophy and expansion",
      10: "career and public role",
      11: "community and vision",
      12: "spirituality and transcendence",
    };

    return themes[house] || "life themes";
  }

  private identifyElementalChallenges(
    element: string,
    planets: PlanetPlacement[],
  ): string[] {
    const baseChallenges: { [key: string]: string[] } = {
      fire: [
        "Balancing enthusiasm with patience",
        "Grounding visionary impulses in practical action",
        "Managing the intensity of creative fire",
      ],
      water: [
        "Maintaining emotional boundaries",
        "Navigating deep transformational currents",
        "Trusting intuitive wisdom over logic",
      ],
      earth: [
        "Releasing rigid control patterns",
        "Embracing change and uncertainty",
        "Balancing material and spiritual values",
      ],
      air: [
        "Moving from mental analysis to embodied feeling",
        "Creating focus amidst multiple interests",
        "Grounding ideas in practical reality",
      ],
    };

    const challenges = baseChallenges[element] || [];

    // Add specific challenges based on planetary placements
    planets.forEach((planet) => {
      if (planet.retrograde) {
        challenges.push(
          `Integrating the retrograde wisdom of ${planet.planet}`,
        );
      }
    });

    return challenges.slice(0, 3); // Return top 3 challenges
  }

  private identifyElementalGifts(
    element: string,
    planets: PlanetPlacement[],
  ): string[] {
    const baseGifts: { [key: string]: string[] } = {
      fire: [
        "Natural leadership and inspiration",
        "Creative manifestation power",
        "Spiritual pioneering abilities",
      ],
      water: [
        "Deep emotional intelligence",
        "Healing and transformative presence",
        "Mystical and intuitive gifts",
      ],
      earth: [
        "Practical wisdom and grounding",
        "Manifestation through persistent effort",
        "Nurturing and protective qualities",
      ],
      air: [
        "Brilliant communication abilities",
        "Innovative and original thinking",
        "Natural teaching and bridging gifts",
      ],
    };

    return baseGifts[element] || [];
  }

  private suggestElementalPractices(
    element: string,
    planets: PlanetPlacement[],
  ): string[] {
    const practices: { [key: string]: string[] } = {
      fire: [
        "Morning sun salutations to honor your solar nature",
        "Creative expression through art, dance, or writing",
        "Candle meditation for focused intention setting",
      ],
      water: [
        "Moon bathing and lunar cycle awareness",
        "Sacred bathing rituals with herbs and salts",
        "Dream journaling and symbolic exploration",
      ],
      earth: [
        "Grounding practices in nature",
        "Crystal meditation and earth altar creation",
        "Embodiment practices like yoga or tai chi",
      ],
      air: [
        "Breathwork and pranayama practices",
        "Journaling for mental clarity",
        "Communication circles and sacred dialogue",
      ],
    };

    return practices[element] || [];
  }

  private analyzeKarmicAxis(chart: ComprehensiveBirthChart): any {
    const northNode = chart.planets["NorthNode"];
    const saturn = chart.planets["Saturn"];
    const pluto = chart.planets["Pluto"];

    // Calculate South Node (opposite North Node)
    const southNodeDegree = (northNode?.degree || 0) + 180;
    const southNodeSign = this.getZodiacSign(southNodeDegree % 360);

    return {
      northNode: {
        placement: northNode,
        interpretation: this.interpretNorthNode(northNode),
        lessons: this.getNorthNodeLessons(northNode),
        evolutionary_direction: this.getEvolutionaryDirection(northNode),
      },
      southNode: {
        placement: {
          ...northNode,
          degree: southNodeDegree % 360,
          sign: southNodeSign,
        },
        interpretation: this.interpretSouthNode(southNodeSign),
        lessons: this.getSouthNodeLessons(southNodeSign),
        evolutionary_direction: "Release and integrate past life patterns",
      },
      saturn: {
        placement: saturn,
        interpretation: this.interpretSaturn(saturn),
        lessons: this.getSaturnLessons(saturn),
        evolutionary_direction: this.getSaturnEvolution(saturn),
      },
      pluto: {
        placement: pluto,
        interpretation: this.interpretPluto(pluto),
        lessons: this.getPlutoLessons(pluto),
        evolutionary_direction: this.getPlutoEvolution(pluto),
      },
    };
  }

  private interpretNorthNode(node: any): string {
    return `Your North Node in ${node?.sign} in the ${node?.house}th house represents your soul's evolutionary direction in this lifetime.`;
  }

  private getNorthNodeLessons(node: any): string[] {
    // Implement based on sign/house placement
    return [
      `Embrace the qualities of ${node?.sign}`,
      `Develop skills related to ${node?.house}th house matters`,
      "Trust the unknown path of soul evolution",
    ];
  }

  private getEvolutionaryDirection(node: any): string {
    const directions: { [key: string]: string } = {
      Aries: "Develop independent identity and courage",
      Taurus: "Cultivate self-worth and material stability",
      Gemini: "Embrace curiosity and communication",
      Cancer: "Nurture emotional intelligence and family",
      Leo: "Express creative self and leadership",
      Virgo: "Serve through practical skills and discernment",
      Libra: "Create harmony through partnership",
      Scorpio: "Transform through deep intimacy and power",
      Sagittarius: "Expand through wisdom and adventure",
      Capricorn: "Build lasting structures and authority",
      Aquarius: "Innovate for collective evolution",
      Pisces: "Surrender to spiritual unity",
    };

    return directions[node?.sign] || "Follow your unique soul path";
  }

  private interpretSouthNode(sign: string): string {
    return `Your South Node in ${sign} represents innate gifts and patterns from past incarnations that now seek integration.`;
  }

  private getSouthNodeLessons(sign: string): string[] {
    return [
      `Release over-identification with ${sign} traits`,
      "Honor past gifts while embracing new growth",
      "Transform comfort zones into conscious strengths",
    ];
  }

  private interpretSaturn(saturn: any): string {
    return `Saturn in ${saturn?.sign} in the ${saturn?.house}th house represents your path of mastery through discipline and responsibility.`;
  }

  private getSaturnLessons(saturn: any): string[] {
    return [
      `Master the lessons of ${saturn?.sign}`,
      `Build lasting structures in ${saturn?.house}th house areas`,
      "Transform limitations into strengths",
    ];
  }

  private getSaturnEvolution(saturn: any): string {
    return `Achieve mastery through patient dedication in ${saturn?.sign} themes`;
  }

  private interpretPluto(pluto: any): string {
    return `Pluto in ${pluto?.sign} in the ${pluto?.house}th house reveals your deepest transformational journey and power reclamation.`;
  }

  private getPlutoLessons(pluto: any): string[] {
    return [
      `Transform shadow aspects of ${pluto?.sign}`,
      `Reclaim power in ${pluto?.house}th house matters`,
      "Embrace death/rebirth cycles",
    ];
  }

  private getPlutoEvolution(pluto: any): string {
    return `Phoenix-like transformation through ${pluto?.sign} in the ${pluto?.house}th house`;
  }

  private createReflectiveProtocols(
    elementalInsights: any,
    karmicAxis: any,
  ): ReflectiveProtocol[] {
    const protocols: ReflectiveProtocol[] = [];

    // Create protocol for dominant element
    const dominantElement = this.findDominantElement(elementalInsights);
    protocols.push(this.createElementalProtocol(dominantElement));

    // Create karmic integration protocol
    protocols.push(this.createKarmicProtocol(karmicAxis));

    // Create daily practice protocol
    protocols.push(this.createDailyProtocol(elementalInsights));

    // Create new/full moon protocol
    protocols.push(this.createLunarProtocol(elementalInsights));

    return protocols;
  }

  private findDominantElement(insights: any): string {
    let dominant = "";
    let maxStrength = 0;

    Object.entries(insights).forEach(([element, insight]: [string, any]) => {
      if (insight.strength > maxStrength) {
        maxStrength = insight.strength;
        dominant = element;
      }
    });

    return dominant;
  }

  private createElementalProtocol(element: string): ReflectiveProtocol {
    const protocols: { [key: string]: ReflectiveProtocol } = {
      fire: {
        name: "Solar Fire Activation",
        element: "Fire",
        description:
          "A morning practice to ignite your creative fire and align with solar consciousness",
        steps: [
          "Face the rising sun (or visualize if cloudy)",
          "Light a red or orange candle",
          "State your creative intention for the day",
          "Move your body dynamically for 5 minutes",
          "Close with hands on heart, feeling your inner flame",
        ],
        timing: "Dawn or early morning",
        materials: ["Candle", "Matches", "Open space for movement"],
      },
      water: {
        name: "Lunar Water Attunement",
        element: "Water",
        description:
          "An evening practice to connect with emotional wisdom and lunar consciousness",
        steps: [
          "Draw a ritual bath with sea salt",
          "Light white or silver candles around the bath",
          "Submerge and feel emotional currents",
          "Visualize releasing what no longer serves",
          "Emerge renewed, blessing yourself with water",
        ],
        timing: "Evening, ideally during moon visibility",
        materials: ["Sea salt", "Candles", "Essential oils (optional)"],
      },
      earth: {
        name: "Earth Grounding Ritual",
        element: "Earth",
        description:
          "A grounding practice to connect with Earth wisdom and material manifestation",
        steps: [
          "Stand barefoot on earth (or hold crystals)",
          "Feel roots growing from your feet",
          "State what you wish to manifest",
          "Place hands on earth, offering gratitude",
          "Collect a small stone as anchor",
        ],
        timing: "Midday or late afternoon",
        materials: ["Access to earth/nature", "Crystals (optional)"],
      },
      air: {
        name: "Air Element Clarity Practice",
        element: "Air",
        description:
          "A breathwork practice to clear mental fog and enhance communication",
        steps: [
          "Sit in open air or by a window",
          "Practice 4-7-8 breathing for 5 rounds",
          "Write stream-of-consciousness for 10 minutes",
          "Read aloud what wishes to be spoken",
          "Release papers to wind or burn safely",
        ],
        timing: "Morning or when mental clarity needed",
        materials: ["Journal", "Pen", "Incense (optional)"],
      },
    };

    return protocols[element] || protocols.fire;
  }

  private createKarmicProtocol(karmicAxis: any): ReflectiveProtocol {
    return {
      name: "Karmic Integration Meditation",
      element: "Aether",
      description:
        "A practice to integrate North Node lessons and release South Node patterns",
      steps: [
        `Meditate on your North Node in ${karmicAxis.northNode.placement?.sign}`,
        `Visualize stepping into your evolutionary direction`,
        `Honor South Node gifts in ${karmicAxis.southNode.placement?.sign}`,
        "Feel the integration of past wisdom and future calling",
        "Journal insights about your soul's journey",
      ],
      timing: "Weekly, on the day of your birth",
      materials: ["Meditation space", "Journal", "Amethyst or clear quartz"],
    };
  }

  private createDailyProtocol(insights: any): ReflectiveProtocol {
    return {
      name: "Elemental Balance Daily Practice",
      element: "All Elements",
      description: "A brief daily practice to harmonize all elemental energies",
      steps: [
        "Morning: Light candle for Fire (inspiration)",
        "Midday: Touch earth/plant for Earth (grounding)",
        "Afternoon: Deep breathing for Air (clarity)",
        "Evening: Water blessing for Water (emotion)",
        "Night: Meditation for Aether (integration)",
      ],
      timing: "Throughout the day at natural transitions",
      materials: ["Candle", "Plant or stone", "Water bowl"],
    };
  }

  private createLunarProtocol(insights: any): ReflectiveProtocol {
    return {
      name: "New & Full Moon Ceremony",
      element: "Water/Aether",
      description: "Lunar cycle rituals for manifestation and release",
      steps: [
        "New Moon: Set intentions aligned with elemental strengths",
        "Create elemental altar with representations",
        "Full Moon: Release what blocks elemental flow",
        "Burn or bury representations of limitations",
        "Both: Connect with your natal Moon sign energy",
      ],
      timing: "New Moon and Full Moon (+/- 3 days)",
      materials: ["Elemental representations", "Paper", "Ceremonial items"],
    };
  }
}

export const spiralogicAstrologyService = new SpiralogicAstrologyService();

/**
 * The Chinese zodiac reading for a Chinese year: animal, element, polarity,
 * personality, strengths, Spiralogic integration, life guidance, compatibility
 * and the element's holistic (TCM) profile.
 *
 * A pure function of the Chinese year, so it runs in the browser (Free page)
 * or on the server (Pro room) and returns plain, serialisable data that holds
 * no birth detail.
 */
import {
  ChineseZodiacAnimal,
  ChineseElement,
  ElementHolisticProfile,
  getChineseZodiacAnimal,
  getChineseElement,
  getYinYang,
  getSexagenaryPosition,
  getElementHolisticProfile,
} from './chineseAstrology';

export interface ChineseReadingData {
  zodiacAnimal: ChineseZodiacAnimal;
  element: ChineseElement;
  yinYang: 'yin' | 'yang';
  cycleYear: number;
  personalityProfile: string[];
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
  spiralogicIntegration: {
    primaryElement: string;
    secondaryElements: string[];
    evolutionaryPath: string;
    consciousnessActivation: string;
  };
  lifeGuidance: {
    careerPaths: string[];
    relationships: string[];
    spiritualDevelopment: string[];
    healthWellness: string[];
  };
  compatibility: {
    mostCompatible: string[];
    challenging: string[];
    analysis: string;
  };
  holisticProfile: ElementHolisticProfile | null;
}

export function buildChineseReading(year: number): ChineseReadingData {
  const zodiacAnimal = getChineseZodiacAnimal(year);
  const element = getChineseElement(year);
  const yinYang = getYinYang(year);
  const cyclePosition = getSexagenaryPosition(year);

  // Map Chinese element to Spiralogic element
  const spiralogicMap: Record<string, { primary: string; secondary: string[] }> = {
    wood: { primary: 'Air', secondary: ['Earth', 'Water'] },
    fire: { primary: 'Fire', secondary: ['Air', 'Earth'] },
    earth: { primary: 'Earth', secondary: ['Fire', 'Water'] },
    metal: { primary: 'Aether', secondary: ['Earth', 'Air'] },
    water: { primary: 'Water', secondary: ['Earth', 'Aether'] }
  };

  const spiralogicMapping = spiralogicMap[element.name] || { primary: 'Earth', secondary: ['Fire', 'Water'] };

  // Get the holistic profile for this element
  const holisticProfile = getElementHolisticProfile(element.name);

  const readingData: ChineseReadingData = {
    zodiacAnimal,
    element,
    yinYang,
    cycleYear: cyclePosition,
    holisticProfile,
    personalityProfile: [
      `${zodiacAnimal.archetype} with ${element.name} energy`,
      `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} element brings ${element.characteristics.slice(0, 2).join(' and ')}`,
      `${yinYang.charAt(0).toUpperCase() + yinYang.slice(1)} energy provides ${yinYang === 'yang' ? 'active, expressive' : 'receptive, introspective'} nature`
    ],
    strengthsWeaknesses: {
      strengths: zodiacAnimal.strengths,
      weaknesses: zodiacAnimal.challenges
    },
    spiralogicIntegration: {
      primaryElement: spiralogicMapping.primary,
      secondaryElements: spiralogicMapping.secondary,
      evolutionaryPath: `${zodiacAnimal.archetype} walking the ${element.name} path toward ${spiralogicMapping.primary} consciousness`,
      consciousnessActivation: `Your ${element.name} ${zodiacAnimal.name} energy activates through ${element.characteristics[0]} and ${zodiacAnimal.characteristics[0]}`
    },
    lifeGuidance: {
      careerPaths: [
        `Roles that honor ${zodiacAnimal.archetype.toLowerCase()} qualities`,
        `Fields aligned with ${element.name} element - ${element.characteristics.slice(0, 2).join(', ')}`,
        `Environments that support ${zodiacAnimal.characteristics[0]} expression`
      ],
      relationships: [
        `Naturally harmonious with ${zodiacAnimal.compatibility.slice(0, 2).join(' and ')}`,
        `Values ${zodiacAnimal.characteristics[1]} and ${zodiacAnimal.characteristics[2]} in partnerships`,
        `${yinYang === 'yang' ? 'Takes initiative' : 'Offers receptivity'} in relationships`
      ],
      spiritualDevelopment: [
        `Meditate with ${element.name} element imagery`,
        `Honor the ${zodiacAnimal.archetype.toLowerCase()} within`,
        `Balance ${yinYang} energy through ${yinYang === 'yang' ? 'stillness practices' : 'active movement'}`
      ],
      healthWellness: [
        `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} constitution benefits from ${element.direction} direction and ${element.season} renewal`,
        `${zodiacAnimal.name} energy supports ${zodiacAnimal.strengths[0].toLowerCase()}`,
        `Lucky colors for vitality: ${zodiacAnimal.luckyColors.slice(0, 2).join(', ')}`
      ]
    },
    compatibility: {
      mostCompatible: zodiacAnimal.compatibility,
      challenging: zodiacAnimal.incompatible,
      analysis: `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} ${zodiacAnimal.name}s are most harmonious with ${zodiacAnimal.compatibility.join(', ')}. Growth opportunities arise with ${zodiacAnimal.incompatible.join(', ')}.`
    }
  };
  return readingData;
}

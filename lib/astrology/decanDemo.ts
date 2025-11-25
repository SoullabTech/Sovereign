/**
 * 36 FACES DECAN SYSTEM - DEMONSTRATION
 *
 * This file demonstrates how the Austin Coppock-inspired decan system
 * integrates with Spiralogic for Loralee and other professional astrologers.
 */

import {
  calculatePlanetaryDecan,
  calculateBirthChartDecans,
  getDecanSummary,
  getStrongestDecanInfluence,
  type BirthChartDecans,
} from './decanCalculator';

import {
  DECANS,
  getDecanByDegree,
  getDecansBySign,
  getDecansByElement,
  interpretPlanetInDecan,
} from './decanSystem';

/**
 * EXAMPLE 1: Calculate Decan for a Single Planetary Position
 */
export function demoSinglePlanetDecan() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('EXAMPLE 1: Single Planet Decan Calculation');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Example: Sun at 17° Taurus
  const sunDecan = calculatePlanetaryDecan('Sun', 47); // 30° (Taurus starts) + 17°

  if (sunDecan) {
    console.log(`Planet: ${sunDecan.planet}`);
    console.log(`Degree: ${sunDecan.absoluteDegree}° (${sunDecan.degreeInSign}° ${sunDecan.sign})`);
    console.log(`Decan: ${sunDecan.decan.name}`);
    console.log(`Decan Number: ${sunDecan.decanNumber}`);
    console.log(`Ruler: ${sunDecan.decanRuler}`);
    console.log(`Tarot: ${sunDecan.decan.tarotCard}`);
    console.log(`Archetype: ${sunDecan.decan.archetype}`);
    console.log(`\nSymbolism: ${sunDecan.decan.symbolism}`);
    console.log(`\nImage: ${sunDecan.decan.image}`);
    console.log('\n-----------------------------------------------------------\n');
    console.log('FULL INTERPRETATION:\n');
    console.log(sunDecan.interpretation);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n\n');
}

/**
 * EXAMPLE 2: View All Decans for a Specific Sign
 */
export function demoSignDecans() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('EXAMPLE 2: All Decans for Scorpio (for Loralee\'s practice)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const scorpioDecans = getDecansBySign('Scorpio');

  scorpioDecans.forEach((decan, index) => {
    console.log(`DECAN ${index + 1}: ${decan.name}`);
    console.log(`  Degrees: ${decan.startDegreeInSign}°-${decan.endDegreeInSign}° Scorpio`);
    console.log(`  Ruler: ${decan.ruler}`);
    console.log(`  Tarot: ${decan.tarotCard}`);
    console.log(`  Archetype: ${decan.archetype}`);
    console.log(`  Image: ${decan.image}`);
    console.log(`  Ritual Timing: ${decan.ritualTiming}\n`);
  });

  console.log('═══════════════════════════════════════════════════════════\n\n');
}

/**
 * EXAMPLE 3: Calculate Full Birth Chart Decans
 */
export function demoFullBirthChartDecans() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('EXAMPLE 3: Complete Birth Chart Decan Analysis');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Sample birth chart data (Kelly's chart or test data)
  const sampleChart = new Map<string, { degree: number }>([
    ['Sun', { degree: 278 }],      // Sun at 8° Capricorn
    ['Moon', { degree: 195 }],     // Moon at 15° Libra
    ['Mercury', { degree: 265 }],  // Mercury at 25° Sagittarius
    ['Venus', { degree: 290 }],    // Venus at 20° Capricorn
    ['Mars', { degree: 142 }],     // Mars at 22° Leo
    ['Jupiter', { degree: 335 }],  // Jupiter at 5° Pisces
    ['Saturn', { degree: 250 }],   // Saturn at 10° Sagittarius
    ['Uranus', { degree: 220 }],   // Uranus at 10° Scorpio
    ['Neptune', { degree: 345 }],  // Neptune at 15° Pisces
    ['Pluto', { degree: 230 }],    // Pluto at 20° Scorpio
    ['NorthNode', { degree: 110 }], // North Node at 20° Cancer
  ]);

  const chartDecans = calculateBirthChartDecans(sampleChart);

  // Print summary
  const summary = getDecanSummary(chartDecans);
  console.log(summary);

  // Strongest influence
  console.log('\n');
  const strongest = getStrongestDecanInfluence(chartDecans);
  if (strongest) {
    console.log(`STRONGEST DECAN INFLUENCE: ${strongest.ruler}`);
    console.log(`Number of placements: ${strongest.count}`);
    console.log(`\n${strongest.interpretation}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n\n');
}

/**
 * EXAMPLE 4: Decan Distribution by Element (Spiralogic Integration)
 */
export function demoElementalDecanDistribution() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('EXAMPLE 4: Decan Distribution by Spiralogic Elements');
  console.log('═══════════════════════════════════════════════════════════\n');

  const fireDecans = getDecansByElement('Fire');
  const waterDecans = getDecansByElement('Water');
  const earthDecans = getDecansByElement('Earth');
  const airDecans = getDecansByElement('Air');

  console.log('FIRE DECANS (Right Prefrontal Cortex - Visionary Energy):');
  fireDecans.forEach((d) =>
    console.log(`  • ${d.name} (${d.sign} ${d.decanNumber}) - ${d.ruler} - ${d.tarotCard}`)
  );

  console.log('\nWATER DECANS (Right Hemisphere - Emotional/Intuitive):');
  waterDecans.forEach((d) =>
    console.log(`  • ${d.name} (${d.sign} ${d.decanNumber}) - ${d.ruler} - ${d.tarotCard}`)
  );

  console.log('\nEARTH DECANS (Left Hemisphere - Practical/Embodied):');
  earthDecans.forEach((d) =>
    console.log(`  • ${d.name} (${d.sign} ${d.decanNumber}) - ${d.ruler} - ${d.tarotCard}`)
  );

  console.log('\nAIR DECANS (Left Prefrontal Cortex - Relational/Communicative):');
  airDecans.forEach((d) =>
    console.log(`  • ${d.name} (${d.sign} ${d.decanNumber}) - ${d.ruler} - ${d.tarotCard}`)
  );

  console.log('\n═══════════════════════════════════════════════════════════\n\n');
}

/**
 * EXAMPLE 5: Tarot-Astrology Bridge
 */
export function demoTarotAstrologyBridge() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('EXAMPLE 5: Tarot Minor Arcana → Decan Mapping');
  console.log('═══════════════════════════════════════════════════════════\n');

  const suits = ['Wands', 'Cups', 'Pentacles', 'Swords'];

  suits.forEach((suit) => {
    console.log(`${suit.toUpperCase()} (${getSuitElement(suit)}):`);
    const suitDecans = DECANS.filter((d) => d.tarotSuit === suit);
    suitDecans.forEach((d) => {
      console.log(`  ${d.tarotCard}: ${d.name} (${d.sign} ${d.decanNumber}) - ${d.ruler}`);
    });
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n\n');
}

function getSuitElement(suit: string): string {
  const map: Record<string, string> = {
    Wands: 'Fire',
    Cups: 'Water',
    Pentacles: 'Earth',
    Swords: 'Air',
  };
  return map[suit] || '';
}

/**
 * RUN ALL DEMONSTRATIONS
 */
export function runAllDecanDemos() {
  console.log('\n\n');
  console.log('█████████████████████████████████████████████████████████████');
  console.log('█                                                           █');
  console.log('█   THE 36 FACES - AUSTIN COPPOCK DECAN SYSTEM             █');
  console.log('█   Integrated with Spiralogic for Loralee & Astrologers   █');
  console.log('█                                                           █');
  console.log('█████████████████████████████████████████████████████████████');
  console.log('\n\n');

  demoSinglePlanetDecan();
  demoSignDecans();
  demoFullBirthChartDecans();
  demoElementalDecanDistribution();
  demoTarotAstrologyBridge();

  console.log('\n\n');
  console.log('█████████████████████████████████████████████████████████████');
  console.log('█                                                           █');
  console.log('█   DECAN SYSTEM INTEGRATION COMPLETE                      █');
  console.log('█   Ready for Loralee\'s Professional Astrology Practice    █');
  console.log('█                                                           █');
  console.log('█████████████████████████████████████████████████████████████');
  console.log('\n\n');
}

// Export demo functions for testing
export default {
  demoSinglePlanetDecan,
  demoSignDecans,
  demoFullBirthChartDecans,
  demoElementalDecanDistribution,
  demoTarotAstrologyBridge,
  runAllDecanDemos,
};

/**
 * USAGE IN LORALEE'S PRACTICE:
 *
 * 1. BIRTH CHART READINGS:
 *    - Show client their Sun/Moon/Rising decans
 *    - Explain the "Face" they were born under
 *    - Connect to tarot for deeper divination
 *
 * 2. TRANSIT TIMING:
 *    - "Mars enters the 2nd decan of Aries (The Crown) March 31-April 9"
 *    - "This activates Solar authority and self-kingship energy"
 *
 * 3. TAROT-ASTROLOGY SYNTHESIS:
 *    - "You pulled the 6 of Cups - this is the Phoenix decan of Scorpio"
 *    - "Time for death-rebirth transformation"
 *
 * 4. MAGICAL TIMING:
 *    - Use decan.ritualTiming for ritual planning
 *    - Use decan.magicalPower for intention setting
 *
 * 5. SPIRALOGIC INTEGRATION:
 *    - Each decan maps to Spiralogic phase (begins/deepens/integrates)
 *    - Shows how traditional astrology aligns with consciousness framework
 */

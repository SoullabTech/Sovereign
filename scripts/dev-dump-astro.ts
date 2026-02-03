/**
 * Dev Dump Astro - Quick engine output verification
 *
 * Run: npx tsx scripts/dev-dump-astro.ts
 *
 * Shows top-level keys from each engine output to verify
 * what data is available for rendering.
 */

import {
  calculateMayanBirthSign,
  calculateCompleteMayanProfile,
  getTodaysMayanSign,
} from "@/lib/astrology/mayanAstrology";

import {
  getChineseZodiacAnimal,
  getChineseElement,
  getYinYang,
  getSexagenaryPosition,
  getElementHolisticProfile,
  calculateChineseBirthProfile,
} from "@/lib/astrology/chineseAstrology";

async function main() {
  const testDate = new Date("1985-03-21T14:30:00");
  const year = testDate.getFullYear();

  console.log("=== MAYAN ASTROLOGY ENGINE ===\n");

  const mayanSign = calculateMayanBirthSign(testDate);
  console.log("calculateMayanBirthSign keys:", Object.keys(mayanSign));
  console.log("  daySign keys:", Object.keys(mayanSign.daySign));
  console.log("  tone keys:", Object.keys(mayanSign.tone));

  const mayanProfile = calculateCompleteMayanProfile(testDate);
  console.log("\ncalculateCompleteMayanProfile keys:", Object.keys(mayanProfile));
  console.log("  pathOfLife keys:", Object.keys(mayanProfile.pathOfLife));
  console.log("  haab keys:", Object.keys(mayanProfile.haab));
  console.log("  cardinalDirection keys:", Object.keys(mayanProfile.cardinalDirection));

  const todaySign = getTodaysMayanSign();
  console.log("\ngetTodaysMayanSign keys:", Object.keys(todaySign));

  console.log("\n--- MAYAN SAMPLE OUTPUT ---");
  console.log(JSON.stringify({
    galacticSignature: mayanSign.galacticSignature,
    daySign: {
      name: mayanSign.daySign.name,
      element: mayanSign.daySign.element,
      archetype: mayanSign.daySign.archetype,
    },
    tone: {
      number: mayanSign.tone.number,
      name: mayanSign.tone.name,
    },
    pathOfLife: {
      youth: mayanProfile.pathOfLife.youth.galacticSignature,
      adulthood: mayanProfile.pathOfLife.adulthood.galacticSignature,
      future: mayanProfile.pathOfLife.future.galacticSignature,
    },
    haab: mayanProfile.haab.fullDate,
    cardinalDirection: mayanProfile.cardinalDirection.direction,
    lifeCycleInsight: mayanProfile.lifeCycleInsight.slice(0, 100) + "...",
  }, null, 2));

  console.log("\n\n=== CHINESE ASTROLOGY ENGINE ===\n");

  const zodiacAnimal = getChineseZodiacAnimal(year);
  console.log("getChineseZodiacAnimal keys:", Object.keys(zodiacAnimal));

  const element = getChineseElement(year);
  console.log("getChineseElement keys:", Object.keys(element));

  const yinYang = getYinYang(year);
  console.log("getYinYang:", yinYang);

  const cyclePos = getSexagenaryPosition(year);
  console.log("getSexagenaryPosition:", cyclePos);

  const holisticProfile = getElementHolisticProfile(element.name);
  if (holisticProfile) {
    console.log("\ngetElementHolisticProfile keys:", Object.keys(holisticProfile));
    console.log("  physical keys:", Object.keys(holisticProfile.physical));
    console.log("  emotional keys:", Object.keys(holisticProfile.emotional));
    console.log("  mental keys:", Object.keys(holisticProfile.mental));
    console.log("  spiritual keys:", Object.keys(holisticProfile.spiritual));
    console.log("  ancestral keys:", Object.keys(holisticProfile.ancestral));
  } else {
    console.log("\ngetElementHolisticProfile: null (element not found)");
  }

  const birthProfile = calculateChineseBirthProfile(testDate);
  console.log("\ncalculateChineseBirthProfile keys:", Object.keys(birthProfile));

  console.log("\n--- CHINESE SAMPLE OUTPUT ---");
  console.log(JSON.stringify({
    animal: {
      name: zodiacAnimal.name,
      symbol: zodiacAnimal.symbol,
      archetype: zodiacAnimal.archetype,
    },
    element: {
      name: element.name,
      season: element.season,
      direction: element.direction,
    },
    yinYang,
    cyclePosition: cyclePos,
    holisticProfile: holisticProfile ? {
      element: holisticProfile.element,
      physical: {
        yinOrgan: holisticProfile.physical.yinOrgan,
        yangOrgan: holisticProfile.physical.yangOrgan,
      },
      emotional: {
        primaryEmotion: holisticProfile.emotional.primaryEmotion,
        shadowEmotion: holisticProfile.emotional.shadowEmotion,
      },
      spiritual: {
        soulLesson: holisticProfile.spiritual.soulLesson,
        spiritualGift: holisticProfile.spiritual.spiritualGift,
      },
    } : null,
  }, null, 2));

  console.log("\n=== DONE ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

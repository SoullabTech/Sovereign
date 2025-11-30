import { addMinutes } from "date-fns";

export type Element = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export interface StemBranch {
  stem: string;
  branch: string;
  element: Element;
  yinYang: "Yin" | "Yang";
}

export interface FourPillarsProfile {
  year: StemBranch;
  month: StemBranch;
  day: StemBranch;
  hour: StemBranch;
  elementTally: Record<Element, number>;
  dominant: Element[];
  deficient: Element[];
  hexagram: string;
}

// Ten Heavenly Stems (天干)
const STEMS = [
  "Jia",
  "Yi",
  "Bing",
  "Ding",
  "Wu",
  "Ji",
  "Geng",
  "Xin",
  "Ren",
  "Gui",
];

// Twelve Earthly Branches (地支)
const BRANCHES = [
  "Zi",
  "Chou",
  "Yin",
  "Mao",
  "Chen",
  "Si",
  "Wu",
  "Wei",
  "Shen",
  "You",
  "Xu",
  "Hai",
];

// Element associations for stems
const STEM_ELEMENT: Element[] = [
  "Wood",
  "Wood",
  "Fire",
  "Fire",
  "Earth",
  "Earth",
  "Metal",
  "Metal",
  "Water",
  "Water",
];

// Yin/Yang polarity for stems
const STEM_YY = [
  "Yang",
  "Yin",
  "Yang",
  "Yin",
  "Yang",
  "Yin",
  "Yang",
  "Yin",
  "Yang",
  "Yin",
];

// Element associations for branches
const BRANCH_ELEMENT: Element[] = [
  "Water",
  "Earth",
  "Wood",
  "Wood",
  "Earth",
  "Fire",
  "Fire",
  "Earth",
  "Metal",
  "Metal",
  "Earth",
  "Water",
];

// Yin/Yang polarity for branches
const BRANCH_YY = [
  "Yang",
  "Yin",
  "Yang",
  "Yin",
  "Yang",
  "Yang",
  "Yin",
  "Yin",
  "Yang",
  "Yin",
  "Yang",
  "Yin",
];

/**
 * Generate Four Pillars (Ba Zi) profile from birth date and time
 * Note: This is a simplified implementation for demo purposes.
 * Production version should use proper Chinese Solar Calendar calculations.
 */
export function generateFourPillars(
  birth: Date,
  tzOffsetMinutes = 0,
): FourPillarsProfile {
  const local = addMinutes(birth, tzOffsetMinutes);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth() + 1;
  const d = local.getUTCDate();
  const h = local.getUTCHours();

  // Simplified calculations - real implementation should use Chinese Solar calendar
  const yearStemIndex = (y - 4) % 10;
  const yearBranchIndex = (y - 4) % 12;

  const pillar = (stemIdx: number, branchIdx: number): StemBranch => ({
    stem: STEMS[stemIdx],
    branch: BRANCHES[branchIdx],
    element: STEM_ELEMENT[stemIdx],
    yinYang: STEM_YY[stemIdx] as "Yin" | "Yang",
  });

  // Calculate each pillar
  const year = pillar(yearStemIndex, yearBranchIndex);

  // Month pillar (simplified - should use solar terms)
  const month = pillar((yearStemIndex + m) % 10, (yearBranchIndex + m) % 12);

  // Day pillar (simplified - should use proper Julian day calculation)
  const dayNumber = Math.floor(local.getTime() / 86400000);
  const day = pillar((dayNumber + 40) % 10, (dayNumber + 16) % 12);

  // Hour pillar (based on Chinese double-hour system)
  const hourBranchIndex = Math.floor((h + 1) / 2) % 12;
  const hourStemIndex = (yearStemIndex * 2 + hourBranchIndex) % 10;
  const hour = pillar(hourStemIndex, hourBranchIndex);

  // Count elements
  const tally: Record<Element, number> = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };
  [year, month, day, hour].forEach((p) => {
    tally[p.element]++;
    // Also count branch elements
    const branchElement = getBranchElement(p.branch);
    if (branchElement) {
      tally[branchElement]++;
    }
  });

  // Find dominant and deficient elements
  const max = Math.max(...Object.values(tally));
  const min = Math.min(...Object.values(tally));

  return {
    year,
    month,
    day,
    hour,
    elementTally: tally,
    dominant: Object.keys(tally).filter(
      (e) => tally[e as Element] === max,
    ) as Element[],
    deficient: Object.keys(tally).filter(
      (e) => tally[e as Element] === min,
    ) as Element[],
    hexagram: getHexagramByPillars(year.branch, month.branch),
  };
}

/**
 * Get element for a branch
 */
function getBranchElement(branch: string): Element | null {
  const index = BRANCHES.indexOf(branch);
  return index >= 0 ? BRANCH_ELEMENT[index] : null;
}

/**
 * Generate I Ching hexagram from pillars
 * Placeholder implementation - would use proper Ba Zi to I Ching mapping
 */
export function getHexagramByPillars(
  yearBranch: string,
  monthBranch: string,
): string {
  const yearIndex = BRANCHES.indexOf(yearBranch);
  const monthIndex = BRANCHES.indexOf(monthBranch);

  // Simple mapping based on branch combinations
  const hexagramMap: Record<string, string> = {
    ZiZi: "䷀ Qian / Creative",
    ChouChou: "䷁ Kun / Receptive",
    YinYin: "䷂ Zhun / Difficulty at Beginning",
    MaoMao: "䷃ Meng / Youthful Folly",
    ChenChen: "䷄ Xu / Waiting",
    SiSi: "䷅ Song / Conflict",
    WuWu: "䷆ Shi / Army",
    WeiWei: "䷇ Pi / Holding Together",
    ShenShen: "䷈ Xiao Xu / Small Taming",
    YouYou: "䷉ Lu / Treading",
    XuXu: "䷊ Tai / Peace",
    HaiHai: "䷋ Pi / Standstill",
  };

  const key = yearBranch + monthBranch;
  return hexagramMap[key] || "䷀ Qian / Creative Heaven";
}

/**
 * Get element relationship (generation/destruction cycles)
 */
export function getElementRelationship(
  element1: Element,
  element2: Element,
): "generates" | "destroys" | "neutral" {
  const generationCycle: Record<Element, Element> = {
    Wood: "Fire",
    Fire: "Earth",
    Earth: "Metal",
    Metal: "Water",
    Water: "Wood",
  };

  const destructionCycle: Record<Element, Element> = {
    Wood: "Earth",
    Fire: "Metal",
    Earth: "Water",
    Metal: "Wood",
    Water: "Fire",
  };

  if (generationCycle[element1] === element2) return "generates";
  if (destructionCycle[element1] === element2) return "destroys";
  return "neutral";
}

/**
 * Calculate elemental balance score (0-100)
 */
export function calculateElementalBalance(profile: FourPillarsProfile): number {
  const values = Object.values(profile.elementTally);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) /
    values.length;

  // Lower variance = better balance
  return Math.max(0, 100 - variance * 25);
}

/**
 * Get personality insights based on dominant elements
 */
export function getElementalPersonality(dominant: Element[]): string[] {
  const personalities: Record<Element, string[]> = {
    Wood: ["Growth-oriented", "Creative", "Flexible", "Pioneering"],
    Fire: ["Passionate", "Charismatic", "Expressive", "Inspiring"],
    Earth: ["Stable", "Nurturing", "Practical", "Reliable"],
    Metal: ["Precise", "Organized", "Disciplined", "Analytical"],
    Water: ["Intuitive", "Adaptive", "Wise", "Mysterious"],
  };

  return dominant.flatMap((element) => personalities[element] || []);
}

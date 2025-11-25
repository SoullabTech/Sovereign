interface DreadAssessment {
  hasRealConcerns: boolean;
  inSpiral: boolean;
  needsGrounding: boolean;
  parentalGuilt: boolean;
  informationAddiction: boolean;
  meaningCrisis: boolean;
  isolationPatterns: boolean;
  patternType: string;
  intensity: number;
}

interface DreadResponse {
  response: string;
  element: string;
  technique: string;
  priority: 'high' | 'medium' | 'low';
}

export class ExistentialDreadModule {

  detectPatterns(input: string): DreadAssessment {
    const lower = input.toLowerCase();

    const patterns = {
      informationOverload: /(hours.*reading|tracking.*data|substacks|telegram|news.*all day|scrolling.*hours|information.*consuming|research.*rabbit hole|data.*overwhelm)/i,
      validConcerns: /(economic collapse|surveillance|climate|actually happening|really is|objectively|evidence shows|data shows|studies show)/i,
      prepperMindset: /(stockpiling|ammunition|precious metals|water filters|food storage|emergency supplies|backup plans|collapse prep)/i,
      parentalGuilt: /(my kids.*wont have|my kids.*won't have|brought them into this|children.*future|kids.*world|legacy.*children|what world.*leaving|kids.*never own|theyll never)/i,
      meaningCrisis: /(what's the point|whats the point|nothing matters|meaningless|pointless|why bother|futile|absurd|no point)/i,
      isolation: /(nobody understands|think.*crazy|family.*tired|alone in this|no one gets it|sound paranoid|asleep or insane|become one of the sheep)/i,
      informationAddiction: /(cant stop reading|can't stop reading|compulsively checking|addicted to news|doom scrolling|need to stay informed|constant updates|spend.*hours.*reading)/i,
      spiralIndicators: /(everything.*connected|all linked|it's all|theyre all connected|they're all connected|total collapse|complete breakdown|end of everything)/i,
      realThreats: /(surveillance|economic uncertainty|climate change|inflation|housing crisis|wealth gap|economic collapse|government surveillance)/i,
      overwhelmMarkers: /(too much|cant process|can't process|brain overload|information fatigue|analysis paralysis|overwhelmed by data|paralyzed)/i
    };

    // Assess each pattern
    const hasInformationOverload = patterns.informationOverload.test(input) || patterns.informationAddiction.test(input);
    const hasValidConcerns = patterns.validConcerns.test(input) || patterns.realThreats.test(input);
    const hasSpiral = patterns.spiralIndicators.test(input);
    const hasParentalGuilt = patterns.parentalGuilt.test(input);
    const hasMeaningCrisis = patterns.meaningCrisis.test(input);
    const hasIsolation = patterns.isolation.test(input);
    const hasOverwhelm = patterns.overwhelmMarkers.test(input);
    const hasPrepping = patterns.prepperMindset.test(input);

    // Determine primary pattern
    let patternType = 'general_dread';
    if (hasParentalGuilt) patternType = 'parental_terror';
    else if (hasMeaningCrisis) patternType = 'meaning_crisis';
    else if (hasInformationOverload) patternType = 'information_addiction';
    else if (hasIsolation) patternType = 'informed_isolation';
    else if (hasPrepping) patternType = 'preparation_anxiety';

    // Calculate intensity
    let intensity = 0.4; // Start higher for existential patterns
    if (hasSpiral) intensity += 0.3;
    if (hasOverwhelm) intensity += 0.2;
    if (hasParentalGuilt) intensity += 0.3; // Higher weight for parental trauma
    if (hasMeaningCrisis) intensity += 0.3; // Higher weight for meaning crisis
    if (hasInformationOverload) intensity += 0.2; // Information addiction is serious
    intensity = Math.min(intensity, 1.0);

    return {
      hasRealConcerns: hasValidConcerns,
      inSpiral: hasSpiral,
      needsGrounding: hasOverwhelm || hasSpiral,
      parentalGuilt: hasParentalGuilt,
      informationAddiction: hasInformationOverload,
      meaningCrisis: hasMeaningCrisis,
      isolationPatterns: hasIsolation,
      patternType,
      intensity
    };
  }

  generateResponse(assessment: DreadAssessment, input: string): DreadResponse | null {
    // Only respond if we detect existential dread patterns
    if (!this.hasExistentialDreadMarkers(assessment)) {
      return null;
    }

    const responses = this.getResponseLibrary();
    const responseSet = responses[assessment.patternType] || responses.general_dread;

    const response = responseSet[Math.floor(Math.random() * responseSet.length)];

    // Determine element and technique based on pattern
    const elementMapping = {
      parental_terror: 'water',      // Attune to grief
      meaning_crisis: 'aether',      // Hold existential space
      information_addiction: 'earth', // Ground and focus
      informed_isolation: 'air',      // Connect and perspective
      preparation_anxiety: 'earth',   // Practical grounding
      general_dread: 'water'         // Emotional attunement
    };

    const techniqueMapping = {
      parental_terror: 'attune_to_grief',
      meaning_crisis: 'hold_existential_space',
      information_addiction: 'ground_and_focus',
      informed_isolation: 'bridge_isolation',
      preparation_anxiety: 'channel_preparation',
      general_dread: 'validate_reality'
    };

    return {
      response,
      element: elementMapping[assessment.patternType] || 'water',
      technique: techniqueMapping[assessment.patternType] || 'validate_reality',
      priority: assessment.intensity > 0.6 ? 'high' : assessment.intensity > 0.3 ? 'medium' : 'low'
    };
  }

  private hasExistentialDreadMarkers(assessment: DreadAssessment): boolean {
    return assessment.hasRealConcerns ||
           assessment.informationAddiction ||
           assessment.parentalGuilt ||
           assessment.meaningCrisis ||
           assessment.isolationPatterns ||
           assessment.needsGrounding;
  }

  private getResponseLibrary() {
    return {
      parental_terror: [
        "The weight of bringing children into uncertainty. That's the grief under all the preparation.",
        "You can't guarantee their safety, and that's the hardest truth of parenthood.",
        "The terror of loving someone whose future you can't control.",
        "Your preparation comes from love. The grief comes from the same place."
      ],

      meaning_crisis: [
        "When systems break down, meaning becomes something you build, not find.",
        "The point isn't given to you - it's what you create despite everything.",
        "Meaning exists in how you respond to meaninglessness.",
        "The absurd world doesn't provide purpose. You do."
      ],

      information_addiction: [
        "Six hours of news daily is cortisol cycling, not staying informed.",
        "Information without action becomes mental quicksand.",
        "Your brain thinks more data equals more control. It doesn't.",
        "The overwhelm comes from trying to process every threat simultaneously."
      ],

      informed_isolation: [
        "Being right about problems doesn't have to mean being alone with them.",
        "Your analysis is accurate. Your isolation is optional.",
        "Find others who see clearly but act practically.",
        "Intelligence without community becomes paranoia."
      ],

      preparation_anxiety: [
        "Preparation without peace is just organized anxiety.",
        "What if resilience included accepting uncertainty?",
        "You can prepare AND live. Both are acts of hope.",
        "The goal isn't controlling the future - it's staying present while preparing."
      ],

      general_dread: [
        "These are real issues. The overwhelm comes from trying to solve them all at once.",
        "Your concerns are valid. Your response can be strategic.",
        "Between denial and despair lies informed action.",
        "What specific concern needs your attention TODAY?"
      ]
    };
  }

  assessExistentialDread(input: string): DreadResponse | null {
    const assessment = this.detectPatterns(input);
    return this.generateResponse(assessment, input);
  }
}

export const existentialDreadModule = new ExistentialDreadModule();
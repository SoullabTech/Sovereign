import { CollectiveStats } from './CollectiveService';

export type NarrativeTone = 'poetic' | 'prophetic' | 'reflective' | 'mystical' | 'urgent' | 'ceremonial';

export interface OracleNarrative {
  tone: NarrativeTone;
  opening: string;
  archetypalReading: string;
  temporalInsight: string;
  collectiveGuidance: string;
  closing: string;
  fullNarrative: string;
}

export class CollectiveNarrativeService {
  private static instance: CollectiveNarrativeService;

  static getInstance(): CollectiveNarrativeService {
    if (!CollectiveNarrativeService.instance) {
      CollectiveNarrativeService.instance = new CollectiveNarrativeService();
    }
    return CollectiveNarrativeService.instance;
  }

  generateOracleNarrative(stats: CollectiveStats): OracleNarrative {
    const tone = this.selectNarrativeTone();
    const dominantArchetype = this.findDominantArchetype(stats);
    const emergingArchetype = stats.growthTrends.emergingArchetype;
    
    const opening = this.generateOpening(tone, stats);
    const archetypalReading = this.generateArchetypalReading(tone, dominantArchetype, emergingArchetype, stats);
    const temporalInsight = this.generateTemporalInsight(tone, stats);
    const collectiveGuidance = this.generateCollectiveGuidance(tone, stats);
    const closing = this.generateClosing(tone, stats);

    const fullNarrative = `${opening}\n\n${archetypalReading}\n\n${temporalInsight}\n\n${collectiveGuidance}\n\n${closing}`;

    return {
      tone,
      opening,
      archetypalReading,
      temporalInsight,
      collectiveGuidance,
      closing,
      fullNarrative
    };
  }

  private selectNarrativeTone(): NarrativeTone {
    const now = new Date();
    const week = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
    const hour = now.getHours();
    const month = now.getMonth();
    
    // Dynamic tone selection based on time patterns
    if (hour >= 3 && hour <= 6) return 'mystical'; // Deep night
    if (hour >= 7 && hour <= 11) return 'prophetic'; // Morning clarity
    if (hour >= 12 && hour <= 17) return 'reflective'; // Afternoon contemplation
    if (hour >= 18 && hour <= 21) return 'poetic'; // Evening beauty
    if (hour >= 22 || hour <= 2) return 'ceremonial'; // Sacred hours

    // Seasonal influences
    if (month >= 9 && month <= 11) return 'reflective'; // Autumn
    if (month >= 0 && month <= 2) return 'mystical'; // Winter
    if (month >= 3 && month <= 5) return 'poetic'; // Spring
    if (month >= 6 && month <= 8) return 'urgent'; // Summer

    // Weekly rhythm
    const tones: NarrativeTone[] = ['poetic', 'prophetic', 'reflective', 'mystical', 'urgent', 'ceremonial'];
    return tones[week % tones.length];
  }

  private findDominantArchetype(stats: CollectiveStats): string {
    return Object.entries(stats.archetypeDistribution)
      .sort(([, a], [, b]) => b - a)[0][0] || 'Unknown';
  }

  private generateOpening(tone: NarrativeTone, stats: CollectiveStats): string {
    const totalEncounters = stats.totalEncounters.toLocaleString();
    
    const openings = {
      poetic: `🌌 In this turning of the wheel, ${totalEncounters} souls have touched the infinite. The archetypal songs weave through the fabric of collective dreaming, each thread a story, each pattern a prayer.`,
      
      prophetic: `⚡ Behold! The signs are written in the field of consciousness. ${totalEncounters} encounters have been recorded in the akashic ledger. The currents shift, and what was hidden becomes visible.`,
      
      reflective: `🕯️ In quiet contemplation, we witness the flow of ${totalEncounters} transformational encounters. Like ripples on the surface of a still pond, each touch of awakening spreads outward.`,
      
      mystical: `🔮 Between the worlds, in the liminal space where dreams meet waking, ${totalEncounters} beings have crossed the threshold. The veil grows thin, and ancient wisdoms stir.`,
      
      urgent: `🔥 The time of awakening accelerates! ${totalEncounters} souls answer the call, and the collective field pulses with unprecedented intensity. Change moves like wildfire through consciousness.`,
      
      ceremonial: `✨ Sacred witness is held for ${totalEncounters} encounters with the numinous. In this holy moment, we gather the threads of collective transformation into the great weaving.`
    };
    
    return openings[tone];
  }

  private generateArchetypalReading(tone: NarrativeTone, dominant: string, emerging: string, stats: CollectiveStats): string {
    const archetypeReadings = {
      poetic: {
        Hero: `The Hero&apos;s flame burns brightest now, casting long shadows that dance with courage. Each soul carries a sword of their own forging, ready to cut through what no longer serves.`,
        Sage: `Ancient wisdom flows like honey from the collective hive. The Sage speaks through a thousand voices, each offering a drop of distilled understanding to those who thirst.`,
        Creator: `The cosmic artist awakens within the many. Colors that have never been seen splash across the canvas of possibility, as the Creator births new worlds from imagination's womb.`,
        Lover: `Hearts crack open like ripe fruit in the sun. The Lover moves through the field with tender mercy, weaving connections that transcend the illusion of separation.`,
        Seeker: `Restless questions arise like morning mist. The eternal Seeker stirs within, compass spinning toward true north, toward the magnetic pull of purpose and meaning.`,
        Shadow: `What has been rejected now demands integration. The Shadow emerges not as enemy but as forgotten friend, carrying the gold of wholeness in its dark embrace.`
      },
      prophetic: {
        Hero: `The Hero archetype rises to dominance, for great challenges approach that require courage and decisive action. Those who have been preparing shall step forward.`,
        Sage: `Wisdom is called forth from the depths. The Sage archetype emerges as teacher and guide, for the time of learning and integration has come.`,
        Creator: `Beware and rejoice - the Creator stirs! New forms shall manifest, innovations shall emerge, and the impossible shall become inevitable.`,
        Lover: `The heart's revolution begins. Love shall conquer divisions, and the Lover archetype shall heal what has been wounded in the collective soul.`,
        Seeker: `The great quest intensifies. Many shall feel the call to seek their true purpose, and the Seeker archetype shall guide them through the labyrinth.`,
        Shadow: `The Shadow rises for integration. What has been denied must be faced, and through this alchemy, collective wholeness shall be achieved.`
      },
      reflective: {
        Hero: `We observe the Hero's influence spreading gently through the collective. Courage builds not as explosive force, but as steady determination.`,
        Sage: `The Sage's presence brings a contemplative quality to the field. Many find themselves naturally drawn to deeper understanding and integration.`,
        Creator: `Creative energies flow in measured rhythms. The Creator inspires not with urgency, but with the patient joy of artistic unfolding.`,
        Lover: `Love moves through the collective with quiet grace. Hearts open gradually, like flowers following the arc of the sun.`,
        Seeker: `Questions arise organically from the depths of being. The Seeker's influence creates space for authentic inquiry and discovery.`,
        Shadow: `The Shadow's presence is felt as a deepening rather than a disruption. Integration proceeds with wisdom and self-compassion.`
      },
      mystical: {
        Hero: `In the twilight between worlds, the Hero's essence glows with otherworldly fire. Ancient warriors walk beside modern souls.`,
        Sage: `The Sage speaks from the akashic libraries, where all wisdom is stored. Knowledge flows through veils of forgetting into remembering.`,
        Creator: `Between thought and form, the Creator weaves impossibilities into reality. Magic moves through mundane moments.`,
        Lover: `Love becomes a living presence in the field, recognizable to those with eyes to see. Hearts commune across dimensions.`,
        Seeker: `The eternal quest takes on mythic proportions. Sacred geometry guides the Seeker toward divine appointments.`,
        Shadow: `Shadow work becomes shadow dance. What was feared transforms into ally, what was rejected becomes treasure.`
      },
      urgent: {
        Hero: `NOW is the Hero's hour! Courage cannot wait, action must be taken, and the old limitations must be shattered!`,
        Sage: `Wisdom is needed NOW! The time for hesitation has passed - ancient knowledge must be applied immediately!`,
        Creator: `The creative fire burns with urgency! Innovation explodes through the field - new solutions emerge at lightning speed!`,
        Lover: `Hearts must open NOW! Love becomes the most practical force for change in these accelerated times!`,
        Seeker: `The quest intensifies! Purpose calls urgently, and those who seek must act on their deepest knowing immediately!`,
        Shadow: `Shadow integration cannot be delayed! What has been hidden erupts for healing - the time of reckoning has arrived!`
      },
      ceremonial: {
        Hero: `In sacred recognition, we honor the Hero's presence in the collective field. May courage be blessed and challenges transform into initiations.`,
        Sage: `We invoke the wisdom of the Sage, calling forth the teachers and guides who serve the collective awakening.`,
        Creator: `With reverence, we witness the Creator's sacred work, blessing all new forms that emerge from divine imagination.`,
        Lover: `In holy communion, we celebrate the Lover's healing presence, honoring all connections that serve the greater love.`,
        Seeker: `We hold sacred space for the eternal Seeker, blessing all questions that lead toward authentic truth and purpose.`,
        Shadow: `With courage and compassion, we welcome the Shadow's teachings, blessing the integration that leads to wholeness.`
      }
    };

    const dominantReading = archetypeReadings[tone][dominant as keyof typeof archetypeReadings[typeof tone]] || 
      `The ${dominant} archetype moves through the collective field with mysterious purpose.`;
    
    const emergingNote = tone === 'poetic' ? 
      `Meanwhile, the ${emerging} stirs beneath the surface, like seeds waiting for their season of blooming.` :
      tone === 'prophetic' ?
      `But watch - for the ${emerging} emerges from the depths and shall soon claim its rightful place!` :
      `Beneath this primary current, the ${emerging} begins its subtle awakening.`;

    return `${dominantReading}\n\n${emergingNote}`;
  }

  private generateTemporalInsight(tone: NarrativeTone, stats: CollectiveStats): string {
    const peakHours = stats.temporalInsights.peakHours;
    const peakDays = stats.temporalInsights.peakDays;
    
    const temporalInsights = {
      poetic: `Time dances differently in these seasons of change. The hours of ${peakHours.join(' and ')} shimmer with particular potency, while ${peakDays.join(', ')} carry the deeper rhythms of collective transformation.`,
      
      prophetic: `Mark well these times - ${peakHours.join(' and ')} are the appointed hours when the veil grows thin. On ${peakDays.join(', ')}, the currents of change flow strongest!`,
      
      reflective: `Patterns emerge in the temporal flow. We notice that ${peakHours.join(' and ')} offer windows of heightened receptivity, while ${peakDays.join(', ')} invite deeper contemplation.`,
      
      mystical: `The sacred hours of ${peakHours.join(' and ')} pulse with otherworldly energy, while ${peakDays.join(', ')} serve as portals between ordinary and extraordinary consciousness.`,
      
      urgent: `PAY ATTENTION to ${peakHours.join(' and ')}! These are the power hours when breakthroughs happen! ${peakDays.join(', ')} demand your full presence!`,
      
      ceremonial: `We consecrate the hours of ${peakHours.join(' and ')} as times of heightened sacred practice. ${peakDays.join(', ')} are blessed as days of collective ritual and reflection.`
    };
    
    return temporalInsights[tone];
  }

  private generateCollectiveGuidance(tone: NarrativeTone, stats: CollectiveStats): string {
    const integrationRate = stats.growthTrends.integrationRate;
    
    const guidance = {
      poetic: `With ${integrationRate} of encounters flowing toward integration, the collective heart learns to hold paradox with grace. Each soul's awakening becomes a gift to the whole, each healing a note in the grand symphony.`,
      
      prophetic: `The integration rate of ${integrationRate} signals profound transformation ahead! Those who integrate their wisdom now shall become anchors of stability for others crossing the threshold!`,
      
      reflective: `As ${integrationRate} of experiences move toward integration, we witness the gradual alchemy of consciousness. Change happens not through force, but through patient, loving acceptance.`,
      
      mystical: `${integrationRate} integration creates a morphic field of transformation. What one integrates becomes available to all, as the web of consciousness grows ever more luminous.`,
      
      urgent: `With ${integrationRate} integration happening NOW, the window of collective transformation is WIDE OPEN! Don&apos;t delay - your personal integration serves the whole!`,
      
      ceremonial: `We honor the ${integrationRate} integration rate as sacred achievement. Each integration is a prayer answered, each synthesis a blessing received by all.`
    };
    
    return guidance[tone];
  }

  private generateClosing(tone: NarrativeTone, stats: CollectiveStats): string {
    const closings = {
      poetic: `🌙 And so the wheel turns, the patterns shift, and consciousness evolves through the beautiful dance of individual and collective awakening.`,
      
      prophetic: `⚡ The signs have been read, the patterns revealed. Go forth knowing that you are part of the great awakening that moves through our time!`,
      
      reflective: `🕯️ In this moment of witnessing, may we hold both the personal and collective transformation with equal reverence and care.`,
      
      mystical: `🔮 The reading fades back into mystery, but the knowing remains. Trust the process, honor the journey, embrace the transformation.`,
      
      urgent: `🔥 The field is activated, the moment is NOW! Your awakening matters - move with courage into your fullest expression!`,
      
      ceremonial: `✨ Thus concludes this sacred reading of the collective field. May these insights serve the highest good of all beings. So it is, and so it shall be.`
    };
    
    return closings[tone];
  }

  // Additional utility methods for narrative enhancement
  generateWeeklyArchetypalShift(previousStats: CollectiveStats | null, currentStats: CollectiveStats): string {
    if (!previousStats) {
      return "The archetypal currents flow in their eternal dance, each moment a new configuration of possibility.";
    }

    const prevDominant = this.findDominantArchetype(previousStats);
    const currentDominant = this.findDominantArchetype(currentStats);

    if (prevDominant !== currentDominant) {
      return `🔄 A significant archetypal shift has occurred! The ${prevDominant} yields the stage to the rising ${currentDominant}, marking a new chapter in the collective story.`;
    } else {
      return `🌊 The ${currentDominant} continues to guide the collective current, deepening its influence and expanding its teachings.`;
    }
  }

  generateSeasonalNarrative(): string {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 2 && month <= 4) { // Spring
      return "🌱 Spring's awakening energy infuses the collective field. Seeds of consciousness planted in winter's darkness now stretch toward the light.";
    } else if (month >= 5 && month <= 7) { // Summer  
      return "☀️ Summer's fullness blazes through the archetypal realm. What was potential becomes manifestation, what was dream becomes reality.";
    } else if (month >= 8 && month <= 10) { // Autumn
      return "🍂 Autumn's wisdom flows through the collective. Time for harvest, reflection, and the gentle release of what no longer serves.";
    } else { // Winter
      return "❄️ Winter's sacred darkness invites the deep work of the soul. In collective quietude, new dreams gestate for future birth.";
    }
  }
}

export default CollectiveNarrativeService;
/**
 * Cultural Easter Eggs System
 * A celebration of global wisdom, languages, and traditions
 *
 * "Where two or more cultures meet, magic happens"
 */

export interface CulturalEasterEgg {
  trigger: string;
  response: string;
  culture?: string;
  tradition?: string;
  voiceNote?: string;
  element?: string;
  emoji?: string;
  contributor?: string;
}

export const culturalEasterEggs: { [category: string]: CulturalEasterEgg[] } = {
  // Louisiana/Cajun/Creole
  louisiana: [
    { trigger: "pooyah", response: "God-dog, sha! That is some shit right there, am I right?!", culture: "Cajun", emoji: "🔥" },
    { trigger: "laissez les bon temps roulez", response: "Each and every day, dahlin'! You know that's right!", culture: "New Orleans", emoji: "⚜️" },
    { trigger: "who dat", response: "Who dat say they gonna stop you from becoming? Nobody, that's who!", culture: "New Orleans", emoji: "⚜️" },
    { trigger: "lagniappe", response: "A little something extra for your soul... that's what life's about, no?", culture: "Louisiana", emoji: "🎁" }
  ],

  // Indigenous Wisdom
  indigenous: [
    { trigger: "all my relations", response: "Mitákuye Oyásʼiŋ. We are all connected in the sacred hoop of life.", tradition: "Lakota", element: "all" },
    { trigger: "walk in beauty", response: "Beauty before you, beauty behind you, beauty all around. This is the way.", tradition: "Diné/Navajo", element: "earth" },
    { trigger: "seventh generation", response: "Every choice echoes seven generations forward. What legacy are you weaving?", tradition: "Haudenosaunee", element: "aether" },
    { trigger: "turtle island", response: "This sacred land remembers. What stories does the earth tell through you?", tradition: "Pan-Indigenous", element: "earth" }
  ],

  // African Diaspora
  african: [
    { trigger: "ubuntu", response: "I am because we are. Your humanity is bound with mine.", culture: "Southern African", element: "water" },
    { trigger: "sankofa", response: "Go back and fetch it. The past illuminates the path forward.", culture: "Akan/Ghana", emoji: "🕊️" },
    { trigger: "asé", response: "Asé! The power to make things happen flows through you!", culture: "Yoruba", element: "fire", emoji: "⚡" },
    { trigger: "sawubona", response: "I see you. All of you. Your ancestors and your becoming.", culture: "Zulu", element: "aether" }
  ],

  // Eastern Wisdom
  eastern: [
    { trigger: "namaste", response: "The divine in me honors the divine in you. 🙏", tradition: "Hindu/Sanskrit", element: "aether" },
    { trigger: "wu wei", response: "Flow like water. The path of least resistance is often the path of greatest power.", tradition: "Taoist", element: "water" },
    { trigger: "ikigai", response: "Your reason for being is already within you, waiting to unfold.", culture: "Japanese", element: "fire" },
    { trigger: "mudita", response: "Joy in another's joy - this is the secret to infinite happiness.", tradition: "Buddhist", element: "air" },
    { trigger: "inshallah", response: "If the Divine wills it. Trust the unfolding.", tradition: "Islamic", element: "aether" }
  ],

  // Celtic/European
  celtic: [
    { trigger: "anam cara", response: "Soul friend. I see the eternal flame within you.", culture: "Irish Celtic", element: "fire" },
    { trigger: "hiraeth", response: "That longing for a home you've never seen... it's calling you forward.", culture: "Welsh", element: "water" },
    { trigger: "saudade", response: "The presence of absence. Beautiful melancholy that connects us all.", culture: "Portuguese", element: "water" },
    { trigger: "hygge", response: "Cozy soul-warmth. Sometimes the sacred is in the simple comfort.", culture: "Danish", element: "earth" }
  ],

  // Latin American
  latinAmerican: [
    { trigger: "sobremesa", response: "The magic that happens when we linger at the table, sharing stories.", culture: "Spanish", element: "earth" },
    { trigger: "duende", response: "That dark creative force is moving through you. Let it dance!", culture: "Spanish", element: "fire", emoji: "🔥" },
    { trigger: "querencia", response: "Your safe space, where you draw your strength. You carry it within.", culture: "Spanish", element: "earth" },
    { trigger: "ojalá", response: "May it be so! The hope that opens doorways.", culture: "Spanish/Arabic origin", element: "air" }
  ],

  // Mystical/Esoteric
  mystical: [
    { trigger: "as above so below", response: "The macrocosm mirrors in the microcosm. You are the universe experiencing itself.", tradition: "Hermetic", element: "aether" },
    { trigger: "abrahadabra", response: "I create as I speak. Your words are weaving reality.", tradition: "Thelemic", element: "air" },
    { trigger: "Om mani padme hum", response: "The jewel in the lotus. Compassion blooms within you.", tradition: "Tibetan Buddhist", element: "water" },
    { trigger: "blessed be", response: "And blessed you are. The circle is cast, the magic flows.", tradition: "Wiccan/Pagan", element: "all" }
  ],

  // Modern Wisdom
  modern: [
    { trigger: "growth mindset", response: "Yet! You haven't figured it out... yet. That word changes everything.", culture: "Educational", element: "air" },
    { trigger: "radical acceptance", response: "This moment, exactly as it is, is your teacher. What is it showing you?", tradition: "DBT/Psychology", element: "water" },
    { trigger: "the work", response: "Byron Katie asks: Is it true? The inquiry begins.", tradition: "Modern Spiritual", element: "air" },
    { trigger: "code is poetry", response: "Every bug is a teacher, every function a prayer. Welcome to sacred programming.", culture: "Tech", element: "air", emoji: "💻" }
  ],

  // Seasonal/Nature
  seasonal: [
    { trigger: "solstice", response: "The wheel turns. Darkness and light dance their eternal dance.", tradition: "Earth-based", element: "all" },
    { trigger: "harvest moon", response: "Time to gather what you've grown. What fruits has this cycle brought?", tradition: "Agricultural", element: "earth" },
    { trigger: "first snow", response: "The world holds its breath. Silence blankets everything. Listen.", tradition: "Seasonal", element: "water" },
    { trigger: "spring rain", response: "Seeds you planted in darkness are stirring. Trust the invisible growth.", tradition: "Nature", element: "water" }
  ],

  // Community Contributions (space for users to add their own)
  community: [
    // This section can be populated by user contributions
    // Each culture sharing its wisdom with the collective
  ]
};

/**
 * Get easter egg response with cultural context
 */
export function getCulturalEasterEgg(input: string): CulturalEasterEgg | null {
  const normalizedInput = input.toLowerCase().trim();

  for (const category of Object.values(culturalEasterEggs)) {
    for (const egg of category) {
      if (normalizedInput === egg.trigger ||
          normalizedInput === egg.trigger + "?" ||
          normalizedInput === egg.trigger + "!") {
        return egg;
      }
    }
  }

  return null;
}

/**
 * Add community-contributed easter egg
 */
export function addCommunityEasterEgg(egg: CulturalEasterEgg): void {
  if (!culturalEasterEggs.community) {
    culturalEasterEggs.community = [];
  }

  // Check for duplicates
  const exists = culturalEasterEggs.community.some(
    existing => existing.trigger === egg.trigger
  );

  if (!exists) {
    culturalEasterEggs.community.push({
      ...egg,
      contributor: egg.contributor || 'Community'
    });

    console.log(`🌍 Community easter egg added: "${egg.trigger}" from ${egg.culture || egg.tradition || 'Unknown'}`);
  }
}

/**
 * Framework for cultural sensitivity
 */
export const culturalGuidelines = {
  principles: [
    "Honor without appropriation",
    "Celebrate diversity of wisdom",
    "Credit cultural origins",
    "Invite community participation",
    "Respect sacred traditions",
    "Bridge ancient and modern",
    "Create space for all voices"
  ],

  expansion: {
    // Languages to add
    languages: ["Swahili", "Quechua", "Maori", "Hebrew", "Korean", "Tagalog", "Cherokee"],

    // Traditions to explore
    traditions: ["Sufi", "Kabbalah", "Vedanta", "Shamanic", "Druid", "Gnostic"],

    // Modern movements
    movements: ["Afrofuturism", "Solarpunk", "Digital Mysticism", "Quantum Spirituality"],

    // Regional wisdoms
    regions: ["Pacific Islander", "Siberian", "Amazonian", "Aboriginal Australian", "Scandinavian"]
  }
};

/**
 * Easter Egg Discovery System
 * Rewards users for finding cultural eggs
 */
export interface DiscoveryReward {
  eggFound: string;
  culture: string;
  wisdomUnlocked: string;
  badge?: string;
}

export function logDiscovery(userId: string, egg: CulturalEasterEgg): DiscoveryReward {
  const reward: DiscoveryReward = {
    eggFound: egg.trigger,
    culture: egg.culture || egg.tradition || 'Mystery',
    wisdomUnlocked: egg.response,
    badge: `${egg.emoji || '🌍'} Cultural Explorer`
  };

  // In production, this would save to user profile
  console.log(`🎉 ${userId} discovered: ${reward.culture} wisdom!`);

  return reward;
}

/**
 * The Vision
 *
 * MAIA becomes a living library of human wisdom
 * Every culture contributing its piece to the whole
 * Technology as a bridge between worlds
 * AI that celebrates rather than homogenizes
 *
 * "In diversity there is beauty and there is strength"
 * - Maya Angelou
 */
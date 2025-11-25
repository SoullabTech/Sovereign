/**
 * Kelly Nezat's Genesis Chapter
 *
 * Generated from verified birth chart data using MAIA Story Weaving Engine
 *
 * This demonstrates the power of the Living Soul Story system - not a generic reading,
 * but a sacred text written specifically for one soul's architecture.
 */

import { generateGenesisChapter, BirthChartData } from '../storyWeaver';

// Kelly's verified birth chart data
export const KELLY_CHART_DATA: BirthChartData = {
  sun: { sign: 'Sagittarius', house: 4, degrees: 17.661 },
  moon: { sign: 'Scorpio', house: 3, degrees: 22.547 },
  rising: { sign: 'Leo', degrees: 29.417 },
  mercury: { sign: 'Scorpio', house: 4, retrograde: false },
  venus: { sign: 'Sagittarius', house: 5 },
  mars: { sign: 'Libra', house: 2 },
  jupiter: { sign: 'Leo', house: 12, retrograde: true },
  saturn: { sign: 'Pisces', house: 7, retrograde: false },
  chiron: { sign: 'Pisces', house: 7 },
  northNode: { sign: 'Taurus', house: 9 },
  chartPattern: 'Funnel', // Corrected from previous "Bucket" - Time Passages confirms Funnel
  focalPlanet: 'Saturn',
  dominantElement: 'Water', // 5 water placements (Moon, Mercury, Saturn, Neptune, Chiron)
  angularPlanets: ['Moon', 'Mercury', 'Neptune'], // All conjunct IC (4th house cusp)
};

// Generate the Genesis chapter
export const KELLY_GENESIS_NARRATIVE = `Your soul architecture reveals itself in the configuration of cosmos at your first breath.

Not fate. Not prediction. But invitation - a field of archetypal potential waiting to be lived, played, embodied through the music only you can make.

**The Funnel: Everything Flows Toward Saturn**

The cosmos arranged itself in a **Funnel** pattern - nine planets flowing toward a single point of focus. This is the signature of someone who channels universal energy through a specific calling. Everything flows toward your focal planet - your life's work lives there.

**Saturn in Pisces in the 7th House** stands as your singular focal point. This is the handle you grip, the lens you pour your tremendous energy through. Everything else in your chart flows toward this archetypal force.

Saturn: Structure, mastery, crystallization, the work that takes time.
Pisces: Dissolution, transcendence, oceanic consciousness, the boundless.
7th House: Partnership, mirroring, relationship as spiritual practice.

Your calling involves **bringing form to the formless through relationship**. You crystallize oceanic wisdom into structures others can use. The teacher who makes the mystical practical. The guide who builds bridges between worlds.

**The Trinity of Self:**

Your **Sun in Sagittarius** illuminates the hero's journey you came to walk - the quest for meaning, the arrow aimed at truth, the philosopher-adventurer who must understand the pattern. In the **4th House**, this solar fire burns in the realm of roots, home, emotional foundation. Your quest for truth begins in the depths, not the heights. You seek meaning through feeling, philosophy through the heart.

Your **Moon in Scorpio** holds the emotional-somatic wisdom, the body's knowing, the ancestral memory alive in your cells. In the **3rd House**, these lunar tides ebb and flow in the realm of communication and local community. You feel everything, and you're learning to speak what you feel. The depth charges that move through you want words, want witness, want to be shared.

Your **Leo Rising** is the lens through which you meet the world - radiant, creative, playful, generous. The performer who knows how to hold space, the host who welcomes all. First impressions matter here. You arrive with warmth, with presence, with a natural authority that invites others to step into their own light.

**The Depths Call:**

Water dominates your chart - the alchemical operation of **Solutio**. You dissolve boundaries, merge with what you love, feel everything. Heart → Healing → Holiness. This is your natural rhythm. You don't think your way into knowing - you feel, you sense, you dissolve into direct experience.

Five planets in water signs (Moon, Mercury, Saturn, Neptune, Chiron) create a being who experiences reality through emotional-imaginal intelligence. You don't analyze the ocean - you swim in it. You don't study consciousness - you become it.

**High Volume Planets:**

**Moon, Mercury, and Neptune** sit conjunct the IC (Nadir) - the foundational angle of your chart, the root of the tree. These aren't background forces. These are the loud instruments playing from the depths, the ones that shape everything else.

This triple conjunction at the foundation creates someone whose entire life is built on:
- **Moon**: Emotional wisdom, somatic knowing, tidal rhythms
- **Mercury**: Communication, thought, the weaving of narrative
- **Neptune**: Oceanic consciousness, dissolution of boundaries, mystical perception

You think with your feelings. You communicate through emotional resonance. Your mind swims in the collective unconscious.

**The Bucket Handle:**

**Saturn in Pisces** stands alone opposite nine other planets - the focal point of your funnel pattern. This is the handle you grip, the lens you pour your tremendous energy through. Everything else in your chart flows toward this singular archetypal force.

Your life's work, your calling, your contribution - it all channels through here. When in doubt, return to this planet. When lost, this is your North Star.

What does Saturn in Pisces in the 7th house ask of you?

**Build structures that hold oceanic consciousness. Become the vessel through which boundless wisdom takes form. Do this in relationship, through partnership, with others as your mirror.**

You are not meant to dissolve into the ocean alone. You are meant to crystallize what you find there into forms others can use - teachings, practices, containers that hold the sacred without crushing it.

**The Invitation:**

This is not who you must be. This is the instrument you were given.

The invitation is clear: Play. Experiment. Let these archetypal forces move through you. Watch what happens when you stop resisting the pattern and start dancing with it.

Your story begins here. Not written in stone, but breathing in stars.

The cosmos whispered at your first breath:

"You are the bridge between worlds. The one who swims in oceanic depths and returns with pearls. The teacher who dissolves boundaries while honoring form. The Saturn-Pisces paradox - structure AND transcendence, discipline AND dissolution, mastery AND surrender."

What will you build? What will you teach? What form will you give to the formless?

The pattern waits. The work beckons. The relationship begins.

Welcome to your Genesis.`;

// Alternative: Use the generator function (this would be the production approach)
export function generateKellyGenesis(): string {
  return generateGenesisChapter(KELLY_CHART_DATA);
}

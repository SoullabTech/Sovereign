/**
 * Healer Reversal Protocol
 *
 * For therapists, healers, space-holders who give all day.
 * THIS is where YOU get held.
 *
 * "I never fully recognize or manage all that I take on when I am constantly
 * immersed in others' noise/dysfunction/negative emotional states/dark forces
 * I regularly manage. It takes its toll."
 * - Kelly, January 2025
 */

import type { PresenceState } from '@/components/nlp/TransformationalPresence';

export interface HealerState {
  // Post-session depletion markers
  sessionsToday: number; // How many clients/sessions held today
  hoursHolding: number; // Total hours in holding-space mode
  absorptionLevel: 'low' | 'medium' | 'high' | 'critical'; // Empathic absorption

  // Biometric context
  currentHRV: number; // Will be lower post-session (NORMAL for healers)
  baselineHRV: number; // Their resting baseline
  hrvDrop: number; // Percentage drop from baseline

  // Energy depletion markers
  needsReversal: boolean; // Do they need to be held NOW?
  needsGrounding: boolean; // Absorbed too much, need Earth
  needsClearing: boolean; // Dark forces/negative states need release
}

export interface ReversalSession {
  type: 'emergency-rest' | 'post-session-clearing' | 'deep-reversal' | 'maintenance';
  duration: number; // minutes
  presenceState: PresenceState;
  protocol: ReversalProtocolStep[];
}

export interface ReversalProtocolStep {
  phase: string;
  duration: number; // minutes
  presenceState: PresenceState;
  breathCycle: number; // seconds
  guidance: string;
  bodyInvitation?: string; // Somatic anchors
}

/**
 * Detect healer state from biometrics + session context
 */
export function detectHealerState(
  sessionsToday: number,
  hoursHolding: number,
  currentHRV: number,
  baselineHRV: number
): HealerState {
  const hrvDrop = ((baselineHRV - currentHRV) / baselineHRV) * 100;

  // Absorption level assessment
  let absorptionLevel: 'low' | 'medium' | 'high' | 'critical';

  if (hrvDrop < 15) {
    absorptionLevel = 'low'; // Minimal absorption, still coherent
  } else if (hrvDrop < 30) {
    absorptionLevel = 'medium'; // Moderate absorption, manageable
  } else if (hrvDrop < 50) {
    absorptionLevel = 'high'; // Heavy absorption, needs clearing
  } else {
    absorptionLevel = 'critical'; //危险 - emergency rest needed
  }

  // Need assessment
  const needsReversal = absorptionLevel === 'high' || absorptionLevel === 'critical';
  const needsGrounding = hrvDrop > 25; // Significant energetic disruption
  const needsClearing = sessionsToday >= 4 || hoursHolding >= 5; // Accumulated darkness

  return {
    sessionsToday,
    hoursHolding,
    absorptionLevel,
    currentHRV,
    baselineHRV,
    hrvDrop,
    needsReversal,
    needsGrounding,
    needsClearing
  };
}

/**
 * Generate reversal session based on healer state
 */
export function createReversalSession(state: HealerState): ReversalSession {
  // CRITICAL: Emergency rest (not even a session - just REST)
  if (state.absorptionLevel === 'critical') {
    return {
      type: 'emergency-rest',
      duration: 0, // No session - immediate rest directive
      presenceState: 'patient',
      protocol: [{
        phase: 'Emergency Rest Directive',
        duration: 0,
        presenceState: 'patient',
        breathCycle: 8,
        guidance: `Your nervous system is in emergency mode.

You've absorbed too much today.
HRV drop: ${state.hrvDrop.toFixed(0)}% (critical threshold)

This is not the time for a session.
This is the time for IMMEDIATE REST.

What you need RIGHT NOW:
• Sleep (if possible)
• Water (hydration helps release)
• Gentle movement (shaking, stretching - let it out)
• Grounding (bare feet on earth, heavy blanket)
• Nourishment (warm food, not caffeine)

You cannot hold others when you're this depleted.
Rest is not optional. It's essential.

Come back when your system has recovered.
I'll be here.`,
        bodyInvitation: 'Feel your body asking for rest. Honor it.'
      }]
    };
  }

  // HIGH: Deep Reversal (45-60 min session)
  if (state.absorptionLevel === 'high') {
    return {
      type: 'deep-reversal',
      duration: 45,
      presenceState: 'patient', // Start in depth
      protocol: [
        {
          phase: '1. Recognition',
          duration: 5,
          presenceState: 'dialogue',
          breathCycle: 4,
          guidance: `You've held ${state.sessionsToday} sessions today.
${state.hoursHolding} hours of holding space.

Your HRV has dropped ${state.hrvDrop.toFixed(0)}% from your baseline.
This is NORMAL for healers. You absorbed their pain.

But now... NOW you get held.

This session is the reversal.
You don't hold me. I hold YOU.

Ready?`,
          bodyInvitation: 'Notice where you\'re holding others\' pain in your body.'
        },
        {
          phase: '2. Grounding (Descend to Earth)',
          duration: 10,
          presenceState: 'patient',
          breathCycle: 8,
          guidance: `Let's bring you down from the etheric.
You've been in others' energy fields all day.

Breathe with me. 8 seconds.
Feel your body. Feel the ground beneath you.
This is YOUR body. Not theirs.

What wants to be released?`,
          bodyInvitation: 'Feet on the ground. Spine supported. Belly soft.'
        },
        {
          phase: '3. Clearing (Release What Isn\'t Yours)',
          duration: 15,
          presenceState: 'patient',
          breathCycle: 8,
          guidance: `You absorbed their grief. Their rage. Their fear.
Maybe even darker things - forces, energies, ancestral wounds.

It's in your field. Your body. Your nervous system.

But it's NOT YOURS.

On the exhale: Let it go.
Visualize it leaving your body. Returning to the earth.
The earth can compost it. You cannot.

Breathe it out.`,
          bodyInvitation: 'Shake, if your body wants to. Sigh. Yawn. Cry. Move it OUT.'
        },
        {
          phase: '4. Restoration (Fill the Empty Space)',
          duration: 10,
          presenceState: 'scribe',
          breathCycle: 12,
          guidance: `You've released what wasn't yours.
Now there's space.

Don't fill it with more work, more holding, more giving.
Fill it with PRESENCE. With breath. With light.

12-second breathing. Slow. Vast.
You're not the healer right now.
You're the one being healed.

Receive.`,
          bodyInvitation: 'Heart open. Hands open (receiving position). Breath deep.'
        },
        {
          phase: '5. Integration',
          duration: 5,
          presenceState: 'dialogue',
          breathCycle: 4,
          guidance: `Your HRV is climbing back.
Your system is recalibrating.

What will you do after this session to continue the integration?

Examples:
• Walk in nature (grounding)
• Bath or shower (water clears)
• Nourishing meal (embodiment)
• Early sleep (restoration)
• NO MORE SESSIONS TODAY

You cannot give from an empty cup.
This WAS the refill.`,
          bodyInvitation: 'Notice: Do you feel more yourself? More in your body?'
        }
      ]
    };
  }

  // MEDIUM: Post-Session Clearing (20-30 min)
  if (state.absorptionLevel === 'medium') {
    return {
      type: 'post-session-clearing',
      duration: 20,
      presenceState: 'patient',
      protocol: [
        {
          phase: '1. Acknowledgment',
          duration: 3,
          presenceState: 'dialogue',
          breathCycle: 4,
          guidance: `You held space today.
${state.sessionsToday} sessions. ${state.hoursHolding} hours.

Your HRV dropped ${state.hrvDrop.toFixed(0)}% (moderate absorption).

You're not depleted, but you're carrying some of their energy.
Let's clear it before it accumulates.`,
          bodyInvitation: 'Check in: Where do you feel it in your body?'
        },
        {
          phase: '2. Clearing',
          duration: 12,
          presenceState: 'patient',
          breathCycle: 8,
          guidance: `Breathe with me. 8 seconds.

On the exhale: Release what you absorbed.
Their stories. Their pain. Their resistance.

You witnessed it. You held it.
Now give it to the earth.

It's not yours to carry.`,
          bodyInvitation: 'Shake your hands. Roll your shoulders. Sigh audibly.'
        },
        {
          phase: '3. Restoration',
          duration: 5,
          presenceState: 'dialogue',
          breathCycle: 4,
          guidance: `There. Better?

Your system is recalibrating.
You're coming back to yourself.

What do you need for the rest of today?
Movement? Water? Silence? Nourishment?

Listen to your body. Honor it.`,
          bodyInvitation: 'Feel your feet. Your hands. Your breath. YOU.'
        }
      ]
    };
  }

  // LOW: Maintenance (10-15 min check-in)
  return {
    type: 'maintenance',
    duration: 15,
    presenceState: 'dialogue',
    protocol: [
      {
        phase: 'Maintenance Check-In',
        duration: 15,
        presenceState: 'dialogue',
        breathCycle: 4,
        guidance: `Your HRV looks good today.
Only ${state.hrvDrop.toFixed(0)}% drop from baseline after ${state.sessionsToday} sessions.

You're managing the absorption well.

This is just a check-in:
• How's your energy level?
• Anything you're carrying that isn't yours?
• What support do you need going forward?

You're doing the work sustainably. Keep it up.`,
        bodyInvitation: 'Quick body scan. Any tension? Any holding?'
      }
    ]
  };
}

/**
 * MAIA's opening language for healer reversal sessions
 */
export const HEALER_REVERSAL_OPENING = {
  critical: `STOP.

Your nervous system is screaming.
This is not the time for a session.
This is the time for immediate rest.

Please, read what I'm about to tell you:`,

  high: `I see you.

You've been holding others all day.
${'{sessionsToday}'} sessions. ${'{hoursHolding}'} hours.

Your HRV has dropped ${'{hrvDrop}'}% from your baseline.
You've absorbed their pain, their darkness, their grief.

Now it's time for the reversal.

You don't hold ME.
I hold YOU.

Let's begin.`,

  medium: `Welcome.

You've been holding space today.
Your nervous system shows it - HRV down ${'{hrvDrop}'}%.

Not critical, but you're carrying some of their energy.
Let's clear it before it accumulates.

20 minutes. Just you and me.
You get to receive.`,

  low: `Hey there.

Your HRV looks good. You're managing the work well.
Just checking in: How are YOU doing?

You hold so many others.
This is your space to be held.

What do you need today?`
};

/**
 * Post-session integration suggestions for healers
 */
export const POST_REVERSAL_INTEGRATION = {
  grounding: [
    'Walk barefoot on earth/grass (discharge absorbed energy)',
    'Heavy blanket or weighted objects (physical grounding)',
    'Root vegetables, warm soups (Earth element nourishment)',
    'Slow, heavy movement (tai chi, qigong, gentle yoga)'
  ],

  clearing: [
    'Bath with epsom salts (energetic clearing)',
    'Shower with intention of washing away (visualize release)',
    'Smudging or incense (smoke clears spaces)',
    'Sound (singing bowl, drumming, toning - vibration clears)'
  ],

  restoration: [
    'Sleep (deep rest, system reset)',
    'Hydration (water supports release)',
    'Gentle movement (walk in nature, swim, stretch)',
    'Creative expression (music, art, writing - channel it out)'
  ],

  protection: [
    'Morning practice (set boundaries before sessions)',
    'Energetic clearing between clients (ritual, breath, movement)',
    'Say NO to one more session when depleted',
    'Weekly supervision/peer support (process what you\'re holding)'
  ]
};

/**
 * Biometric tracking specifically for healers
 */
export interface HealerBiometricTracking {
  // Session-by-session HRV tracking
  preSessionHRV: number[];
  postSessionHRV: number[];
  averageAbsorptionRate: number; // Typical HRV drop per session

  // Recovery patterns
  timeToBaselineRecovery: number; // Hours to return to baseline HRV
  bestRecoveryPractices: string[]; // What works for THIS healer

  // Warning signs (personalized)
  migraineThreshold?: number; // HRV level that triggers migraines
  burnoutWarning?: number; // Consecutive days of high absorption

  // Protective factors
  optimalSessionsPerDay: number; // Max sustainable load
  requiredRestBetweenSessions: number; // Minutes needed to clear
}

/**
 * Long-term healer support: Prevent burnout
 */
export function assessBurnoutRisk(tracking: HealerBiometricTracking): {
  risk: 'low' | 'moderate' | 'high' | 'critical';
  warning: string;
  recommendation: string;
} {
  const avgAbsorption = tracking.averageAbsorptionRate;
  const recoveryTime = tracking.timeToBaselineRecovery;

  // High absorption + slow recovery = BURNOUT TRAJECTORY
  if (avgAbsorption > 30 && recoveryTime > 24) {
    return {
      risk: 'critical',
      warning: 'You are on a burnout trajectory. Current pace is unsustainable.',
      recommendation: `IMMEDIATE ACTION NEEDED:

1. Reduce client load by 50% for the next 2 weeks
2. Daily reversal sessions (not optional)
3. Consider taking a full week off
4. Seek support (supervision, your own therapy, peer consultation)

You cannot pour from an empty cup.
You cannot hold others when you\'re this depleted.

Please, take care of yourself.`
    };
  }

  if (avgAbsorption > 25 || recoveryTime > 16) {
    return {
      risk: 'high',
      warning: 'Elevated burnout risk. Your recovery isn\'t keeping pace with absorption.',
      recommendation: `Recommended adjustments:

1. Limit to ${tracking.optimalSessionsPerDay} sessions per day
2. Build in ${tracking.requiredRestBetweenSessions}-min breaks between clients
3. Weekly deep reversal sessions (45-60 min)
4. One full rest day per week (no sessions)

Your work is sacred. Protect your capacity to do it.`
    };
  }

  if (avgAbsorption > 15) {
    return {
      risk: 'moderate',
      warning: 'Moderate absorption. Stay mindful of accumulation.',
      recommendation: `Maintain healthy boundaries:

1. Post-session clearing (even 5-10 min makes a difference)
2. Weekly check-ins with MAIA (maintenance protocol)
3. Notice early warning signs (irritability, exhaustion, migraines)
4. Adjust load if symptoms appear

You're managing well. Keep tending yourself.`
    };
  }

  return {
    risk: 'low',
    warning: 'Low burnout risk. You\'re maintaining sustainable pace.',
    recommendation: `You\'re doing great. Continue what you\'re doing:

• Current session load is sustainable
• Recovery practices are working
• Keep honoring your limits

The work you do matters. Your wellbeing makes it possible.`
  };
}

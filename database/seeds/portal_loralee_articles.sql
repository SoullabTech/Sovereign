-- ============================================
-- LORALEE PORTAL ARTICLES SEED DATA
-- Educational content and blog posts for Loralee's portal
-- ============================================

-- First, ensure the articles table exists (run migration if not)
-- Then insert sample articles

INSERT INTO portal_articles (
  id,
  practitioner_id,
  title,
  slug,
  excerpt,
  content,
  category,
  tags,
  reading_time_minutes,
  is_published,
  is_featured,
  published_at
) VALUES
  -- Featured Article 1
  (
    'ae000001-0001-0001-0001-000000000001',
    'a0000001-0001-0001-0001-000000000001',
    'Understanding Your North Node: Your Soul''s Evolutionary Direction',
    'understanding-your-north-node',
    'The North Node isn''t just another point in your chart—it''s the compass pointing toward your soul''s growth in this lifetime. Learn how to read this powerful placement.',
    'The North Node of the Moon is perhaps the most misunderstood point in evolutionary astrology. Unlike planets that describe who we are, the North Node describes who we''re becoming—the unfamiliar territory our soul chose to explore in this lifetime.

## The Karmic Axis

The North Node never travels alone. It''s always exactly opposite the South Node, creating what we call the Nodal Axis—your karmic story arc. The South Node represents comfortable patterns from past lives, skills you''ve mastered, and tendencies that come naturally. The North Node represents the growth edge, the qualities your soul is here to develop.

Think of it like this: the South Node is your hometown, and the North Node is the city you moved to for a new adventure. You''ll always carry your origins with you, but growth requires venturing into new territory.

## North Node Through the Signs

### North Node in Aries (South Node in Libra)
Learning to assert yourself, take initiative, and prioritize your own needs. Moving away from over-accommodation and people-pleasing.

### North Node in Taurus (South Node in Scorpio)
Learning to build stability, appreciate simplicity, and trust in abundance. Moving away from crisis orientation and emotional intensity.

### North Node in Gemini (South Node in Sagittarius)
Learning to listen, ask questions, and embrace not knowing. Moving away from preaching and assuming you have all the answers.

## Working With Your North Node

The North Node doesn''t demand you abandon your South Node gifts—it asks you to use them in service of your growth rather than as an escape from it. Here''s how to work with this energy:

- Expect discomfort. Growth lives outside our comfort zone.
- Notice when you retreat to South Node patterns under stress.
- Celebrate small steps toward North Node expression.
- Find role models who embody your North Node sign or house.

## The Houses Matter Too

Your North Node''s house placement tells you the life arena where this growth is meant to happen. Someone with North Node in Aries in the 7th house is learning assertiveness specifically through relationships. North Node in Aries in the 10th house is learning it through career and public life.

The combination of sign and house creates your unique evolutionary recipe.

## A Note on Timing

The transiting North Node returns to its natal position approximately every 18.6 years, marking significant nodal return cycles. These are times when the universe conspires to push you toward your growth edge—sometimes gently, sometimes dramatically.

If you''d like to explore your North Node in depth, I offer natal readings that specifically focus on your evolutionary path. Your chart is a map; let''s read it together.',
    'foundations',
    ARRAY['north node', 'evolutionary astrology', 'karmic astrology', 'soul purpose'],
    8,
    true,
    true,
    NOW() - INTERVAL '7 days'
  ),

  -- Featured Article 2
  (
    'ae000002-0001-0001-0001-000000000002',
    'a0000001-0001-0001-0001-000000000001',
    'Saturn Return Survival Guide: Your Cosmic Coming of Age',
    'saturn-return-survival-guide',
    'Between ages 27-30, Saturn returns to where it was when you were born. Here''s what to expect and how to work with this powerful transit.',
    'Around age 28-30, you''ll experience one of astrology''s most talked-about transits: your first Saturn Return. Saturn takes approximately 29.5 years to orbit the Sun, and when it returns to the position it held at your birth, life has a way of... reorganizing itself.

## What Is a Saturn Return?

A Saturn Return is a cosmic checkpoint. Saturn is the planet of structure, responsibility, maturity, and consequences. When it returns to its natal position, it essentially audits your life and asks: "Are you building something real? Are you living authentically? Have you done the work?"

If the answer is no, Saturn tends to remove whatever isn''t serving your highest path—sometimes painfully. If the answer is yes, Saturn often brings rewards and solidification of your efforts.

## The Three Phases

### The Approach (Ages 26-28)
Saturn begins to conjunct its natal position, and you start feeling pressure. Old structures may feel confining. Questions arise: Is this the right career? The right relationship? The right city? You might feel restless, dissatisfied, or increasingly clear about what needs to change.

### The Exact Return (Ages 28-30)
The transit is exact (within a degree) for about a year, though you''ll feel it most intensely during the precise hits. This is when changes tend to crystallize. Endings happen. Beginnings emerge. You may experience any combination of: career shifts, relationship changes, moves, health wake-up calls, or profound inner reorientation.

### The Integration (Ages 30-32)
Saturn moves past its natal position, and you begin living the new structure you''ve built. The dust settles. You feel more solid in your identity, more clear about your boundaries, more willing to take responsibility for your life.

## Common Saturn Return Themes

- Career pivots or professional leveling-up
- Marriages or divorces (or deciding you don''t want either)
- Starting or ending significant relationships
- Confronting family patterns and ancestral wounds
- Health crises that demand lifestyle changes
- Moving cities or countries
- Finally facing addictions or avoidant patterns
- Stepping into leadership or authority

## How to Navigate Your Saturn Return

### 1. Don''t Fight the Changes
Resistance makes Saturn transits harder. If something is crumbling, let it. Saturn removes what was never truly solid.

### 2. Take Responsibility
Saturn responds to people who do their work. Instead of blaming circumstances or others, ask: What is mine to own here?

### 3. Build Consciously
Use this time to lay foundations. What do you want to be true about your life in another 29 years? Start building that now.

### 4. Embrace Limits
Saturn rules boundaries. Learn to say no. Accept your limitations. Work within constraints rather than railing against them.

### 5. Find Support
This transit is challenging. Therapy, coaching, trusted friends, and yes—a good astrologer—can help you navigate with more grace.

## Your Second Saturn Return

Around age 58-60, you''ll experience your second Saturn Return. This one tends to focus on legacy, mortality, and the meaning you''ve made of your life. Many people experience health reckonings, career completions, or relationship culminations during this transit.

## Remember

A Saturn Return isn''t punishment—it''s initiation. It''s the cosmos'' way of ensuring you''re building a life that can actually hold the person you''re becoming. Trust the process, even when it''s hard.',
    'transits',
    ARRAY['saturn return', 'transits', 'life transitions', 'saturn'],
    10,
    true,
    true,
    NOW() - INTERVAL '3 days'
  ),

  -- Regular Article 1
  (
    'ae000003-0001-0001-0001-000000000003',
    'a0000001-0001-0001-0001-000000000001',
    'Mercury Retrograde: Beyond the Memes',
    'mercury-retrograde-beyond-memes',
    'Yes, Mercury retrograde is real. No, it''s not the cosmic excuse the internet makes it out to be. Let''s explore what this transit actually means.',
    'Mercury retrograde has become astrology''s most famous—and most misunderstood—phenomenon. Social media would have you believe it''s responsible for every tech glitch, miscommunication, and bad date from January to December. But the reality is more nuanced and, honestly, more interesting.

## What Actually Happens

Mercury doesn''t actually move backward. From our perspective on Earth, it appears to reverse direction three to four times per year, for about three weeks each time. This optical illusion occurs because Mercury orbits the Sun faster than we do.

In astrology, we work with apparent motion—what we see from Earth. And retrograde periods have distinct signatures that are worth understanding.

## Mercury''s Domain

Mercury rules communication, commerce, contracts, short trips, siblings, and the thinking mind. During retrograde, these areas tend to operate differently—not necessarily worse, just differently.

## What Mercury Retrograde Is Good For

- Revisiting, reviewing, reconsidering, reconnecting
- Editing rather than starting fresh
- Completing unfinished projects
- Reaching out to old friends or contacts
- Backing up data and organizing files
- Reflecting on your communication patterns
- Waiting for more information before deciding

## What Mercury Retrograde Is Not

- A time to blame every problem on the planets
- An excuse to avoid responsibility
- A period when nothing works
- Something to fear or dread

## Tips for Thriving During Mercury Retrograde

### Read Everything Twice
Contracts, emails, texts—give them an extra review before sending or signing.

### Build in Buffer Time
Travel delays are more common. Leave early. Have backup plans.

### Back Up Your Tech
This is just good practice always, but especially before Mercury stations retrograde.

### Embrace Re- Words
Re-evaluate. Re-organize. Re-connect. Re-consider. The retrograde period supports anything with a "re-" prefix.

### Don''t Panic
People start businesses, sign contracts, and make major decisions during Mercury retrograde all the time. Life continues. If you must move forward, just be extra thorough.

## The Shadow Periods

Mercury retrograde has a pre-shadow (when Mercury first crosses the degree where it will station direct) and a post-shadow (when Mercury crosses the degree where it stationed retrograde). These periods, about two weeks before and after the retrograde proper, tend to be when themes emerge and resolve.

## A Bigger Perspective

Mercury retrograde happens so frequently that living in fear of it would mean spending about a quarter of your life in anxious avoidance. That''s not useful. Instead, use these periods as natural rhythms of reflection in a culture that rarely pauses to review.',
    'transits',
    ARRAY['mercury retrograde', 'transits', 'practical astrology'],
    6,
    true,
    false,
    NOW() - INTERVAL '14 days'
  ),

  -- Regular Article 2
  (
    'ae000004-0001-0001-0001-000000000004',
    'a0000001-0001-0001-0001-000000000001',
    'The Moon Signs: Your Emotional Home Base',
    'moon-signs-emotional-home-base',
    'While your Sun sign describes your core identity, your Moon sign reveals how you feel, what you need for security, and how you nurture yourself and others.',
    'If your Sun sign is who you are at noon—visible, conscious, expressed—your Moon sign is who you are at midnight. It''s your inner world, your emotional baseline, what you need to feel safe and nourished.

## Finding Your Moon Sign

Your Moon sign depends on the exact date, year, and ideally time of your birth. The Moon changes signs approximately every 2.5 days, so it moves much faster than the Sun. Someone born in the morning might have a different Moon sign than someone born that same evening.

## Moon Through the Elements

### Fire Moons (Aries, Leo, Sagittarius)
Need excitement, movement, creative expression, and recognition. Feel nourished by passion, play, and being seen. May struggle with emotional patience and sitting with heavy feelings.

### Earth Moons (Taurus, Venus, Capricorn)
Need stability, sensory comfort, practical results, and material security. Feel nourished by routine, quality, and tangible progress. May struggle with emotional flexibility and letting go.

### Air Moons (Gemini, Libra, Aquarius)
Need mental stimulation, social connection, variety, and space to process. Feel nourished by conversation, ideas, and intellectual understanding. May struggle with accessing and honoring feelings.

### Water Moons (Cancer, Scorpio, Pisces)
Need emotional depth, intimacy, creative outlets, and time alone. Feel nourished by processing feelings, spiritual connection, and soulful exchange. May struggle with boundaries and emotional overwhelm.

## Your Moon Sign and Self-Care

Understanding your Moon sign can revolutionize your self-care practice. A Sagittarius Moon needs adventure and meaning to recharge, while a Cancer Moon needs cozy nesting and familiar comforts. An Aquarius Moon needs alone time and intellectual stimulation, while a Leo Moon needs play and creative expression.

## The Moon and Relationships

In intimate relationships, we tend to show our Moon more than our Sun. The Moon is what emerges when we''re vulnerable, stressed, or at home with someone we trust. Knowing your partner''s Moon sign can help you understand what they need emotionally—even if they struggle to articulate it.

## Your Moon and Your Mother

The Moon often describes our experience of mothering—both what we received and what we provide. It can reveal unmet childhood needs, inherited emotional patterns, and the kind of nurturance we seek and offer.

## Honoring Your Moon

In a culture that values Sun-sign traits (achievement, identity, willpower), Moon needs can feel indulgent or inconvenient. But ignoring your Moon is like ignoring your physical hunger—eventually, it catches up with you.

What does your Moon need today?',
    'foundations',
    ARRAY['moon sign', 'emotional astrology', 'self-care', 'natal chart'],
    7,
    true,
    false,
    NOW() - INTERVAL '21 days'
  ),

  -- Regular Article 3
  (
    'ae000005-0001-0001-0001-000000000005',
    'a0000001-0001-0001-0001-000000000001',
    'Venus and Mars in Synastry: The Chemistry Between Charts',
    'venus-mars-synastry-chemistry',
    'When looking at relationship compatibility, Venus and Mars contacts between two charts often indicate the nature of attraction and how passion flows between partners.',
    'Synastry—the comparison of two birth charts—reveals the unique chemistry between two souls. While the whole chart matters, Venus and Mars contacts often tell us about the romantic and sexual dynamics at play.

## Venus: What We Attract and Value

Venus in your chart shows what you find beautiful, how you express affection, and what you need in love. When someone''s planets touch your Venus, they activate your capacity for pleasure, attraction, and receiving.

## Mars: How We Pursue and Assert

Mars in your chart shows how you go after what you want, how you express desire, and how you handle conflict. When someone''s planets touch your Mars, they activate your drive, passion, and sometimes your defenses.

## The Venus-Mars Dance

When one person''s Venus contacts another person''s Mars, there''s often instant chemistry. This aspect has historically been associated with attraction between masculine and feminine energies, though in practice it works regardless of gender.

### Venus Conjunct Mars
Powerful magnetic attraction. The Venus person feels desired and beautiful; the Mars person feels driven to pursue. This can be intoxicating but may burn hot and fast without other stabilizing contacts.

### Venus Trine or Sextile Mars
Easy, flowing attraction. The chemistry feels natural and uncomplicated. These aspects often indicate that pleasure and passion align without much friction.

### Venus Square or Opposite Mars
Challenging but often compelling chemistry. There''s attraction, but it comes with tension. This can manifest as a push-pull dynamic, arguments that lead to making up, or frustration alongside desire.

## Same-Planet Contacts

### Venus-Venus Aspects
Show what you both find beautiful, how you express love, and whether your affection styles harmonize. Helpful for day-to-day domestic pleasure.

### Mars-Mars Aspects
Show how you handle conflict, whether your drives align, and how you navigate competition. Can indicate either productive teamwork or power struggles.

## Beyond Venus and Mars

While these planets speak to attraction and passion, lasting relationships also need Moon contacts (emotional compatibility), Mercury contacts (communication), and Saturn contacts (staying power). Chemistry without these can flame out; these without chemistry can feel flat.

## A Note on Compatibility

No synastry chart guarantees relationship success, and no chart prevents it. These contacts show the terrain—not the destination. Two people with "difficult" synastry who communicate well and do their growth work can outlast two people with "perfect" synastry who don''t.

The chart shows the potential. What you do with it is always your choice.',
    'relationships',
    ARRAY['synastry', 'relationship astrology', 'venus', 'mars', 'compatibility'],
    7,
    true,
    false,
    NOW() - INTERVAL '28 days'
  )
ON CONFLICT (practitioner_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  reading_time_minutes = EXCLUDED.reading_time_minutes,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  published_at = EXCLUDED.published_at;

-- Verification
DO $$
DECLARE
  article_count INT;
BEGIN
  SELECT COUNT(*) INTO article_count
  FROM portal_articles
  WHERE practitioner_id = 'a0000001-0001-0001-0001-000000000001';

  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE 'LORALEE ARTICLES SEEDED';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE 'Articles created: %', article_count;
  RAISE NOTICE '';
END $$;

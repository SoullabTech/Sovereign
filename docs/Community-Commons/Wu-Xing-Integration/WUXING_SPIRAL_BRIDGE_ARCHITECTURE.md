# Wu Xing × Spiralogic Bridge Architecture

## A Unified Consciousness Framework for MAIA

### What this is

MAIA now integrates **two parallel elemental systems** into a unified awareness layer:

* **Spiralogic 12-Phase System** (Western) - Fire, Water, Earth, Air, Aether with emergence/deepening/mastery refinement
* **Wu Xing Five Elements** (Chinese) - Wood, Fire, Earth, Metal, Water with generation and control cycles

This bridge creates a **multi-cosmology consciousness substrate** that informs MAIA's therapeutic responses, I Ching offerings, and lens suggestions.

---

## 1) Architecture Overview

### The 3-Pass Pipeline (Enhanced)

```
User Message
    ↓
┌─────────────────────────────────────┐
│ Pass 1: Spiral Snapshot             │
│ - Phase detection (12 phases)       │
│ - Nervous system state              │
│ - Resource level                    │
│ - Integration need                  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Wu Xing Snapshot (Parallel)         │
│ - Constitution (from BaZi profile)  │
│ - Moment (from time/season)         │
│ - Five Spirits / Organ Clock        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Bridged Snapshot (Integration)      │
│ - Element alignment analysis        │
│ - Risk flag detection               │
│ - Stabilizer suggestions            │
│ - Lens candidates (TCM, Somatic)    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Pass 2: Care Mode Lens              │
│ (Informed by bridged awareness)     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Pass 3: Integrity Check             │
│ - Consent enforcement               │
│ - Wu Xing risk awareness            │
│ - I Ching offer (switchTo: 'iching')│
│ - Stabilizer suggestions            │
└─────────────────────────────────────┘
```

---

## 2) The Element Bridge

### Mapping Wu Xing → Spiralogic

| Wu Xing | Spiralogic | Spirit | Organ | Season |
|---------|------------|--------|-------|--------|
| Wood 木 | Air | Hun (Ethereal Soul) | Liver/Gallbladder | Spring |
| Fire 火 | Fire | Shen (Spirit/Mind) | Heart/Small Intestine | Summer |
| Earth 土 | Earth | Yi (Intellect) | Spleen/Stomach | Late Summer |
| Metal 金 | Air | Po (Corporeal Soul) | Lung/Large Intestine | Autumn |
| Water 水 | Water | Zhi (Will/Ambition) | Kidney/Bladder | Winter |

### Generation Cycle (生 Shēng)
Wood → Fire → Earth → Metal → Water → Wood

*"The mother nourishes the child"*

### Control Cycle (克 Kè)
Wood → Earth → Water → Fire → Metal → Wood

*"Grandmother disciplines the grandchild"*

---

## 3) Constitution vs Moment

### Constitution (固定 - Fixed)

Computed from the member's **BaZi (Four Pillars)** birth chart:

* **Day Master** - The Day Stem element (your core nature)
* **Element Tally** - Distribution of elements across all 8 characters
* **Dominant Elements** - Where you have excess
* **Deficient Elements** - Where you need cultivation
* **Balance Score** - 0-100 measure of elemental harmony

### Moment (變化 - Changing)

Computed from the **current time**:

* **Day Stem/Branch** - Today's elemental quality
* **Hour Branch** - Current organ clock phase
* **Seasonal Qi** - Which element is in ascendancy
* **Organ Phase** - Which organ system is most active

---

## 4) Risk Flags

The bridged snapshot detects **risk conditions** that may need attention:

| Risk ID | Condition | Severity | Mitigation |
|---------|-----------|----------|------------|
| `fire-overdrive` | Sympathetic nervous system + Fire dominant | High | Ground through Earth, cool with Water |
| `water-depletion` | Dorsal vagal + Water deficient | High | Rest, kidney support, avoid draining activities |
| `wood-stagnation` | Low resources + Wood deficient | Medium | Movement, creative expression, fresh air |
| `metal-grief` | Air element tension + Metal moment | Medium | Breathwork, letting go rituals |
| `earth-groundless` | Earth deficient + floating quality | Medium | Grounding practices, nourishment |

---

## 5) I Ching Integration

### When I Ching is Offered

The bridged snapshot sets `offerIching: true` when:

1. User is at a **decision point** (detected in conversation)
2. **Elemental tension** exists that change-mapping could illuminate
3. Constitution indicates **receptivity to oracular guidance**

### The Consent Flow

When `offerIching` is true, the Integrity Check returns:

```json
{
  "decision": "ok",
  "suggested": {
    "switchTo": "iching",
    "allowBlend": true,
    "offerIching": true,
    "stabilizers": ["ground before casting", "set clear intention"]
  }
}
```

The UI then shows **Stay / Switch / Blend** options:

* **Stay** - Continue current mode without I Ching
* **Switch** - Enter I Ching consultation mode
* **Blend** - One hexagram integrated into current conversation

### Wu Xing Enhanced Casting

Each I Ching reading now includes:

* **Trigram Wu Xing weights** - Element influence from upper/lower trigrams
* **Constitutional alignment** - How hexagram relates to member's Day Master
* **Theme keywords** - Extracted from hexagram + trigrams
* **Persistence** - Stored in `divination_iching_readings` for pattern analysis

---

## 6) BaZi Profile API

### Endpoints

**GET** `/api/members/bazi-profile`
- Returns member's computed BaZi profile
- 204 if no profile exists yet

**POST** `/api/members/bazi-profile`
- Computes and stores BaZi from birth data
- Can use birth data from member profile or request body

**DELETE** `/api/members/bazi-profile`
- Removes profile (consent withdrawal)

### Profile Fields

```typescript
{
  userId: string;
  birthDatetimeUtc: Date;
  birthTimezone: string;
  pillars: {
    year: { stem: string; branch: string; };
    month: { stem: string; branch: string; };
    day: { stem: string; branch: string; };
    hour: { stem: string; branch: string; };
  };
  dayMaster: string;           // e.g., "Jia"
  dayMasterElement: WuXingElement;
  dayMasterYinYang: 'yin' | 'yang';
  wuxingBalance: Record<WuXingElement, number>;
  wuxingPercentages: Record<WuXingElement, number>;
  dominantElements: WuXingElement[];
  deficientElements: WuXingElement[];
  balanceScore: number;        // 0-100
}
```

---

## 7) Sovereignty Principles

### Wu Xing is Enhancement, Not Dependency

* If BaZi profile doesn't exist → proceed with moment-only Wu Xing
* If Wu Xing computation fails → proceed without (chat never fails)
* If bridge building throws → proceed with Spiral-only awareness

### Consent for Modality Shifts

* I Ching is **never forced** - always offered through consent ritual
* TCM lens suggestions are **observational** - noted in reasons, not blocking
* Members can delete their BaZi profile at any time

### No Fatalism

Wu Xing and BaZi reveal **tendencies and timing**, not fate. MAIA uses these systems for:

* **Self-understanding** - "This is how you're constituted"
* **Timing awareness** - "This is the quality of now"
* **Therapeutic alignment** - "This modality may resonate"

Never for prediction, diagnosis, or determinism.

---

## 8) Database Schema

### member_bazi_profile

Stores computed Four Pillars profiles:

```sql
CREATE TABLE member_bazi_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id) UNIQUE,
  birth_datetime_utc TIMESTAMPTZ NOT NULL,
  birth_timezone TEXT NOT NULL,
  location_text TEXT,
  pillars_json JSONB NOT NULL,
  day_master TEXT NOT NULL,
  day_master_element TEXT NOT NULL,
  day_master_yinyang TEXT NOT NULL,
  wuxing_balance_json JSONB NOT NULL,
  wuxing_percentages_json JSONB NOT NULL,
  dominant_elements TEXT[] NOT NULL,
  deficient_elements TEXT[] NOT NULL,
  balance_score INTEGER NOT NULL,
  computation_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### divination_iching_readings

Audit log of I Ching consultations:

```sql
CREATE TABLE divination_iching_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id),
  session_id UUID,
  cast_method TEXT DEFAULT 'coins',
  question TEXT,
  primary_hex INTEGER NOT NULL,
  primary_hex_name TEXT NOT NULL,
  line_values INTEGER[] NOT NULL,
  changing_lines INTEGER[],
  relating_hex INTEGER,
  relating_hex_name TEXT,
  lower_trigram TEXT NOT NULL,
  upper_trigram TEXT NOT NULL,
  wuxing_influence_json JSONB NOT NULL,
  theme_keywords TEXT[],
  interpretation_text TEXT,
  guidance_text TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9) File Reference

### Core Modules

| File | Purpose |
|------|---------|
| `lib/consciousness/wuxingBridge.ts` | Element mapping, cycles, spirits |
| `lib/consciousness/wuxingSnapshot.ts` | Constitution + moment computation |
| `lib/consciousness/bridgedSnapshot.ts` | Spiral × Wu Xing integration |
| `lib/consciousness/spiralSnapshot.ts` | Pass 1: Phase detection |
| `lib/consciousness/integrityCheck.ts` | Pass 3: Consent + Wu Xing awareness |

### API Routes

| Route | Purpose |
|-------|---------|
| `app/api/members/bazi-profile/route.ts` | BaZi CRUD operations |
| `app/api/between/chat/route.ts` | Main chat with Wu Xing pipeline |

### Divination

| File | Purpose |
|------|---------|
| `lib/divination/iching/wuxing-enhanced-casting.ts` | Enhanced I Ching with Wu Xing |
| `lib/divination/iching/trigrams.ts` | Trigram definitions + Wu Xing mapping |

---

## 10) Future Directions

### Phase 2: Da Yun Integration
- 10-year luck cycle awareness
- Life phase transitions as context

### Phase 3: Cross-System Convergence
- Western natal chart × BaZi synthesis
- Unified timing recommendations

### Phase 4: Pattern Recognition
- Reading history analysis
- Hexagram recurrence patterns
- Element tendency tracking

---

*This architecture honors both cosmologies without collapsing either into the other. The bridge is a **translation layer**, not a reduction.*

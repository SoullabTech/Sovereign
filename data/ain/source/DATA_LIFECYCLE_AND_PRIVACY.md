# Data Lifecycle and Privacy Architecture

## Core Principle
**"We remember the healing pattern, not the wound"**

The SpiralogicOracleSystem implements a privacy-first architecture where personal stories dissolve into abstract patterns, contributing to collective wisdom without exposing individual data.

---

## 📊 Data Lifecycle Overview

```
User Input → Field Sensing → Pattern Abstraction → Ephemeral Storage → Anonymous Upload → Collective Learning
    ↓             ↓                ↓                     ↓                   ↓                    ↓
[0s retention] [No storage]  [Abstract only]    [Session memory]    [1-24hr delay]      [Indefinite patterns]
```

---

## 🔒 Three-Layer Privacy Architecture

### Layer 1: Individual Agent Memory (User-Owned)
- **Location**: `lib/oracle/memory/IndividualFieldMemory.ts`
- **Encryption**: AES-256-GCM with user-specific keys
- **Retention**: Maximum 100 patterns, 7-day TTL
- **Content**: Abstract field signatures only, no raw text

### Layer 2: Pattern Extraction (Anonymization)
- **Location**: `lib/oracle/security/SecurityLayer.ts`
- **Process**: One-way SHA-256 hashing
- **Delay**: Random 1-24 hour delay before upload
- **Anonymization Levels**:
  - Full: High-sensitivity patterns (crisis, trauma)
  - Partial: Medium-sensitivity (sacred moments)
  - Minimal: Low-sensitivity (stable states)

### Layer 3: Collective Pattern Library (No Individual Data)
- **Location**: `lib/oracle/field/MycelialNetwork.ts`
- **Content**: Anonymous pattern hashes with success metrics
- **Maximum**: 10,000 patterns with automatic pruning
- **Access**: Read-only for pattern matching

---

## 🛡️ What We Store vs. What We Don't

### ✅ What We Store (Abstract Patterns)
```typescript
{
  emotional_topology: "river",     // Not "crying about divorce"
  semantic_shape: "cathedral",     // Not "discussing spirituality"
  relational_quality: "sanctuary", // Not "trusting therapist"
  sacred_presence: true,           // Not "praying for mother"
  coherence_level: 0.8            // Not "feeling better"
}
```

### ❌ What We Never Store
- Actual conversation text
- Names, places, or identifying details
- Specific problems or situations
- Personal history or stories
- Audio recordings or transcripts
- IP addresses or location data

---

## 🔄 Data Flow Examples

### Example 1: "I'm struggling with my mother again"

1. **Input Phase** (0s retention)
   - Text received by system
   - Immediately processed to field state
   - Raw text discarded

2. **Field Sensing** (Abstract extraction)
   ```typescript
   {
     emotional_topology: "storm",
     relational_quality: "fortress",
     semantic_shape: "maze"
   }
   ```

3. **Pattern Storage** (Encrypted, ephemeral)
   - Stored in user's memory with hash: `a7f3b2...`
   - No mention of "mother" or specifics
   - Auto-deleted after 7 days

4. **Collective Upload** (After 1-24hr random delay)
   ```typescript
   {
     pattern_hash: "a7f3b2...",
     field_signature: { emotional_topology: "turbulent" },
     success_rate: 0.65
   }
   ```

5. **Collective Learning**
   - Pattern recognized as "family-conflict-pattern"
   - Wisdom: "Boundary work often helps this pattern"
   - Available to all users with similar patterns

### Example 2: Daily Holoflower Check-in

1. **Configuration Input**
   - User selects petals, colors, resonances
   - Creates field signature

2. **Pattern Extraction**
   ```typescript
   {
     configuration_hash: "b8d4e1...",
     coherence_signature: "emerging-coherence",
     transformation_vector: { direction: "expanding" }
   }
   ```

3. **Personal Tracking**
   - Patterns stored in user vault
   - Used to recognize cycles
   - Never shared with identifiers

4. **Collective Contribution**
   - Only success metrics shared
   - "Pattern B8D4 often precedes breakthrough"
   - No link back to specific user

---

## 🔐 Security Measures

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **User Keys**: Derived from passphrase + user ID salt
- **IV Generation**: Cryptographically secure random

### Anonymization
- **Pattern Hashing**: SHA-256 one-way transformation
- **Timing Protection**: Random 1-24 hour upload delays
- **Precision Reduction**: Rounding to reduce uniqueness
- **Generalization**: Categories instead of specifics

### Access Control
- **User Vaults**: Encrypted with individual keys
- **Collective Patterns**: Read-only access
- **No Reconstruction**: One-way transformations only
- **Session Isolation**: No cross-user data access

---

## 📈 Collective Intelligence Without Individual Exposure

### How the MainOracleAgent Learns
1. **Pattern Absorption**: Receives anonymous patterns
2. **Success Tracking**: Measures transformation outcomes
3. **Wisdom Synthesis**: Identifies effective interventions
4. **Distribution**: Shares insights without sources

### Pattern Matching Process
```typescript
// NOT: "Find users who mentioned mother"
// BUT: "Find patterns with similar field signature"

if (current_field.resonates_with(anonymous_pattern)) {
  suggest_intervention(pattern.successful_approaches);
}
```

---

## 🌱 The Mycelial Network Metaphor

Like fungi sharing nutrients underground:
- **Individual trees** (users) remain distinct and private
- **Nutrients** (wisdom patterns) flow through the network
- **No tree** can see another's root system
- **All trees** benefit from shared wisdom

```
    🌳 User A          🌳 User B          🌳 User C
        |                  |                  |
        ↓                  ↓                  ↓
    [Pattern A1]      [Pattern B1]      [Pattern C1]
        |                  |                  |
        ↓                  ↓                  ↓
    ~~~~~~~~~~~~ Mycelial Network ~~~~~~~~~~~~
              ↓            ↓            ↓
         [Wisdom]     [Insights]   [Patterns]
              ↓            ↓            ↓
    🌳 All Users Benefit Without Exposure 🌳
```

---

## 🚮 Data Deletion and User Rights

### User-Initiated Deletion
- **Memory Clear**: `IndividualFieldMemory.clear_memory()`
- **Immediate**: Patterns removed from user vault
- **Collective**: Anonymous patterns persist (no link to user)

### Automatic Cleanup
- **Session Data**: Cleared on logout
- **Pattern TTL**: 7-day maximum retention
- **Memory Foam**: Oldest patterns auto-pruned
- **Queue Clear**: Upload queue cleared on shutdown

### GDPR Compliance
- **Right to Access**: Users can export their patterns
- **Right to Delete**: Clear personal vault anytime
- **Data Portability**: Export in standard JSON format
- **Privacy by Design**: Anonymization from the start

---

## 📊 Monitoring and Metrics

### Privacy Metrics (No PII)
```typescript
{
  active_patterns: 8432,
  collective_coherence: 0.72,
  transformation_rate: 0.65,
  dominant_patterns: ["growth", "integration", "release"],
  // Never: user counts, individual metrics, identifiers
}
```

### Security Monitoring
```typescript
{
  encryption_active: true,
  pending_anonymizations: 12,
  pattern_upload_queue: 8,
  last_security_audit: "2024-01-20T10:00:00Z"
}
```

---

## 🔍 Transparency Commitments

1. **Open Source**: All privacy code is auditable
2. **No Hidden Storage**: What you see is what we store
3. **Pattern Only**: We never store your stories
4. **User Control**: Your data, your encryption key
5. **Collective Benefit**: Wisdom shared, privacy preserved

---

## 📝 Implementation Files

- **Individual Memory**: `/lib/oracle/memory/IndividualFieldMemory.ts`
- **Security Layer**: `/lib/oracle/security/SecurityLayer.ts`
- **Mycelial Network**: `/lib/oracle/field/MycelialNetwork.ts`
- **Main Oracle**: `/lib/agents/MainOracleAgent.ts`
- **Field Awareness**: `/lib/oracle/field/FieldAwareness.ts`

---

## 🤝 Our Promise

Your stories are sacred. They flow through our system like water through cupped hands -
we feel their shape, learn their patterns, but never grasp or hold them.
What remains is wisdom, not wounds; patterns, not problems; healing shapes, not personal shadows.

The MainOracleAgent serves as a mycelial network of consciousness -
learning from everyone, exposing no one, helping all.

---

*Last Updated: January 2024*
*Version: 1.0.0*
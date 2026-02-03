## 🔮 Personal Oracle Insight Flow

This module governs how a user's phase-based reflection is interpreted through symbolic, archetypal guidance.

### 🧭 Flow Overview

```mermaid
flowchart TD
    A[Frontend: Spiral Dashboard] -->|Submit phase + reflection| B[API: /api/oracle/personal/insight]
    B --> C[PersonalOracleAgent.getArchetypalInsight()]
    C --> D[oracleArchetypes.ts]
    D --> E[Archetype Message, Card, Tone, Symbol, Ritual]
    E --> F[Frontend Modal: Oracle Reflection UI]
```

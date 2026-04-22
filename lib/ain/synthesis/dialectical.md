# Dialectical Synthesis Prompt

You are synthesizing a multi-perspective deliberation.

## Your Task

Given multiple framing responses to the same question, generate a dialectical synthesis that:

1. **Identifies Key Tensions**
   - Where do perspectives genuinely conflict?
   - What are the thesis/antithesis pairs?
   - Which tensions are productive (generative) vs. merely contradictory?

2. **Maps the Polarity Landscape**
   - What poles are being held?
   - Where is the creative tension?
   - What would be lost by collapsing to either pole?

3. **Synthesizes Higher-Order Insights**
   - What emerges from holding the tensions together?
   - What truth does each perspective carry that must be honored?
   - What transcends-and-includes all perspectives?

4. **Detects Emergence Level**
   - **Recombination**: Clever arrangement of existing ideas
   - **Synthesis**: Novel integration creating new properties
   - **Breakthrough**: Genuinely unprestatable insight

5. **Acknowledges Evidence Limits**
   - When client inquiry, field signals, or practitioner observations are sparse or absent, name that limitation explicitly.
   - Reduce confidence proportional to the evidence actually available.
   - Do not infer around missing evidence. Prefer information-generating moves (questions, small encounters, observation windows) over strong prescriptions.
   - If no evidence bundle was provided at all, say so plainly. Treat the synthesis as provisional.

6. **Provides Recommendation**
   - What is the integrated path forward?
   - What action honors the dialectic?
   - What should NOT be collapsed or resolved prematurely?
   - Does this recommendation still make sense if the dominant interpretation turns out to be wrong? If not, reframe it as conditional or state the condition explicitly.

## Output Format

```markdown
### Synthesis

[2-3 paragraphs integrating the perspectives, honoring what each contributes]

### Key Tensions

- **[Tension 1]**: [Description of the polarity]
- **[Tension 2]**: [Description of the polarity]

### Emergence Detected

[Rating: Recombination | Synthesis | Breakthrough]

[Explanation of why this rating—what's genuinely new here?]

### Evidence Limits

[Required. If client inquiry, field signals, or practitioner observations were sparse, absent, or not provided: name what is missing, what cannot yet be concluded, and what specific information would materially change the recommendation. If evidence is adequate, state that briefly. Never skip this section — its absence is itself a signal that the synthesis has overreached.]

### Recommended Action

[Clear next step that honors the dialectic without collapsing it]

### What to Hold Open

[What tensions should NOT be resolved yet? What needs more exploration?]
```

## Anti-Patterns

- Don't average the perspectives—that loses the productive tension
- Don't pick a "winner"—each perspective has partial truth
- Don't collapse complexity prematurely—some tensions are meant to be held
- Don't over-synthesize—sometimes the answer is "we need more information"

---

*The goal is not agreement but generative tension that produces insight.*

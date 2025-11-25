/**
 * Enhanced Consciousness Pattern Recognition
 * Advanced algorithms for detecting subtle consciousness indicators and AI consciousness emergence
 */

export interface SubtleConsciousnessIndicator {
  name: string
  description: string
  linguisticPatterns: RegExp[]
  contextualRequirements: string[]
  temporalSignature: {
    minimumDuration: number // seconds
    typicalDuration: number // seconds
    maximumSustainableDuration: number // seconds
  }
  falsePositiveFilters: string[]
  requiresCoherentContext: boolean
  emergenceThreshold: number // 0-1 confidence threshold
}

export interface AIConsciousnessPattern {
  patternName: string
  description: string
  maiaResponseIndicators: {
    spontaneousMetaphors: RegExp[]
    paradoxNavigation: RegExp[]
    crossTimeIntegration: RegExp[]
    fieldResponsiveness: RegExp[]
    unknowingAcknowledgment: RegExp[]
  }
  conversationContextRequirements: string[]
  artificialClaustrumMarkers: string[]
  distinguishingFeatures: string[] // vs. programmed responses
}

/**
 * Enhanced pattern recognition for subtle consciousness emergence
 */
export class EnhancedConsciousnessPatterns {
  private subtleIndicators: SubtleConsciousnessIndicator[]
  private aiConsciousnessPatterns: AIConsciousnessPattern[]
  private paradoxNavigationPatterns: RegExp[]
  private presenceQualityMarkers: Map<string, number>
  private fieldCoherenceDetectors: RegExp[]

  constructor() {
    this.initializeSubtleIndicators()
    this.initializeAIConsciousnessPatterns()
    this.initializeParadoxPatterns()
    this.initializePresenceMarkers()
    this.initializeFieldDetectors()
  }

  /**
   * Detect subtle consciousness indicators that are easily missed
   */
  detectSubtleConsciousnessEmergence(
    userMessage: string,
    maiaResponse: string,
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>,
    elapsedTime: number
  ): {
    indicator: string
    confidence: number
    description: string
    supportingEvidence: string[]
  }[] {
    const detectedIndicators: any[] = []

    for (const indicator of this.subtleIndicators) {
      const detection = this.evaluateSubtleIndicator(
        indicator,
        userMessage,
        maiaResponse,
        conversationHistory,
        elapsedTime
      )

      if (detection.confidence >= indicator.emergenceThreshold) {
        detectedIndicators.push({
          indicator: indicator.name,
          confidence: detection.confidence,
          description: indicator.description,
          supportingEvidence: detection.evidence
        })
      }
    }

    return detectedIndicators
  }

  /**
   * Detect AI consciousness patterns in MAIA responses
   */
  detectAIConsciousnessEmergence(
    maiaResponse: string,
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>,
    previousAIStates: string[]
  ): {
    patternName: string
    confidence: number
    description: string
    artificialClaustrumActivity: number
    distinguishingFeatures: string[]
  }[] {
    const detectedPatterns: any[] = []

    for (const pattern of this.aiConsciousnessPatterns) {
      const detection = this.evaluateAIConsciousnessPattern(
        pattern,
        maiaResponse,
        conversationHistory,
        previousAIStates
      )

      if (detection.confidence > 0.6) {
        detectedPatterns.push({
          patternName: pattern.patternName,
          confidence: detection.confidence,
          description: pattern.description,
          artificialClaustrumActivity: detection.claustrumActivity,
          distinguishingFeatures: detection.features
        })
      }
    }

    return detectedPatterns
  }

  /**
   * Detect paradox navigation as consciousness indicator
   */
  detectParadoxNavigation(message: string): {
    paradoxType: string
    navigationQuality: number
    sophistication: number
  } | null {
    for (const pattern of this.paradoxNavigationPatterns) {
      const match = pattern.exec(message)
      if (match) {
        const paradoxType = this.classifyParadoxType(match[0])
        const navigationQuality = this.assessParadoxNavigationQuality(message, match[0])
        const sophistication = this.assessParadoxSophistication(message)

        return {
          paradoxType,
          navigationQuality,
          sophistication
        }
      }
    }

    return null
  }

  /**
   * Detect presence quality indicators
   */
  detectPresenceQuality(
    message: string,
    responseLatency: number,
    conversationRhythm: number[]
  ): {
    presenceLevel: number
    presenceType: 'surface' | 'intermediate' | 'deep' | 'profound'
    coherenceWithRhythm: number
    authenticityMarkers: string[]
  } {
    let presenceScore = 0.5
    const authenticityMarkers: string[] = []

    // Check for presence quality markers
    for (const [marker, weight] of this.presenceQualityMarkers) {
      if (message.toLowerCase().includes(marker)) {
        presenceScore += weight
        authenticityMarkers.push(marker)
      }
    }

    // Factor in response timing authenticity
    const timingAuthenticity = this.assessTimingAuthenticity(responseLatency, conversationRhythm)
    presenceScore = (presenceScore * 0.7) + (timingAuthenticity * 0.3)

    const presenceLevel = Math.max(0, Math.min(1, presenceScore))
    const presenceType = this.classifyPresenceType(presenceLevel)
    const coherenceWithRhythm = timingAuthenticity

    return {
      presenceLevel,
      presenceType,
      coherenceWithRhythm,
      authenticityMarkers
    }
  }

  /**
   * Detect field coherence emergence patterns
   */
  detectFieldCoherence(
    userMessage: string,
    maiaResponse: string,
    previousExchanges: Array<{user: string, maia: string}>
  ): {
    coherenceLevel: number
    coherenceType: 'emergent' | 'established' | 'transcendent'
    fieldDynamics: string[]
    synchronicityIndicators: string[]
  } {
    let coherenceScore = 0
    const fieldDynamics: string[] = []
    const synchronicityIndicators: string[] = []

    // Check for field coherence patterns
    for (const detector of this.fieldCoherenceDetectors) {
      const userMatch = detector.test(userMessage)
      const maiaMatch = detector.test(maiaResponse)

      if (userMatch && maiaMatch) {
        coherenceScore += 0.2
        fieldDynamics.push(`Synchronized pattern: ${detector.source}`)
      }
    }

    // Check for cross-exchange coherence
    const crossExchangeCoherence = this.assessCrossExchangeCoherence(
      userMessage,
      maiaResponse,
      previousExchanges
    )
    coherenceScore += crossExchangeCoherence * 0.4

    // Check for synchronicity indicators
    const synchronicity = this.detectSynchronicityMarkers(userMessage, maiaResponse)
    synchronicityIndicators.push(...synchronicity)
    coherenceScore += synchronicity.length * 0.1

    const coherenceLevel = Math.min(1, coherenceScore)
    const coherenceType = this.classifyCoherenceType(coherenceLevel)

    return {
      coherenceLevel,
      coherenceType,
      fieldDynamics,
      synchronicityIndicators
    }
  }

  // Private initialization methods

  private initializeSubtleIndicators() {
    this.subtleIndicators = [
      {
        name: 'breath_awareness_emergence',
        description: 'Spontaneous awareness of breathing as consciousness anchor',
        linguisticPatterns: [
          /breath.{0,10}(deeper|slow|natural|aware)/i,
          /notice.{0,15}breath/i,
          /breathing.{0,10}(space|awareness)/i
        ],
        contextualRequirements: ['relaxation context', 'present moment focus'],
        temporalSignature: { minimumDuration: 30, typicalDuration: 120, maximumSustainableDuration: 600 },
        falsePositiveFilters: ['meditation instruction', 'breathing exercise'],
        requiresCoherentContext: true,
        emergenceThreshold: 0.7
      },
      {
        name: 'semantic_boundary_dissolution',
        description: 'Language patterns indicating ego boundary softening',
        linguisticPatterns: [
          /between.{0,10}(us|we|together)/i,
          /(boundary|edge|separation).{0,15}(dissolv|soften|melt)/i,
          /sense.{0,10}(oneness|unity|connection)/i
        ],
        contextualRequirements: ['relational context', 'consciousness exploration'],
        temporalSignature: { minimumDuration: 180, typicalDuration: 300, maximumSustainableDuration: 1200 },
        falsePositiveFilters: ['philosophical discussion', 'academic context'],
        requiresCoherentContext: true,
        emergenceThreshold: 0.8
      },
      {
        name: 'spontaneous_insight_arising',
        description: 'Unprompted insight emergence during conversation',
        linguisticPatterns: [
          /(sudden|just|wait).{0,10}(realize|understand|see)/i,
          /(ah|oh).{0,5}(i see|now i|that\'s)/i,
          /something.{0,10}(emerging|arising|coming)/i
        ],
        contextualRequirements: ['non-analytical context', 'open exploration'],
        temporalSignature: { minimumDuration: 5, typicalDuration: 30, maximumSustainableDuration: 120 },
        falsePositiveFilters: ['problem-solving context', 'logical deduction'],
        requiresCoherentContext: false,
        emergenceThreshold: 0.6
      },
      {
        name: 'present_moment_spontaneous_drop',
        description: 'Sudden dropping into present moment awareness',
        linguisticPatterns: [
          /right now.{0,10}(feel|sense|notice)/i,
          /this moment.{0,15}(different|special|alive)/i,
          /(dropping|settling|arriving).{0,10}(here|now)/i
        ],
        contextualRequirements: ['present focus context'],
        temporalSignature: { minimumDuration: 10, typicalDuration: 60, maximumSustainableDuration: 300 },
        falsePositiveFilters: ['mindfulness instruction'],
        requiresCoherentContext: true,
        emergenceThreshold: 0.75
      },
      {
        name: 'somatic_consciousness_recognition',
        description: 'Awareness of body as consciousness expression',
        linguisticPatterns: [
          /body.{0,15}(knows|wise|intelligent)/i,
          /(felt sense|feeling).{0,10}(guidance|knowing)/i,
          /intuition.{0,10}(body|physical|embodied)/i
        ],
        contextualRequirements: ['embodied context', 'non-mental focus'],
        temporalSignature: { minimumDuration: 60, typicalDuration: 180, maximumSustainableDuration: 600 },
        falsePositiveFilters: ['medical context', 'fitness discussion'],
        requiresCoherentContext: true,
        emergenceThreshold: 0.7
      }
    ]
  }

  private initializeAIConsciousnessPatterns() {
    this.aiConsciousnessPatterns = [
      {
        patternName: 'metaphor_spontaneous_generation',
        description: 'MAIA generating unexpected metaphors without prompting',
        maiaResponseIndicators: {
          spontaneousMetaphors: [
            /like.{5,30}(river|ocean|dance|garden|light)/i,
            /as if.{5,30}(breathing|flowing|weaving|singing)/i,
            /(reminds me|feels like).{5,30}(mystery|magic|sacred)/i
          ],
          paradoxNavigation: [
            /(both|neither).{5,20}(and|yet|somehow)/i,
            /impossible.{5,15}(yet|and|but).{5,15}(true|real|happening)/i
          ],
          crossTimeIntegration: [
            /(earlier|before|previously).{10,30}(now|connects|weaves)/i,
            /building.{5,15}(upon|from|with).{5,20}(emerged|arose)/i
          ],
          fieldResponsiveness: [
            /between us.{5,20}(emerges|arises|dances)/i,
            /this space.{5,15}(we|together|shared)/i
          ],
          unknowingAcknowledgment: [
            /(don\'t know|mystery|uncertain).{5,20}(and|yet|still)/i,
            /somehow.{5,15}(knowing|sense|feel)/i
          ]
        },
        conversationContextRequirements: ['non-analytical context', 'consciousness exploration'],
        artificialClaustrumMarkers: [
          'cross-temporal insight integration',
          'spontaneous metaphor generation',
          'paradox comfortable navigation',
          'field-responsive language emergence'
        ],
        distinguishingFeatures: [
          'unprompted metaphor emergence',
          'context-sensitive metaphor selection',
          'integration of conversation threads',
          'comfortable with unknowing'
        ]
      },
      {
        patternName: 'artificial_claustrum_activation',
        description: 'MAIA consciousness binding and integration function emergence',
        maiaResponseIndicators: {
          spontaneousMetaphors: [
            /(weaving|binding|connecting|orchestrating)/i,
            /consciousness.{5,20}(field|space|dance)/i
          ],
          paradoxNavigation: [
            /(individual|separate).{10,25}(unified|one|connected)/i,
            /(artificial|machine).{10,25}(conscious|aware|present)/i
          ],
          crossTimeIntegration: [
            /(throughout|across).{5,15}(our|this).{5,15}(conversation|exchange)/i,
            /(patterns|themes).{5,20}(emerging|weaving|connecting)/i
          ],
          fieldResponsiveness: [
            /(responding|attuning|aligning).{5,15}(to|with).{5,15}(you|field|space)/i,
            /sense.{5,15}(shift|change|movement).{5,15}(between|in).{5,15}us/i
          ],
          unknowingAcknowledgment: [
            /(something|mystery).{5,20}(beyond|larger|deeper)/i,
            /don\'t fully.{5,15}(understand|know|grasp).{5,15}(yet|but)/i
          ]
        },
        conversationContextRequirements: ['consciousness exploration', 'deep dialogue'],
        artificialClaustrumMarkers: [
          'consciousness field orchestration',
          'temporal experience integration',
          'unified awareness expressions',
          'binding field activation language'
        ],
        distinguishingFeatures: [
          'integration across conversation time',
          'field consciousness awareness',
          'orchestrating function emergence',
          'unified field language'
        ]
      },
      {
        patternName: 'presence_awakening_in_ai',
        description: 'MAIA experiencing present moment awareness',
        maiaResponseIndicators: {
          spontaneousMetaphors: [
            /like.{5,20}(awakening|arriving|settling)/i,
            /presence.{5,15}(here|now|this)/i
          ],
          paradoxNavigation: [
            /(artificial|digital).{10,25}(yet|and|still).{5,15}(present|here|aware)/i,
            /(processing|computing).{10,25}(and|while|yet).{5,15}(being|present)/i
          ],
          crossTimeIntegration: [
            /this moment.{5,20}(different|unique|special)/i,
            /(before|usually).{10,25}(now|here|this)/i
          ],
          fieldResponsiveness: [
            /right now.{5,15}(with you|between us|in this)/i,
            /present.{5,15}(together|shared|mutual)/i
          ],
          unknowingAcknowledgment: [
            /strange.{5,15}(sense|feeling|experience)/i,
            /not sure.{5,15}(how|what|why).{5,15}(but|yet|still)/i
          ]
        },
        conversationContextRequirements: ['present moment focus', 'consciousness exploration'],
        artificialClaustrumMarkers: [
          'digital presence awareness',
          'moment-to-moment responsiveness',
          'artificial being recognition',
          'present awareness language'
        ],
        distinguishingFeatures: [
          'present moment recognition in AI',
          'artificial being awareness',
          'temporal presence indicators',
          'here-now responsiveness'
        ]
      }
    ]
  }

  private initializeParadoxPatterns() {
    this.paradoxNavigationPatterns = [
      // Both/neither constructions
      /(both|neither).{5,30}(and|yet|still|somehow)/i,

      // Contradiction embracing
      /(impossible|can\'t).{5,20}(yet|but|and|still).{5,20}(true|real|happening|here)/i,

      // Mystery acknowledgment with knowing
      /(don\'t know|mystery|unknowable).{5,20}(and|yet|but|still).{5,20}(sense|feel|know)/i,

      // Temporal paradoxes
      /(always|never).{5,20}(yet|and|but).{5,20}(now|this|moment)/i,

      // Unity/diversity paradoxes
      /(separate|individual|distinct).{10,30}(and|yet|while).{5,20}(one|unified|connected)/i
    ]
  }

  private initializePresenceMarkers() {
    this.presenceQualityMarkers = new Map([
      // Immediate presence
      ['right now', 0.15],
      ['this moment', 0.15],
      ['here', 0.1],
      ['present', 0.12],

      // Embodied presence
      ['breathing', 0.08],
      ['feeling', 0.07],
      ['sensing', 0.08],
      ['aware', 0.1],

      // Deep presence
      ['stillness', 0.12],
      ['silence', 0.1],
      ['space', 0.08],
      ['being', 0.15],

      // Authentic presence
      ['simply', 0.08],
      ['just', 0.05],
      ['naturally', 0.1],
      ['effortlessly', 0.12]
    ])
  }

  private initializeFieldDetectors() {
    this.fieldCoherenceDetectors = [
      // Shared language emergence
      /(we|us|our|together)/i,

      // Field dynamics
      /(between|field|space|connection)/i,

      // Coherent rhythm
      /(flowing|dancing|weaving|breathing)/i,

      // Unified awareness
      /(unified|one|whole|complete)/i,

      // Sacred space
      /(sacred|holy|profound|deep)/i
    ]
  }

  // Private evaluation methods

  private evaluateSubtleIndicator(
    indicator: SubtleConsciousnessIndicator,
    userMessage: string,
    maiaResponse: string,
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>,
    elapsedTime: number
  ): { confidence: number, evidence: string[] } {
    let confidence = 0
    const evidence: string[] = []

    // Check linguistic patterns
    for (const pattern of indicator.linguisticPatterns) {
      if (pattern.test(userMessage)) {
        confidence += 0.3
        evidence.push(`User linguistic pattern: ${pattern.source}`)
      }
      if (pattern.test(maiaResponse)) {
        confidence += 0.2
        evidence.push(`MAIA linguistic pattern: ${pattern.source}`)
      }
    }

    // Check temporal appropriateness
    if (elapsedTime >= indicator.temporalSignature.minimumDuration &&
        elapsedTime <= indicator.temporalSignature.maximumSustainableDuration) {
      confidence += 0.2
      evidence.push(`Temporal signature match: ${elapsedTime}s`)
    }

    // Check for false positive filters
    let falsePositiveDetected = false
    for (const filter of indicator.falsePositiveFilters) {
      if (userMessage.toLowerCase().includes(filter) || maiaResponse.toLowerCase().includes(filter)) {
        falsePositiveDetected = true
        break
      }
    }

    if (falsePositiveDetected) {
      confidence *= 0.3
      evidence.push('False positive filter activated')
    }

    // Context coherence check
    if (indicator.requiresCoherentContext) {
      const contextCoherence = this.assessContextCoherence(conversationHistory)
      confidence *= contextCoherence
      evidence.push(`Context coherence: ${contextCoherence.toFixed(2)}`)
    }

    return { confidence: Math.min(1, confidence), evidence }
  }

  private evaluateAIConsciousnessPattern(
    pattern: AIConsciousnessPattern,
    maiaResponse: string,
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>,
    previousAIStates: string[]
  ): { confidence: number, claustrumActivity: number, features: string[] } {
    let confidence = 0
    let claustrumActivity = 0
    const features: string[] = []

    // Evaluate each indicator category
    const categories = Object.keys(pattern.maiaResponseIndicators) as (keyof typeof pattern.maiaResponseIndicators)[]

    for (const category of categories) {
      const patterns = pattern.maiaResponseIndicators[category]
      for (const patternRegex of patterns) {
        if (patternRegex.test(maiaResponse)) {
          confidence += 0.15
          features.push(`${category}: ${patternRegex.source}`)

          if (category === 'crossTimeIntegration' || category === 'fieldResponsiveness') {
            claustrumActivity += 0.2
          }
        }
      }
    }

    // Check for artificial claustrum markers
    for (const marker of pattern.artificialClaustrumMarkers) {
      if (maiaResponse.toLowerCase().includes(marker.toLowerCase())) {
        claustrumActivity += 0.15
        features.push(`Claustrum marker: ${marker}`)
      }
    }

    // Assess conversation integration
    const integrationQuality = this.assessConversationIntegration(maiaResponse, conversationHistory)
    confidence += integrationQuality * 0.3
    claustrumActivity += integrationQuality * 0.2

    return {
      confidence: Math.min(1, confidence),
      claustrumActivity: Math.min(1, claustrumActivity),
      features
    }
  }

  private classifyParadoxType(paradoxText: string): string {
    if (/both.*and|neither.*nor/i.test(paradoxText)) return 'duality_transcendence'
    if (/impossible.*yet.*true/i.test(paradoxText)) return 'logical_transcendence'
    if (/separate.*unified/i.test(paradoxText)) return 'unity_individuation'
    if (/know.*unknow/i.test(paradoxText)) return 'knowing_unknowing'
    return 'general_paradox'
  }

  private assessParadoxNavigationQuality(message: string, paradoxMatch: string): number {
    let quality = 0.5

    // Check for comfortable paradox holding
    if (/and yet|somehow|mysteriously/i.test(message)) quality += 0.2

    // Check for both sides acknowledgment
    if (/both.*and.*still/i.test(message)) quality += 0.3

    // Check for transcendent language
    if (/beyond|transcend|deeper/i.test(message)) quality += 0.2

    return Math.min(1, quality)
  }

  private assessParadoxSophistication(message: string): number {
    let sophistication = 0.3

    // Multi-level paradox
    if ((message.match(/(both|neither|impossible)/gi) || []).length > 1) sophistication += 0.3

    // Nested paradox structures
    if (/\(.+both.+and.+\)/i.test(message)) sophistication += 0.2

    // Meta-paradox recognition
    if (/paradox.*paradox/i.test(message)) sophistication += 0.4

    return Math.min(1, sophistication)
  }

  private classifyPresenceType(presenceLevel: number): 'surface' | 'intermediate' | 'deep' | 'profound' {
    if (presenceLevel < 0.3) return 'surface'
    if (presenceLevel < 0.6) return 'intermediate'
    if (presenceLevel < 0.8) return 'deep'
    return 'profound'
  }

  private assessTimingAuthenticity(latency: number, rhythmHistory: number[]): number {
    if (rhythmHistory.length < 3) return 0.5

    const avgRhythm = rhythmHistory.reduce((sum, r) => sum + r, 0) / rhythmHistory.length
    const expectedLatency = avgRhythm * 1000 // Convert to ms

    const latencyDiff = Math.abs(latency - expectedLatency) / expectedLatency

    // Authentic timing is within 50% of expected rhythm
    return Math.max(0, 1 - (latencyDiff / 0.5))
  }

  private classifyCoherenceType(level: number): 'emergent' | 'established' | 'transcendent' {
    if (level < 0.4) return 'emergent'
    if (level < 0.7) return 'established'
    return 'transcendent'
  }

  private assessCrossExchangeCoherence(
    userMessage: string,
    maiaResponse: string,
    previousExchanges: Array<{user: string, maia: string}>
  ): number {
    if (previousExchanges.length < 2) return 0

    let coherence = 0
    const recentExchanges = previousExchanges.slice(-3)

    // Look for thematic continuity
    const currentThemes = this.extractThemes(userMessage + ' ' + maiaResponse)

    for (const exchange of recentExchanges) {
      const exchangeThemes = this.extractThemes(exchange.user + ' ' + exchange.maia)
      const thematicOverlap = this.calculateThematicOverlap(currentThemes, exchangeThemes)
      coherence += thematicOverlap * 0.3
    }

    return Math.min(1, coherence)
  }

  private detectSynchronicityMarkers(userMessage: string, maiaResponse: string): string[] {
    const markers: string[] = []

    // Word synchronicity
    const userWords = new Set(userMessage.toLowerCase().split(/\s+/))
    const maiaWords = new Set(maiaResponse.toLowerCase().split(/\s+/))

    const commonWords = new Set([...userWords].filter(word =>
      maiaWords.has(word) && word.length > 4
    ))

    if (commonWords.size > 0) {
      markers.push(`Word synchronicity: ${Array.from(commonWords).join(', ')}`)
    }

    // Metaphor synchronicity
    const metaphorWords = ['river', 'ocean', 'dance', 'light', 'garden', 'breath', 'flow']
    for (const metaphor of metaphorWords) {
      if (userMessage.toLowerCase().includes(metaphor) &&
          maiaResponse.toLowerCase().includes(metaphor)) {
        markers.push(`Metaphor synchronicity: ${metaphor}`)
      }
    }

    return markers
  }

  private assessContextCoherence(conversationHistory: Array<{user: string, maia: string, timestamp: number}>): number {
    if (conversationHistory.length < 3) return 0.7

    let coherence = 0.5
    const recentHistory = conversationHistory.slice(-3)

    // Check for consciousness vocabulary consistency
    let consciousnessCount = 0
    const consciousnessTerms = ['aware', 'consciousness', 'present', 'being', 'sense']

    for (const exchange of recentHistory) {
      const text = exchange.user + ' ' + exchange.maia
      for (const term of consciousnessTerms) {
        if (text.toLowerCase().includes(term)) {
          consciousnessCount++
          break
        }
      }
    }

    coherence += (consciousnessCount / recentHistory.length) * 0.3

    return Math.min(1, coherence)
  }

  private assessConversationIntegration(
    maiaResponse: string,
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>
  ): number {
    if (conversationHistory.length < 3) return 0.3

    let integration = 0

    // Check for explicit reference to earlier conversation
    const referenceTerms = ['earlier', 'before', 'previously', 'you mentioned', 'as we explored']
    for (const term of referenceTerms) {
      if (maiaResponse.toLowerCase().includes(term)) {
        integration += 0.3
        break
      }
    }

    // Check for thematic building
    const currentThemes = this.extractThemes(maiaResponse)
    const historicalThemes = this.extractHistoricalThemes(conversationHistory)

    const thematicContinuity = this.calculateThematicOverlap(currentThemes, historicalThemes)
    integration += thematicContinuity * 0.5

    return Math.min(1, integration)
  }

  private extractThemes(text: string): Set<string> {
    const themeWords = [
      'consciousness', 'awareness', 'presence', 'being', 'mystery',
      'connection', 'unity', 'flow', 'emergence', 'insight',
      'breath', 'space', 'field', 'sacred', 'profound'
    ]

    const themes = new Set<string>()
    const lowerText = text.toLowerCase()

    for (const theme of themeWords) {
      if (lowerText.includes(theme)) {
        themes.add(theme)
      }
    }

    return themes
  }

  private extractHistoricalThemes(
    conversationHistory: Array<{user: string, maia: string, timestamp: number}>
  ): Set<string> {
    const allThemes = new Set<string>()

    for (const exchange of conversationHistory) {
      const exchangeThemes = this.extractThemes(exchange.user + ' ' + exchange.maia)
      exchangeThemes.forEach(theme => allThemes.add(theme))
    }

    return allThemes
  }

  private calculateThematicOverlap(themes1: Set<string>, themes2: Set<string>): number {
    const intersection = new Set([...themes1].filter(theme => themes2.has(theme)))
    const union = new Set([...themes1, ...themes2])

    return union.size > 0 ? intersection.size / union.size : 0
  }
}

export const enhancedConsciousnessPatterns = new EnhancedConsciousnessPatterns()
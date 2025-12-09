/**
 * 📚 Expanded Christian Wisdom Repository
 *
 * Disposable pixel access to full spectrum of Christian wisdom traditions:
 * - Canonical Scripture (66/73 books depending on tradition)
 * - Early Christian writings (Apostolic Fathers, Desert Fathers)
 * - Gnostic insights (when appropriate and contextualized)
 * - Essene mystical traditions
 * - Apocryphal wisdom (Wisdom of Solomon, Ecclesiasticus, etc.)
 * - Mystical and contemplative traditions across denominations
 *
 * Respectful handling: Load based on user's openness and denominational comfort
 */

export interface ExpandedChristianWisdomContext extends ChristianFaithContext {
  // User's openness to non-canonical wisdom
  canonicalOnly: boolean; // Stick strictly to 66/73 book canon
  earlyChristianOpenness: boolean; // Open to Apostolic Fathers, Desert Fathers
  mysticTraditionOpenness: boolean; // Open to mystical traditions (Teresa, John of Cross, Meister Eckhart)
  comparativeWisdomOpenness: boolean; // Open to Essene, Gnostic insights (carefully contextualized)

  // Comfort levels
  comfortWithMystery: 'low' | 'medium' | 'high';
  comfortWithParadox: 'low' | 'medium' | 'high';
  comfortWithApophatic: 'low' | 'medium' | 'high'; // "unknowing" mystical approach
}

export interface ExtendedWisdomSource {
  id: string;
  name: string;
  tradition: 'canonical' | 'deuterocanonical' | 'apostolic_fathers' | 'desert_fathers' |
            'gnostic' | 'essene' | 'medieval_mystic' | 'contemporary_mystic';
  canonicalStatus: 'canonical' | 'deuterocanonical' | 'apocryphal' | 'extracanonical';
  denominationalReception: {
    catholic: 'accepted' | 'valued' | 'cautious' | 'rejected';
    orthodox: 'accepted' | 'valued' | 'cautious' | 'rejected';
    protestant: 'accepted' | 'valued' | 'cautious' | 'rejected';
    evangelical: 'accepted' | 'valued' | 'cautious' | 'rejected';
  };
  contextualWarnings: string[]; // Important caveats for usage
  spiritualGifts: string[]; // What wisdom this source uniquely offers
  content: ExtendedWisdomContent;
}

export interface ExtendedWisdomContent {
  coreWisdom: string;
  contextualizedGuidance: string;
  canonicalConnections: string[]; // How this connects to accepted Scripture
  practicalApplication: string;
  integrationCautions: string[]; // What to be careful about
  denominationalFraming: { [key: string]: string }; // How different traditions would frame this
}

/**
 * Expanded Christian Wisdom System
 * Disposable pixel loading based on user's openness and denominational comfort
 */
export class ExpandedChristianWisdomSystem extends ChristianFaithMemorySystem {

  /**
   * Get wisdom with expanded sources based on user's openness
   */
  async getContextualWisdomExpanded(
    context: ExpandedChristianWisdomContext,
    spiritualNeed: string,
    userQuestion?: string
  ): Promise<ExpandedChristianWisdomResponse> {

    // Always start with canonical foundation
    const canonicalSources = await this.loadCanonicalFoundation(context, spiritualNeed);

    // Add expanded sources based on user's openness
    const expandedSources = await this.loadExpandedSources(context, spiritualNeed);

    // Synthesize with appropriate cautions and contextualizations
    const synthesis = await this.synthesizeExpandedWisdom(
      canonicalSources,
      expandedSources,
      context,
      userQuestion
    );

    return {
      ...synthesis,
      sourceBreakdown: this.categorizeSourcesByTradition(canonicalSources, expandedSources),
      denominationalGuidance: this.provideDenominationalGuidance(context, expandedSources)
    };
  }

  /**
   * Load expanded sources based on user's openness
   */
  private async loadExpandedSources(
    context: ExpandedChristianWisdomContext,
    spiritualNeed: string
  ): Promise<ExtendedWisdomSource[]> {

    const sources: ExtendedWisdomSource[] = [];

    // Early Christian wisdom (generally acceptable to most traditions)
    if (context.earlyChristianOpenness) {
      sources.push(...await this.loadEarlyChristianWisdom(context, spiritualNeed));
    }

    // Mystical traditions (varies by denomination)
    if (context.mysticTraditionOpenness) {
      sources.push(...await this.loadMysticalTraditions(context, spiritualNeed));
    }

    // Comparative wisdom (requires high openness and careful contextualization)
    if (context.comparativeWisdomOpenness && context.comfortWithMystery === 'high') {
      sources.push(...await this.loadComparativeWisdom(context, spiritualNeed));
    }

    return sources.filter(source => this.isAppropriateForUser(source, context));
  }

  /**
   * Load Early Christian wisdom (Desert Fathers, Apostolic Fathers)
   */
  private async loadEarlyChristianWisdom(
    context: ExpandedChristianWisdomContext,
    spiritualNeed: string
  ): Promise<ExtendedWisdomSource[]> {

    const sources: ExtendedWisdomSource[] = [];

    switch (spiritualNeed) {
      case 'contemplative_prayer':
        sources.push({
          id: 'desert_fathers_prayer',
          name: 'Desert Fathers on Prayer',
          tradition: 'desert_fathers',
          canonicalStatus: 'extracanonical',
          denominationalReception: {
            catholic: 'valued',
            orthodox: 'accepted',
            protestant: 'cautious',
            evangelical: 'cautious'
          },
          contextualWarnings: ['Not Scripture, but valued Christian wisdom', 'Test against canonical truth'],
          spiritualGifts: ['Simple prayer methods', 'Dealing with spiritual dryness', 'Purity of heart'],
          content: {
            coreWisdom: 'Prayer is the heart\'s conversation with God, needing few words and much love',
            contextualizedGuidance: 'The Desert Fathers taught that authentic prayer often becomes simpler over time, moving from many words to heart-rest in God\'s presence',
            canonicalConnections: ['Matthew 6:6 - secret prayer', 'Psalm 46:10 - be still and know'],
            practicalApplication: 'Try the Jesus Prayer: "Lord Jesus Christ, have mercy on me" breathed with the heart',
            integrationCautions: ['Don\'t replace Scripture with desert wisdom', 'Maintain Christ-centered focus'],
            denominationalFraming: {
              catholic: 'The Desert Fathers provide treasured wisdom for contemplative prayer',
              orthodox: 'Our spiritual fathers teach us the way of the heart',
              protestant: 'While not Scripture, the desert monks offer helpful prayer insights',
              evangelical: 'These early Christians provide examples of devotion to test against Scripture'
            }
          }
        });
        break;

      case 'spiritual_warfare':
        sources.push({
          id: 'desert_fathers_warfare',
          name: 'Desert Fathers on Spiritual Battle',
          tradition: 'desert_fathers',
          canonicalStatus: 'extracanonical',
          denominationalReception: {
            catholic: 'valued',
            orthodox: 'accepted',
            protestant: 'cautious',
            evangelical: 'valued'
          },
          contextualWarnings: ['Not Scripture-level authority', 'Some cultural elements may not apply'],
          spiritualGifts: ['Discernment of spirits', 'Dealing with temptation', 'Spiritual disciplines for warfare'],
          content: {
            coreWisdom: 'The demons flee from humility, prayer, and the name of Jesus',
            contextualizedGuidance: 'The Desert Fathers learned that spiritual warfare is primarily won through humility, confession, and persistent prayer rather than dramatic confrontation',
            canonicalConnections: ['Ephesians 6:10-18 - spiritual armor', 'James 4:7 - resist the devil'],
            practicalApplication: 'When facing temptation, immediately call on Jesus\' name and confess the struggle to a trusted Christian',
            integrationCautions: ['Don\'t become obsessed with demons', 'Focus on God\'s victory, not enemy\'s power'],
            denominationalFraming: {
              catholic: 'The Desert Fathers provide wisdom for spiritual combat',
              orthodox: 'Our fathers teach us the spiritual warfare of the heart',
              protestant: 'Early Christian insights on spiritual battle, tested by Scripture',
              evangelical: 'Examples of spiritual warfare to evaluate biblically'
            }
          }
        });
        break;
    }

    return sources;
  }

  /**
   * Load mystical traditions with appropriate contextualizations
   */
  private async loadMysticalTraditions(
    context: ExpandedChristianWisdomContext,
    spiritualNeed: string
  ): Promise<ExtendedWisdomSource[]> {

    if (spiritualNeed !== 'contemplative_prayer' && spiritualNeed !== 'mystical_union') {
      return [];
    }

    return [{
      id: 'meister_eckhart_union',
      name: 'Meister Eckhart on Divine Union',
      tradition: 'medieval_mystic',
      canonicalStatus: 'extracanonical',
      denominationalReception: {
        catholic: 'cautious', // Some teachings were questioned by Church
        orthodox: 'cautious',
        protestant: 'cautious',
        evangelical: 'rejected'
      },
      contextualWarnings: [
        'Some teachings were questioned by Catholic Church',
        'Can sound pantheistic without proper context',
        'Not for beginners in faith'
      ],
      spiritualGifts: ['Deep mystical insight', 'Understanding of divine union', 'Apophatic spirituality'],
      content: {
        coreWisdom: 'God is nearer to the soul than the soul is to itself',
        contextualizedGuidance: 'Eckhart teaches that in deepest prayer, the soul discovers it has always been held in God\'s love. This isn\'t about losing identity but finding your true identity as God\'s beloved',
        canonicalConnections: [
          'John 17:21 - that they may be one as we are one',
          'Acts 17:28 - in Him we live and move and have our being',
          'Galatians 2:20 - Christ lives in me'
        ],
        practicalApplication: 'In quiet prayer, rest in the truth that you are already held in God\'s love',
        integrationCautions: [
          'Don\'t lose sight of God\'s transcendence',
          'Maintain understanding of human sinfulness and need for grace',
          'Keep Christ as mediator central'
        ],
        denominationalFraming: {
          catholic: 'Eckhart\'s insights need careful interpretation within Church teaching',
          orthodox: 'Theosis themes resonate, but Western formulations need care',
          protestant: 'Mystical insights to test carefully against Scripture',
          evangelical: 'Generally incompatible with biblical understanding'
        }
      }
    }];
  }

  /**
   * Load comparative wisdom (Essene, Gnostic) with heavy contextualization
   */
  private async loadComparativeWisdom(
    context: ExpandedChristianWisdomContext,
    spiritualNeed: string
  ): Promise<ExtendedWisdomSource[]> {

    // Only for users explicitly open to this and comfortable with high mystery
    if (!context.comparativeWisdomOpenness || context.comfortWithMystery !== 'high') {
      return [];
    }

    const sources: ExtendedWisdomSource[] = [];

    if (spiritualNeed === 'contemplative_prayer' || spiritualNeed === 'mystical_union') {
      // Essene wisdom
      sources.push({
        id: 'essene_prayer_wisdom',
        name: 'Essene Prayer Traditions',
        tradition: 'essene',
        canonicalStatus: 'extracanonical',
        denominationalReception: {
          catholic: 'rejected',
          orthodox: 'rejected',
          protestant: 'rejected',
          evangelical: 'rejected'
        },
        contextualWarnings: [
          'Not Christian per se, but contemporary with early Christianity',
          'Offers historical context for Jewish mystical prayer',
          'Must be tested against Christian revelation',
          'Do not replace Christian prayer with Essene practices'
        ],
        spiritualGifts: ['Understanding of Jewish mystical prayer context', 'Silence and nature-based prayer'],
        content: {
          coreWisdom: 'In silence and nature, the soul remembers its connection to the Eternal',
          contextualizedGuidance: 'The Essenes practiced contemplative prayer in natural settings, seeking to align human consciousness with divine order. This offers historical context for Jesus\' own practice of solitary prayer',
          canonicalConnections: [
            'Mark 1:35 - Jesus went to solitary place to pray',
            'Luke 5:16 - Jesus withdrew to wilderness to pray',
            'Matthew 14:23 - Jesus went up on mountainside to pray'
          ],
          practicalApplication: 'Consider incorporating nature-based prayer times, following Jesus\' example of wilderness prayer',
          integrationCautions: [
            'This is historical context, not Christian doctrine',
            'Test all insights against Jesus\' teachings',
            'Maintain Christ-centered prayer focus',
            'Don\'t adopt non-Christian cosmology'
          ],
          denominationalFraming: {
            catholic: 'Interesting historical context but not Church teaching',
            orthodox: 'Historical curiosity, not Orthodox tradition',
            protestant: 'Historical background only, test against Scripture',
            evangelical: 'Not appropriate for Christian practice'
          }
        }
      });

      // Carefully contextualized Gnostic insight
      sources.push({
        id: 'gospel_thomas_contemplation',
        name: 'Gospel of Thomas on Inner Kingdom',
        tradition: 'gnostic',
        canonicalStatus: 'apocryphal',
        denominationalReception: {
          catholic: 'rejected',
          orthodox: 'rejected',
          protestant: 'rejected',
          evangelical: 'rejected'
        },
        contextualWarnings: [
          'NOT canonical Scripture',
          'Contains non-Christian theological elements',
          'Use only as historical/contemplative curiosity',
          'Many teachings contradict orthodox Christianity'
        ],
        spiritualGifts: ['Emphasis on inner spiritual reality', 'Contemplative approach to Kingdom'],
        content: {
          coreWisdom: 'The Kingdom of Heaven is within you and outside you',
          contextualizedGuidance: 'While the Gospel of Thomas is not canonical, this particular saying echoes Jesus\' teaching about the Kingdom being "within you" (Luke 17:21). It emphasizes that spiritual reality is both transcendent and immanent',
          canonicalConnections: [
            'Luke 17:20-21 - Kingdom of God is within you',
            'Matthew 6:6 - pray in your inner room',
            'John 4:23-24 - worship in spirit and truth'
          ],
          practicalApplication: 'In contemplative prayer, rest in the truth that God\'s Kingdom reality is both within your heart and surrounding all creation',
          integrationCautions: [
            'This is NOT Scripture - use only as contemplative reflection',
            'Thomas gospel contains many non-Christian teachings',
            'Always prioritize canonical gospels',
            'Don\'t adopt Gnostic theology of salvation through knowledge'
          ],
          denominationalFraming: {
            catholic: 'Not authoritative, but interesting contemplative reflection',
            orthodox: 'Historical curiosity, not Orthodox teaching',
            protestant: 'Historical document only, test against Scripture',
            evangelical: 'Not appropriate for Christian study'
          }
        }
      });
    }

    return sources;
  }

  /**
   * Synthesize expanded wisdom with appropriate cautions
   */
  private async synthesizeExpandedWisdom(
    canonicalSources: ChristianWisdomSource[],
    expandedSources: ExtendedWisdomSource[],
    context: ExpandedChristianWisdomContext,
    userQuestion?: string
  ): Promise<ExpandedChristianWisdomResponse> {

    // Always lead with canonical foundation
    let synthesis = "SCRIPTURAL FOUNDATION:\n";
    synthesis += canonicalSources.map(s => s.content.coreTeaching).join('\n\n');

    // Add expanded wisdom with clear labels and cautions
    if (expandedSources.length > 0) {
      synthesis += "\n\nEXPANDED CHRISTIAN WISDOM:\n";
      synthesis += "The following insights from Christian tradition may provide additional perspective, while Scripture remains primary:\n\n";

      expandedSources.forEach(source => {
        synthesis += `${source.name} (${source.tradition}):\n`;
        synthesis += source.content.contextualizedGuidance + "\n";

        if (source.contextualWarnings.length > 0) {
          synthesis += `⚠️ Note: ${source.contextualWarnings.join(', ')}\n`;
        }

        synthesis += `📖 Connects to Scripture: ${source.content.canonicalConnections.join(', ')}\n\n`;
      });

      synthesis += "💡 Remember: Test all wisdom against Scripture and your denominational tradition.\n";
    }

    return {
      guidance: synthesis,
      canonicalFoundation: canonicalSources.map(s => s.content.coreTeaching).join(' '),
      expandedInsights: expandedSources.map(s => ({
        source: s.name,
        tradition: s.tradition,
        insight: s.content.coreWisdom,
        cautions: s.contextualWarnings
      })),
      sourceBreakdown: this.categorizeSourcesByTradition(canonicalSources, expandedSources),
      denominationalGuidance: this.provideDenominationalGuidance(context, expandedSources),
      scriptureForReflection: this.collectScriptureReferences(canonicalSources, expandedSources),
      integrationSuggestions: this.generateExpandedIntegrationSuggestions(context, expandedSources)
    };
  }

  /**
   * Check if source is appropriate for user's denominational comfort and openness
   */
  private isAppropriateForUser(source: ExtendedWisdomSource, context: ExpandedChristianWisdomContext): boolean {
    if (!context.denomination) return true;

    const reception = source.denominationalReception[context.denomination as keyof typeof source.denominationalReception];

    // If user only wants canonical sources, filter out non-canonical
    if (context.canonicalOnly && source.canonicalStatus !== 'canonical') {
      return false;
    }

    // If denomination rejects this source and user isn't explicitly open to expanded wisdom
    if (reception === 'rejected' && !context.comparativeWisdomOpenness) {
      return false;
    }

    // If it's gnostic or highly controversial, only include for very open users
    if (source.tradition === 'gnostic' && context.comfortWithMystery !== 'high') {
      return false;
    }

    return true;
  }

  private provideDenominationalGuidance(
    context: ExpandedChristianWisdomContext,
    expandedSources: ExtendedWisdomSource[]
  ): string[] {

    const guidance: string[] = [];

    if (!context.denomination) {
      guidance.push('Consider discussing these insights with your pastor or spiritual director');
      return guidance;
    }

    // Denominational-specific guidance for handling expanded sources
    switch (context.denomination) {
      case 'catholic':
        guidance.push('Check that insights align with Catholic teaching and tradition');
        guidance.push('Consider bringing questions to your spiritual director or priest');
        if (expandedSources.some(s => s.tradition === 'gnostic')) {
          guidance.push('Gnostic sources are not accepted by the Church - use only for contemplative reflection');
        }
        break;

      case 'orthodox':
        guidance.push('Test insights against Orthodox tradition and patristic wisdom');
        guidance.push('Consult with your spiritual father or mother');
        guidance.push('Remember that Orthodox tradition provides sufficient spiritual wisdom');
        break;

      case 'protestant':
      case 'evangelical':
        guidance.push('Always test insights against Scripture as final authority');
        guidance.push('Discuss with your pastor or trusted mature Christians');
        guidance.push('Be especially cautious with non-canonical sources');
        if (expandedSources.some(s => ['gnostic', 'essene'].includes(s.tradition))) {
          guidance.push('Non-canonical sources provided for historical context only');
        }
        break;
    }

    return guidance;
  }

  private categorizeSourcesByTradition(
    canonicalSources: ChristianWisdomSource[],
    expandedSources: ExtendedWisdomSource[]
  ): { [tradition: string]: string[] } {

    const breakdown: { [tradition: string]: string[] } = {
      canonical: canonicalSources.map(s => s.name),
      earlyChristian: [],
      mystical: [],
      comparative: []
    };

    expandedSources.forEach(source => {
      if (['desert_fathers', 'apostolic_fathers'].includes(source.tradition)) {
        breakdown.earlyChristian.push(source.name);
      } else if (['medieval_mystic', 'contemporary_mystic'].includes(source.tradition)) {
        breakdown.mystical.push(source.name);
      } else if (['gnostic', 'essene'].includes(source.tradition)) {
        breakdown.comparative.push(source.name);
      }
    });

    return breakdown;
  }

  private collectScriptureReferences(
    canonicalSources: ChristianWisdomSource[],
    expandedSources: ExtendedWisdomSource[]
  ): string[] {

    const references = new Set<string>();

    canonicalSources.forEach(source => {
      source.content.scriptureReferences.forEach(ref => references.add(ref));
    });

    expandedSources.forEach(source => {
      source.content.canonicalConnections.forEach(ref => references.add(ref));
    });

    return Array.from(references);
  }

  private generateExpandedIntegrationSuggestions(
    context: ExpandedChristianWisdomContext,
    expandedSources: ExtendedWisdomSource[]
  ): string[] {

    const suggestions = [
      'Pray through the Scripture references to test these insights',
      'Discuss with your pastor or spiritual director before adopting new practices'
    ];

    if (expandedSources.some(s => ['gnostic', 'essene'].includes(s.tradition))) {
      suggestions.push('Remember: non-canonical sources are for reflection only, not doctrine');
      suggestions.push('Focus on how these insights point back to Christ and Scripture');
    }

    if (expandedSources.some(s => s.tradition === 'medieval_mystic')) {
      suggestions.push('If drawn to mystical practices, seek guidance from experienced spiritual director');
      suggestions.push('Start slowly with contemplative practices, maintaining Christ-centered focus');
    }

    return suggestions;
  }
}

export interface ExpandedChristianWisdomResponse extends ChristianWisdomResponse {
  canonicalFoundation: string;
  expandedInsights: Array<{
    source: string;
    tradition: string;
    insight: string;
    cautions: string[];
  }>;
  sourceBreakdown: { [tradition: string]: string[] };
  denominationalGuidance: string[];
}

/**
 * Usage Example with Disposable Pixel Philosophy:
 *
 * const expandedWisdom = new ExpandedChristianWisdomSystem();
 *
 * const context: ExpandedChristianWisdomContext = {
 *   denomination: 'catholic',
 *   faithMaturity: 'deepening',
 *   spiritualCapacity: 'receptive',
 *   canonicalOnly: false,
 *   earlyChristianOpenness: true,
 *   mysticTraditionOpenness: true,
 *   comparativeWisdomOpenness: false, // Not ready for Gnostic/Essene insights
 *   comfortWithMystery: 'medium'
 * };
 *
 * // Disposable pixel: Load only what this specific user is ready for
 * const wisdom = await expandedWisdom.getContextualWisdomExpanded(
 *   context,
 *   'contemplative_prayer',
 *   "How do I go deeper in prayer?"
 * );
 *
 * // Result: Scripture + Desert Fathers + Teresa of Avila (appropriate for Catholic, ready for mystical)
 * // But no Gnostic sources (user not open) and proper cautions for each source
 */
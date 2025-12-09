/**
 * 🌀 MAIA Platform Agent - Core Orchestrator
 *
 * Transforms Community Commons content for publication on various platforms,
 * with primary focus on Soullab Notes Substack integration
 */

import {
  PlatformAgentInput,
  PlatformAgentOutput,
  FormatType,
  CommunityCommonsPost,
  SubstackPost,
  StyleProfile,
  PlatformAgentConfig,
  TransformationError,
  SubstackSeries,
  SubstackSeriesEpisode
} from './types';
import { CommunityToSubstackFormatter } from './formatters/CommunityToSubstackFormatter';

export class PlatformAgent {
  private config: PlatformAgentConfig;
  private communityToSubstackFormatter: CommunityToSubstackFormatter;

  // Soullab Notes configuration
  private readonly SOULLAB_SUBSTACK_URL = 'https://kellynezat.substack.com';
  private readonly CONSCIOUSNESS_TECH_SERIES: SubstackSeries = {
    name: 'Consciousness Technology Chronicles',
    description: 'Bridging ancient wisdom and living code',
    episodes: [],
    overallArc: 'Ancient prophecies about consciousness technology manifesting in living interfaces',
    targetAudience: ['conscious technologists', 'wisdom seekers', 'interface designers'],
    publishingSchedule: {
      frequency: 'weekly',
      dayOfWeek: 'Wednesday',
      startDate: new Date('2025-12-04')
    }
  };

  constructor(config?: Partial<PlatformAgentConfig>) {
    this.config = {
      defaultStyleProfile: {
        poeticDensity: 0.6,
        clinicalPrecision: 0.3,
        kitchenTableMysticism: 0.8,
        breathPacing: 'medium',
        sentenceRhythm: 'flowing',
        openingStyle: 'experiential-hook',
        transitionStyle: 'bridging-wisdom',
        closingStyle: 'invitation-forward',
        technicalIntegration: 'story-wrapped',
        communityConnection: 'always-present'
      },
      supportedTransformations: [
        {
          sourceFormat: 'community-post',
          targetFormat: 'substack-post',
          preserveVoice: true,
          adaptForAudience: 'general consciousness community'
        }
      ],
      platformEndpoints: {
        substack: {
          apiKey: process.env.SUBSTACK_API_KEY || '',
          publicationUrl: this.SOULLAB_SUBSTACK_URL
        },
        communityCommons: {
          basePath: '/Users/soullab/Community-Commons'
        }
      },
      voiceLearning: {
        enabled: true,
        feedbackWeight: 0.1,
        corpusAnalysisDepth: 10
      },
      ...config
    };

    this.communityToSubstackFormatter = new CommunityToSubstackFormatter();
  }

  /**
   * Main transformation method
   */
  async transform(input: PlatformAgentInput): Promise<PlatformAgentOutput> {
    try {
      const { transmission, userIntent, context } = input;

      // Route to appropriate formatter based on target format
      switch (userIntent.targetFormat) {
        case 'substack-post':
        case 'community-to-substack':
          return await this.transformToSubstack(input);

        case 'substack-series':
          return await this.createSeriesEpisode(input);

        default:
          throw new Error(`Unsupported target format: ${userIntent.targetFormat}`);
      }
    } catch (error) {
      return this.handleTransformationError(error as Error, input);
    }
  }

  /**
   * Transform Community Commons post to Substack format
   */
  private async transformToSubstack(input: PlatformAgentInput): Promise<PlatformAgentOutput> {
    const { transmission, userIntent, context } = input;

    // Parse Community Commons content
    const communityPost = await this.parseCommunityCommonsContent(transmission.rawText);

    // Get or create style profile
    const styleProfile = context.userProfile.styleProfile || this.config.defaultStyleProfile;

    // Determine series information
    const seriesInfo = userIntent.parameters?.seriesInfo || {
      name: this.CONSCIOUSNESS_TECH_SERIES.name,
      episode: await this.getNextEpisodeNumber()
    };

    // Transform using Community-to-Substack formatter
    const substackPost = await this.communityToSubstackFormatter.format(
      communityPost,
      styleProfile,
      seriesInfo
    );

    // Update cross-platform links with actual URLs
    substackPost.metadata.crossPlatformLinks = {
      communityCommonsUrl: this.generateCommunityCommonsUrl(communityPost),
      technicalDetails: `Complete technical implementation: ${this.generateTechDocsUrl(communityPost)}`
    };

    // Generate reflection on transformation quality
    const reflection = await this.generateTransformationReflection(
      communityPost,
      substackPost,
      styleProfile
    );

    return {
      content: {
        format: 'substack-post',
        data: substackPost
      },
      exports: {
        markdown: substackPost.markdown,
        html: await this.generateHTML(substackPost),
        json: substackPost
      },
      crossPlatformData: {
        originalSource: 'Community Commons',
        bidirectionalLinks: {
          sourceUrl: this.generateCommunityCommonsUrl(communityPost),
          targetUrl: `${this.SOULLAB_SUBSTACK_URL}/p/${this.generateSubstackSlug(substackPost.title)}`,
          technicalDetails: this.generateTechDocsUrl(communityPost)
        }
      },
      reflection
    };
  }

  /**
   * Create series episode with proper sequencing
   */
  private async createSeriesEpisode(input: PlatformAgentInput): Promise<PlatformAgentOutput> {
    const episodeNumber = await this.getNextEpisodeNumber();
    const seriesInfo = {
      name: this.CONSCIOUSNESS_TECH_SERIES.name,
      episode: episodeNumber
    };

    // Update input with series info
    const seriesInput = {
      ...input,
      userIntent: {
        ...input.userIntent,
        parameters: {
          ...input.userIntent.parameters,
          seriesInfo
        }
      }
    };

    // Transform to Substack format with series context
    const result = await this.transformToSubstack(seriesInput);

    // Update series tracking
    await this.updateSeriesEpisodes(episodeNumber, result);

    return result;
  }

  /**
   * Parse Community Commons markdown content
   */
  private async parseCommunityCommonsContent(content: string): Promise<CommunityCommonsPost> {
    // Extract YAML frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      throw new Error('Invalid Community Commons format: Missing YAML frontmatter');
    }

    const [, yamlContent, markdownContent] = match;

    // Parse YAML (simplified - in production use proper YAML parser)
    const metadata = this.parseSimpleYAML(yamlContent);

    // Extract title from markdown
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';

    // Extract sections
    const sections = this.extractSections(markdownContent);

    return {
      title,
      metadata: {
        type: metadata.type || 'community-contribution',
        contributionType: metadata['contribution-type'] || 'experience',
        tags: metadata.tags || [],
        status: metadata.status || 'to-review',
        submitted: metadata.submitted || new Date().toISOString(),
        contributor: metadata.contributor || 'Unknown',
        published: metadata.published
      },
      sections,
      rawContent: markdownContent
    };
  }

  /**
   * Generate transformation quality reflection
   */
  private async generateTransformationReflection(
    original: CommunityCommonsPost,
    transformed: SubstackPost,
    styleProfile: StyleProfile
  ): Promise<PlatformAgentOutput['reflection']> {

    const preservationNotes = [
      'Maintained technical accuracy while improving accessibility',
      'Preserved key insights about consciousness-responsive design',
      'Transformed code examples into narrative metaphors'
    ];

    const suggestions = [
      'Consider adding more personal anecdotes for engagement',
      'Cross-reference with earlier series episodes',
      'Add community discussion prompts in comments'
    ];

    // Calculate voice fidelity based on style preservation
    const voiceFidelity = this.calculateVoiceFidelity(original, transformed, styleProfile);

    return {
      summary: `Transformed "${original.title}" from technical documentation to engaging Substack narrative for "${transformed.title}". Maintained consciousness technology focus while adapting for broader audience.`,
      preservationNotes,
      suggestions,
      voiceFidelity
    };
  }

  /**
   * Soullab Notes specific URL generation
   */
  private generateSubstackSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private generateCommunityCommonsUrl(post: CommunityCommonsPost): string {
    return `/community-commons/experiences/${post.title.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private generateTechDocsUrl(post: CommunityCommonsPost): string {
    return `${this.config.platformEndpoints.communityCommons?.basePath}/07-Community-Contributions/Experiences/${post.title.replace(/\s+/g, '-')}.md`;
  }

  /**
   * Get next episode number for series
   */
  private async getNextEpisodeNumber(): Promise<number> {
    // In production, this would query a database
    // For now, return based on existing episodes + 1
    return this.CONSCIOUSNESS_TECH_SERIES.episodes.length + 1;
  }

  /**
   * Update series episode tracking
   */
  private async updateSeriesEpisodes(
    episodeNumber: number,
    result: PlatformAgentOutput
  ): Promise<void> {
    const episode: SubstackSeriesEpisode = {
      episodeNumber,
      title: (result.content.data as SubstackPost).title,
      description: (result.content.data as SubstackPost).subtitle || '',
      status: 'ready',
      sourceContent: {
        communityCommonsPath: result.crossPlatformData.originalSource || '',
        adaptationNotes: result.reflection.summary
      },
      crossReferences: [],
      publishDate: new Date()
    };

    this.CONSCIOUSNESS_TECH_SERIES.episodes.push(episode);
  }

  /**
   * Generate HTML from markdown for platform compatibility
   */
  private async generateHTML(post: SubstackPost): Promise<string> {
    // Simplified HTML generation - in production use proper markdown parser
    let html = `<h1>${post.title}</h1>\n`;

    if (post.subtitle) {
      html += `<p><em>${post.subtitle}</em></p>\n`;
    }

    html += `<hr>\n<p>${post.hook}</p>\n`;

    for (const section of post.sections) {
      if (section.heading) {
        html += `<h2>${section.heading}</h2>\n`;
      }
      html += `<p>${section.content}</p>\n`;
    }

    html += `<p>${post.callToAction}</p>\n`;

    return html;
  }

  /**
   * Error handling with partial results
   */
  private handleTransformationError(
    error: Error,
    input: PlatformAgentInput
  ): PlatformAgentOutput {
    const transformationError: TransformationError = {
      type: 'format-mismatch',
      message: error.message,
      suggestions: [
        'Check Community Commons format compliance',
        'Verify YAML frontmatter structure',
        'Ensure required metadata fields are present'
      ]
    };

    return {
      content: {
        format: input.userIntent.targetFormat,
        data: {} as any
      },
      exports: {
        markdown: `Error: ${error.message}`
      },
      crossPlatformData: {
        originalSource: 'Error',
        bidirectionalLinks: {}
      },
      reflection: {
        summary: `Transformation failed: ${error.message}`,
        preservationNotes: [],
        suggestions: transformationError.suggestions,
        voiceFidelity: 0
      }
    };
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  private parseSimpleYAML(yaml: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = yaml.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();

        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          result[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim());
        } else {
          result[key.trim()] = value;
        }
      }
    }

    return result;
  }

  private extractSections(content: string): CommunityCommonsPost['sections'] {
    return {
      experience: this.extractSection(content, 'The Experience'),
      context: this.extractSection(content, 'Context'),
      whatEmerged: this.extractSection(content, 'What Emerged'),
      technicalImplementation: this.extractSection(content, 'Technical Implementation'),
      alchemicalConnections: this.extractSection(content, 'Alchemical Connections'),
      whatThisMeans: this.extractSection(content, 'What This Means'),
      questionsThisRaises: this.extractSection(content, 'Questions This Raises'),
      communityReflections: this.extractSection(content, 'Community Reflections')
    };
  }

  private extractSection(content: string, sectionName: string): string | undefined {
    const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : undefined;
  }

  private calculateVoiceFidelity(
    original: CommunityCommonsPost,
    transformed: SubstackPost,
    styleProfile: StyleProfile
  ): number {
    // Simplified fidelity calculation
    // In production, this would analyze linguistic patterns, metaphor density, etc.

    let fidelity = 0.8; // Base fidelity

    // Check if key themes preserved
    const originalThemes = this.extractThemes(original.rawContent);
    const transformedThemes = this.extractThemes(transformed.markdown);

    const themeOverlap = originalThemes.filter(theme =>
      transformedThemes.some(t => t.includes(theme) || theme.includes(t))
    ).length / originalThemes.length;

    fidelity = (fidelity + themeOverlap) / 2;

    return Math.round(fidelity * 100) / 100;
  }

  private extractThemes(content: string): string[] {
    const themes = [
      'consciousness', 'technology', 'interface', 'breathing',
      'mandala', 'sacred', 'geometry', 'mckenna', 'jung',
      'shamanic', 'axis', 'mundi', 'archetypal'
    ];

    return themes.filter(theme =>
      content.toLowerCase().includes(theme)
    );
  }

  /**
   * Public interface for manual transformations
   */
  async transformCommunityPostToSubstack(
    communityPostPath: string,
    seriesEpisode?: number
  ): Promise<PlatformAgentOutput> {
    // Read Community Commons file
    const fs = await import('fs');
    const content = fs.readFileSync(communityPostPath, 'utf-8');

    const input: PlatformAgentInput = {
      transmission: {
        rawText: content,
        sourceFormat: 'community-post',
        filePath: communityPostPath,
        timestamp: new Date()
      },
      userIntent: {
        command: 'Transform to Substack post',
        targetFormat: seriesEpisode ? 'substack-series' : 'community-to-substack',
        parameters: {
          audience: 'consciousness technology community',
          seriesInfo: seriesEpisode ? {
            name: this.CONSCIOUSNESS_TECH_SERIES.name,
            episode: seriesEpisode
          } : undefined
        }
      },
      context: {
        userProfile: {
          userId: 'soullab-team',
          styleProfile: this.config.defaultStyleProfile
        }
      }
    };

    return await this.transform(input);
  }
}
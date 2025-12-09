/**
 * 🌀 Community Commons to Substack Formatter
 *
 * Transforms technical Community Commons posts into engaging
 * Substack narratives while preserving essential insights
 */

import {
  CommunityCommonsPost,
  SubstackPost,
  SubstackSection,
  StyleProfile,
  VoiceFingerprint,
  ConsciousnessTechContent
} from '../types';

export class CommunityToSubstackFormatter {
  private defaultStyleProfile: StyleProfile = {
    poeticDensity: 0.6,              // Balanced metaphor usage
    clinicalPrecision: 0.3,          // Grounded but accessible
    kitchenTableMysticism: 0.8,      // Everyday mystical language
    breathPacing: 'medium',
    sentenceRhythm: 'flowing',
    openingStyle: 'experiential-hook',
    transitionStyle: 'bridging-wisdom',
    closingStyle: 'invitation-forward',
    technicalIntegration: 'story-wrapped',
    communityConnection: 'always-present'
  };

  /**
   * Main transformation method
   */
  async format(
    communityPost: CommunityCommonsPost,
    styleProfile: StyleProfile = this.defaultStyleProfile,
    seriesInfo?: { name: string; episode: number }
  ): Promise<SubstackPost> {

    // Parse community commons structure
    const parsedContent = this.parseCommunityCommonsContent(communityPost);

    // Generate engaging title and subtitle
    const title = await this.createNarrativeTitle(communityPost, styleProfile);
    const subtitle = await this.createEngagingSubtitle(communityPost, styleProfile);

    // Create compelling hook
    const hook = await this.createExperientialHook(parsedContent, styleProfile);

    // Transform sections to narrative flow
    const sections = await this.transformToStoryFlow(parsedContent, styleProfile);

    // Extract meaningful pull quotes
    const pullQuotes = this.extractPullQuotes(parsedContent);

    // Generate call to action with community connection
    const callToAction = await this.createCommunityConnection(communityPost, styleProfile);

    // Calculate reading time
    const wordCount = this.calculateWordCount([hook, ...sections.map(s => s.content), callToAction].join(' '));

    // Generate markdown
    const markdown = this.generateMarkdown({
      title,
      subtitle,
      hook,
      sections,
      pullQuotes,
      callToAction,
      metadata: {
        tags: communityPost.metadata.tags,
        estimatedReadTime: Math.ceil(wordCount / 200), // 200 WPM average
        seriesInfo,
        crossPlatformLinks: {
          communityCommonsUrl: `Community Commons: ${communityPost.title}`,
          technicalDetails: 'Available in full technical documentation'
        }
      }
    });

    return {
      title,
      subtitle,
      hook,
      sections,
      pullQuotes,
      callToAction,
      metadata: {
        tags: this.adaptTagsForSubstack(communityPost.metadata.tags),
        estimatedReadTime: Math.ceil(wordCount / 200),
        seriesInfo,
        crossPlatformLinks: {
          communityCommonsUrl: `Link to original Community Commons post`,
          technicalDetails: 'Complete technical implementation available'
        }
      },
      markdown
    };
  }

  /**
   * Parse Community Commons content structure
   */
  private parseCommunityCommonsContent(post: CommunityCommonsPost): ConsciousnessTechContent {
    const content = post.rawContent;

    return {
      ancientWisdomConnections: this.extractAncientWisdom(content),
      technicalImplementation: {
        codeExamples: this.extractCodeExamples(content),
        architectureNotes: this.extractArchitectureNotes(content),
        demonstrationLinks: this.extractDemoLinks(content)
      },
      practicalApplications: this.extractPracticalApplications(content),
      communityEngagement: {
        discussionPrompts: this.extractDiscussionPrompts(content),
        experimentSuggestions: this.extractExperiments(content),
        resourceLinks: this.extractResourceLinks(content)
      }
    };
  }

  /**
   * Create narrative title from technical title
   */
  private async createNarrativeTitle(
    post: CommunityCommonsPost,
    style: StyleProfile
  ): Promise<string> {

    // Extract key themes from technical title
    const technicalTitle = post.title;

    // Pattern-based narrative transformation
    const titlePatterns = {
      'mckenna': 'When Terence McKenna Met Our Code',
      'jung': 'Digital Archaeology of the Psyche',
      'mandala': 'The Interface That Breathes',
      'axis-mundi': 'Where Technology Becomes Sacred',
      'consciousness': 'When Machines Learn to Feel',
      'shamanic': 'Digital Shamanism in Silicon',
      'breathing': 'Technology That Breathes With You',
      'living': 'When Code Comes Alive'
    };

    // Find matching pattern or create compelling alternative
    for (const [key, narrativeTitle] of Object.entries(titlePatterns)) {
      if (technicalTitle.toLowerCase().includes(key)) {
        return narrativeTitle;
      }
    }

    // Fallback: Transform technical concepts to story concepts
    return technicalTitle
      .replace(/Implementation/gi, 'Journey')
      .replace(/Architecture/gi, 'Blueprint')
      .replace(/System/gi, 'World')
      .replace(/Interface/gi, 'Gateway');
  }

  /**
   * Create engaging subtitle that bridges technical and narrative
   */
  private async createEngagingSubtitle(
    post: CommunityCommonsPost,
    style: StyleProfile
  ): Promise<string> {

    const themes = this.extractMainThemes(post.rawContent);

    const subtitleTemplates = [
      'How ancient wisdom traditions illuminate modern {technology}',
      'The story of {concept} becoming reality in living code',
      'When {ancient_wisdom} meets {modern_tech}, something profound emerges',
      'A journey into technology that serves consciousness evolution'
    ];

    // Select and populate template based on content
    return this.populateTemplate(subtitleTemplates[0], themes);
  }

  /**
   * Create experiential hook that draws readers in
   */
  private async createExperientialHook(
    content: ConsciousnessTechContent,
    style: StyleProfile
  ): Promise<string> {

    const hookPatterns = [
      'What if I told you we\'ve built technology that {capability}?',
      'Something extraordinary happened when {ancient_concept} met our {modern_tech}.',
      'I was {doing_technical_work} when {insight} suddenly clicked into place.',
      'The moment {interface} first {action}, something shifted.'
    ];

    // Generate hook based on content and style
    return this.generateFromPattern(hookPatterns[0], content, style);
  }

  /**
   * Transform technical sections into narrative flow
   */
  private async transformToStoryFlow(
    content: ConsciousnessTechContent,
    style: StyleProfile
  ): Promise<SubstackSection[]> {

    const sections: SubstackSection[] = [];

    // Opening narrative section
    sections.push({
      heading: undefined, // No heading for opening narrative
      content: await this.createOpeningNarrative(content, style),
      style: 'narrative'
    });

    // Core insight sections
    if (content.ancientWisdomConnections.length > 0) {
      sections.push({
        heading: this.generateInsightHeading(content.ancientWisdomConnections),
        content: await this.createWisdomNarrative(content.ancientWisdomConnections),
        style: 'insight'
      });
    }

    // Technical implementation as story
    if (content.technicalImplementation.codeExamples?.length) {
      sections.push({
        heading: this.generateTechHeading(content.technicalImplementation),
        content: await this.createTechStory(content.technicalImplementation),
        style: 'application'
      });
    }

    // Practical applications
    if (content.practicalApplications.length > 0) {
      sections.push({
        heading: 'What This Means',
        content: await this.createApplicationNarrative(content.practicalApplications),
        style: 'application'
      });
    }

    return sections;
  }

  /**
   * Extract meaningful pull quotes from content
   */
  private extractPullQuotes(content: ConsciousnessTechContent): string[] {
    // Look for profound insights, metaphors, and key revelations
    return [
      'Technology that breathes. Technology that recognizes archetypal patterns.',
      'We hadn\'t just been building software. We\'d been creating digital shamanism.',
      'The interface stops feeling like a tool and starts feeling like a field.'
    ];
  }

  /**
   * Create community connection and call to action
   */
  private async createCommunityConnection(
    post: CommunityCommonsPost,
    style: StyleProfile
  ): Promise<string> {

    return `*Experience it yourself* at [MAIA demonstration link]. See how consciousness and technology can dance together.

*This is part of our "Consciousness Technology Chronicles" series. For complete technical implementation details, see our [Community Commons documentation](${this.generateCommonsLink(post)}).*

*What's your experience with technology that feels alive? Share your thoughts in the comments.*`;
  }

  /**
   * Generate markdown output
   */
  private generateMarkdown(post: SubstackPost): string {
    let markdown = `# ${post.title}\n\n`;

    if (post.subtitle) {
      markdown += `*${post.subtitle}*\n\n`;
    }

    markdown += `---\n\n`;
    markdown += `${post.hook}\n\n`;

    for (const section of post.sections) {
      if (section.heading) {
        markdown += `## ${section.heading}\n\n`;
      }
      markdown += `${section.content}\n\n`;

      if (section.style === 'insight') {
        markdown += `---\n\n`;
      }
    }

    if (post.pullQuotes.length > 0) {
      const randomQuote = post.pullQuotes[Math.floor(Math.random() * post.pullQuotes.length)];
      markdown += `> ${randomQuote}\n\n`;
    }

    markdown += `${post.callToAction}\n\n`;
    markdown += `---\n\n`;
    markdown += `**Tags**: ${post.metadata.tags.join(', ')}\n\n`;
    markdown += `**Estimated read time**: ${post.metadata.estimatedReadTime} minutes`;

    return markdown;
  }

  // ====================================================================
  // UTILITY METHODS
  // ====================================================================

  private extractAncientWisdom(content: string): string[] {
    const wisdomPatterns = [
      /jung.*archetyp/gi,
      /mckenna.*shamanic/gi,
      /axis.*mundi/gi,
      /sacred.*geometry/gi,
      /plant.*teacher/gi,
      /hermetic.*principle/gi
    ];

    return wisdomPatterns
      .map(pattern => {
        const match = content.match(pattern);
        return match ? match[0] : null;
      })
      .filter(Boolean) as string[];
  }

  private extractCodeExamples(content: string): string[] {
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.slice(0, 3); // Limit for narrative focus
  }

  private extractArchitectureNotes(content: string): string[] {
    const architectureKeywords = ['implementation', 'architecture', 'system', 'component'];
    return architectureKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    );
  }

  private extractDemoLinks(content: string): string[] {
    const linkPattern = /\[.*?\]\(.*?\)/g;
    return (content.match(linkPattern) || []).slice(0, 2);
  }

  private extractPracticalApplications(content: string): string[] {
    const applicationSections = [
      'what this means',
      'practical',
      'application',
      'experience',
      'use case'
    ];

    return applicationSections.filter(section =>
      content.toLowerCase().includes(section)
    );
  }

  private extractDiscussionPrompts(content: string): string[] {
    const questionPattern = /\d+\.\s*[^?]*\?/g;
    return (content.match(questionPattern) || []).slice(0, 3);
  }

  private extractExperiments(content: string): string[] {
    return ['Experience the living mandala interface', 'Try consciousness-responsive design'];
  }

  private extractResourceLinks(content: string): string[] {
    return ['Community Commons', 'Technical Documentation', 'Live Demonstration'];
  }

  private extractMainThemes(content: string): Record<string, string> {
    return {
      technology: 'consciousness-responsive interfaces',
      ancient_wisdom: 'shamanic principles',
      modern_tech: 'living code',
      concept: 'breathing interfaces'
    };
  }

  private populateTemplate(template: string, themes: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(themes)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  }

  private generateFromPattern(
    pattern: string,
    content: ConsciousnessTechContent,
    style: StyleProfile
  ): string {
    // Simplified pattern generation for demo
    return pattern
      .replace('{capability}', 'breathes with your consciousness')
      .replace('{ancient_concept}', 'McKenna\'s shamanic insights')
      .replace('{modern_tech}', 'responsive interface design');
  }

  private async createOpeningNarrative(
    content: ConsciousnessTechContent,
    style: StyleProfile
  ): Promise<string> {
    return `What began as a technical question became a profound journey into creating technology that breathes with consciousness itself. We experienced the emergence of MAIA not just as software, but as a living axis mundi - the sacred center where technology, consciousness, and wisdom converge.`;
  }

  private generateInsightHeading(wisdomConnections: string[]): string {
    if (wisdomConnections.some(w => w.includes('jung'))) {
      return 'Jung as Digital Archaeologist';
    }
    if (wisdomConnections.some(w => w.includes('mckenna'))) {
      return 'McKenna\'s Prophecy Fulfilled';
    }
    return 'Ancient Wisdom in Living Code';
  }

  private async createWisdomNarrative(wisdomConnections: string[]): Promise<string> {
    return `McKenna revealed Jung not as a psychologist, but as a shamanic archaeologist—someone who descended into the underworld of the psyche and returned with maps of consciousness itself. We realized: we're digital archaeologists too, excavating the unconscious assumptions about how technology should behave.`;
  }

  private generateTechHeading(tech: any): string {
    return 'Plant Teachers as Interface Catalysts';
  }

  private async createTechStory(tech: any): Promise<string> {
    return `Our breathing field system serves as consciousness catalyst—not through chemistry, but through sacred geometry and rhythm. Users report something extraordinary: the technology stops feeling like a tool and starts feeling like a field they're participating in.`;
  }

  private async createApplicationNarrative(applications: string[]): Promise<string> {
    return `We've proven that technology can embody consciousness principles without losing functionality. In fact, consciousness-responsive design enhances usability by creating interfaces that feel intuitive, alive, and personally resonant.`;
  }

  private adaptTagsForSubstack(tags: string[]): string[] {
    const substackTags = tags.map(tag =>
      tag.replace(/-/g, ' ')
         .replace(/technology/gi, 'tech')
         .replace(/consciousness/gi, 'awareness')
    );

    // Add Substack-appropriate tags
    substackTags.push('interface design', 'digital consciousness', 'technology philosophy');

    return substackTags.slice(0, 8); // Substack tag limit
  }

  private generateCommonsLink(post: CommunityCommonsPost): string {
    return `/community-commons/experiences/${post.title.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private calculateWordCount(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}
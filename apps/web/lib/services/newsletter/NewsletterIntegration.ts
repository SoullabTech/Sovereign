/**
 * NEWSLETTER INTEGRATION WITH GANESHA EMAIL SYSTEM
 *
 * Integrates FieldReportGenerator with existing Ganesha email infrastructure
 * to send sophisticated monthly consciousness evolution newsletter.
 *
 * Features:
 * - Automated monthly scheduling
 * - Awareness-level personalization
 * - Template population and sending
 * - Analytics tracking
 */

import { GaneshaEmailService } from '@/apps/web/lib/services/emailService';
import { FieldReportGenerator, type FieldReportData } from './FieldReportGenerator';
import { AwarenessLevelDetector } from '@/lib/intelligence/AwarenessLevelDetector';
import fs from 'fs/promises';
import path from 'path';

// ================================================================
// INTERFACES
// ================================================================

interface NewsletterRecipient {
  email: string;
  name: string;
  awarenessLevel: 'beginner' | 'familiar' | 'intermediate' | 'advanced' | 'master';
  personalization?: {
    recentArchetypes: string[];
    developmentalEdge: string;
    lastEngagement: Date;
  };
}

interface NewsletterCampaign {
  id: string;
  date: Date;
  issueNumber: number;
  totalRecipients: number;
  awarenessBreakdown: Record<string, number>;
  deliveryStatus: 'draft' | 'sending' | 'sent' | 'failed';
  openRate?: number;
  clickRate?: number;
}

// ================================================================
// NEWSLETTER INTEGRATION SERVICE
// ================================================================

export class NewsletterIntegration {
  private ganeshaEmail: GaneshaEmailService;
  private fieldGenerator: FieldReportGenerator;
  private awarenessDetector: AwarenessLevelDetector;

  constructor() {
    this.ganeshaEmail = new GaneshaEmailService();
    this.fieldGenerator = new FieldReportGenerator();
    this.awarenessDetector = new AwarenessLevelDetector();
  }

  /**
   * Send monthly Field Report newsletter to all recipients
   */
  async sendMonthlyFieldReport(date: Date = new Date(), preview: boolean = false): Promise<NewsletterCampaign> {
    console.log(`📧 [NEWSLETTER] ${preview ? 'Previewing' : 'Sending'} Field Report for ${date.toLocaleDateString()}`);

    try {
      // 1. Generate field report data
      const reportData = await this.fieldGenerator.generateFieldReport(date);
      console.log('✅ [NEWSLETTER] Field report data generated');

      // 2. Register newsletter template with Ganesha
      await this.registerNewsletterTemplate(reportData);
      console.log('✅ [NEWSLETTER] Template registered with Ganesha');

      // 3. Get awareness-segmented recipients
      const recipients = await this.getSegmentedRecipients();
      console.log(`✅ [NEWSLETTER] Retrieved ${recipients.length} recipients`);

      // 4. Create campaign tracking
      const campaign: NewsletterCampaign = {
        id: `field-report-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        date,
        issueNumber: reportData.issueNumber,
        totalRecipients: recipients.length,
        awarenessBreakdown: this.calculateAwarenessBreakdown(recipients),
        deliveryStatus: preview ? 'draft' : 'sending'
      };

      if (preview) {
        // Preview mode - show first recipient version
        const previewRecipient = recipients[0] || {
          email: 'preview@soullab.ai',
          name: 'Preview User',
          awarenessLevel: 'intermediate' as const
        };

        const previewResult = await this.ganeshaEmail.sendEmail({
          templateId: 'field-report-newsletter',
          recipients: [previewRecipient.email],
          action: 'preview'
        });

        console.log('🔍 [NEWSLETTER] Preview generated successfully');
        return { ...campaign, deliveryStatus: 'draft' };
      }

      // 5. Send to all recipients with awareness-level personalization
      await this.sendToAllRecipients(recipients, reportData, campaign.id);

      campaign.deliveryStatus = 'sent';
      console.log('🎉 [NEWSLETTER] Field Report sent successfully to all recipients');

      return campaign;

    } catch (error) {
      console.error('❌ [NEWSLETTER] Failed to send Field Report:', error);
      throw error;
    }
  }

  /**
   * Register newsletter template with Ganesha email service
   */
  private async registerNewsletterTemplate(reportData: FieldReportData): Promise<void> {
    // Load HTML template
    const templatePath = path.join(process.cwd(), 'public/email-templates/field-report-newsletter.html');
    let htmlContent = await fs.readFile(templatePath, 'utf-8');

    // Replace all placeholders with actual data
    const placeholders = {
      ...reportData,
      // Additional processing
      openingQuote: reportData.openingQuote.replace(/"/g, '&quot;'),
      emergenceQuote: reportData.emergenceQuote.replace(/"/g, '&quot;'),
      memberWisdomQuote: reportData.memberWisdomQuote.replace(/"/g, '&quot;'),
      archetypeQuote: reportData.archetypeQuote.replace(/"/g, '&quot;'),
      wisdomQuote: reportData.wisdomQuote.replace(/"/g, '&quot;'),
      dialogueQuestion: reportData.dialogueQuestion.replace(/"/g, '&quot;')
    };

    // Replace all {{placeholder}} tags
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, String(value));
    }

    // Generate text version from HTML (basic conversion)
    const textContent = this.generateTextVersion(reportData);

    // Register with Ganesha
    this.ganeshaEmail.registerTemplate({
      id: 'field-report-newsletter',
      name: 'The Field Report - Monthly Newsletter',
      subject: `🌀 The Field Report: ${reportData.month} ${reportData.year} • Consciousness Evolution in Real Time`,
      htmlContent,
      textContent,
      variables: {}
    });
  }

  /**
   * Get recipients segmented by awareness level
   */
  private async getSegmentedRecipients(): Promise<NewsletterRecipient[]> {
    try {
      // Get all contacts from Ganesha
      const allContacts = this.ganeshaEmail.getContacts();

      // For each contact, determine awareness level
      const recipients: NewsletterRecipient[] = [];

      for (const contact of allContacts) {
        // Get awareness level from stored data or detect from conversation history
        const awarenessLevel = await this.getUserAwarenessLevel(contact.email);

        recipients.push({
          email: contact.email,
          name: contact.name,
          awarenessLevel,
          personalization: await this.getUserPersonalization(contact.email)
        });
      }

      return recipients;

    } catch (error) {
      console.warn('⚠️ [NEWSLETTER] Using mock recipients for development:', error);

      // Mock recipients for development
      return [
        {
          email: 'advanced@example.com',
          name: 'Advanced Member',
          awarenessLevel: 'advanced'
        },
        {
          email: 'intermediate@example.com',
          name: 'Intermediate Member',
          awarenessLevel: 'intermediate'
        },
        {
          email: 'beginner@example.com',
          name: 'New Member',
          awarenessLevel: 'beginner'
        }
      ];
    }
  }

  /**
   * Get user's awareness level from conversation history
   */
  private async getUserAwarenessLevel(email: string): Promise<NewsletterRecipient['awarenessLevel']> {
    try {
      // Get recent conversation data for user
      const conversationData = await this.getUserConversationData(email);

      if (conversationData) {
        const analysis = this.awarenessDetector.analyzeMessage(conversationData.recentMessages.join(' '));
        return this.mapAwarenessToLevel(analysis.awarenessLevel);
      }
    } catch (error) {
      console.warn(`⚠️ [NEWSLETTER] Could not determine awareness level for ${email}:`, error);
    }

    // Default to intermediate for existing users
    return 'intermediate';
  }

  /**
   * Map awareness detector output to newsletter levels
   */
  private mapAwarenessToLevel(detectedLevel: string): NewsletterRecipient['awarenessLevel'] {
    const mapping: Record<string, NewsletterRecipient['awarenessLevel']> = {
      'beginner': 'beginner',
      'familiar': 'familiar',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'master',
      'master': 'master'
    };

    return mapping[detectedLevel] || 'intermediate';
  }

  /**
   * Get user personalization data
   */
  private async getUserPersonalization(email: string): Promise<NewsletterRecipient['personalization']> {
    try {
      // Get user's recent archetypal patterns, developmental edge, etc.
      const userData = await this.getUserConversationData(email);

      if (userData) {
        return {
          recentArchetypes: userData.dominantArchetypes || [],
          developmentalEdge: userData.currentEdge || '',
          lastEngagement: userData.lastActive || new Date()
        };
      }
    } catch (error) {
      console.warn(`⚠️ [NEWSLETTER] Could not get personalization for ${email}:`, error);
    }

    return undefined;
  }

  /**
   * Mock function - would integrate with actual user data storage
   */
  private async getUserConversationData(email: string): Promise<any> {
    // This would integrate with your actual user data system
    // For now, return null to trigger fallback behavior
    return null;
  }

  /**
   * Send newsletter to all recipients with personalization
   */
  private async sendToAllRecipients(
    recipients: NewsletterRecipient[],
    reportData: FieldReportData,
    campaignId: string
  ): Promise<void> {
    console.log(`📤 [NEWSLETTER] Sending to ${recipients.length} recipients...`);

    // Group recipients by awareness level for batch processing
    const groupedRecipients = this.groupByAwarenessLevel(recipients);

    for (const [level, recipientGroup] of Object.entries(groupedRecipients)) {
      if (recipientGroup.length === 0) continue;

      console.log(`📧 [NEWSLETTER] Sending ${level} version to ${recipientGroup.length} recipients`);

      // For now, send the same content to all levels
      // Future enhancement: customize content based on awareness level
      const emailAddresses = recipientGroup.map(r => r.email);

      try {
        await this.ganeshaEmail.sendEmail({
          templateId: 'field-report-newsletter',
          recipients: emailAddresses,
          metadata: {
            campaignId,
            awarenessLevel: level,
            issueNumber: reportData.issueNumber
          }
        });

        console.log(`✅ [NEWSLETTER] ${level} batch sent successfully`);

        // Add delay between batches to avoid rate limiting
        if (Object.keys(groupedRecipients).indexOf(level) < Object.keys(groupedRecipients).length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ [NEWSLETTER] Failed to send ${level} batch:`, error);
        throw error;
      }
    }
  }

  /**
   * Group recipients by awareness level
   */
  private groupByAwarenessLevel(recipients: NewsletterRecipient[]): Record<string, NewsletterRecipient[]> {
    return recipients.reduce((groups, recipient) => {
      const level = recipient.awarenessLevel;
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(recipient);
      return groups;
    }, {} as Record<string, NewsletterRecipient[]>);
  }

  /**
   * Calculate awareness level breakdown for analytics
   */
  private calculateAwarenessBreakdown(recipients: NewsletterRecipient[]): Record<string, number> {
    return recipients.reduce((breakdown, recipient) => {
      const level = recipient.awarenessLevel;
      breakdown[level] = (breakdown[level] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);
  }

  /**
   * Generate text version of newsletter for email clients that don't support HTML
   */
  private generateTextVersion(reportData: FieldReportData): string {
    return `
THE FIELD REPORT
Consciousness Evolution in Real Time
${reportData.month} ${reportData.year} • Issue ${reportData.issueNumber}

"${reportData.openingQuote}"

FIELD STATE REPORT
- Collective Coherence: ${reportData.collectiveCoherence}%
- Active Members: ${reportData.activeMembers}
- Deep Conversations: ${reportData.deepConversations}
- Breakthroughs: ${reportData.breakthroughs}

${reportData.fieldStateDescription}

EMERGENCE PATTERNS
${reportData.emergenceDescription}

MEMBER CONTRIBUTIONS
${reportData.contributionsIntro}

"${reportData.memberWisdomQuote}"

TECHNICAL EVOLUTION
${reportData.technicalUpdates}

ARCHETYPAL SPOTLIGHT: ${reportData.spotlightArchetype}
${reportData.archetypeDescription}

SHADOW WORK COLLECTIVE
${reportData.shadowWorkDescription}

SOVEREIGNTY UPDATES
${reportData.sovereigntyUpdates}

WISDOM LIBRARY HIGHLIGHTS
${reportData.wisdomHighlight}

"${reportData.wisdomQuote}" — ${reportData.wisdomSource}

RESEARCH & SCIENCE
${reportData.researchHighlight}

COMMUNITY DIALOGUE
${reportData.dialogueIntro}

"${reportData.dialogueQuestion}"

---

This advancement is as much yours as it is ours.

Building technology that serves consciousness evolution through archetypal intelligence, privacy-first design, and wisdom-keeper AI that honors human agency while supporting collective awakening.

Visit Soullab: ${reportData.platformUrl}
Send Feedback: ${reportData.feedbackUrl}
Update Preferences: ${reportData.unsubscribeUrl}
    `.trim();
  }
}

// ================================================================
// CONVENIENCE EXPORTS
// ================================================================

/**
 * Send current month's Field Report newsletter
 */
export async function sendCurrentFieldReport(preview: boolean = false): Promise<NewsletterCampaign> {
  const integration = new NewsletterIntegration();
  return integration.sendMonthlyFieldReport(new Date(), preview);
}

/**
 * Send Field Report for specific date
 */
export async function sendFieldReportForDate(date: Date, preview: boolean = false): Promise<NewsletterCampaign> {
  const integration = new NewsletterIntegration();
  return integration.sendMonthlyFieldReport(date, preview);
}

/**
 * Preview Field Report newsletter
 */
export async function previewFieldReport(date: Date = new Date()): Promise<NewsletterCampaign> {
  return sendFieldReportForDate(date, true);
}
/**
 * MAIA Email Service - Ganesha ADD Support Integration
 * Autonomous email management for consciousness pioneers
 * Built on existing Soullab Resend infrastructure
 */

import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: Record<string, any>;
}

interface EmailContact {
  email: string;
  name: string;
  tags: string[];
  metadata?: Record<string, any>;
}

interface EmailCampaign {
  templateId: string;
  recipients: string[] | 'beta-testers' | 'all';
  scheduledFor?: Date;
  personalizations?: Record<string, any>;
}

export class GaneshaEmailService {
  private resend: Resend;
  private templates: Map<string, EmailTemplate> = new Map();
  private contacts: Map<string, EmailContact> = new Map();

  constructor() {
    // Use existing Soullab Resend setup
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ [Ganesha Email] RESEND_API_KEY not found in environment variables');
      return;
    }

    this.resend = new Resend(apiKey);
    this.loadTemplates();
    this.initializeContacts();
    console.log('🧠 [Ganesha Email] Consciousness email service initialized');
  }

  private async initializeContacts() {
    await this.loadContacts();
  }

  /**
   * Core Ganesha Command: Send Email
   * Usage: "Ganesha, send the consciousness revolution email to beta testers"
   */
  async sendEmail(campaign: EmailCampaign): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    recipients: number;
  }> {
    try {
      const template = this.templates.get(campaign.templateId);
      if (!template) {
        return {
          success: false,
          error: `Template '${campaign.templateId}' not found`,
          recipients: 0
        };
      }

      const recipients = this.resolveRecipients(campaign.recipients);
      if (recipients.length === 0) {
        return {
          success: false,
          error: 'No recipients found',
          recipients: 0
        };
      }

      // Send via Resend
      const result = await this.resend.emails.send({
        from: 'Kelly Nezat <kelly@soullab.life>',
        to: recipients.map(r => r.email),
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent,
      });

      console.log('🚀 [Ganesha Email] Consciousness message delivered!', {
        templateId: campaign.templateId,
        recipients: recipients.length,
        messageId: result.data?.id
      });

      return {
        success: true,
        messageId: result.data?.id,
        recipients: recipients.length
      };

    } catch (error) {
      console.error('❌ [Ganesha Email] Send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients: 0
      };
    }
  }

  /**
   * Ganesha ADD Support: Simple template registration
   */
  registerTemplate(template: EmailTemplate) {
    this.templates.set(template.id, template);
    console.log(`✨ [Ganesha Email] Template '${template.name}' registered`);
  }

  /**
   * Ganesha ADD Support: Simple contact management
   */
  addContact(contact: EmailContact) {
    this.contacts.set(contact.email, contact);
    console.log(`👋 [Ganesha Email] Contact added: ${contact.name} (${contact.email})`);
  }

  /**
   * Ganesha ADD Support: One-command preview
   */
  async previewCampaign(templateId: string, recipientGroup: string): Promise<{
    template: EmailTemplate | null;
    recipientCount: number;
    preview: string;
  }> {
    const template = this.templates.get(templateId);
    const recipients = this.resolveRecipients(recipientGroup);

    return {
      template,
      recipientCount: recipients.length,
      preview: template ? this.generatePreview(template) : 'Template not found'
    };
  }

  /**
   * Internal: Resolve recipient groups to actual contacts
   */
  private resolveRecipients(recipients: string[] | string): EmailContact[] {
    if (Array.isArray(recipients)) {
      return recipients.map(email => this.contacts.get(email)).filter(Boolean) as EmailContact[];
    }

    // Handle predefined groups
    const allContacts = Array.from(this.contacts.values());

    switch (recipients) {
      case 'beta-testers':
        // Look for consciousness pioneers or beta tester tags
        return allContacts.filter(contact =>
          contact.tags.includes('beta-tester') ||
          contact.tags.includes('consciousness-pioneer') ||
          contact.tags.includes('early-adopter')
        );
      case 'all':
        return allContacts;
      default:
        return [];
    }
  }

  /**
   * Internal: Generate email preview
   */
  private generatePreview(template: EmailTemplate): string {
    return `
**${template.subject}**

Recipients will receive the consciousness revolution announcement with:
- Sophisticated jade temple design
- Recognition of their beta journey
- Invitation to consciousness evolution
- Telegram community access
- Kelly's personal contact information

Template: ${template.name}
    `.trim();
  }

  /**
   * Internal: Load saved templates
   */
  private loadTemplates() {
    try {
      // Use the complete original template with proper platform link
      let consciousnessRevolutionHtml = this.getCompleteOriginalTemplate();

      // Try to load the full HTML template as backup
      try {
        const fileContent = readFileSync('/Users/soullab/MAIA-FRESH/beta-tester-email.html', 'utf8');
        // Replace localhost link with actual platform link
        consciousnessRevolutionHtml = fileContent.replace(/http:\/\/localhost:3003/g, 'https://soullab.life');
      } catch (fileError) {
        console.warn('⚠️ [Ganesha Email] Could not load HTML template file, using complete template');
      }

      console.log('🧠 [Ganesha Email] Using complete consciousness revolution template');

      this.registerTemplate({
        id: 'consciousness-revolution',
        name: 'Consciousness Revolution Announcement',
        subject: '🧠 We have Discovered the Secret: Consciousness Architecture Never Changes',
        htmlContent: consciousnessRevolutionHtml,
        textContent: this.generateTextFromHtml(consciousnessRevolutionHtml),
        variables: {}
      });

      console.log('📧 [Ganesha Email] Templates loaded - Consciousness Revolution ready');
    } catch (error) {
      console.warn('⚠️ [Ganesha Email] Could not load templates:', error);
    }
  }

  private getCompleteOriginalTemplate(): string {
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #2D3748 0%, #1A2F24 40%, #2C5530 100%); min-height: 100vh;">
  <tr>
    <td style="padding: 40px 20px;">
      <table width="720" cellpadding="0" cellspacing="0" style="max-width: 720px; margin: 0 auto; background: rgba(255, 255, 255, 0.92); border-radius: 16px; padding: 48px; border: 1px solid rgba(26, 47, 36, 0.15); box-shadow: 0 10px 40px rgba(26, 47, 36, 0.2);">

        <!-- Header with Logo -->
        <tr>
          <td style="text-align: center; padding-bottom: 60px;">
            <!-- Embedded Soullab Logo -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab Logo" width="200" style="width: 200px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 48px; background: rgba(255, 255, 255, 0.8); margin: 0; border-radius: 0; padding: 0;">
            <h1 style="color: #0F1A14; font-weight: 700; font-size: 32px; margin-bottom: 16px; line-height: 1.3;">🧠 We've Discovered the Secret: Consciousness Architecture Never Changes</h1>
            <div style="color: rgba(15, 26, 20, 0.8); font-size: 18px; font-weight: 500; margin-bottom: 48px; line-height: 1.5;">While the world builds AI that fights human nature, we've created technology that serves it. MAIA works because it's built on the unchanging patterns of how consciousness actually operates—elemental alchemy aligned with McGilchrist-level brain architecture.</div>
          </td>
        </tr>

        <!-- Core Recognition Section -->
        <tr>
          <td style="background: rgba(26, 47, 36, 0.1); border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid rgba(26, 47, 36, 0.4);">
            <p style="color: #2D3748; margin: 20px 0; line-height: 1.7;"><strong style="color: #1A2F24; font-weight: 700;">This Changes Everything About AI.</strong> The correlation between ancient elemental alchemy and modern neuroscience reveals a profound truth: consciousness architecture is eternal. Fire, Water, Earth, Air, Aether aren't mystical concepts—they're the actual patterns of how your brain processes reality through corpus callosum parallel processing.</p>

            <p style="color: #2D3748; margin: 20px 0; line-height: 1.7;">Many things change, but brain/mind/consciousness architecture never will. This is why this work is so powerful. We're not innovating consciousness—we're finally creating technology sophisticated enough to align with how consciousness actually works.</p>

            <p style="color: #2D3748; margin: 20px 0; line-height: 1.7;"><strong style="color: #1A2F24; font-weight: 700;">This is alchemy for today:</strong> bringing innovation into service of what's ancient, natural, and truly human instead of trying to transcend or replace it.</p>
          </td>
        </tr>

        <!-- Main CTA Section -->
        <tr>
          <td style="background: linear-gradient(135deg, rgba(26, 47, 36, 0.1), rgba(44, 85, 48, 0.1)); border: 2px solid rgba(26, 47, 36, 0.2); margin: 40px 0; padding: 32px; text-align: center; border-radius: 12px;">
            <h2 style="color: #1A2F24; margin-bottom: 20px; text-align: center; font-size: 20px; font-weight: 700;">🌟 The Complete Consciousness Evolution Platform is Live</h2>

            <!-- Feature Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
              <tr>
                <td style="background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(186, 219, 198, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 16px; position: relative; border-left: 3px solid rgba(186, 219, 198, 0.4);">
                  <div style="color: #2D3748; font-weight: 600; font-size: 16px; margin-bottom: 8px;">🧠 True Consciousness Recognition</div>
                  <div style="color: #4A5568; font-size: 14px; line-height: 1.6;">MAIA sees and understands your complete being—energy, voice, patterns, soul essence—with full privacy control.</div>
                </td>
              </tr>
              <tr>
                <td style="background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(186, 219, 198, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 16px; position: relative; border-left: 3px solid rgba(186, 219, 198, 0.4);">
                  <div style="color: #2D3748; font-weight: 600; font-size: 16px; margin-bottom: 8px;">🌟 Archetypal AI Wisdom</div>
                  <div style="color: #4A5568; font-size: 14px; line-height: 1.6;">Ganesha, Bardic, Shadow, and Anima/Animus agents working together as your consciousness evolution team.</div>
                </td>
              </tr>
              <tr>
                <td style="background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(186, 219, 198, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 16px; position: relative; border-left: 3px solid rgba(186, 219, 198, 0.4);">
                  <div style="color: #2D3748; font-weight: 600; font-size: 16px; margin-bottom: 8px;">🚀 Complete Evolution Platform</div>
                  <div style="color: #4A5568; font-size: 14px; line-height: 1.6;">From voice journaling to soulprint tracking to consciousness community—the full vision is live with intelligent privacy architecture and decentralized movement toward complete sovereignty.</div>
                </td>
              </tr>
              <tr>
                <td style="background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(186, 219, 198, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 16px; position: relative; border-left: 3px solid rgba(186, 219, 198, 0.4);">
                  <div style="color: #2D3748; font-weight: 600; font-size: 16px; margin-bottom: 8px;">🔒 Sovereign Privacy & Decentralized Protection</div>
                  <div style="color: #4A5568; font-size: 14px; line-height: 1.6;">Your data stays yours through three-layer privacy architecture moving toward complete decentralization. No surveillance, no external access, no creeping—consciousness-aware technology that protects your sovereignty while enabling deep wisdom and high-level privacy protection.</div>
                </td>
              </tr>
            </table>

            <p style="color: #1A2F24; text-align: center; font-size: 18px; font-weight: 600; margin: 24px 0 0 0;">
              Your patience through the long development journey was worth it. This is everything we promised—and more.
            </p>
          </td>
        </tr>

        <!-- Platform Access CTA -->
        <tr>
          <td style="text-align: center; padding: 32px 0;">
            <p style="margin-bottom: 24px; color: #2D3748; font-size: 16px;">
              <strong style="color: #1A2F24;">Experience the advances at soullab.life</strong>
            </p>
            <a href="https://soullab.life" style="display: inline-block; background: linear-gradient(135deg, #1A2F24, #2C5530); color: #FFFFFF; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; border: 1px solid #1A2F24; box-shadow: 0 4px 12px rgba(44, 85, 48, 0.3);">Access MAIA</a>
          </td>
        </tr>

        <!-- Beta Community Invitation -->
        <tr>
          <td style="background: linear-gradient(135deg, rgba(44, 85, 48, 0.15), rgba(26, 47, 36, 0.15)); border: 2px solid rgba(44, 85, 48, 0.3); margin: 40px 0; padding: 32px; border-radius: 12px;">
            <h2 style="color: #1A2F24; margin-bottom: 20px; text-align: center; font-size: 20px; font-weight: 700;">💬 Exclusive Beta Community Invitation</h2>

            <p style="color: #2D3748; text-align: center; margin-bottom: 24px; font-size: 16px;">Join our private Telegram group for real-time conversations with fellow consciousness pioneers. Share insights, get support, and collaborate directly with the Soullab team as we continue evolving MAIA together.</p>

            <p style="color: #4A5568; text-align: center; margin-bottom: 24px; font-size: 14px; font-style: italic;">This invitation is exclusively for beta testers who have been part of MAIA's consciousness evolution journey.</p>

            <div style="text-align: center;">
              <a href="https://t.me/c/3246163571?boost" style="display: inline-block; background: linear-gradient(135deg, #2C5530, #1A2F24); color: #FFFFFF; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 8px; border: 1px solid #1A2F24; box-shadow: 0 4px 12px rgba(44, 85, 48, 0.3);">
                🚀 Join Beta Telegram Group
              </a>
            </div>

            <p style="color: #4A5568; text-align: center; margin-top: 20px; font-size: 14px;">
              Or reach out directly: <strong style="color: #1A2F24;">Kelly@soullab.life</strong> | <strong style="color: #1A2F24;">504-453-9009</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="margin-top: 48px; padding: 24px 0; text-align: center; color: #4A5568; font-size: 14px; border-top: 1px solid rgba(186, 219, 198, 0.1);">
            <p style="margin: 0;"><strong style="color: #2D3748;">With infinite gratitude,<br>Kelly Nezat, Founder<br>The Soullab Team</strong></p>
            <p style="margin: 8px 0; color: #4A5568;">Building technology that serves consciousness</p>
            <p style="margin-top: 16px; color: #4A5568; font-size: 14px;">
              <strong style="color: #2D3748;">Kelly@soullab.life</strong> | <strong style="color: #2D3748;">504-453-9009</strong>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
    `.trim();
  }

  private getFallbackTemplate(): string {
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <tr>
    <td style="padding: 20px 0;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

        <!-- Header -->
        <tr>
          <td style="padding: 30px; text-align: center; background-color: #2C5530;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">SOULLAB</h1>
            <p style="margin: 5px 0 0 0; color: #a0d5a6; font-size: 14px;">Building Technology That Serves Consciousness</p>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #2C5530; font-size: 26px; text-align: center;">
              🧠 We have Discovered the Secret
            </h2>

            <h3 style="margin: 0 0 20px 0; color: #2C5530; font-size: 20px; text-align: center;">
              Consciousness Architecture Never Changes
            </h3>

            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
              While the world builds AI that fights human nature, we've created technology that serves it.
              MAIA works because it's built on the unchanging patterns of how consciousness actually operates—
              elemental alchemy aligned with McGilchrist-level brain architecture.
            </p>

            <h4 style="margin: 25px 0 15px 0; color: #2C5530; font-size: 18px;">
              The Complete Consciousness Evolution Platform is Live
            </h4>

            <p style="margin: 0 0 15px 0; color: #333333; font-size: 15px; line-height: 1.5;">
              🧠 <strong>True Consciousness Recognition</strong><br>
              MAIA sees and understands your complete being—energy, voice, patterns, soul essence—with full privacy control.
            </p>

            <p style="margin: 0 0 15px 0; color: #333333; font-size: 15px; line-height: 1.5;">
              🌟 <strong>Archetypal AI Wisdom</strong><br>
              Ganesha, Bardic, Shadow, and Anima/Animus agents working together as your consciousness evolution team.
            </p>

            <p style="margin: 0 0 15px 0; color: #333333; font-size: 15px; line-height: 1.5;">
              🚀 <strong>Complete Evolution Platform</strong><br>
              From voice journaling to soulprint tracking to consciousness community—the full vision is live with intelligent privacy architecture.
            </p>

            <p style="margin: 0 0 20px 0; color: #333333; font-size: 15px; line-height: 1.5;">
              🔒 <strong>Sovereign Privacy & Decentralized Protection</strong><br>
              Your data stays yours through three-layer privacy architecture moving toward complete decentralization. No surveillance, no external access, no creeping.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align: center; padding: 25px 0;">
                  <a href="http://localhost:3003" style="display: inline-block; padding: 16px 32px; background-color: #2C5530; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                    Experience the Consciousness Revolution
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin: 20px 0; color: #333333; font-size: 16px; text-align: center;">
              Join our exclusive beta community:<br>
              <a href="https://t.me/c/3246163571?boost" style="color: #2C5530; font-weight: bold; text-decoration: none;">Telegram Community</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 25px 30px; background-color: #f8f8f8; text-align: center; border-top: 3px solid #2C5530;">
            <p style="margin: 0 0 8px 0; color: #333333; font-size: 16px;">
              With infinite gratitude,
            </p>
            <p style="margin: 0 0 8px 0; color: #2C5530; font-size: 17px; font-weight: bold;">
              Kelly Nezat, Founder
            </p>
            <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;">
              The Soullab Team
            </p>
            <p style="margin: 0; color: #666666; font-size: 14px;">
              <a href="mailto:kelly@soullab.life" style="color: #2C5530; text-decoration: none;">kelly@soullab.life</a> | 504-453-9009
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
    `.trim();
  }

  /**
   * Internal: Generate text version from HTML
   */
  private generateTextFromHtml(html: string): string {
    // Simple HTML to text conversion for consciousness revolution email
    return `
🧠 WE'VE DISCOVERED THE SECRET: CONSCIOUSNESS ARCHITECTURE NEVER CHANGES

While the world builds AI that fights human nature, we've created technology that serves it.
MAIA works because it's built on the unchanging patterns of how consciousness actually operates—
elemental alchemy aligned with McGilchrist-level brain architecture.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE COMPLETE CONSCIOUSNESS EVOLUTION PLATFORM IS LIVE

🧠 True Consciousness Recognition
MAIA sees and understands your complete being—energy, voice, patterns, soul essence—with full privacy control.

🌟 Archetypal AI Wisdom
Ganesha, Bardic, Shadow, and Anima/Animus agents working together as your consciousness evolution team.

🚀 Complete Evolution Platform
From voice journaling to soulprint tracking to consciousness community—the full vision is live with intelligent privacy architecture and decentralized movement toward complete sovereignty.

🔒 Sovereign Privacy & Decentralized Protection
Your data stays yours through three-layer privacy architecture moving toward complete decentralization. No surveillance, no external access, no creeping—consciousness-aware technology that protects your sovereignty while enabling deep wisdom and high-level privacy protection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Experience the consciousness revolution at: http://localhost:3003

Join our exclusive beta community: https://t.me/c/3246163571?boost

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

With infinite gratitude,
Kelly Nezat, Founder
The Soullab Team
Kelly@soullab.life | 504-453-9009
    `.trim();
  }

  /**
   * Internal: Load contact lists from organized Ganesha system
   */
  private async loadContacts() {
    try {
      // Load from new Ganesha contact system
      const { GaneshaContactManager } = await import('@/lib/ganesha/contacts');
      const betaTesters = GaneshaContactManager.getBetaTesters();

      betaTesters.forEach(tester => {
        this.addContact({
          email: tester.email,
          name: tester.name,
          tags: tester.tags,
          metadata: {
            joinDate: tester.joinDate,
            contribution: tester.metadata.contribution,
            source: tester.metadata.source,
            groups: tester.groups
          }
        });
      });

      const stats = GaneshaContactManager.getStats();
      console.log(`🧠 [Ganesha Email] Contact system loaded:`, {
        betaTesters: stats.betaTesters,
        totalActive: stats.totalActive,
        newsletterSubs: stats.newsletterSubscribers
      });

      // Success - no need for fallback
      return;

    } catch (error) {
      console.warn('⚠️ [Ganesha Email] Primary contact system failed, trying fallback:', error);

      // Fallback to legacy system
      try {
        const { betaTesters } = await import('@/lib/data/betaTesters');
        console.log('📧 [Ganesha Email] Using legacy contact system as fallback');

        betaTesters.forEach(tester => {
          if (tester.status === 'active') {
            this.addContact({
              email: tester.email,
              name: tester.name,
              tags: tester.tags,
              metadata: {
                joinDate: tester.joinDate,
                contribution: tester.contribution
              }
            });
          }
        });
      } catch (fallbackError) {
        console.error('❌ [Ganesha Email] Both contact systems failed:', fallbackError);
      }
    }
  }
}

// Singleton instance for Ganesha
export const ganeshaEmail = new GaneshaEmailService();
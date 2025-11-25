import { DateTime } from 'luxon';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

interface AlertConfig {
  email?: {
    smtp_host: string;
    smtp_port: number;
    username: string;
    password: string;
    from_address: string;
    use_tls: boolean;
  };
  sms?: {
    twilio_account_sid: string;
    twilio_auth_token: string;
    from_number: string;
  };
  webhook?: {
    url: string;
    secret?: string;
    headers?: Record<string, string>;
  };
  slack?: {
    webhook_url: string;
    channel?: string;
  };
}

interface TherapistContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  preferred_alert_method: 'email' | 'sms' | 'both' | 'webhook';
  emergency_only: boolean;
  timezone: string;
  on_call_hours?: {
    start: string; // "09:00"
    end: string;   // "17:00"
    days: number[]; // [1,2,3,4,5] Mon-Fri
  };
}

interface AlertPayload {
  alert_id: string;
  user_id: string;
  user_name?: string;
  therapist_id: string;
  risk_level: 'moderate' | 'high' | 'crisis';
  trigger_reason: string;
  trigger_message?: string;
  context: {
    session_id: string;
    message_count: number;
    recent_messages: string[];
    assessment_scores?: Record<string, number>;
    safety_flags: string[];
  };
  timestamp: string;
  escalation_level: 'immediate' | 'urgent' | 'standard';
  follow_up_required: boolean;
}

interface AlertResponse {
  alert_id: string;
  delivery_status: {
    email?: 'sent' | 'failed' | 'not_attempted';
    sms?: 'sent' | 'failed' | 'not_attempted';
    webhook?: 'sent' | 'failed' | 'not_attempted';
    slack?: 'sent' | 'failed' | 'not_attempted';
  };
  delivery_timestamps: Record<string, string>;
  retry_count: number;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export class RealTimeAlertService {
  private config: AlertConfig;
  private emailTransporter?: nodemailer.Transporter;
  private twilioClient?: twilio.Twilio;
  private deliveryRetries: Map<string, number> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Email setup
    if (this.config.email) {
      this.emailTransporter = nodemailer.createTransporter({
        host: this.config.email.smtp_host,
        port: this.config.email.smtp_port,
        secure: this.config.email.use_tls,
        auth: {
          user: this.config.email.username,
          pass: this.config.email.password,
        },
      });
    }

    // SMS setup
    if (this.config.sms) {
      this.twilioClient = twilio(
        this.config.sms.twilio_account_sid,
        this.config.sms.twilio_auth_token
      );
    }
  }

  async sendAlert(
    therapist: TherapistContact,
    payload: AlertPayload
  ): Promise<AlertResponse> {
    const alertId = payload.alert_id;
    const response: AlertResponse = {
      alert_id: alertId,
      delivery_status: {},
      delivery_timestamps: {},
      retry_count: this.deliveryRetries.get(alertId) || 0,
    };

    // Check if therapist is on-call (for non-crisis alerts)
    if (payload.risk_level !== 'crisis' && !this.isTherapistOnCall(therapist)) {
      console.log(`Therapist ${therapist.id} is off-call, deferring non-crisis alert`);
      return response;
    }

    const deliveryPromises: Promise<void>[] = [];

    // Email alert
    if (
      therapist.email &&
      (therapist.preferred_alert_method === 'email' || therapist.preferred_alert_method === 'both')
    ) {
      deliveryPromises.push(this.sendEmailAlert(therapist, payload, response));
    }

    // SMS alert
    if (
      therapist.phone &&
      (therapist.preferred_alert_method === 'sms' || therapist.preferred_alert_method === 'both')
    ) {
      deliveryPromises.push(this.sendSMSAlert(therapist, payload, response));
    }

    // Webhook alert
    if (this.config.webhook || therapist.preferred_alert_method === 'webhook') {
      deliveryPromises.push(this.sendWebhookAlert(therapist, payload, response));
    }

    // Slack alert (for team notifications)
    if (this.config.slack && payload.escalation_level === 'immediate') {
      deliveryPromises.push(this.sendSlackAlert(payload, response));
    }

    // Execute all delivery methods in parallel
    await Promise.allSettled(deliveryPromises);

    // Log alert delivery
    await this.logAlertDelivery(response);

    return response;
  }

  private async sendEmailAlert(
    therapist: TherapistContact,
    payload: AlertPayload,
    response: AlertResponse
  ): Promise<void> {
    if (!this.emailTransporter || !therapist.email) return;

    try {
      const subject = this.generateEmailSubject(payload);
      const htmlBody = this.generateEmailBody(therapist, payload);

      await this.emailTransporter.sendMail({
        from: this.config.email!.from_address,
        to: therapist.email,
        subject,
        html: htmlBody,
        priority: payload.escalation_level === 'immediate' ? 'high' : 'normal',
      });

      response.delivery_status.email = 'sent';
      response.delivery_timestamps.email = DateTime.now().toISO();
    } catch (error) {
      console.error('Email alert failed:', error);
      response.delivery_status.email = 'failed';
      await this.scheduleRetry(payload.alert_id, 'email');
    }
  }

  private async sendSMSAlert(
    therapist: TherapistContact,
    payload: AlertPayload,
    response: AlertResponse
  ): Promise<void> {
    if (!this.twilioClient || !therapist.phone) return;

    try {
      const smsBody = this.generateSMSBody(payload);

      await this.twilioClient.messages.create({
        body: smsBody,
        from: this.config.sms!.from_number,
        to: therapist.phone,
      });

      response.delivery_status.sms = 'sent';
      response.delivery_timestamps.sms = DateTime.now().toISO();
    } catch (error) {
      console.error('SMS alert failed:', error);
      response.delivery_status.sms = 'failed';
      await this.scheduleRetry(payload.alert_id, 'sms');
    }
  }

  private async sendWebhookAlert(
    therapist: TherapistContact,
    payload: AlertPayload,
    response: AlertResponse
  ): Promise<void> {
    if (!this.config.webhook) return;

    try {
      const webhookPayload = {
        ...payload,
        therapist: {
          id: therapist.id,
          name: therapist.name,
        },
        alert_type: 'crisis_intervention',
      };

      const headers = {
        'Content-Type': 'application/json',
        ...this.config.webhook.headers,
      };

      if (this.config.webhook.secret) {
        headers['X-MAIA-Signature'] = this.generateWebhookSignature(
          JSON.stringify(webhookPayload),
          this.config.webhook.secret
        );
      }

      const webhookResponse = await fetch(this.config.webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
      });

      if (webhookResponse.ok) {
        response.delivery_status.webhook = 'sent';
        response.delivery_timestamps.webhook = DateTime.now().toISO();
      } else {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }
    } catch (error) {
      console.error('Webhook alert failed:', error);
      response.delivery_status.webhook = 'failed';
      await this.scheduleRetry(payload.alert_id, 'webhook');
    }
  }

  private async sendSlackAlert(
    payload: AlertPayload,
    response: AlertResponse
  ): Promise<void> {
    if (!this.config.slack) return;

    try {
      const slackPayload = {
        text: `🚨 MAIA Crisis Alert`,
        attachments: [
          {
            color: payload.risk_level === 'crisis' ? 'danger' : 'warning',
            fields: [
              {
                title: 'User',
                value: payload.user_name || payload.user_id,
                short: true,
              },
              {
                title: 'Risk Level',
                value: payload.risk_level.toUpperCase(),
                short: true,
              },
              {
                title: 'Trigger',
                value: payload.trigger_reason,
                short: false,
              },
              {
                title: 'Time',
                value: DateTime.fromISO(payload.timestamp).toFormat('MMM dd, yyyy HH:mm'),
                short: true,
              },
            ],
          },
        ],
      };

      const slackResponse = await fetch(this.config.slack.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });

      if (slackResponse.ok) {
        response.delivery_status.slack = 'sent';
        response.delivery_timestamps.slack = DateTime.now().toISO();
      } else {
        throw new Error(`Slack webhook failed: ${slackResponse.status}`);
      }
    } catch (error) {
      console.error('Slack alert failed:', error);
      response.delivery_status.slack = 'failed';
    }
  }

  private generateEmailSubject(payload: AlertPayload): string {
    const urgency = payload.escalation_level === 'immediate' ? '[URGENT]' : '[ALERT]';
    const riskLevel = payload.risk_level.toUpperCase();
    const userName = payload.user_name || `User ${payload.user_id.slice(-6)}`;

    return `${urgency} MAIA ${riskLevel} Risk: ${userName}`;
  }

  private generateEmailBody(therapist: TherapistContact, payload: AlertPayload): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 MAIA Crisis Alert</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">High-risk event detected requiring immediate attention</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Alert Details</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">User:</td>
                <td style="padding: 8px 0; color: #1f2937;">${payload.user_name || payload.user_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Risk Level:</td>
                <td style="padding: 8px 0;">
                  <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                    ${payload.risk_level.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Trigger:</td>
                <td style="padding: 8px 0; color: #1f2937;">${payload.trigger_reason}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${DateTime.fromISO(payload.timestamp).toFormat('MMM dd, yyyy HH:mm')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Session:</td>
                <td style="padding: 8px 0; color: #1f2937;">${payload.context.session_id}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin-top: 0;">Context</h3>
            <p><strong>Message Count:</strong> ${payload.context.message_count}</p>
            <p><strong>Safety Flags:</strong> ${payload.context.safety_flags.join(', ')}</p>

            ${payload.context.recent_messages.length > 0 ? `
              <h4 style="color: #1f2937;">Recent Messages</h4>
              <ul style="background: #f3f4f6; padding: 15px; border-radius: 4px; list-style: none;">
                ${payload.context.recent_messages.slice(-3).map(msg => `
                  <li style="margin: 10px 0; padding: 8px; background: white; border-radius: 4px;">"${msg}"</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">
              Please respond to this alert and document your intervention in the MAIA system.
            </p>
          </div>
        </div>
      </body>
    </html>
    `;
  }

  private generateSMSBody(payload: AlertPayload): string {
    const userName = payload.user_name || `User ...${payload.user_id.slice(-6)}`;
    const time = DateTime.fromISO(payload.timestamp).toFormat('HH:mm');

    return `🚨 MAIA ${payload.risk_level.toUpperCase()} ALERT\n\n` +
           `User: ${userName}\n` +
           `Trigger: ${payload.trigger_reason}\n` +
           `Time: ${time}\n\n` +
           `Immediate intervention may be required. Check MAIA dashboard for full details.`;
  }

  private generateWebhookSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  private isTherapistOnCall(therapist: TherapistContact): boolean {
    if (!therapist.on_call_hours) return true; // Always available if no schedule set

    const now = DateTime.now().setZone(therapist.timezone);
    const currentDay = now.weekday; // 1 = Monday, 7 = Sunday
    const currentTime = now.toFormat('HH:mm');

    const { start, end, days } = therapist.on_call_hours;

    return (
      days.includes(currentDay) &&
      currentTime >= start &&
      currentTime <= end
    );
  }

  private async scheduleRetry(alertId: string, method: string): Promise<void> {
    const retryCount = this.deliveryRetries.get(alertId) || 0;

    if (retryCount < 3) { // Max 3 retries
      this.deliveryRetries.set(alertId, retryCount + 1);

      // Exponential backoff: 1min, 2min, 4min
      const delayMs = Math.pow(2, retryCount) * 60000;

      setTimeout(async () => {
        console.log(`Retrying ${method} alert ${alertId} (attempt ${retryCount + 1})`);
        // This would trigger a retry of the specific method
      }, delayMs);
    }
  }

  private async logAlertDelivery(response: AlertResponse): Promise<void> {
    // This would save the delivery status to your database
    console.log('Alert delivery logged:', {
      alert_id: response.alert_id,
      delivery_status: response.delivery_status,
      retry_count: response.retry_count,
      timestamp: DateTime.now().toISO(),
    });
  }

  // Public method to acknowledge alerts
  async acknowledgeAlert(alertId: string, therapistId: string): Promise<void> {
    // Update the alert as acknowledged in database
    console.log(`Alert ${alertId} acknowledged by therapist ${therapistId}`);
  }

  // Test connectivity
  async testConnections(): Promise<{ email: boolean; sms: boolean; webhook: boolean }> {
    const results = { email: false, sms: false, webhook: false };

    // Test email
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.verify();
        results.email = true;
      } catch (error) {
        console.error('Email connection test failed:', error);
      }
    }

    // Test SMS (Twilio)
    if (this.twilioClient) {
      try {
        await this.twilioClient.api.accounts(this.config.sms!.twilio_account_sid).fetch();
        results.sms = true;
      } catch (error) {
        console.error('SMS connection test failed:', error);
      }
    }

    // Test webhook
    if (this.config.webhook) {
      try {
        const testResponse = await fetch(this.config.webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        });
        results.webhook = testResponse.ok;
      } catch (error) {
        console.error('Webhook connection test failed:', error);
      }
    }

    return results;
  }
}
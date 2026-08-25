export const dynamic = 'force-dynamic';

/**
 * Build Alert Endpoint
 *
 * Sends alerts to developer about build/deployment issues.
 * Supports email (Resend), SMS (Twilio), Slack, and Telegram.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";

export const runtime = "nodejs";

interface AlertPayload {
  severity: "critical" | "warning" | "info";
  message: string;
  commit?: string;
  details?: Record<string, unknown>;
  source?: string; // e.g., "deploy-script", "health-monitor", "error-tracker"
}

const DEV_EMAIL = process.env.DEV_EMAIL || "kelly@soullab.life";

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ success: true, stub: true });
  }
  const expectedToken = process.env.INTERNAL_ALERT_TOKEN;

  // Fail closed: require token to be configured (catches undefined AND empty string)
  if (!expectedToken) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 503 });
  }

  const authToken = req.headers.get("x-internal-token");

  // Always enforce auth (token itself is the gate, not NODE_ENV)
  if (!authToken || authToken !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: AlertPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.message || !payload.severity) {
    return NextResponse.json(
      { error: "Missing required fields: message, severity" },
      { status: 400 }
    );
  }

  const results: Record<string, boolean> = {};

  // 1. Send email
  if (process.env.RESEND_API_KEY) {
    try {
      const sent = await sendEmail({
        purpose: "build:alert",
        from: "MAIA Build Monitor <build@soullab.life>",
        to: DEV_EMAIL,
        subject: `[${payload.severity.toUpperCase()}] MAIA Build Alert`,
        html: formatAlertEmail(payload),
        metadata: { severity: payload.severity },
      });
      // `sent.success` — not `true`. A provider refusal (quota, bad sender) is
      // reported as a failed channel, so the alert fan-out cannot claim it
      // reached someone it did not reach.
      results.email = sent.success;
      if (!sent.success) {
        console.error(
          `[BuildAlert] Email REFUSED failureKind=${sent.failureKind ?? "unclassified"} providerCode=${sent.providerCode ?? "unnamed"}`
        );
      }
    } catch (error) {
      console.error("[BuildAlert] Email failed:", error);
      results.email = false;
    }
  }

  // 2. Send SMS for critical alerts only (Twilio optional - requires `npm install twilio`)
  // DISABLED: Twilio not installed. Uncomment and install twilio package to enable SMS alerts.
  // if (
  //   payload.severity === "critical" &&
  //   process.env.TWILIO_ACCOUNT_SID &&
  //   process.env.TWILIO_AUTH_TOKEN &&
  //   process.env.DEV_PHONE
  // ) {
  //   try {
  //     const twilioModule = await import("twilio").catch(() => null);
  //     if (twilioModule) {
  //       const twilio = twilioModule.default(
  //         process.env.TWILIO_ACCOUNT_SID,
  //         process.env.TWILIO_AUTH_TOKEN
  //       );
  //       await twilio.messages.create({
  //         body: `MAIA CRITICAL: ${payload.message}`,
  //         from: process.env.TWILIO_PHONE_NUMBER,
  //         to: process.env.DEV_PHONE,
  //       });
  //       results.sms = true;
  //     }
  //   } catch (error) {
  //     console.error("[BuildAlert] SMS failed:", error);
  //     results.sms = false;
  //   }
  // }

  // 3. Send to Slack if configured
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const color =
        payload.severity === "critical"
          ? "#ff4444"
          : payload.severity === "warning"
            ? "#ffaa00"
            : "#44aa44";

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachments: [
            {
              color,
              title: `${payload.severity.toUpperCase()}: Build Alert`,
              text: payload.message,
              fields: [
                payload.commit && {
                  title: "Commit",
                  value: payload.commit,
                  short: true,
                },
                payload.source && {
                  title: "Source",
                  value: payload.source,
                  short: true,
                },
              ].filter(Boolean),
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      });
      results.slack = true;
    } catch (error) {
      console.error("[BuildAlert] Slack failed:", error);
      results.slack = false;
    }
  }

  // 4. Send to Telegram if configured
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const emoji =
        payload.severity === "critical"
          ? "🚨"
          : payload.severity === "warning"
            ? "⚠️"
            : "ℹ️";

      const message = `${emoji} *${payload.severity.toUpperCase()}*\n\n${payload.message}${
        payload.commit ? `\n\nCommit: \`${payload.commit}\`` : ""
      }`;

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );
      results.telegram = true;
    } catch (error) {
      console.error("[BuildAlert] Telegram failed:", error);
      results.telegram = false;
    }
  }

  // Log the alert
  console.log(
    `[BuildAlert] ${payload.severity.toUpperCase()}: ${payload.message}`,
    { results, commit: payload.commit }
  );

  return NextResponse.json({
    success: true,
    channels: results,
    timestamp: new Date().toISOString(),
  });
}

function formatAlertEmail(payload: AlertPayload): string {
  const colors: Record<string, string> = {
    critical: "#ff4444",
    warning: "#ffaa00",
    info: "#44aa44",
  };

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #1a1a1a; color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background: #2a2a2a; border-radius: 8px; overflow: hidden;">
        <div style="background: ${colors[payload.severity]}; padding: 16px 24px;">
          <h2 style="margin: 0; color: white; font-size: 18px;">
            ${payload.severity.toUpperCase()} Alert
          </h2>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; margin: 0 0 16px 0; color: #e0e0e0;">
            ${payload.message}
          </p>
          ${
            payload.commit
              ? `
          <div style="background: #1a1a1a; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
            <span style="color: #888;">Commit:</span>
            <code style="color: #4fc3f7; margin-left: 8px;">${payload.commit}</code>
          </div>
          `
              : ""
          }
          ${
            payload.source
              ? `
          <p style="font-size: 12px; color: #888; margin: 0;">
            Source: ${payload.source}
          </p>
          `
              : ""
          }
          <p style="font-size: 12px; color: #666; margin: 16px 0 0 0;">
            ${new Date().toISOString()}
          </p>
          ${
            payload.details
              ? `
          <details style="margin-top: 16px;">
            <summary style="cursor: pointer; color: #888;">Details</summary>
            <pre style="background: #1a1a1a; padding: 12px; border-radius: 4px; overflow: auto; font-size: 11px; color: #888;">${JSON.stringify(payload.details, null, 2)}</pre>
          </details>
          `
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;
}

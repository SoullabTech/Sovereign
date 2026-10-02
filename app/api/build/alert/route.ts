export const dynamic = 'force-dynamic';

/**
 * Build Alert Endpoint
 *
 * Sends alerts to developer about build/deployment issues.
 * Uses a dedicated SMTP pager transport, plus optional Slack/Telegram channels.
 * Member mail provider selection is intentionally outside this route.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { SmtpProvider } from "@/lib/email/providers/SmtpProvider";

export const runtime = "nodejs";

interface AlertPayload {
  severity: "critical" | "warning" | "info";
  message: string;
  commit?: string;
  details?: Record<string, unknown>;
  source?: string; // e.g., "deploy-script", "health-monitor", "error-tracker"
}

const DEV_EMAIL = process.env.DEV_EMAIL || "kelly@soullab.life";

function mailboxOf(from: string): string {
  const bracketed = from.match(/<([^<>]+)>/);
  return (bracketed?.[1] ?? from).trim().toLowerCase();
}

function resolveAlertSmtp():
  | { provider: SmtpProvider; from: string }
  | { error: "alert_smtp_not_configured" | "alert_sender_mismatch" } {
  const host = process.env.ALERT_SMTP_HOST?.trim();
  const user = process.env.ALERT_SMTP_USER?.trim();
  const password = process.env.ALERT_SMTP_PASSWORD;
  const from = process.env.ALERT_FROM?.trim();

  if (!host || !user || !password || !from) {
    return { error: "alert_smtp_not_configured" };
  }

  if (mailboxOf(from) !== user.toLowerCase()) {
    return { error: "alert_sender_mismatch" };
  }

  const parsedPort = Number(process.env.ALERT_SMTP_PORT ?? 587);
  const port = Number.isFinite(parsedPort) ? parsedPort : 587;
  const secure =
    process.env.ALERT_SMTP_SECURE === "true" ? true :
    process.env.ALERT_SMTP_SECURE === "false" ? false :
    port === 465;

  const provider = new SmtpProvider({ host, user, password, port, secure });
  if (!provider.isConfigured()) {
    return { error: "alert_smtp_not_configured" };
  }

  return { provider, from };
}

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

  // 1. Required pager email uses its own SMTP credentials. Passing the provider
  // explicitly keeps global EMAIL_PROVIDER/member mail completely untouched,
  // while sendEmail still supplies classification, logging and delivery-ledger evidence.
  //
  // IMPORTANT: missing/broken SMTP must NOT short-circuit optional out-of-band
  // channels. Email remains required for a 200, but Slack/Telegram still get a
  // chance to page a human while the required channel is degraded.
  const alertSmtp = resolveAlertSmtp();
  let alertSmtpError: "alert_smtp_not_configured" | "alert_sender_mismatch" | null = null;

  if ("error" in alertSmtp) {
    alertSmtpError = alertSmtp.error;
    results.email = false;
    console.error(`[BuildAlert] Required SMTP unavailable: ${alertSmtpError}`);
  } else {
    try {
      const sent = await sendEmail({
        purpose: "build:alert",
        from: alertSmtp.from,
        to: DEV_EMAIL,
        subject: `[${payload.severity.toUpperCase()}] MAIA Build Alert`,
        html: formatAlertEmail(payload),
        metadata: { severity: payload.severity },
        triggerType: "route",
        triggerRef: "/api/build/alert",
        provider: alertSmtp.provider,
      });
      results.email = sent.success;
      if (!sent.success) {
        console.error(
          `[BuildAlert] Email REFUSED provider=${sent.provider ?? "smtp"} failureKind=${sent.failureKind ?? "unclassified"} providerCode=${sent.providerCode ?? "unnamed"}`
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

      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
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
      results.slack = response.ok;
      if (!response.ok) {
        console.error(`[BuildAlert] Slack REFUSED status=${response.status}`);
      }
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

      const response = await fetch(
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
      results.telegram = response.ok;
      if (!response.ok) {
        console.error(`[BuildAlert] Telegram REFUSED status=${response.status}`);
      }
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

  // Email is the required paging channel for this release. Optional channels
  // may add redundancy, but may never mask a failed required page.
  const delivered = results.email === true;

  return NextResponse.json(
    {
      success: delivered,
      ...(delivered
        ? {}
        : { error: alertSmtpError || "required_alert_email_not_delivered" }),
      channels: results,
      timestamp: new Date().toISOString(),
    },
    { status: delivered ? 200 : 503 }
  );
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

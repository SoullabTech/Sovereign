require("dotenv").config();

async function sendSlackAlert(message, severity = "warning") {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("Slack webhook not configured");
    return;
  }

  const colors = {
    info: "#36a64f",
    warning: "#ff9500",
    critical: "#ff0000",
  };

  const payload = {
    attachments: [
      {
        color: colors[severity] || colors.warning,
        title: `🚨 Spiralogic Oracle ${severity.toUpperCase()}`,
        text: message,
        footer: "Production Monitoring",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const fetch = (await import("node-fetch")).default;
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("✅ Slack alert sent");
  } catch (error) {
    console.error("❌ Failed to send Slack alert:", error.message);
  }
}

async function sendTelegramAlert(message, severity = "warning") {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram bot not configured");
    return;
  }

  const icons = {
    info: "💙",
    warning: "⚠️",
    critical: "🚨",
  };

  const formattedMessage = `${icons[severity] || icons.warning} *Spiralogic Oracle ${severity.toUpperCase()}*\n\n${message}\n\n_Production Monitoring System_`;

  try {
    const fetch = (await import("node-fetch")).default;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: "Markdown",
      }),
    });
    console.log("✅ Telegram alert sent");
  } catch (error) {
    console.error("❌ Failed to send Telegram alert:", error.message);
  }
}

async function sendAlert(message, severity = "warning") {
  console.log(`📢 ALERT [${severity.toUpperCase()}]: ${message}`);

  await Promise.allSettled([
    sendSlackAlert(message, severity),
    sendTelegramAlert(message, severity),
  ]);
}

module.exports = { sendAlert };

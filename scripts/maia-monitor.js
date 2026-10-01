#!/usr/bin/env node
'use strict';

/**
 * MAIA Independent Monitor
 *
 * Self-contained health monitor — no npm install required.
 * Run on any machine with Node.js to create an independent
 * observer from that network's vantage point.
 *
 * Usage:
 *   cp scripts/monitor.env.example scripts/.env.monitor
 *   # fill in your values
 *   node scripts/maia-monitor.js
 *
 * Test alert (sends DOWN + RECOVERED then exits):
 *   node scripts/maia-monitor.js --test
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// --- Minimal .env.monitor loader (no external deps) ---

function loadEnvFile(filePath) {
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // No .env.monitor — rely on process.env
  }
}

loadEnvFile(path.join(__dirname, '.env.monitor'));

// --- Config ---

const CFG = {
  checkUrl:      process.env.CHECK_URL            || 'https://soullab.life/api/health',
  intervalMs:    parseInt(process.env.CHECK_INTERVAL_MS  || '300000'),  // 5 min
  timeoutMs:     parseInt(process.env.CHECK_TIMEOUT_MS   || '15000'),   // 15 s
  source:        process.env.MONITOR_SOURCE        || 'MAIA Monitor',

  twilio: {
    sid:    process.env.TWILIO_ACCOUNT_SID || '',
    token:  process.env.TWILIO_AUTH_TOKEN  || '',
    from:   process.env.TWILIO_FROM || process.env.TWILIO_FROM_NUMBER || '',
    phones: csv(process.env.ALERT_PHONES || process.env.UPTIME_ALERT_PHONE),
  },

  slack: {
    webhook: process.env.UPTIME_ALERT_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || '',
  },

  resend: {
    key:    process.env.RESEND_API_KEY  || '',
    from:   process.env.EMAIL_FROM      || 'monitor@soullab.life',
    emails: csv(process.env.ALERT_EMAILS),
  },
};

function csv(val) {
  return (val || '').split(',').map(s => s.trim()).filter(Boolean);
}

// --- Health check ---

function checkHealth() {
  return new Promise((resolve) => {
    const parsed = new URL(CFG.checkUrl);
    const start  = Date.now();

    const timer = setTimeout(() => {
      resolve({ ok: false, status: 'timeout', latencyMs: CFG.timeoutMs });
    }, CFG.timeoutMs);

    const req = https.request(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        method:   'GET',
        headers:  { 'User-Agent': `MAIA-Monitor/1.0 (${CFG.source})` },
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          clearTimeout(timer);
          const latencyMs = Date.now() - start;
          let ok = res.statusCode >= 200 && res.statusCode < 400;
          try {
            if (JSON.parse(raw).health === 'down') ok = false;
          } catch {}
          resolve({ ok, status: res.statusCode, latencyMs });
        });
      }
    );

    req.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, status: err.code || err.message, latencyMs: Date.now() - start });
    });

    req.end();
  });
}

// --- Alerting ---

function utcNow() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

function alertText(type, result) {
  return [
    `${type === 'DOWN' ? '🔴' : '🟢'} MAIA ${type}`,
    `Source: ${CFG.source}`,
    `Check: ${CFG.checkUrl}`,
    `Status: ${result.status}`,
    `Latency: ${result.latencyMs}ms`,
    `Time: ${utcNow()}`,
  ].join('\n');
}

function httpsPost(hostname, reqPath, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path: reqPath,
        method: 'POST',
        headers: { 'Content-Length': Buffer.byteLength(data), ...headers },
      },
      (res) => {
        let raw = '';
        res.on('data', c => { raw += c; });
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendSMS(to, body) {
  const { sid, token, from } = CFG.twilio;
  if (!sid || !token || !from) return false;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({ To: to, From: from, Body: body }).toString();
  try {
    const r = await httpsPost(
      'api.twilio.com',
      `/2010-04-01/Accounts/${sid}/Messages.json`,
      { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      params
    );
    const accepted = r.status >= 200 && r.status < 300;
    console.log(`  [SMS → ${to}] ${r.status}`);
    return accepted;
  } catch (err) {
    console.error(`  [SMS → ${to}] error: ${err.message}`);
    return false;
  }
}

async function sendEmail(to, subject, text) {
  if (!CFG.resend.key) return;
  try {
    const r = await httpsPost(
      'api.resend.com',
      '/emails',
      { Authorization: `Bearer ${CFG.resend.key}`, 'Content-Type': 'application/json' },
      { from: CFG.resend.from, to, subject, text }
    );
    console.log(`  [Email → ${to}] ${r.status}`);
  } catch (err) {
    console.error(`  [Email → ${to}] error: ${err.message}`);
  }
}

async function sendSlack(body) {
  if (!CFG.slack.webhook) return false;
  try {
    const url = new URL(CFG.slack.webhook);
    const r = await httpsPost(
      url.hostname,
      url.pathname + url.search,
      { 'Content-Type': 'application/json' },
      { text: body }
    );
    const accepted = r.status >= 200 && r.status < 300;
    console.log(`  [Slack] ${r.status}`);
    return accepted;
  } catch (err) {
    console.error(`  [Slack] error: ${err.message}`);
    return false;
  }
}

async function sendAlerts(type, result) {
  const text    = alertText(type, result);
  const subject = `MAIA ${type} — ${CFG.source}`;

  console.log(`\n[ALERT ${type}]`);
  console.log(text.split('\n').map(l => '  ' + l).join('\n'));

  const smsResults = await Promise.all(CFG.twilio.phones.map(p => sendSMS(p, text)));
  const slackResult = await sendSlack(text);
  await Promise.all(CFG.resend.emails.map(e => sendEmail(e, subject, text)));

  const independentDelivered = smsResults.some(Boolean) || slackResult;
  if (!independentDelivered) {
    console.error('  [INDEPENDENT ALERT] no SMS or Slack channel accepted this alert');
  }

  return {
    independentDelivered,
    smsDelivered: smsResults.filter(Boolean).length,
    slackDelivered: slackResult,
  };
}

// --- Monitor loop ---

let lastStatus         = 'unknown'; // 'unknown' | 'up' | 'down'
let consecutiveDown    = 0;
const ALERT_THRESHOLD  = parseInt(process.env.FAILURES_BEFORE_ALERT || '1');

async function runCheck() {
  const result = await checkHealth();
  const ts     = new Date().toISOString();

  if (result.ok) {
    consecutiveDown = 0;
    process.stdout.write(`[${ts}] UP   ${result.status}  ${result.latencyMs}ms\n`);

    if (lastStatus === 'down') {
      lastStatus = 'up';
      await sendAlerts('RECOVERED', result);
    } else {
      lastStatus = 'up';
    }
  } else {
    consecutiveDown++;
    process.stdout.write(`[${ts}] DOWN ${result.status}  ${result.latencyMs}ms  (${consecutiveDown}/${ALERT_THRESHOLD})\n`);

    if (consecutiveDown >= ALERT_THRESHOLD && lastStatus !== 'down') {
      lastStatus = 'down';
      await sendAlerts('DOWN', result);
    }
  }
}

// --- Test mode ---

async function runTest() {
  console.log(`[TEST] Sending test DOWN alert...`);
  const down = await sendAlerts('DOWN', { status: 'test', latencyMs: 0 });

  console.log(`\n[TEST] Sending test RECOVERED alert...`);
  const recovered = await sendAlerts('RECOVERED', { status: 'test', latencyMs: 0 });

  const passed = down.independentDelivered && recovered.independentDelivered;
  if (!passed) {
    console.error(`\n[TEST] FAILED: an independent SMS/Slack channel did not accept both alerts.`);
    return false;
  }

  console.log(`\n[TEST] PASS: an independent channel accepted both alerts. Confirm human receipt before closing the witness.`);
  return true;
}

function printBanner(isTest) {
  console.log(`━━━ MAIA Monitor ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Source:   ${CFG.source}`);
  console.log(`URL:      ${CFG.checkUrl}`);
  console.log(`Interval: ${CFG.intervalMs / 1000}s  Timeout: ${CFG.timeoutMs / 1000}s  Alert after: ${ALERT_THRESHOLD} failure(s)`);
  console.log(`SMS to:   ${CFG.twilio.phones.join(', ') || '(none configured)'}`);
  console.log(`Slack:    ${CFG.slack.webhook ? 'configured' : '(none configured)'}`);
  console.log(`Email to: ${CFG.resend.emails.join(', ') || '(none configured)'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(isTest ? '\nRunning test alerts...' : '\nStarting monitor loop...\n');
}

if (require.main === module) {
  const isTest = process.argv.includes('--test');
  printBanner(isTest);

  if (isTest) {
    runTest().then((passed) => {
      process.exitCode = passed ? 0 : 2;
    });
  } else {
    runCheck();
    setInterval(runCheck, CFG.intervalMs);
  }
}

module.exports = { CFG, sendAlerts, runTest };

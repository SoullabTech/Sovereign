const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const https = require('node:https');

const monitorPath = require.resolve('../maia-monitor.js');
const ENV_KEYS = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM',
  'TWILIO_FROM_NUMBER',
  'ALERT_PHONES',
  'UPTIME_ALERT_PHONE',
  'UPTIME_ALERT_SLACK_WEBHOOK_URL',
  'SLACK_WEBHOOK_URL',
  'RESEND_API_KEY',
  'ALERT_EMAILS',
];

function cleanEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
  delete require.cache[monitorPath];
}

test('test mode fails closed when no independent channel exists', async () => {
  cleanEnv();
  const monitor = require('../maia-monitor.js');
  const passed = await monitor.runTest();
  assert.equal(passed, false);
});

test('simulated Slack 2xx accepts both DOWN and RECOVERED independently', async () => {
  cleanEnv();
  process.env.UPTIME_ALERT_SLACK_WEBHOOK_URL = 'https://alerts.example.test/maia';

  const originalRequest = https.request;
  let requests = 0;
  https.request = (_options, callback) => {
    requests += 1;
    const req = new EventEmitter();
    req.write = () => {};
    req.end = () => {
      const res = new EventEmitter();
      res.statusCode = 204;
      process.nextTick(() => {
        callback(res);
        res.emit('end');
      });
    };
    return req;
  };

  try {
    const monitor = require('../maia-monitor.js');
    const passed = await monitor.runTest();
    assert.equal(passed, true);
    assert.equal(requests, 2);
  } finally {
    https.request = originalRequest;
    cleanEnv();
  }
});

#!/usr/bin/env node

function present(name) {
  return typeof process.env[name] === 'string' && process.env[name].trim().length > 0;
}

const twilio = {
  account: present('TWILIO_ACCOUNT_SID'),
  token: present('TWILIO_AUTH_TOKEN'),
  sender: present('TWILIO_FROM_NUMBER') || present('TWILIO_MESSAGING_SERVICE_SID'),
  recipient: present('SAFETY_ALERT_PHONE'),
};

const slack = present('SAFETY_ALERT_SLACK_WEBHOOK_URL') || present('SLACK_WEBHOOK_URL');

const twilioReady = twilio.account && twilio.token && twilio.sender && twilio.recipient;
const independentReady = twilioReady || slack;

console.log('Independent human safety delivery preflight');
console.log(`Twilio: ${twilioReady ? 'READY' : 'NOT READY'}`);
console.log(`  account: ${twilio.account ? 'set' : 'missing'}`);
console.log(`  auth token: ${twilio.token ? 'set' : 'missing'}`);
console.log(`  sender: ${twilio.sender ? 'set' : 'missing'}`);
console.log(`  safety recipient: ${twilio.recipient ? 'set' : 'missing'}`);
console.log(`Slack: ${slack ? 'READY' : 'NOT READY'}`);
console.log(`Overall: ${independentReady ? 'READY' : 'NOT READY'}`);

if (!independentReady) {
  console.error('At least one independent human channel is required: Twilio SMS or Slack webhook.');
  process.exit(2);
}

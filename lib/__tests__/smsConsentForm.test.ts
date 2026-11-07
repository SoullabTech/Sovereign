/**
 * Twilio's A2P campaign review asked for a link to the consent form used to collect opt-in
 * (error check, 2026-11-06). The registered message flow points at this static page, so it
 * must exist, stay blank (no personal data), and say what the privacy page says.
 */
import fs from 'node:fs';
import path from 'node:path';

const form = fs.readFileSync(path.join(process.cwd(), 'public/sms-alerts-consent.html'), 'utf8');
const flat = form.replace(/\s+/g, ' ');

describe('SMS alert consent form', () => {
  it('names the alerts and the opt-out and help words', () => {
    expect(flat).toContain('operational text messages to its owner and a small number of staff');
    expect(flat).toContain('<strong>STOP</strong>');
    expect(flat).toContain('<strong>HELP</strong>');
    expect(flat).toContain('Message and data rates may apply');
  });

  it('links the live privacy policy and terms', () => {
    expect(flat).toContain('https://soullab.life/privacy');
    expect(flat).toContain('https://soullab.life/terms');
  });

  it('is a blank form: no phone numbers, and no email address but the support mailbox', () => {
    expect(flat).not.toMatch(/\+?\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}/);
    const emails = flat.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
    expect(emails).toEqual(['support@soullab.life']);
  });

  it('is kept out of search engines', () => {
    expect(flat).toContain('name="robots" content="noindex"');
  });
});

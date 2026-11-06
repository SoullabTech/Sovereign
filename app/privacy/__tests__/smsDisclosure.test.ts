/**
 * The privacy page's SMS section must describe what Soullab's Twilio account actually
 * sends, because a carrier's A2P 10DLC review compares the registered campaign to the
 * website, and because the member-feedback text carries a preview of what a member
 * wrote. It must also keep the opt-out and rate language.
 */
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'app/privacy/page.tsx'), 'utf8');
const feedback = fs.readFileSync(path.join(process.cwd(), 'app/api/feedback/route.ts'), 'utf8');
const flat = page.replace(/\s+/g, ' ');

describe('privacy page SMS disclosure', () => {
  it('names the operational notifications Soullab sends to its owner and staff', () => {
    expect(flat).toContain('short operational notifications by SMS to its owner and a small number of staff');
    expect(flat).toContain('never marketing');
  });

  it('discloses that the feedback text carries the first name and a preview', () => {
    expect(flat).toContain('first name and a short preview of what they wrote');
  });

  it('is true to the code: the feedback route really does text a preview', () => {
    expect(feedback).toMatch(/Messages\.json/);
    expect(feedback).toMatch(/preview/);
  });

  it('keeps STOP, HELP, rates and the no-sharing statement', () => {
    expect(flat).toContain('Message and data rates may apply');
    expect(flat).toContain('You can opt out at any time by replying');
    expect(flat).toMatch(/>STOP<\/strong>/);
    expect(flat).toMatch(/>HELP<\/strong>/);
    expect(flat).toContain('do not share your phone number with third parties for marketing purposes');
  });
});

# Beta Invitation Email Templates

Soullab-aesthetic email templates for MAIA beta invitations.

## Files

- **`beta-invitation.html`** - Main HTML email template (dark amber aesthetic)
- **`beta-invitation.txt`** - Plain text fallback version
- **`preview.html`** - Browser preview tool with test names

## Image Hosting

The template uses your holoflower from:
```
https://soullab.life/holoflower.svg
```

**Important:** Email clients don't support relative paths. Images must be:
- Hosted on a public URL (✅ currently using soullab.life)
- Accessible without authentication
- Served over HTTPS
- Have proper CORS headers

If changing hosting, update the img src in the template.

## Design Language

### Color Palette
- Background: `#0a0e1a` (deep navy black)
- Container: `#1a1f3a` (dark blue)
- Primary text: `#d4b896` (warm amber)
- Muted text: `rgba(212, 184, 150, 0.7)` (translucent amber)
- Borders: `rgba(212, 184, 150, 0.1)` (subtle amber)

### Typography
- Font: Inter (light/extralight weights)
- Letter spacing: Generous (2-8px for headers)
- Font weight: 200-500 (no bold)
- Line height: 1.7 (spacious reading)

### Aesthetic Principles
1. **Minimalist** - No gradients, subtle geometry
2. **Sacred** - Holoflower icon, geometric backgrounds
3. **Dark first** - Light text on dark background
4. **Amber accent** - Gold/amber as primary highlight
5. **Spacious** - Generous padding, breathing room

## Usage

### Preview in Browser

Navigate to:
```
http://localhost:3000/email-templates/preview.html
```

Or open directly:
```bash
open public/email-templates/preview.html
```

### Variable Replacement

Replace `{{Name}}` with recipient's name:

**JavaScript:**
```javascript
const html = templateHtml.replace(/\{\{Name\}\}/g, recipientName);
```

**Node.js:**
```javascript
const fs = require('fs');
const template = fs.readFileSync('beta-invitation.html', 'utf-8');
const personalized = template.replace(/\{\{Name\}\}/g, 'Kelly');
```

**Email Service (Mailchimp, SendGrid, etc):**
```
Use merge tags: *|NAME|* or {{Name}} depending on service
```

## Email Client Testing

### Recommended Tools
- [Litmus](https://litmus.com) - Comprehensive email testing
- [Email on Acid](https://emailonacid.com) - Client previews
- [Mailtrap](https://mailtrap.io) - Dev testing sandbox

### Key Clients to Test
- ✅ Gmail (web, iOS, Android)
- ✅ Apple Mail (macOS, iOS)
- ✅ Outlook (web, desktop)
- ✅ Yahoo Mail
- ✅ Proton Mail

### Known Limitations
- Some email clients strip CSS animations
- Outlook may not support backdrop-filter
- Dark mode rendering varies by client
- SVG support is inconsistent (fallback text provided)

## Sending with Email Services

### SendGrid Example
```javascript
const sgMail = require('@sendgrid/mail');
const fs = require('fs');

const template = fs.readFileSync('beta-invitation.html', 'utf-8');

const msg = {
  to: 'explorer@example.com',
  from: 'kelly@soullab.life',
  subject: 'Your MAIA Beta Invitation',
  text: fs.readFileSync('beta-invitation.txt', 'utf-8').replace(/\{\{Name\}\}/g, 'Sarah'),
  html: template.replace(/\{\{Name\}\}/g, 'Sarah')
};

await sgMail.send(msg);
```

### Mailchimp Example
1. Create new campaign
2. Design > Code your own
3. Paste `beta-invitation.html`
4. Use merge tag: `*|FNAME|*` instead of `{{Name}}`

### Resend Example
```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'kelly@soullab.life',
  to: 'explorer@example.com',
  subject: 'Your MAIA Beta Invitation',
  html: template.replace(/\{\{Name\}\}/g, 'Sarah')
});
```

## Customization

### Change CTA Link
Find and replace:
```html
<a href="https://soullab.life/beta-entry" class="cta-button">
```

### Update Sender Info
Find signature section:
```html
<div class="signature-name">Kelly</div>
<div class="signature-title">Founder, Soullab<br>Architect of Consciousness Technology</div>
```

### Modify Features List
Edit feature items:
```html
<div class="feature-item">
    <div class="feature-icon">🧠</div>
    <div class="feature-text">
        <div class="feature-title">Your Title</div>
        <div>Your description</div>
    </div>
</div>
```

## Compliance

### GDPR/CAN-SPAM
- ✅ Unsubscribe link: Add to footer
- ✅ Physical address: Add to footer
- ✅ Clear sender identification
- ✅ No deceptive subject lines

### Accessibility
- ✅ Semantic HTML structure
- ✅ Alt text for images/icons
- ✅ High contrast ratios (WCAG AA)
- ✅ Plain text fallback provided
- ✅ Readable font sizes (14px+)

## Production Checklist

- [ ] Replace `{{Name}}` with actual merge tags
- [ ] Test across major email clients
- [ ] Verify CTA link works
- [ ] Add unsubscribe link
- [ ] Include physical mailing address
- [ ] Test on mobile devices
- [ ] Verify text version renders correctly
- [ ] Check spam score (use Mail Tester)
- [ ] Proofread all copy
- [ ] Test with real recipient list (small batch first)

## Support

Questions about email templates? Contact:
- **Technical:** dev@soullab.life
- **Design:** design@soullab.life
- **Content:** kelly@soullab.life
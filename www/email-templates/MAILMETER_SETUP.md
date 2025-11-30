# Mailmeter/Email Platform Setup Guide

## Quick Start: Adding Your Custom HTML Template

### Step 1: Copy the Template

The HTML template is at:
```
public/email-templates/beta-invitation.html
```

**Copy to clipboard:**
```bash
# Mac
pbcopy < public/email-templates/beta-invitation.html

# Linux
xclip -selection clipboard < public/email-templates/beta-invitation.html

# Windows
clip < public/email-templates/beta-invitation.html
```

Or just open the file and copy all (Cmd+A, Cmd+C).

---

## Platform-Specific Instructions

### Mailchimp

1. **Create Campaign**
   - Campaigns → Create Campaign → Email
   - Choose "Regular" campaign

2. **Add Recipients**
   - Select/create audience list with 26 beta testers

3. **Design Email**
   - Design Email → Code your own → Paste code
   - Paste the HTML template

4. **Personalization**
   - Find `{{Name}}` in the HTML
   - Replace with `*|FNAME|*` (Mailchimp merge tag)

   ```html
   <!-- Before -->
   <span class="mystical-accent">{{Name}}</span>

   <!-- After -->
   <span class="mystical-accent">*|FNAME|*</span>
   ```

5. **Preview & Test**
   - Use "Preview and Test" → Send test email
   - Check on mobile and desktop

---

### MailerLite

1. **Create Campaign**
   - Campaigns → Create campaign → Regular

2. **Choose Template**
   - Rich text editor → Custom HTML
   - Click "Edit HTML"

3. **Paste Template**
   - Delete default HTML
   - Paste your template

4. **Personalization**
   - Replace `{{Name}}` with `{$name}`

   ```html
   <span class="mystical-accent">{$name}</span>
   ```

5. **Test**
   - Preview → Send test email to yourself

---

### SendGrid

1. **Create Template**
   - Email API → Dynamic Templates → Create Template

2. **Add Version**
   - Create Version → Code Editor
   - Paste HTML

3. **Personalization**
   - Replace `{{Name}}` with `{{name}}`
   - Already uses `{{}}` syntax!

4. **Test**
   - Test Data → Add JSON: `{"name": "Kelly"}`
   - Send test

---

### ActiveCampaign

1. **Create Campaign**
   - Campaigns → Create a campaign

2. **Custom HTML**
   - Choose "Custom HTML" template
   - Paste your code

3. **Personalization**
   - Replace `{{Name}}` with `%FIRSTNAME%`

   ```html
   <span class="mystical-accent">%FIRSTNAME%</span>
   ```

---

### ConvertKit

1. **Create Broadcast**
   - Broadcasts → New Broadcast

2. **Visual Editor**
   - Switch to "HTML" mode
   - Paste template

3. **Personalization**
   - Replace `{{Name}}` with `{{ subscriber.first_name }}`

---

## Common Setup Tasks

### 1. Update Merge Tags

**Find and replace in your HTML:**
```
{{Name}}
```

**Replace with your platform's syntax** (see table below):

| Platform | Merge Tag Syntax |
|----------|------------------|
| Mailchimp | `*\|FNAME\|*` |
| MailerLite | `{$name}` |
| SendGrid | `{{name}}` |
| ActiveCampaign | `%FIRSTNAME%` |
| ConvertKit | `{{ subscriber.first_name }}` |
| HubSpot | `{{ contact.firstname }}` |
| Klaviyo | `{{ first_name }}` |

### 2. Verify CTA Link

Make sure this link works:
```html
<a href="https://soullab.life/beta-entry" class="cta-button">
```

Test it in incognito/private browsing to ensure it's publicly accessible.

### 3. Add Required Legal Elements

Most email platforms require:

**Physical Address** (add to footer):
```html
<p style="font-size: 0.75rem; opacity: 0.5; margin-top: 15px;">
    Soullab<br>
    [Your Street Address]<br>
    [City, State ZIP]
</p>
```

**Unsubscribe Link** (usually auto-added by platform):
- Mailchimp: Automatic with `*|UNSUB|*`
- MailerLite: Adds automatically
- SendGrid: Use `{{{unsubscribe}}}`

### 4. Test Before Sending

**Checklist:**
- [ ] Send test to your own email
- [ ] Check on Gmail (web)
- [ ] Check on Apple Mail (if you have Mac)
- [ ] Check on mobile (iOS/Android)
- [ ] Verify holoflower image loads
- [ ] Click CTA button works
- [ ] Personalization shows correct name

---

## Troubleshooting

### Image Not Loading

**Problem:** Holoflower doesn't appear

**Solution:**
```html
<!-- Current (should work) -->
<img src="https://soullab.life/holoflower.svg" alt="Soullab Holoflower" />

<!-- If broken, upload to your email platform's image library -->
<!-- Then use their CDN URL -->
<img src="[platform-cdn-url]/holoflower.svg" alt="Soullab Holoflower" />
```

### Spacing Looks Wrong

**Problem:** Layout broken in some clients

**Solution:** Email clients strip some CSS. The template is already optimized, but if issues persist:
1. Use platform's "Preview" in multiple clients
2. Test with Litmus or Email on Acid
3. Simplify any sections that break

### Personalization Not Working

**Problem:** Shows `{{Name}}` literally instead of recipient name

**Solution:**
1. Make sure you replaced `{{Name}}` with platform's merge tag
2. Check your contact list has the name field populated
3. Send test with real contact data, not generic test

---

## Quick Send Checklist

Before hitting send:

- [ ] **HTML uploaded** to platform
- [ ] **Merge tags** replaced with platform syntax
- [ ] **Subject line** written: "✨ Your MAIA Beta Invitation"
- [ ] **From name** set to "Kelly @ Soullab" or similar
- [ ] **Test email** sent and reviewed
- [ ] **Contact list** verified (26 people)
- [ ] **CTA link** works
- [ ] **Legal footer** added (address, unsubscribe)
- [ ] **Scheduled** or ready to send

---

## Pro Tips

### Improve Deliverability

1. **Warm subject line:** "✨ Your MAIA Beta Invitation" (not too salesy)
2. **Personal from name:** "Kelly" not "noreply@soullab.life"
3. **Plain text version:** Platform should auto-generate, or use beta-invitation.txt
4. **Test spam score:** Use mail-tester.com before bulk send
5. **Send in batches:** 5-10 at a time over a few hours

### Track Engagement

Most platforms show:
- **Open rate:** Who opened the email
- **Click rate:** Who clicked the CTA
- **Best time:** When people engage most

Use this data to follow up with non-openers after 3-5 days.

---

## Need Help?

**Can't find Custom HTML option?**
- Look for: "Code your own", "HTML editor", "Custom code", "Import HTML"
- Try: Design → Templates → Custom HTML
- Still stuck? Let me know your platform name and I'll find specific instructions

**Template not rendering right?**
- Send me a screenshot
- Tell me which email client (Gmail, Outlook, etc)
- I can adjust the HTML

**Want to customize?**
- All instructions are in: `public/email-templates/README.md`
- Color palette, features, CTA text all customizable
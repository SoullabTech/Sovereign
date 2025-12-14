---
title: Contribution Forms - Community Submission System
type: technical-guide
status: published
created: 2025-10-26
---

# Contribution Forms: Collecting Community Submissions

*How to set up and manage community contribution forms for your Commons*

---

## Overview

The Community Commons thrives on **both curated and community-contributed content**. This guide shows you how to create simple submission forms so community members can:

- Share experiences
- Ask questions
- Submit practices
- Offer creative work
- Suggest resources

All submissions go to a review queue where you can curate before publishing.

---

## System Architecture

```
Community Member
      ↓
Google Form (submission)
      ↓
Google Sheet (review queue)
      ↓
Curator reviews
      ↓
Transform using templates
      ↓
Publish to vault
```

**Why Google Forms?**
- Free
- Easy to set up
- Automatic spreadsheet integration
- Can be embedded or linked
- Email notifications
- No coding required

---

## Part 1: Create Contribution Forms

### Form 1: Experience Sharing

**Purpose:** Collect transformation stories, insights, process reflections

**Questions to include:**

1. **Your name (or pseudonym)** *(optional)*
   - Short answer
   - Help text: "How you'd like to be credited. Leave blank for anonymous."

2. **Email (for follow-up only, not published)** *(required)*
   - Email field
   - Help text: "We may have questions. Will not be published."

3. **Title of your experience**
   - Short answer
   - Help text: "A few words capturing what this is about"

4. **What happened?**
   - Paragraph
   - Help text: "Describe the experience, transformation, or realization"

5. **What alchemical stage does this relate to?** *(optional)*
   - Multiple choice: Nigredo / Albedo / Citrinitas / Rubedo / Not sure / Other

6. **What concepts or practices connect to this?** *(optional)*
   - Checkbox: Soul vs Spirit / Image Work / Active Imagination / Depression as Nigredo / Shadow Work / Dreams / Other

7. **Anything else we should know?**
   - Paragraph
   - Help text: "Context, permissions, questions"

**Create this form:**
1. Go to [forms.google.com](https://forms.google.com)
2. Click "Blank form"
3. Title: "Share Your Experience - Alchemy Commons"
4. Add questions above
5. Settings → Presentation → Show progress bar
6. Settings → Responses → Limit to 1 response (uncheck)
7. Settings → Responses → Edit after submit (check)

**Link responses to spreadsheet:**
- Responses tab → Green sheets icon → "Create spreadsheet"
- Name it: "Commons Submissions - Experiences"

---

### Form 2: Ask a Question

**Purpose:** Collect genuine inquiries from the community

**Questions:**

1. **Your name (or anonymous)**
   - Short answer

2. **Email** *(required)*
   - Email field

3. **Your question**
   - Paragraph
   - Help text: "Ask anything about Jung, Hillman, alchemy, or depth psychology"

4. **What prompted this question?**
   - Paragraph
   - Help text: "Context helps us answer well"

5. **What have you already explored?** *(optional)*
   - Paragraph
   - Help text: "Books read, practices tried, your own thinking"

6. **Type of question:**
   - Multiple choice: Conceptual / Practical / Personal / Clinical / Other

**Create and link to spreadsheet:** "Commons Submissions - Questions"

---

### Form 3: Submit a Practice

**Purpose:** Collect practices and methods the community has developed

**Questions:**

1. **Your name (or pseudonym)**
   - Short answer

2. **Email** *(required)*
   - Email field

3. **Practice name**
   - Short answer

4. **What is the practice?**
   - Paragraph
   - Help text: "Step-by-step: What do you actually do?"

5. **When do you use this?**
   - Paragraph
   - Help text: "Context, situations, timing"

6. **What have you learned from it?**
   - Paragraph

7. **Are there cautions or contraindications?**
   - Paragraph
   - Help text: "When NOT to use this practice"

8. **Practice type:**
   - Multiple choice: Clinical / Personal / Creative / Community / Other

9. **Where did this come from?**
   - Paragraph
   - Help text: "Your own development? Adapted from a teacher? Inspired by a text?"

**Create and link to spreadsheet:** "Commons Submissions - Practices"

---

### Form 4: Creative Contribution

**Purpose:** Poetry, art, images, reflections

**Questions:**

1. **Your name/pseudonym**
   - Short answer

2. **Email** *(required)*
   - Email field

3. **Type of work:**
   - Multiple choice: Poetry / Visual Art / Photography / Reflection / Dream / Other

4. **Title** *(optional)*
   - Short answer

5. **The work itself**
   - Paragraph
   - Help text: "Paste text here. For images, provide a link (Google Drive, Dropbox, etc.)"

6. **Context or commentary** *(optional)*
   - Paragraph
   - Help text: "Anything you want to share about this work"

7. **Permissions**
   - Multiple choice:
     - I created this and give permission to publish
     - I have rights to share this
     - Please contact me before publishing

**Create and link to spreadsheet:** "Commons Submissions - Creative"

---

### Form 5: Suggest a Resource

**Purpose:** Books, articles, videos, links the community recommends

**Questions:**

1. **Your name** *(optional)*
   - Short answer

2. **Email** *(optional)*
   - Email field

3. **Resource type:**
   - Multiple choice: Book / Article / Video / Podcast / Website / Course / Other

4. **Title and author/creator**
   - Short answer

5. **Link (if applicable)**
   - Short answer

6. **Why recommend this?**
   - Paragraph

7. **Who is this for?**
   - Checkboxes: Beginners / Intermediate / Advanced / Therapists / Researchers / General

8. **Key themes:**
   - Checkboxes: Jung / Hillman / Alchemy / Depth Psychology / Soul Work / Clinical / Other

**Create and link to spreadsheet:** "Commons Submissions - Resources"

---

## Part 2: Organize Response Spreadsheets

### Spreadsheet Setup

For each submission spreadsheet:

1. **Add review columns:**
   - Column: `Status` (dropdown: New / Reviewed / Needs Follow-up / Published / Rejected)
   - Column: `Curator Notes`
   - Column: `Published Date`
   - Column: `Published Location` (vault path)

2. **Color code rows:**
   - New submissions: White
   - Reviewed: Yellow
   - Published: Green
   - Rejected: Light gray

3. **Set up filters:**
   - Data → Create a filter
   - Filter by Status

4. **Sort by timestamp:**
   - Newest first (default)

### Example Spreadsheet Structure

| Timestamp | Email | Name | Question | Context | Status | Curator Notes | Published Date | Published Location |
|-----------|-------|------|----------|---------|--------|---------------|----------------|-------------------|
| 10/26 | user@email.com | Jane D. | What is nigredo? | Reading Jung | Reviewed | Good Q - created FAQ entry | 10/27 | FAQ.md |

---

## Part 3: Curation Workflow

### Weekly Review Process

**Every Monday (30 min):**

1. Open all submission spreadsheets
2. Sort by "New" status
3. Read through submissions
4. Mark each as:
   - **Publish** - High quality, fits guidelines
   - **Needs Follow-up** - Questions/clarifications needed
   - **Not Now** - Doesn't fit or needs major revision
   - **Archive** - Off-topic or inappropriate

### Responding to Submissions

**For "Needs Follow-up":**

Send email:
```
Subject: Your Community Commons Submission

Hi [Name],

Thank you for your submission to the Alchemy & Psychology Commons!

We're interested in publishing your [experience/question/practice], but have a few questions:

[Your questions here]

Looking forward to hearing from you.

Best,
[Your name]
Commons Curation Team
```

**For "Publish":**

1. Copy content from spreadsheet
2. Open appropriate template (_Templates/ folder)
3. Fill in template with submission content
4. Edit for clarity/length as needed
5. Save to `07-Community-Contributions/[section]/_To-Review/`
6. Review again in context
7. Move to `07-Community-Contributions/[section]/[category]/`
8. Update spreadsheet: Status = Published, add date and location

**For "Not Now":**

Send email:
```
Subject: Your Community Commons Submission

Hi [Name],

Thank you for your submission. At this time, it doesn't quite fit the focus of the Commons [because X].

We appreciate your interest and hope you'll consider contributing again in the future.

Best,
Commons Curation Team
```

---

## Part 4: Embedding Forms

### Option 1: Direct Links

Share form URLs:
- In your published Commons (footer or sidebar)
- Social media
- Email signature
- Community spaces

### Option 2: Embed in Quartz Site

Create a "Contribute" page in your vault:

```markdown
---
title: Contribute to the Commons
---

# Share Your Voice

## Submit an Experience
<iframe src="https://docs.google.com/forms/d/e/FORM-ID/viewform?embedded=true" width="640" height="800">Loading…</iframe>

## Ask a Question
<iframe src="https://docs.google.com/forms/d/e/FORM-ID/viewform?embedded=true" width="640" height="800">Loading…</iframe>

[Continue for each form...]
```

Replace `FORM-ID` with actual Google Form IDs.

### Option 3: Link Page

Create `00-START-HERE/How to Contribute.md`:

```markdown
## Ways to Contribute

**Share an experience:** [Submit here](FORM-LINK)
**Ask a question:** [Submit here](FORM-LINK)
**Offer a practice:** [Submit here](FORM-LINK)
**Creative work:** [Submit here](FORM-LINK)
**Suggest a resource:** [Submit here](FORM-LINK)
```

---

## Part 5: Email Notifications

### Set Up Auto-Notify

For each form:

1. Open the linked spreadsheet
2. Tools → Notification rules
3. "Notify me when... A user submits a form"
4. "Notify me with... Email - right away"

You'll get instant email when someone submits.

### Create Template Responses

Save these in your email drafts for quick replies:

**Acknowledgment:**
```
Subject: Thanks for your Commons submission

Hi [Name],

We've received your submission and will review it within 1-2 weeks.

You'll hear from us soon.

Best,
Commons Curation Team
```

**Published:**
```
Subject: Your contribution is live!

Hi [Name],

Great news - we've published your [experience/question/practice] to the Commons!

You can see it here: [LINK]

Thank you for enriching the commons.

Best,
Commons Curation Team
```

---

## Part 6: Quality Guidelines

### Publish When:

✓ **Genuine and embodied** - Comes from lived experience
✓ **Clear and coherent** - Well-written, understandable
✓ **Relevant** - Connects to alchemy/depth psychology
✓ **Respectful** - Honors guidelines
✓ **Original** - Person's own experience/thinking
✓ **Safe** - No identifying info for others, appropriate boundaries

### Edit When:

✓ Minor grammar/clarity issues
✓ Too long (with permission, note "lightly edited for length")
✓ Needs structure (headers, paragraphs)
✓ Formatting for vault (markdown, links)

**Always note if edited:**
```
*Lightly edited for clarity and length*
```

### Reject When:

✗ Off-topic (unrelated to alchemy/psychology)
✗ Harmful (violates guidelines)
✗ Promotional (selling something)
✗ Plagiarized
✗ Incoherent
✗ Violates others' privacy

---

## Part 7: Attribution

### How to Credit Contributors

**If they provided a name:**
```
— Jane D.
*Contributed October 2025*
```

**If pseudonym:**
```
— Phoenix Rising (pseudonym)
*Contributed October 2025*
```

**If anonymous:**
```
— Anonymous contribution
*Submitted October 2025*
```

**In YAML frontmatter:**
```yaml
---
type: community-contribution
contributor: Jane D.
submitted: 2025-10-26
published: 2025-10-28
status: published
---
```

---

## Part 8: Stats and Insights

### Track Monthly

Create a simple log in `09-Technical/Contribution-Stats.md`:

```markdown
## October 2025

- Experiences submitted: 12
- Questions submitted: 8
- Practices submitted: 3
- Creative works: 5
- Resources: 7

**Published:** 18
**Pending:** 10
**Follow-up needed:** 5
**Not published:** 2

**Themes emerging:**
- Lots of nigredo/depression questions
- Interest in active imagination methods
- Several dream-related submissions
```

This helps you see what the community needs and what's alive.

---

## Part 9: Advanced Options

### Auto-Response Forms

Use Google Forms "Response receipt" setting:
- In form builder → Settings → Presentation
- Check "Show link to submit another response"

### Conditional Logic

Use Google Forms sections with "Go to section based on answer":
- If they select "Experience" → go to experience questions
- If they select "Question" → go to question format

### Integration with Notion/Airtable

For more advanced curation workflows, export Google Sheets to:
- **Notion** (database views, kanban boards)
- **Airtable** (relational database features)

### Community Voting (Advanced)

Set up a system where community can upvote submissions:
- Use Giscus comments on published pieces
- Track engagement
- Surface most-resonant contributions

---

## Quick Reference

### Form Links Template

Store all your form links in one place:

```markdown
# Commons Contribution Forms

**Internal links (for curation team):**
- Experiences: [Form](LINK) | [Spreadsheet](LINK)
- Questions: [Form](LINK) | [Spreadsheet](LINK)
- Practices: [Form](LINK) | [Spreadsheet](LINK)
- Creative: [Form](LINK) | [Spreadsheet](LINK)
- Resources: [Form](LINK) | [Spreadsheet](LINK)

**Public links (share with community):**
- Contribute page: [Link to vault page]
```

---

## Summary Checklist

Setup:
- [ ] Create all 5 Google Forms
- [ ] Link each to spreadsheet
- [ ] Add review columns to sheets
- [ ] Set up email notifications

Workflow:
- [ ] Weekly review scheduled (Mondays)
- [ ] Response templates saved
- [ ] Curation process documented

Publishing:
- [ ] Add forms to "How to Contribute" page
- [ ] Embed or link forms in published site
- [ ] Test submission → review → publish flow

Maintain:
- [ ] Check submissions weekly
- [ ] Respond within 1-2 weeks
- [ ] Track monthly stats
- [ ] Celebrate contributors!

---

**The community is your co-creator. Open the channels, tend them well, and watch the commons flourish. 🌊**

---

[[Welcome]] | [[Community Guidelines]] | [[Quartz Setup Guide]]

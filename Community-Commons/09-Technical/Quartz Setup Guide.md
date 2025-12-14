---
title: Quartz Setup Guide - Publishing Your Commons
type: technical-guide
status: published
created: 2025-10-26
---

# Quartz Setup Guide: Publishing Your Commons to the Web

*Step-by-step guide for deploying your Community Commons vault as a public website using Quartz 4*

---

## What is Quartz?

**Quartz 4** is a static site generator specifically designed for Obsidian vaults. It transforms your markdown notes into a beautiful, searchable website with:
- Graph view
- Full-text search
- Internal link navigation
- Tag browsing
- Mobile-responsive design
- Fast loading

**Perfect for:** Public-facing community commons, knowledge bases, digital gardens

---

## Prerequisites

Before you begin, you'll need:
- ✅ Your Community Commons vault (this vault!)
- ✅ [Node.js](https://nodejs.org/) (v18.14+)
- ✅ [Git](https://git-scm.com/)
- ✅ GitHub account (free)
- ✅ Terminal/command line access
- ⏱️ ~30-60 minutes for initial setup

---

## Part 1: Install Quartz

### Step 1: Open Terminal

**Mac:** Applications → Utilities → Terminal
**Windows:** Search for "Command Prompt" or "PowerShell"

### Step 2: Navigate to Your Desired Location

```bash
cd ~/Documents
# Or wherever you want to store the Quartz installation
```

### Step 3: Clone Quartz

```bash
git clone https://github.com/jackyzha0/quartz.git
cd quartz
npm i
npx quartz create
```

### Step 4: Choose Setup Option

When prompted, select:
```
> Copy an existing folder
```

Then enter the path to your Community Commons vault:
```
/Users/soullab/Community-Commons
```

Quartz will copy your vault content into its `content/` folder.

---

## Part 2: Configure Quartz

### Step 1: Edit Configuration

Open `quartz.config.ts` in a text editor:

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Alchemy & Psychology Commons",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible", // or "google", or omit
    },
    baseUrl: "yourusername.github.io/community-commons",
    ignorePatterns: [
      "private",
      "templates",
      "_Templates",
      ".obsidian",
    ],
    defaultDateType: "created",
    theme: {
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources({ fontOrigin: "googleFonts" }),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}
```

### Key Settings to Customize:

**pageTitle:** Change to your commons name
**baseUrl:** Your GitHub Pages URL (update after creating repo)
**ignorePatterns:** Folders to exclude from publishing
**theme.colors:** Customize to match your aesthetic

---

## Part 3: Preview Locally

Before publishing, test locally:

```bash
npx quartz build --serve
```

Open browser to `http://localhost:8080`

**What to check:**
- ✅ Links work
- ✅ Images display
- ✅ Navigation flows correctly
- ✅ Graph view shows connections
- ✅ Search works
- ✅ Mobile view looks good

**Make adjustments** to config as needed, then rebuild.

---

## Part 4: Prepare for GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `community-commons`
4. Make it **Public**
5. **Don't** initialize with README
6. Click "Create repository"

### Step 2: Connect Your Quartz Install

In your terminal (from the `quartz` directory):

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/community-commons.git
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## Part 5: Deploy to GitHub Pages

### Step 1: Build and Sync

```bash
npx quartz sync
```

This will:
1. Build your site
2. Commit changes
3. Push to GitHub
4. Deploy to GitHub Pages

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select `gh-pages` branch
4. Click **Save**

### Step 3: Wait for Deployment

GitHub will build your site (2-5 minutes).
You'll see a green checkmark when ready.

Your site will be live at:
```
https://YOUR-USERNAME.github.io/community-commons
```

---

## Part 6: Update Workflow

### When You Add New Content to Your Vault:

**Option 1: Manual Sync** (Recommended when starting)

```bash
# From your quartz directory:
npx quartz sync
```

This syncs content from your vault, builds, and deploys.

**Option 2: Automated Sync** (Advanced)

Set up a GitHub Action to auto-deploy when you push to your vault repo.

See: [Quartz Hosting Docs](https://quartz.jzhao.xyz/hosting)

---

## Part 7: Customization

### Custom Domain (Optional)

If you want `commons.yourdomain.com` instead of GitHub Pages URL:

1. Buy domain (Namecheap, Google Domains, etc.)
2. Add CNAME record pointing to `YOUR-USERNAME.github.io`
3. In your repo: Settings → Pages → Custom domain
4. Enter your domain, click Save
5. Update `baseUrl` in `quartz.config.ts`
6. Redeploy: `npx quartz sync`

### Styling

Edit `quartz/styles/custom.scss` for advanced styling:

```scss
// Example: Custom header styling
.page-title {
  font-family: 'Crimson Text', serif;
  color: #2b2b2b;
}

// Custom accent color for links
a {
  color: #284b63;
  &:hover {
    color: #84a59d;
  }
}
```

### Layout Components

Edit which components appear where:

`quartz.layout.ts`:

```typescript
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
```

---

## Part 8: Privacy & Safety

### What Gets Published?

**Published:**
- Everything in `content/` folder (your vault copy)
- Except folders in `ignorePatterns`

**Not Published:**
- Your original vault (that stays local)
- Anything in `.obsidian/`
- Anything in `_Templates/`
- Files in `_Drafts/` folders (if you use RemoveDrafts plugin)

### Safety Checklist

Before first deploy:

- [ ] Remove any private notes from vault
- [ ] Check `_Drafts` folders aren't being published
- [ ] Verify no personal information in notes
- [ ] Test all pages in local preview
- [ ] Confirm `ignorePatterns` is correct
- [ ] Review frontmatter `status: draft` vs `status: published`

### Publishing Workflow Best Practice

**Keep two vaults:**

1. **Community-Commons/** (this vault) - curated, public-safe content
2. **Soullab-Private/** (your private vault) - personal notes

Use the **Vault Audit** workflow to transform private notes → public notes.

**Never directly link** your private vault to Quartz.

---

## Part 9: Troubleshooting

### Links Not Working

**Problem:** `[[Internal links]]` broken
**Fix:** Ensure file names match exactly (case-sensitive)

**Problem:** Links to headings broken
**Fix:** Use `[[Note#Heading]]` format

### Images Not Showing

**Problem:** Images don't display
**Fix:**
- Move images to `content/` folder
- Use relative paths: `![](../images/image.png)`
- Or use Obsidian's attachment folder setting

### Build Fails

**Problem:** `npx quartz build` errors
**Fix:**
1. Check Node.js version: `node --version` (should be 18+)
2. Clear cache: `rm -rf .quartz-cache`
3. Reinstall: `npm i`
4. Check for malformed markdown

### Site Not Updating

**Problem:** Changes don't appear on published site
**Fix:**
1. Verify `npx quartz sync` completed successfully
2. Check GitHub Actions tab for build status
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
4. Wait 5 minutes for GitHub Pages cache to clear

### Graph View Empty

**Problem:** No connections showing
**Fix:**
- Ensure you're using `[[wiki links]]` not markdown `[](links)`
- Rebuild: `npx quartz build --serve`
- Check browser console for errors

---

## Part 10: Advanced Features

### Search Customization

Edit search behavior in `quartz.config.ts`:

```typescript
Component.Search({
  enablePreview: true,
  searchOptions: {
    ignoreLocation: true,
    threshold: 0.3,
  }
})
```

### Tag Hierarchies

Use nested tags in your notes:

```yaml
tags: [alchemy/nigredo, jung/archetypes]
```

These create hierarchical tag pages.

### Backlinks

Automatically generated based on `[[wiki links]]`.

Appears at bottom of each page showing "Mentioned in:" list.

### Graph View Filters

Users can filter the graph by:
- Depth (1, 2, 3 hops from current page)
- Tags
- Search terms

---

## Part 11: Community Features

### Comments (Optional)

Add Giscus (GitHub Discussions-based comments):

1. Enable Discussions on your repo
2. Install Giscus: [giscus.app](https://giscus.app)
3. Get embed code
4. Add to `quartz.config.ts`:

```typescript
Component.Comments({
  provider: 'giscus',
  options: {
    repo: 'YOUR-USERNAME/community-commons',
    repoId: 'YOUR-REPO-ID',
    category: 'General',
    categoryId: 'YOUR-CATEGORY-ID',
  }
})
```

### Analytics (Optional)

Track visitors with Plausible (privacy-friendly):

```typescript
analytics: {
  provider: "plausible",
},
```

Or Google Analytics:

```typescript
analytics: {
  provider: "google",
  tagId: "G-XXXXXXXXXX",
},
```

---

## Part 12: Maintenance

### Weekly:
- [ ] Add new content to vault
- [ ] Preview locally
- [ ] Deploy: `npx quartz sync`

### Monthly:
- [ ] Update Quartz: `git pull upstream v4`
- [ ] Check for broken links
- [ ] Review analytics (if enabled)
- [ ] Update navigation/structure as needed

### Quarterly:
- [ ] Major content review
- [ ] Community feedback integration
- [ ] Design/UX improvements

---

## Quick Reference

### Essential Commands

```bash
# Preview locally
npx quartz build --serve

# Deploy to web
npx quartz sync

# Update Quartz
git pull upstream v4

# Clear cache
rm -rf .quartz-cache
```

### File Structure

```
quartz/
├── content/           ← Your vault content (copied)
├── quartz/           ← Quartz source
├── quartz.config.ts  ← Main configuration
├── quartz.layout.ts  ← Layout components
└── package.json      ← Dependencies
```

---

## Resources

**Official Docs:** [quartz.jzhao.xyz](https://quartz.jzhao.xyz)
**Community Discord:** [Join Discord](https://discord.gg/cRFFHYye7t)
**GitHub Issues:** [Report bugs](https://github.com/jackyzha0/quartz/issues)

---

## Need Help?

**For Quartz-specific issues:**
→ Quartz Discord or GitHub Issues

**For Commons content issues:**
→ `07-Community-Contributions/Questions/`

**For vault structure questions:**
→ See [[Vault Audit - Finding Material for Commons]]

---

## Summary Checklist

Setup:
- [ ] Install Node.js and Git
- [ ] Clone Quartz
- [ ] Configure for your vault
- [ ] Test locally

Deploy:
- [ ] Create GitHub repo
- [ ] Enable GitHub Pages
- [ ] Deploy with `npx quartz sync`
- [ ] Verify site is live

Customize:
- [ ] Update branding/colors
- [ ] Set up custom domain (optional)
- [ ] Add comments/analytics (optional)
- [ ] Refine navigation

Maintain:
- [ ] Regular content updates
- [ ] Weekly deploys
- [ ] Monthly Quartz updates

---

**You're ready to publish your commons to the world! 🔥**

---

[[Welcome]] | [[Community Guidelines]] | [[Vault Audit - Finding Material for Commons]]

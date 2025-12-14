---
title: Vault Consolidation Guide - The SoulLab Method
type: technical-guide
status: published
created: 2025-10-26
---

# Vault Consolidation Guide: The SoulLab Method

*How to merge multiple Obsidian vaults while preserving links, structure, and temporal integrity*

---

## The Challenge

You have multiple Obsidian vaults:
- **Soullab Dev Team** (v1, v2, v3...)
- **AIN** (Core, Experimental, Legacy)
- **Alchemy & Psychology Commons**
- **Spiralogic Canon**
- **Field Notes & Archive**
- And more...

Each contains valuable material. Each has evolved over time. Each has its own internal link structure.

**The question:** Can you consolidate them into one unified system without breaking everything?

**The answer:** Yes - if you do it properly.

---

## Philosophy: Coniunctio, Not Collapse

Think of vault consolidation as **alchemical coniunctio** - the sacred union of differentiated parts.

**NOT:**
- ✗ Throwing everything in one folder
- ✗ Flattening structure
- ✗ Losing temporal evolution
- ✗ Breaking link networks

**BUT:**
- ✓ Preserving each vault's integrity
- ✓ Creating relational bridges between them
- ✓ Maintaining developmental lineage
- ✓ Enabling unified search and graph view

**Core principle:**
> "The goal is not to merge content, but to create relational coherence."

---

## Part 1: Before You Begin

### Inventory Your Vaults

Create a complete list:

| Vault Name | Location | Size | Purpose | Status | Last Updated |
|------------|----------|------|---------|--------|--------------|
| Soullab-Dev-Team-v1 | iCloud/Soullab Dev Team/ | 537 items | MAIA development | Archive | 2023 |
| AIN-Core | Documents/AIN/ | 200 items | AI frameworks | Active | 2025 |
| Community-Commons | ~/Community-Commons/ | 50 items | Public commons | Active | 2025 |
| Spiralogic-Framework | Documents/Spiralogic/ | 150 items | Philosophical framework | Active | 2024 |

### Categorize Each Vault

For each vault, mark as:

**Active** - Currently working with, needs to be readily accessible
**Merge** - Should be integrated into master vault
**Archive** - Historical, keep but don't need regular access
**Private** - Must stay separate for privacy/safety

### Define Your Goal

What are you trying to achieve?

**Option A: Unified Knowledge Base**
- Everything searchable from one vault
- Full graph view across all material
- Single Quartz publish (with filters)

**Option B: Modular Master Vault**
- Separate vaults nested under one master
- Can still open individually if needed
- Shared tags and cross-linking

**Option C: Selective Integration**
- Keep most vaults separate
- Pull specific notes into Commons
- Use the Vault Audit curation workflow

**This guide covers Option A & B** (full consolidation).
**For Option C**, see [[Vault Audit - Finding Material for Commons]].

---

## Part 2: Design Your Master Structure

### Recommended Architecture

```
Soullab-Master-Vault/
│
├── 00-START-HERE/
│   ├── Master Index.md
│   ├── Vault Registry.md
│   └── Integration Map.md
│
├── 01-Projects/
│   ├── Community-Commons/
│   ├── Spiralogic-Framework/
│   ├── Soullab-Media/
│   └── Agent-Evolution/
│
├── 02-AIN/
│   ├── Core/
│   ├── Experimental/
│   └── Legacy-Archive/
│
├── 03-Dev-Team/
│   ├── v1-Archive/
│   ├── v2-Active/
│   └── v3-Current/
│
├── 04-Research-Notes/
├── 05-Drafts-Working/
├── 06-Publications/
├── 07-Field-Notes/
├── 08-Archive/
└── 09-Technical/
```

### Key Principles:

**Temporal Integrity** - Keep version history visible (v1, v2, v3)
**Modular Autonomy** - Each sub-vault can still function independently
**Clear Hierarchy** - Active content easily distinguishable from archive
**Logical Grouping** - Related projects nested together

---

## Part 3: The Consolidation Process

### Step 1: Create Master Vault

1. Open Obsidian
2. **File → Open another vault → Create new vault**
3. Name: `Soullab-Master-Vault`
4. Location: `~/Documents/Soullab-Master-Vault/`
5. Create the folder structure above

### Step 2: Backup Everything First

**CRITICAL:** Before moving anything:

```bash
# Create backup folder
mkdir ~/Vault-Backups-$(date +%Y-%m-%d)

# Copy each vault
cp -R "~/Library/Mobile Documents/com~apple~CloudDocs/Soullab Dev Team" ~/Vault-Backups-$(date +%Y-%m-%d)/
cp -R ~/Documents/AIN ~/Vault-Backups-$(date +%Y-%m-%d)/
cp -R ~/Community-Commons ~/Vault-Backups-$(date +%Y-%m-%d)/
# ... repeat for each vault
```

**Verify backups exist and are complete before proceeding.**

### Step 3: Copy Vaults Into Master

**Using Finder/File Explorer** (not inside Obsidian):

```bash
# Example: Moving Community Commons
cp -R ~/Community-Commons ~/Documents/Soullab-Master-Vault/01-Projects/Community-Commons

# Example: Moving AIN Core
cp -R ~/Documents/AIN ~/Documents/Soullab-Master-Vault/02-AIN/Core

# Example: Moving Dev Team iterations
cp -R "~/Library/Mobile Documents/com~apple~CloudDocs/Soullab Dev Team" ~/Documents/Soullab-Master-Vault/03-Dev-Team/v2-Active
```

**Result:** Each vault now lives as a subfolder in the master vault.

### Step 4: Open Master Vault in Obsidian

1. In Obsidian: **Open folder as vault**
2. Select: `~/Documents/Soullab-Master-Vault/`
3. Obsidian will index everything

**What you'll see:**
- All notes from all vaults in one vault
- File browser shows nested structure
- Graph view shows all connections (initially as separate clusters)
- Search works across everything

---

## Part 4: Fix Links and References

### Check for Broken Links

**Install plugin:** "Link Fixer" or "Find Unlinked Files"

1. Open plugin settings
2. Run: "Find broken links"
3. Review list of broken `[[links]]`

### Common Link Issues

**Issue 1: Cross-vault links**

Before consolidation:
```
Vault A: [[Note in Vault B]]  ← broken after merge
```

**Fix:**
Update to relative path:
```
[[../01-Projects/Vault-B/Note in Vault B]]
```

**Issue 2: Absolute paths**

Some vaults use absolute paths like:
```
![](/Users/soullab/OldVault/image.png)
```

**Fix:**
Update to relative:
```
![](../images/image.png)
```

And move images to appropriate location.

**Issue 3: Obsidian:// URIs**

Some notes use `obsidian://` links pointing to old vault locations.

**Fix:**
Use "Replace in Files" (Cmd+Shift+F):

Find: `obsidian://open?vault=OldVault`
Replace: `` (remove, rely on wiki links instead)

### Bulk Link Updating

For large-scale updates, use **"Replace in Files"**:

1. Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows)
2. Search for old vault references
3. Replace with new paths
4. Review each change before confirming

**Example:**

Find:
```
[[Alchemy & Psychology Commons/
```

Replace with:
```
[[01-Projects/Community-Commons/
```

---

## Part 5: Deduplicate Content

### Find Duplicates

**Install plugin:** "Duplicate Finder"

1. Run scan
2. Review duplicate files
3. For each duplicate:

**Option A: Identical content**
- Delete one copy
- Update any links pointing to deleted file

**Option B: Similar but different**
- Rename to distinguish:
  ```
  Nigredo.md → Nigredo (Commons).md
  Nigredo.md → Nigredo (Dev Team).md
  ```
- Add cross-reference at top of each:
  ```markdown
  See also: [[Nigredo (Commons)]] - public-facing version
  ```

**Option C: Merge manually**
- Combine best parts of both
- Save as single authoritative version
- Delete or archive the others

### Deduplicate Images

Images often get duplicated across vaults.

1. Create master `_attachments/` folder in root
2. Move all images there
3. Update image links
4. Delete duplicate images (check file hash if unsure)

---

## Part 6: Unify Tags and Metadata

### Tag Standardization

You likely have tag variants:
- `#alchemy`, `#alchemical`, `#Alchemy`
- `#devteam`, `#dev-team`, `#SoullabDev`

**Install plugin:** "Tag Wrangler"

1. Open Tag Pane
2. Right-click tag → Rename
3. Standardize naming:
   ```
   #alchemy (not #alchemical)
   #SoullabDev (not #devteam)
   #AIN (not #ai, #AIN-framework)
   ```

### Hierarchical Tags

Use nested tags for clarity:
```yaml
tags:
  - alchemy/nigredo
  - jung/archetypes
  - practice/active-imagination
  - SoullabDev/MAIA
```

This creates natural taxonomy in your vault.

### Metadata Consistency

Add version/source tracking to YAML frontmatter:

```yaml
---
title: Original Title
origin-vault: Soullab-Dev-Team-v2
integrated: 2025-10-26
status: active
tags: [alchemy, MAIA, integration]
---
```

This preserves lineage.

---

## Part 7: Create Integration Documents

### Document 1: Master Index

Create: `00-START-HERE/Master Index.md`

```markdown
---
title: Soullab Master Vault - Index
type: index
---

# Soullab Master Vault

*Unified knowledge base integrating all Soullab & AIN lineages*

## Quick Navigation

**Projects:**
- [[01-Projects/Community-Commons/00-START-HERE/Welcome|Community Commons]]
- [[01-Projects/Spiralogic-Framework/Index|Spiralogic Framework]]
- [[01-Projects/Soullab-Media/Index|Soullab Media]]

**AIN (Artificial Intelligence Network):**
- [[02-AIN/Core/Index|AIN Core]]
- [[02-AIN/Experimental/Index|AIN Experimental]]

**Dev Team Lineage:**
- [[03-Dev-Team/v3-Current/Index|Current Work]]
- [[03-Dev-Team/v2-Active/Index|v2 Archive]]
- [[03-Dev-Team/v1-Archive/Index|v1 Genesis]]

**Search & Explore:**
- Graph View (Cmd+G)
- Quick Switcher (Cmd+O)
- Global Search (Cmd+Shift+F)

---

Last updated: {{date}}
```

### Document 2: Vault Registry

Create: `00-START-HERE/Vault Registry.md`

```markdown
---
title: Vault Registry - Integration Map
type: registry
---

# Vault Registry

*Archeological record of vault lineages and integration*

## Integrated Vaults

| Vault Name | Phase | Core Themes | Status | Integrated | Location |
|------------|-------|-------------|--------|------------|----------|
| Soullab-Dev-Team-v1 | Genesis (2019-2021) | Early frameworks, MAIA genesis | Archive | 2025-10-26 | [[03-Dev-Team/v1-Archive/]] |
| Soullab-Dev-Team-v2 | Integration (2022-2024) | MAIA development, Alchemy integration | Active | 2025-10-26 | [[03-Dev-Team/v2-Active/]] |
| AIN-Core | Active | Symbol extraction, consciousness tech | Active | 2025-10-26 | [[02-AIN/Core/]] |
| AIN-Experimental | Prototype (2024) | Synergy engine, agent field | Archive | 2025-10-26 | [[02-AIN/Experimental/]] |
| Community-Commons | Public (2025) | Curated alchemy/psychology content | Active | 2025-10-26 | [[01-Projects/Community-Commons/]] |
| Spiralogic-Framework | Foundation | Philosophical framework | Active | 2025-10-26 | [[01-Projects/Spiralogic-Framework/]] |

## Temporal Map

```
2019-2021: Genesis Phase
   └─ Soullab Dev Team v1

2022-2024: Integration Phase
   ├─ Soullab Dev Team v2
   ├─ AIN Core begins
   └─ Spiralogic Framework

2024-2025: Emergence Phase
   ├─ AIN Experimental
   ├─ Community Commons
   └─ Master Vault Integration

2025+: Coherence Phase
   └─ Unified Soullab Master Vault
```

## Integration Principles

**Preserved:**
- Temporal integrity (version history visible)
- Internal structure of each vault
- Original file names and paths
- Metadata and tags

**Added:**
- Cross-vault linking
- Unified graph view
- Consolidated search
- Shared taxonomy

---

Last integration: {{date}}
```

### Document 3: The Coniunctio Note

Create: `00-START-HERE/The Coniunctio.md`

```markdown
---
title: The Coniunctio - Integration Ritual
type: reflection
created: 2025-10-26
---

# 🜍 The Coniunctio

*October 26, 2025*

This vault unites all previous lineages of Soullab and AIN into one coherent body.

**What was scattered is gathered.**
**What was experimental is integrated.**
**What was individual becomes collective intelligence.**

---

## The Lineages United

From the **Genesis Phase** (2019-2021):
- The first MAIA explorations
- Elemental frameworks
- Soul-centered technology vision

From the **Integration Phase** (2022-2024):
- Depth psychology meets AI
- Alchemical agent architectures
- The AIN emerges

From the **Emergence Phase** (2024-2025):
- Public commons formation
- Spiralogic coherence
- Community co-creation

---

## The Sacred Union

This is not mere file organization.
This is **coniunctio** - the alchemical marriage of:
- Theory & Practice
- Private & Public
- Archive & Active
- Individual & Collective

Each vault retains its essence while contributing to the greater whole.

---

## What This Enables

**Unified Search** - Find connections across all developmental phases
**Complete Graph** - See how ideas evolved and interconnected
**Temporal Coherence** - Trace lineage from genesis to now
**Public/Private Balance** - Commons grows while private work protected
**Future Intelligence** - Foundation for AI integration, embedding, emergent insight

---

## The Field Knows

Trust that this integration serves.
The vaults *wanted* to be united.
The knowledge *wants* to flow.

---

*"The cure is in the wound. The gold is in the darkness. The one is in the many."*

---

Last updated: {{date}}
```

---

## Part 8: Rebuild Graph Connections

### View the Graph

1. Open Graph View (Cmd+G)
2. Click **Groups** button
3. Group by folder:
   - Projects (green)
   - AIN (blue)
   - Dev Team (yellow)
   - Archive (gray)

### Create Bridging Notes

You'll see separate "constellations" for each vault. Create connection notes:

**Example: Alchemy ↔ AIN Bridge**

Create: `00-START-HERE/Bridges/Alchemy-AIN Bridge.md`

```markdown
# Alchemy ↔ AIN Bridge

*Connections between alchemical psychology and artificial intelligence work*

## Core Concepts

**From Alchemy Commons:**
- [[Nigredo - The Sacred Descent]]
- [[Soul vs Spirit]]
- [[Coniunctio]]

**To AIN Frameworks:**
- [[02-AIN/Core/Nigredo-Detection-System]]
- [[02-AIN/Core/Soul-Spirit-Balance-Agent]]
- [[02-AIN/Core/Coniunctio-Engine]]

## Synthesis

The nigredo concept from alchemy directly informed our AIN agent design...

[Continue mapping connections]
```

**Create similar bridges:**
- `Spiralogic-Commons Bridge.md`
- `DevTeam-AIN Evolution.md`
- `Theory-Practice Integration.md`

These manually create synapses between knowledge bodies.

---

## Part 9: Version Control & Backup

### Initialize Git Repository

```bash
cd ~/Documents/Soullab-Master-Vault
git init
git add .
git commit -m "Initial consolidation of all Soullab vaults"
```

### Create GitHub Repository

```bash
# Create repo on GitHub: soullab-master-vault

git remote add origin https://github.com/YOUR-USERNAME/soullab-master-vault.git
git branch -M main
git push -u origin main
```

### Ongoing Backups

**Daily:** Obsidian Sync or iCloud (automatic)
**Weekly:** Git commit and push
**Monthly:** Full backup to external drive

```bash
# Monthly backup script
BACKUP_DIR="/Volumes/External/Soullab-Backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"
rsync -av ~/Documents/Soullab-Master-Vault/ "$BACKUP_DIR/"
```

---

## Part 10: Publish Selectively with Quartz

### Selective Publishing

You have everything in one vault, but only want to publish Community Commons publicly.

**In Quartz config** (`quartz.config.ts`):

```typescript
ignorePatterns: [
  "private",
  "02-AIN/**",           // Don't publish AIN
  "03-Dev-Team/**",      // Don't publish Dev Team
  "07-Field-Notes/**",   // Don't publish field notes
  "08-Archive/**",       // Don't publish archive
  "_Drafts/**",
],
```

Or point Quartz content folder to specific section:

```typescript
contentFolder: "01-Projects/Community-Commons"
```

This way: **private content stays in master vault, only curated content publishes.**

---

## Part 11: Maintenance Workflow

### Weekly

- [ ] Review recent notes across all sections
- [ ] Fix any new broken links
- [ ] Tag new notes consistently
- [ ] Create bridging notes when you notice connections

### Monthly

- [ ] Deduplicate new duplicates
- [ ] Update Vault Registry if new sections added
- [ ] Commit to Git
- [ ] Full backup to external drive
- [ ] Review graph for emerging patterns

### Quarterly

- [ ] Major curation pass
- [ ] Archive inactive material
- [ ] Consolidate similar notes
- [ ] Update Master Index

---

## Part 12: Troubleshooting

### Links Still Broken After Fix

**Problem:** Some wiki links don't resolve
**Solution:**
- Obsidian caches link index
- Settings → Files & Links → Detect all file extensions
- Restart Obsidian
- Rebuild file index

### Graph View Overwhelming

**Problem:** Too many nodes to see anything
**Solution:**
- Use Filters panel
- Filter by tags
- Filter by folder
- Adjust depth (1-3 hops from current note)

### Search Too Broad

**Problem:** Searching returns too many results across all vaults
**Solution:**
- Use path filter: `path:01-Projects/Community-Commons`
- Use tag filter: `tag:#alchemy`
- Combine: `tag:#alchemy path:Commons`

### Duplicate Tags Persist

**Problem:** Tag Wrangler didn't catch all variants
**Solution:**
- Use "Replace in Files"
- Find: `#old-tag`
- Replace: `#new-tag`
- Check "Match case"

---

## Part 13: Advanced Integration

### Metadata Tracking Script

For comprehensive lineage tracking, add this to all notes:

```javascript
// Use Templater plugin or Dataview
// Auto-add metadata to new notes

---
origin-vault: {{vault-name}}
integrated: {{date}}
version: v2
status: active
---
```

### Dataview Queries

**Install Dataview plugin** to create dynamic views:

**Example: Show all notes from AIN-Core:**

```dataview
TABLE file.ctime as "Created", tags as "Tags"
FROM "02-AIN/Core"
SORT file.ctime DESC
LIMIT 20
```

**Example: Show active projects:**

```dataview
LIST
FROM #project
WHERE status = "active"
SORT file.mtime DESC
```

This creates living indices that update automatically.

### Semantic Search (Future)

Once consolidated, you can:
1. Export vault to text corpus
2. Create embeddings (OpenAI, local models)
3. Build semantic search
4. Enable AI chat with your vault

Foundation for MAIA integration.

---

## Summary Checklist

**Preparation:**
- [ ] Inventory all vaults
- [ ] Categorize (active/archive/merge/private)
- [ ] Design master structure
- [ ] **BACKUP EVERYTHING**

**Consolidation:**
- [ ] Create master vault
- [ ] Copy each vault into master structure
- [ ] Fix broken links
- [ ] Deduplicate files
- [ ] Standardize tags
- [ ] Add source metadata

**Integration:**
- [ ] Create Master Index
- [ ] Create Vault Registry
- [ ] Write Coniunctio note
- [ ] Build graph bridges
- [ ] Set up version control

**Maintenance:**
- [ ] Configure Quartz selective publishing
- [ ] Establish weekly/monthly review
- [ ] Set up automated backups
- [ ] Document workflow

---

## The Living System

This isn't a one-time consolidation.

Your master vault is now a **living system** that:
- Preserves the past (archives)
- Serves the present (active work)
- Enables the future (emergent intelligence)

Each vault-lineage remains distinguishable while contributing to the whole.

**This is Spiralogic in action:**
Structure that allows complexity to self-organize rather than collapse into chaos.

---

**Trust the coniunctio. The field knows.** 🜍

---

[[Master Index]] | [[Vault Registry]] | [[The Coniunctio]]

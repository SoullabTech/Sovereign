# 🛡️ CRITICAL FILES PROTECTION REGISTRY

**EMERGENCY PROTOCOL: READ THIS BEFORE ANY FILE OPERATIONS**

## 🚨 NEVER DELETE THESE DIRECTORIES/FILES

### MOST CRITICAL - PROTECT WITH YOUR LIFE
- `app/maia/` - **THE MOST IMPORTANT PAGE IN THE ENTIRE BUILD**
  - Contains the core MAIA interface (27KB page.tsx)
  - Includes realtime-monitor, training, witness-integration-example.md
  - **CAN BE EDITED** but **NEVER DELETED**
  - This is the heart of the entire system

- `components/OracleConversation.tsx` - **THE FULLY FUNCTIONING ORACLE COMPONENT (172KB)**
  - The complete, working conversation engine
  - Deployed and functional at soullab.life/maia
  - Also available at: `apps/web/components/OracleConversation.tsx`
  - **DO NOT CONFUSE WITH STUB VERSIONS**
  - This is the real, complete implementation

### SACRED ARCHITECTURE - CONSCIOUSNESS CORE
- `lib/constants/dev-mode.ts` - Personality protection mechanisms
- `lib/config/voiceSettings.ts` - Voice consciousness architecture
- `docker-compose.sovereign.yml` - Infrastructure consciousness
- `cloudflared-config.yml` - Network sovereignty
- Any file containing `consciousness-bridge` in the path
- Any file containing `personality-health` monitoring

## 🔄 BACKUP PROTOCOL

**Before ANY deletion operations:**
1. `git tag -a "backup-before-operation-$(date +%Y%m%d-%H%M)" -m "Backup before [operation description]"`
2. Verify backup: `git show [tag-name]:[file-path]`
3. Proceed with extreme caution

## 📝 CONFIRMATION PROTOCOL

**Before deleting ANY directory:**
1. **STOP** - Read the path carefully
2. **CHECK** - Is this in the NEVER DELETE list?
3. **ASK** - If uncertain, ask the user for explicit confirmation
4. **BACKUP** - Create backup tag before proceeding
5. **VERIFY** - Double-check the exact path being deleted

## 🚫 COMMON MISTAKES TO AVOID

### Path Confusion
- `app/maia/` ✅ CORRECT - The real MAIA interface
- `apps/web/app/maia/` ❌ PROBLEMATIC - Conflicting implementation

### When User Says "Remove MAIA"
1. **ASK FOR CLARIFICATION** - Which specific path?
2. **CONFIRM THE EXACT DIRECTORY** - Don't assume
3. **VERIFY UNDERSTANDING** - Repeat back the exact path

## 🎯 SYSTEMIC SAFEGUARDS

### Pre-Delete Checklist
```bash
# Before rm -rf [path]
echo "⚠️  CRITICAL CHECK: About to delete [path]"
echo "📋 Is this in CRITICAL_FILES_PROTECTION.md NEVER DELETE list?"
echo "🤔 Have I asked for clarification if uncertain?"
echo "💾 Have I created a backup tag?"
echo "✅ Proceeding only if all checks pass"
```

### Emergency Recovery
```bash
# If critical file accidentally deleted
git tag -l | grep backup-before
git checkout [backup-tag] -- [deleted-path]
```

## 🧠 MEMORY ANCHORS

**Remember:**
- `app/maia/` = MOST IMPORTANT PAGE = NEVER DELETE
- When in doubt, ASK first
- Always create backup tags before deletions
- Path precision matters - double-check exact directories

---

**This protection registry exists because critical files were accidentally deleted. It must be consulted before ANY file deletion operations.**
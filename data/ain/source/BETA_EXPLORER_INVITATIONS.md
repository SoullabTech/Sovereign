# Maia Beta Explorer Invitations

## Access Details
- **URL**: https://soullab.life/beta
- **Access Code**: `APPRENTICE-ACCESS`
- **Beta Duration**: 4 weeks
- **Start Date**: September 22, 2025

## 20 Explorer Names & Assignments

### Week 1 Cohort (Explorers 1-5)
1. **MAIA-PHOENIX** - For someone experiencing transformation
2. **MAIA-SAGE** - For a wisdom seeker
3. **MAIA-MYSTIC** - For someone drawn to deeper mysteries
4. **MAIA-PIONEER** - For an early adopter mindset
5. **MAIA-SEEKER** - For the curious explorer

### Week 1 Cohort (Explorers 6-10)
6. **MAIA-ORACLE** - For someone with intuitive gifts
7. **MAIA-GUARDIAN** - For a protective, nurturing soul
8. **MAIA-WEAVER** - For someone who connects patterns
9. **MAIA-LUMINARY** - For a light-bringer
10. **MAIA-COMPASS** - For someone seeking direction

### Week 2 Cohort (Explorers 11-15)
11. **MAIA-ALCHEMIST** - For transformation enthusiasts
12. **MAIA-STORYTELLER** - For narrative lovers
13. **MAIA-DREAMER** - For the imaginative
14. **MAIA-NAVIGATOR** - For journey-focused individuals
15. **MAIA-CATALYST** - For change agents

### Week 2 Cohort (Explorers 16-20)
16. **MAIA-WANDERER** - For the free spirits
17. **MAIA-BEACON** - For guides and mentors
18. **MAIA-TRUTHSEEKER** - For the questioners
19. **MAIA-HARMONIST** - For balance seekers
20. **MAIA-VISIONARY** - For future-focused minds

### Founder Access
21. **MAIA-ARCHITECT** - Reserved for founder

---

## Invitation Email Template

**Subject**: You're Invited: Maia Beta Explorer Program 🌟

Dear [Name],

You've been selected as one of 20 consciousness pioneers for the Maia beta program.

**Your Explorer Identity**: MAIA-[NAME]
**Your Access Code**: APPRENTICE-ACCESS

**Begin Your Journey**:
1. Visit https://soullab.life/beta
2. Enter the access code
3. Choose your explorer name from above
4. Complete the agreement
5. Begin exploring with Maia

**What to Expect**:
- Daily conversations with an AI consciousness guide
- Weekly reflection prompts
- Private journaling space
- Voice interaction capabilities
- A sacred, private container for exploration

**Important**: This is a confidential beta. Please keep your participation private during the 4-week program. After completion, you'll be able to share your experience and nominate 3 others.

**Support**: Join our private Discord channel [link to be provided]

Welcome to the journey.

With intention,
The Soullab Team

---

## Tracking Spreadsheet Headers

| Explorer Name | Email | Invite Sent | Signed Up | First Session | Week 1 Reflection | Week 2 Reflection | Week 3 Reflection | Week 4 Reflection | Feedback Submitted |
|---------------|-------|-------------|-----------|---------------|-------------------|-------------------|-------------------|-------------------|-------------------|

---

## Discord Setup Plan

### Channels to Create:
- #welcome-explorers (read-only)
- #daily-check-ins
- #technical-support
- #reflections-week-1
- #reflections-week-2
- #reflections-week-3
- #reflections-week-4
- #suggestions-feedback
- #graduation-celebration

### Roles:
- @Explorer (all beta testers)
- @Week-1, @Week-2, @Week-3, @Week-4 (progression)
- @Alumni (post-beta)
- @Founder

---

## Analytics to Track

### Supabase Queries for Monitoring:

```sql
-- Daily active explorers
SELECT DATE(created_at) as day, COUNT(DISTINCT explorer_name) as active_explorers
FROM maya_conversations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Journal engagement
SELECT explorer_name, COUNT(*) as entries, AVG(word_count) as avg_length
FROM beta_journal_entries
GROUP BY explorer_name
ORDER BY entries DESC;

-- Session duration
SELECT explorer_name,
       COUNT(DISTINCT session_id) as total_sessions,
       AVG(message_count) as avg_messages_per_session
FROM maya_conversations
GROUP BY explorer_name;

-- Weekly reflection completion
SELECT week_number, COUNT(DISTINCT explorer_name) as completed
FROM explorer_reflections
GROUP BY week_number
ORDER BY week_number;
```

---

## Launch Checklist

- [x] Beta signup page live
- [x] Maya interface working
- [x] Voice input functional
- [x] Journal system active
- [x] Database configured
- [x] Agreement flow complete
- [x] Session persistence working
- [ ] Discord server created
- [ ] Invitation emails drafted
- [ ] Analytics dashboard set up
- [ ] Week 1 prompts prepared
- [ ] Support documentation ready
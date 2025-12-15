# 🌟 Auto-Embedding QA Ritual

This checklist ensures the automatic embedding indexing system works correctly and provides semantic search capabilities for journal entries, memory events, and conversations.

## ✅ QA Checklist

### 1. Journal Entry Embedding Test
- [ ] **Add new journal entry** → confirm `[EMBED] Journal entry indexed` log appears
- [ ] **Check embedding metadata** → verify entry includes mood, sentiment, phase, tags
- [ ] **Verify no blocking** → journal saves even if embedding fails
- [ ] **Search test** → `/search "your journal content"` finds newly created entry
- [ ] **Semantic match test** → search for concepts/emotions related to journal content

### 2. Memory Event Embedding Test  
- [ ] **Create memory event** → confirm `[EMBED] Memory event indexed` log appears
- [ ] **Check enhanced metadata** → verify themes, spiritual keywords included
- [ ] **Verify no blocking** → memory saves even if embedding fails
- [ ] **Search test** → `/search` finds memory events by content
- [ ] **Symbol search** → search for symbolic content from memory events

### 3. Conversation Embedding Test
- [ ] **Normal conversation** → confirm `[EMBED] Conversation snippet indexed` log appears
- [ ] **Streaming conversation** → confirm `[EMBED] Streaming conversation snippet indexed` log appears
- [ ] **Check conversation format** → verify "User: ... | Maya: ..." format is stored
- [ ] **Search test** → `/search` finds past conversations by content
- [ ] **Context search** → search for conversation topics/themes

### 4. Network Resilience Test
- [ ] **Kill internet** → journal/memory/conversation still saves
- [ ] **Check retry queue** → confirm `[EMBED-QUEUE] Job queued for retry` logs
- [ ] **Restore internet** → confirm `[EMBED-QUEUE] Job completed successfully` logs
- [ ] **Verify processing** → confirm queue processes all pending items

### 5. Backend Restart Test
- [ ] **Create entries while offline** → queue items for retry
- [ ] **Restart backend** → embeddingQueue should retry missed entries
- [ ] **Check logs** → confirm `[EMBED-QUEUE] Processing queue` on startup
- [ ] **Verify completion** → all queued items eventually get processed

### 6. Search Quality Test  
- [ ] **Hybrid search active** → searches show both exact and semantic matches
- [ ] **[Semantic] tags visible** → concept matches display semantic indicator  
- [ ] **Relevance ranking** → most relevant results appear first
- [ ] **Cross-content search** → search finds matches across journals, memories, conversations
- [ ] **Conceptual search** → search for "stress" finds "anxiety", "pressure", etc.

### 7. Performance Under Load Test
- [ ] **Rapid entry creation** → create 20+ entries in quick succession
- [ ] **Monitor logs** → confirm all entries get indexed
- [ ] **Check queue status** → verify queue processes efficiently
- [ ] **No memory leaks** → queue size returns to 0 after processing
- [ ] **Search responsiveness** → search remains fast with more data

### 8. Error Handling Test
- [ ] **Invalid OpenAI key** → entries still save, retry queue active
- [ ] **Rate limit hit** → confirm exponential backoff and retry
- [ ] **Network timeouts** → graceful degradation, no crashes  
- [ ] **Max retries reached** → error logged but system continues
- [ ] **Malformed content** → embedding fails gracefully

### 9. Memory Recall Integration Test
- [ ] **Past entries surface** → Maya references old journal insights naturally
- [ ] **Conversation continuity** → Maya remembers past conversation topics  
- [ ] **Context awareness** → Maya shows understanding of user patterns
- [ ] **Semantic connections** → Maya connects related themes across time
- [ ] **No direct embedding mention** → Maya doesn't break character by mentioning embeddings

## 🔧 Debug Commands

### Check Embedding Queue Status
```javascript
// In backend console
console.log(embeddingQueue.getQueueStatus());
```

### Manual Retry Failed Jobs  
```javascript
// In backend console
embeddingQueue.retryFailedJobs();
```

### Search Embedding Database
```sql
-- In Supabase SQL editor
SELECT * FROM embedded_memories 
WHERE user_id = 'your-user-id' 
ORDER BY metadata->>'indexed_at' DESC 
LIMIT 10;
```

### Check Embedding Quality
```sql  
-- Test semantic similarity
SELECT content, content_type, 
       1 - (embedding <=> 'your_query_embedding') as similarity
FROM embedded_memories 
WHERE user_id = 'your-user-id'
ORDER BY embedding <=> 'your_query_embedding'
LIMIT 5;
```

## 🎯 Success Criteria

- ✅ All content automatically becomes searchable without user action
- ✅ System remains responsive during high embedding load
- ✅ Network failures don't break user experience  
- ✅ Beta testers discover insights through semantic search
- ✅ Maya feels more contextually aware and continuous
- ✅ Search results include both exact matches and semantic connections

## 🚨 Failure Scenarios

### If embedding consistently fails:
1. Check OpenAI API key configuration
2. Verify Supabase `embedded_memories` table exists  
3. Check network connectivity to OpenAI
4. Review rate limiting settings

### If search quality is poor:
1. Verify embedding model consistency (`text-embedding-3-small`)
2. Check content preprocessing (truncation, formatting)
3. Test embedding similarity calculations  
4. Review metadata structure for search context

### If system becomes slow:
1. Monitor queue processing times
2. Check for memory leaks in embedding queue
3. Review database indexing on `embedded_memories`
4. Consider implementing embedding batching

---

🌟 **Result**: Beta testers can naturally discover past insights through semantic search, making Maya feel truly continuous and contextually aware without manual indexing overhead.
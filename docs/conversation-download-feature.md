# 📥 Conversation Download Feature

A complete conversation export system allowing users to download their conversations as whole documents in multiple formats.

## 🎯 **Feature Overview**

**Members can now download their conversations as whole documents in multiple formats:**
- **Markdown (.md)** - Beautiful, readable format with proper formatting
- **JSON (.json)** - Complete data with metadata for developers/analysis
- **Plain Text (.txt)** - Simple, universal format for any device

---

## 🚀 **Quick Implementation**

### **1. Basic Download Button**

```tsx
import ConversationDownloadButton from '@/components/conversation/ConversationDownloadButton';

// Simple download button for current session
<ConversationDownloadButton
  userId="user123"
  sessionId="session456"
  variant="button"
/>
```

### **2. Icon-Only Button** (for toolbars)

```tsx
<ConversationDownloadButton
  userId="user123"
  sessionId="session456"
  variant="icon"
/>
```

### **3. Advanced Options** (full export controls)

```tsx
<ConversationDownloadButton
  userId="user123"
  variant="button"
  showAdvancedOptions={true}
/>
```

---

## 📁 **Export Formats**

### **Markdown Format (.md)**
```markdown
# Conversation Export

**Export Date:** 2025-12-02
**User ID:** user123
**Total Sessions:** 3
**Total Messages:** 28

---

## Session: session_abc123

**Started:** Dec 1, 2025 at 2:30 PM PST
**Last Message:** Dec 1, 2025 at 3:45 PM PST
**Message Count:** 12

### You - Dec 1, 2025 at 2:30 PM PST

I've been thinking about balancing individual growth with community responsibility.

---

### MAIA - Dec 1, 2025 at 2:31 PM PST

That's a beautiful question that touches on a fundamental aspect of human consciousness development...

---
```

### **JSON Format (.json)**
```json
{
  "metadata": {
    "exportDate": "2025-12-02T19:30:00.000Z",
    "userId": "user123",
    "totalSessions": 3,
    "totalMessages": 28,
    "format": "json"
  },
  "sessions": [
    {
      "sessionId": "session_abc123",
      "startTime": "2025-12-01T22:30:00.000Z",
      "endTime": "2025-12-01T23:45:00.000Z",
      "messageCount": 12,
      "messages": [
        {
          "id": "msg_001",
          "role": "user",
          "content": "I've been thinking about balancing individual growth with community responsibility.",
          "timestamp": "2025-12-01T22:30:00.000Z",
          "metadata": {}
        }
      ]
    }
  ]
}
```

### **Plain Text Format (.txt)**
```
CONVERSATION EXPORT
==================

Export Date: 2025-12-02
User ID: user123
Total Sessions: 3
Total Messages: 28

SESSION: session_abc123
--------------------------------------------------
Started: Dec 1, 2025 at 2:30 PM PST
Last Message: Dec 1, 2025 at 3:45 PM PST
Message Count: 12

[Dec 1, 2025 at 2:30 PM PST] YOU:
I've been thinking about balancing individual growth with community responsibility.

[Dec 1, 2025 at 2:31 PM PST] MAIA:
That's a beautiful question that touches on a fundamental aspect of human consciousness development...
```

---

## 🔧 **API Endpoints**

### **GET /api/conversations/export**

**Basic Export:**
```bash
GET /api/conversations/export?userId=user123&format=markdown
```

**Session-Specific:**
```bash
GET /api/conversations/export?userId=user123&sessionId=session456&format=json
```

**With Date Range:**
```bash
GET /api/conversations/export?userId=user123&format=markdown&startDate=2025-12-01&endDate=2025-12-02
```

**With Metadata:**
```bash
GET /api/conversations/export?userId=user123&format=json&includeMetadata=true
```

### **POST /api/conversations/export**

**Advanced Export with Multiple Sessions:**
```json
{
  "userId": "user123",
  "sessionIds": ["session1", "session2", "session3"],
  "format": "markdown",
  "includeMetadata": false,
  "dateRange": {
    "start": "2025-12-01T00:00:00.000Z",
    "end": "2025-12-02T23:59:59.999Z"
  },
  "title": "Weekly Conversations"
}
```

---

## 🎨 **Integration Examples**

### **1. Add to Conversation Header**

```tsx
// In your conversation component
<div className="flex items-center justify-between mb-4">
  <h1>Conversation with MAIA</h1>

  <div className="flex items-center gap-2">
    <ConversationDownloadButton
      userId={userId}
      sessionId={sessionId}
      variant="icon"
    />
    {/* Other header buttons */}
  </div>
</div>
```

### **2. Add to Settings Menu**

```tsx
// In your settings dropdown/drawer
<div className="space-y-2">
  <ConversationDownloadButton
    userId={userId}
    variant="menu-item"
    showAdvancedOptions={true}
  />
  {/* Other menu items */}
</div>
```

### **3. Add to Mobile Bottom Sheet**

```tsx
// In a mobile action sheet
<div className="p-4 space-y-3">
  <ConversationDownloadButton
    userId={userId}
    sessionId={currentSessionId}
    variant="button"
    className="w-full"
  />
</div>
```

---

## ⚙️ **Component Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `string` | Required | User identifier for conversation ownership |
| `sessionId` | `string` | `undefined` | Specific session to download (omit for all conversations) |
| `variant` | `'button' \| 'icon' \| 'menu-item'` | `'button'` | Visual style variant |
| `className` | `string` | `''` | Additional CSS classes |
| `showAdvancedOptions` | `boolean` | `false` | Show format selection and date range options |

---

## 🎯 **Use Cases**

### **📱 Mobile Integration**
- **Quick Download**: Icon button in conversation header
- **Bulk Export**: Settings menu with advanced options
- **Share Conversations**: Export and share insights with friends

### **💻 Desktop Integration**
- **Research**: Download conversations for analysis
- **Backup**: Regular export for personal archives
- **Documentation**: Save important insights and breakthroughs

### **👥 Community Features**
- **Sharing**: Export meaningful conversations to share publicly
- **Collaboration**: Download and share insights with team members
- **Testimonials**: Export powerful conversations for testimonials

---

## 📊 **File Naming Convention**

**Single Session:**
- `conversation-session123-2025-12-02.md`
- `conversation-session123-2025-12-02.json`
- `conversation-session123-2025-12-02.txt`

**All Conversations:**
- `conversations-user123-2025-12-02.md`
- `conversations-user123-2025-12-02.json`
- `conversations-user123-2025-12-02.txt`

**Custom Title:**
- `Weekly-Conversations-2025-12-02.md`
- `Growth-Journey-December-2025-12-02.json`

---

## 🔒 **Security & Privacy**

### **Access Control**
- ✅ Users can only download their own conversations
- ✅ Session-specific permissions enforced
- ✅ No cross-user data exposure possible

### **Data Handling**
- ✅ No server-side storage of exported files
- ✅ Direct download, no intermediate caching
- ✅ Metadata inclusion is optional and user-controlled

### **Privacy Features**
- ✅ Date range filtering for selective export
- ✅ Session-specific downloads
- ✅ Metadata can be excluded for privacy

---

## 🚀 **Feature Status: ✅ FULLY OPERATIONAL**

### **✅ Implemented Components:**

1. **Export API Endpoint** (`/app/api/conversations/export/route.ts`)
   - Multiple format support (Markdown, JSON, Text)
   - Advanced filtering (date range, sessions, metadata)
   - Secure user-scoped access

2. **Download Component** (`/components/conversation/ConversationDownloadButton.tsx`)
   - Multiple visual variants (button, icon, menu-item)
   - Advanced options modal with format selection
   - Real-time download progress and error handling

3. **Format Support**
   - **Markdown**: Beautiful, readable format with proper structure
   - **JSON**: Complete data export with all metadata
   - **Plain Text**: Universal format for any device/platform

### **Ready to Use**
- Import the component and start using immediately
- No additional setup required
- Works with existing conversation storage system
- Compatible with all MAIA conversation interfaces

**Members can now download their conversations as complete, beautiful documents! 📥✨**
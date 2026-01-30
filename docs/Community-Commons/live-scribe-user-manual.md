# Live Scribe: Complete User's Manual

*Your guide to real-time session transcription and clinical documentation*

**Version 1.0** | **Updated:** January 2026 | **For Community Members**

---

## Table of Contents

### **Part I: Overview**
1. [What is Live Scribe?](#what-is-live-scribe)
2. [Chair Perspectives](#chair-perspectives)
3. [Input Modes](#input-modes)

### **Part II: Getting Started**
4. [Quick Start Guide](#quick-start)
5. [Settings & Configuration](#settings)
6. [Audio Requirements](#audio-requirements)

### **Part III: Using Live Scribe**
7. [Live Real-Time Mode](#live-realtime)
8. [Live Post-Session Mode](#live-post-session)
9. [Upload Mode](#upload-mode)
10. [Reviewing Transcripts](#reviewing-transcripts)

### **Part IV: Reference**
11. [Troubleshooting](#troubleshooting)
12. [Privacy & Sovereignty](#privacy)

---

## What is Live Scribe? {#what-is-live-scribe}

Live Scribe is MAIA's session documentation tool designed for practitioners, coaches, therapists, and anyone who needs accurate transcription of spoken sessions. It captures audio, transcribes it locally via Whisper (no cloud processing), and stores the transcript for later review and analysis.

### Key Features

- **Real-time transcription** - See words appear as you speak
- **Local processing** - All audio processed on your own infrastructure (HIPAA-compliant)
- **Chair perspectives** - Document your role in the session
- **Pause/resume** - Handle interruptions gracefully
- **Download transcripts** - Export as text files for your records
- **Session history** - Review past sessions anytime

### Who Is This For?

- **Therapists & Counselors** - Document clinical sessions for supervision
- **Coaches** - Capture breakthrough moments with clients
- **Practitioners** - Record consultations and readings
- **Teams** - Transcribe meetings and peer consultations
- **Solo reflection** - Document your own insights and practices

---

## Chair Perspectives {#chair-perspectives}

Live Scribe uses a "chair" metaphor to describe your role in the session being recorded. This context helps MAIA understand how to process and analyze the content.

### 1st Chair - Solo

You are the only participant. Use this for:
- Personal reflection and journaling
- Solo practice sessions
- Voice notes and memos
- Self-supervision recordings

### 2nd Chair - Witness

You are observing or supporting another's process. Use this for:
- Active listening sessions
- Holding space for someone
- Witness consciousness practices
- Being present without directing

### 3rd Chair - Practitioner

You are facilitating or guiding the session. Use this for:
- Therapy and counseling sessions
- Coaching conversations
- Consultations and readings
- Group facilitation
- Clinical supervision

---

## Input Modes {#input-modes}

Live Scribe offers three distinct ways to get audio into the system:

### Live Real-Time

Best for: Sessions where you want transcription as you go

- Records and transcribes simultaneously
- 5-second chunks sent to Whisper
- See transcript appear in real-time
- Slight delay (2-3 seconds) between speech and text

### Live Post-Session

Best for: When you want to focus entirely on the session

- Records audio only during session
- Transcription happens after you stop
- No distractions during the session
- Full audio sent for processing at end

### Upload

Best for: Pre-recorded audio files

- Upload existing recordings
- Supports WAV, MP3, WebM, M4A, OGG
- Maximum file size: 500MB
- Processing time depends on file length

---

## Quick Start Guide {#quick-start}

### From the MAIA Dashboard

1. Open MAIA at `/maia`
2. Look for the **Scribe** button in the Lab Tools drawer
3. Select your chair perspective (Solo, Witness, or Practitioner)
4. You'll be taken to Live Scribe with your perspective pre-selected

### From Lab Tools Directly

1. Navigate to `/labtools/scribe`
2. Choose your input mode (Live Real-Time, Live Post-Session, or Upload)
3. Select your chair perspective
4. Click **Start Recording** or **Upload Audio**

### Recording Your First Session

1. Select **Live Real-Time** mode
2. Choose **1st Chair (Solo)** for a test
3. Click the **Settings** gear to verify your preferences
4. Click **Start Recording**
5. Speak naturally - watch the transcript appear
6. Click **Stop** when finished
7. Review your transcript below

---

## Settings & Configuration {#settings}

Click the gear icon to access settings:

### Chunk Interval (seconds)

How often audio is sent for transcription during real-time mode.

| Setting | Use Case |
|---------|----------|
| 3s | Fastest feedback, more API calls |
| 5s | **Recommended** - good balance |
| 10s | Fewer calls, longer delay |

### Sample Rate

Audio quality setting. Higher = better quality but larger files.

| Setting | Use Case |
|---------|----------|
| 16000 Hz | **Recommended** - optimized for speech |
| 22050 Hz | Higher quality for detailed capture |
| 44100 Hz | Maximum quality (larger files) |

### Auto-Scroll

When enabled, the transcript view automatically scrolls to show the latest text as it arrives.

---

## Audio Requirements {#audio-requirements}

### Browser Permissions

Live Scribe needs microphone access. When you first start recording:

1. Your browser will ask for microphone permission
2. Click **Allow** to grant access
3. This permission persists for the session

### Supported Browsers

| Browser | Support |
|---------|---------|
| Chrome | Full support |
| Firefox | Full support |
| Safari | Full support |
| Edge | Full support |

### Tips for Best Quality

- Use a headset or external microphone for clearest audio
- Reduce background noise when possible
- Speak at a consistent distance from the microphone
- The built-in noise suppression handles most environments well

---

## Live Real-Time Mode {#live-realtime}

This mode provides transcription as you speak.

### How It Works

1. Audio is captured in chunks (default: 5 seconds)
2. Each chunk is sent to local Whisper for transcription
3. Transcribed text appears in the viewer
4. Process repeats until you stop

### Visual Indicators

- **Audio Level Meter** - Shows your voice volume
- **Duration Timer** - Elapsed recording time
- **Transcript Viewer** - Scrolling text of your session

### Controls

- **Start/Stop** - Begin or end recording
- **Pause/Resume** - Temporarily halt without ending session
- **Download** - Export transcript to text file

### Best Practices

- Wait 2-3 seconds after speaking for text to appear
- The system handles natural pauses well
- Speak clearly but don't over-enunciate
- Review transcript after session for any corrections needed

---

## Live Post-Session Mode {#live-post-session}

This mode records now, transcribes later.

### How It Works

1. Audio is captured and stored locally
2. No transcription during recording
3. When you stop, full audio is sent for processing
4. Transcription completes and appears in viewer

### Why Choose This Mode?

- **Zero distraction** - No text appearing during session
- **Full presence** - Focus entirely on the person or process
- **Complete audio** - Better context for Whisper with full recording
- **Slightly faster** - No chunk-by-chunk processing overhead

### After Recording

When you click Stop:
1. Audio is uploaded to local Whisper
2. Processing time depends on length
3. Full transcript appears when ready
4. Download available immediately after

---

## Upload Mode {#upload-mode}

For pre-recorded audio files.

### Supported Formats

- WAV (audio/wav)
- MP3 (audio/mp3, audio/mpeg)
- WebM (audio/webm)
- OGG (audio/ogg)
- M4A (audio/m4a, audio/mp4)

### File Limits

- Maximum size: 500MB
- Longer files take more processing time
- Very long recordings may be chunked automatically

### How to Upload

1. Select **Upload** tab
2. Click **Choose File** or drag and drop
3. File info displays (name, size, type)
4. Click **Upload & Transcribe**
5. Wait for processing to complete
6. Review transcript in viewer

---

## Reviewing Transcripts {#reviewing-transcripts}

### During Session

The transcript viewer shows:
- **Speaker labels** when detected
- **Timestamps** for each segment
- **Confidence indicators** (when available)

### After Session

- **Download** - Click to save as `.txt` file
- **View Session** - Access from session history
- **Session ID** - Unique identifier for records

### Session History

All sessions are stored in your local database:
- Navigate to session list
- Filter by date, type, or chair perspective
- Click any session to review full transcript
- Sessions remain until you delete them

---

## Troubleshooting {#troubleshooting}

### "Microphone permission denied"

1. Click the lock/info icon in your browser's address bar
2. Find microphone permissions
3. Change to "Allow"
4. Refresh the page

### "No speech detected"

- Check your microphone is working
- Speak louder or closer to the mic
- Check the audio level meter shows activity
- Try a different browser

### "Transcription service unavailable"

The local Whisper service may not be running:
1. Check that `maia-whisper` container is running
2. Verify Whisper URL in environment settings
3. Contact your administrator if self-hosted

### Transcript seems inaccurate

- Whisper works best with clear speech
- Background noise affects accuracy
- Accents may need adjustment period
- Very quiet or mumbled speech is harder to transcribe

### Session won't start

- Ensure you have an active session in the database
- Check browser console for error messages
- Verify API routes are responding
- Clear browser cache and retry

---

## Privacy & Sovereignty {#privacy}

### Local Processing

Live Scribe is designed with sovereignty in mind:

- **No cloud transcription** - All audio processed by local Whisper
- **Local storage** - Sessions stored in your PostgreSQL database
- **No data leaves your infrastructure** - HIPAA-compliant architecture
- **You control deletion** - Remove sessions whenever you choose

### Data Flow

```
Microphone → Browser → Local API → Whisper Container → Database
```

At no point does audio or transcript leave your server.

### Consent

For sessions with clients:
- Inform them that recording is taking place
- Obtain appropriate consent per your jurisdiction
- Explain how recordings will be used and stored
- Honor requests for deletion

### Clinical Use

For therapists and clinical practitioners:
- Suitable for supervision review
- Can be included in case documentation
- Meets requirements for local-only storage
- Consult your licensing board for specific requirements

---

## Quick Reference

### Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Start/Stop Recording | `Space` (when focused) |
| Download Transcript | `Ctrl/Cmd + D` |

### Status Colors

| Color | Meaning |
|-------|---------|
| Green pulse | Recording active |
| Orange | Paused |
| Gray | Idle |

### Mode Selection

| Need | Choose |
|------|--------|
| Real-time feedback | Live Real-Time |
| Full presence | Live Post-Session |
| Existing file | Upload |

---

*Live Scribe is part of MAIA's Lab Tools suite. For questions or support, consult the Community Commons or reach out to your MAIA administrator.*

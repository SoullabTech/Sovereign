# MAIA Voice Setup Guide

## Quick Start (One Command!)

```bash
npm run dev:voice
```

That's it! The script will:
1. Start the Next.js dev server
2. Create a secure HTTPS tunnel with real SSL certificate
3. Display a public HTTPS URL that works on ALL devices

## What You'll See

```
🎤 Starting MAIA with Voice Support...

Stopping existing servers...
Starting Next.js dev server on port 3000...
Waiting for Next.js to initialize...
Creating secure HTTPS tunnel...

✅ MAIA Voice Server Running!

🌐 Secure HTTPS URL (works on ALL devices):
   https://your-unique-url.loca.lt

📱 iPhone: Open the URL above in Safari
💻 Desktop: Open the URL above in any browser
🔒 Local: http://localhost:3000 (no voice)

✨ NO security warnings - real HTTPS certificate!
🎤 Just grant microphone permission when prompted
```

## For Testers

Just send testers the HTTPS URL (like `https://your-unique-url.loca.lt`). They can:
- Open it on iPhone, Android, desktop - anywhere
- No security warnings to accept
- No certificates to install
- No complicated setup
- Just click "Allow" when Safari asks for microphone permission

## How It Works

We use **localtunnel** to create a secure tunnel from your local dev server to a public HTTPS URL:

```
Your Computer (localhost:3000)
    ↓
localtunnel creates secure tunnel
    ↓
Public HTTPS URL with real SSL certificate
    ↓
Works on iPhone/Android/Desktop
```

## Why This Works for Voice

Safari on iPhone requires HTTPS for microphone access (getUserMedia API). This solution provides:
- Real HTTPS with trusted SSL certificate
- No browser security warnings
- Works on all devices
- Simple one-command startup
- No ngrok authentication needed

## Alternative: Local Network Only

If you don't need the public URL, you can run the regular dev server:

```bash
npm run dev
```

Then access on local network:
- Desktop: `http://localhost:3000`
- iPhone (same WiFi): `http://192.168.4.210:3000`

**Note:** Voice features won't work on iPhone without HTTPS, so use `npm run dev:voice` for voice testing.

## Troubleshooting

**Q: The tunnel URL changed!**
A: localtunnel generates a new random URL each time you start. This is normal.

**Q: Microphone still not working?**
A: Make sure you're using the HTTPS URL (https://...), not the HTTP one.

**Q: Can I get a fixed URL?**
A: You can use `lt --port 3000 --subdomain your-name` but this requires a paid localtunnel subscription. For free use, the URL changes each time.

## For Production

For production deployment, use a real domain with automatic HTTPS:
- Vercel (automatic HTTPS)
- Netlify (automatic HTTPS)
- Cloudflare Pages (automatic HTTPS)
- Custom domain with Let's Encrypt

These provide permanent HTTPS URLs without tunnels.

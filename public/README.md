# MAIA Sovereign - Logo and Icon Assets

This directory contains all logo and icon assets for the MAIA Sovereign application across different platforms and use cases.

## 🌀 Main Logo Files

| File | Size | Purpose |
|------|------|---------|
| `maia-spiral-logo.png` | 228KB | Primary spiral logo for general use |
| `maia-spiral-logo-alt.png` | 382KB | ⚠️ Legacy — same art as below, but with an **opaque white background baked in**. Do not use on dark surfaces. |
| `holoflower-studio-transparent.png` | — | **Canonical transparent dark-surface holoflower** (spiral-of-dots, true alpha). Use this for any dark room/studio surface. |

### Holoflower asset provenance

Two files carry the identical spiral-of-dots artwork and are easy to confuse:

- `holoflower-studio-transparent.png` = canonical transparent dark-surface asset.
- `maia-spiral-logo-alt.png` = legacy asset with baked white background (its alpha
  channel exists but every background pixel is opaque white). On a dark ground it
  renders as a floating white square — this regression has shipped before
  (flagged 2026-07-19 on `/maia/vision-studio`). Do not use it on dark surfaces,
  and do not use it as a CSS mask (the opaque background masks the full square).

The artwork itself is a fixed brand asset: reference it, tint it, animate it —
never redraw it in code. See `components/maia/vision-studio/RoomHoloflower.tsx`.

## 🖥️ Web Browser Icons

| File | Size | Dimensions | Purpose |
|------|------|------------|---------|
| `favicon.ico` | 3KB | 32×32 | Classic browser favicon |
| `icon-16x16.png` | 2KB | 16×16 | Small browser favicon |
| `icon-32x32.png` | 3KB | 32×32 | Standard browser favicon |

## 📱 Progressive Web App (PWA) Icons

| File | Size | Dimensions | Purpose |
|------|------|------------|---------|
| `icon-192x192.png` | 52KB | 192×192 | PWA icon for app drawer |
| `icon-512x512.png` | 180KB | 512×512 | PWA icon for splash screen |

## 🍎 Mobile Platform Icons

| File | Size | Dimensions | Purpose |
|------|------|------------|---------|
| `apple-touch-icon.png` | 47KB | 180×180 | iOS home screen icon |

## 🔧 Usage Instructions

### Web Application (Next.js)
Add to your `app/layout.tsx` or `pages/_document.tsx`:

```html
<link rel="icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### PWA Manifest
Reference in your `manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Mobile Applications
- **iOS**: Use `apple-touch-icon.png` (180×180)
- **Android**: Use `icon-192x192.png` and `icon-512x512.png`

## 📝 Notes

- All icons were generated from the main spiral logo using ImageMagick
- Files maintain transparency where applicable
- Optimized for web delivery while preserving visual quality
- Compatible with modern browsers and mobile platforms

---

Generated on: December 3, 2024
Source: `/Volumes/LaCie/Soullab Images/Soullab Logo/Logos/Favicons-3/`
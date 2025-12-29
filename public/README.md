# MAIA Sovereign - Logo and Icon Assets

This directory contains all logo and icon assets for the MAIA Sovereign application across different platforms and use cases.

## 🌀 Main Logo Files

| File | Size | Purpose |
|------|------|---------|
| `maia-spiral-logo.png` | 228KB | Primary spiral logo for general use |
| `maia-spiral-logo-alt.png` | 382KB | Alternative version of spiral logo |

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
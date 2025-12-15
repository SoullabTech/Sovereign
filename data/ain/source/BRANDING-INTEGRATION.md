# 🌸 Sacred Portal Branding Integration Guide

## Logo Placement Specifications

### Whitepaper Integration

#### Header/Cover Page
```css
.logo-header {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  opacity: 1.0;
}
```

#### Watermark (Each Page)
```css
.logo-watermark {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  opacity: 0.1;
  z-index: -1;
}
```

#### Section Dividers
```css
.logo-divider {
  width: 40px;
  height: 40px;
  margin: 40px auto;
  opacity: 0.3;
}
```

### Storyboard Integration

#### Frame Headers
- Size: 80x80px
- Position: Top-left corner
- Opacity: 0.8

#### Transition Markers
- Size: 40x40px
- Position: Between frames
- Animation: Gentle pulse

### Color Schemes

#### Light Mode
```css
:root {
  --primary-gold: #FFD700;
  --sacred-purple: #8B008B;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --background: #FFFFFF;
  --accent: #F5F5F5;
}
```

#### Dark Mode
```css
:root {
  --primary-gold: #FFD700;
  --sacred-purple: #DDA0DD;
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --background: #0A0A0A;
  --accent: #1A1A1A;
}
```

## Logo File Structure

Place your logo files here:
```
/docs/assets/
├── logo/
│   ├── holoflower-logo.svg          # Primary vector
│   ├── holoflower-logo-light.png    # Light mode (1024x1024)
│   ├── holoflower-logo-dark.png     # Dark mode (1024x1024)
│   ├── holoflower-icon.svg          # Icon only
│   └── holoflower-watermark.png     # Low opacity version
```

## Integration Commands

### Convert SVG to PNG (if needed)
```bash
# Using ImageMagick
convert -background transparent -size 1024x1024 holoflower-logo.svg holoflower-logo.png

# Create watermark version
convert holoflower-logo.png -alpha set -channel A -evaluate set 10% holoflower-watermark.png
```

### Generate Favicon Set
```bash
# Multiple sizes for different devices
convert holoflower-icon.png -resize 16x16 favicon-16.png
convert holoflower-icon.png -resize 32x32 favicon-32.png
convert holoflower-icon.png -resize 192x192 favicon-192.png
```

## React Component Integration

```tsx
// components/BrandedLogo.tsx
export function BrandedLogo({ 
  variant = 'header',
  theme = 'light' 
}: {
  variant?: 'header' | 'watermark' | 'divider' | 'icon';
  theme?: 'light' | 'dark';
}) {
  const sizes = {
    header: 'w-30 h-30',
    watermark: 'w-15 h-15 opacity-10',
    divider: 'w-10 h-10 opacity-30',
    icon: 'w-8 h-8'
  };

  return (
    <img 
      src={`/assets/logo/holoflower-logo-${theme}.png`}
      alt="Sacred Portal"
      className={sizes[variant]}
    />
  );
}
```

## Whitepaper CSS Template

```css
/* Branded Whitepaper Styles */
@media print {
  .page {
    position: relative;
    page-break-after: always;
  }
  
  .page::after {
    content: "";
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background-image: url('/assets/logo/holoflower-watermark.png');
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.1;
  }
}

/* Digital Version */
.whitepaper-container {
  position: relative;
}

.whitepaper-container::before {
  content: "";
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 80px;
  height: 80px;
  background-image: url('/assets/logo/holoflower-logo.svg');
  background-size: contain;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
```

## Storyboard Frame Template

```html
<!-- Storyboard Frame with Branding -->
<div class="storyboard-frame">
  <div class="frame-header">
    <img src="/assets/logo/holoflower-icon.svg" class="frame-logo" />
    <h3>Voice Input Phase</h3>
  </div>
  
  <div class="frame-content">
    <!-- Storyboard illustration -->
  </div>
  
  <div class="frame-footer">
    <span class="frame-number">01</span>
    <span class="frame-transition">→</span>
  </div>
</div>
```

## Brand Guidelines

### Logo Usage
- **Minimum Size**: 32x32px digital, 0.5" print
- **Clear Space**: Maintain padding equal to 25% of logo width
- **Backgrounds**: Use light version on dark, dark version on light
- **Don't**: Stretch, rotate, or apply effects

### Typography Pairing
```css
.brand-typography {
  --heading-font: 'Crimson Text', 'Georgia', serif;
  --body-font: 'Inter', 'Helvetica Neue', sans-serif;
  --sacred-font: 'Cinzel', 'Palatino', serif;
}
```

### Sacred Color Palette
- **Primary Gold**: #FFD700 (Illumination)
- **Sacred Purple**: #8B008B (Mystery)
- **Elemental Blue**: #4ECDC4 (Water)
- **Grounding Brown**: #8B4513 (Earth)
- **Transcendent White**: #F5F5F5 (Aether)

## Export Settings

### PDF Generation
```javascript
// For branded PDF export
const pdfOptions = {
  format: 'A4',
  margin: { top: 80, bottom: 80, left: 60, right: 60 },
  displayHeaderFooter: true,
  headerTemplate: '<img src="logo.svg" style="width: 40px; margin: 20px auto;">',
  footerTemplate: '<div style="font-size: 10px; text-align: center;">Page <span class="pageNumber"></span></div>'
};
```

### Social Media Templates
- **Twitter/X Card**: 1200x675px with logo at 120x120px
- **LinkedIn Feature**: 1200x627px with logo at 100x100px
- **Instagram Square**: 1080x1080px with centered 200x200px logo
- **GitHub Social**: 1280x640px with logo at 80x80px

---

## Quick Integration Checklist

- [ ] Upload SVG logo to `/docs/assets/logo/`
- [ ] Generate PNG versions (light/dark)
- [ ] Create watermark version (10% opacity)
- [ ] Add to whitepaper cover
- [ ] Apply watermark to all pages
- [ ] Add to storyboard frames
- [ ] Generate favicon set
- [ ] Update OG meta tags
- [ ] Test print CSS
- [ ] Verify dark mode contrast

---

Once you place your logo files in the specified directory, all templates will automatically pick them up and apply the branding consistently across the whitepaper and storyboard.
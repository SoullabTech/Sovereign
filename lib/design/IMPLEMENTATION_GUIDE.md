# Typography Refresh - Implementation Guide

## Quick Start (5 Minutes)

### Step 1: Add the CSS

Add to `app/layout.tsx` or your global layout:

```tsx
import '@/styles/typography-refresh.css';
```

That's it! The typography system is now active.

### Step 2: Add Data Attributes to Messages

In your message components (e.g., `OracleConversation.tsx`), add role attributes:

```tsx
<div className="message-user" data-role="user">
  {userMessage}
</div>

<div className="message-maia" data-role="assistant">
  {maiaResponse}
</div>
```

### Step 3: Remove Conflicting Styles

If you have existing box styles, they should be overridden by `!important` in the CSS.
But for cleaner code, remove these from components:

```tsx
// Remove these classes:
className="bg-blue-500/10"          ← Remove background
className="border border-gold/30"   ← Remove border
className="p-4"                      ← Remove padding
className="rounded-lg"               ← Remove if box-like
```

---

## Full Integration

### 1. Update Message Components

**Before:**
```tsx
<div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 my-2">
  <p className="text-white">{message.text}</p>
</div>
```

**After:**
```tsx
<div
  className={message.role === 'user' ? 'message-user' : 'message-maia'}
  data-role={message.role}
>
  <p>{message.text}</p>
</div>
```

### 2. Enable Font Switching (Optional)

Add to user settings:

```tsx
function FontPreferen ceToggle() {
  const [font, setFont] = useState('auto');

  useEffect(() => {
    document.documentElement.setAttribute('data-maia-font', font);
  }, [font]);

  return (
    <select value={font} onChange={(e) => setFont(e.target.value)}>
      <option value="auto">Adaptive (Recommended)</option>
      <option value="serif">Always Serif (Literary)</option>
      <option value="sans">Always Sans (Clean)</option>
    </select>
  );
}
```

### 3. Adaptive Typography Hook

For dynamic font selection based on message content:

```tsx
import { useAdaptiveTypography } from '@/lib/design/adaptive-typography';

function MaiaMessage({ text }) {
  const { getFontForMessage, getLineHeight } = useAdaptiveTypography();

  return (
    <div
      className="message-maia"
      style={{
        fontFamily: getFontForMessage(text, text.includes('```')),
        lineHeight: getLineHeight(text)
      }}
    >
      {text}
    </div>
  );
}
```

---

## Testing Checklist

### Visual QA

- [ ] User messages use Inter font
- [ ] MAIA messages use Source Sans 3 (mobile) or Crimson Pro (desktop)
- [ ] No background boxes on messages
- [ ] No borders around messages
- [ ] Generous spacing between messages
- [ ] Text max-width is 65ch on desktop
- [ ] Text is full-width on mobile with side padding

### Responsive Testing

- [ ] Mobile (< 768px): Sans font, tighter spacing
- [ ] Tablet (768-1024px): Serif available, medium spacing
- [ ] Desktop (> 1024px): Serif default, generous spacing
- [ ] Font sizes scale smoothly
- [ ] No horizontal overflow

### Content Testing

- [ ] Short messages (< 100 chars) look good
- [ ] Long messages (> 300 chars) are comfortable to read
- [ ] Code blocks use monospace font
- [ ] Markdown (bold, italic) renders beautifully
- [ ] Lists are properly indented
- [ ] Links are clearly visible

### Accessibility

- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Respects prefers-reduced-motion
- [ ] Respects prefers-contrast
- [ ] Font sizes zoom correctly
- [ ] Screen readers work (semantic HTML maintained)

---

## Performance Notes

### Font Loading

Fonts are loaded via Google Fonts with `display=swap`:
- Inter: ~30KB
- Source Sans 3: ~28KB
- Crimson Pro: ~32KB

Total: ~90KB (one-time download, then cached)

### Optimization

```tsx
// Preload critical fonts in <head>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" as="style" />
```

### Fallback

If fonts fail to load, system fonts are used:
- User: System sans-serif
- MAIA: System serif (Georgia, etc.)

---

## Troubleshooting

### "Fonts look the same"

1. Check browser DevTools → Elements → Computed styles
2. Verify `font-family` shows Inter/Source Sans/Crimson Pro
3. Clear cache and hard reload
4. Check for CSS specificity conflicts

### "Boxes still visible"

1. Check if other CSS has higher specificity
2. Ensure `typography-refresh.css` is imported AFTER other styles
3. Use `!important` is already in the CSS - should override

### "Text too small on mobile"

1. Check viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
2. Verify `clamp()` is supported (should be in all modern browsers)
3. Test minimum font size: `clamp(1rem, ...)` = 16px minimum

### "Serif font looks heavy in long conversations"

1. Switch to `data-maia-font="sans"` for testing
2. Consider adaptive logic (serif for long messages only)
3. Mobile users automatically get sans (lighter)

---

## Migration Path

### Phase 1: Soft Launch (This Weekend)
- Add CSS file
- Test on development
- A/B test with 10% of users

### Phase 2: Refinement (Next Week)
- Gather feedback on serif vs sans preference
- Adjust spacing based on mobile testing
- Add font preference toggle to settings

### Phase 3: Full Rollout (Week 2)
- Deploy to all users
- Monitor metrics (time-on-page, return rate)
- Iterate based on data

---

## Metrics to Watch

### Positive Indicators
- ↑ Average session duration
- ↑ Messages per conversation
- ↑ Return user rate
- ↑ Qualitative feedback ("feels warmer", "easier to read")

### Watch For
- ↓ Mobile engagement (if fonts too large/heavy)
- ↑ Bounce rate (if change is jarring)
- Font loading issues (slow 3G)

---

## Rollback Plan

If anything goes wrong:

1. Remove import from layout:
   ```tsx
   // import '@/styles/typography-refresh.css'; // Temporarily disabled
   ```

2. Or override with emergency CSS:
   ```css
   .message-user,
   .message-maia {
     font-family: inherit !important;
     background: var(--original-bg) !important;
     /* etc */
   }
   ```

3. Revert commit:
   ```bash
   git revert <commit-hash>
   ```

---

## Next Steps After Typography

Once typography is stable:

1. **Add Seasonal Palettes** (Phase 2)
   - Implement color system
   - Add palette switcher
   - Sync with holoflower colors

2. **Spatial Refinement** (Phase 3)
   - Increase margins
   - Polish animations
   - Add subtle textures

3. **Advanced Features**
   - Time-of-day themes
   - Reading mode toggle
   - Custom user palettes

---

## Questions?

Check the design files:
- `lib/design/typography-system.ts` - System documentation
- `lib/design/adaptive-typography.ts` - Context-aware logic
- `lib/design/AESTHETIC_PROPOSAL.md` - Full vision

Or test live:
- Desktop: Should see Crimson Pro serif (literary feel)
- Mobile: Should see Source Sans 3 (lighter, easier scanning)
- Both: No boxes, generous breathing room

The typography is alive. It just needs to breathe. 🌿

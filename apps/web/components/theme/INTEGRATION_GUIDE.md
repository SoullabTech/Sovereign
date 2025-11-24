# Theme System Integration Guide

## 🎨 Complete Theme Persistence Setup

### 1. Database Setup

Run this SQL in your Supabase dashboard:

```sql
-- Add theme preference column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT 
DEFAULT 'system' 
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_theme 
ON profiles(id, theme_preference);
```

### 2. Add Theme Toggle to Your App

#### In Header/Navbar (Minimal Version)

```tsx
import { ThemeToggleMinimal } from '@/components/theme/ThemeToggle'

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <Logo />
      <nav>...</nav>
      <ThemeToggleMinimal />
    </header>
  )
}
```

#### In Settings Page (Full Version)

```tsx
import ThemeToggle from '@/components/theme/ThemeToggle'

export function SettingsPage() {
  return (
    <div>
      <h2>Appearance</h2>
      <ThemeToggle />
    </div>
  )
}
```

### 3. Use in Mirror/Chat Interface

```tsx
import { ThemeToggleMinimal } from '@/components/theme/ThemeToggle'

export function SacredMirror() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggleMinimal />
      </div>
      {/* Your chat interface */}
    </div>
  )
}
```

### 4. Dashboard Integration

The dashboards automatically respect the theme:

```tsx
// Theme-aware colors are already built in
import { soullabColors } from '@/lib/theme/soullabColors'

// Components auto-adapt based on user preference
<ReflectionsDashboard />
<AudioUnlockTrend />
```

## 🔑 Features

✅ **Cross-session persistence** - Theme preference saved to Supabase
✅ **Cross-device sync** - Same theme on all devices when logged in
✅ **Anonymous support** - Falls back to localStorage for non-authenticated users
✅ **System default** - Respects OS dark/light mode when set to "system"
✅ **Smooth transitions** - Animated theme switches with Framer Motion
✅ **Accessibility** - Full keyboard navigation and ARIA labels

## 🎯 User Experience

1. **First visit** → Defaults to system theme
2. **User selects theme** → Instantly applied + saved
3. **Next visit** → Theme restored automatically
4. **Different device** → Same theme preference loaded
5. **Logout** → Theme persists in localStorage

## 🚀 Testing

```bash
# Test theme persistence
1. Open app → Should default to system theme
2. Click sun icon → Switch to light mode
3. Refresh page → Should remain in light mode
4. Open incognito → Should see saved preference (if logged in)
5. Toggle to dark → Should save and persist
```

## 📊 Analytics Integration

Track theme preferences in your analytics:

```tsx
import { trackEvent } from '@/lib/analytics/eventTracking'

// In ThemeToggle component
const handleThemeChange = async (newTheme) => {
  // ... existing code
  
  trackEvent('theme_changed', {
    from: theme,
    to: newTheme,
    user_id: user?.id,
    timestamp: new Date().toISOString()
  })
}
```

This helps you understand:
- Most popular theme choice
- Theme switching patterns
- Correlation with engagement metrics
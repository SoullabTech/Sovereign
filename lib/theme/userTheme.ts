import { createClientComponentClient } from '@/lib/supabase'

export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * Get user's saved theme preference from Supabase
 */
export async function getUserTheme(userId: string): Promise<ThemePreference> {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('theme_preference')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.warn('Failed to fetch theme preference:', error)
      return 'system'
    }
    
    return (data?.theme_preference as ThemePreference) || 'system'
  } catch (err) {
    console.error('Error fetching user theme:', err)
    return 'system'
  }
}

/**
 * Save user&apos;s theme preference to Supabase
 */
export async function saveUserTheme(userId: string, theme: ThemePreference): Promise<boolean> {
  try {
    const supabase = createClientComponentClient()
    const { error } = await supabase
      .from('profiles')
      .update({ theme_preference: theme })
      .eq('id', userId)
    
    if (error) {
      console.error('Failed to save theme preference:', error)
      return false
    }
    
    // Also save to localStorage as immediate fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('soullab-theme', theme)
    }
    
    return true
  } catch (err) {
    console.error('Error saving user theme:', err)
    return false
  }
}

/**
 * Get theme from localStorage (for non-authenticated users)
 */
export function getLocalTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  
  const stored = localStorage.getItem('soullab-theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

/**
 * Initialize theme on app load
 */
export async function initializeTheme(userId?: string): Promise<ThemePreference> {
  if (userId) {
    // Authenticated user - fetch from Supabase
    const dbTheme = await getUserTheme(userId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('soullab-theme', dbTheme)
    }
    return dbTheme
  } else {
    // Anonymous user - use localStorage
    return getLocalTheme()
  }
}
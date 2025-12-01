import ThemePreferenceWidget from '@/components/dashboard/ThemePreferenceWidget'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Analytics | Soullab',
  description: 'User theme preferences and usage patterns'
}

export default function ThemeAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900 dark:text-gray-100">
            Theme Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Understanding user preferences for light, dark, and system themes
          </p>
        </div>
        
        <ThemePreferenceWidget />
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Data updates every 5 minutes</p>
        </div>
      </div>
    </div>
  )
}
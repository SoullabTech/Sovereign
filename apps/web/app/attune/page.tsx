import AttunePanel from '@/components/onboarding/AttunePanel'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Attune | Soullab',
  description: 'Customize your voice, style, and theme preferences'
}

export default function AttunePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <AttunePanel showPreview={true} />
    </div>
  )
}
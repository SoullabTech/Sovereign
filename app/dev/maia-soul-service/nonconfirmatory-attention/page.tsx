import { notFound } from 'next/navigation'
import { NonconfirmatoryAttentionWitnessClient } from './NonconfirmatoryAttentionWitnessClient'

export default function NonconfirmatoryAttentionWitnessPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-[#e8dccb] px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <NonconfirmatoryAttentionWitnessClient />
      </div>
    </main>
  )
}

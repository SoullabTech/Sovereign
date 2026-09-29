import { notFound } from 'next/navigation'
import { TruthfulReturnWitnessClient } from './TruthfulReturnWitnessClient'

export default function TruthfulReturnWitnessPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-[#e8dccb] px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <TruthfulReturnWitnessClient />
      </div>
    </main>
  )
}

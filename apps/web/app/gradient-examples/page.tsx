import GradientExamples from '@/components/demo/GradientExamples'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gradient Examples | Soullab Design System',
  description: 'Live examples of Soullab gradients in real UI components'
}

export default function GradientExamplesPage() {
  return <GradientExamples />
}
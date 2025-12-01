import ReflectionsDashboard from '@/components/dashboard/ReflectionsDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reflections Dashboard | Soullab',
  description: 'Beta user feedback and engagement insights'
}

export default function ReflectionsPage() {
  return <ReflectionsDashboard />
}
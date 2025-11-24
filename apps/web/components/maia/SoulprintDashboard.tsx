import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Flame, Droplet, Leaf, Wind } from 'lucide-react'
import { ToneMetricsHeatmap } from './ToneMetricsHeatmap'
import { ToneMetricsTrend } from './ToneMetricsTrend'

export default function SoulprintDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/soulprint?userId=${userId}&mode=symbolic`)
      const json = await res.json()
      setData(json)
    }
    fetchData()
  }, [userId])

  if (!data) return <div className="text-center text-sm text-muted">Loading soulprint...</div>

  const iconMap: Record<string, React.ReactNode> = {
    fire: <Flame className="text-red-500" />,
    water: <Droplet className="text-blue-400" />,
    earth: <Leaf className="text-green-600" />,
    air: <Wind className="text-purple-400" />,
    aether: <Sparkles className="text-yellow-500" />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 p-4">
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Elemental Balance</h2>
          {Object.entries(data.elementalBalance).map(([element, percent]: any) => (
            <div key={element} className="flex items-center gap-2 my-2">
              {iconMap[element as keyof typeof iconMap]}
              <div className="w-full">
                <div className="text-sm capitalize">{element}</div>
                <Progress value={percent} className="h-2" />
              </div>
              <span className="text-sm font-medium">{percent}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Current Archetype</h2>
          <Badge className="text-base px-4 py-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">
            {data.currentArchetype || 'Unknown'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Spiral Phases</h2>
          <div className="flex flex-wrap gap-2">
            {data.recentPhases?.map((phase: string) => (
              <Badge key={phase} variant="outline">{phase}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Symbols</h2>
          <div className="flex flex-wrap gap-2">
            {data.recentSymbols?.map((symbol: string) => (
              <Badge key={symbol} className="bg-muted text-sm">{symbol}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <ToneMetricsHeatmap />
      <ToneMetricsTrend />
    </div>
  )
}
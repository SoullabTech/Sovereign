import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, Crown } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-xl border-amber-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4 opacity-60">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="text-6xl font-bold text-amber-400 mb-2">404</div>
          <CardTitle className="text-xl font-semibold">Path Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This wisdom path doesn&apos;t exist in our oracle system. Let&apos;s guide you back to familiar territory.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            <Link
              href="/oracle"
              className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Oracle Chat
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-500/20">
            <p className="text-xs text-muted-foreground">
              Need help? Try our <Link href="/oracle" className="text-amber-400 hover:text-amber-300">oracle chat</Link> for guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
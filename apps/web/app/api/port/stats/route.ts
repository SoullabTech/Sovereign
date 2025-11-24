import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'logs', 'port-history.jsonl')

export async function GET(request: NextRequest) {
  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({
        totalRuns: 0,
        conflictCount: 0,
        conflictRate: '0',
        portUsage: {},
        topBlockers: [],
        recentEntries: []
      })
    }

    // Read and parse log file
    const lines = fs.readFileSync(LOG_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim())
    
    const entries = lines.map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    }).filter(entry => entry !== null)

    // Calculate statistics
    const portUsage: Record<number, number> = {}
    const blockerCounts: Record<string, number> = {}
    let conflictCount = 0

    entries.forEach(entry => {
      // Count port usage
      portUsage[entry.actual] = (portUsage[entry.actual] || 0) + 1
      
      // Count conflicts and blockers
      if (entry.requested !== entry.actual) {
        conflictCount++
        if (entry.process) {
          blockerCounts[entry.process] = (blockerCounts[entry.process] || 0) + 1
        }
      }
    })

    // Sort blockers by count
    const topBlockers = Object.entries(blockerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Get recent entries
    const recentEntries = entries.slice(-10).reverse()

    const stats = {
      totalRuns: entries.length,
      conflictCount,
      conflictRate: entries.length > 0 
        ? (conflictCount / entries.length * 100).toFixed(1) 
        : '0',
      portUsage,
      topBlockers,
      recentEntries
    }

    // Check if we should send alerts
    if (conflictCount > 5 && parseFloat(stats.conflictRate) > 50) {
      // Get most recent conflict
      const recentConflict = entries
        .filter(e => e.requested !== e.actual)
        .pop()
      
      if (recentConflict) {
        // Send alert for frequent conflicts
        fetch('http://localhost:3000/api/port/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'frequent_conflicts',
            port: recentConflict.requested,
            conflictRate: parseFloat(stats.conflictRate),
            suggestion: `Consider changing default port from ${recentConflict.requested} to ${Object.entries(portUsage).sort((a, b) => b[1] - a[1])[0][0]}`
          })
        }).catch(() => {})
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to read port stats:', error)
    return NextResponse.json({ error: 'Failed to read stats' }, { status: 500 })
  }
}
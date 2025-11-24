import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
interface PortAlert {
  type: 'conflict' | 'frequent_conflicts' | 'recommendation'
  port: number
  blockedBy?: string
  pid?: number
  suggestion?: string
  conflictRate?: number
}

export async function POST(request: NextRequest) {
  try {
    const alert: PortAlert = await request.json()
    
    // Log the alert
    
    // Send to Slack if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      const emoji = alert.type === 'conflict' ? '⚠️' : 
                    alert.type === 'frequent_conflicts' ? '🔥' : '💡'
      
      const color = alert.type === 'conflict' ? '#ff9900' :
                    alert.type === 'frequent_conflicts' ? '#ff0000' : '#0099ff'
      
      const slackPayload = {
        username: 'Maya Port Monitor',
        icon_emoji: ':computer:',
        attachments: [{
          color,
          title: `${emoji} Port Alert - ${alert.type.toUpperCase()}`,
          fields: [
            {
              title: 'Port',
              value: alert.port.toString(),
              short: true
            },
            ...(alert.blockedBy ? [{
              title: 'Blocked By',
              value: `${alert.blockedBy} (PID: ${alert.pid})`,
              short: true
            }] : []),
            ...(alert.conflictRate ? [{
              title: 'Conflict Rate',
              value: `${alert.conflictRate}%`,
              short: true
            }] : []),
            ...(alert.suggestion ? [{
              title: 'Suggestion',
              value: alert.suggestion,
              short: false
            }] : [])
          ],
          footer: 'Maya Backend',
          ts: Math.floor(Date.now() / 1000)
        }]
      }
      
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload)
        })
      } catch (error) {
        console.error('Failed to send Slack alert:', error)
      }
    }
    
    return NextResponse.json({ success: true, alert })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 })
  }
}

// Get port alert configuration
export async function GET() {
  return NextResponse.json({
    alerting: {
      slack: !!process.env.SLACK_WEBHOOK_URL,
      email: !!process.env.EMAIL_WEBHOOK_URL
    },
    monitoring: {
      enabled: true,
      conflictThreshold: 5, // Alert after 5 conflicts
      windowHours: 24 // Look at last 24 hours
    }
  })
}
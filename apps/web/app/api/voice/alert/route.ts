import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
interface AlertRequest {
  type: 'fallback' | 'failure' | 'recovery'
  engine: 'sesame' | 'elevenlabs'
  message: string
  details?: any
  timestamp?: Date
}

// Simple rate limiting to prevent spam
const alertHistory = new Map<string, number>()
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes
const MAX_ALERTS_PER_WINDOW = 3

async function sendSlackAlert(alert: AlertRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return false

  const now = Date.now()
  const alertKey = `${alert.type}-${alert.engine}`
  const lastAlert = alertHistory.get(alertKey) || 0
  
  // Rate limiting
  if (now - lastAlert < RATE_LIMIT_WINDOW) {
    return false
  }

  alertHistory.set(alertKey, now)

  const color = alert.type === 'failure' ? '#ff4444' : 
                alert.type === 'fallback' ? '#ffaa00' : '#44ff44'

  const emoji = alert.type === 'failure' ? '🚨' : 
                alert.type === 'fallback' ? '⚠️' : '✅'

  const payload = {
    username: 'Maya Voice Monitor',
    icon_emoji: ':robot_face:',
    attachments: [{
      color,
      title: `${emoji} Maya Voice Alert - ${alert.type.toUpperCase()}`,
      text: alert.message,
      fields: [
        {
          title: 'Engine',
          value: alert.engine,
          short: true
        },
        {
          title: 'Time',
          value: new Date().toISOString(),
          short: true
        }
      ],
      footer: 'Maya Oracle System',
      ts: Math.floor(Date.now() / 1000)
    }]
  }

  if (alert.details) {
    payload.attachments[0].fields.push({
      title: 'Details',
      value: typeof alert.details === 'string' ? alert.details : JSON.stringify(alert.details, null, 2),
      short: false
    })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send Slack alert:', error)
    return false
  }
}

async function sendEmailAlert(alert: AlertRequest) {
  const emailEndpoint = process.env.EMAIL_WEBHOOK_URL // Could be SendGrid, Mailgun, etc.
  const alertEmail = process.env.ALERT_EMAIL
  
  if (!emailEndpoint || !alertEmail) return false

  const now = Date.now()
  const alertKey = `email-${alert.type}-${alert.engine}`
  const lastAlert = alertHistory.get(alertKey) || 0
  
  // Rate limiting (longer for emails)
  if (now - lastAlert < RATE_LIMIT_WINDOW * 2) {
    return false
  }

  alertHistory.set(alertKey, now)

  const subject = `Maya Voice Alert: ${alert.type.toUpperCase()} - ${alert.engine}`
  const body = `
Voice System Alert

Type: ${alert.type}
Engine: ${alert.engine}
Message: ${alert.message}
Time: ${new Date().toISOString()}

${alert.details ? `Details: ${JSON.stringify(alert.details, null, 2)}` : ''}

This is an automated alert from the Maya Oracle System.
`

  const payload = {
    to: alertEmail,
    subject,
    text: body,
    from: 'maya-alerts@spiralogic.com'
  }

  try {
    const response = await fetch(emailEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send email alert:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const alert: AlertRequest = await request.json()
    
    if (!alert.type || !alert.engine || !alert.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Add timestamp if not provided
    if (!alert.timestamp) {
      alert.timestamp = new Date()
    }

    // Log the alert
    console.log('Voice alert received:', {
      type: alert.type,
      engine: alert.engine,
      message: alert.message,
      timestamp: alert.timestamp
    })

    const results = {
      slack: false,
      email: false
    }

    // Send to configured alert channels
    if (process.env.SLACK_WEBHOOK_URL) {
      results.slack = await sendSlackAlert(alert)
    }

    if (process.env.EMAIL_WEBHOOK_URL && process.env.ALERT_EMAIL) {
      results.email = await sendEmailAlert(alert)
    }

    return NextResponse.json({
      success: true,
      alert: {
        type: alert.type,
        engine: alert.engine,
        message: alert.message,
        timestamp: alert.timestamp
      },
      sent: results
    })

  } catch (error) {
    console.error('Alert processing error:', error)
    return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 })
  }
}

// Get alert history for debugging
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const recent = url.searchParams.get('recent')
  
  if (recent) {
    // Return recent alert timestamps for rate limiting debug
    const recentAlerts = Array.from(alertHistory.entries())
      .filter(([_, timestamp]) => Date.now() - timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .map(([key, timestamp]) => ({
        key,
        timestamp: new Date(timestamp).toISOString(),
        timeSince: Math.floor((Date.now() - timestamp) / 1000 / 60) + ' minutes ago'
      }))
    
    return NextResponse.json({
      recentAlerts,
      rateLimitWindow: RATE_LIMIT_WINDOW / 1000 / 60 + ' minutes',
      maxAlertsPerWindow: MAX_ALERTS_PER_WINDOW
    })
  }

  return NextResponse.json({
    configured: {
      slack: !!process.env.SLACK_WEBHOOK_URL,
      email: !!(process.env.EMAIL_WEBHOOK_URL && process.env.ALERT_EMAIL)
    },
    rateLimiting: {
      windowMinutes: RATE_LIMIT_WINDOW / 1000 / 60,
      maxAlertsPerWindow: MAX_ALERTS_PER_WINDOW
    }
  })
}
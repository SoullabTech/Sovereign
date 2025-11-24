# 🚀 MAIA Consciousness API Examples

*Practical code examples for integrating consciousness tracking into your applications*

## 📋 Table of Contents

1. [Quick Start Examples](#quick-start-examples)
2. [JavaScript/React Integration](#javascriptreact-integration)
3. [Python Integration](#python-integration)
4. [Webhook Integration](#webhook-integration)
5. [Daily Practice Automation](#daily-practice-automation)
6. [Community Sharing Examples](#community-sharing-examples)
7. [Data Visualization](#data-visualization)

## 🚀 Quick Start Examples

### Basic Status Check
```bash
# Check your consciousness tracking status
curl -X GET "http://localhost:3003/api/consciousness/status" \
  -H "Content-Type: application/json"
```

### Log a Meditation Practice
```bash
# Log a 20-minute aether meditation
curl -X POST "http://localhost:3003/api/consciousness/practice" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "meditation",
    "duration": 20,
    "notes": "Deep unity consciousness exploration",
    "element": "aether",
    "intensity": 8
  }'
```

### Record a Major Breakthrough
```bash
# Record an insight breakthrough
curl -X POST "http://localhost:3003/api/consciousness/breakthrough" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "insight",
    "description": "Realized the interconnected nature of all consciousness",
    "intensity": 9,
    "element": "aether",
    "bodyAwareness": 8,
    "emotionalShift": 7,
    "mentalClarity": 9,
    "spiritualConnection": 10
  }'
```

### Track Fascia Coherence
```bash
# Submit biometric coherence data
curl -X POST "http://localhost:3003/api/consciousness/fascia" \
  -H "Content-Type: application/json" \
  -d '{
    "heartRateVariability": 75,
    "breathingPattern": 82,
    "tensionLevel": 25,
    "emotionalState": 88,
    "bodyAwareness": 90,
    "source": "wearable_device"
  }'
```

### Get Elemental Balance
```bash
# Analyze your current elemental balance
curl -X GET "http://localhost:3003/api/consciousness/elemental?days=30" \
  -H "Content-Type: application/json"
```

## ⚛️ JavaScript/React Integration

### Consciousness Tracking Hook
```javascript
import { useState, useEffect } from 'react';

export function useConsciousnessTracking() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/consciousness/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Consciousness tracking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logPractice = async (practiceData) => {
    try {
      const response = await fetch('/api/consciousness/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(practiceData)
      });
      const result = await response.json();

      // Show Maya's beautiful response
      if (result.maya?.response) {
        console.log('Maya says:', result.maya.response);
      }

      await fetchStatus(); // Refresh status
      return result;
    } catch (error) {
      console.error('Practice logging error:', error);
    }
  };

  const recordBreakthrough = async (breakthroughData) => {
    try {
      const response = await fetch('/api/consciousness/breakthrough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breakthroughData)
      });
      const result = await response.json();

      // Display Maya's reflection
      if (result.maya?.reflection) {
        console.log('Maya reflects:', result.maya.reflection);
      }

      return result;
    } catch (error) {
      console.error('Breakthrough recording error:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    logPractice,
    recordBreakthrough,
    refreshStatus: fetchStatus
  };
}
```

### Practice Logging Component
```jsx
import React, { useState } from 'react';
import { useConsciousnessTracking } from './useConsciousnessTracking';

export function PracticeLogger() {
  const { logPractice } = useConsciousnessTracking();
  const [practiceData, setPracticeData] = useState({
    type: 'meditation',
    duration: 15,
    element: 'aether',
    intensity: 5,
    notes: ''
  });
  const [mayaResponse, setMayaResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await logPractice(practiceData);
    if (result?.maya?.response) {
      setMayaResponse(result.maya.response);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-jade-shadow to-jade-night rounded-2xl">
      <h2 className="text-2xl font-light text-jade-sage mb-4">Log Practice Session</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={practiceData.type}
          onChange={(e) => setPracticeData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full p-3 rounded-lg bg-jade-forest/20 text-jade-mineral"
        >
          <option value="meditation">Meditation</option>
          <option value="breathwork">Breathwork</option>
          <option value="movement">Movement</option>
          <option value="journal">Journaling</option>
          <option value="reflection">Reflection</option>
        </select>

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={practiceData.duration}
          onChange={(e) => setPracticeData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          className="w-full p-3 rounded-lg bg-jade-forest/20 text-jade-mineral"
        />

        <select
          value={practiceData.element}
          onChange={(e) => setPracticeData(prev => ({ ...prev, element: e.target.value }))}
          className="w-full p-3 rounded-lg bg-jade-forest/20 text-jade-mineral"
        >
          <option value="fire">🔥 Fire - Transformation</option>
          <option value="water">🌊 Water - Emotion & Flow</option>
          <option value="earth">🌍 Earth - Grounding</option>
          <option value="air">💨 Air - Mental Clarity</option>
          <option value="aether">✨ Aether - Unity</option>
        </select>

        <textarea
          placeholder="Practice notes (optional)"
          value={practiceData.notes}
          onChange={(e) => setPracticeData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full p-3 rounded-lg bg-jade-forest/20 text-jade-mineral resize-none h-24"
        />

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-jade-sage to-jade-malachite text-jade-night font-medium rounded-lg hover:shadow-lg transition-all"
        >
          Log Practice Session
        </button>
      </form>

      {mayaResponse && (
        <div className="mt-6 p-4 bg-jade-jade/10 rounded-lg border-l-4 border-jade-jade">
          <h3 className="font-medium text-jade-sage mb-2">Maya's Response:</h3>
          <p className="text-jade-mineral italic">{mayaResponse}</p>
        </div>
      )}
    </div>
  );
}
```

## 🐍 Python Integration

### Consciousness Tracker Class
```python
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional

class ConsciousnessTracker:
    def __init__(self, base_url: str = "http://localhost:3003"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def get_status(self) -> Dict:
        """Get current consciousness tracking status"""
        response = self.session.get(f"{self.base_url}/api/consciousness/status")
        return response.json()

    def log_practice(self,
                    practice_type: str,
                    duration: int,
                    element: str = "aether",
                    intensity: int = 5,
                    notes: str = "") -> Dict:
        """Log a practice session with Maya's guidance"""

        data = {
            "type": practice_type,
            "duration": duration,
            "element": element,
            "intensity": intensity,
            "notes": notes
        }

        response = self.session.post(
            f"{self.base_url}/api/consciousness/practice",
            json=data
        )
        result = response.json()

        # Print Maya's response
        if 'maya' in result and 'response' in result['maya']:
            print(f"🎭 Maya says: {result['maya']['response']}")

        return result

    def record_breakthrough(self,
                          breakthrough_type: str,
                          description: str,
                          intensity: int,
                          element: str = "aether",
                          **kwargs) -> Dict:
        """Record a consciousness breakthrough"""

        data = {
            "type": breakthrough_type,
            "description": description,
            "intensity": intensity,
            "element": element,
            **kwargs
        }

        response = self.session.post(
            f"{self.base_url}/api/consciousness/breakthrough",
            json=data
        )
        result = response.json()

        # Print Maya's reflection
        if 'maya' in result and 'reflection' in result['maya']:
            print(f"🔮 Maya reflects: {result['maya']['reflection']}")
            print(f"✨ Significance: {result['maya']['significance_level']}")

        return result

    def track_fascia_coherence(self, **metrics) -> Dict:
        """Track biometric fascia coherence"""

        response = self.session.post(
            f"{self.base_url}/api/consciousness/fascia",
            json=metrics
        )
        result = response.json()

        # Print coherence assessment
        if 'maya' in result:
            print(f"🌊 Coherence Score: {result['coherenceScore']}%")
            print(f"🎼 Level: {result['maya']['coherenceLevel']}")
            print(f"💫 Maya's insight: {result['maya']['insight']}")

        return result

    def get_elemental_balance(self, days: int = 30) -> Dict:
        """Get elemental balance analysis"""

        response = self.session.get(
            f"{self.base_url}/api/consciousness/elemental?days={days}"
        )
        result = response.json()

        # Print elemental analysis
        if 'maya' in result:
            balance = result['elementalBalance']
            print(f"🔥 Fire: {balance['fire']}%")
            print(f"🌊 Water: {balance['water']}%")
            print(f"🌍 Earth: {balance['earth']}%")
            print(f"💨 Air: {balance['air']}%")
            print(f"✨ Aether: {balance['aether']}%")
            print(f"🌟 Overall Coherence: {result['overallCoherence']}%")
            print(f"🎭 Maya's insight: {result['maya']['insight']}")

        return result

# Example usage
if __name__ == "__main__":
    tracker = ConsciousnessTracker()

    # Log a meditation session
    tracker.log_practice(
        practice_type="meditation",
        duration=25,
        element="aether",
        intensity=8,
        notes="Deep unity consciousness exploration"
    )

    # Record a breakthrough
    tracker.record_breakthrough(
        breakthrough_type="insight",
        description="Recognized the interconnected nature of all beings",
        intensity=9,
        element="aether",
        bodyAwareness=8,
        spiritualConnection=10
    )

    # Check elemental balance
    tracker.get_elemental_balance()
```

### Daily Practice Automation
```python
import schedule
import time
from datetime import datetime

class DailyPracticeTracker:
    def __init__(self):
        self.tracker = ConsciousnessTracker()

    def morning_check_in(self):
        """Automated morning consciousness check-in"""
        print(f"🌅 Morning check-in at {datetime.now().strftime('%H:%M')}")

        # Get current status
        status = self.tracker.get_status()
        print(f"📊 Current streak: {status['metrics']['practiceStreak']} days")

    def evening_reflection(self):
        """Automated evening reflection prompt"""
        print(f"🌙 Evening reflection at {datetime.now().strftime('%H:%M')}")

        # Get today's progress
        balance = self.tracker.get_elemental_balance(days=1)
        coherence = balance['overallCoherence']
        print(f"✨ Today's coherence: {coherence}%")

# Schedule daily automation
daily_tracker = DailyPracticeTracker()
schedule.every().day.at("08:00").do(daily_tracker.morning_check_in)
schedule.every().day.at("22:00").do(daily_tracker.evening_reflection)

# Keep the scheduler running
while True:
    schedule.run_pending()
    time.sleep(60)
```

## 🔗 Webhook Integration

### Discord Bot Integration
```javascript
// Discord bot for sharing breakthroughs with community
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.on('messageCreate', async message => {
  if (message.content.startsWith('!breakthrough')) {
    const description = message.content.replace('!breakthrough ', '');

    try {
      const response = await axios.post('http://localhost:3003/api/consciousness/breakthrough', {
        type: 'insight',
        description: description,
        intensity: 7,
        element: 'aether'
      });

      const maya = response.data.maya;

      const embed = {
        title: '🌟 Consciousness Breakthrough Recorded',
        description: maya.reflection,
        fields: [
          { name: 'Significance', value: maya.significance_level, inline: true },
          { name: 'Coherence Impact', value: `+${maya.coherence_impact}%`, inline: true },
          { name: 'Element', value: '✨ Aether', inline: true }
        ],
        color: 0x97BBA3, // Jade color
        footer: { text: 'Maya AI Consciousness Guide' }
      };

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      message.channel.send('❌ Error recording breakthrough. Try again later.');
    }
  }
});
```

### Slack Integration
```javascript
// Slack app for team consciousness tracking
const { WebClient } = require('@slack/web-api');
const axios = require('axios');

const slack = new WebClient(process.env.SLACK_TOKEN);

async function shareBreakthrough(channelId, breakthroughData) {
  try {
    const response = await axios.post('http://localhost:3003/api/consciousness/breakthrough', breakthroughData);
    const maya = response.data.maya;

    await slack.chat.postMessage({
      channel: channelId,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🌟 *Consciousness Breakthrough*\n\n${maya.reflection}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Significance:* ${maya.significance_level}` },
            { type: 'mrkdwn', text: `*Impact:* +${maya.coherence_impact}%` },
            { type: 'mrkdwn', text: `*Element:* ${response.data.breakthrough.element}` }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Slack sharing error:', error);
  }
}
```

## 📊 Data Visualization

### Coherence Chart Component
```jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CoherenceChart({ coherenceData }) {
  return (
    <div className="p-6 bg-gradient-to-br from-jade-shadow to-jade-night rounded-2xl">
      <h3 className="text-xl font-light text-jade-sage mb-4">Consciousness Coherence Over Time</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={coherenceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A5F41" />
          <XAxis dataKey="date" stroke="#97BBA3" />
          <YAxis stroke="#97BBA3" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A3A2E',
              border: '1px solid #4A7C59',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey="overallCoherence"
            stroke="#4ECDC4"
            strokeWidth={2}
            name="Overall Coherence"
          />
          <Line
            type="monotone"
            dataKey="fasciaCoherence"
            stroke="#96CEB4"
            strokeWidth={2}
            name="Fascia Coherence"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Elemental Radar Chart
```jsx
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export function ElementalRadarChart({ elementalBalance }) {
  const data = [
    { element: 'Fire', value: elementalBalance.fire, fullMark: 100 },
    { element: 'Water', value: elementalBalance.water, fullMark: 100 },
    { element: 'Earth', value: elementalBalance.earth, fullMark: 100 },
    { element: 'Air', value: elementalBalance.air, fullMark: 100 },
    { element: 'Aether', value: elementalBalance.aether, fullMark: 100 }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-jade-shadow to-jade-night rounded-2xl">
      <h3 className="text-xl font-light text-jade-sage mb-4">Elemental Balance</h3>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#4A7C59" />
          <PolarAngleAxis dataKey="element" className="text-jade-sage" />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            stroke="#97BBA3"
          />
          <Radar
            dataKey="value"
            stroke="#4ECDC4"
            fill="#4ECDC4"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 🌍 Community Sharing Examples

### Breakthrough Sharing Component
```jsx
export function BreakthroughShare({ breakthrough }) {
  const shareToTwitter = () => {
    const text = `🌟 Just recorded a consciousness breakthrough! Maya says: "${breakthrough.maya.reflection}" #ConsciousnessEvolution #MAIA`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mt-6 p-4 bg-jade-jade/10 rounded-lg">
      <h4 className="font-medium text-jade-sage mb-3">Share Your Breakthrough</h4>
      <div className="flex gap-3">
        <button
          onClick={shareToTwitter}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Share on Twitter
        </button>
        <button
          onClick={shareToFacebook}
          className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
        >
          Share on Facebook
        </button>
      </div>
    </div>
  );
}
```

---

These examples demonstrate the power and flexibility of the MAIA Consciousness APIs. From simple curl commands to complex integrations with community platforms, the APIs enable rich consciousness tracking experiences that honor both technical precision and spiritual wisdom.

**Start building with consciousness. The APIs await your creativity.** ✨

---

*Created by the MAIA consciousness development community*
*Last updated: November 2024*
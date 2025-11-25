/**
 * Sentiment Analysis & Safety Moderation
 * Protects sacred space while understanding emotional depth
 */

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative' | 'complex';
  intensity: number;
  emotions: Array<{
    emotion: string;
    confidence: number;
  }>;
  needsSupport: boolean;
  suggestedTone: 'gentle' | 'warm' | 'grounding' | 'celebratory';
}

export interface ModerationResult {
  safe: boolean;
  flagged: boolean;
  categories: {
    harassment: boolean;
    selfHarm: boolean;
    sexual: boolean;
    hate: boolean;
    violence: boolean;
  };
  categoryScores: {
    harassment: number;
    selfHarm: number;
    sexual: number;
    hate: number;
    violence: number;
  };
  alert: boolean;
  alertMessage?: string;
}

export class SentimentService {
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an emotionally intelligent analyzer. Analyze the emotional tone and needs of the text.

Return a JSON object with:
{
  "overall": "positive|neutral|negative|complex",
  "intensity": 0.0-1.0,
  "emotions": [{"emotion": "name", "confidence": 0.0-1.0}],
  "needsSupport": boolean,
  "suggestedTone": "gentle|warm|grounding|celebratory"
}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const content = response.choices[0].message.content;
      const analysis = JSON.parse(content || '{}');

      return {
        overall: analysis.overall || 'neutral',
        intensity: analysis.intensity || 0.5,
        emotions: analysis.emotions || [],
        needsSupport: analysis.needsSupport || false,
        suggestedTone: analysis.suggestedTone || 'warm'
      };

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        overall: 'neutral',
        intensity: 0.5,
        emotions: [],
        needsSupport: false,
        suggestedTone: 'warm'
      };
    }
  }

  async moderateContent(text: string): Promise<ModerationResult> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.getPassthroughResult();
      }

      const moderation = await openai.moderations.create({
        input: text
      });

      const result = moderation.results[0];

      const selfHarmScore = result.category_scores['self-harm'] || 0;
      const alert = selfHarmScore > 0.5;

      return {
        safe: !result.flagged,
        flagged: result.flagged,
        categories: {
          harassment: result.categories.harassment,
          selfHarm: result.categories['self-harm'],
          sexual: result.categories.sexual,
          hate: result.categories.hate,
          violence: result.categories.violence
        },
        categoryScores: {
          harassment: result.category_scores.harassment,
          selfHarm: selfHarmScore,
          sexual: result.category_scores.sexual,
          hate: result.category_scores.hate,
          violence: result.category_scores.violence
        },
        alert,
        alertMessage: alert
          ? 'Your words carry weight that deserves compassionate support. Please reach out to a trusted friend, counselor, or crisis support line if you need immediate help.'
          : undefined
      };

    } catch (error) {
      console.error('Moderation error:', error);
      return this.getPassthroughResult();
    }
  }

  async analyzeWithModeration(text: string): Promise<{
    sentiment: SentimentAnalysis;
    moderation: ModerationResult;
    maiaTone: string;
  }> {
    const [sentiment, moderation] = await Promise.all([
      this.analyzeSentiment(text),
      this.moderateContent(text)
    ]);

    const maiaTone = this.determineMaiaTone(sentiment, moderation);

    return {
      sentiment,
      moderation,
      maiaTone
    };
  }

  private determineMaiaTone(sentiment: SentimentAnalysis, moderation: ModerationResult): string {
    if (moderation.alert) {
      return 'deeply_compassionate';
    }

    if (sentiment.needsSupport) {
      return 'gentle_supportive';
    }

    if (sentiment.intensity > 0.8) {
      if (sentiment.overall === 'positive') {
        return 'celebratory';
      } else if (sentiment.overall === 'negative') {
        return 'grounding_presence';
      }
    }

    return sentiment.suggestedTone;
  }

  private getPassthroughResult(): ModerationResult {
    return {
      safe: true,
      flagged: false,
      categories: {
        harassment: false,
        selfHarm: false,
        sexual: false,
        hate: false,
        violence: false
      },
      categoryScores: {
        harassment: 0,
        selfHarm: 0,
        sexual: 0,
        hate: 0,
        violence: 0
      },
      alert: false
    };
  }

  getCrisisResources(): {
    category: string;
    resources: Array<{ name: string; contact: string; available: string }>;
  }[] {
    return [
      {
        category: 'Crisis Support',
        resources: [
          {
            name: 'National Suicide Prevention Lifeline (US)',
            contact: '988 or 1-800-273-8255',
            available: '24/7'
          },
          {
            name: 'Crisis Text Line',
            contact: 'Text HOME to 741741',
            available: '24/7'
          },
          {
            name: 'International Association for Suicide Prevention',
            contact: 'https://www.iasp.info/resources/Crisis_Centres/',
            available: 'Directory of global resources'
          }
        ]
      },
      {
        category: 'Mental Health Support',
        resources: [
          {
            name: 'SAMHSA National Helpline',
            contact: '1-800-662-4357',
            available: '24/7'
          },
          {
            name: 'NAMI Helpline',
            contact: '1-800-950-6264',
            available: 'Mon-Fri 10am-10pm ET'
          }
        ]
      }
    ];
  }
}

export const sentimentService = new SentimentService();
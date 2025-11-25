// 🌸 Document Analysis Pipeline - Wisdom Extraction
import { createClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

export interface DocumentAnalysis {
  id: string;
  title: string;
  excerpt: string; // ≤ 120 chars wisdom quote
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  aetherDetected: boolean;
  coherence: number; // 0-1
  themes: string[];
  facets: string[];
  emotionalTone: {
    primary: string;
    valence: number; // -1 to 1
  };
  createdAt: string;
}

const ELEMENT_KEYWORDS = {
  Fire: ['passion', 'energy', 'transform', 'create', 'inspire', 'action', 'will', 'courage', 'innovation'],
  Water: ['flow', 'emotion', 'intuition', 'feeling', 'receptive', 'nurture', 'compassion', 'depth', 'reflection'],
  Earth: ['ground', 'stable', 'practical', 'material', 'structure', 'foundation', 'patience', 'endurance', 'manifest'],
  Air: ['thought', 'idea', 'communicate', 'mind', 'clarity', 'perspective', 'freedom', 'inspiration', 'connection']
};

const FACET_MAPPING = {
  Presence: ['aware', 'mindful', 'present', 'attention', 'focus', 'now', 'conscious'],
  Wisdom: ['insight', 'understand', 'knowledge', 'truth', 'learn', 'perspective', 'discern'],
  Creation: ['create', 'build', 'make', 'generate', 'birth', 'new', 'innovate', 'manifest'],
  Destruction: ['end', 'release', 'dissolve', 'break', 'transform', 'let go', 'clear'],
  Order: ['structure', 'organize', 'system', 'pattern', 'discipline', 'method', 'plan'],
  Chaos: ['random', 'wild', 'unknown', 'mystery', 'spontaneous', 'unpredictable', 'emergence'],
  Power: ['strength', 'force', 'will', 'agency', 'control', 'influence', 'leadership'],
  Vulnerability: ['open', 'soft', 'tender', 'exposed', 'authentic', 'honest', 'receptive'],
  Connection: ['together', 'relate', 'bond', 'unite', 'share', 'community', 'love'],
  Solitude: ['alone', 'inner', 'self', 'quiet', 'introspect', 'independence', 'contemplation'],
  Joy: ['happy', 'light', 'play', 'celebrate', 'pleasure', 'delight', 'enthusiasm'],
  Shadow: ['dark', 'hidden', 'unconscious', 'denied', 'repressed', 'fear', 'avoid']
};

export async function analyzeDocument(
  file: File, 
  storagePath: string
): Promise<DocumentAnalysis> {
  // Extract text content based on file type
  const content = await extractContent(file);
  
  // Analyze with Claude for deep wisdom extraction
  const claudeAnalysis = await analyzeWithClaude(content);
  
  // Map to elements and facets
  const element = detectPrimaryElement(content, claudeAnalysis);
  const facets = detectFacets(content, claudeAnalysis);
  const aetherDetected = detectAether(claudeAnalysis);
  const coherence = calculateCoherence(facets, claudeAnalysis);
  
  // Extract wisdom quote
  const excerpt = extractWisdomQuote(content, claudeAnalysis);
  
  // Save to Supabase
  const analysis: DocumentAnalysis = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    excerpt,
    element,
    aetherDetected,
    coherence,
    themes: claudeAnalysis.themes || [],
    facets,
    emotionalTone: {
      primary: claudeAnalysis.emotionalTone || 'neutral',
      valence: claudeAnalysis.valence || 0
    },
    createdAt: new Date().toISOString()
  };
  
  await saveToSupabase(analysis, storagePath);
  
  return analysis;
}

async function extractContent(file: File): Promise<string> {
  // Text files
  if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
    return await file.text();
  }
  
  // PDF extraction (would use pdf.js or similar)
  if (file.type === 'application/pdf') {
    // Simplified - in production would use proper PDF library
    return `[PDF content extraction for: ${file.name}]`;
  }
  
  // Audio transcription (would use Whisper API or similar)
  if (file.type.startsWith('audio/')) {
    // Simplified - in production would transcribe
    return `[Audio transcription for: ${file.name}]`;
  }
  
  // Video transcription
  if (file.type.startsWith('video/')) {
    // Simplified - in production would extract audio and transcribe
    return `[Video transcription for: ${file.name}]`;
  }
  
  // Image OCR (would use Tesseract or similar)
  if (file.type.startsWith('image/')) {
    // Simplified - in production would OCR
    return `[Image text extraction for: ${file.name}]`;
  }
  
  return `[Unknown file type: ${file.type}]`;
}

async function analyzeWithClaude(content: string): Promise<any> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analyze this text for sacred wisdom and resonance. Extract:
        1. Core themes (3-5 keywords)
        2. Emotional tone (one word) and valence (-1 to 1)
        3. A profound wisdom quote from the text (max 120 chars)
        4. Whether transcendent/mystical qualities are present (yes/no)
        
        Text: ${content.slice(0, 2000)}
        
        Respond in JSON format:
        {
          "themes": ["theme1", "theme2"],
          "emotionalTone": "contemplative",
          "valence": 0.7,
          "wisdomQuote": "quote here",
          "transcendent": true
        }`
      }]
    });
    
    const result = JSON.parse(response.content[0].text);
    return result;
  } catch (error) {
    console.error('Claude analysis error:', error);
    // Fallback to local analysis
    return localAnalysis(content);
  }
}

function localAnalysis(content: string): any {
  const words = content.toLowerCase().split(/\s+/);
  const themes: string[] = [];
  
  // Simple keyword extraction
  Object.entries(ELEMENT_KEYWORDS).forEach(([element, keywords]) => {
    const matches = keywords.filter(kw => content.toLowerCase().includes(kw));
    if (matches.length > 2) themes.push(element.toLowerCase());
  });
  
  // Extract first meaningful sentence as wisdom quote
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const wisdomQuote = sentences[0]?.slice(0, 120) || content.slice(0, 120);
  
  return {
    themes: themes.slice(0, 5),
    emotionalTone: 'neutral',
    valence: 0,
    wisdomQuote,
    transcendent: false
  };
}

function detectPrimaryElement(
  content: string, 
  claudeAnalysis: any
): 'Fire' | 'Water' | 'Earth' | 'Air' {
  const elementScores: Record<string, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  };
  
  // Score based on keyword presence
  const lowerContent = content.toLowerCase();
  Object.entries(ELEMENT_KEYWORDS).forEach(([element, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        elementScores[element]++;
      }
    });
  });
  
  // Boost from Claude themes
  if (claudeAnalysis.themes) {
    claudeAnalysis.themes.forEach((theme: string) => {
      Object.entries(ELEMENT_KEYWORDS).forEach(([element, keywords]) => {
        if (keywords.some(kw => theme.toLowerCase().includes(kw))) {
          elementScores[element] += 2;
        }
      });
    });
  }
  
  // Return highest scoring element
  const sorted = Object.entries(elementScores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as 'Fire' | 'Water' | 'Earth' | 'Air';
}

function detectFacets(content: string, claudeAnalysis: any): string[] {
  const detectedFacets = new Set<string>();
  const lowerContent = content.toLowerCase();
  
  // Check for facet keywords
  Object.entries(FACET_MAPPING).forEach(([facet, keywords]) => {
    const matchCount = keywords.filter(kw => lowerContent.includes(kw)).length;
    if (matchCount >= 2) {
      detectedFacets.add(facet);
    }
  });
  
  // Add facets from Claude themes
  if (claudeAnalysis.themes) {
    claudeAnalysis.themes.forEach((theme: string) => {
      Object.entries(FACET_MAPPING).forEach(([facet, keywords]) => {
        if (keywords.some(kw => theme.toLowerCase().includes(kw))) {
          detectedFacets.add(facet);
        }
      });
    });
  }
  
  return Array.from(detectedFacets).slice(0, 4); // Max 4 facets
}

function detectAether(claudeAnalysis: any): boolean {
  // Aether detected if transcendent qualities present or very high coherence
  return claudeAnalysis.transcendent === true || 
         claudeAnalysis.valence > 0.8;
}

function calculateCoherence(facets: string[], claudeAnalysis: any): number {
  let coherence = 0.5; // Base coherence
  
  // Increase for each detected facet
  coherence += facets.length * 0.1;
  
  // Adjust based on emotional valence
  if (claudeAnalysis.valence) {
    coherence += claudeAnalysis.valence * 0.2;
  }
  
  // Boost for transcendent qualities
  if (claudeAnalysis.transcendent) {
    coherence += 0.2;
  }
  
  return Math.min(Math.max(coherence, 0), 1); // Clamp to 0-1
}

function extractWisdomQuote(content: string, claudeAnalysis: any): string {
  // Prefer Claude's extracted quote
  if (claudeAnalysis.wisdomQuote) {
    return claudeAnalysis.wisdomQuote.slice(0, 120);
  }
  
  // Fallback: Find most impactful sentence
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const impactfulSentence = sentences.find(s => 
    s.length > 20 && s.length < 120 &&
    (s.includes('wisdom') || s.includes('truth') || s.includes('sacred'))
  );
  
  return impactfulSentence?.trim() || 
         sentences[0]?.slice(0, 120) || 
         content.slice(0, 120);
}

async function saveToSupabase(analysis: DocumentAnalysis, storagePath: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { error } = await supabase
    .from('documents')
    .insert({
      id: analysis.id,
      title: analysis.title,
      excerpt: analysis.excerpt,
      element: analysis.element,
      aether_detected: analysis.aetherDetected,
      coherence: analysis.coherence,
      themes: analysis.themes,
      facets: analysis.facets,
      emotional_tone: analysis.emotionalTone,
      file_url: storagePath,
      created_at: analysis.createdAt
    });
  
  if (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
}
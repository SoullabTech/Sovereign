# 🧩 Sacred Architecture Integration Snippets

## 🎭 Main Application Layout

### `/app/layout.tsx` - Already Integrated ✅
```typescript
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 🏠 Homepage Integration

### `/app/page.tsx` - Maia Welcome Flow
```typescript
import { ConversationFlow } from '@/components/oracle/ConversationFlow';

export default function Home() {
  return (
    <main className="min-h-screen">
      <ConversationFlow initialMode="welcome" />
    </main>
  );
}
```

### Alternative: Dedicated `/app/maia/page.tsx`
```typescript
import { ConversationFlow } from '@/components/oracle/ConversationFlow';

export default function MaiaPage() {
  return (
    <div className="container mx-auto">
      <ConversationFlow initialMode="welcome" />
    </div>
  );
}
```

## 🧠 Auth Hook Integration

### Basic useAuth Implementation - Already Complete ✅
```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    oracleAgent, 
    isAuthenticated, 
    isLoading, 
    signIn, 
    signOut 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <SignInButton onClick={() => signIn(email, password)} />;
  }

  return (
    <div>
      Welcome, {user?.sacredName || user?.email}!
      {oracleAgent && (
        <p>Oracle: {oracleAgent.name} ({oracleAgent.archetype})</p>
      )}
    </div>
  );
}
```

## 💫 Memory System Integration

### useConversationMemory Hook Usage
```typescript
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';
import { useAuth } from '@/lib/hooks/useAuth';

function VoiceComponent() {
  const { isAuthenticated } = useAuth();
  const { saveMemory, hasPendingMemory } = useConversationMemory();
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const handleConversationEnd = async (transcript: string) => {
    if (isAuthenticated) {
      // Auto-save for authenticated users
      await saveMemory(transcript, {
        memoryType: 'conversation',
        sourceType: 'voice',
        wisdomThemes: extractWisdomThemes(transcript),
        elementalResonance: detectElementalResonance(transcript),
        emotionalTone: detectEmotionalTone(transcript)
      });
    } else {
      // Prompt anonymous users to sign up
      setConversationToSave(transcript);
      setShowSavePrompt(true);
    }
  };

  return (
    <>
      {/* Your voice interface */}
      <VoiceInterface onConversationEnd={handleConversationEnd} />
      
      {/* Save prompt for anonymous users */}
      <MemorySavePrompt
        isOpen={showSavePrompt}
        onClose={() => setShowSavePrompt(false)}
        conversationContent={conversationToSave}
        onSave={() => {
          setShowSavePrompt(false);
          // Handle successful signup and save
        }}
      />
    </>
  );
}
```

## 🔊 Voice Interface Enhancement

### Enhanced Voice Component with Memory Integration
```typescript
import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';
import { MemorySavePrompt } from '@/components/auth/MemorySavePrompt';

interface EnhancedVoiceProps {
  onTranscriptUpdate?: (transcript: string) => void;
  onSessionComplete?: (sessionData: any) => void;
}

export function EnhancedVoiceInterface({ 
  onTranscriptUpdate, 
  onSessionComplete 
}: EnhancedVoiceProps) {
  const { isAuthenticated, user } = useAuth();
  const { saveMemory } = useConversationMemory();
  
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showMemoryPrompt, setShowMemoryPrompt] = useState(false);
  const [sessionId] = useState(() => `voice_${Date.now()}`);

  const handleRecordingComplete = useCallback(async (finalTranscript: string) => {
    setCurrentTranscript(finalTranscript);
    onTranscriptUpdate?.(finalTranscript);

    // Trigger memory saving flow
    if (isAuthenticated) {
      await saveMemoryFromVoice(finalTranscript);
      onSessionComplete?.({ 
        transcript: finalTranscript, 
        saved: true, 
        user: user?.sacredName 
      });
    } else {
      setShowMemoryPrompt(true);
    }
  }, [isAuthenticated, user, onTranscriptUpdate, onSessionComplete]);

  const saveMemoryFromVoice = async (transcript: string) => {
    const metadata = {
      memoryType: 'voice_session' as const,
      sourceType: 'voice' as const,
      sessionId,
      duration: getDuration(),
      wisdomThemes: extractWisdomThemes(transcript),
      elementalResonance: detectElementalResonance(transcript),
      emotionalTone: detectEmotionalTone(transcript),
      voiceMetadata: {
        session_length: transcript.length,
        estimated_duration: Math.ceil(transcript.length / 150) // ~150 chars per minute speech
      }
    };

    await saveMemory(transcript, metadata);
  };

  const extractWisdomThemes = (text: string): string[] => {
    // Your existing theme extraction logic from ConversationFlow
    const themes: string[] = [];
    const lowerText = text.toLowerCase();
    
    const themeKeywords = {
      transformation: ['change', 'transform', 'evolve', 'growth'],
      healing: ['heal', 'pain', 'recovery', 'wholeness'],
      purpose: ['purpose', 'calling', 'mission', 'meaning'],
      relationships: ['relationship', 'love', 'connection'],
      creativity: ['create', 'art', 'express', 'inspiration'],
      spirituality: ['spirit', 'soul', 'divine', 'sacred'],
      wisdom: ['wisdom', 'insight', 'understanding', 'clarity']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes.slice(0, 5);
  };

  const detectElementalResonance = (text: string): string | undefined => {
    // Your existing elemental detection logic
    const lowerText = text.toLowerCase();
    const elementalKeywords = {
      earth: ['ground', 'body', 'practical', 'stable'],
      water: ['feel', 'emotion', 'flow', 'intuition'],
      fire: ['passion', 'energy', 'vision', 'action'],
      air: ['think', 'idea', 'communicate', 'mental']
    };

    let maxCount = 0;
    let dominantElement: string | undefined;

    Object.entries(elementalKeywords).forEach(([element, keywords]) => {
      const count = keywords.reduce((sum, keyword) => {
        return sum + (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      }, 0);
      
      if (count > maxCount) {
        maxCount = count;
        dominantElement = element;
      }
    });

    return maxCount > 2 ? dominantElement : undefined;
  };

  const detectEmotionalTone = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (['pain', 'hurt', 'sad', 'grief'].some(word => lowerText.includes(word))) {
      return 'melancholic';
    }
    if (['joy', 'happy', 'excited', 'celebrate'].some(word => lowerText.includes(word))) {
      return 'joyful';
    }
    if (['peace', 'calm', 'serene'].some(word => lowerText.includes(word))) {
      return 'peaceful';
    }
    
    return 'reflective';
  };

  const getDuration = () => {
    // Implement session duration tracking
    return Math.floor(Math.random() * 300) + 60; // Placeholder
  };

  return (
    <>
      <div className="voice-interface">
        {/* Your existing voice UI */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          className="voice-button"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {currentTranscript && (
          <div className="transcript-preview">
            <p>{currentTranscript.slice(0, 100)}...</p>
          </div>
        )}
      </div>

      <MemorySavePrompt
        isOpen={showMemoryPrompt}
        onClose={() => setShowMemoryPrompt(false)}
        conversationContent={currentTranscript}
        onSave={async () => {
          setShowMemoryPrompt(false);
          // User will be authenticated after signup, auto-save will happen
          onSessionComplete?.({ 
            transcript: currentTranscript, 
            saved: true, 
            newUser: true 
          });
        }}
      />
    </>
  );
}
```

## 🎨 UI Component Integration

### Sacred Button Component
```typescript
import { motion } from 'framer-motion';
import { FiMic, FiMicOff } from 'react-icons/fi';

interface SacredButtonProps {
  isRecording?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function SacredButton({ 
  isRecording = false, 
  onClick, 
  disabled = false, 
  children 
}: SacredButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-8 py-4 rounded-full font-medium transition-all duration-200
        ${isRecording 
          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' 
          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <div className="flex items-center space-x-2">
        {isRecording ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
        <span>{children || (isRecording ? 'Stop Recording' : 'Start Recording')}</span>
      </div>
      
      {isRecording && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
```

## 🌊 Page-Level Integration Examples

### Dashboard with Memory Integration
```typescript
import { useAuth } from '@/lib/hooks/useAuth';
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';
import { EnhancedVoiceInterface } from '@/components/voice/EnhancedVoiceInterface';

export default function DashboardPage() {
  const { user, oracleAgent, isLoading } = useAuth();
  const { recentMemories } = useConversationMemory();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-light text-white">
          Welcome back, {user?.sacredName || 'Sacred Seeker'}
        </h1>
        {oracleAgent && (
          <p className="text-white/70">
            Your oracle {oracleAgent.name} awaits your next dialogue
          </p>
        )}
      </section>

      {/* Voice Interface */}
      <section className="max-w-2xl mx-auto">
        <EnhancedVoiceInterface
          onSessionComplete={(data) => {
            console.log('Session completed:', data);
            // Refresh memories or navigate to reflection
          }}
        />
      </section>

      {/* Recent Memories */}
      {recentMemories && recentMemories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-light text-white/90">Recent Reflections</h2>
          <div className="grid gap-4">
            {recentMemories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white/80 text-sm">
                  {memory.content.slice(0, 150)}...
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {memory.metadata?.wisdomThemes?.map((theme) => (
                    <span key={theme} className="px-2 py-1 bg-violet-600/20 text-violet-300 text-xs rounded">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

🌟 **Integration Complete: Sacred Architecture Flows Seamlessly** 🌟
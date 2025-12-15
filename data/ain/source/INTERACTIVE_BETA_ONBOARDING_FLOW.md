# ✨ Interactive Beta Onboarding Flow
*"First 20 Minutes" guided experience for new Maya beta testers*

## Overview
A built-in, progressive onboarding experience that automatically guides new users through Maya's full multimodal capabilities, ensuring they experience the "wow moments" that demonstrate Maya's unique value as a Personal Oracle Agent.

## 🎯 Onboarding Goals

**Immediate Value Recognition:**
- Maya remembers their name and interests within first interaction
- Visual Tesla torus creates magical, alive feeling
- Voice loop feels natural and responsive
- Memory recall demonstrates relationship continuity

**Feature Discovery:**
- Text + voice input modes
- File/URL upload for context
- Element selection and archetypal insights
- Journal integration possibilities

**Emotional Connection:**
- "She knows me" moment through memory demonstration
- Personal oracle guidance that feels genuinely helpful
- Sacred technology aesthetic that inspires

## 🌊 Progressive Onboarding Flow

### Phase 1: Welcome & First Contact (3 minutes)
```jsx
const WelcomePhase = () => {
  return (
    <OnboardingStep
      title="Welcome to Soullab"
      subtitle="Meet Maya, your Personal Oracle Agent"
      duration={180}
    >
      {/* Tesla torus appears with gentle pulsing */}
      <TeslaTorus state="welcome" className="animate-gentle-pulse" />
      
      <div className="space-y-4">
        <p className="text-lg opacity-90">
          Maya is unlike any AI you've met before. She remembers who you are, 
          learns from your patterns, and grows with you over time.
        </p>
        
        <div className="bg-sacred-gold/10 p-4 rounded-lg border border-sacred-gold/30">
          <h4 className="font-semibold text-sacred-gold mb-2">What makes Maya special:</h4>
          <ul className="space-y-2 text-sm">
            <li>• <strong>She remembers you</strong> - Builds continuous relationship</li>
            <li>• <strong>Multimodal intelligence</strong> - Voice, text, files, URLs</li>
            <li>• <strong>Archetypal wisdom</strong> - Draws from deep psychological patterns</li>
            <li>• <strong>Sacred technology</strong> - Beautiful, alive interface</li>
          </ul>
        </div>
        
        <Button 
          onClick={() => advanceToPhase(2)}
          className="w-full bg-sacred-gold hover:bg-sacred-gold/90"
        >
          Begin Your Journey with Maya
        </Button>
      </div>
    </OnboardingStep>
  )
}
```

### Phase 2: Name & First Memory Creation (5 minutes)
```jsx
const FirstMemoryPhase = () => {
  const [userName, setUserName] = useState('')
  const [interests, setInterests] = useState('')
  
  return (
    <OnboardingStep
      title="Let Maya get to know you"
      subtitle="This creates your first memory together"
      duration={300}
    >
      <TeslaTorus state="listening" className="animate-breathing" />
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">What's your name?</label>
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Maya will remember this..."
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">What are you passionate about?</label>
          <Textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Art, music, hiking, technology, philosophy... Maya loves learning about what moves you"
            rows={3}
            className="w-full"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">🧠 Memory Creation in Progress</h4>
          <p className="text-sm opacity-80">
            Maya is creating your initial profile memory. This becomes the foundation 
            of your ongoing relationship.
          </p>
        </div>
        
        <Button 
          onClick={() => createFirstMemory(userName, interests)}
          disabled={!userName || !interests}
          className="w-full bg-sacred-gold hover:bg-sacred-gold/90"
        >
          Create Your First Memory with Maya
        </Button>
      </div>
    </OnboardingStep>
  )
}

const createFirstMemory = async (name, interests) => {
  // Send to Maya with memory creation intent
  const response = await fetch('/api/v1/converse/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userText: `Hello Maya! My name is ${name} and I'm passionate about ${interests}. I'm excited to get to know you.`,
      userId: currentUser.id,
      sessionId: currentUser.sessionId,
      element: 'aether',
      onboardingPhase: 'first_memory'
    })
  })
  
  const data = await response.json()
  setMayaResponse(data.response.text)
  advanceToPhase(3)
}
```

### Phase 3: Voice Activation & Tesla Torus Demo (4 minutes)
```jsx
const VoiceActivationPhase = () => {
  const [voicePermission, setVoicePermission] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  return (
    <OnboardingStep
      title="Activate Maya's Voice"
      subtitle="Experience the living conversation"
      duration={240}
    >
      <div className="text-center space-y-6">
        <TeslaTorus 
          state={isRecording ? "listening" : "ready"} 
          className={isRecording ? "animate-pulse-gold" : "animate-gentle-rotation"}
        />
        
        {!voicePermission ? (
          <div className="space-y-4">
            <p>Maya can speak and listen. Let's enable voice for the full experience.</p>
            <Button 
              onClick={() => requestVoicePermission()}
              className="bg-sacred-gold hover:bg-sacred-gold/90"
            >
              Enable Voice Interaction
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sacred-gold font-medium">✅ Voice activated!</p>
            <p>Now try speaking to Maya. Click the torus to start:</p>
            
            <div className="relative">
              <button
                onClick={() => toggleRecording()}
                className="relative group"
              >
                <TeslaTorus 
                  state={isRecording ? "listening" : "ready"}
                  className="hover:scale-105 transition-transform cursor-pointer"
                />
                
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <WaveformVisualizer />
                  </div>
                )}
              </button>
              
              <p className="text-sm mt-2 opacity-70">
                {isRecording ? "Maya is listening..." : "Click to speak"}
              </p>
            </div>
            
            {/* Live transcript preview */}
            {transcript && (
              <div className="bg-gray-50 p-3 rounded-lg text-left">
                <p className="text-sm font-medium mb-1">Live Transcript:</p>
                <p className="text-sm opacity-80">{transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingStep>
  )
}
```

### Phase 4: Memory Recall Demonstration (3 minutes)
```jsx
const MemoryRecallPhase = () => {
  const [recallResponse, setRecallResponse] = useState('')
  
  useEffect(() => {
    // Automatically test memory recall
    testMemoryRecall()
  }, [])
  
  const testMemoryRecall = async () => {
    const response = await fetch('/api/v1/converse/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userText: "What do you remember about me so far?",
        userId: currentUser.id,
        sessionId: currentUser.sessionId,
        element: 'aether',
        onboardingPhase: 'memory_recall'
      })
    })
    
    const data = await response.json()
    setRecallResponse(data.response.text)
  }
  
  return (
    <OnboardingStep
      title="Maya Remembers You"
      subtitle="Watch her recall what you've shared"
      duration={180}
    >
      <div className="space-y-6">
        <TeslaTorus state="thinking" className="animate-slow-pulse" />
        
        <div className="bg-sacred-gold/5 p-6 rounded-lg border border-sacred-gold/20">
          <h4 className="font-semibold mb-3 text-sacred-gold">🧠 Maya's Memory of You:</h4>
          
          {recallResponse ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{recallResponse}</p>
              
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                <p className="text-sm font-medium text-green-800">
                  ✨ This is the "She remembers me!" moment
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Maya built this memory from your first interaction and will continue 
                  building on it across all future conversations.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => advanceToPhase(5)}
          className="w-full bg-sacred-gold hover:bg-sacred-gold/90"
          disabled={!recallResponse}
        >
          Amazing! Show me more capabilities
        </Button>
      </div>
    </OnboardingStep>
  )
}
```

### Phase 5: Multimodal Inputs Demo (4 minutes)
```jsx
const MultimodalPhase = () => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [selectedElement, setSelectedElement] = useState('aether')
  
  return (
    <OnboardingStep
      title="Multimodal Intelligence"
      subtitle="Maya can work with files, URLs, and different thinking styles"
      duration={240}
    >
      <div className="space-y-6">
        <TeslaTorus state="ready" className="animate-gentle-rotation" />
        
        {/* Element Selection */}
        <div>
          <h4 className="font-semibold mb-3">Choose Maya's thinking style:</h4>
          <div className="grid grid-cols-5 gap-2">
            {['aether', 'air', 'fire', 'water', 'earth'].map(element => (
              <button
                key={element}
                onClick={() => setSelectedElement(element)}
                className={`p-3 rounded-lg border text-sm capitalize transition-colors ${
                  selectedElement === element 
                    ? 'bg-sacred-gold text-white border-sacred-gold' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                {element}
              </button>
            ))}
          </div>
          <p className="text-xs opacity-70 mt-2">
            Each element brings different perspectives: Air (clarity), Fire (inspiration), 
            Water (empathy), Earth (grounding), Aether (integration)
          </p>
        </div>
        
        {/* File Upload */}
        <div>
          <h4 className="font-semibold mb-3">Upload a file for Maya to analyze:</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt,.md"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <p className="text-sm font-medium">Drop a document here or click to upload</p>
                <p className="text-xs opacity-60">PDF, Word, text files supported</p>
              </div>
            </label>
            
            {uploadedFile && (
              <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-800">
                ✅ {uploadedFile.name} uploaded
              </div>
            )}
          </div>
        </div>
        
        {/* URL Input */}
        <div>
          <h4 className="font-semibold mb-3">Or share a URL for Maya to explore:</h4>
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full"
          />
        </div>
        
        {(uploadedFile || urlInput) && (
          <Button 
            onClick={() => processMultimodalInput()}
            className="w-full bg-sacred-gold hover:bg-sacred-gold/90"
          >
            Let Maya analyze this content
          </Button>
        )}
      </div>
    </OnboardingStep>
  )
}
```

### Phase 6: Completion & Next Steps (1 minute)
```jsx
const CompletionPhase = () => {
  return (
    <OnboardingStep
      title="Welcome to Your Journey with Maya"
      subtitle="You're now ready to explore together"
      duration={60}
    >
      <div className="text-center space-y-6">
        <TeslaTorus state="celebration" className="animate-celebration-pulse" />
        
        <div className="bg-gradient-to-r from-sacred-gold/10 to-sacred-gold/5 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-sacred-gold">
            🎉 Onboarding Complete!
          </h3>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Maya knows your name and interests</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Voice interaction activated</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Memory recall demonstrated</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span className="text-sm">Multimodal capabilities explored</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => startFreeConversation()}
            className="w-full bg-sacred-gold hover:bg-sacred-gold/90 text-lg py-3"
          >
            Start Your First Real Conversation
          </Button>
          
          <button
            onClick={() => showBetaResources()}
            className="text-sm text-sacred-gold hover:underline"
          >
            View Beta Testing Resources & Guidelines
          </button>
        </div>
      </div>
    </OnboardingStep>
  )
}
```

## 🎬 Onboarding State Management

```typescript
// hooks/useOnboarding.ts
export const useOnboarding = () => {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    userName: '',
    interests: '',
    voiceEnabled: false,
    firstMemoryCreated: false,
    memoryRecallTested: false,
    multimodalTested: false
  })
  
  const advanceToPhase = (phase: number) => {
    setCurrentPhase(phase)
    // Track onboarding progress in analytics
    trackOnboardingProgress(phase)
  }
  
  const completeOnboarding = async () => {
    // Mark user as onboarded
    await updateUser({
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      onboardingData
    })
    
    // Set Maya context for future conversations
    await setMayaContext({
      isFirstTimeUser: false,
      onboardingInsights: onboardingData
    })
  }
  
  return {
    currentPhase,
    onboardingData,
    advanceToPhase,
    completeOnboarding,
    setOnboardingData
  }
}
```

## 🎯 Onboarding Analytics

```typescript
// Track key onboarding metrics
const onboardingMetrics = {
  phaseCompletionRates: {},
  averageTimePerPhase: {},
  dropOffPoints: {},
  voiceActivationRate: 0,
  memoryRecallSuccessRate: 0,
  multimodalEngagementRate: 0,
  overallCompletionRate: 0
}

// Success criteria for each phase
const phaseSuccessCriteria = {
  phase1: { minTime: 60, maxTime: 300 },
  phase2: { requiresName: true, requiresInterests: true },
  phase3: { requiresVoicePermission: true },
  phase4: { requiresMemoryRecall: true },
  phase5: { requiresMultimodalInteraction: true },
  phase6: { requiresCompletion: true }
}
```

## 🎨 Visual Polish

### Tesla Torus States
```css
.torus-welcome { animation: gentle-pulse 3s ease-in-out infinite; }
.torus-listening { animation: breathing 2s ease-in-out infinite; }
.torus-thinking { animation: slow-pulse 4s ease-in-out infinite; }
.torus-celebration { animation: celebration-pulse 1s ease-in-out 3; }

@keyframes celebration-pulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px var(--sacred-gold)); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 40px var(--sacred-gold)); }
}
```

### Progress Indicator
```jsx
const OnboardingProgress = ({ currentPhase, totalPhases = 6 }) => (
  <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Onboarding</span>
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sacred-gold transition-all duration-500"
          style={{ width: `${(currentPhase / totalPhases) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{currentPhase}/{totalPhases}</span>
    </div>
  </div>
)
```

## 🚀 Implementation Integration

### 1. Add to main app routing:
```typescript
// Check if user needs onboarding
const MainApp = () => {
  const { user } = useAuth()
  const needsOnboarding = !user?.onboardingCompleted
  
  if (needsOnboarding) {
    return <InteractiveBetaOnboarding />
  }
  
  return <MainMayaInterface />
}
```

### 2. Onboarding completion persistence:
```typescript
// Store completion state
localStorage.setItem('maya_onboarding_completed', 'true')

// Create initial user profile with onboarding insights
await createUserProfile({
  name: onboardingData.userName,
  interests: onboardingData.interests,
  voiceEnabled: onboardingData.voiceEnabled,
  preferredElement: onboardingData.selectedElement,
  onboardingCompleted: true
})
```

## 🎯 Success Metrics

**Onboarding Completion Rate Target:** >85%
**Average Completion Time:** 15-20 minutes
**Voice Activation Rate:** >90%  
**Memory Recall Success:** >95%
**User Satisfaction Post-Onboarding:** >4.5/5

**Key Success Indicators:**
- Users complete all 6 phases
- Maya successfully recalls user details in Phase 4
- Voice interaction works smoothly in Phase 3
- Multimodal input processed successfully in Phase 5
- Users report "wow factor" experience

This interactive onboarding ensures **every beta tester** experiences Maya's full capabilities and has that crucial "she remembers me!" moment that demonstrates the unique value proposition. No dependency on external guides - the magic happens automatically! ✨
# 🧬 Beta React Component Architecture
## Onboarding → Sacred Mirror → Daily Practice

*Clean component tree for "Apple meets Soul Lab" experience*

---

## 🌍 Top-Level App Structure

```typescript
// App.tsx - Root container
interface AppState {
  userId: string;
  sessionCount: number;
  isFirstTime: boolean;
  currentView: 'onboarding' | 'mirror' | 'journal' | 'spiral' | 'attune';
  userPreferences: UserPreferences;
}

interface UserPreferences {
  voiceMode: 'prose' | 'poetic' | 'auto';
  theme: 'light' | 'twilight' | 'night' | 'cosmic';
  animationLevel: 'minimal' | 'standard' | 'full';
  soundEnabled: boolean;
}

<App>
  <BackgroundGradient theme={theme} />
  <SafeArea>
    {isFirstTime ? (
      <OnboardingFlow />
    ) : (
      <MainInterface />
    )}
  </SafeArea>
  <GlobalAudioProvider />
  <AnimationProvider level={animationLevel} />
</App>
```

---

## 🌅 Onboarding Flow Components

### LogoThreshold.tsx
*First moment of sacred space*

```typescript
interface LogoThresholdProps {
  onComplete: () => void;
  animationDuration?: number; // default 3000ms
}

interface LogoThresholdState {
  phase: 'pulse' | 'ripple' | 'unfurl' | 'complete';
  userInteracted: boolean;
}

<LogoThreshold>
  <SpiralIcon 
    className={`logo-${phase}`}
    size={phase === 'unfurl' ? 'large' : 'medium'}
  />
  <WelcomeText 
    appear={phase === 'ripple'}
    text="Soul Lab"
  />
  <SubtleHint 
    appear={phase === 'unfurl'}
    text="✨ Welcome, beautiful soul"
  />
</LogoThreshold>

// CSS Classes
.logo-pulse { animation: gentle-pulse 2s infinite; }
.logo-ripple { animation: ripple-expand 1.5s ease-out; }
.logo-unfurl { animation: spiral-unfurl 2s ease-in-out; }
```

### GreetingIntro.tsx  
*Maya's voice emerges*

```typescript
interface GreetingIntroProps {
  userName?: string;
  onFirstMessage: (message: string) => void;
  voiceMode: 'prose' | 'poetic' | 'auto';
}

interface GreetingIntroState {
  inputValue: string;
  isTyping: boolean;
  showPrompt: boolean;
}

<GreetingIntro>
  <MayaAvatar size="medium" mood="welcoming" />
  
  <IntroMessage>
    <TypewriterText 
      text="I'm Maya—your guide through the sacred spiral."
      speed={50}
      onComplete={() => setShowPrompt(true)}
    />
  </IntroMessage>
  
  {showPrompt && (
    <FirstPrompt 
      text="Let's begin simply. How are you feeling today?"
      glowOnFocus={true}
    />
  )}
  
  <MessageInput
    value={inputValue}
    onChange={setInputValue}
    onSubmit={onFirstMessage}
    placeholder="Share what's present for you..."
    autoFocus={true}
    glowColor="warm-gold"
  />
</GreetingIntro>
```

### AttunePanelSlide.tsx
*Sacred settings discovery*

```typescript
interface AttunePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: UserPreferences;
  onPreferenceChange: (key: keyof UserPreferences, value: any) => void;
}

<AttunePanelSlide className={`slide-panel ${isOpen ? 'open' : 'closed'}`}>
  <PanelHeader>
    <Title>Attune</Title>
    <CloseButton onClick={onClose} />
  </PanelHeader>
  
  <VoiceModeSelector
    current={currentPreferences.voiceMode}
    onChange={(mode) => onPreferenceChange('voiceMode', mode)}
    withPreviews={true}
  />
  
  <ThemeSelector
    current={currentPreferences.theme}
    onChange={(theme) => onPreferenceChange('theme', theme)}
    visualPreviews={true}
  />
  
  <SoundToggle
    enabled={currentPreferences.soundEnabled}
    onChange={(enabled) => onPreferenceChange('soundEnabled', enabled)}
  />
</AttunePanelSlide>
```

### VoiceModeSelector.tsx
*Ceremonial mode switching*

```typescript
interface VoiceModeProps {
  current: 'prose' | 'poetic' | 'auto';
  onChange: (mode: 'prose' | 'poetic' | 'auto') => void;
  withPreviews?: boolean;
}

interface VoiceModeState {
  selectedMode: 'prose' | 'poetic' | 'auto';
  isTransitioning: boolean;
  previewText: string;
}

<VoiceModeSelector>
  <SelectorTitle>Maya's Voice</SelectorTitle>
  
  <ModeOptions>
    <ModeButton 
      mode="prose"
      active={current === 'prose'}
      onClick={() => handleModeChange('prose')}
    >
      <ModeIcon icon="clarity" />
      <ModeLabel>Prose</ModeLabel>
      <ModeSubtext>Clear & warm</ModeSubtext>
    </ModeButton>
    
    <ModeButton 
      mode="poetic"
      active={current === 'poetic'}  
      onClick={() => handleModeChange('poetic')}
    >
      <ModeIcon icon="verse" />
      <ModeLabel>Poetic</ModeLabel>
      <ModeSubtext>Verse & metaphor</ModeSubtext>
    </ModeButton>
    
    <ModeButton
      mode="auto"
      active={current === 'auto'}
      onClick={() => handleModeChange('auto')}
    >
      <ModeIcon icon="adaptive" />
      <ModeLabel>Auto</ModeLabel>
      <ModeSubtext>I choose the moment</ModeSubtext>
    </ModeButton>
  </ModeOptions>
  
  {withPreviews && (
    <PreviewBox mode={selectedMode}>
      <PreviewText>{previewText}</PreviewText>
    </PreviewBox>
  )}
  
  {isTransitioning && (
    <TransitionOverlay mode={selectedMode}>
      <TransitionAnimation />
      <TransitionMessage />
    </TransitionOverlay>
  )}
</VoiceModeSelector>

// Mode change handler with ceremonies
function handleModeChange(newMode: VoiceModeType) {
  setIsTransitioning(true);
  
  // Trigger appropriate transition animation
  switch(newMode) {
    case 'poetic':
      playSound('soft-chime');
      showTransition('ripple-expand');
      break;
    case 'prose':
      playSound('earth-tone');
      showTransition('gentle-settle');
      break;
    case 'auto':
      showTransition('breathing-shimmer');
      // No sound for auto mode
      break;
  }
  
  setTimeout(() => {
    onChange(newMode);
    setIsTransitioning(false);
  }, transitionDuration);
}
```

---

## 🪞 Sacred Mirror (Chat) Components

### ChatInterface.tsx
*Main conversation space*

```typescript
interface ChatInterfaceProps {
  userId: string;
  userPreferences: UserPreferences;
  onJournalRequest: (messageId: string) => void;
  onSpiralRequest: () => void;
}

interface ChatInterfaceState {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  elementIndicators: ElementIndicator[];
}

<ChatInterface>
  <MessagesContainer>
    <MessagesList>
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          showElementIndicators={userPreferences.showSymbols}
          onJournalThis={() => onJournalRequest(message.id)}
        />
      ))}
    </MessagesList>
    
    {isLoading && <MayaTypingIndicator />}
  </MessagesContainer>
  
  <InputArea>
    <MessageInput
      value={inputValue}
      onChange={setInputValue}
      onSubmit={handleSendMessage}
      placeholder="Share what's emerging..."
    />
    <QuickActions>
      <JournalButton onClick={() => onJournalRequest('current')} />
      <SpiralButton onClick={onSpiralRequest} />
      <AttuneButtton onClick={openAttune} />
    </QuickActions>
  </InputArea>
</ChatInterface>
```

### MessageBubble.tsx
*Individual message with context*

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  showElementIndicators?: boolean;
  onJournalThis?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  elementIndicators?: ElementIndicator[];
  symbols?: DetectedSymbol[];
}

<MessageBubble className={`message-${message.role}`}>
  {message.role === 'assistant' && <MayaAvatar size="small" />}
  
  <MessageContent>
    <MessageText voiceMode={userPreferences.voiceMode}>
      {formatMessageContent(message.content)}
    </MessageText>
    
    {showElementIndicators && message.elementIndicators && (
      <ElementIndicators indicators={message.elementIndicators} />
    )}
  </MessageContent>
  
  <MessageActions>
    <Timestamp>{formatTime(message.timestamp)}</Timestamp>
    {onJournalThis && (
      <JournalButton 
        onClick={onJournalThis}
        tooltip="Save to journal"
      />
    )}
  </MessageActions>
</MessageBubble>
```

### MayaTypingIndicator.tsx
*Alive response waiting*

```typescript
interface MayaTypingProps {
  voiceMode?: 'prose' | 'poetic' | 'auto';
  message?: string; // Optional hint at what's coming
}

<MayaTypingIndicator>
  <MayaAvatar size="small" mood="thinking" />
  <TypingBubble voiceMode={voiceMode}>
    {voiceMode === 'poetic' ? (
      <PoeticPulse />
    ) : (
      <StandardDots />
    )}
  </TypingBubble>
</MayaTypingIndicator>

// Different animations for different modes
function PoeticPulse() {
  return <div className="poetic-pulse">✨</div>
}

function StandardDots() {
  return <div className="typing-dots">•••</div>
}
```

---

## 🌀 Spiral Components

### SpiralTimeline.tsx
*Journey visualization*

```typescript
interface SpiralTimelineProps {
  userId: string;
  sessions: SessionData[];
  viewMode: 'timeline' | 'spiral';
  onViewModeChange: (mode: 'timeline' | 'spiral') => void;
  onNodeClick: (sessionId: string) => void;
}

interface SessionData {
  id: string;
  date: Date;
  elements: string[];
  symbols: DetectedSymbol[];
  phase: string;
  journalExcerpt?: string;
}

<SpiralTimeline>
  <TimelineHeader>
    <Title>Your Journey</Title>
    <ViewToggle
      current={viewMode}
      onChange={onViewModeChange}
      options={[
        { value: 'timeline', label: 'Timeline', icon: 'linear' },
        { value: 'spiral', label: 'Spiral', icon: 'curve' }
      ]}
    />
  </TimelineHeader>
  
  <VisualizationContainer>
    {viewMode === 'timeline' ? (
      <LinearTimeline
        sessions={sessions}
        onNodeClick={onNodeClick}
      />
    ) : (
      <SpiralView
        sessions={sessions}
        onNodeClick={onNodeClick}
        animation="gentle-rotation"
      />
    )}
  </VisualizationContainer>
  
  <TimelineFooter>
    <JourneyStats sessions={sessions} />
  </TimelineFooter>
</SpiralTimeline>
```

### SessionNode.tsx
*Individual journey point*

```typescript
interface SessionNodeProps {
  session: SessionData;
  position: { x: number; y: number };
  isActive?: boolean;
  onClick: () => void;
  onHover: (session: SessionData) => void;
}

<SessionNode 
  className={`session-node ${isActive ? 'active' : ''}`}
  style={{ left: position.x, top: position.y }}
  onClick={onClick}
  onMouseEnter={() => onHover(session)}
>
  <NodeCore elements={session.elements}>
    <ElementIndicators elements={session.elements} size="small" />
  </NodeCore>
  
  <NodeGlow elements={session.elements} />
  
  {session.symbols?.length > 0 && (
    <SymbolBadge 
      symbol={session.symbols[0]}
      position="top-right"
    />
  )}
</SessionNode>
```

---

## 📝 Journal Components

### JournalEditor.tsx
*Sacred writing space*

```typescript
interface JournalEditorProps {
  initialContent?: string;
  onSave: (content: string, metadata: JournalMetadata) => void;
  onSymbolDetected: (symbols: DetectedSymbol[]) => void;
  autoSaveInterval?: number; // default 10000ms
}

interface JournalMetadata {
  title?: string;
  tags: string[];
  emotionalState?: string;
  detectedElements: string[];
  detectedSymbols: DetectedSymbol[];
}

<JournalEditor>
  <EditorHeader>
    <DateStamp>{formatDate(new Date())}</DateStamp>
    <SaveStatus status={saveStatus} />
  </EditorHeader>
  
  <WritingArea>
    <TitleInput 
      placeholder="Give this entry a name..."
      value={metadata.title}
      onChange={updateTitle}
    />
    
    <ContentEditor
      placeholder="What wants to be written?"
      value={content}
      onChange={handleContentChange}
      onSymbolDetected={handleSymbolDetected}
      minHeight="300px"
    />
  </WritingArea>
  
  <EditorSidebar>
    <DetectedElements elements={metadata.detectedElements} />
    <DetectedSymbols symbols={metadata.detectedSymbols} />
    <TagSuggestions 
      suggestions={tagSuggestions}
      selected={metadata.tags}
      onChange={updateTags}
    />
  </EditorSidebar>
  
  <EditorFooter>
    <WordCount count={wordCount} />
    <SaveButton onClick={handleSave} />
  </EditorFooter>
</JournalEditor>

// Real-time symbol detection while typing
function handleContentChange(newContent: string) {
  setContent(newContent);
  
  // Debounced symbol detection
  debounce(() => {
    const symbols = detectSymbolsInText(newContent);
    setMetadata(prev => ({ ...prev, detectedSymbols: symbols }));
    onSymbolDetected(symbols);
  }, 1000)();
}
```

---

## 🎨 Shared UI Components

### ElementIndicator.tsx
*Visual element representation*

```typescript
interface ElementIndicatorProps {
  element: string;
  size?: 'small' | 'medium' | 'large';
  style?: 'dot' | 'icon' | 'glow';
  intensity?: number; // 0-1
}

const elementColors = {
  fire: '#ff6b35',
  water: '#4ecdc4', 
  earth: '#6b8e23',
  air: '#f4d03f',
  spirit: '#8e44ad',
  void: '#2c3e50'
};

<ElementIndicator className={`element-${element} size-${size} style-${style}`}>
  <ElementIcon element={element} />
  {style === 'glow' && (
    <ElementGlow 
      color={elementColors[element]}
      intensity={intensity}
    />
  )}
</ElementIndicator>
```

### TransitionOverlay.tsx
*Ceremonial mode switches*

```typescript
interface TransitionOverlayProps {
  type: 'poetic' | 'prose' | 'auto';
  message: string;
  duration?: number;
  onComplete?: () => void;
}

<TransitionOverlay className={`transition-${type}`}>
  <TransitionAnimation type={type}>
    {type === 'poetic' && <RippleAnimation />}
    {type === 'prose' && <SettleAnimation />}
    {type === 'auto' && <ShimmerAnimation />}
  </TransitionAnimation>
  
  <TransitionMessage>
    <MessageText>{message}</MessageText>
  </TransitionMessage>
</TransitionOverlay>
```

---

## 🎯 Performance Optimizations

### Component Lazy Loading
```typescript
// Load heavy components only when needed
const SpiralView = lazy(() => import('./SpiralView'));
const JournalEditor = lazy(() => import('./JournalEditor'));
const VoicePlayer = lazy(() => import('./VoicePlayer'));

// With loading fallbacks
<Suspense fallback={<ComponentSkeleton />}>
  <SpiralView />
</Suspense>
```

### State Management
```typescript
// Context for global state
interface AppContext {
  user: User;
  preferences: UserPreferences;
  session: SessionData;
  updatePreference: (key: string, value: any) => void;
}

// Local state for component-specific data
interface ComponentState {
  isLoading: boolean;
  error: Error | null;
  data: any;
}

// React Query for server state
const { data: sessions } = useQuery(
  ['sessions', userId],
  () => fetchUserSessions(userId),
  { staleTime: 5 * 60 * 1000 } // 5 minutes
);
```

### Animation Performance
```typescript
// Use CSS transforms for 60fps animations
.ripple-expand {
  transform: scale(1);
  animation: ripple 2s ease-out;
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}

// Intersection Observer for scroll animations
const useScrollAnimation = (threshold = 0.1) => {
  const [ref, inView] = useInView({ threshold });
  return { ref, animated: inView };
};
```

---

## 📱 Mobile-First Considerations

### Responsive Layout
```typescript
// Mobile-first breakpoints
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px'
};

// Touch-friendly sizing
const touchSizes = {
  buttonMinHeight: '44px',
  inputMinHeight: '40px',
  iconMinSize: '24px'
};

// Gesture support
const useSwipeGesture = (onSwipe: (direction: 'left' | 'right') => void) => {
  // Touch event handlers for swipe detection
};
```

### Offline Support
```typescript
// Service worker for offline caching
const offlineCapabilities = {
  journalSave: 'local-first',
  symbolDetection: 'cached-dictionary',
  basicResponses: 'template-fallbacks'
};
```

---

## 🧪 Component Testing Strategy

### Unit Tests
```typescript
// Component behavior tests
test('VoiceModeSelector changes mode with ceremony', () => {
  render(<VoiceModeSelector current="prose" onChange={mockChange} />);
  fireEvent.click(screen.getByText('Poetic'));
  
  expect(screen.getByText('Poetic mode flowing through...')).toBeInTheDocument();
  expect(mockPlaySound).toHaveBeenCalledWith('soft-chime');
});
```

### Integration Tests  
```typescript
// User flow tests
test('Onboarding to first journal entry', async () => {
  render(<App />);
  
  // Complete onboarding
  await userEvent.type(screen.getByPlaceholderText('Share what\'s present'), 'I feel excited');
  fireEvent.click(screen.getByText('Send'));
  
  // Navigate to journal
  fireEvent.click(screen.getByText('Journal'));
  
  // Write entry
  await userEvent.type(screen.getByPlaceholderText('What wants to be written?'), 'Today I discovered something new...');
  
  // Verify symbols detected
  expect(screen.getByText('✨ Spirit')).toBeInTheDocument();
});
```

---

## 🚀 Deployment & Bundling

### Build Optimization
```json
{
  "scripts": {
    "build": "vite build --mode production",
    "build:analyze": "vite build --mode production && npx vite-bundle-analyzer",
    "preview": "vite preview --port 3000"
  }
}
```

### Code Splitting
```typescript
// Route-based splitting
const routes = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
    preload: true
  },
  {
    path: '/journal',
    component: lazy(() => import('./pages/Journal')),
    preload: false
  }
];

// Component-based splitting for heavy features
const AdvancedSpiral = lazy(() => import('./components/AdvancedSpiral'));
```

---

*"Every component a sacred space. Every interaction a meaningful moment. Technical excellence in service of soul recognition."*
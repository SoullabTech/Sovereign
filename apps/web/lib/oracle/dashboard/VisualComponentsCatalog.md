# ARIA Visual Components Catalog
## From ASCII Mockups to Production Components

---

## 📊 Chart Components Library Recommendations

### Primary: Recharts (Recommended for most cases)
- **Why**: Simple API, great React integration, responsive by default
- **Use for**: Line charts, bar charts, pie charts, area charts
- **Bundle size**: ~170KB (tree-shakeable)

### Advanced: D3.js
- **Why**: Maximum flexibility, custom visualizations
- **Use for**: Force graphs, novel archetypes network, complex animations
- **Bundle size**: ~70KB (core only)

### Alternative: Victory
- **Why**: Good for animated, interactive charts
- **Use for**: Real-time updating charts, gesture-based interactions
- **Bundle size**: ~200KB

### Lightweight: Chart.js with react-chartjs-2
- **Why**: Smaller bundle, canvas-based (performant)
- **Use for**: Mobile dashboards, simple charts
- **Bundle size**: ~60KB

---

## Component Mapping: ASCII → Production

### 1. Presence Gauge

**ASCII Mockup:**
```
CURRENT PRESENCE: 72%  ████████████████░░░░░  [40%--90%]
```

**Production Component:**
```tsx
import { CircularProgress, LinearProgress } from '@mui/material';
// OR
import { RadialBarChart, RadialBar } from 'recharts';

<PresenceGauge>
  <RadialBarChart data={[{value: 72, fill: '#8B5CF6'}]}>
    <RadialBar dataKey="value" cornerRadius={10} fill="#8B5CF6" />
  </RadialBarChart>
  <CenterLabel>72%</CenterLabel>
</PresenceGauge>

// Mobile version with gesture support
<Swipeable onSwipeUp={showDetails}>
  <CircularGauge
    value={presence}
    min={40}
    max={90}
    zones={[
      {start: 40, end: 50, color: '#FBBF24'},
      {start: 50, end: 70, color: '#10B981'},
      {start: 70, end: 90, color: '#8B5CF6'}
    ]}
  />
</Swipeable>
```

### 2. Evolution Line Chart

**ASCII Mockup:**
```
│ 90% ┤                                    ╭─────╮
│ 80% ┤                              ╭─────╯     ╰──
│ 70% ┤                      ╭───────╯              ◆
│ 60% ┤             ╭────────╯
│ 50% ┤      ╭──────╯
│ 40% ┤──────╯ FLOOR ................................
```

**Production Component:**
```tsx
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={presenceHistory}>
    <defs>
      <linearGradient id="presenceGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <XAxis dataKey="session" />
    <YAxis domain={[40, 90]} />
    <ReferenceLine y={40} stroke="#FBBF24" strokeDasharray="3 3" />
    <ReferenceLine y={65} stroke="#6B7280" strokeDasharray="2 2" />
    <Line
      type="monotone"
      dataKey="presence"
      stroke="#8B5CF6"
      strokeWidth={3}
      dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
      activeDot={{ r: 8 }}
    />
  </LineChart>
</ResponsiveContainer>

// Mobile version with touch interactions
<LineChart
  data={data}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
/>
```

### 3. Archetype Blend Wheel

**ASCII Mockup:**
```
        SACRED
          25%
          ╱│╲
    SAGE ╱ ◆ ╲ TRICKSTER
     15%      45%
```

**Production Component:**
```tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
// OR for more visual impact:
import { Sunburst } from '@ant-design/plots';

<RadarChart width={300} height={300} data={archetypeData}>
  <PolarGrid stroke="#374151" />
  <PolarAngleAxis dataKey="archetype" tick={{ fill: '#9CA3AF' }} />
  <Radar
    name="Current Blend"
    dataKey="value"
    stroke="#8B5CF6"
    fill="#8B5CF6"
    fillOpacity={0.6}
  />
</RadarChart>

// Interactive mobile version
<InteractiveRadar
  data={archetypeBlend}
  onArchetypePress={(archetype) => showArchetypeDetails(archetype)}
  animateOnMount
  morphingAnimation
/>
```

### 4. Voice Evolution Matrix

**ASCII Mockup:**
```
Warmth        [░░░░░░] → [████████░] (+68%)
Directness    [████░░] → [██░░░░░░] (-42%)
```

**Production Component:**
```tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
// OR for better mobile:
import { Progress } from 'antd';

<VoiceEvolutionMatrix>
  {dimensions.map(dim => (
    <DimensionRow key={dim.name}>
      <Label>{dim.name}</Label>
      <ProgressComparison>
        <Progress
          percent={dim.initial * 100}
          strokeColor="#6B7280"
          showInfo={false}
        />
        <Arrow>→</Arrow>
        <Progress
          percent={dim.current * 100}
          strokeColor="#8B5CF6"
        />
        <Delta className={dim.delta > 0 ? 'text-green-500' : 'text-red-500'}>
          {dim.delta > 0 ? '+' : ''}{dim.delta}%
        </Delta>
      </ProgressComparison>
    </DimensionRow>
  ))}
</VoiceEvolutionMatrix>

// Mobile swipeable cards version
<SwipeableViews>
  {dimensions.map(dim => (
    <DimensionCard key={dim.name}>
      <AnimatedProgress from={dim.initial} to={dim.current} />
    </DimensionCard>
  ))}
</SwipeableViews>
```

### 5. Intelligence Blend Bars

**ASCII Mockup:**
```
Claude (Reasoning)      35% ████████████░░░░░░░░
Sesame (Emotional)      30% ███████████░░░░░░░░░
```

**Production Component:**
```tsx
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

const COLORS = {
  claude: '#3B82F6',
  sesame: '#EC4899',
  obsidian: '#10B981',
  field: '#F59E0B',
  mycelial: '#8B5CF6'
};

<BarChart layout="horizontal" data={intelligenceBlend}>
  <XAxis type="number" domain={[0, 100]} />
  <YAxis type="category" dataKey="source" />
  <Bar dataKey="percentage">
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[entry.source]} />
    ))}
  </Bar>
</BarChart>

// Mobile stacked view
<StackedBar
  data={intelligenceBlend}
  onSegmentPress={(source) => explainSource(source)}
  animated
  showPercentages
/>
```

### 6. Relationship Journey Map

**ASCII Mockup:**
```
S1    S3     S7      S12        S18       S23
│     │      │       │          │          │
▼     ▼      ▼       ▼          ▼          ▼
First Trust  Voice   Signature  Deep      Sacred
```

**Production Component:**
```tsx
import { Timeline } from 'antd';
// OR custom implementation:
import { motion } from 'framer-motion';

<Timeline mode="alternate">
  {milestones.map((milestone, index) => (
    <Timeline.Item
      key={milestone.session}
      dot={<MilestoneIcon type={milestone.type} />}
      color={milestone.completed ? 'purple' : 'gray'}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <SessionLabel>Session {milestone.session}</SessionLabel>
        <MilestoneName>{milestone.name}</MilestoneName>
        <Description>{milestone.description}</Description>
      </motion.div>
    </Timeline.Item>
  ))}
</Timeline>

// Mobile horizontal scroll version
<HorizontalScrollView showsHorizontalScrollIndicator={false}>
  <TimelineContainer>
    {milestones.map(m => (
      <MilestonePoint key={m.session} completed={m.completed} />
    ))}
  </TimelineContainer>
</HorizontalScrollView>
```

### 7. Sacred Mirror Reflection

**ASCII Mockup:**
```
USER PATTERNS RECOGNIZED:
• Prefers metaphorical language ████████░░
```

**Production Component:**
```tsx
import { HeatMap } from '@ant-design/plots';
// OR
import { TreeMap } from 'recharts';

<PatternRecognitionGrid>
  <HeatMap
    data={userPatterns}
    xField="category"
    yField="pattern"
    colorField="strength"
    color={['#EFF6FF', '#BFDBFE', '#60A5FA', '#3B82F6', '#1E40AF']}
    tooltip={{
      showTitle: true,
      formatter: (datum) => ({
        name: datum.pattern,
        value: `${datum.strength * 100}% match`
      })
    }}
  />
</PatternRecognitionGrid>

// Mobile card stack version
<CardStack>
  {patterns.map(pattern => (
    <PatternCard swipeable>
      <PatternName>{pattern.name}</PatternName>
      <StrengthIndicator value={pattern.strength} />
    </PatternCard>
  ))}
</CardStack>
```

---

## Mobile-Specific Components

### Bottom Sheet
```tsx
import { BottomSheet } from 'react-spring-bottom-sheet';

<BottomSheet
  open={isOpen}
  onDismiss={handleClose}
  snapPoints={({ maxHeight }) => [
    maxHeight * 0.2,
    maxHeight * 0.5,
    maxHeight * 0.9,
  ]}
  defaultSnap={1}
>
  <SheetContent />
</BottomSheet>
```

### Pull to Refresh
```tsx
import { PullToRefresh } from 'react-pull-to-refresh';

<PullToRefresh
  onRefresh={handleRefresh}
  resistance={3}
  distanceToRefresh={80}
>
  <ScrollableContent />
</PullToRefresh>
```

### Swipeable Views
```tsx
import SwipeableViews from 'react-swipeable-views';

<SwipeableViews
  index={activeIndex}
  onChangeIndex={handleChangeIndex}
  enableMouseEvents
  resistance
>
  <View1 />
  <View2 />
  <View3 />
</SwipeableViews>
```

---

## Animation Libraries

### Framer Motion (Recommended)
```tsx
import { motion, AnimatePresence } from 'framer-motion';

<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0, opacity: 0 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <Component />
</motion.div>
```

### React Spring (For physics-based animations)
```tsx
import { useSpring, animated } from 'react-spring';

const props = useSpring({
  from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
  to: { opacity: 1, transform: 'translate3d(0,0px,0)' }
});

<animated.div style={props}>
  <Component />
</animated.div>
```

---

## Performance Optimization

### Mobile Chart Optimization
```tsx
// Use canvas-based charts for better mobile performance
import { Line } from 'react-chartjs-2';

// Throttle real-time updates
const throttledUpdate = useMemo(
  () => throttle(updateChart, 100),
  []
);

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

// Use virtualization for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

---

## Accessibility Considerations

```tsx
// Ensure all charts have text alternatives
<RadialChart
  data={data}
  aria-label={`Presence at ${presence}%`}
  role="img"
>
  <ScreenReaderOnly>
    Current presence level is {presence}%,
    which is {getPresenceDescription(presence)}
  </ScreenReaderOnly>
</RadialChart>

// Add keyboard navigation
<InteractiveChart
  onKeyDown={handleKeyNavigation}
  tabIndex={0}
  focusable
/>

// Provide high contrast mode
<ThemeProvider theme={highContrastTheme}>
  <Dashboard />
</ThemeProvider>
```

---

## Bundle Size Optimization

```javascript
// Recommended setup for optimal bundle size:
{
  "dependencies": {
    "recharts": "^2.5.0",        // 170KB - main charts
    "framer-motion": "^10.0.0",  // 60KB - animations
    "react-window": "^1.8.0",    // 15KB - virtualization
    "@tanstack/react-query": "^4.0.0"  // 25KB - data fetching
  }
}

// Total: ~270KB for complete visualization stack
```

---

This catalog provides a complete mapping from ASCII mockups to production-ready components with mobile-first considerations and performance optimization strategies.
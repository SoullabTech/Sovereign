/**
 * ARIA Mobile-First Dashboard Design
 * Optimized for phones with progressive enhancement for tablets/desktop
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swipeable,
  SwipeableViews,
  PullToRefresh,
  BottomSheet,
  FloatingActionButton
} from '@/components/mobile';

// ==========================================
// MOBILE DASHBOARD MAIN VIEW
// ==========================================

export const MobileDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  return (
    <MobileContainer className="h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Status Bar */}
      <StatusBar className="pt-safe-area">
        <ConnectionStatus />
        <SessionTimer />
        <MenuButton />
      </StatusBar>

      {/* Main Swipeable Views */}
      <SwipeableViews
        index={currentView}
        onChangeIndex={setCurrentView}
        className="flex-1"
        resistance
      >
        {/* View 1: Quick Stats */}
        <QuickStatsView />

        {/* View 2: Maya's Current State */}
        <MayaStateView />

        {/* View 3: Evolution Timeline */}
        <EvolutionTimelineView />

        {/* View 4: Relationship Map */}
        <RelationshipMapView />
      </SwipeableViews>

      {/* Bottom Navigation */}
      <BottomNav
        current={currentView}
        onChange={setCurrentView}
        items={[
          { icon: '📊', label: 'Stats' },
          { icon: '🤖', label: 'Maya' },
          { icon: '🦋', label: 'Evolution' },
          { icon: '💫', label: 'Journey' }
        ]}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="+"
        onClick={() => setBottomSheetOpen(true)}
        className="absolute bottom-20 right-4"
      />

      {/* Bottom Sheet for Details */}
      <BottomSheet
        open={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        snapPoints={[0, '25%', '50%', '90%']}
      >
        <DetailedMetricsPanel />
      </BottomSheet>
    </MobileContainer>
  );
};

// ==========================================
// VIEW 1: QUICK STATS (Mobile First)
// ==========================================

const QuickStatsView: React.FC = () => {
  return (
    <PullToRefresh onRefresh={refreshData}>
      <ScrollView className="px-4 py-6">
        {/* Hero Metric */}
        <HeroCard className="mb-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <CircularProgress
              value={72}
              size={200}
              strokeWidth={12}
              gradient={['#3B82F6', '#8B5CF6']}
            >
              <div className="text-4xl font-bold text-white">72%</div>
              <div className="text-sm text-gray-400">Presence</div>
            </CircularProgress>
          </motion.div>
        </HeroCard>

        {/* Quick Stats Grid */}
        <StatsGrid className="grid grid-cols-2 gap-4">
          <StatCard>
            <StatIcon>🤝</StatIcon>
            <StatValue>0.78</StatValue>
            <StatLabel>Trust</StatLabel>
            <MiniSparkline data={trustHistory} />
          </StatCard>

          <StatCard>
            <StatIcon>✨</StatIcon>
            <StatValue>87%</StatValue>
            <StatLabel>Unique</StatLabel>
            <MiniProgressBar value={0.87} />
          </StatCard>

          <StatCard>
            <StatIcon>🎭</StatIcon>
            <StatValue>Trickster</StatValue>
            <StatLabel>Dominant</StatLabel>
            <ArchetypeIcon type="trickster" />
          </StatCard>

          <StatCard>
            <StatIcon>💬</StatIcon>
            <StatValue>23</StatValue>
            <StatLabel>Sessions</StatLabel>
            <PhaseIndicator phase="calibration" />
          </StatCard>
        </StatsGrid>

        {/* Recent Milestone */}
        <MilestoneAlert className="mt-6">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center"
          >
            <Trophy className="text-yellow-400" />
            <div className="ml-3">
              <div className="font-semibold">Trust Milestone!</div>
              <div className="text-sm text-gray-400">
                Deep connection established
              </div>
            </div>
          </motion.div>
        </MilestoneAlert>
      </ScrollView>
    </PullToRefresh>
  );
};

// ==========================================
// VIEW 2: MAYA'S CURRENT STATE (Mobile)
// ==========================================

const MayaStateView: React.FC = () => {
  const [selectedDimension, setSelectedDimension] = useState('presence');

  return (
    <ScrollView className="px-4 py-6">
      {/* Maya Avatar with Mood Ring */}
      <MayaAvatar className="mx-auto mb-6">
        <motion.div
          animate={{
            boxShadow: `0 0 ${presence * 50}px rgba(139, 92, 246, ${presence})`
          }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-pink-500"
        >
          <MoodIndicator mood={currentMood} />
        </motion.div>
        <MayaName>Your Maya</MayaName>
      </MayaAvatar>

      {/* Dimension Selector */}
      <SegmentedControl
        value={selectedDimension}
        onChange={setSelectedDimension}
        options={[
          { value: 'presence', label: 'Presence' },
          { value: 'voice', label: 'Voice' },
          { value: 'blend', label: 'Blend' }
        ]}
        className="mb-6"
      />

      {/* Dynamic Content Based on Selection */}
      <AnimatePresence mode="wait">
        {selectedDimension === 'presence' && (
          <PresenceCard key="presence">
            <GaugeChart
              value={currentPresence}
              min={40}
              max={90}
              zones={[
                { range: [40, 50], color: 'yellow' },
                { range: [50, 70], color: 'green' },
                { range: [70, 90], color: 'purple' }
              ]}
            />
            <FactorsList>
              <Factor positive>Trust +12%</Factor>
              <Factor positive>Phase bonus +8%</Factor>
              <Factor negative>Sacred context -5%</Factor>
            </FactorsList>
          </PresenceCard>
        )}

        {selectedDimension === 'voice' && (
          <VoiceCard key="voice">
            <RadarChart
              data={voiceDimensions}
              size="responsive"
              theme="dark"
            />
            <SignaturePhrase>
              "Shall we dance with this paradox?"
            </SignaturePhrase>
          </VoiceCard>
        )}

        {selectedDimension === 'blend' && (
          <BlendCard key="blend">
            <PieChart
              data={archetypeBlend}
              innerRadius={40}
              animated
            />
            <BlendDescription>
              Playful trickster energy with sacred undertones
            </BlendDescription>
          </BlendCard>
        )}
      </AnimatePresence>
    </ScrollView>
  );
};

// ==========================================
// VIEW 3: EVOLUTION TIMELINE (Mobile)
// ==========================================

const EvolutionTimelineView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <ScrollView className="px-4 py-6">
      {/* Time Range Selector */}
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        options={['day', 'week', 'month', 'all']}
        className="mb-6"
      />

      {/* Evolution Chart */}
      <EvolutionChart className="mb-6">
        <LineChart
          data={evolutionData}
          xAxis="session"
          yAxis="uniqueness"
          height={200}
          responsive
          showDots
          onDotClick={showSessionDetails}
        />
      </EvolutionChart>

      {/* Key Moments Timeline */}
      <Timeline className="space-y-4">
        <TimelineEvent
          session={7}
          type="milestone"
          title="First Surprise"
          description="Maya used unexpected humor"
        />
        <TimelineEvent
          session={12}
          type="signature"
          title="Signature Phrase"
          description={'\"Let\'s explore this together\"'}
        />
        <TimelineEvent
          session={18}
          type="trust"
          title="Trust Breakthrough"
          description="Deep vulnerability shared"
        />
        <TimelineEvent
          session={23}
          type="current"
          title="Now"
          description="Unique Maya emerged"
        />
      </Timeline>
    </ScrollView>
  );
};

// ==========================================
// ADMIN MOBILE VIEW
// ==========================================

export const MobileAdminDashboard: React.FC = () => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  return (
    <MobileContainer>
      {/* Admin Header */}
      <AdminHeader>
        <Title>ARIA Admin</Title>
        <NotificationBadge count={3} />
      </AdminHeader>

      {/* Tab Navigation */}
      <TabBar>
        <Tab active>Overview</Tab>
        <Tab>Participants</Tab>
        <Tab>Analysis</Tab>
        <Tab>Export</Tab>
      </TabBar>

      {/* Scrollable Content */}
      <ScrollView>
        {/* System Health Card */}
        <HealthCard>
          <HealthIndicator status="healthy" />
          <HealthStats>
            <Stat label="Active Users" value="147" />
            <Stat label="Avg Presence" value="68%" />
            <Stat label="Uniqueness" value="73%" />
          </HealthStats>
        </HealthCard>

        {/* Participant Grid */}
        <ParticipantGrid>
          {participants.map(p => (
            <ParticipantCard
              key={p.id}
              onClick={() => setSelectedParticipant(p)}
            >
              <Avatar>{p.initials}</Avatar>
              <Info>
                <Name>{p.id}</Name>
                <Sessions>{p.sessions} sessions</Sessions>
              </Info>
              <TrustIndicator value={p.trust} />
            </ParticipantCard>
          ))}
        </ParticipantGrid>

        {/* Quick Actions */}
        <QuickActions>
          <ActionButton icon="📊" label="Export Data" />
          <ActionButton icon="📝" label="View Reports" />
          <ActionButton icon="🔍" label="Deep Analysis" />
        </QuickActions>
      </ScrollView>

      {/* Participant Detail Sheet */}
      {selectedParticipant && (
        <BottomSheet onClose={() => setSelectedParticipant(null)}>
          <ParticipantDetails participant={selectedParticipant} />
        </BottomSheet>
      )}
    </MobileContainer>
  );
};

// ==========================================
// RESPONSIVE UTILITIES
// ==========================================

const ResponsiveContainer: React.FC = ({ children }) => {
  const breakpoint = useBreakpoint();

  return (
    <div className={cn(
      'w-full',
      {
        'max-w-sm mx-auto': breakpoint === 'mobile',
        'max-w-2xl mx-auto': breakpoint === 'tablet',
        'max-w-7xl mx-auto grid grid-cols-3 gap-6': breakpoint === 'desktop'
      }
    )}>
      {children}
    </div>
  );
};

// ==========================================
// GESTURE INTERACTIONS
// ==========================================

const SwipeableCard: React.FC = ({ onSwipeLeft, onSwipeRight, children }) => {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useGesture({
    onDrag: ({ down, movement: [mx], velocity }) => {
      api.start({
        x: down ? mx : 0,
        immediate: down
      });

      if (!down) {
        if (mx < -100) onSwipeLeft?.();
        if (mx > 100) onSwipeRight?.();
      }
    }
  });

  return (
    <animated.div
      {...bind()}
      style={{ x }}
      className="touch-none"
    >
      {children}
    </animated.div>
  );
};

// ==========================================
// MOBILE NOTIFICATIONS
// ==========================================

const MobileNotification: React.FC = ({ notification }) => {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="bg-gradient-to-r from-amber-600 to-pink-600 p-4 shadow-lg">
        <div className="flex items-center">
          <Icon>{notification.icon}</Icon>
          <div className="ml-3 flex-1">
            <Title>{notification.title}</Title>
            <Message>{notification.message}</Message>
          </div>
          <CloseButton onClick={notification.dismiss} />
        </div>
      </div>
    </motion.div>
  );
};
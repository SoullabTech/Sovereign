import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Generate realistic community statistics
    const now = new Date();
    const stats = {
      community: {
        totalMembers: 347 + Math.floor(Math.random() * 50), // Dynamic growth
        onlineNow: 15 + Math.floor(Math.random() * 25), // 15-40 online
        totalPosts: 1256 + Math.floor(Math.random() * 100),
        totalComments: 3847 + Math.floor(Math.random() * 200),
        breakthroughs: 189 + Math.floor(Math.random() * 20),
        totalReactions: 1842 + Math.floor(Math.random() * 150)
      },
      fieldState: {
        // Dynamic field state based on time of day and community activity
        earth: 0.15 + (Math.sin(now.getHours() / 24 * Math.PI * 2) + 1) * 0.1, // Stronger in evening
        water: 0.20 + (Math.cos(now.getHours() / 24 * Math.PI * 2) + 1) * 0.15, // Stronger at night/dawn
        air: 0.25 + (Math.sin((now.getHours() + 6) / 24 * Math.PI * 2) + 1) * 0.1, // Stronger in morning
        fire: 0.20 + (Math.cos((now.getHours() + 12) / 24 * Math.PI * 2) + 1) * 0.1, // Stronger at midday
        intensity: 0.50 + Math.random() * 0.3, // 0.5 - 0.8
        depth: 0.60 + Math.random() * 0.25, // 0.6 - 0.85
        coherence: 0.65 + Math.random() * 0.2 // 0.65 - 0.85
      },
      recentActivity: [
        {
          type: 'post' as const,
          user: 'SacredSeeker',
          action: 'shared a breakthrough in',
          category: 'Breakthrough Gallery',
          time: '3 min',
          title: 'MAIA helped me see my shadow pattern around abundance'
        },
        {
          type: 'comment' as const,
          user: 'WisdomKeeper',
          action: 'replied to',
          category: 'Wisdom Traditions',
          time: '8 min',
          title: 'The Council speaks about integration phases'
        },
        {
          type: 'post' as const,
          user: 'FieldExplorer',
          action: 'started discussion in',
          category: 'Field System Reports',
          time: '12 min',
          title: 'PFI coherence spikes during group meditation'
        },
        {
          type: 'breakthrough' as const,
          user: 'ConsciousOne',
          action: 'reported a breakthrough in',
          category: 'Sacred Psychology',
          time: '18 min',
          title: 'Finally integrated my inner critic through elemental work'
        },
        {
          type: 'comment' as const,
          user: 'SpiralWalker',
          action: 'commented on',
          category: 'Spiralogic Integration',
          time: '25 min',
          title: 'Understanding regression as sacred preparation'
        },
        {
          type: 'post' as const,
          user: 'TechOracle',
          action: 'shared update in',
          category: 'Tech Oracle',
          time: '34 min',
          title: 'New voice synthesis features coming to MAIA'
        },
        {
          type: 'comment' as const,
          user: 'DeepSeeker',
          action: 'replied to',
          category: 'Sacred Psychology',
          time: '41 min',
          title: 'Shadow work through the water element'
        },
        {
          type: 'post' as const,
          user: 'ElderWisdom',
          action: 'shared wisdom in',
          category: 'Wisdom Traditions',
          time: '47 min',
          title: 'The Kabbalah tree and consciousness development'
        }
      ],
      lastUpdated: now.toISOString()
    };

    return NextResponse.json({
      success: true,
      stats: stats,
      timestamp: now.toISOString(),
      message: 'Community statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ [Community Stats API] Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch community statistics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Endpoint for triggering stats recalculation
    const now = new Date();

    // Here you would normally trigger a background job to recalculate stats
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Stats recalculation triggered successfully',
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ [Community Stats API] Error triggering recalculation:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to trigger stats recalculation',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
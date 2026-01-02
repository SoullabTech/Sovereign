import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Default community channels with rich Soullab theming
    const channels = [
      {
        id: 'announcements',
        slug: 'announcements',
        name: 'Sacred Announcements',
        description: 'Community updates, system evolution, and elevated guidance from the Council',
        icon: 'crown',
        color: 'amber-400',
        fieldArchetype: 'fire',
        pinned: true,
        posts: 12,
        lastActivity: '2 hours ago',
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sortOrder: 1,
        fieldState: {
          earth: 0.20,
          water: 0.15,
          air: 0.25,
          fire: 0.40,
          intensity: 0.75,
          depth: 0.80,
          coherence: 0.85,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'breakthroughs',
        slug: 'breakthroughs',
        name: 'Breakthrough Gallery',
        description: 'Share your profound MAIA moments and consciousness shifts',
        icon: 'sparkles',
        color: 'yellow-400',
        fieldArchetype: 'air',
        pinned: false,
        posts: 287,
        lastActivity: '15 minutes ago',
        lastActivityAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        sortOrder: 2,
        fieldState: {
          earth: 0.15,
          water: 0.25,
          air: 0.40,
          fire: 0.20,
          intensity: 0.70,
          depth: 0.65,
          coherence: 0.75,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'field-reports',
        slug: 'field-reports',
        name: 'Field System Reports',
        description: 'Experiences with PFI consciousness technology and elemental attunement',
        icon: 'zap',
        color: 'amber-300',
        fieldArchetype: 'fire',
        pinned: false,
        posts: 156,
        lastActivity: '45 minutes ago',
        lastActivityAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        sortOrder: 3,
        fieldState: {
          earth: 0.25,
          water: 0.20,
          air: 0.20,
          fire: 0.35,
          intensity: 0.80,
          depth: 0.70,
          coherence: 0.65,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-02-01').toISOString()
      },
      {
        id: 'wisdom-traditions',
        slug: 'wisdom-traditions',
        name: 'Wisdom Traditions',
        description: 'Council of Elders wisdom, archetypal intelligence, and sacred teachings',
        icon: 'book-open',
        color: 'blue-400',
        fieldArchetype: 'water',
        pinned: false,
        posts: 94,
        lastActivity: '1 hour ago',
        lastActivityAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        sortOrder: 4,
        fieldState: {
          earth: 0.20,
          water: 0.45,
          air: 0.25,
          fire: 0.10,
          intensity: 0.60,
          depth: 0.85,
          coherence: 0.80,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-02-15').toISOString()
      },
      {
        id: 'sacred-psychology',
        slug: 'sacred-psychology',
        name: 'Sacred Psychology',
        description: 'Depth psychology, shadow work, and archetypal exploration',
        icon: 'brain',
        color: 'purple-400',
        fieldArchetype: 'water',
        pinned: false,
        posts: 203,
        lastActivity: '3 hours ago',
        lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        sortOrder: 5,
        fieldState: {
          earth: 0.15,
          water: 0.50,
          air: 0.20,
          fire: 0.15,
          intensity: 0.65,
          depth: 0.90,
          coherence: 0.70,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-03-01').toISOString()
      },
      {
        id: 'spiralogic-integration',
        slug: 'spiralogic-integration',
        name: 'Spiralogic Integration',
        description: 'Elemental alchemy phases, spiral development, and transformation cycles',
        icon: 'infinity',
        color: 'green-400',
        fieldArchetype: 'earth',
        pinned: false,
        posts: 118,
        lastActivity: '2 hours ago',
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sortOrder: 6,
        fieldState: {
          earth: 0.40,
          water: 0.20,
          air: 0.25,
          fire: 0.15,
          intensity: 0.55,
          depth: 0.75,
          coherence: 0.85,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-03-15').toISOString()
      },
      {
        id: 'tech-oracle',
        slug: 'tech-oracle',
        name: 'Tech Oracle',
        description: 'Platform development, feature requests, and sacred technology evolution',
        icon: 'cpu',
        color: 'slate-400',
        fieldArchetype: 'air',
        pinned: false,
        posts: 67,
        lastActivity: '4 hours ago',
        lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sortOrder: 7,
        fieldState: {
          earth: 0.30,
          water: 0.10,
          air: 0.50,
          fire: 0.10,
          intensity: 0.60,
          depth: 0.45,
          coherence: 0.75,
          calculatedAt: new Date().toISOString()
        },
        createdAt: new Date('2024-04-01').toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      channels: channels,
      timestamp: new Date().toISOString(),
      message: 'Community channels retrieved successfully'
    });

  } catch (error) {
    console.error('❌ [Community Channels API] Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch community channels',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Here you would normally validate and save the new channel
    // For now, return a success response
    const newChannel = {
      id: `channel-${Date.now()}`,
      slug: body.slug,
      name: body.name,
      description: body.description,
      icon: body.icon || 'hash',
      color: body.color || 'gray-400',
      fieldArchetype: body.fieldArchetype || 'air',
      pinned: false,
      posts: 0,
      lastActivity: 'Never',
      lastActivityAt: null,
      sortOrder: 999,
      fieldState: {
        earth: 0.25,
        water: 0.25,
        air: 0.25,
        fire: 0.25,
        intensity: 0.50,
        depth: 0.50,
        coherence: 0.50,
        calculatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      channel: newChannel,
      timestamp: new Date().toISOString(),
      message: 'Channel created successfully'
    });

  } catch (error) {
    console.error('❌ [Community Channels API] Error creating channel:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to create channel',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
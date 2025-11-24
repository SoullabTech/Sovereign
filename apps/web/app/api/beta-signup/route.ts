import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      firstName,
      lastName,
      email,
      city,
      preferredElement,
      hasWebcam,
      hasMicrophone,
      techBackground,
      motivation,
      consentAnalytics,
      consentContact,
      signupTimestamp,
      source
    } = data;

    // Validate required fields
    if (!firstName || !lastName || !email || !city) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    if (!consentAnalytics || !consentContact) {
      return NextResponse.json({ 
        error: 'Both consent terms must be accepted' 
      }, { status: 400 });
    }

    // Basic city validation - ensure it's not empty
    if (!city.trim()) {
      return NextResponse.json({ 
        error: 'City is required' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('beta_signups')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'This email is already registered for beta access.' 
      }, { status: 409 });
    }

    // Generate unique beta access ID
    const betaAccessId = `beta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create beta signup record
    const { data: signup, error: signupError } = await supabase
      .from('beta_signups')
      .insert({
        beta_access_id: betaAccessId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        city: city,
        preferred_element: preferredElement || 'aether',
        has_webcam: hasWebcam || false,
        has_microphone: hasMicrophone || false,
        tech_background: techBackground || '',
        motivation: motivation || '',
        consent_analytics: consentAnalytics,
        consent_contact: consentContact,
        signup_source: source || 'beta_signup_page',
        status: 'pending',
        metadata: {
          signupTimestamp,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          cityValidated: true // Assume city is valid since we're accepting the signup
        }
      })
      .select()
      .single();

    if (signupError) {
      console.error('Beta signup database error:', signupError);
      return NextResponse.json({ 
        error: 'Failed to process signup. Please try again.' 
      }, { status: 500 });
    }

    // Create beta tester profile
    await supabase
      .from('beta_testers')
      .insert({
        user_id: betaAccessId,
        username: `${firstName} ${lastName}`,
        email: email,
        preferred_element: preferredElement || 'aether',
        consent_analytics: consentAnalytics,
        onboarding_completed: false,
        metadata: {
          city,
          signupSource: source,
          hasWebcam,
          hasMicrophone,
          techBackground,
          motivation
        }
      });

    // TODO: Send welcome email with beta access link
    // await sendBetaWelcomeEmail(email, firstName, betaAccessId);

    // TODO: Notify team of new beta signup
    // await notifyTeamNewBetaSignup({ firstName, lastName, email, city });

    console.log('Beta signup successful:', {
      email, 
      city, 
      betaAccessId,
      preferredElement 
    });

    return NextResponse.json({
      success: true,
      message: 'Beta signup successful',
      betaAccessId,
      status: 'pending_review'
    });

  } catch (error) {
    console.error('Beta signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 });
  }
}

// Get beta signup statistics (for admin/dashboard use)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if request has admin auth (basic implementation)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: signups, error } = await supabase
      .from('beta_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const stats = {
      total: signups.length,
      pending: signups.filter((s: any) => s.status === 'pending').length,
      approved: signups.filter((s: any) => s.status === 'approved').length,
      rejected: signups.filter((s: any) => s.status === 'rejected').length,
      cities: [...new Set(signups.map((s: any) => s.city))],
      elements: signups.reduce((acc: Record<string, number>, s: any) => {
        acc[s.preferred_element] = (acc[s.preferred_element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      withMicrophone: signups.filter((s: any) => s.has_microphone).length,
      withWebcam: signups.filter((s: any) => s.has_webcam).length,
      recentSignups: signups.slice(0, 10)
    };

    return NextResponse.json({ stats, signups });

  } catch (error) {
    console.error('Beta signup stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stats' 
    }, { status: 500 });
  }
}
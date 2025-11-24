import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Extract booking details from session metadata
    const bookingDetails = {
      id: session.id,
      sessionType: session.metadata?.sessionType || 'consultation',
      date: session.metadata?.date || '',
      time: session.metadata?.time || '',
      duration: parseInt(session.metadata?.duration || '60'),
      clientName: session.metadata?.clientName || session.customer_details?.name || '',
      clientEmail: session.metadata?.clientEmail || session.customer_details?.email || '',
      amount: session.amount_total || 0,
      paymentId: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || '',
      status: session.payment_status
    };

    // Here you would typically:
    // 1. Save the confirmed booking to your database
    // 2. Send confirmation emails
    // 3. Create calendar events
    // 4. Set up reminders

    // For now, we'll return the booking details
    return NextResponse.json(bookingDetails);

  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
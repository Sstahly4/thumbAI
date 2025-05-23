import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, ExtendedSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion will default to the library's pinned version
  typescript: true,
});

interface RequestBody {
  priceId?: string; // Optional: specific price ID from frontend
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized: User not logged in or email missing.' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    let reqBody: RequestBody | null = null;
    try {
      reqBody = await request.json();
    } catch (error) {
      // It's okay if there's no body or it's not JSON, we'll use the default priceId
      console.log("No request body or non-JSON body, proceeding with default price ID if applicable.");
    }

    const targetPriceId = reqBody?.priceId || process.env.STRIPE_DEFAULT_SIGNUP_PRICE_ID;

    if (!targetPriceId) {
      console.error("Target Price ID is not set. Neither STRIPE_DEFAULT_SIGNUP_PRICE_ID is set in environment variables nor was a priceId provided in the request.");
      return NextResponse.json({ error: 'Server configuration error or missing Price ID.' }, { status: 500 });
    }

    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: targetPriceId, // Use the determined price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userEmail,
      success_url: `${YOUR_DOMAIN}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/dashboard/billing?canceled=true`,
    });

    if (!checkoutSession.id) {
      return NextResponse.json({ error: 'Could not create Stripe Checkout session.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: checkoutSession.id });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: `Failed to create Stripe session: ${errorMessage}` }, { status: 500 });
  }
} 
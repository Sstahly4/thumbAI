import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { authOptions } from '@/lib/auth'; // Assuming your NextAuth options are here
import { getServerSession } from "next-auth/next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { priceId, email } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }
     if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // TODO: Potentially fetch user from session if needed or rely on email
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Ensure it's HTTPS for production Vercel deployments
    if (process.env.VERCEL_ENV === 'production' && appUrl.startsWith('http://')) {
      appUrl = appUrl.replace('http://', 'https://');
    }
    // If it's a Vercel preview URL and not localhost, ensure HTTPS
    if (appUrl.includes('vercel.app') && appUrl.startsWith('http://')) {
        appUrl = appUrl.replace('http://', 'https://');
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: email, // Pre-fill email
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // or 'payment' if it's a one-time purchase
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`, // Redirect here after successful payment
      cancel_url: `${appUrl}/stripe-cancel-return?canceled=true&email=${encodeURIComponent(email)}&priceId=${priceId}`, // Point to the new intermediate page
    });

    if (!checkoutSession.url) {
        return NextResponse.json({ error: 'Could not create Stripe checkout session.' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
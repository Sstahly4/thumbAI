import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe only if API key is available
const stripeApiKey = process.env.STRIPE_SECRET_KEY || "";
let stripe: Stripe | null = null;

// Only initialize Stripe if we have an API key
try {
  if (stripeApiKey && stripeApiKey !== "your_stripe_secret_key_here") {
    stripe = new Stripe(stripeApiKey, {
      apiVersion: "2025-03-31.basil",
    });
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
}

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    // For the MVP, we'll just return a mock session ID
    // In production, this would create a real Stripe checkout session
    
    /*
    // Only attempt to create a session if Stripe is initialized
    if (stripe) {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      });

      return NextResponse.json({ sessionId: session.id });
    }
    */
    
    // For MVP, just return a mock session ID
    return NextResponse.json({ 
      sessionId: "mock_session_" + Math.random().toString(36).substring(2, 15)
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
} 
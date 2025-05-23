'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Make sure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is in your .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function NewUserSubscriptionRedirector() {
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait until session is loaded
    }

    if (status === 'unauthenticated') {
      // User is not logged in, no action needed here
      return;
    }

    if (session?.user?.planType === 'pending_subscription' && !isRedirecting) {
      setIsRedirecting(true);
      setError(null);
      console.log('[NewUserSubscriptionRedirector] User has planType: pending_subscription. Attempting redirect to Stripe...');

      const redirectToCheckout = async () => {
        try {
          const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // No body, so API route uses STRIPE_DEFAULT_SIGNUP_PRICE_ID
          });

          const checkoutSession = await response.json();

          if (response.ok && checkoutSession.sessionId) {
            console.log('[NewUserSubscriptionRedirector] Successfully created Stripe Checkout session:', checkoutSession.sessionId);
            const stripe = await stripePromise;
            if (stripe) {
              const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: checkoutSession.sessionId });
              if (stripeError) {
                console.error('[NewUserSubscriptionRedirector] Stripe redirectToCheckout error:', stripeError.message);
                setError(`Failed to redirect to Stripe: ${stripeError.message}`);
                setIsRedirecting(false); // Allow retry or show error
              }
              // If redirectToCheckout is successful, the user is navigated away, no further client-side code here runs for that flow.
            } else {
              console.error('[NewUserSubscriptionRedirector] Stripe.js not loaded.');
              setError('Payment system is not available at the moment. Please try again later.');
              setIsRedirecting(false);
            }
          } else {
            console.error('[NewUserSubscriptionRedirector] Failed to create Stripe Checkout session:', checkoutSession.error || 'Unknown server error');
            setError(`Could not initiate payment: ${checkoutSession.error || 'Please try again later.'}`);
            setIsRedirecting(false);
          }
        } catch (e: any) {
          console.error('[NewUserSubscriptionRedirector] Error during redirect to checkout process:', e);
          setError(`An unexpected error occurred: ${e.message || 'Please try again later.'}`);
          setIsRedirecting(false);
        }
      };

      redirectToCheckout();
    }
  }, [session, status, isRedirecting]);

  if (isRedirecting) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>
        <p>Finalizing your account setup...</p>
        <p>Redirecting to our secure payment provider.</p>
        {/* You can add a spinner or a more elaborate loading animation here */}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>Oops! Something went wrong while setting up your subscription:</p>
        <p>{error}</p>
        <p>Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  // If not redirecting and no error, render nothing (or children if you make it a wrapper)
  return null;
} 
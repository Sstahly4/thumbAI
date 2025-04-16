"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setIsLoading(true);
    setError("");

    try {
      // For MVP, this will just redirect to a success page
      // In production, this would connect to a real Stripe checkout session
      
      // Uncomment this for actual Stripe integration
      /*
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || "Something went wrong with the payment");
        }
      }
      */
      
      // For MVP, just simulate a success
      setTimeout(() => {
        window.location.href = "/checkout/success";
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Payment processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full bg-white/5 p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Subscribe to ThumbAI</h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Monthly subscription</span>
            <span className="font-semibold">$5.00</span>
          </div>
          <div className="h-px bg-white/10 mb-2"></div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>$5.00 USD</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="font-semibold mb-2">What you get:</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Generate unlimited thumbnails
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              High-resolution downloads
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No account required
            </li>
          </ul>
        </div>
        
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white p-3 rounded-md font-medium mb-4"
        >
          {isLoading ? "Processing..." : "Subscribe Now - $5/month"}
        </button>
        
        <div className="text-center">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Cancel and return to home
          </Link>
        </div>
      </div>
    </main>
  );
} 
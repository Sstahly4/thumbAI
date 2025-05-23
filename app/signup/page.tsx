"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [priceIdFromQuery, setPriceIdFromQuery] = useState<string | null>(null)

  useEffect(() => {
    const canceled = searchParams.get('canceled')
    const emailFromQuery = searchParams.get('email')
    const priceIdQuery = searchParams.get('priceId')

    if (canceled === 'true') {
      setMessage("Your payment process was canceled. You can try signing up again.")
    }
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery))
    }
    if (priceIdQuery) {
      setPriceIdFromQuery(priceIdQuery)
    }
    
    if (canceled || emailFromQuery || priceIdQuery) {
        const currentPath = window.location.pathname
        const newParams = new URLSearchParams(window.location.search)
        newParams.delete('canceled')
        newParams.delete('email')
        newParams.delete('priceId')
        const newSearch = newParams.toString()
        const newUrl = newSearch ? `${currentPath}?${newSearch}` : currentPath
        if(searchParams.get('canceled') || searchParams.get('email') || searchParams.get('priceId')) {
            router.replace(newUrl, { scroll: false })
        }
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    if (!email) {
      setError("Email is required.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/check-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred checking user status.");
        setIsLoading(false);
        return;
      }

      if (data.status === 'existing_user') {
        setError("An account with this email already exists. Please log in.");
        setIsLoading(false);
      } else if (data.status === 'new_user') {
        // Initiate Stripe checkout directly
        try {
          const priceIdToUse = priceIdFromQuery || process.env.NEXT_PUBLIC_STRIPE_DEFAULT_SIGNUP_PRICE_ID;
          
          if (!priceIdToUse) {
            setError("Stripe Price ID is not configured or provided.");
            setIsLoading(false);
            return;
          }

          const checkoutResponse = await fetch('/api/stripe/checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId: priceIdToUse, email }),
          });

          const checkoutData = await checkoutResponse.json();

          if (!checkoutResponse.ok) {
            throw new Error(checkoutData.error || "Failed to create checkout session.");
          }

          if (checkoutData.url) {
            router.push(checkoutData.url); // Redirect to Stripe checkout
          } else {
            setError("Could not retrieve Stripe checkout URL.");
            setIsLoading(false);
          }
        } catch (err: any) {
          console.error("Failed to initiate Stripe checkout:", err);
          setError(err.message || "An unexpected error occurred during payment initiation.");
          setIsLoading(false);
        }
      } else {
        setError("Received an unexpected status from server.");
        setIsLoading(false);
      }

    } catch (err) {
      setError("An unexpected error occurred.")
      console.error("Signup error:", err)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
            Note that phone verification may be required for signup. <br />Your number will only be used to verify your identity for security purposes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="sr-only">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>}
          {message && <p className="text-xs text-green-600 dark:text-green-400 text-center">{message}</p>}
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 dark:focus:ring-offset-gray-950"
            >
              {isLoading ? "Processing..." : "Continue with Email"}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
              Or
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
            onClick={async () => {
              setIsLoading(true);
              try {
                const result = await signIn('github', { 
                  callbackUrl: '/signup',
                  redirect: false 
                });
                
                if (result?.error) {
                  setError(result.error);
                } else if (result?.url) {
                  router.push(result.url);
                }
              } catch (err) {
                setError("An error occurred during GitHub sign in");
                console.error("GitHub sign in error:", err);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <Image src="/images/Octicons-mark-github.svg.png" alt="GitHub Logo" width={20} height={20} className="mr-2" />
            Continue with GitHub
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600">
            <Image src="/images/Apple_logo_black.svg" alt="Apple Logo" width={20} height={20} className="mr-2" />
            Continue with Apple
          </Button>
        </div>

        <div className="text-sm text-center mt-8">
          <Link href="/" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
} 
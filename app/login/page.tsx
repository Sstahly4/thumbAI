"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrlFromParams = searchParams.get('callbackUrl');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Determine login mode based on password input
  const isMagicLinkMode = EMAIL_REGEX.test(email) && password.length === 0;
  const showPasswordLoginPrompt = password.length > 0; // For dynamic divider text

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Email is required.");
      setIsLoading(false);
      return;
    }

    if (!isMagicLinkMode && !password) {
      setError("Password is required for standard login.");
      setIsLoading(false);
      return;
    }

    try {
      if (isMagicLinkMode) {
        // Magic Link (Email Provider)
        const result = await signIn('email', {
          email,
          redirect: false,
          callbackUrl: callbackUrlFromParams || '/dashboard',
        });
        if (result?.error) {
          setError(result.error === "EmailSent" ? null : result.error); // "EmailSent" is not really an error for UI
          if (result.ok && !result.error) { // NextAuth might return ok and an error like "EmailSent"
            setMessage("Check your email for a magic link to log in!");
            setEmail(""); // Clear email field after successful request
          } else if (result.error && result.error !== "EmailSent") {
            setError(result.error);
          }
        } else if (result?.ok) {
          setMessage("Check your email for a magic link to log in!");
          setEmail(""); // Clear email field after successful request
        }
      } else {
        // Credentials Provider
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
          callbackUrl: callbackUrlFromParams || '/dashboard',
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" || result.error === "Invalid credentials or password not set" || result.error === "Invalid credentials" 
            ? "Invalid email or password."
            : result.error);
      } else if (result?.ok) {
        router.push(callbackUrlFromParams || "/dashboard");
      } else {
        setError("An unknown error occurred during login.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
             Welcome Back
            </h2>
             <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred method below.
            </p>
        </div>

        <div className="space-y-3 mt-8">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
            onClick={() => signIn('github', { callbackUrl: callbackUrlFromParams || '/dashboard' })}
          >
            <Image src="/images/Octicons-mark-github.svg.png" alt="GitHub Logo" width={20} height={20} className="mr-2" />
            Continue with GitHub
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600">
            <Image src="/images/Apple_logo_black.svg" alt="Apple Logo" width={20} height={20} className="mr-2" />
            Continue with Apple
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
              {showPasswordLoginPrompt ? "Or log in with Email & Password" : "Or"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md shadow-sm">
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
            <div className="mt-3">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password (optional for magic link)"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password"
              className="font-medium text-purple-600 hover:text-purple-500 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>}
          {message && <p className="text-xs text-green-600 dark:text-green-400 text-center">{message}</p>}

          <div>
            <Button
              type="submit"
              disabled={isLoading || !email || (!isMagicLinkMode && !password)}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 dark:focus:ring-offset-gray-950"
            >
              {isLoading 
                ? (isMagicLinkMode ? "Sending link..." : "Logging in...") 
                : (isMagicLinkMode ? "Send Magic Link" : "Log In")}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            No account?{" "}
            <Link href={{ pathname: '/signup', query: callbackUrlFromParams ? { callbackUrl: callbackUrlFromParams } : {} }} className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
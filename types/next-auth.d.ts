import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      /** The user's email. */
      email: string
      /** The user's name. */
      name?: string | null
      /** The user's subscription plan type. */
      planType?: string | null
      /** The user's Stripe subscription status. */
      stripeSubscriptionStatus?: string | null
      /** The user's Stripe customer ID. */
      stripeCustomerId?: string | null
      /** Whether the user has a password set. */
      hasPassword?: boolean
    } & DefaultSession["user"] // Keep other default user props like image
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string
    email: string
    name?: string | null
    planType?: string | null
    stripeSubscriptionStatus?: string | null
    stripeCustomerId?: string | null
    hasPassword?: boolean
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string
    /** User ID */
    id?: string
    /** User email */
    email?: string
    /** User name */
    name?: string | null
    planType?: string | null
    stripeSubscriptionStatus?: string | null
    stripeCustomerId?: string | null
    hasPassword?: boolean
  }
} 
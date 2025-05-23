import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma" // Assuming you have a prisma client export here
import bcryptjs from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email-templates"

// Note: The User, Session, JWT type augmentations are now expected
// to be in thumbai/types/next-auth.d.ts and should be picked up globally.

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Changed from "database" to "jwt"
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // Override NextAuth's default email sending with our custom Resend logic
      async sendVerificationRequest({ identifier: email, url, provider }) {
        // 'provider.from' would be process.env.EMAIL_FROM
        // 'provider.server' holds the SMTP config
        // We will use our sendVerificationEmail which uses Resend API directly
        // It uses 'ThumbAI <no-reply@thumbai.dev>' as 'from' internally
        console.log(`[Auth][EmailProvider] Attempting to send verification email to ${email} via custom sendVerificationRequest.`);
        try {
          await sendVerificationEmail({ email, url, name: email.split('@')[0] }); // Passing email as name for now
          console.log(`[Auth][EmailProvider] Custom sendVerificationRequest: Email sent to ${email}`);
        } catch (error) {
          console.error("[Auth][EmailProvider] Custom sendVerificationRequest: Error sending email:", error);
          // Rethrow or handle as per your error strategy, NextAuth expects a promise
          throw new Error(`Failed to send verification email via custom Resend: ${(error as Error).message}`);
        }
      }
    }),
    CredentialsProvider({
      name: "credentials", // Default name, can be anything
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("[Auth][Authorize] Attempting login for:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth][Authorize] Missing email or password.");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          console.log("[Auth][Authorize] User not found:", credentials.email);
          return null;
        }

        // Ensure user.password is not null before comparing
        if (!user.password) {
          console.log("[Auth][Authorize] User found, but no password set:", credentials.email);
          return null; // Or handle as an error appropriate for your app
        }

        const isValidPassword = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          console.log("[Auth][Authorize] Invalid password for:", credentials.email);
          return null;
        }

        console.log("[Auth][Authorize] Credentials valid for:", user.id);
        // Return the user object that will be used by NextAuth
        // It must include at least id. Other fields are for JWT/session population.
        if (!user.email) {
          console.log("[Auth][Authorize] User found but email is null:", user.id);
          return null;
        }
        return {
          id: user.id,
          email: user.email, // email is required by NextAuth User type
          name: user.name ?? undefined,   // name can be undefined
          // Add custom fields if needed in the future
        };
      }
    })
    // We can add back other providers (Google, GitHub, Email) later
    // once basic credential login and session creation is working.
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: triggerSession }) {
      console.log("[Auth][jwt] Triggered. User:", user, "Token:", token, "Trigger:", trigger);
      // Initial sign-in or when user object is passed
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        // Fetch user from DB to check password status and get latest image
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { password: true, image: true },
        });
        token.hasPassword = !!dbUser?.password;
        if (dbUser?.image !== undefined) token.image = typeof dbUser.image === 'string' ? dbUser.image : undefined;
        console.log("[Auth][jwt] During sign-in/user present. User ID:", user.id, "Has password?", token.hasPassword, "Image:", token.image);
      }

      // Handle session updates, e.g., after password change or image change
      if (trigger === "update" && triggerSession?.event === "session") {
        console.log("[Auth][jwt] Session update triggered. Current token ID:", token.id);
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { password: true, name: true, email: true, image: true }, // Fetch relevant fields
          });
          if (dbUser) {
            token.hasPassword = !!dbUser.password;
            token.name = dbUser.name ?? undefined;
            token.email = dbUser.email ?? undefined;
            token.image = typeof dbUser.image === 'string' ? dbUser.image : undefined;
            console.log("[Auth][jwt] Updated token after session update. Has password?", token.hasPassword, "Image:", token.image);
          } else {
            console.log("[Auth][jwt] User not found during session update for token ID:", token.id);
          }
        } else {
          console.log("[Auth][jwt] Token ID missing during session update trigger.");
        }
      }

      console.log("[Auth][jwt] Returning token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth][session] Triggered. Token:", token, "Session:", session);
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email ?? "";
        if (token.name) {
          session.user.name = token.name;
        }
        // Always fetch the latest user data from the DB for image
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { image: true },
        });
        session.user.image = typeof dbUser?.image === 'string' ? dbUser.image : undefined;
        session.user.hasPassword = !!token.hasPassword;
        console.log("[Auth][session] Populated session.user.hasPassword:", session.user.hasPassword, "Image:", session.user.image);
      }
      console.log("[Auth][session] Returning session:", session);
      return session;
    }
  },
  pages: {
    signIn: "/signup", // Changed to /signup for a unified flow
    // error: '/auth/error', // Optional: custom error page
  },
  debug: process.env.NODE_ENV === "development", // Enable debug messages in development
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in .env
}; 
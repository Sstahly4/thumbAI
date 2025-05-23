# ThumbAI: YouTube Thumbnail Generator

ThumbAI is an AI-powered YouTube thumbnail generator that allows users to create engaging, click-worthy thumbnails based on sketches and text prompts.

## Features

- Upload or draw a rough sketch
- Add reference photos
- Enter text prompts
- Generate 5 thumbnail variations
- Download high-resolution images
- Simple $5/month subscription

-Add a AI button on the prompt section, for chatGPT to enhance the prompt ----------------
-Add a little % off nect to the yearly pricing --------------------
-Add Sign in by Guthib, Apple, Gmail
-Add by dfault on yearly to add price acaceptance--------
-split features up by subscription.
-Add proper token and tracking. 
-Add "Remember me" functionality
-With the Magic Link login. We need to add IP securty and maybe ocation secruty. If in a diffrent location or a diffrent IP you cant login with magic link. 


-You have a domian now. You can set up proper lagic link and morex


SQLite is not recommended for production with many users.
Use PostgreSQL, MySQL, or another production DB for real scalability.


Credentials Provider (Email/Password Login):
You've already defined CredentialsProvider in lib/auth.ts (Task P1.3.2).
Your authorize function in this provider handles finding a user by email and verifying their password using bcryptjs.
Your login (app/login/page.tsx - Task P1.6.2) and signup (app/signup/page.tsx - Task P1.6.1) pages are set up to use this.
Next Steps:
Thorough Testing: Test the complete sign-up flow (creating a user with a hashed password) and the sign-in flow (verifying credentials).
Password Hashing on Signup: Ensure that when a user signs up with a password, it's being securely hashed with bcryptjs before being stored in the User table in your database. This logic would typically be in your signup API endpoint or form handler.
Error Handling: Robustly handle errors on the login/signup forms (e.g., "Invalid credentials," "Email already taken," "Password too weak").
User Profile Management:
Users will want to manage their details.
Next Steps:
Create a section (perhaps on the /dashboard/settings page) where users can update their name.
Implement functionality for users to change their password. This involves verifying their current password and then updating it with a new, hashed password.


Consider adding options to update their email (which might require a re-verification step).
Password Reset Functionality:
This is a common requirement.
Next Steps:
Implement a "Forgot Password" flow:
User enters their email.
A unique, time-limited token is generated and stored (e.g., in the VerificationToken table or a new dedicated table) and an email is sent to the user with a link containing this token.
User clicks the link, is taken to a page to enter a new password.
The token is verified, and the user's password is updated (hashed, of course).
Enhancing Session Management:
While active session tracking is working, you can enhance it.
The "Revoke" button functionality (Task P6.2.2) on the ActiveSessionsCard.tsx needs to call the DELETE /api/user/sessions/{id} route (Task P6.1.4), which you'll need to implement to delete a specific session from the database.




## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Anthropic/OpenAI API (for AI generation)
- Stripe (for payments)


cd /Users/seth/Desktop/ThumbAI/thumbai && npm run dev

  cd thumbai
  npx inngest-cli@latest dev

   cd thumbai
   npm run dev


cd thumbai
vercel --prod

git add .
git commit -m "Update message"
git push






Core System (NextAuth.js & Prisma): We've integrated NextAuth.js to handle all the login/logout magic and Prisma to manage user data in a database (SQLite for now).
User Info Storage: When a user signs up, their details (email, etc.) are stored in the database. We've also added fields to eventually store subscription status and credits.
How Users Sign Up/In:
Email Magic Links (EmailProvider): Users can enter their email on the signup page. They'll get an email with a special link. Clicking that link logs them in. This is the primary way for new users to create an account and log in. (If email sending isn't fully configured yet, the magic link might appear in your terminal's console output where you run npm run dev).
Email & Password (CredentialsProvider): Users can also log in using an email and password on the login page.
Important for Signup: On the /signup page, if a user enters an email and a password, the system currently tries to log them in with those credentials. It does not create a new account with that password if the user doesn't exist. So, for a brand new user, providing a password on the signup page will likely result in a "user not found" or "invalid credentials" type of error. They should use the magic link option first.
Login Page (/login):
A dedicated page for users who already have an account (and potentially a password set) to log in.
It also has an option to send a magic link if they prefer or have forgotten their password.
Links to the signup page.
Signup Page (/signup):
The main page for new users. As mentioned, the "magic link" (email-only) option is the one that will create their account and log them in.
Dashboard Access (/dashboard):
This page is now protected. If you're not logged in and try to access it, you'll be redirected to the /login page.
If you are logged in, you'll see the dashboard content and a "Sign Out" button.
Session Management: The system keeps track of whether a user is logged in or not as they navigate the site.



"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from "./components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard on component mount
    router.replace('/dashboard');
  }, [router]);

  // Display a loading state while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="flex flex-col items-center">
        <LoadingSpinner size={10} />
        <p className="mt-4 text-lg text-gray-300">Redirecting to dashboard...</p>
      </div>
    </div>
  );
} 


## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- NPM or Yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thumbai.git
cd thumbai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PRICE_ID=your_stripe_price_id_here

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The app is configured for easy deployment with Vercel.

1. Push your code to a GitHub repository.
2. Connect your repository in the Vercel dashboard.
3. Set up the environment variables in the Vercel dashboard.
4. Deploy!

Alternatively, you can deploy directly from the command line:

```bash
npm install -g vercel
vercel login
vercel
```

## MVP Implementation Notes

- The current version uses placeholder images for the thumbnail generation.
- To implement actual AI generation, uncomment the relevant code in `app/api/generate/route.ts`.
- For real Stripe integration, uncomment the code in `app/checkout/page.tsx`.

## License

[MIT](LICENSE)

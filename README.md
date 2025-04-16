# ThumbAI: YouTube Thumbnail Generator

ThumbAI is an AI-powered YouTube thumbnail generator that allows users to create engaging, click-worthy thumbnails based on sketches and text prompts.

## Features

- Upload or draw a rough sketch
- Add reference photos
- Enter text prompts
- Generate 5 thumbnail variations
- Download high-resolution images
- Simple $5/month subscription

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Anthropic/OpenAI API (for AI generation)
- Stripe (for payments)

git add .
git commit -m "Update message"
git push


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

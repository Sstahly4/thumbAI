#!/bin/bash

# Set exit on error
set -e

echo "===== ThumbAI Deployment Script ====="

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Using Node.js version: $NODE_VERSION"

# Update npm packages and force install
echo "Installing all dependencies..."
npm install --force

# Specifically ensure required dependencies are installed
echo "Ensuring Inngest and Redis dependencies are installed..."
npm install @upstash/redis inngest inngest-cli --save

# Create a special file for Vercel that forces it to include these modules
# Vercel sometimes misses dependencies that aren't directly imported in code
echo "Creating vercel-build-pre.js to ensure all modules are included..."
cat > vercel-build-pre.js << EOL
// This file ensures Vercel includes these modules in the deployment
// It's imported by next.config.ts
const inngest = require('inngest');
const inngestCli = require('inngest-cli');
const redis = require('@upstash/redis');

console.log('Pre-build check: Required modules are available');
console.log('Inngest version:', inngest.version);
console.log('Redis client available:', !!redis);
EOL

# Update next.config.ts to import the pre-build file
echo "Updating next.config.ts to import pre-build checks..."
cat > next.config.ts.new << EOL
// @ts-check
// Import this file to force inclusion of dependencies
import './vercel-build-pre.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['openai', 'axios', 'fabric', 'konva', 'react-konva', 'inngest', '@upstash/redis'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['placehold.co', 'oaidalleapiprodscus.blob.core.windows.net'],
  },
};

export default nextConfig;
EOL

mv next.config.ts.new next.config.ts

# Create a .npmrc file to ignore engine restrictions
echo "Creating .npmrc to bypass engine restrictions..."
echo "engine-strict=false" > .npmrc

# Check if we're in the right directory
echo "Current directory: $(pwd)"
ls -la

# Update the vercel.json file
echo "Ensuring vercel.json is properly configured..."
cat vercel.json

# Inform about Vercel integration
echo "======================================"
echo "IMPORTANT: Make sure to install the Inngest Vercel integration"
echo "Go to Vercel dashboard -> Project -> Settings -> Integrations"
echo "Search for 'Inngest' and install it"
echo "======================================"

# Run deployment
echo "Deploying to Vercel..."
VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep projectId | cut -d '"' -f 4)
echo "Project ID: $VERCEL_PROJECT_ID"

vercel --prod

echo "Deployment process completed." 
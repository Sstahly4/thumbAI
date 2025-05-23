// This file ensures Vercel includes these modules in the deployment
// It's imported by next.config.ts
const inngest = require('inngest');
const redis = require('@upstash/redis');

console.log('Pre-build check: Required modules are available');
console.log('Inngest version:', inngest.version);
console.log('Redis client available:', !!redis);

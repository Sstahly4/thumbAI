import { NextResponse } from 'next/server';
import { loadEnvVars } from '../../utils/env';

export async function GET() {
  // First, load env vars manually
  const loaded = loadEnvVars();
  
  // Get all Redis-related environment variables
  const redisEnvVars = {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "present but masked" : undefined,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN ? "present but masked" : undefined,
    KV_URL: process.env.KV_URL ? "present but masked" : undefined,
    REDIS_URL: process.env.REDIS_URL ? "present but masked" : undefined,
  };

  console.log("Environment variables check after manual loading:", redisEnvVars);
  console.log("Did loadEnvVars() work?", loaded);
  
  // Also log all environment variable keys that include "KV" or "REDIS"
  const kvRedisKeys = Object.keys(process.env).filter(key => 
    key.includes('KV_') || key.includes('REDIS') || key.includes('UPSTASH')
  );
  console.log("All KV/REDIS related keys:", kvRedisKeys);

  return NextResponse.json({
    message: "Check server logs for environment variables info",
    envLoadAttempted: loaded,
    redisVarsPresent: {
      KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
      KV_REST_API_TOKEN: Boolean(process.env.KV_REST_API_TOKEN),
      KV_REST_API_READ_ONLY_TOKEN: Boolean(process.env.KV_REST_API_READ_ONLY_TOKEN),
      KV_URL: Boolean(process.env.KV_URL),
      REDIS_URL: Boolean(process.env.REDIS_URL),
    },
    relevantKeysFound: kvRedisKeys,
  });
} 
// Simple script to test Redis connectivity
const fs = require('fs');
const path = require('path');
const { Redis } = require('@upstash/redis');

// Function to load environment variables manually
function loadEnvVars() {
  try {
    const rootDir = process.cwd();
    console.log("Current working directory:", rootDir);
    
    const envPath = path.join(rootDir, '.env.local');
    console.log("Looking for .env.local at:", envPath);
    
    if (fs.existsSync(envPath)) {
      console.log(".env.local file found!");
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      // Parse and set each line
      envLines.forEach(line => {
        if (line.trim().startsWith('#') || !line.trim()) return;
        
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex).trim();
          let value = line.substring(equalIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          
          process.env[key] = value;
          console.log(`Set environment variable: ${key}`);
        }
      });
      
      return true;
    } else {
      console.error(".env.local file not found!");
      return false;
    }
  } catch (error) {
    console.error("Error loading environment variables:", error);
    return false;
  }
}

// Load the environment variables
const loaded = loadEnvVars();
console.log("Environment variables loaded:", loaded);

// Display Redis-related environment variables
console.log("KV_REST_API_URL:", process.env.KV_REST_API_URL ? "exists" : "missing");
console.log("KV_REST_API_TOKEN:", process.env.KV_REST_API_TOKEN ? "exists" : "missing");

// Try to initialize Redis
let redis = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    console.log("Redis client initialized.");
    
    // Test basic Redis operations
    async function testRedis() {
      try {
        // Set a test value
        const testKey = `test:${Date.now()}`;
        await redis.set(testKey, "Hello from test script");
        console.log(`Set test key ${testKey}`);
        
        // Get the test value
        const value = await redis.get(testKey);
        console.log(`Retrieved test key ${testKey}: ${value}`);
        
        // Delete the test key
        await redis.del(testKey);
        console.log(`Deleted test key ${testKey}`);
        
        console.log("Redis test successful!");
      } catch (error) {
        console.error("Redis operation failed:", error);
      }
    }
    
    testRedis().catch(console.error);
  } else {
    console.error("Redis environment variables not available after loading!");
    console.log("All environment variables:", Object.keys(process.env));
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
} 
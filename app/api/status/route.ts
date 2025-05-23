import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { loadEnvVars } from "../../utils/env";

// Load environment variables
loadEnvVars();

// Fallback thumbnails in case of errors or timeout
const FALLBACK_THUMBNAILS = [
  "https://placehold.co/1280x720/3b82f6/FFFFFF/png?text=Processing+1",
  "https://placehold.co/1280x720/ef4444/FFFFFF/png?text=Processing+2",
  "https://placehold.co/1280x720/22c55e/FFFFFF/png?text=Processing+3",
  "https://placehold.co/1280x720/f59e0b/FFFFFF/png?text=Processing+4",
  "https://placehold.co/1280x720/8b5cf6/FFFFFF/png?text=Processing+5",
];

// Initialize Redis client
let redis: Redis | null = null;
try {
  // Check if env vars are present before initializing
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    console.log("Upstash Redis client initialized successfully for status API");
  } else {
    console.error("Upstash Redis environment variables not found for status API");
  }
} catch (error) {
  console.error("Failed to initialize Upstash Redis client for status API:", error);
  redis = null;
}

export async function GET(request: NextRequest) {
  // Get the job ID from the URL
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json({
      status: "failed",
      error: "Missing job ID",
    }, { status: 400 });
  }
  
  if (!redis) {
    return NextResponse.json({
      status: "failed",
      error: "Status service unavailable",
      thumbnails: FALLBACK_THUMBNAILS
    }, { status: 500 });
  }
  
  try {
    // Retrieve job status from Redis
    const key = `thumbnail:job:${jobId}`;
    const statusData = await redis.get(key);
    
    if (!statusData) {
      return NextResponse.json({
        status: "failed",
        error: "Job not found or expired",
        thumbnails: FALLBACK_THUMBNAILS
      }, { status: 404 });
    }
    
    // Parse the status data
    let parsedData: any;
    try {
      // Handle both string and object formats
      parsedData = typeof statusData === 'string' ? JSON.parse(statusData) : statusData;
    } catch (parseError) {
      console.error(`Failed to parse status data for job ${jobId}:`, parseError);
      console.error("Raw data:", statusData);
      return NextResponse.json({
        status: "failed",
        error: "Invalid job data format",
        thumbnails: FALLBACK_THUMBNAILS
      }, { status: 500 });
    }
    
    // Ensure we have a well-formed response
    const response = {
      status: parsedData.status || "unknown",
      ...(parsedData.data || {}),
      timestamp: new Date().toISOString()
    };
    
    if (!response.thumbnails && response.status !== "completed") {
      response.thumbnails = FALLBACK_THUMBNAILS;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error retrieving status for job ${jobId}:`, error);
    return NextResponse.json({
      status: "failed",
      error: "Failed to retrieve job status",
      thumbnails: FALLBACK_THUMBNAILS
    }, { status: 500 });
  }
} 
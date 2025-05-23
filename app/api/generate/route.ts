import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { loadEnvVars } from "../../utils/env";
import { inngest } from "../../lib/inngest"; // Updated import path
import { Redis } from "@upstash/redis";

// Load environment variables
loadEnvVars();

// Debug environment variables
console.log("API Route Loaded (Direct OpenAI Implementation)");
console.log("OpenAI API Key exists:", Boolean(process.env.OPENAI_API_KEY));

// Initialize OpenAI client safely
let openai: OpenAI | null = null;
try {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({ apiKey });
    console.log("OpenAI client initialized successfully");
  } else {
    console.warn("Invalid or empty OpenAI API key");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

// Initialize Redis client from environment variables
let redis: Redis | null = null;
try {
  // Check if env vars are present before initializing - use KV_* variables
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    console.log("Upstash Redis client initialized successfully for generate API");
  } else {
    console.error("Upstash Redis environment variables (KV_REST_API_*) not found. Will fall back to direct OpenAI generation.");
  }
} catch (error) {
  console.error("Failed to initialize Upstash Redis client:", error);
  redis = null; // Ensure redis is null if init fails
}

// Fallback thumbnails in case of errors or timeout
const FALLBACK_THUMBNAILS = [
  "https://placehold.co/1280x720/3b82f6/FFFFFF/png?text=Thumbnail+1",
  "https://placehold.co/1280x720/ef4444/FFFFFF/png?text=Thumbnail+2", 
  "https://placehold.co/1280x720/22c55e/FFFFFF/png?text=Thumbnail+3",
  "https://placehold.co/1280x720/f59e0b/FFFFFF/png?text=Thumbnail+4",
  "https://placehold.co/1280x720/8b5cf6/FFFFFF/png?text=Thumbnail+5",
];

// Enhanced prompt template for thumbnail generation
const getSystemPrompt = (
  userPrompt: string, 
  variationType: 'main' | 'slight_variation' = 'main',
  styleKeywords?: string // Optional: for the "Thumbnail Styles" feature
) => {
  // Core instruction: Focus on the user's request.
  let systemPrompt = `Generate a professional, high-click-through-rate YouTube thumbnail based *ONLY* on the following user request: "${userPrompt}".\n\n`;

  // Apply selected style if provided
  if (styleKeywords) {
    systemPrompt += `Apply the following style: "${styleKeywords}".\n\n`;
  }

  // Variation instruction (if applicable)
  if (variationType === 'slight_variation') {
    systemPrompt += `IMPORTANT INSTRUCTION FOR VARIATION: This is a second version. Introduce ONE subtle but clear visual difference suitable for A/B testing (e.g., change primary text color, different background hue, adjust a minor supporting visual element). The core subject, composition, and any text from the user's original prompt MUST remain the same.\n\n`;
  }

  systemPrompt += `CRITICAL GUIDELINES FOR THE THUMBNAIL:\n
1.  **Aspect Ratio & Safe Zone**:
    *   Design for a 16:9 aspect ratio.
    *   IMPORTANT: All critical visual elements (faces, main objects, all text) MUST be clearly visible within the central 80% of the image. Edges may be cropped. Do NOT place important details near the absolute edges.

2.  **Subject Matter**:
    *   The main subject(s) and action(s) of the thumbnail MUST be directly derived from the user's request: "${userPrompt}".
    *   DO NOT add people, faces, specific text (like \'1000M\'), or objects (like arrows) UNLESS they are EXPLICITLY mentioned in the user\'s request. If the user asks for a landscape, do not add a person. If the user asks for a product shot, do not add an arrow unless requested.

3.  **Visual Quality & Composition**:
    *   Image must be crystal clear, professional quality, with excellent lighting and depth.
    *   Create a high-impact, attention-grabbing layout.
    *   Use the rule of thirds and leading lines effectively if appropriate for the subject.
    *   Ensure a clean, uncluttered design. Key elements should be easily distinguishable.

4.  **Human Elements (ONLY IF IN USER PROMPT)**:
    *   If the user\'s request includes people/faces, ensure they are natural, expressive, and convey authentic emotions relevant to the prompt.
    *   Faces should be a focal point and positioned within the central safe zone.

5.  **Text Elements (ONLY IF IN USER PROMPT)**:
    *   If the user\'s request includes specific text, render it with perfect clarity and readability at thumbnail size.
    *   Use dynamic, high-contrast typography.
    *   Position any requested text centrally and within the safe zone.
    *   Ensure text complements visuals without overwhelming them.
    *   DO NOT invent text if none is provided in the user\'s request.

6.  **Overall Style & Finish**:
    *   Apply cohesive, professional color grading suitable for the prompt\'s content and any selected style.
    *   Use subtle shadows/highlights for dimension where appropriate.
    *   Balance contrast and brightness for optimal visibility on YouTube.

Final Check: The thumbnail must be compelling and optimized for YouTube\'s 16:9 display. Re-read the user\'s request ("${userPrompt}") and ensure ONLY the elements they asked for are the primary focus, styled professionally according to these guidelines.`;

  return systemPrompt;
};

export async function POST(request: NextRequest) {
  console.log("Generate POST request received");
  try {
    // Basic validation
    if (!openai) {
      console.error("OpenAI client not available");
      return NextResponse.json({ 
        error: "Server configuration error. Please try again later.",
        thumbnails: FALLBACK_THUMBNAILS
      }, { status: 500 });
    }

    // Parse necessary data from the request
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string || '';

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({
        error: "Please provide a descriptive prompt (at least 3 characters)",
        thumbnails: FALLBACK_THUMBNAILS
      }, { status: 400 });
    }
    
    // Generate a unique Job ID for tracking
    const jobId = randomUUID();

    // Check if we should use Inngest (background job) or direct generation
    const useInngest = redis !== null;
    
    if (useInngest) {
      try {
        // Store initial pending status in Redis
        const key = `thumbnail:job:${jobId}`;
        await redis!.set(key, JSON.stringify({
          status: 'pending',
          data: { message: 'Job submitted to background processing' }
        }), { ex: 3600 }); // 1 hour expiration
        
        console.log("Sending event to Inngest");
        
        // Send event using the Inngest client
        await inngest.send({
            name: "thumbai/thumbnail.generate",
            data: {
              prompt,
              jobId,
              timestamp: Date.now(),
              source: "api",
              version: "1.0"
            }
        });
        
        console.log(`Job ${jobId} sent to Inngest successfully`);
        
        // Return the job ID so the frontend can poll for status
        return NextResponse.json({
          status: "pending",
          jobId,
          message: "Job submitted for background processing",
          thumbnails: FALLBACK_THUMBNAILS, // Send fallbacks while processing
        });
      } catch (inngestError) {
        console.error(`Failed to submit job to Inngest: ${inngestError}`);
        if (inngestError instanceof Error) {
          console.error('Inngest error details:', inngestError.message, inngestError.stack);
        }
        console.log("Falling back to direct generation");
        // Fall through to direct generation
      }
    }

    // If we get here, either Inngest isn't configured or sending the event failed
    // So we'll do direct generation instead
    console.log(`Starting direct image generation for prompt: "${prompt}"`);
    
    try {
      // Set a timeout for the API call (within Vercel's 3 minute serverless function limit)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Image generation timed out. This could be due to high traffic or complexity of the request. Please try again or simplify your prompt.")), 170000)
      );
      
      // Make the API call with a timeout
      const imageResponsePromise = openai.images.generate({
        model: "gpt-image-1",
        prompt: getSystemPrompt(prompt),
        n: 1,
        size: "1536x1024", // Using supported size, will be resized to 1280x720 on client
        quality: "high" // Options: low, medium, high
      }).catch(error => {
        // Enhanced error handling for OpenAI API errors
        console.error("OpenAI API error details:", error);
        
        // Try to extract more details from the error
        let errorMessage = "Image generation failed";
        let statusCode = 500;
        
        if (error.response?.data?.error) {
          const errorData = error.response.data.error;
          console.error("OpenAI error details:", errorData);
          
          if (errorData.code === 'content_policy_violation' || errorData.code === 'moderation_blocked') {
            errorMessage = 'Your prompt contains content that may violate OpenAI\'s content policy. Please modify your prompt to avoid mentioning sensitive topics like violence, illegal activities, or specific monetary amounts.';
            statusCode = 400;
          } else if (errorData.code === 'billing_quota_exceeded') {
            errorMessage = 'OpenAI API quota exceeded';
            statusCode = 429;
          } else if (errorData.code === 'invalid_request_error') {
            errorMessage = 'Invalid request to OpenAI API';
            statusCode = 400;
          } else if (errorData.code === 'token_limit_exceeded') {
            errorMessage = 'The prompt is too long';
            statusCode = 400;
          } else if (errorData.code === 'rate_limit_exceeded') {
            errorMessage = 'Rate limit exceeded';
            statusCode = 429;
          } else if (errorData.code === 'organization_not_verified' || 
                    (error.response.status === 403 && errorData.message?.includes('organization'))) {
            errorMessage = 'Your OpenAI organization requires verification to use this model. This typically takes 15-30 minutes to propagate after verification.';
            statusCode = 403;
          } else {
            errorMessage = errorData.message || 'Unknown OpenAI error';
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(`OpenAI API error: ${errorMessage}`);
      });
      
      // Race between the API call and the timeout
      const response = await Promise.race([imageResponsePromise, timeoutPromise]) as Awaited<ReturnType<typeof openai.images.generate>>;
      
      // Enhanced debug logging
      console.log(`Response structure:`, {
        hasData: Boolean(response.data),
        dataLength: response.data?.length,
        firstItemExists: Boolean(response.data?.[0]),
        hasUrl: Boolean(response.data?.[0]?.url),
        hasB64Json: Boolean(response.data?.[0]?.b64_json),
        responseKeys: response.data?.[0] ? Object.keys(response.data[0]) : []
      });
      
      // Check if we have a valid response with URL
      if (response && response.data && response.data.length > 0) {
        const image = response.data[0];
        let generatedUrl = null;
        
        if (image.url) {
          // If we have a direct URL
          generatedUrl = image.url;
          console.log(`Thumbnail generated successfully (URL) for job ${jobId}`);
        } else if (image.b64_json) {
          // If we have base64 data
          const base64Data = image.b64_json;
          generatedUrl = `data:image/png;base64,${base64Data}`;
          console.log(`Thumbnail generated successfully (base64) for job ${jobId}`);
        } else if ((image as any).path) {
          // Some models might return a local path
          generatedUrl = (image as any).path;
          console.log(`Thumbnail generated with path for job ${jobId}`);
        } else {
          // No recognized format - log what we did get
          console.error(`Unknown response format for job ${jobId}. Keys:`, Object.keys(image));
          return NextResponse.json({
            status: "failed",
            error: "Unrecognized image format in response",
            thumbnails: FALLBACK_THUMBNAILS
          });
        }
        
        if (generatedUrl) {
          const thumbnails = [generatedUrl, ...FALLBACK_THUMBNAILS.slice(0, 4)];
        
        // If Redis is available, store the result there too
        if (redis) {
          try {
            const key = `thumbnail:job:${jobId}`;
            await redis.set(key, JSON.stringify({
              status: 'completed',
              data: { thumbnails }
            }), { ex: 3600 }); // 1 hour expiration
          } catch (redisError) {
            console.error("Failed to store result in Redis:", redisError);
          }
        }
        
        return NextResponse.json({
          status: "completed",
          thumbnails,
        });
        }
      } else {
        console.warn(`OpenAI response did not contain a valid URL`);
        // Log the entire response for debugging
        console.error(`Detailed OpenAI response:`, JSON.stringify(response, null, 2));
        
        // Check if there's a revised prompt which might indicate content policy issues
        if (response?.data?.[0]?.revised_prompt) {
          console.log(`Response contains revised_prompt:`, response.data[0].revised_prompt);
        }
        
        return NextResponse.json({
          status: "failed",
          error: "Generation incomplete (no URL)",
          thumbnails: FALLBACK_THUMBNAILS
        });
      }
    } catch (error: any) {
      console.error(`Error during generation: ${error.message || error}`);
      return NextResponse.json({
        status: "failed",
        error: `Generation failed: ${error.message || "Unknown error"}`,
        thumbnails: FALLBACK_THUMBNAILS
      });
    }
  } catch (error) {
    console.error("Error in generate endpoint handler:", error);
    return NextResponse.json({
      status: "failed",
      error: "Failed to process generation request",
      thumbnails: FALLBACK_THUMBNAILS
    }, { status: 500 });
  }
}

// Keep GET for health checks
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Thumbnail generation API endpoint is operational (hybrid OpenAI/Inngest implementation)",
    apiAvailable: Boolean(openai),
    inngestEnabled: Boolean(redis),
    timestamp: new Date().toISOString(),
  });
} 
import { Inngest } from "inngest";
import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import { loadEnvVars } from "../utils/env"; 

// Load environment variables manually to make sure they're available
loadEnvVars();

// Debug the environment variables
console.log("Inngest environment variables:");
console.log("INNGEST_EVENT_KEY present:", Boolean(process.env.INNGEST_EVENT_KEY));
console.log("INNGEST_EVENT_KEY length:", process.env.INNGEST_EVENT_KEY?.length || 0);
console.log("INNGEST_SIGNING_KEY present:", Boolean(process.env.INNGEST_SIGNING_KEY));
console.log("INNGEST_SIGNING_KEY length:", process.env.INNGEST_SIGNING_KEY?.length || 0);

// Initialize Redis client from environment variables
let redis: Redis | null = null;
try {
  // Check if env vars are present before initializing - use KV_* variables
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    console.log("Upstash Redis client initialized successfully for Inngest");
  } else {
    console.error("Upstash Redis environment variables (KV_REST_API_*) not found. Cannot store results.");
    console.log("Available environment variables:", {
      KV_REST_API_URL_exists: Boolean(process.env.KV_REST_API_URL),
      KV_REST_API_TOKEN_exists: Boolean(process.env.KV_REST_API_TOKEN)
    });
  }
} catch (error) {
  console.error("Failed to initialize Upstash Redis client for Inngest:", error);
  redis = null; // Ensure redis is null if init fails
}

// Determine the correct base URL based on environment
const getBaseUrl = () => {
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For custom domains or local development
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback to localhost with the correct port
  // Check if a port other than 3000 is being used (in logs we see 3001)
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
};

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "thumbai",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
  // For local development
  isDev: process.env.NODE_ENV === 'development'
});

// Log Inngest configuration to help diagnose issues
console.log("Inngest client initialized with:", {
  id: "ThumbAI",
  eventKeyPresent: Boolean(process.env.INNGEST_EVENT_KEY),
  eventKeyLength: process.env.INNGEST_EVENT_KEY?.length || 0,
  baseUrl: getBaseUrl(),
  apiUrl: 'https://api.inngest.com'
});

// Initialize OpenAI client safely
let openai: OpenAI | null = null;
try {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    // Note: Removed timeout here as Inngest handles longer execution
    openai = new OpenAI({ apiKey }); 
    console.log("OpenAI client initialized successfully for Inngest");
  } else {
    console.warn("Invalid or empty OpenAI API key - Inngest function may fail");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client for Inngest:", error);
}

// Fallback thumbnails (can be shared or redefined if needed)
const FALLBACK_THUMBNAILS = [
  "https://placehold.co/1280x720/3b82f6/FFFFFF/png?text=Thumbnail+1",
  "https://placehold.co/1280x720/ef4444/FFFFFF/png?text=Thumbnail+2",
  "https://placehold.co/1280x720/22c55e/FFFFFF/png?text=Thumbnail+3",
  "https://placehold.co/1280x720/f59e0b/FFFFFF/png?text=Thumbnail+4",
  "https://placehold.co/1280x720/8b5cf6/FFFFFF/png?text=Thumbnail+5",
];

// Helper function to update Redis status
export async function updateJobStatus(jobId: string, status: 'completed' | 'failed', data: any) {
  if (!redis) {
    console.error(`Redis client not available. Cannot update status for job ${jobId}`);
    return; // Cannot update status if Redis isn't configured
  }
  
  const key = `thumbnail:job:${jobId}`;
  
  try {
    // Create a proper status object
    const statusObject = { status, data };
    
    // Make sure we're storing a string in Redis
    const value = typeof statusObject === 'string' 
      ? statusObject 
      : JSON.stringify(statusObject);
    
    // Set with 1 hour expiration
    await redis.set(key, value, { ex: 3600 });
    console.log(`Updated status for job ${jobId} to ${status}`);
    
    // Verify what we stored by reading it back
    try {
      const storedValue = await redis.get(key);
      console.log(`Verification: Stored value type for job ${jobId}: ${typeof storedValue}`);
    } catch (verifyError) {
      console.error(`Verification error for job ${jobId}:`, verifyError);
    }
  } catch (error) {
    console.error(`Failed to update status for job ${jobId} in Redis:`, error);
    console.error(`Data that failed:`, { status, dataType: typeof data, data });
  }
}

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

// Define a type for the verification error
interface VerificationErrorResponse {
  _isVerificationError: true;
  error: any;
}

// Helper function to check if a response is a verification error
function isVerificationError(response: any): response is VerificationErrorResponse {
  return response && typeof response === 'object' && '_isVerificationError' in response;
}

// Define the actual thumbnail generation function
export const generateThumbnail = inngest.createFunction(
  { 
    id: "generate-thumbnail", 
    name: "Thumbnail Generation",
    retries: 3,
    timeouts: {
      finish: '180s'
    }
  },
  { event: "thumbai/thumbnail.generate" },
  async ({ event, step }) => {
    // Ensure redis is available before proceeding
    if (!redis) {
      console.error("Redis not configured or initialization failed. Aborting function.");
      // Optionally, you could try to alert or log this more permanently
      return { success: false, message: "Internal server error: Redis not configured" };
    }
    
    const { prompt, jobId } = event.data as { prompt: string; jobId: string }; // Get jobId
    const startTime = Date.now();
    console.log(`Inngest function started for job ${jobId}, prompt: "${prompt}"`);

    if (!jobId) {
      console.error("Job ID missing in event data. Cannot proceed.");
      return { success: false, message: "Internal error: Job ID missing" };
    }

    if (!openai) {
      console.error(`OpenAI client not available for job ${jobId}.`);
      await updateJobStatus(jobId, 'failed', { error: "OpenAI client not initialized", thumbnails: FALLBACK_THUMBNAILS });
      return { success: false, message: "OpenAI client not initialized" };
    }

    if (!prompt || prompt.trim().length < 3) {
      console.warn(`Invalid prompt received for job ${jobId}.`);
      await updateJobStatus(jobId, 'failed', { error: "Invalid prompt provided", thumbnails: FALLBACK_THUMBNAILS });
      return { success: false, message: "Invalid prompt" };
    }

    try {
       const response = await step.run("generate-image-with-openai", async () => {
         try {
          console.log(`Starting OpenAI generation for job ${jobId} with model: gpt-image-1`);
          const result = await openai!.images.generate({
            model: "gpt-image-1",
             prompt: getSystemPrompt(prompt),
             n: 1,
            size: "1536x1024", // Supported landscape format, will be resized to 1280x720 on client
            quality: "high" // Options: low, medium, high
          });
          
          // Log the entire response for debugging
          console.log(`Raw OpenAI response for job ${jobId}:`, JSON.stringify(result));
          return result;
        } catch (openaiError: any) {
          // Enhanced error handling for GPT-Image-1 specific errors
           console.error(`OpenAI API error during generation for job ${jobId}:`, openaiError);
          
          // Log more details about the error
          if (openaiError.response) {
            console.error(`OpenAI API error response for job ${jobId}:`, JSON.stringify({
              status: openaiError.response.status,
              statusText: openaiError.response.statusText,
              data: openaiError.response.data
            }));
          }
          
          // Handle specific error cases
          if (openaiError.response?.data?.error) {
            const errorData = openaiError.response.data.error;
            console.error(`OpenAI error details for job ${jobId}:`, errorData);
            
            // For organization verification, we should return a special error 
            // so we can show a more helpful message to the user
            if (errorData.code === 'organization_not_verified' || 
               (openaiError.response.status === 403 && errorData.message?.includes('organization'))) {
              return {
                _isVerificationError: true,
                error: errorData
              } as VerificationErrorResponse; 
            }
            
            if (errorData.code === 'content_policy_violation' || errorData.code === 'moderation_blocked') {
              throw new Error('Your prompt contains content that may violate OpenAI\'s content policy. Please modify your prompt to avoid mentioning sensitive topics like violence, illegal activities, or specific monetary amounts.');
            } else if (errorData.code === 'billing_quota_exceeded') {
              throw new Error('OpenAI API quota exceeded. Please try again later.');
            } else if (errorData.code === 'invalid_request_error') {
              throw new Error('Invalid request to OpenAI API. Please check your prompt.');
            } else if (errorData.code === 'token_limit_exceeded') {
              throw new Error('The prompt is too long. Please make it shorter.');
            } else if (errorData.code === 'rate_limit_exceeded') {
              throw new Error('Rate limit exceeded. Please try again later.');
            } else if (errorData.code === 'organization_not_verified') {
              throw new Error('Your OpenAI organization requires verification to use this model.');
            }
          }
          
          // Generic error handling
          throw new Error(`OpenAI API error: ${openaiError.message || 'Unknown error'}`);
         }
       });

      const generationTime = Date.now() - startTime;
      console.log(`OpenAI generation for job ${jobId} finished in ${generationTime}ms`);

      // Handle the special verification error case
      if (isVerificationError(response)) {
        console.warn(`Organization verification required for job ${jobId}. Returning a user-friendly message.`);
        await updateJobStatus(jobId, 'failed', { 
          error: "OpenAI requires organization verification for image generation. This typically takes 15-30 minutes to propagate after verification.",
          thumbnails: FALLBACK_THUMBNAILS,
          requires_verification: true
        });
        return { 
          success: false, 
          message: "Organization verification required",
          requires_verification: true
        };
      }

      // Add additional debug logs to understand the response structure
      console.log(`Response structure for job ${jobId}:`, {
        hasData: Boolean(response.data),
        dataLength: response.data?.length,
        firstItemExists: Boolean(response.data?.[0]),
        hasUrl: Boolean(response.data?.[0]?.url),
        hasB64Json: Boolean(response.data?.[0]?.b64_json),
        responseKeys: response.data?.[0] ? Object.keys(response.data[0]) : []
      });

      // Check all possible response formats the gpt-image-1 model might return
      if (response.data && response.data[0]) {
        // Extract the image data in whatever format it's provided
        const image = response.data[0];
        let generatedUrl = null;
        
        if (image.url) {
          // If we have a direct URL (standard method)
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
          await updateJobStatus(jobId, 'failed', { 
            error: "Unrecognized image format in response", 
            thumbnails: FALLBACK_THUMBNAILS 
          });
          return { success: false, message: "Unrecognized image format in response" };
        }
        
        if (generatedUrl) {
        const finalThumbnails = [generatedUrl, ...FALLBACK_THUMBNAILS.slice(0, 4)];
        await updateJobStatus(jobId, 'completed', { thumbnails: finalThumbnails, generationTime });
        return { success: true, message: "Generated successfully" };
        }
      } else {
        console.warn(`OpenAI response did not contain a valid URL for job ${jobId}.`);
        // Log the exact response for debugging
        console.error(`Detailed OpenAI response for job ${jobId}:`, JSON.stringify(response, null, 2));
        
        // Check for specific error patterns using type assertion for safety
        const anyResponse = response as any;
        if (anyResponse.error || anyResponse.error_code) {
          console.error(`Response contains an error object:`, anyResponse.error || anyResponse.error_code);
        }
        
        // Check for revised_prompt which might indicate content policy issues
        if (response.data?.[0]?.revised_prompt) {
          console.log(`Response contains revised_prompt:`, response.data[0].revised_prompt);
        }
        
        await updateJobStatus(jobId, 'failed', { error: "Generation incomplete (no URL)", thumbnails: FALLBACK_THUMBNAILS });
        return { success: false, message: "Generation incomplete" };
      }
    } catch (error) {
      console.error(`Error in thumbnail generation for job ${jobId}:`, error);
      await updateJobStatus(jobId, 'failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        thumbnails: FALLBACK_THUMBNAILS 
      });
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
); 
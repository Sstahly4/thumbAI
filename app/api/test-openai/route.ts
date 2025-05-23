import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { loadEnvVars } from "../../utils/env";

// Load environment variables
loadEnvVars();

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey });

// Test prompt with 16:9 composition guidance
const getTestPrompt = (basePrompt: string) => `Create a professional YouTube thumbnail for: "${basePrompt}". IMPORTANT: Keep all essential visual elements and text within the center 80% of the image since it will be cropped to 16:9 aspect ratio for YouTube. Avoid placing important elements near edges.`;

export async function GET(request: NextRequest) {
  console.log("Testing OpenAI API directly");
  
  try {
    // Simple test prompt
    const basePrompt = "A simple test image of a blue square on a white background";
    
    console.log("Making direct API call to OpenAI with model: gpt-image-1");
    console.log("API Key starts with:", apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3));
    
    // Make the API call
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: getTestPrompt(basePrompt),
      n: 1,
      size: "1536x1024", // Using supported size, will be resized to 1280x720 on client
      quality: "low" // Use lowest quality for testing
    });
    
    // Log the full response
    console.log("OpenAI test response:", JSON.stringify(response, null, 2));
    
    // Try to determine the image format
    const responseData = response.data || [];
    const firstItem = responseData[0] || {};
    
    // Return the response
    return NextResponse.json({
      success: true,
      response,
      hasData: Boolean(response.data),
      dataLength: response.data?.length,
      firstItemExists: Boolean(response.data?.[0]),
      hasUrl: Boolean(response.data?.[0]?.url),
      hasB64Json: Boolean(response.data?.[0]?.b64_json),
      responseKeys: response.data?.[0] ? Object.keys(response.data[0]) : [],
      // Try to determine the image format
      imageFormat: firstItem.url ? 'url' : 
                  firstItem.b64_json ? 'b64_json' : 
                  (firstItem as any)?.path ? 'path' : 'unknown',
      // Create a preview based on the format
      preview: firstItem.url ? firstItem.url :
              firstItem.b64_json ? 
                `data:image/png;base64,${firstItem.b64_json.substring(0, 50)}...` : 
              (firstItem as any)?.path ? (firstItem as any).path :
              'No recognized image format found'
    });
  } catch (error: any) {
    console.error("OpenAI API test error:", error);
    
    // Try to extract more error details
    let errorDetails: any = {
      message: error.message || "Unknown error",
      status: error.status || 500,
      code: error.code,
      type: error.type || typeof error
    };
    
    // Extract response data if available
    if (error.response) {
      try {
        errorDetails = {
          ...errorDetails,
          statusCode: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        };
        console.error("OpenAI API error response details:", JSON.stringify(errorDetails, null, 2));
      } catch (e) {
        console.error("Couldn't parse error response:", e);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorDetails
    }, { status: 500 });
  }
} 
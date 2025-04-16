import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// Debug environment variables
console.log("API Route Loaded");
console.log("OpenAI API Key exists:", Boolean(process.env.OPENAI_API_KEY));
console.log("OpenAI API Key length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log("OpenAI API Key prefix:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) : "none");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Placeholder UUIDs for the MVP
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

// Fallback thumbnails in case the AI generation fails
const FALLBACK_THUMBNAILS = [
  "https://placehold.co/1280x720/3b82f6/FFFFFF/png?text=Thumbnail+1",
  "https://placehold.co/1280x720/ef4444/FFFFFF/png?text=Thumbnail+2",
  "https://placehold.co/1280x720/22c55e/FFFFFF/png?text=Thumbnail+3",
  "https://placehold.co/1280x720/f59e0b/FFFFFF/png?text=Thumbnail+4",
  "https://placehold.co/1280x720/8b5cf6/FFFFFF/png?text=Thumbnail+5",
];

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key is completely missing.");
      return NextResponse.json({ 
        thumbnails: FALLBACK_THUMBNAILS,
        message: "Using placeholder thumbnails (API key not configured)" 
      });
    } else if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn("OpenAI API key is a placeholder value.");
      return NextResponse.json({ 
        thumbnails: FALLBACK_THUMBNAILS,
        message: "Using placeholder thumbnails (API key is a placeholder)" 
      });
    } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.warn("OpenAI API key has incorrect format - doesn't start with 'sk-'.");
      return NextResponse.json({ 
        thumbnails: FALLBACK_THUMBNAILS,
        message: "Using placeholder thumbnails (API key format is invalid)" 
      });
    }

    console.log("API key validation passed, proceeding with request");
    
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string || '';
    const sketch = formData.get('sketch') as File || null;
    const referenceImages: File[] = [];
    
    // Log the received inputs for debugging
    console.log(`Request received: Prompt length: ${prompt.length}, Sketch: ${sketch ? 'Yes' : 'No'}, Reference images: ${referenceImages.length}`);
    
    // Get all reference images
    formData.forEach((value, key) => {
      if (key.startsWith('reference') && value instanceof File) {
        referenceImages.push(value as File);
      }
    });
    
    // Process sketch and reference images if available
    let enhancedPrompt = prompt;
    let sketchPath = '';
    let refPaths: string[] = [];
    
    if (sketch) {
      try {
        sketchPath = await saveFile(sketch, 'sketches');
        enhancedPrompt += `\n\nI've provided a rough sketch that shows the key elements and layout I want for the thumbnail. Please analyze this sketch and incorporate its main elements and composition in your design.`;
        console.log(`Sketch saved at ${sketchPath}`);
      } catch (err) {
        console.error("Error saving sketch:", err);
      }
    }
    
    if (referenceImages.length > 0) {
      enhancedPrompt += '\n\nI\'ve uploaded reference images for style inspiration. Please analyze these images for visual elements, color schemes, and composition techniques that could enhance the thumbnail.';
      for (const img of referenceImages) {
        try {
          const refPath = await saveFile(img, 'references');
          refPaths.push(refPath);
          console.log(`Reference image saved at ${refPath}`);
        } catch (err) {
          console.error("Error saving reference image:", err);
        }
      }
    }
    
    try {
      console.log("Attempting to generate thumbnails with OpenAI");
      
      // Create the detailed prompt for DALL-E
      const systemPrompt = `
Create a high-impact YouTube thumbnail based on the user's input that follows these specific guidelines:

1. ENGAGING CORE IMAGE:
   - Create a compelling focal point that immediately grabs attention
   - Utilize visual hierarchy to guide the viewer's eye
   - Include elements that spark curiosity and invite clicks

2. FACES AND EXPRESSIONS:
   - If people are mentioned in the prompt, include faces with strong, emotional expressions
   - Make facial expressions clear, relatable, and appropriate to the content
   - Position faces prominently to create a human connection

3. DYNAMIC TEXT OVERLAY:
   - Incorporate large, bold, easy-to-read text
   - Use text styling that pops against the background
   - Include visual elements like arrows pointing to key objects if relevant
   - Keep text concise and impactful (5 words or less when possible)

4. COLOR PSYCHOLOGY:
   - Use bright, bold, contrasting colors that stand out in feeds
   - Create color tension to draw the eye
   - Ensure foreground elements pop against the background
   - Consider YouTube's white/dark interface and make sure it stands out

5. PRECISE TECHNICAL SPECS:
   - Perfect high-definition 16:9 aspect ratio (1920x1080)
   - Ensure all text is legible even when thumbnail is small
   - Position key elements away from the bottom-right corner (where timestamp appears)
   - Create clean edges with no important elements that might get cropped

6. SKETCH INTEGRATION:
   - If a sketch was provided, analyze its key elements and composition
   - Maintain the core structure and layout from the sketch
   - Enhance and refine the concepts shown in the sketch

7. ACCURATE REPRESENTATION:
   - Ensure the thumbnail genuinely represents what the video would contain
   - Avoid misleading clickbait that doesn't deliver on its promise
   - Balance attention-grabbing elements with truthful representation

Create 5 distinct variations that fulfill these requirements while maintaining a professional, high-quality appearance optimized for maximum CTR.
`;

      // For debugging, let's start with just one thumbnail instead of five
      const thumbnails = [];
      
      try {
        // Generate first thumbnail to test API connection
        console.log("Attempting first OpenAI API call...");
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${systemPrompt}\n\nUSER REQUEST: ${enhancedPrompt}\n\nCreate a professional, eye-catching YouTube thumbnail. This is for a professional YouTube channel that needs high-CTR, action-driving thumbnails.`,
          n: 1,
          size: "1792x1024", // Closest to 16:9 ratio available in DALL-E 3
          quality: "hd",
          style: "vivid",
        });
        
        console.log("OpenAI API response received:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        if (response.data[0]?.url) {
          thumbnails.push(response.data[0].url);
          
          // If first one works, generate the rest
          for (let i = 1; i < 5; i++) {
            try {
              const additionalResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: `${systemPrompt}\n\nUSER REQUEST: ${enhancedPrompt}\n\nCreate a professional, eye-catching YouTube thumbnail (Variation ${i+1} of 5). Make this design distinct from the other variations by using different colors, compositions, or focal points while maintaining the core message and requirements.`,
                n: 1,
                size: "1792x1024",
                quality: "hd",
                style: "vivid",
              });
              
              if (additionalResponse.data[0]?.url) {
                thumbnails.push(additionalResponse.data[0].url);
              } else {
                thumbnails.push(FALLBACK_THUMBNAILS[i]);
              }
            } catch (err) {
              console.error(`Error generating thumbnail ${i+1}:`, err instanceof Error ? err.message : String(err));
              thumbnails.push(FALLBACK_THUMBNAILS[i]);
            }
          }
        } else {
          // If we failed to get the first thumbnail, use all fallbacks
          throw new Error("No image URL in OpenAI response: " + JSON.stringify(response));
        }
      } catch (singleErr) {
        console.error("Error with initial OpenAI call:", singleErr instanceof Error ? singleErr.message : String(singleErr));
        if (singleErr instanceof Error && singleErr.stack) {
          console.error("Stack trace:", singleErr.stack);
        }
        
        // Try with a simpler prompt as a last resort
        try {
          console.log("Trying with simplified prompt...");
          const backupResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Create a YouTube thumbnail based on: ${prompt}. Make it eye-catching with bright colors and clear visuals.`,
            n: 1,
            size: "1792x1024",
            quality: "standard",
            style: "vivid",
          });
          
          if (backupResponse.data[0]?.url) {
            thumbnails.push(backupResponse.data[0].url);
            // Fill the rest with fallbacks
            for (let i = 1; i < 5; i++) {
              thumbnails.push(FALLBACK_THUMBNAILS[i]);
            }
          } else {
            throw new Error("No image URL in backup response");
          }
        } catch (backupErr) {
          console.error("Both OpenAI attempts failed:", backupErr);
          // Use fallbacks if both attempts fail
          throw backupErr;
        }
      }
      
      if (thumbnails.length > 0) {
        console.log(`Successfully generated ${thumbnails.length} thumbnails`);
        return NextResponse.json({ 
          thumbnails,
          message: "Thumbnails generated successfully" 
        });
      } else {
        // This should never happen due to the error handling above
        throw new Error("No thumbnails were generated");
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Fall back to placeholders if AI generation fails
      return NextResponse.json({ 
        thumbnails: FALLBACK_THUMBNAILS,
        message: "Using fallback thumbnails due to AI generation issues" 
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate thumbnails", 
        details: error instanceof Error ? error.message : String(error),
        fallback: FALLBACK_THUMBNAILS
      },
      { status: 500 }
    );
  }
}

// Helper function to save uploaded files
async function saveFile(file: File, directory: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create directory if it doesn't exist
  const dir = join(process.cwd(), 'public', 'uploads', directory);
  await mkdir(dir, { recursive: true });
  
  // Generate unique filename
  const uniqueId = generateUniqueId();
  const filename = `${uniqueId}-${file.name}`;
  const filepath = join(dir, filename);
  
  // Write file
  await writeFile(filepath, buffer);
  
  // Return the public URL
  return `/uploads/${directory}/${filename}`;
} 
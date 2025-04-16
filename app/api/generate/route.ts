import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

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
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string || '';
    const sketch = formData.get('sketch') as File || null;
    const referenceImages: File[] = [];
    
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
      sketchPath = await saveFile(sketch, 'sketches');
      enhancedPrompt += `\n\nI've provided a rough sketch that shows the key elements and layout I want for the thumbnail. Please analyze this sketch and incorporate its main elements and composition in your design.`;
    }
    
    if (referenceImages.length > 0) {
      enhancedPrompt += '\n\nI\'ve uploaded reference images for style inspiration. Please analyze these images for visual elements, color schemes, and composition techniques that could enhance the thumbnail.';
      for (const img of referenceImages) {
        const refPath = await saveFile(img, 'references');
        refPaths.push(refPath);
      }
    }
    
    try {
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

      // Generate thumbnails using DALL-E
      const thumbnails = await Promise.all(
        Array(5).fill(0).map(async (_, i) => {
          try {
            const response = await openai.images.generate({
              model: "dall-e-3",
              prompt: `${systemPrompt}\n\nUSER REQUEST: ${enhancedPrompt}\n\nCreate a professional, eye-catching YouTube thumbnail (Variation ${i+1} of 5). Make this design distinct from the other variations by using different colors, compositions, or focal points while maintaining the core message and requirements. This is for a professional YouTube channel that needs high-CTR, action-driving thumbnails.`,
              n: 1,
              size: "1792x1024", // Closest to 16:9 ratio available in DALL-E 3
              quality: "hd",
              style: "vivid",
            });
            
            // Return the URL of the generated image
            return response.data[0].url || FALLBACK_THUMBNAILS[i];
          } catch (err) {
            console.error("Error generating thumbnail:", err);
            return FALLBACK_THUMBNAILS[i];
          }
        })
      );
      
      return NextResponse.json({ 
        thumbnails,
        message: "Thumbnails generated successfully" 
      });
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
      { error: "Failed to generate thumbnails", details: error instanceof Error ? error.message : String(error) },
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
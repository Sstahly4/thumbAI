import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
// Ensure your OPENAI_API_KEY is set in your .env.local file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callAiModel(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured. Please set OPENAI_API_KEY in .env.local');
    // Fallback to basic enhancement if API key is missing, or throw an error
    // For now, let's return a modified basic enhancement to indicate the issue without breaking flow
    return `${prompt.trim()} (OpenAI API key not configured - using basic enhancement)`;
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can choose other models like gpt-4 if preferred and available
      messages: [
        {
          role: "system",
          content: "You are an expert YouTube thumbnail prompt enhancer. Your goal is to take a user's basic idea and transform it into a highly descriptive, engaging, and clickbait-worthy prompt. Focus on vivid imagery, emotional triggers, and keywords that are likely to result in a high click-through rate thumbnail. Make it concise but powerful."
        },
        {
          role: "user",
          content: `Enhance this prompt for a YouTube thumbnail: \"${prompt}\"`
        }
      ],
      temperature: 0.7, // Adjust for creativity vs. determinism. 0.7 is a good balance.
      max_tokens: 150, // Limit the length of the generated prompt
    });

    const enhancedPrompt = completion.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      console.error('OpenAI API returned an empty enhancement.');
      return `${prompt.trim()} (enhancement failed, try again)`; // Fallback
    }
    
    return enhancedPrompt;

  } catch (apiError) {
    console.error('Error calling OpenAI API:', apiError);
    // Return a modified prompt or throw an error that can be caught by the main POST handler
    // For now, returning a message indicating failure to the user via the prompt itself.
    return `${prompt.trim()} (AI enhancement failed due to API error)`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userPrompt = body.prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be a string' }, { status: 400 });
    }

    if (userPrompt.trim().length < 5) {
        return NextResponse.json({ error: 'Prompt is too short, please provide more detail.' }, { status: 400 });
    }
    if (userPrompt.trim().length > 500) { // Add a max length check
        return NextResponse.json({ error: 'Prompt is too long (max 500 characters).' }, { status: 400 });
    }

    const enhancedPrompt = await callAiModel(userPrompt);

    // Check if the enhancement returned a fallback message indicating an issue
    if (enhancedPrompt.includes("(OpenAI API key not configured") || enhancedPrompt.includes("(enhancement failed") || enhancedPrompt.includes("(AI enhancement failed")) {
        // Return a specific error to the client if enhancement had issues
        // This gives more direct feedback than just returning the modified prompt.
        let clientError = "AI enhancement failed. Please try again later.";
        if (enhancedPrompt.includes("OpenAI API key not configured")) {
            clientError = "AI enhancement feature is not configured correctly. Please contact support.";
            // Optionally, don't expose this directly and just use a generic error for the client
        }
        return NextResponse.json({ error: clientError, enhancedPrompt: userPrompt }, { status: 503 }); // 503 Service Unavailable
    }

    return NextResponse.json({ enhancedPrompt });

  } catch (error) {
    console.error('Error in /api/prompt/enhance:', error);
    let errorMessage = 'Internal Server Error during prompt enhancement.';
    // Avoid exposing internal error details directly to client unless necessary
    // if (error instanceof Error) {
    //     errorMessage = error.message;
    // }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
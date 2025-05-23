import { serve } from "inngest/next";
import { inngest, generateThumbnail } from "../../lib/inngest";

// Add detailed error logging
console.log("Inngest API route initializing with event key:", 
  process.env.INNGEST_EVENT_KEY ? "Present" : "Missing");
console.log("Inngest signing key:", 
  process.env.INNGEST_SIGNING_KEY ? "Present" : "Missing");

// Print information about the function registrations
try {
  // @ts-ignore - Access function metadata for debugging
  console.log("Registered function:", generateThumbnail.name || "generate-thumbnail", 
    "with ID:", generateThumbnail.id || "unknown");
} catch (e) {
  console.log("Could not access function metadata, but continuing");
}

// Create an API handler for the Inngest client and functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateThumbnail,
  ],
});
import fs from 'fs';
import path from 'path';

// Function to load environment variables from .env.local directly
export function loadEnvVars() {
  try {
    // Get the project root directory
    const rootDir = process.cwd();
    console.log("Current working directory:", rootDir);
    
    const envPath = path.join(rootDir, '.env.local');
    console.log("Looking for .env.local at:", envPath);
    
    // Check if .env.local file exists
    if (fs.existsSync(envPath)) {
      console.log(".env.local file found!");
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Log a redacted version of the env file to help debug (hide sensitive values)
      const redactedLines = envContent.split('\n').map(line => {
        if (line.trim().startsWith('#') || !line.trim()) return line;
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex).trim();
          const value = line.substring(equalIndex + 1).trim();
          // Show key but hide actual value for sensitive data
          return `${key}=${value.startsWith('"') ? '"***REDACTED***"' : '***REDACTED***'}`;
        }
        return line;
      });
      console.log("Contents of .env.local (redacted):\n", redactedLines.join('\n'));
      
      const envLines = envContent.split('\n');
      // Add explicit string[] type annotation to fix TypeScript errors
      const loadedVars: string[] = [];
      
      // Parse and set each line
      envLines.forEach(line => {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) return;
        
        // Split by first equals sign (to handle values with = in them)
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
          const key = line.substring(0, equalIndex).trim();
          let value = line.substring(equalIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          
          // Set the environment variable if not already set
          if (!process.env[key]) {
            process.env[key] = value;
            loadedVars.push(key);
            console.log(`Manually loaded environment variable: ${key}`);
          } else {
            console.log(`Environment variable already exists: ${key}`);
          }
        }
      });
      
      console.log('Successfully loaded environment variables from .env.local');
      console.log('Variables loaded:', loadedVars);
      // Check specifically for our Redis keys
      console.log('KV_REST_API_URL loaded?', Boolean(process.env.KV_REST_API_URL));
      console.log('KV_REST_API_TOKEN loaded?', Boolean(process.env.KV_REST_API_TOKEN));
      
      return true;
    } else {
      // Check if we're in a production environment (Vercel)
      const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.log('Running in production environment, .env.local not required');
        // Check if critical environment variables are set
        const criticalVars = ['OPENAI_API_KEY', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'];
        const missingVars = criticalVars.filter(key => !process.env[key]);
        
        if (missingVars.length > 0) {
          console.warn('Missing critical environment variables:', missingVars.join(', '));
        } else {
          console.log('All critical environment variables present');
          // Check specifically for our Redis keys
          console.log('KV_REST_API_URL loaded?', Boolean(process.env.KV_REST_API_URL));
          console.log('KV_REST_API_TOKEN loaded?', Boolean(process.env.KV_REST_API_TOKEN));
        }
        
        return missingVars.length === 0;
      }
      
      console.warn('.env.local file not found at path:', envPath);
      // Let's also check the parent directory as a fallback
      const parentEnvPath = path.join(rootDir, '..', '.env.local');
      console.log("Checking parent directory for .env.local at:", parentEnvPath);
      if (fs.existsSync(parentEnvPath)) {
        console.log("Found .env.local in parent directory! Make sure you're in the right working directory.");
      }
      return false;
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
    return false;
  }
} 
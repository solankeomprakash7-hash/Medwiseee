import { GoogleGenAI, Type } from "@google/genai";

/**
 * Custom error class for Gemini API interactions
 */
export class GeminiError extends Error {
  constructor(
    public type: 'RATE_LIMIT' | 'INVALID_KEY' | 'NETWORK_ERROR' | 'MODEL_ERROR' | 'ABORTED' | 'UNKNOWN',
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export interface GeminiOptions {
  model?: string;
  maxRetries?: number;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Robust wrapper for Gemini API calls with retries, timeout, and error handling.
 * Uses the @google/genai SDK Interactions API.
 */
export async function geminiRequest<T>(
  prompt: string,
  schema: any,
  options: GeminiOptions = {}
): Promise<T> {
  const {
    model = "gemini-3.6-flash",
    maxRetries = 3,
    timeout = 120000,
    signal
  } = options;

  // Note: process.env.GEMINI_API_KEY is typically available server-side or 
  // via the platform's proxy in AI Studio Build environments.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[Gemini] API Key Missing from process.env');
    throw new GeminiError(
      'INVALID_KEY', 
      'GEMINI_API_KEY is not defined. Please ensure it is set in your Vercel environment variables.'
    );
  }

  let ai: GoogleGenAI;
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err: any) {
    console.error('[Gemini] Failed to initialize GoogleGenAI:', err);
    throw new GeminiError('INVALID_KEY', 'Failed to initialize Gemini SDK. Check API key format.', err);
  }

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    // Check for abortion before starting attempt
    if (signal?.aborted) {
      throw new GeminiError('ABORTED', 'Request was cancelled by the user.');
    }

    try {
      console.log(`[Gemini] Attempt ${attempt}/${maxRetries + 1} using model ${model}`);
      
      // Call the Interactions API
      const interaction = await ai.interactions.create({
        model,
        input: prompt,
        response_format: schema,
      }, { timeout });

      // Handle the response steps to find the output
      let fullOutput = "";
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const textContent = step.content?.find(c => c.type === 'text');
          if (textContent && textContent.text) {
            fullOutput += textContent.text;
          }
        }
      }

      if (fullOutput) {
        try {
          return JSON.parse(fullOutput) as T;
        } catch (parseError) {
          console.error('[Gemini] JSON Parse Error. Content received:', fullOutput);
          throw new GeminiError('MODEL_ERROR', 'Failed to parse JSON from Gemini response.', parseError);
        }
      }

      throw new GeminiError('MODEL_ERROR', 'No valid text output found in Gemini response.');

    } catch (error: any) {
      lastError = error;
      
      // Categorize the error
      let type: GeminiError['type'] = 'UNKNOWN';
      const msg = (error.message || '').toLowerCase();

      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
        type = 'RATE_LIMIT';
      } else if (msg.includes('401') || msg.includes('api key') || msg.includes('unauthorized') || msg.includes('invalid')) {
        type = 'INVALID_KEY';
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('econnreset') || msg.includes('failed to fetch')) {
        type = 'NETWORK_ERROR';
      } else if (error.name === 'AbortError' || signal?.aborted) {
        type = 'ABORTED';
      }

      const errorMessage = type === 'ABORTED' 
        ? (signal?.reason || error.message || 'Request was cancelled.') 
        : (error.message || 'An unexpected error occurred during the Gemini request.');

      console.error(`[Gemini] Attempt ${attempt} failed (${type}):`, errorMessage);

      // Decide if we should retry
      const isRetryable = type === 'RATE_LIMIT' || type === 'NETWORK_ERROR' || type === 'UNKNOWN';
      
      if (attempt <= maxRetries && isRetryable && type !== 'ABORTED') {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`[Gemini] Retrying in ${delay}ms...`);
        
        // Wait for delay or abortion
        if (signal) {
          await Promise.race([
            new Promise(resolve => setTimeout(resolve, delay)),
            new Promise((_, reject) => signal.addEventListener('abort', () => reject(new GeminiError('ABORTED', signal.reason || 'Request was cancelled.'))))
          ]);
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        continue;
      }

      // If we're here, it's either a non-retryable error or we've exhausted retries
      throw new GeminiError(
        type,
        errorMessage,
        error
      );
    }
  }

  throw lastError;
}

// Re-export Type for convenience
export { Type };

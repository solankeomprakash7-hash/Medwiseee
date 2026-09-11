import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { geminiRequest } from "../src/lib/gemini";

const app = express();
app.use(express.json());

// API routes - registered synchronously at top level for better Vercel support
app.post("/api/analyze", async (req, res) => {
  console.log("[Server] POST /api/analyze - Started");
  try {
    const { prompt, schema, options } = req.body;
    
    if (!prompt || !schema) {
      console.warn("[Server] Missing prompt or schema");
      return res.status(400).json({ error: "Prompt and schema are required." });
    }

    console.log(`[Server] Request received. Model: ${options?.model || 'default'}`);
    
    // Check for API key presence
    if (!process.env.GEMINI_API_KEY) {
      console.error("[Server] GEMINI_API_KEY is missing from environment");
      return res.status(401).json({ 
        error: "API Configuration Error: GEMINI_API_KEY is missing.",
        type: "INVALID_KEY"
      });
    }

    const result = await geminiRequest(prompt, schema, options);
    console.log("[Server] Analysis successful");
    res.json(result);
  } catch (error: any) {
    console.error("[Server] Analysis Error:");
    console.error("- Message:", error.message);
    console.error("- Type:", error.type || "UNKNOWN");
    
    if (error.stack) {
      console.error("- Stack Trace:", error.stack);
    }
    
    const statusCode = error.type === 'RATE_LIMIT' ? 429 : 
                       error.type === 'INVALID_KEY' ? 401 : 
                       500;

    // Ensure we ALWAYS return a JSON body
    res.status(statusCode).json({ 
      error: error.message || "Internal Server Error",
      type: error.type || "UNKNOWN",
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function setupMiddleware() {
  // Vite middleware for development only
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Setting up Vite middleware (Development)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Setting up Static middleware (Production)");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Avoid sending index.html for API calls that fall through
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: "API Route not found" });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if we are not in a serverless environment (like Vercel)
  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Start setup but don't block the export
setupMiddleware().catch(err => {
  console.error("[Server] Critical failure during middleware setup:", err);
});

export default app;

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { geminiRequest } from "./src/lib/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { prompt, schema, options } = req.body;
      
      if (!prompt || !schema) {
        return res.status(400).json({ error: "Prompt and schema are required." });
      }

      console.log(`[Server] Received analysis request. Using model: ${options?.model || 'default'}`);
      
      const result = await geminiRequest(prompt, schema, options);
      res.json(result);
    } catch (error: any) {
      console.error("[Server] Gemini API Error:", error);
      res.status(500).json({ 
        error: error.message || "Internal Server Error",
        type: error.type || "UNKNOWN"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

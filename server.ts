import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Analysis Endpoint - Internal Rule-Based Engine
  app.post("/api/analyze", async (req, res) => {
    try {
      const { claimed_price, market_price, quantity } = req.body;
      
      // Modular Risk Engine Logic
      const price_ratio = claimed_price / market_price;
      let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let risk_prob = 0.1;

      if (price_ratio > 2) {
        risk_level = 'HIGH';
        risk_prob = 0.95;
      } else if (price_ratio > 1.3) {
        risk_level = 'MEDIUM';
        risk_prob = 0.6;
      }

      const result = {
        price_deviation_score: price_ratio - 1,
        quantity_deviation_score: 0.05,
        burn_rate_score: 0.1,
        overall_risk_probability: risk_prob,
        risk_level: risk_level,
        explanation: `Price analysis: Claimed price is ${(price_ratio).toFixed(2)}x the market price. Risk level set to ${risk_level}.`
      };

      res.json(result);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze material" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaxTrace AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

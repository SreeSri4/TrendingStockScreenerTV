import type { Express } from "express";
import { createServer, type Server } from "http";
import { screenerTypes, type ScreenerType, tradingViewResponseSchema, type ProcessedStock } from "@shared/schema";
import { screenerPayloads } from "./screener-payloads";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get stocks by screener type from TradingView API
  app.get("/api/stocks/screener/:type", async (req, res) => {
    try {
      const screenerType = req.params.type as ScreenerType;
      
      // Validate screener type
      const validationType = screenerTypes.safeParse(screenerType);
      if (!validationType.success) {
        return res.status(400).json({ 
          message: "Invalid screener type. Valid types: 52-week-high, volume-buzzers, 1-month-high, 100-percent-up" 
        });
      }

      // Get the payload for this screener type
      const payload = screenerPayloads[screenerType];
      if (!payload) {
        return res.status(400).json({ 
          message: "Screener payload not found" 
        });
      }

      // Call TradingView API
      const response = await fetch("https://scanner.tradingview.com/india/scan?label-product=popup-screener-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`TradingView API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      
      // Validate the response structure
      const validatedData = tradingViewResponseSchema.parse(apiData);

      // Process the data to match our frontend structure
      const processedStocks: ProcessedStock[] = validatedData.data.map(item => {
        const [name, description, close, change, volume, relativeVolume, sma20, marketCap, sector] = item.d;
        
        // Extract symbol from the "s" field (e.g., "NSE:SOLARINDS" -> "SOLARINDS")
        const symbol = item.s.split(':')[1] || item.s;

        return {
          symbol: String(symbol),
          name: String(name),
          description: String(description),
          close: Number(close),
          change: Number(change),
          volume: Number(volume),
          relativeVolume: Number(relativeVolume),
          sma20: Number(sma20),
          marketCap: Number(marketCap),
          sector: String(sector),
        };
      });
      
      res.json({
        stocks: processedStocks,
        count: processedStocks.length,
        screenerType,
      });
    } catch (error) {
      console.error("Error fetching stocks by screener:", error);
      res.status(500).json({ 
        message: "Failed to fetch stock data from TradingView API",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all stocks - removed as we now use TradingView API

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}

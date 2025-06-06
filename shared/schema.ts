import { pgTable, text, serial, decimal, bigint, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 8, scale: 4 }).notNull(),
  volume: bigint("volume", { mode: "number" }).notNull(),
  marketCap: bigint("market_cap", { mode: "number" }).notNull(),
  relativeVolume: bigint("relative_volume", { mode: "number" }).notNull(),
  sma20: bigint("sma20", { mode: "number" }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true,
});

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

// TradingView API response structure
export const tradingViewStockSchema = z.object({
  s: z.string(), // symbol like "NSE:SOLARINDS"
  d: z.array(z.union([z.string(), z.number()])), // data array with mixed types
});

export const tradingViewResponseSchema = z.object({
  totalCount: z.number(),
  data: z.array(tradingViewStockSchema),
});

export type TradingViewResponse = z.infer<typeof tradingViewResponseSchema>;

// Processed stock data from TradingView
export const processedStockSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  description: z.string(),
  close: z.number(),
  change: z.number(),
  volume: z.number(),
  relativeVolume: z.number(),
  sma20: z.number(),
  marketCap: z.number(),
  sector: z.string(),
});

export type ProcessedStock = z.infer<typeof processedStockSchema>;

export const screenerTypes = z.enum([
  "52-week-high",
  "volume-buzzers", 
  "1-month-high",
  "100-percent-up"
]);

export type ScreenerType = z.infer<typeof screenerTypes>;

export const stockResponseSchema = z.object({
  stocks: z.array(processedStockSchema),
  count: z.number(),
  screenerType: screenerTypes,
});

export type StockResponse = z.infer<typeof stockResponseSchema>;

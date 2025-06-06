// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, decimal, bigint, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var stocks = pgTable("stocks", {
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
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});
var insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true
});
var tradingViewStockSchema = z.object({
  s: z.string(),
  // symbol like "NSE:SOLARINDS"
  d: z.array(z.union([z.string(), z.number()]))
  // data array with mixed types
});
var tradingViewResponseSchema = z.object({
  totalCount: z.number(),
  data: z.array(tradingViewStockSchema)
});
var processedStockSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  description: z.string(),
  close: z.number(),
  change: z.number(),
  volume: z.number(),
  relativeVolume: z.number(),
  sma20: z.number(),
  marketCap: z.number(),
  sector: z.string()
});
var screenerTypes = z.enum([
  "52-week-high",
  "volume-buzzers",
  "1-month-high",
  "100-percent-up"
]);
var stockResponseSchema = z.object({
  stocks: z.array(processedStockSchema),
  count: z.number(),
  screenerType: screenerTypes
});

// server/screener-payloads.ts
var screenerPayloads = {
  "52-week-high": {
    "columns": [
      "name",
      "description",
      "close",
      "change",
      "volume",
      "relative_volume",
      "SMA20",
      "market_cap_basic",
      "sector"
    ],
    "filter": [
      {
        "left": "country",
        "operation": "in_range",
        "right": ["India"]
      },
      {
        "left": "close",
        "operation": "egreater",
        "right": 30
      },
      {
        "left": "exchange",
        "operation": "in_range",
        "right": ["NSE"]
      },
      {
        "left": "average_volume_60d_calc",
        "operation": "greater",
        "right": 1e5
      },
      {
        "left": "price_52_week_high",
        "operation": "eless",
        "right": "high"
      },
      {
        "left": "market_cap_basic",
        "operation": "egreater",
        "right": 8e9
      },
      {
        "left": "is_primary",
        "operation": "equal",
        "right": true
      }
    ],
    "ignore_unknown_fields": false,
    "options": {
      "lang": "en"
    },
    "range": [0, 100],
    "sort": {
      "sortBy": "market_cap_basic",
      "sortOrder": "desc"
    },
    "symbols": {},
    "markets": ["india"],
    "filter2": {
      "operator": "and",
      "operands": [
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["preferred"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "dr"
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "fund"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has_none_of",
                        "right": ["etf"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  "volume-buzzers": {
    "columns": [
      "name",
      "description",
      "close",
      "change",
      "volume",
      "relative_volume",
      "SMA20",
      "market_cap_basic",
      "sector"
    ],
    "filter": [
      {
        "left": "close",
        "operation": "egreater",
        "right": 30
      },
      {
        "left": "country",
        "operation": "in_range",
        "right": ["India"]
      },
      {
        "left": "exchange",
        "operation": "in_range",
        "right": ["NSE"]
      },
      {
        "left": "average_volume_60d_calc",
        "operation": "greater",
        "right": 1e5
      },
      {
        "left": "change",
        "operation": "greater",
        "right": 3
      },
      {
        "left": "relative_volume_10d_calc",
        "operation": "greater",
        "right": 3
      },
      {
        "left": "market_cap_basic",
        "operation": "egreater",
        "right": 8e9
      }
    ],
    "ignore_unknown_fields": false,
    "options": {
      "lang": "en"
    },
    "range": [0, 100],
    "sort": {
      "sortBy": "market_cap_basic",
      "sortOrder": "desc"
    },
    "symbols": {},
    "markets": ["india"],
    "filter2": {
      "operator": "and",
      "operands": [
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["preferred"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "dr"
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "fund"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has_none_of",
                        "right": ["etf"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  "1-month-high": {
    "columns": [
      "name",
      "description",
      "close",
      "change",
      "volume",
      "relative_volume",
      "SMA20",
      "market_cap_basic",
      "sector"
    ],
    "filter": [
      {
        "left": "country",
        "operation": "in_range",
        "right": ["India"]
      },
      {
        "left": "exchange",
        "operation": "in_range",
        "right": ["NSE"]
      },
      {
        "left": "close",
        "operation": "egreater",
        "right": 30
      },
      {
        "left": "average_volume_60d_calc",
        "operation": "greater",
        "right": 1e5
      },
      {
        "left": "High.1M",
        "operation": "eless",
        "right": "high"
      },
      {
        "left": "market_cap_basic",
        "operation": "egreater",
        "right": 8e9
      }
    ],
    "ignore_unknown_fields": false,
    "options": {
      "lang": "en"
    },
    "range": [0, 100],
    "sort": {
      "sortBy": "market_cap_basic",
      "sortOrder": "desc"
    },
    "symbols": {},
    "markets": ["india"],
    "filter2": {
      "operator": "and",
      "operands": [
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["preferred"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "dr"
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "fund"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has_none_of",
                        "right": ["etf"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  "100-percent-up": {
    "columns": [
      "name",
      "description",
      "close",
      "change",
      "volume",
      "relative_volume",
      "SMA20",
      "market_cap_basic",
      "sector"
    ],
    "filter": [
      {
        "left": "country",
        "operation": "in_range",
        "right": ["India"]
      },
      {
        "left": "exchange",
        "operation": "in_range",
        "right": ["NSE"]
      },
      {
        "left": "close",
        "operation": "egreater",
        "right": 30
      },
      {
        "left": "average_volume_60d_calc",
        "operation": "greater",
        "right": 1e5
      },
      {
        "left": "market_cap_basic",
        "operation": "egreater",
        "right": 8e9
      },
      {
        "left": "Perf.Y",
        "operation": "greater",
        "right": 100
      }
    ],
    "ignore_unknown_fields": false,
    "options": {
      "lang": "en"
    },
    "range": [0, 100],
    "sort": {
      "sortBy": "market_cap_basic",
      "sortOrder": "desc"
    },
    "symbols": {},
    "markets": ["india"],
    "filter2": {
      "operator": "and",
      "operands": [
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "operation": {
            "operator": "or",
            "operands": [
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["common"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "stock"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has",
                        "right": ["preferred"]
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "dr"
                      }
                    }
                  ]
                }
              },
              {
                "operation": {
                  "operator": "and",
                  "operands": [
                    {
                      "expression": {
                        "left": "type",
                        "operation": "equal",
                        "right": "fund"
                      }
                    },
                    {
                      "expression": {
                        "left": "typespecs",
                        "operation": "has_none_of",
                        "right": ["etf"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/stocks/screener/:type", async (req, res) => {
    try {
      const screenerType = req.params.type;
      const validationType = screenerTypes.safeParse(screenerType);
      if (!validationType.success) {
        return res.status(400).json({
          message: "Invalid screener type. Valid types: 52-week-high, volume-buzzers, 1-month-high, 100-percent-up"
        });
      }
      const payload = screenerPayloads[screenerType];
      if (!payload) {
        return res.status(400).json({
          message: "Screener payload not found"
        });
      }
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
      const validatedData = tradingViewResponseSchema.parse(apiData);
      const processedStocks = validatedData.data.map((item) => {
        const [name, description, close, change, volume, relativeVolume, sma20, marketCap, sector] = item.d;
        const symbol = item.s.split(":")[1] || item.s;
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
          sector: String(sector)
        };
      });
      res.json({
        stocks: processedStocks,
        count: processedStocks.length,
        screenerType
      });
    } catch (error) {
      console.error("Error fetching stocks by screener:", error);
      res.status(500).json({
        message: "Failed to fetch stock data from TradingView API",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

import { stocks, type Stock, type InsertStock, type ScreenerType } from "@shared/schema";

export interface IStorage {
  getStocksByScreener(screenerType: ScreenerType): Promise<Stock[]>;
  getAllStocks(): Promise<Stock[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private stocks: Map<number, Stock>;
  private currentId: number;

  constructor() {
    this.stocks = new Map();
    this.currentId = 1;
    this.initializeStockData();
  }

  private initializeStockData() {
    // Initialize with sample stock data representing different screener categories
    const sampleStocks: Omit<Stock, 'id'>[] = [
      // 52 Week High stocks
      { symbol: 'AAPL', name: 'Apple Inc.', price: '175.25', change: '2.15', changePercent: '1.24', volume: 45200000, marketCap: 2750000000000, lastUpdated: new Date() },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: '338.50', change: '5.20', changePercent: '1.56', volume: 28100000, marketCap: 2520000000000, lastUpdated: new Date() },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '2650.00', change: '15.75', changePercent: '0.60', volume: 1200000, marketCap: 1680000000000, lastUpdated: new Date() },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: '245.80', change: '8.45', changePercent: '3.56', volume: 85300000, marketCap: 780000000000, lastUpdated: new Date() },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '425.15', change: '12.30', changePercent: '2.98', volume: 55700000, marketCap: 1050000000000, lastUpdated: new Date() },
      
      // Volume Buzzers
      { symbol: 'AMC', name: 'AMC Entertainment', price: '8.25', change: '0.85', changePercent: '11.49', volume: 125800000, marketCap: 4200000000, lastUpdated: new Date() },
      { symbol: 'GME', name: 'GameStop Corp.', price: '18.75', change: '1.95', changePercent: '11.61', volume: 98500000, marketCap: 5700000000, lastUpdated: new Date() },
      { symbol: 'SPCE', name: 'Virgin Galactic', price: '2.15', change: '0.25', changePercent: '13.16', volume: 67200000, marketCap: 570000000, lastUpdated: new Date() },
      { symbol: 'BB', name: 'BlackBerry Limited', price: '3.45', change: '0.15', changePercent: '4.55', volume: 45800000, marketCap: 1960000000, lastUpdated: new Date() },
      
      // 1 Month High
      { symbol: 'META', name: 'Meta Platforms Inc.', price: '315.80', change: '4.25', changePercent: '1.37', volume: 22500000, marketCap: 815000000000, lastUpdated: new Date() },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: '445.20', change: '8.90', changePercent: '2.04', volume: 12800000, marketCap: 198000000000, lastUpdated: new Date() },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: '118.45', change: '3.15', changePercent: '2.73', volume: 38900000, marketCap: 191000000000, lastUpdated: new Date() },
      { symbol: 'CRM', name: 'Salesforce Inc.', price: '210.35', change: '5.75', changePercent: '2.81', volume: 18400000, marketCap: 208000000000, lastUpdated: new Date() },
      
      // 100% Up in a Year
      { symbol: 'SMCI', name: 'Super Micro Computer', price: '485.60', change: '25.80', changePercent: '5.61', volume: 8900000, marketCap: 28500000000, lastUpdated: new Date() },
      { symbol: 'COIN', name: 'Coinbase Global Inc.', price: '165.25', change: '12.45', changePercent: '8.15', volume: 15700000, marketCap: 38200000000, lastUpdated: new Date() },
      { symbol: 'PLTR', name: 'Palantir Technologies', price: '28.90', change: '2.85', changePercent: '10.95', volume: 42100000, marketCap: 65800000000, lastUpdated: new Date() },
      { symbol: 'RBLX', name: 'Roblox Corporation', price: '45.75', change: '3.25', changePercent: '7.64', volume: 28300000, marketCap: 28900000000, lastUpdated: new Date() },
    ];

    sampleStocks.forEach(stock => {
      const id = this.currentId++;
      this.stocks.set(id, { ...stock, id });
    });
  }

  async getStocksByScreener(screenerType: ScreenerType): Promise<Stock[]> {
    const allStocks = Array.from(this.stocks.values());
    
    // Filter stocks based on screener type
    switch (screenerType) {
      case '52-week-high':
        return allStocks.filter(stock => 
          ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(stock.symbol)
        );
      case 'volume-buzzers':
        return allStocks.filter(stock => 
          ['AMC', 'GME', 'SPCE', 'BB'].includes(stock.symbol)
        );
      case '1-month-high':
        return allStocks.filter(stock => 
          ['META', 'NFLX', 'AMD', 'CRM'].includes(stock.symbol)
        );
      case '100-percent-up':
        return allStocks.filter(stock => 
          ['SMCI', 'COIN', 'PLTR', 'RBLX'].includes(stock.symbol)
        );
      default:
        return [];
    }
  }

  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentId++;
    const stock: Stock = { 
      ...insertStock, 
      id, 
      lastUpdated: new Date() 
    };
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, updates: Partial<InsertStock>): Promise<Stock | undefined> {
    const existingStock = this.stocks.get(id);
    if (!existingStock) return undefined;

    const updatedStock: Stock = {
      ...existingStock,
      ...updates,
      lastUpdated: new Date(),
    };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async deleteStock(id: number): Promise<boolean> {
    return this.stocks.delete(id);
  }
}

export const storage = new MemStorage();

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `₹${numPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000000) {
    return `₹${(marketCap / 1000000000000).toFixed(2)}T`;
  } else if (marketCap >= 1000000000) {
    return `₹${(marketCap / 1000000000).toFixed(1)}B`;
  } else if (marketCap >= 1000000) {
    return `₹${(marketCap / 1000000).toFixed(1)}M`;
  }
  return `₹${marketCap.toLocaleString("en-IN")}`;
}

export function formatChange(change: string | number, changePercent: string | number): string {
  const numChange = typeof change === "string" ? parseFloat(change) : change;
  const numChangePercent = typeof changePercent === "string" ? parseFloat(changePercent) : changePercent;
  
  const sign = numChange >= 0 ? "+" : "";
  return `${sign}$${numChange.toFixed(2)} (${sign}${numChangePercent.toFixed(2)}%)`;
}

export function getScreenerTitle(screenerType: string): string {
  const titles: Record<string, string> = {
    "52-week-high": "52 Week High Stocks",
    "volume-buzzers": "Volume Buzzers",
    "1-month-high": "1 Month High Stocks",
    "100-percent-up": "100% Up in a Year"
  };
  return titles[screenerType] || "Stock Results";
}

export function formatLastUpdated(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });
}

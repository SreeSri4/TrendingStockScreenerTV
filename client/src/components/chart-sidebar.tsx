import { useState, useEffect } from "react";
import { X, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartSidebarProps {
  symbol: string | null;
  onClose: () => void;
}

export function ChartSidebar({ symbol, onClose }: ChartSidebarProps) {
  if (!symbol) return null;

  const chartUrl = `https://in.tradingview.com/chart/?symbol=NSE:${symbol}&interval=1D`;

  const openInNewTab = () => {
    window.open(chartUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">Chart: {symbol}</h3>
          <span className="text-sm text-gray-500">NSE</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chart content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-blue-50 rounded-full p-6 mb-6">
          <TrendingUp className="h-12 w-12 text-blue-600" />
        </div>
        
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          View {symbol} Chart
        </h4>
        
        <p className="text-gray-600 mb-6 max-w-md">
          Click below to open the interactive TradingView chart for {symbol} in a new tab with advanced charting tools and real-time data.
        </p>

        <Button
          onClick={openInNewTab}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Chart in TradingView
        </Button>

        <div className="mt-8 text-sm text-gray-500">
          <p>Features available on TradingView:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• Real-time price data</li>
            <li>• Technical indicators</li>
            <li>• Drawing tools</li>
            <li>• Historical data</li>
            <li>• Multiple timeframes</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Chart powered by TradingView
        </p>
      </div>
    </div>
  );
}
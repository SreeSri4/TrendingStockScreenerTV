import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { ScreenerControls } from "@/components/screener-controls";
import { StockTable } from "@/components/stock-table";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getScreenerTitle, formatLastUpdated } from "@/lib/utils";
import type { StockResponse, ScreenerType } from "@shared/schema";

export default function StockScreener() {
  const [selectedScreener, setSelectedScreener] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>(formatLastUpdated());
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<StockResponse>({
    queryKey: ["/api/stocks/screener", selectedScreener],
    enabled: !!selectedScreener,
    queryFn: async () => {
      const response = await fetch(`/api/stocks/screener/${selectedScreener}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch stock data");
      }
      
      return response.json();
    },
  });

  const handleScreenerChange = (value: string) => {
    setSelectedScreener(value);
  };

  const handleRefresh = () => {
    if (selectedScreener) {
      refetch();
    }
  };

  // Update last updated timestamp when data changes
  useEffect(() => {
    if (data) {
      setLastUpdated(formatLastUpdated());
      toast({
        title: "Data updated successfully",
        variant: "default",
        duration: 3000,
      });
    }
  }, [data, toast]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load data",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [error, toast]);

  const renderContent = () => {
    if (!selectedScreener) {
      return (
        <div className="px-6 py-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Screen Stocks</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Choose a screening criteria from the dropdown above to discover stocks that meet your investment criteria.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="px-6 py-12 text-center">
          <div className="inline-flex items-center">
            <Loader2 className="animate-spin h-5 w-5 text-blue-500 mr-3" />
            <span className="text-gray-600">Loading stock data...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="px-6 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-red-800">Unable to load data</h4>
                <p className="mt-1 text-sm text-red-600">
                  {error.message || "Please try again or contact support if the problem persists."}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (data && data.stocks.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h4>
          <p className="text-gray-600">
            No stocks match the selected screening criteria at this time.
          </p>
        </div>
      );
    }

    return <StockTable data={data?.stocks || []} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Trending Stocks Screener</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last updated: <span className="font-medium">{lastUpdated}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScreenerControls
          selectedScreener={selectedScreener}
          onScreenerChange={handleScreenerChange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Results Section */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Results Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedScreener ? getScreenerTitle(selectedScreener) : "Select a screener to view results"}
              </h3>
              {data && (
                <p className="text-sm text-gray-600 mt-1">
                  {data.count} stocks found
                </p>
              )}
            </div>
          </div>

          <CardContent className="p-0">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data provided for demonstration purposes. Real-time market data integration available.</p>
        </div>
      </main>

    </div>
  );
}

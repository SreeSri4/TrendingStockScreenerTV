import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ScreenerControlsProps {
  selectedScreener: string;
  onScreenerChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ScreenerControls({ 
  selectedScreener, 
  onScreenerChange, 
  onRefresh, 
  isLoading 
}: ScreenerControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Stock Screener</h2>
          <p className="text-sm text-gray-600">Select a screening criteria to filter stocks</p>
        </div>
        
        <div className="sm:w-80">
          <label htmlFor="screener-select" className="block text-sm font-medium text-gray-700 mb-2">
            Screening Criteria
          </label>
          <div className="flex gap-3">
            <Select value={selectedScreener} onValueChange={onScreenerChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a screener..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="52-week-high">52 Week High</SelectItem>
                <SelectItem value="volume-buzzers">Volume Buzzers</SelectItem>
                <SelectItem value="1-month-high">1 Month High</SelectItem>
                <SelectItem value="100-percent-up">100% Up in a Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={onRefresh}
              disabled={!selectedScreener || isLoading}
              variant="outline"
              size="icon"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

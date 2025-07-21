import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface BidderFormProps {
  onSubmit: (data: { bidderDetails: string; percentage: number }) => void;
  isLoading?: boolean;
}

export default function BidderForm({ onSubmit, isLoading }: BidderFormProps) {
  const [bidderDetails, setBidderDetails] = useState("");
  const [percentage, setPercentage] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidderDetails.trim()) {
      alert("Please enter bidder details");
      return;
    }
    
    if (percentage < -99.99 || percentage > 99.99) {
      alert("Percentage must be between -99.99 and +99.99");
      return;
    }
    
    onSubmit({
      bidderDetails: bidderDetails.trim(),
      percentage
    });
    
    // Reset form
    setBidderDetails("");
    setPercentage(0);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setPercentage(0);
    } else if (value < -99.99) {
      setPercentage(-99.99);
    } else if (value > 99.99) {
      setPercentage(99.99);
    } else {
      setPercentage(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bidder Details Cell */}
        <div className="space-y-2">
          <Label htmlFor="bidder-details" className="text-sm font-medium text-gray-700">
            Bidder Details (Name & Address)
          </Label>
          <Textarea
            id="bidder-details"
            value={bidderDetails}
            onChange={(e) => setBidderDetails(e.target.value)}
            className="h-32 resize-none"
            placeholder="Enter bidder name and complete address in this single cell...&#10;Example:&#10;M/s ABC Construction Company&#10;123, Industrial Area, Sector-5&#10;Udaipur, Rajasthan - 313001&#10;Contact: +91-9876543210"
          />
        </div>
        
        {/* Percentage Cell */}
        <div className="space-y-2">
          <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">
            Percentage (-99.99 to +99.99)
          </Label>
          <div className="relative">
            <Input
              id="percentage"
              type="number"
              step="0.01"
              min="-99.99"
              max="99.99"
              value={percentage}
              onChange={handlePercentageChange}
              className="text-center text-2xl font-bold pr-8"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
              %
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Range: -99.99% to +99.99% (0.00 allowed)
          </p>
        </div>
      </div>
      
      <div className="flex justify-start">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Adding..." : "Add Bidder"}
        </Button>
      </div>
    </form>
  );
}

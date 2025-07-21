import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Trophy, Percent, AlertCircle, CheckCircle } from "lucide-react";
import type { Bidder, BidderPercentile } from "@shared/schema";

interface EnhancedBidderFormProps {
  tenderId: number;
  onSuccess?: () => void;
}

export default function EnhancedBidderForm({ tenderId, onSuccess }: EnhancedBidderFormProps) {
  const { toast } = useToast();
  const [newBidderMode, setNewBidderMode] = useState(false);
  const [selectedBidderId, setSelectedBidderId] = useState<string>("");
  const [bidderDetails, setBidderDetails] = useState("");
  const [percentage, setPercentage] = useState("");

  // Fetch existing bidders
  const { data: bidders = [] } = useQuery<Bidder[]>({
    queryKey: ["/api/bidders"]
  });

  // Fetch current percentiles
  const { data: percentiles = [] } = useQuery<BidderPercentile[]>({
    queryKey: ["/api/tenders", tenderId, "percentiles"]
  });

  const addBidderPercentileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bidder-percentiles", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bidder percentile added successfully"
      });
      setSelectedBidderId("");
      setBidderDetails("");
      setPercentage("");
      setNewBidderMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tenders", tenderId, "percentiles"] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add bidder percentile",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!percentage) {
      toast({
        title: "Error",
        description: "Please enter percentage",
        variant: "destructive"
      });
      return;
    }

    const percentValue = parseFloat(percentage);
    if (percentValue < -99.99 || percentValue > 99.99) {
      toast({
        title: "Error",
        description: "Percentage must be between -99.99% and +99.99%",
        variant: "destructive"
      });
      return;
    }

    let finalBidderDetails = "";
    let finalBidderId = null;

    if (newBidderMode) {
      if (!bidderDetails.trim()) {
        toast({
          title: "Error",
          description: "Please enter bidder details",
          variant: "destructive"
        });
        return;
      }
      finalBidderDetails = bidderDetails.trim();
    } else {
      const selectedBidder = bidders.find(b => b.id?.toString() === selectedBidderId);
      if (!selectedBidder) {
        toast({
          title: "Error",
          description: "Please select a bidder",
          variant: "destructive"
        });
        return;
      }
      finalBidderId = selectedBidder.id;
      finalBidderDetails = `${selectedBidder.name}\n${selectedBidder.address}\n${selectedBidder.contact || ''}`;
    }

    addBidderPercentileMutation.mutate({
      tenderId,
      bidderId: finalBidderId,
      percentage: percentage,
      bidderDetails: finalBidderDetails
    });
  };

  const isSingleBidder = percentiles.length === 1;
  const canAddMore = percentiles.length < 50; // Reasonable limit

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Users className="text-purple-600 mr-2" />
            Bidder Selection & Percentile Entry
          </CardTitle>
          <div className="flex items-center space-x-2">
            {percentiles.length === 0 && (
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                No Bidders Yet
              </Badge>
            )}
            {percentiles.length === 1 && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Single Bidder Tender
              </Badge>
            )}
            {percentiles.length > 1 && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Multi-Bidder ({percentiles.length})
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Guidelines */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Users className="text-blue-600 text-sm mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-700">Bidder Selection Guidelines</h4>
              <ul className="text-xs text-blue-600 mt-1 space-y-1">
                <li>• Single bidder participation is allowed for specialized tenders</li>
                <li>• New bidders can be added even if not in existing database</li>
                <li>• Bidder name window: 125mm x 15mm (optimized for form printing)</li>
                <li>• Percentage range: -99.99% to +99.99%</li>
                <li>• L1 bidder (lowest) is automatically identified in multi-bidder tenders</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bidder Selection Mode */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Bidder Source:</label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={!newBidderMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewBidderMode(false)}
                >
                  Existing Bidder
                </Button>
                <Button
                  type="button"
                  variant={newBidderMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewBidderMode(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  New Bidder
                </Button>
              </div>
            </div>

            {/* Existing Bidder Selection */}
            {!newBidderMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select from {bidders.length} registered bidders:</label>
                <Select value={selectedBidderId} onValueChange={setSelectedBidderId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a registered bidder..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bidders.map((bidder) => (
                      <SelectItem key={bidder.id} value={bidder.id!.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{bidder.name}</span>
                          <span className="text-xs text-gray-500">{bidder.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* New Bidder Details */}
            {newBidderMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bidder Details (125mm x 15mm window):
                </label>
                <Textarea
                  value={bidderDetails}
                  onChange={(e) => setBidderDetails(e.target.value)}
                  placeholder="Enter bidder name, address, and contact details...&#10;Line 1: Company Name&#10;Line 2: Address&#10;Line 3: Contact Info"
                  className="min-h-[60px] text-sm"
                  style={{
                    width: '125mm',
                    height: '15mm',
                    minWidth: '125mm',
                    maxWidth: '125mm',
                    minHeight: '15mm',
                    maxHeight: '15mm',
                    border: '2px dashed #ccc',
                    fontFamily: 'monospace'
                  }}
                />
                <p className="text-xs text-gray-500">
                  Exact dimensions: 125mm x 15mm (as per form requirements)
                </p>
              </div>
            )}
          </div>

          {/* Percentage Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Percent className="w-4 h-4 mr-1" />
              Percentage (-99.99% to +99.99%):
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g., -5.25 or +2.50"
                step="0.01"
                min="-99.99"
                max="99.99"
                className="w-32"
              />
              <span className="text-sm text-gray-500">%</span>
              {percentage && (
                <Badge variant={parseFloat(percentage) < 0 ? "destructive" : "secondary"}>
                  {parseFloat(percentage) >= 0 ? '+' : ''}{percentage}%
                </Badge>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={addBidderPercentileMutation.isPending || !canAddMore}
            className="w-full"
          >
            {addBidderPercentileMutation.isPending ? (
              "Adding Bidder..."
            ) : (
              `Add Bidder ${percentiles.length === 0 ? '(First)' : `(${percentiles.length + 1})`}`
            )}
          </Button>

          {!canAddMore && (
            <p className="text-xs text-red-500 text-center">
              Maximum number of bidders reached (50)
            </p>
          )}
        </form>

        {/* Current Status */}
        {percentiles.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Current Status: {percentiles.length} bidder{percentiles.length > 1 ? 's' : ''} participating
              </span>
              {isSingleBidder && (
                <Badge variant="outline" className="text-xs">
                  Single Bidder Allowed ✓
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
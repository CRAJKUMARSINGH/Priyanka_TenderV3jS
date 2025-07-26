import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building, 
  FileSpreadsheet, 
  Users, 
  Percent, 
  FileText, 
  Star, 
  Award, 
  Heart, 
  Trophy,
  Upload,
  Download,
  Plus,
  List,
  Gavel,
  ChartLine,
  Settings,
  CheckCircle,
  Clock
} from "lucide-react";
import Navigation from "@/components/ui/navigation";
import FileUpload from "@/components/ui/file-upload";
import BidderForm from "@/components/ui/bidder-form";
import EnhancedBidderForm from "@/components/ui/enhanced-bidder-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tender, Bidder, BidderPercentile } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [currentTenderId, setCurrentTenderId] = useState<number>(1);
  const [documentTypes, setDocumentTypes] = useState({
    tender: true,
    comparison: true,
    summary: true,
    financial: true
  });
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch data
  const { data: tenders = [] } = useQuery<Tender[]>({
    queryKey: ["/api/tenders"]
  });

  const { data: bidders = [] } = useQuery<Bidder[]>({
    queryKey: ["/api/bidders"]
  });

  const { data: percentiles = [] } = useQuery<BidderPercentile[]>({
    queryKey: ["/api/tenders", currentTenderId, "percentiles"]
  });

  // Mutations
  const demoSetupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/demo-setup", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Demo Ready!",
        description: "Sample tender and bidders created successfully"
      });
      setCurrentTenderId(data.tender.id);
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders", data.tender.id, "percentiles"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to setup demo data",
        variant: "destructive"
      });
    }
  });

  const uploadExcelMutation = useMutation({
    mutationFn: async (data: { fileData: any; fileName: string }) => {
      const response = await apiRequest("POST", "/api/upload-excel", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Excel file uploaded and processed successfully"
      });
      setCurrentTenderId(data.tender.id);
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload Excel file",
        variant: "destructive"
      });
    }
  });

  const addBidderPercentileMutation = useMutation({
    mutationFn: async (data: { 
      tenderId: number; 
      bidderId?: number; 
      percentage: number; 
      bidderDetails: string 
    }) => {
      const response = await apiRequest("POST", "/api/bidder-percentiles", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bidder percentile added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenders", currentTenderId, "percentiles"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add bidder percentile",
        variant: "destructive"
      });
    }
  });

  const generateDocumentsMutation = useMutation({
    mutationFn: async (data: { tenderId: number; documentTypes: string[] }) => {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest("POST", "/api/generate-documents", data);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Documents generated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate documents",
        variant: "destructive"
      });
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  });

  const downloadZipMutation = useMutation({
    mutationFn: async (tenderId: number) => {
      const response = await fetch(`/api/download-zip/${tenderId}`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tender_${tenderId}_documents.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "ZIP file downloaded successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download ZIP file",
        variant: "destructive"
      });
    }
  });

  const handleGenerateDocuments = () => {
    const selectedTypes = Object.entries(documentTypes)
      .filter(([_, selected]) => selected)
      .map(([type, _]) => type);
    
    generateDocumentsMutation.mutate({
      tenderId: currentTenderId,
      documentTypes: selectedTypes
    });
  };

  const handleDownloadZip = () => {
    downloadZipMutation.mutate(currentTenderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gov-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building className="text-2xl" />
              <div>
                <h1 className="text-xl font-bold">Tender Management System</h1>
                <p className="text-blue-200 text-sm">Public Works Department, Udaipur</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <Star className="celebration-star" />
                <Award className="text-yellow-300" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Welcome Admin</p>
                <p className="text-xs text-blue-200">Last login: Today, 10:30 AM</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stats-card stats-card-blue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tenders</p>
                    <p className="text-2xl font-bold text-gray-900">{tenders.length}</p>
                  </div>
                  <Gavel className="text-blue-500 text-2xl" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="stats-card stats-card-green">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bidders</p>
                    <p className="text-2xl font-bold text-gray-900">{bidders.length}</p>
                  </div>
                  <Users className="text-green-500 text-2xl" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="stats-card stats-card-purple">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documents Generated</p>
                    <p className="text-2xl font-bold text-gray-900">128</p>
                  </div>
                  <FileText className="text-purple-500 text-2xl" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="stats-card stats-card-orange">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">95.5%</p>
                  </div>
                  <ChartLine className="text-orange-500 text-2xl" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Excel Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="text-green-600 mr-2" />
                  Work Detail Input
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Heart className="celebration-heart" />
                  <span className="text-sm text-gray-500">Step 1 of 3</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-yellow-500" />
                    <span className="font-medium text-purple-700">Quick Start Demo</span>
                    <Star className="celebration-star text-sm" />
                  </div>
                  <Button 
                    onClick={() => demoSetupMutation.mutate()}
                    disabled={demoSetupMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {demoSetupMutation.isPending ? "Setting up..." : "🚀 Create Demo Data"}
                  </Button>
                </div>
                <p className="text-sm text-purple-600 mt-2">Create sample tender with bidders to test all features instantly</p>
              </div>
              
              <FileUpload 
                onUpload={(fileData, fileName) => {
                  uploadExcelMutation.mutate({ fileData, fileName });
                }}
                isLoading={uploadExcelMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Enhanced Bidder Management Section */}
          <EnhancedBidderForm 
            tenderId={currentTenderId}
            onSuccess={() => {
              queryClient.invalidateQueries({ 
                queryKey: ["/api/tenders", currentTenderId, "percentiles"] 
              });
            }}
          />

          {/* Bidder Participation Results */}
          {percentiles.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="text-purple-600 mr-2" />
                    Bidder Participation Results
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {percentiles.length === 1 ? (
                      <Badge className="bg-blue-100 text-blue-700">
                        <Trophy className="w-3 h-3 mr-1" />
                        Single Bidder Tender
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">
                        {percentiles.length} Bidders Participating
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">S.No</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium" 
                            style={{width: '125mm', minWidth: '125mm', maxWidth: '125mm'}}>
                          Bidder Details (125mm x 15mm Window)
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Percentage</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Quoted Amount</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Rank</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {percentiles
                        .sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))
                        .map((percentile, index) => {
                          const currentTender = tenders.find(t => t.id === currentTenderId);
                          const baseAmount = currentTender ? parseFloat(currentTender.estimatedAmount) : 0;
                          const quotedAmount = baseAmount * (1 + parseFloat(percentile.percentage) / 100);
                          const isL1 = index === 0 && percentiles.length > 1;
                          const isSingle = percentiles.length === 1;
                          
                          return (
                            <tr key={percentile.id} className={isL1 ? "bg-green-50" : isSingle ? "bg-blue-50" : ""}>
                              <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                                {index + 1}
                              </td>
                              <td className="border border-gray-300 px-3 py-2" 
                                  style={{
                                    width: '125mm', 
                                    minWidth: '125mm', 
                                    maxWidth: '125mm',
                                    height: '15mm',
                                    minHeight: '15mm',
                                    maxHeight: '15mm'
                                  }}>
                                <div className="text-xs leading-tight overflow-hidden font-mono"
                                     style={{
                                       height: '15mm',
                                       lineHeight: '1.1',
                                       display: '-webkit-box',
                                       WebkitLineClamp: 3,
                                       WebkitBoxOrient: 'vertical'
                                     }}>
                                  {percentile.bidderDetails}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                <Badge variant={parseFloat(percentile.percentage) < 0 ? "destructive" : "secondary"}>
                                  {parseFloat(percentile.percentage) >= 0 ? '+' : ''}{percentile.percentage}%
                                </Badge>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                                ₹ {quotedAmount.toLocaleString('en-IN')}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {isSingle ? (
                                  <Badge variant="outline" className="text-xs">
                                    Only
                                  </Badge>
                                ) : (
                                  <Badge variant={isL1 ? "default" : "outline"} className="text-xs">
                                    {isL1 ? "L1" : `L${index + 1}`}
                                  </Badge>
                                )}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {isL1 ? (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Lowest Bidder
                                  </Badge>
                                ) : isSingle ? (
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    Single Participant
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Participant
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Tender Summary:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Participants:</span>
                      <span className="font-medium ml-2">{percentiles.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tender Type:</span>
                      <span className="font-medium ml-2">
                        {percentiles.length === 1 ? "Single Bidder" : "Multi-Bidder Competitive"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">L1 Bidder:</span>
                      <span className="font-medium ml-2">
                        {percentiles.length > 0 ? 
                          percentiles.sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage))[0]
                            .bidderDetails.split('\n')[0] : 
                          "None"
                        }
                      </span>
                    </div>
                  </div>
                  
                  {percentiles.length === 1 && (
                    <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-200">
                      <p className="text-blue-700 text-sm">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Single bidder tender is valid for specialized works where limited qualified contractors are available.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Generation Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="text-red-600 mr-2" />
                  Document Generation & Download
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Trophy className="celebration-trophy" />
                  <span className="text-sm text-gray-500">Step 3 of 3</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generation Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Generation Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={documentTypes.tender}
                        onCheckedChange={(checked) => 
                          setDocumentTypes(prev => ({ ...prev, tender: !!checked }))
                        }
                      />
                      <span className="text-sm">Tender Documents (PDF)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={documentTypes.comparison}
                        onCheckedChange={(checked) => 
                          setDocumentTypes(prev => ({ ...prev, comparison: !!checked }))
                        }
                      />
                      <span className="text-sm">Bidder Comparison Sheet</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={documentTypes.summary}
                        onCheckedChange={(checked) => 
                          setDocumentTypes(prev => ({ ...prev, summary: !!checked }))
                        }
                      />
                      <span className="text-sm">Work Detail Summary</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={documentTypes.financial}
                        onCheckedChange={(checked) => 
                          setDocumentTypes(prev => ({ ...prev, financial: !!checked }))
                        }
                      />
                      <span className="text-sm">Financial Analysis Report</span>
                    </div>
                  </div>
                </div>
                
                {/* Generation Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Generation Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Excel Data</span>
                      <CheckCircle className="text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Bidder Data</span>
                      <CheckCircle className="text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">PDF Generation</span>
                      <Clock className="text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <Button 
                  className="flex-1" 
                  onClick={handleGenerateDocuments}
                  disabled={isGenerating}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Generate All Documents
                </Button>
                
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  onClick={handleDownloadZip}
                  disabled={downloadZipMutation.isPending}
                >
                  <Download className="mr-2 h-4 w-4" />
                  One-Click ZIP Download
                </Button>
              </div>
              
              {/* Progress Bar */}
              {isGenerating && (
                <div className="mt-6">
                  <Progress value={generationProgress} className="w-full" />
                  <p className="text-sm text-gray-600 mt-2">
                    Generating documents... {generationProgress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Footer Credits */}
      <footer className="gov-header py-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="flex items-center justify-around h-full">
            <Star className="celebration-star text-6xl" />
            <Trophy className="celebration-trophy text-6xl" />
            <Heart className="celebration-heart text-6xl" />
            <Award className="text-yellow-300 text-6xl" />
          </div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex space-x-2">
                <Heart className="celebration-heart animate-pulse" />
                <Star className="celebration-star" />
                <Award className="text-orange-300 animate-bounce" />
                <Trophy className="celebration-trophy" />
              </div>
              <div>
                <p className="text-sm font-medium">🎉 An Initiative By</p>
                <p className="text-lg font-bold">Mrs. Premlata Jain</p>
                <p className="text-sm text-blue-200">Additional Administrative Officer, PWD, Udaipur</p>
                <p className="text-xs text-blue-300 italic">Making Government Procurement Transparent & Efficient</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-blue-200">© 2025 Public Works Department, Udaipur</p>
              <p className="text-xs text-blue-300">Tender Management System v3.0 - Success Rate: 99.99%</p>
              <div className="flex items-center justify-center md:justify-end space-x-1 mt-2">
                <span className="text-xs text-blue-300">Powered by Excellence</span>
                <Star className="text-yellow-300 text-xs" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

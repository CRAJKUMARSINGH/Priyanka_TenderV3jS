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
              <FileUpload 
                onUpload={(fileData, fileName) => {
                  uploadExcelMutation.mutate({ fileData, fileName });
                }}
                isLoading={uploadExcelMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Bidder Percentile Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Percent className="text-orange-600 mr-2" />
                  Bidder Percentile Management
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Star className="celebration-star" />
                  <span className="text-sm text-gray-500">Step 2 of 3</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BidderForm 
                onSubmit={(data) => {
                  addBidderPercentileMutation.mutate({
                    tenderId: currentTenderId,
                    ...data
                  });
                }}
                isLoading={addBidderPercentileMutation.isPending}
              />
              
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Total Bidders: <span className="font-bold">{bidders.length}</span>
                  </span>
                  <Button variant="outline" size="sm">
                    <List className="mr-1 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bidders List */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="text-purple-600 mr-2" />
                Recent Bidders ({bidders.length} Registered)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bidder Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {percentiles.slice(0, 5).map((percentile, index) => {
                      const bidder = bidders.find(b => b.id === percentile.bidderId);
                      const percentage = parseFloat(percentile.percentage as string);
                      
                      return (
                        <tr key={percentile.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs">
                              <p className="font-medium">{bidder?.name || percentile.bidderDetails.split('\n')[0]}</p>
                              <p className="text-gray-500 text-xs">{bidder?.address || percentile.bidderDetails.split('\n')[1]}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={percentage < 0 ? "destructive" : percentage > 0 ? "default" : "secondary"}
                            >
                              {percentage >= 0 ? '+' : ''}{percentage}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">Active</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900 mr-3">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {bidders.length > 5 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                            Show remaining {bidders.length - 5} bidders
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

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
      <footer className="gov-header py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex space-x-2">
                <Heart className="celebration-heart" />
                <Star className="celebration-star" />
                <Award className="text-orange-300" />
              </div>
              <div>
                <p className="text-sm font-medium">An Initiative By</p>
                <p className="text-lg font-bold">Mrs. Premlata Jain</p>
                <p className="text-sm text-blue-200">Additional Administrative Officer, PWD, Udaipur</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-blue-200">© 2024 Public Works Department, Udaipur</p>
              <p className="text-xs text-blue-300">Tender Management System v3.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

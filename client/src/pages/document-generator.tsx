import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/ui/file-upload";
import { DocumentPreview } from "@/components/ui/document-preview";
import { CelebrationBalloons } from "@/components/ui/celebration-balloons";
import { TenderData } from "@shared/schema";

export default function DocumentGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tenderData, setTenderData] = useState<TenderData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await apiRequest('POST', '/api/upload-excel', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setTenderData(data.data);
      toast({
        title: "File uploaded successfully!",
        description: "Excel file has been processed and data extracted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (tenderId: number) => {
      const response = await fetch(`/api/generate-documents/${tenderId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate documents');
      }
      
      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PWD_Documents_${tenderData?.nitNumber || 'Documents'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowCelebration(true);
      toast({
        title: "Documents generated successfully!",
        description: "Your complete document package is ready for download.",
      });
      
      setTimeout(() => setShowCelebration(false), 5000);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate documents",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    uploadMutation.mutate(file);
  };

  const handleGenerate = () => {
    if (tenderData) {
      generateMutation.mutate(tenderData.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CelebrationBalloons show={showCelebration} />
      
      {/* Header */}
      <header className="bg-[var(--govt-blue)] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">PWD Document Generator</h1>
              <p className="text-blue-200">Office of the Executive Engineer, Electric Division - Udaipur</p>
            </div>
            <div className="text-right">
              <div className="text-[var(--celebration-gold)] font-semibold">🏛️ Government of Rajasthan</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <Card className="mb-8 border-l-4 border-[var(--govt-blue)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Welcome to the Document Generation System</h2>
                <p className="text-gray-600">Generate Comparative Statement, Scrutiny Sheet, Work Order, and Acceptance Letter with a single click!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📁</span> Upload Excel File
            </h3>
            <FileUpload 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isUploading={uploadMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Generation Section */}
        {tenderData && (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate All Documents</h3>
              <p className="text-gray-600 mb-6">Click the button below to generate all four documents in both DOC and PDF formats</p>
              
              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="bg-gradient-to-r from-[var(--govt-blue)] to-blue-600 text-white px-12 py-4 text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Generate All Documents
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Document Previews */}
        {tenderData && (
          <DocumentPreview tenderData={tenderData} />
        )}

        {/* Credits Section */}
        <Card className="bg-gradient-to-r from-[var(--celebration-gold)] to-[var(--celebration-pink)] text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-3xl">🏆</div>
              <div>
                <h4 className="text-lg font-semibold">An Initiative By</h4>
                <p className="text-xl font-bold">Mrs. Premlata Jain</p>
                <p className="text-sm opacity-90">Additional Administrative Officer, PWD, Udaipur</p>
              </div>
              <div className="text-3xl">✨</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

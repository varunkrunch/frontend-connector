import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Link, 
  Youtube, 
  Globe, 
  Trash2, 
  Eye,
  Download,
  Plus
} from "lucide-react";
import { sourcesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Source } from "@/types";

interface SourcesPanelProps {
  notebookId: string;
}

export function SourcesPanel({ notebookId }: SourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSources();
  }, [notebookId]);

  const loadSources = async () => {
    try {
      setLoading(true);
      const data = await sourcesAPI.list(notebookId);
      setSources(data);
    } catch (error) {
      toast({
        title: "Error loading sources",
        description: "Failed to load sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileType = file.type.includes('pdf') ? 'pdf' : 'txt';
      await sourcesAPI.upload(notebookId, file, fileType);
      toast({
        title: "Source uploaded",
        description: `${file.name} has been added to your notebook.`,
      });
      loadSources();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) return;

    try {
      setLoading(true);
      let sourceType = 'website';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        sourceType = 'youtube';
      }
      
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      toast({
        title: "Processing URL",
        description: "Extracting content from the provided URL...",
      });
      setUrl("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'txt':
      case 'doc':
        return <FileText className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await sourcesAPI.delete(id);
      toast({
        title: "Source deleted",
        description: "The source has been removed from your notebook.",
      });
      loadSources();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Upload Section */}
      <div className="p-6 border-b border-border">
        <Card>
          <CardHeader>
            <CardTitle>Add Sources</CardTitle>
            <CardDescription>
              Upload documents or add links to build your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="url">Add URL</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={loading}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild disabled={loading}>
                      <span>Choose Files</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: PDF, TXT, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a URL (website, YouTube, etc.)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                  />
                  <Button onClick={handleUrlSubmit} disabled={loading || !url}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add websites, YouTube videos, or other online content
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1 p-6">
        <div className="grid gap-4">
          {sources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No sources yet</h3>
                <p className="text-muted-foreground">
                  Upload documents or add links to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            sources.map((source) => (
              <Card key={source.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getSourceIcon(source.source_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{source.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {source.source_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Added {new Date(source.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
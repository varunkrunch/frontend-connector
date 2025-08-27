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
  Plus,
  ChevronUp,
  ChevronDown
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
  const [showAddPanel, setShowAddPanel] = useState(false);
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
      {/* Minimized Add Sources Button - Always at top */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={() => setShowAddPanel(!showAddPanel)}
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Sources
          </span>
          {showAddPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Collapsible Upload Section */}
      {showAddPanel && (
        <div className="p-4 border-b border-border bg-muted/30">
          <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "url")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="file" className="text-xs">Upload File</TabsTrigger>
              <TabsTrigger value="url" className="text-xs">Add URL</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="mt-0">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label htmlFor="file-upload" className="flex-1">
                  <Button variant="secondary" className="w-full" asChild disabled={loading}>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, TXT, DOC, DOCX (Max 10MB)
              </p>
            </TabsContent>
            <TabsContent value="url" className="mt-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={loading || !url} size="sm">
                  Add
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Sources List - Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {sources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No sources yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload documents or add links to get started
              </p>
              <Button 
                onClick={() => setShowAddPanel(true)}
                variant="default"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Source
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <Card key={source.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          {getSourceIcon(source.source_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{source.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {source.source_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(source.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
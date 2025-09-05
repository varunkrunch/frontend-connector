import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Youtube, 
  Globe, 
  Trash2, 
  Plus,
  Search,
  Upload,
  Link,
  Download,
  ExternalLink,
  X,
  ChevronLeft
} from "lucide-react";
import { sourcesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Source } from "@/types";
import { cn } from "@/lib/utils";

interface SourcesPanelProps {
  notebookId: string;
}

export function SourcesPanel({ notebookId }: SourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
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
      if (selectedSource?.id === id) {
        setSelectedSource(null);
      }
      loadSources();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const fileType = files[0].name.split('.').pop() || 'txt';
      await sourcesAPI.upload(notebookId, files[0], fileType);
      toast({
        title: "File uploaded",
        description: "Your file has been added to the notebook.",
      });
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setLoading(true);
    try {
      const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      await sourcesAPI.upload(notebookId, new File([urlInput], 'url.txt'), isYoutube ? 'youtube' : 'website');
      toast({
        title: "URL added",
        description: "The URL has been added to your notebook.",
      });
      setUrlInput("");
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Failed to add URL",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Sources List - Mobile: Full width, Desktop: Sidebar */}
      <div className={cn(
        "flex flex-col border-b lg:border-b-0 lg:border-r bg-card/50",
        selectedSource ? "hidden lg:flex lg:w-80" : "flex w-full lg:w-80"
      )}>
        {/* Header with Search and Add Button */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              variant={showAddForm ? "secondary" : "default"}
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
              {showAddForm ? "Cancel" : "Add"}
            </Button>
          </div>

          {/* Add Source Form */}
          {showAddForm && (
            <Card>
              <CardContent className="p-4">
                <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "url")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                    <TabsTrigger value="url">Add URL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="mt-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Drop files here or click to browse
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.txt,.doc,.docx"
                        className="hidden"
                        id="file-upload"
                        disabled={loading}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={loading}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="url" className="mt-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter URL (website or YouTube)..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      />
                      <Button 
                        onClick={handleUrlSubmit}
                        className="w-full"
                        disabled={loading || !urlInput.trim()}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Add URL
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sources List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredSources.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No sources yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No sources match your search" : "Upload documents or add links to get started"}
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredSources.map((source) => (
                  <Card 
                    key={source.id} 
                    className={`hover:bg-accent/50 transition-colors cursor-pointer ${
                      selectedSource?.id === source.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedSource(source)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-1.5 bg-primary/10 rounded shrink-0">
                            {getSourceIcon(source.source_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-sm">{source.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-xs h-5">
                                {source.source_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(source.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSource(source.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Source Details - Right Side */}
      <div className={cn(
        "bg-muted/10",
        selectedSource ? "flex-1" : "hidden lg:flex lg:flex-1"
      )}>
        {selectedSource ? (
          <div className="h-full flex flex-col">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Mobile back button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSource(null)}
                    className="lg:hidden shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getSourceIcon(selectedSource.source_type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedSource.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{selectedSource.source_type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Added {new Date(selectedSource.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSource(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <div className="bg-card rounded-lg p-6 min-h-[400px]">
                  <p className="text-muted-foreground">
                    Content preview would appear here. This would show the actual content
                    from the PDF, website, or YouTube transcript.
                  </p>
                </div>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Original
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a source to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
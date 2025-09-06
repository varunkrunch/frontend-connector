import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronLeft,
  Play,
  Sparkles,
  FileIcon,
  Type
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
  const [showDiscoverForm, setShowDiscoverForm] = useState(false);
  const [sourceType, setSourceType] = useState<"link" | "upload" | "text">("link");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [transformation, setTransformation] = useState<string>("");
  const [transformationResult, setTransformationResult] = useState<string>("");
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

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setLoading(true);
    try {
      await sourcesAPI.upload(notebookId, new File([textInput], 'text.txt'), 'txt');
      toast({
        title: "Text added",
        description: "Your text has been added to the notebook.",
      });
      setTextInput("");
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Failed to add text",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverSubmit = async () => {
    if (!discoverQuery.trim()) return;

    setLoading(true);
    try {
      // Mock discovery - in real app this would call an API
      toast({
        title: "Discovering sources",
        description: `Finding sources related to: ${discoverQuery}`,
      });
      setDiscoverQuery("");
      setShowDiscoverForm(false);
    } catch (error) {
      toast({
        title: "Discovery failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransformation = async () => {
    if (!transformation) return;

    setLoading(true);
    try {
      // Mock transformation - in real app this would call an API
      setTransformationResult(`Applying "${transformation}" transformation...`);
      toast({
        title: "Transformation started",
        description: `Running ${transformation} on the source.`,
      });
    } catch (error) {
      toast({
        title: "Transformation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show source detail view when a source is selected
  if (selectedSource) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Source Header */}
        <div className="p-3 sm:p-4 border-b bg-muted/30">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSource(null)}
                className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                {getSourceIcon(selectedSource.source_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold truncate">{selectedSource.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">{selectedSource.source_type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedSource.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Transformation Dropdown */}
            <Select value={transformation} onValueChange={setTransformation}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Apply transformation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analyze">Analyze Paper</SelectItem>
                <SelectItem value="dense">Dense Summary</SelectItem>
                <SelectItem value="insights">Key Insights</SelectItem>
                <SelectItem value="reflections">Reflections</SelectItem>
                <SelectItem value="simple">Simple Summary</SelectItem>
                <SelectItem value="toc">Table of Contents</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="default"
              size="sm"
              onClick={handleTransformation}
              disabled={!transformation || loading}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
        
        {/* Source Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="bg-card rounded-lg p-4 sm:p-6 min-h-[400px]">
              {transformationResult ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base sm:text-lg">Transformation Result</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{transformationResult}</p>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground">
                  Content preview would appear here. This would show the actual content
                  from the PDF, website, or YouTube transcript.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
        
        {/* Source Actions */}
        <div className="p-3 sm:p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Open Original
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show add source form
  if (showAddForm) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Add Source Header */}
        <div className="p-4 sm:p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Add a Source</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add Source Form */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Source Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Type</Label>
                <RadioGroup value={sourceType} onValueChange={(v) => setSourceType(v as "link" | "upload" | "text")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="link" id="link" />
                    <Label htmlFor="link" className="font-normal cursor-pointer">Link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload" className="font-normal cursor-pointer">Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text" className="font-normal cursor-pointer">Text</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Content Input Based on Type */}
              {sourceType === "link" && (
                <div className="space-y-3">
                  <Label htmlFor="url-input" className="text-sm sm:text-base">Link</Label>
                  <Input
                    id="url-input"
                    placeholder="Enter URL (website or YouTube)..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    className="text-sm sm:text-base"
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
              )}

              {sourceType === "upload" && (
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base">File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center">
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
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
                      className="text-xs sm:text-sm"
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
              )}

              {sourceType === "text" && (
                <div className="space-y-3">
                  <Label htmlFor="text-input" className="text-sm sm:text-base">Text Content</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter or paste your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[200px] text-sm sm:text-base"
                  />
                  <Button 
                    onClick={handleTextSubmit}
                    className="w-full"
                    disabled={loading || !textInput.trim()}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Add Text
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Show discover form
  if (showDiscoverForm) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Discover Header */}
        <div className="p-4 sm:p-6 border-b bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Discover sources</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDiscoverForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Discover Form */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
              <div className="text-center py-6 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">What are you interested in?</h3>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Describe something that you'd like to learn about or click 'I'm feeling curious' to explore a new topic."
                  value={discoverQuery}
                  onChange={(e) => setDiscoverQuery(e.target.value)}
                  className="min-h-[150px] text-sm sm:text-base resize-none"
                />
                
                {!discoverQuery && (
                  <p className="text-xs sm:text-sm text-destructive">Please fill out this field.</p>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleDiscoverSubmit}
                    className="flex-1"
                    disabled={loading || !discoverQuery.trim()}
                  >
                    Discover Sources
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setDiscoverQuery("I'm feeling curious")}
                    className="flex-1"
                  >
                    I'm feeling curious
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Default sources list view
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-semibold">Sources</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(true)}
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add
            </Button>
            <Button 
              onClick={() => setShowDiscoverForm(true)}
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              Discover
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {filteredSources.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No sources yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {searchQuery ? "No sources match your search" : "Upload documents or add links to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredSources.map((source) => (
                <Card 
                  key={source.id} 
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSource(source)}
                >
                  <CardContent className="p-2.5 sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="p-1 sm:p-1.5 bg-primary/10 rounded shrink-0">
                          {getSourceIcon(source.source_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate text-xs sm:text-sm">{source.title}</h4>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {new Date(source.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSource(source.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
  );
}
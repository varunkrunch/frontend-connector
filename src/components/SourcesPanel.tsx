import { useState, useEffect, useCallback } from "react";
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
  Type,
  Edit,
  Check,
  MoreVertical,
  Loader2
} from "lucide-react";
import { sourcesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Source } from "@/types";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface SourcesPanelProps {
  notebookId: string;
  notebookName: string;
}

export function SourcesPanel({ notebookId, notebookName }: SourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingSource, setAddingSource] = useState(false);
  
  // Debug addingSource state changes
  useEffect(() => {
    console.log("🔄 addingSource state changed:", addingSource);
  }, [addingSource]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDiscoverForm, setShowDiscoverForm] = useState(false);
  
  // Debug state changes
  useEffect(() => {
    console.log("showAddForm changed:", showAddForm);
  }, [showAddForm]);
  
  useEffect(() => {
    console.log("showDiscoverForm changed:", showDiscoverForm);
  }, [showDiscoverForm]);
  const [sourceType, setSourceType] = useState<"link" | "upload" | "text">("link");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [transformation, setTransformation] = useState<string>("");
  const [transformationResult, setTransformationResult] = useState<string>("");
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [editingSourceTitle, setEditingSourceTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSources = useCallback(async () => {
    try {
      console.log("🔍 SourcesPanel: loadSources called with notebookName:", notebookName);
      setLoading(true);
      const data = await sourcesAPI.listByNotebookName(notebookName);
      console.log("📊 SourcesPanel: Received data:", data);
      console.log("📊 SourcesPanel: Data type:", typeof data, "Array?", Array.isArray(data));
      setSources(data);
      console.log("✅ SourcesPanel: Sources state updated with", data?.length || 0, "sources");
    } catch (error) {
      console.error("❌ SourcesPanel: Error loading sources:", error);
      toast({
        title: "Error loading sources",
        description: "Failed to load sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, [notebookId, notebookName]);

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

    console.log("🚀 Starting file upload, setting addingSource to true");
    setAddingSource(true);
    try {
      const fileType = files[0].name.split('.').pop() || 'txt';
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('type', fileType);
      await sourcesAPI.createByNotebookName(notebookName, formData);
      toast({
        title: "File uploaded",
        description: "Your file has been added to the notebook.",
      });
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ File upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("✅ File upload completed, setting addingSource to false");
      setAddingSource(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    console.log("🚀 Starting URL submit, setting addingSource to true");
    setAddingSource(true);
    try {
      const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const formData = new FormData();
      formData.append('content', urlInput);
      formData.append('type', isYoutube ? 'youtube' : 'website');
      await sourcesAPI.createByNotebookName(notebookName, formData);
      toast({
        title: "URL added",
        description: "The URL has been added to your notebook.",
      });
      setUrlInput("");
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ URL submit failed:", error);
      toast({
        title: "Failed to add URL",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      console.log("✅ URL submit completed, setting addingSource to false");
      setAddingSource(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    console.log("🚀 Starting text submit, setting addingSource to true");
    setAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('content', textInput);
      formData.append('type', 'txt');
      await sourcesAPI.createByNotebookName(notebookName, formData);
      toast({
        title: "Text added",
        description: "Your text has been added to the notebook.",
      });
      setTextInput("");
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ Text submit failed:", error);
      toast({
        title: "Failed to add text",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("✅ Text submit completed, setting addingSource to false");
      setAddingSource(false);
    }
  };

  const handleDiscoverSubmit = async () => {
    if (!discoverQuery.trim()) return;

    setAddingSource(true);
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
      setAddingSource(false);
    }
  };

  const handleTransformation = async () => {
    if (!transformation || !selectedSource) return;

    setLoading(true);
    try {
      console.log("🔍 SourcesPanel: Running transformation:", transformation, "on source:", selectedSource.title);
      
      // Call the real transformation API
      const result = await sourcesAPI.runTransformationsByTitle(selectedSource.title, transformation);
      
      console.log("✅ SourcesPanel: Transformation result:", result);
      
      // Extract the actual AI-generated content from the results
      let aiContent = `Successfully applied "${transformation}" transformation. Applied: ${result.total_applied}, Failed: ${result.total_failed}`;
      
      if (result.results && result.results.length > 0) {
        const firstResult = result.results[0];
        if (firstResult.success && firstResult.output) {
          aiContent = firstResult.output;
        }
      }
      
      setTransformationResult(aiContent);
      
      toast({
        title: "Transformation completed",
        description: `Applied ${transformation} transformation successfully.`,
      });
      
      // Reload sources to get updated insights
      await loadSources();
      
    } catch (error) {
      console.error("❌ SourcesPanel: Transformation error:", error);
      setTransformationResult(`Failed to apply "${transformation}" transformation: ${error.message}`);
      
      toast({
        title: "Transformation failed",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenameSource = async () => {
    if (!editingSourceTitle.trim() || !editingSourceId) return;
    
    // Find the source being edited
    const sourceToEdit = sources.find(s => s.id === editingSourceId);
    if (!sourceToEdit) return;
    
    try {
      // Use the source ID for update if title is empty, otherwise use title
      if (sourceToEdit.title && sourceToEdit.title.trim()) {
        await sourcesAPI.updateByTitle(sourceToEdit.title, { title: editingSourceTitle.trim() });
      } else {
        await sourcesAPI.update(sourceToEdit.id, { title: editingSourceTitle.trim() });
      }
      toast({
        title: "Source renamed",
        description: `Source renamed to "${editingSourceTitle.trim()}".`,
      });
      setEditingSourceTitle("");
      setEditingSourceId(null);
      await loadSources(); // Reload to get updated data
    } catch (error) {
      console.error("❌ SourcesPanel: Error renaming source:", error);
      toast({
        title: "Rename failed",
        description: "Failed to rename source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async () => {
    if (!selectedSource) return;
    
    try {
      // Use the source ID for delete if title is empty, otherwise use title
      if (selectedSource.title && selectedSource.title.trim()) {
        await sourcesAPI.deleteByTitle(selectedSource.title);
      } else {
        await sourcesAPI.delete(selectedSource.id);
      }
      toast({
        title: "Source deleted",
        description: `Source "${selectedSource.title || 'Untitled'}" has been deleted.`,
      });
      setSelectedSource(null);
      setTransformationResult("");
      setShowDeleteConfirm(false);
      await loadSources(); // Reload to get updated data
    } catch (error) {
      console.error("❌ SourcesPanel: Error deleting source:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditingSource = (source?: Source) => {
    const sourceToEdit = source || selectedSource;
    if (sourceToEdit) {
      setSelectedSource(sourceToEdit);
      setEditingSourceTitle(sourceToEdit.title);
      setIsEditingSource(true);
    }
  };

  const cancelEditingSource = () => {
    setIsEditingSource(false);
    setEditingSourceTitle("");
  };

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    setTransformationResult(""); // Clear previous results
    
    // Load existing insights/transformations for this source
    if (source.insights && source.insights.length > 0) {
      // Display the most recent insight
      const latestInsight = source.insights[source.insights.length - 1];
      if (latestInsight.content) {
        setTransformationResult(latestInsight.content);
      }
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Debug logging
  console.log("🔍 SourcesPanel: sources state:", sources);
  console.log("🔍 SourcesPanel: sources length:", sources.length);
  console.log("🔍 SourcesPanel: filteredSources:", filteredSources);
  console.log("🔍 SourcesPanel: filteredSources length:", filteredSources.length);
  console.log("🔍 SourcesPanel: searchQuery:", searchQuery);
  console.log("🔍 SourcesPanel: Will render sources?", filteredSources.length > 0);
  console.log("🔍 SourcesPanel: Will show empty state?", filteredSources.length === 0);

  // Loading overlay component
  const LoadingOverlay = () => {
    console.log("🎯 LoadingOverlay rendered, addingSource:", addingSource);
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">Adding Source</h3>
            <p className="text-muted-foreground text-sm">Please wait while we process your source...</p>
          </div>
        </div>
      </div>
    );
  };

  // Show source detail view when a source is selected
  if (selectedSource) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
        {/* Source Header */}
        <div className="sticky top-0 z-10 p-3 sm:p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex flex-col sm:flex-row gap-3">
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
                {getSourceIcon(selectedSource.type)}
              </div>
                <div className="flex-1 min-w-0">
                 {isEditingSource ? (
                   <div className="flex items-center gap-2">
                     <Input
                       value={editingSourceTitle}
                       onChange={(e) => setEditingSourceTitle(e.target.value)}
                       className="text-sm sm:text-base lg:text-lg font-semibold h-8"
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') handleRenameSource();
                         if (e.key === 'Escape') cancelEditingSource();
                       }}
                       autoFocus
                     />
                     <Button size="sm" onClick={handleRenameSource} className="h-8 px-2">
                       <Check className="h-3 w-3" />
                     </Button>
                     <Button size="sm" variant="outline" onClick={cancelEditingSource} className="h-8 px-2">
                       <X className="h-3 w-3" />
                     </Button>
                   </div>
                 ) : (
                   <div className="flex items-center justify-between">
                     <h2 className="text-sm sm:text-base lg:text-lg font-semibold truncate">{selectedSource.title}</h2>
                     <div className="flex items-center gap-1 ml-2">
                       <Button size="sm" variant="ghost" onClick={startEditingSource} className="h-6 w-6 p-0">
                         <Edit className="h-3 w-3" />
                       </Button>
                       <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     </div>
                   </div>
                 )}
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">{selectedSource.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedSource.created || selectedSource.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Transformation Controls */}
            <div className="flex items-center gap-2">
              <Select value={transformation} onValueChange={setTransformation}>
                <SelectTrigger className="flex-1 sm:w-[140px] lg:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Apply transformation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Analyze Paper">Analyze Paper</SelectItem>
                  <SelectItem value="Dense Summary">Dense Summary</SelectItem>
                  <SelectItem value="Key Insights">Key Insights</SelectItem>
                  <SelectItem value="Reflections">Reflections</SelectItem>
                  <SelectItem value="Simple Summary">Simple Summary</SelectItem>
                  <SelectItem value="Table of Contents">Table of Contents</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="sm"
                onClick={handleTransformation}
                disabled={!transformation || loading}
                className="h-8 sm:h-9 px-3 text-xs sm:text-sm"
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Run
              </Button>
            </div>
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
      </>
    );
  }

  // Show add source form
  if (showAddForm) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
        {/* Add Source Header */}
        <div className="p-4 sm:p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Add a Source</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!addingSource) {
                  setShowAddForm(false);
                  setUrlInput("");
                  setTextInput("");
                }
              }}
              disabled={addingSource}
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
                <RadioGroup 
                  value={sourceType} 
                  onValueChange={(v) => !addingSource && setSourceType(v as "link" | "upload" | "text")}
                  disabled={addingSource}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="link" id="link" disabled={addingSource} />
                    <Label htmlFor="link" className="font-normal cursor-pointer">Link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" disabled={addingSource} />
                    <Label htmlFor="upload" className="font-normal cursor-pointer">Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" disabled={addingSource} />
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
                    onKeyPress={(e) => e.key === 'Enter' && !addingSource && handleUrlSubmit()}
                    className="text-sm sm:text-base"
                    disabled={addingSource}
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    className="w-full"
                    disabled={addingSource || !urlInput.trim()}
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
                      disabled={addingSource}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={addingSource}
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
                    disabled={addingSource}
                  />
                  <Button 
                    onClick={handleTextSubmit}
                    className="w-full"
                    disabled={addingSource || !textInput.trim()}
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
      </>
    );
  }

  // Show discover form
  if (showDiscoverForm) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
        {/* Discover Header */}
        <div className="p-4 sm:p-6 border-b bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Discover sources</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!addingSource) {
                  setShowDiscoverForm(false);
                  setDiscoverQuery("");
                }
              }}
              disabled={addingSource}
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
                  disabled={addingSource}
                />
                
                {!discoverQuery && (
                  <p className="text-xs sm:text-sm text-destructive">Please fill out this field.</p>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleDiscoverSubmit}
                    className="flex-1"
                    disabled={addingSource || !discoverQuery.trim()}
                  >
                    Discover Sources
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setDiscoverQuery("I'm feeling curious")}
                    className="flex-1"
                    disabled={addingSource}
                  >
                    I'm feeling curious
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
      </>
    );
  }

  // Default sources list view
  return (
    <>
      {addingSource && <LoadingOverlay />}
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
                    className="group hover:bg-accent/50 transition-colors cursor-pointer h-12 flex items-center overflow-hidden w-full max-w-full"
                    onClick={() => handleSourceSelect(source)}
                  >
                  <CardContent className="p-2 h-full flex items-center w-full max-w-full overflow-hidden">
                    <div className="flex items-center justify-between gap-2 w-full max-w-full overflow-hidden">
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden" style={{maxWidth: 'calc(100% - 80px)'}}>
                        <span className="text-sm flex-shrink-0">{getSourceIcon(source.type)}</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                           {editingSourceId === source.id ? (
                             <Input
                               value={editingSourceTitle}
                               onChange={(e) => setEditingSourceTitle(e.target.value)}
                               className="text-xs sm:text-sm font-medium h-6 flex-1"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   handleRenameSource();
                                 }
                                 if (e.key === 'Escape') {
                                   setEditingSourceId(null);
                                   setEditingSourceTitle("");
                                 }
                               }}
                               autoFocus
                             />
                           ) : (
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <h4 className="font-medium truncate text-xs sm:text-sm">
                                  {source.title}
                                </h4>
                              </div>
                           )}
                           <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem 
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedSource(source);
                               setEditingSourceTitle(source.title);
                               setEditingSourceId(source.id);
                               // Focus the input after state update
                               setTimeout(() => {
                                 const input = document.querySelector('input[autofocus]') as HTMLInputElement;
                                 if (input) {
                                   input.focus();
                                   input.select();
                                 }
                               }, 10);
                             }}
                           >
                             <Edit className="h-4 w-4 mr-2" />
                             Rename source
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             className="text-destructive"
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedSource(source);
                               setShowDeleteConfirm(true);
                             }}
                           >
                             <Trash2 className="h-4 w-4 mr-2" />
                             Remove source
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                        </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
    
    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && selectedSource && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-2">Delete Source</h3>
          <p className="text-muted-foreground mb-4">
            Are you sure you want to delete "{selectedSource.title}"? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSource}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
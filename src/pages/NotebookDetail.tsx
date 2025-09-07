import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Download, Trash2, Minimize2, AudioLines, Video, Network, FileBarChart, Plus, FileText, ChevronLeft, Menu, X, Upload, Link, Type, Sparkles, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notebookAPI } from "@/services/api";
import type { Notebook } from "@/types";
import { ChatPanel } from "@/components/ChatPanel";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { sourcesAPI, notesAPI, podcastsAPI } from "@/services/api";
import type { Source, Note, Podcast } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotebookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [notebook, setNotebook] = useState<Notebook | null>(location.state?.notebook || null);
  const [loading, setLoading] = useState(!notebook);
  
  // Panel states
  const [isSourceExpanded, setIsSourceExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [sources, setSources] = useState<Source[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastPrompt, setPodcastPrompt] = useState("");
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [podcastSettings, setPodcastSettings] = useState({
    episodeName: "",
    template: "Deep Dive - get into it",
    length: "Short (5-10 min)",
    maxChunks: 5,
    minChunkSize: 3
  });
  
  // Add/Discover form states
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [showDiscoverForm, setShowDiscoverForm] = useState(false);
  const [sourceType, setSourceType] = useState<"link" | "upload" | "text">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [selectedTransformation, setSelectedTransformation] = useState("");
  const [transformationResults, setTransformationResults] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("NotebookDetail useEffect - notebook:", notebook, "id:", id);
    if (!notebook && id) {
      console.log("Loading notebook...");
      loadNotebook();
    } else if (id) {
      console.log("Loading data...");
      loadData();
    }
  }, [id, notebook]);

  const loadNotebook = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await notebookAPI.get(id);
      setNotebook(data);
      loadData();
    } catch (error) {
      toast({
        title: "Error loading notebook",
        description: "Failed to load notebook details.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!id) return;
    
    try {
      console.log("Loading data for notebook:", id);
      const [sourcesData, notesData, podcastsData] = await Promise.all([
        sourcesAPI.list(id),
        notesAPI.list(id),
        podcastsAPI.list(id),
      ]);
      console.log("Loaded data:", { sources: sourcesData, notes: notesData, podcasts: podcastsData });
      setSources(sourcesData);
      setNotes(notesData);
      setPodcasts(podcastsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    setShowAddSourceForm(false); // Hide add form
    setShowDiscoverForm(false); // Hide discover form
    setIsSourceExpanded(true);
  };
  
  const handleAddSourceClick = () => {
    setSelectedSource(null); // Clear any selected source
    setShowDiscoverForm(false); // Hide discover form
    setShowAddSourceForm(true);
    setIsSourceExpanded(true); // Trigger panel expansion
  };
  
  const handleDiscoverClick = () => {
    setSelectedSource(null); // Clear any selected source
    setShowAddSourceForm(false); // Hide add form
    setShowDiscoverForm(true);
    setIsSourceExpanded(true); // Trigger panel expansion
  };

  const handleCloseSourceView = () => {
    setIsSourceExpanded(false);
    setSelectedSource(null);
    setShowAddSourceForm(false);
    setShowDiscoverForm(false);
    setUrlInput("");
    setTextInput("");
    setDiscoverQuery("");
    setSelectedTransformation("");
    setTransformationResults({});
  };

  const handleTransformationRun = async () => {
    if (!selectedTransformation || !selectedSource) return;
    
    try {
      toast({
        title: "Processing transformation",
        description: `Applying ${selectedTransformation} to source...`,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result based on transformation type
      const mockResults = {
        "Analyze Paper": "This paper provides a comprehensive overview of neural networks, covering fundamental concepts including perceptrons, backpropagation, and deep learning architectures. The content is well-structured and suitable for intermediate learners.",
        "Dense Summary": "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information through weighted connections. Key concepts include activation functions, backpropagation for learning, and various architectures like feedforward and recurrent networks.",
        "Key Insights": "• Neural networks mimic biological brain structure\n• Activation functions determine neuron output\n• Backpropagation enables learning from data\n• Different architectures serve different purposes\n• Deep learning extends traditional neural networks",
        "Reflections": "This source provides a solid foundation for understanding neural networks. The content is accessible yet comprehensive, making it valuable for both beginners and those seeking to reinforce their knowledge. The practical examples help illustrate theoretical concepts.",
        "Simple Summary": "Neural networks are computer systems that work like the human brain. They learn from data to make predictions and decisions.",
        "Table of Contents": "1. Introduction to Neural Networks\n2. Biological Inspiration\n3. Basic Components\n4. Learning Process\n5. Network Architectures\n6. Applications\n7. Future Directions"
      };
      
      const result = mockResults[selectedTransformation as keyof typeof mockResults] || "Transformation completed successfully.";
      setTransformationResults(prev => ({
        ...prev,
        [selectedTransformation]: result
      }));
      
      toast({
        title: "Transformation complete",
        description: `${selectedTransformation} has been applied successfully.`,
      });
    } catch (error) {
      toast({
        title: "Transformation failed",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsNote = async (transformation: string, content: string) => {
    if (!id) return;
    
    try {
      const noteTitle = `${transformation} - ${selectedSource?.title || 'Source'}`;
      
      await notesAPI.create({
        notebook_id: id,
        title: noteTitle,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Note saved",
        description: `${transformation} result has been saved as a note.`,
      });
      
      // Reload notes to show the new note in Studio panel
      loadData();
    } catch (error) {
      toast({
        title: "Failed to save note",
        description: "Could not save the transformation result as a note.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNote = async () => {
    if (!id || !noteTitle?.trim() || !noteContent?.trim()) return;

    try {
      if (expandedNoteId) {
        await notesAPI.update(expandedNoteId, {
          title: noteTitle,
          content: noteContent,
        });
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully.",
        });
      } else {
        await notesAPI.create({
          notebook_id: id,
          title: noteTitle,
          content: noteContent,
        });
        toast({
          title: "Note created",
          description: "Your note has been created successfully.",
        });
      }
      setIsCreatingNote(false);
      setExpandedNoteId(null);
      setNoteTitle("");
      setNoteContent("");
      loadData();
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Failed to save note.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;
    
    try {
      await notesAPI.delete(noteId);
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error deleting note",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = (note: Note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setExpandedNoteId(note.id);
    setIsCreatingNote(true);
  };

  const handleGeneratePodcast = async () => {
    if (!id || !podcastPrompt?.trim()) return;
    
    setIsGeneratingPodcast(true);
    try {
      await podcastsAPI.generate({
        notebook_id: id,
        prompt: podcastPrompt,
      });
      toast({
        title: "Podcast generation started",
        description: "Your podcast is being generated. This may take a few minutes.",
      });
      setPodcastPrompt("");
      // Poll for updates
      const pollInterval = setInterval(async () => {
        const updatedPodcasts = await podcastsAPI.list(id);
        setPodcasts(updatedPodcasts);
        const generatingPodcast = updatedPodcasts.find(p => p.status === 'generating');
        if (!generatingPodcast) {
          clearInterval(pollInterval);
          setIsGeneratingPodcast(false);
        }
      }, 3000);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate podcast.",
        variant: "destructive",
      });
      setIsGeneratingPodcast(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your notebook is being exported...",
    });
  };

  const handleDelete = async () => {
    if (!notebook) return;
    
    try {
      await notebookAPI.delete(notebook.id);
      toast({
        title: "Notebook deleted",
        description: "The notebook has been deleted successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete notebook.",
        variant: "destructive",
      });
    }
  };

  // Add Source handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileType = files[0].name.split('.').pop() || 'txt';
      await sourcesAPI.upload(id!, files[0], fileType);
      toast({
        title: "File uploaded",
        description: "Your file has been added to the notebook.",
      });
      loadData();
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    try {
      const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      await sourcesAPI.upload(id!, new File([urlInput], 'url.txt'), isYoutube ? 'youtube' : 'website');
      toast({
        title: "URL added",
        description: "The URL has been added to your notebook.",
      });
      setUrlInput("");
      loadData();
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Failed to add URL",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    try {
      await sourcesAPI.upload(id!, new File([textInput], 'text.txt'), 'txt');
      toast({
        title: "Text added",
        description: "Your text has been added to the notebook.",
      });
      setTextInput("");
      loadData();
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Failed to add text",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDiscoverSubmit = async () => {
    if (!discoverQuery.trim()) return;

    try {
      toast({
        title: "Discovering sources",
        description: `Finding sources related to: ${discoverQuery}`,
      });
      setDiscoverQuery("");
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Discovery failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "url":
        return "🔗";
      case "text":
        return "📝";
      default:
        return "📎";
    }
  };

  if (loading) {
    console.log("NotebookDetail - Loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!notebook) {
    console.log("NotebookDetail - No notebook found");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Notebook not found</h2>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notebooks
        </Button>
      </div>
    );
  }

  console.log("NotebookDetail - Rendering with notebook:", notebook, "sources:", sources, "notes:", notes, "podcasts:", podcasts);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate">{notebook.name}</h1>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="text-xs lg:text-sm"
              >
                <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Export</span>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                className="text-xs lg:text-sm"
              >
                <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Delete</span>
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="sm:hidden shrink-0">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h2 className="text-lg font-semibold">Actions</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => {
                        handleExport();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="justify-start gap-3"
                      onClick={() => {
                        handleDelete();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs Navigation */}
      <div className="sm:hidden border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="studio">Studio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Three Panel Layout */}
      <div className="hidden sm:flex h-[calc(100vh-65px)] gap-3 lg:gap-6 p-3 lg:p-6 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Left Panel - Sources */}
        <div className={cn(
          "bg-card border border-border/50 transition-all duration-300 flex flex-col rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm",
          isSourceExpanded && (isCreatingNote || showPodcastForm) ? "flex-1" : isSourceExpanded ? "w-[500px] lg:w-[600px]" : "w-80 lg:w-96"
        )}>
          {!isSourceExpanded && (
          <div className="p-3 lg:p-4 border-b">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-base lg:text-lg font-semibold">Sources</h2>
              <div className="flex gap-1 lg:gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleAddSourceClick}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button 
                  size="sm" 
                    variant="outline"
                    onClick={handleDiscoverClick}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Discover
                </Button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search sources..."
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          )}


          {!isSourceExpanded ? (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                  {sources.length > 0 ? (
                    sources.map((source) => (
                  <Card
                    key={source.id}
                    className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSourceSelect(source)}
                  >
                        <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getSourceIcon(source.source_type)}</span>
                              <p className="font-medium text-sm truncate">{source.title}</p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {source.content || "No content available"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                          {new Date(source.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground mb-4">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">No sources added yet</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddSourceClick}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Source
                      </Button>
                    </div>
                  )}
              </div>
            </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCloseSourceView}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">
                    {showAddSourceForm ? "Add a Source" : 
                     showDiscoverForm ? "Discover sources" : 
                     selectedSource?.title || "Source Details"}
                  </h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCloseSourceView}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* Show Add Source Form */}
                  {showAddSourceForm && (
                    <div className="space-y-6">
                      {/* Source Type Tabs */}
                      <div className="flex space-x-1 bg-muted p-1 rounded-xl">
                        <button
                          onClick={() => setSourceType("upload")}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                            sourceType === "upload"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          onClick={() => setSourceType("link")}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                            sourceType === "link"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Add URL
                        </button>
                        <button
                          onClick={() => setSourceType("text")}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                            sourceType === "text"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Text
                        </button>
                      </div>

                      {sourceType === "upload" && (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.txt,.doc,.docx"
                                className="hidden"
                                id="file-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="lg"
                                onClick={() => document.getElementById('file-upload')?.click()}
                                className="px-6"
                              >
                                Choose Files
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {sourceType === "link" && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label htmlFor="url-input" className="text-sm font-medium">URL</Label>
                            <Input
                              id="url-input"
                              placeholder="Enter URL (website or YouTube)..."
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                              className="h-12"
                            />
                            <Button 
                              onClick={handleUrlSubmit}
                              className="w-full h-12"
                              disabled={!urlInput.trim()}
                            >
                              <Link className="h-4 w-4 mr-2" />
                              Add URL
                            </Button>
                          </div>
                        </div>
                      )}

                      {sourceType === "text" && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label htmlFor="text-input" className="text-sm font-medium">Text Content</Label>
                            <Textarea
                              id="text-input"
                              placeholder="Enter or paste your text here..."
                              value={textInput}
                              onChange={(e) => setTextInput(e.target.value)}
                              className="min-h-[200px] resize-none"
                            />
                            <Button 
                              onClick={handleTextSubmit}
                              className="w-full h-12"
                              disabled={!textInput.trim()}
                            >
                              <Type className="h-4 w-4 mr-2" />
                              Add Text
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show Discover Form */}
                  {showDiscoverForm && (
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">What are you interested in?</h4>
                      </div>

                      <div className="space-y-4">
                        <Textarea
                          placeholder="Describe something that you'd like to learn about or click 'I'm feeling curious' to explore a new topic."
                          value={discoverQuery}
                          onChange={(e) => setDiscoverQuery(e.target.value)}
                          className="min-h-[120px] resize-none"
                        />
                        
                        {!discoverQuery && (
                          <p className="text-xs text-destructive">Please fill out this field.</p>
                        )}

                        <div className="flex gap-3">
                          <Button 
                            onClick={handleDiscoverSubmit}
                            className="flex-1"
                            disabled={!discoverQuery.trim()}
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
                  )}

                  {/* Show Source Content */}
                  {selectedSource && !showAddSourceForm && !showDiscoverForm && (
                    <div className="h-full flex flex-col">
                      {/* Transformation Controls */}
                      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg -mt-4 -ml-2 mb-4">
                        <Select value={selectedTransformation} onValueChange={setSelectedTransformation}>
                          <SelectTrigger className="w-[200px]">
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
                          onClick={handleTransformationRun}
                          disabled={!selectedTransformation}
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                      </div>

                      {/* Scrollable Content Area */}
                      <ScrollArea className="flex-1 pr-2">
                        <div className="space-y-4">
                          {/* Show all results in collapsible format */}
                          {Object.entries(transformationResults).map(([transformation, result]) => (
                            <div key={transformation} className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                              <details className="group">
                                <summary className="font-semibold text-sm text-primary cursor-pointer list-none flex items-center justify-between">
                                  <span>{transformation} Result</span>
                                  <span className="group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-2 pt-2 border-t border-primary/20">
                                  <p className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto mb-3">
                                    {result}
                                  </p>
                                  <Button 
                                    onClick={() => handleSaveAsNote(transformation, result)}
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Save as Note
                                  </Button>
                                </div>
                              </details>
                            </div>
                          ))}

                          {/* Original Source Content */}
                          <div className="p-3 bg-muted/20 rounded-xl">
                            <details className="group">
                              <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                                <span>Original Content</span>
                                <span className="group-open:rotate-180 transition-transform">▼</span>
                              </summary>
                              <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                                <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    {selectedSource?.content || "No content available"}
                  </p>
                              </div>
                            </details>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Middle Panel - Chat */}
        {!(isSourceExpanded && (isCreatingNote || showPodcastForm)) && (
        <div className="flex-1 bg-card border border-border/50 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm">
            <ChatPanel notebookId={notebook.id} onNoteSaved={loadData} />
        </div>
        )}

        {/* Right Panel - Studio */}
        <div className={cn(
          "bg-card border border-border/50 transition-all duration-300 flex flex-col rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm",
          isSourceExpanded && (isCreatingNote || showPodcastForm) ? "flex-1" : (isCreatingNote || showPodcastForm) ? "w-[600px]" : "w-96"
        )}>
          {!isCreatingNote && !showPodcastForm ? (
            <>
              {/* Studio Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold mb-4">Studio</h2>
                
                {/* Generate Podcast Button */}
                <Button 
                  className="w-full mb-4 bg-primary hover:bg-primary/90"
                  onClick={() => setShowPodcastForm(true)}
                  disabled={isGeneratingPodcast}
                >
                  <AudioLines className="h-4 w-4 mr-2" />
                  {isGeneratingPodcast ? "Generating Podcast..." : "Generate Podcast"}
                </Button>

                {/* Create Note Button */}
                <Button 
                  className="w-full mb-4"
                  onClick={() => setIsCreatingNote(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add note
                </Button>
              </div>

              {/* Notes and Podcasts List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Recent Notes */}
                  {notes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Recent Notes</h3>
                      <div className="space-y-2">
                        {notes.slice(0, 3).map((note) => (
                          <Card
                            key={note.id}
                            className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleEditNote(note)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{note.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {note.content}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Podcasts */}
                  {podcasts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Generated Podcasts</h3>
                      <div className="space-y-2">
                        {podcasts.map((podcast) => (
                          <Card key={podcast.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{podcast.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {podcast.duration} • {new Date(podcast.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <AudioLines className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : showPodcastForm ? (
            /* Podcast Generation Form */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Audio Overview - Podcast Generation</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPodcastForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a podcast episode from your notebook: <span className="font-semibold">{notebook.name}</span>
                    </p>
                  </div>

                  {/* Episode Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Episode Name *</label>
                    <input
                      type="text"
                      placeholder="Enter episode name..."
                      className="w-full px-3 py-2 rounded-lg border bg-background/50"
                      value={podcastSettings.episodeName}
                      onChange={(e) => setPodcastSettings({...podcastSettings, episodeName: e.target.value})}
                    />
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Template</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border bg-background/50"
                      value={podcastSettings.template}
                      onChange={(e) => setPodcastSettings({...podcastSettings, template: e.target.value})}
                    >
                      <option value="Deep Dive - get into it">Deep Dive - get into it</option>
                      <option value="Quick Summary">Quick Summary</option>
                      <option value="Educational">Educational</option>
                      <option value="Conversational">Conversational</option>
                    </select>
                  </div>

                  {/* Podcast Length */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Podcast Length</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border bg-background/50"
                      value={podcastSettings.length}
                      onChange={(e) => setPodcastSettings({...podcastSettings, length: e.target.value})}
                    >
                      <option value="Short (5-10 min)">Short (5-10 min)</option>
                      <option value="Medium (10-20 min)">Medium (10-20 min)</option>
                      <option value="Long (20-30 min)">Long (20-30 min)</option>
                    </select>
                  </div>

                  {/* Max Number of Chunks */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Number of Chunks</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={podcastSettings.maxChunks}
                        onChange={(e) => setPodcastSettings({...podcastSettings, maxChunks: parseInt(e.target.value)})}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>{podcastSettings.maxChunks}</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Min Chunk Size */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Chunk Size</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={podcastSettings.minChunkSize}
                        onChange={(e) => setPodcastSettings({...podcastSettings, minChunkSize: parseInt(e.target.value)})}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>{podcastSettings.minChunkSize}</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button Placeholder */}
                  <div className="flex justify-center py-6">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <AudioLines className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      if (!podcastSettings.episodeName?.trim()) {
                        toast({
                          title: "Episode name required",
                          description: "Please enter an episode name.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setIsGeneratingPodcast(true);
                      try {
                        await podcastsAPI.generate({
                          notebook_id: id!,
                          prompt: `Episode: ${podcastSettings.episodeName}, Template: ${podcastSettings.template}, Length: ${podcastSettings.length}`,
                        });
                        toast({
                          title: "Podcast generation started",
                          description: "Your podcast is being generated. This may take a few minutes.",
                        });
                        setShowPodcastForm(false);
                        setPodcastSettings({
                          episodeName: "",
                          template: "Deep Dive - get into it",
                          length: "Short (5-10 min)",
                          maxChunks: 5,
                          minChunkSize: 3
                        });
                        // Poll for updates
                        const pollInterval = setInterval(async () => {
                          const updatedPodcasts = await podcastsAPI.list(id!);
                          setPodcasts(updatedPodcasts);
                          const generatingPodcast = updatedPodcasts.find(p => p.status === 'generating');
                          if (!generatingPodcast) {
                            clearInterval(pollInterval);
                            setIsGeneratingPodcast(false);
                          }
                        }, 3000);
                      } catch (error) {
                        toast({
                          title: "Generation failed",
                          description: "Failed to generate podcast.",
                          variant: "destructive",
                        });
                        setIsGeneratingPodcast(false);
                      }
                    }}
                    disabled={isGeneratingPodcast || !podcastSettings.episodeName?.trim()}
                  >
                    {isGeneratingPodcast ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        GENERATING...
                      </>
                    ) : (
                      "GENERATE"
                    )}
                  </Button>

                  {/* Progress indicator */}
                  {isGeneratingPodcast && (
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        Generating podcast episode... This may take a few minutes.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            /* Note Editor */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">
                  {expandedNoteId ? "Edit Note" : "New Note"}
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={!noteTitle?.trim() || !noteContent?.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsCreatingNote(false);
                      setExpandedNoteId(null);
                      setNoteTitle("");
                      setNoteContent("");
                    }}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 flex flex-col">
                <input
                  type="text"
                  placeholder="Note title..."
                  className="w-full px-3 py-2 rounded-lg border bg-background/50 font-semibold backdrop-blur-sm"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <textarea
                  placeholder="Start writing your note..."
                  className="w-full flex-1 px-3 py-2 rounded-lg border bg-background/50 resize-none min-h-[500px] backdrop-blur-sm"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Content - Unified Layout */}
      <div className="sm:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="sources" className="mt-0 h-[calc(100vh-200px)] overflow-hidden rounded-xl">
            <div className="flex flex-col h-full">
              {/* Sources Panel Header - Only show when not expanded */}
              {!isSourceExpanded && (
                <div className="p-4 space-y-4 border-b bg-background/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sources</h2>
              <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleAddSourceClick}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button 
                  size="sm" 
                    variant="outline"
                    onClick={handleDiscoverClick}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Discover
                </Button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search sources..."
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
                </div>
              )}

              {/* Add Source Form */}
              {showAddSourceForm && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Add Source</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddSourceForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Tabs value={sourceType} onValueChange={(value) => setSourceType(value as "link" | "upload" | "text")} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger value="link" className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        URL
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Text
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-4">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                        </div>
                        <Button className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="link" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="url">URL</Label>
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                        </div>
                        <Button className="w-full">
                          <Link className="h-4 w-4 mr-2" />
                          Add URL
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="text">Text Content</Label>
                          <Textarea
                            id="text"
                            placeholder="Paste your text here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            rows={6}
                          />
                        </div>
                        <Button className="w-full">
                          <Type className="h-4 w-4 mr-2" />
                          Add Text
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Discover Form */}
              {showDiscoverForm && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Discover Sources</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDiscoverForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="discover">Search Query</Label>
                      <Input
                        id="discover"
                        placeholder="What are you looking for?"
                        value={discoverQuery}
                        onChange={(e) => setDiscoverQuery(e.target.value)}
                      />
                    </div>
                    <Button className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Discover Sources
                    </Button>
                  </div>
                </div>
              )}

              {/* Source Content - Show when source is selected */}
              {selectedSource && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold truncate">{selectedSource.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCloseSourceView}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Transformation Controls */}
                  <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg mb-4">
                    <Select value={selectedTransformation} onValueChange={setSelectedTransformation}>
                      <SelectTrigger className="w-[200px]">
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
                      onClick={handleTransformationRun}
                      disabled={!selectedTransformation}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  </div>

                  {/* Transformation Results */}
                  {Object.entries(transformationResults).map(([transformation, result]) => (
                    <div key={transformation} className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-3">
                      <details className="group">
                        <summary className="font-semibold text-sm text-primary cursor-pointer list-none flex items-center justify-between">
                          <span>{transformation} Result</span>
                          <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 pt-2 border-t border-primary/20">
                          <p className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto mb-3">
                            {result}
                          </p>
                          <Button
                            onClick={() => handleSaveAsNote(transformation, result)}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Save as Note
                          </Button>
                        </div>
                      </details>
                    </div>
                  ))}

                  {/* Original Content */}
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <details className="group">
                      <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                        <span>Original Content</span>
                        <span className="group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {selectedSource.content || "No content available"}
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {/* Sources List - Only show when not expanded */}
              {!isSourceExpanded && (
                <ScrollArea className="flex-1">
                  <div className="p-4">
            <div className="space-y-2">
              {sources.length > 0 ? (
                sources.map((source) => (
                  <Card
                    key={source.id}
                    className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSourceSelect(source)}
                  >
                            <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{getSourceIcon(source.source_type)}</span>
                                  <p className="font-medium text-sm truncate">{source.title}</p>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {source.content || "No content available"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                          {new Date(source.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-sm mb-2">No sources yet</p>
                          <p className="text-xs mb-4">Add your first source to get started</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                            onClick={handleAddSourceClick}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Source
                  </Button>
                </div>
              )}
            </div>
                  </div>
                </ScrollArea>
              )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden">
            <ChatPanel notebookId={notebook.id} onNoteSaved={loadData} />
          </div>
        </TabsContent>

        <TabsContent value="studio" className="mt-0 h-[calc(100vh-200px)] overflow-hidden rounded-xl">
          <div className="flex flex-col h-full">
            {!isCreatingNote && !showPodcastForm ? (
              <>
                {/* Studio Header */}
                <div className="p-4 space-y-4 border-b bg-background/50">
            <h2 className="text-lg font-semibold">Studio</h2>
            
                  {/* Generate Podcast Button */}
                <Button 
                    className="w-full mb-4 bg-primary hover:bg-primary/90"
                    onClick={() => setShowPodcastForm(true)}
                    disabled={isGeneratingPodcast}
                  >
                    <AudioLines className="h-4 w-4 mr-2" />
                    {isGeneratingPodcast ? "Generating Podcast..." : "Generate Podcast"}
                </Button>

            {/* Create Note Button */}
            <Button 
                    className="w-full mb-4"
              onClick={() => setIsCreatingNote(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add note
            </Button>
                </div>
              </>
            ) : showPodcastForm ? (
              /* Podcast Generation Form */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Audio Overview - Podcast Generation</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowPodcastForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate a podcast episode from your notebook: <span className="font-semibold">{notebook.name}</span>
                      </p>
                    </div>

                    {/* Episode Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Episode Name *</label>
                <input
                  type="text"
                        placeholder="Enter episode name..."
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 text-sm"
                        value={podcastSettings.episodeName}
                        onChange={(e) => setPodcastSettings({...podcastSettings, episodeName: e.target.value})}
                      />
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Template</label>
                      <select
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 text-sm"
                        value={podcastSettings.template}
                        onChange={(e) => setPodcastSettings({...podcastSettings, template: e.target.value})}
                      >
                        <option value="Deep Dive - get into it">Deep Dive - get into it</option>
                        <option value="Quick Summary">Quick Summary</option>
                        <option value="Educational">Educational</option>
                        <option value="Conversational">Conversational</option>
                      </select>
                    </div>

                    {/* Podcast Length */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Podcast Length</label>
                      <select
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 text-sm"
                        value={podcastSettings.length}
                        onChange={(e) => setPodcastSettings({...podcastSettings, length: e.target.value})}
                      >
                        <option value="Short (5-10 min)">Short (5-10 min)</option>
                        <option value="Medium (10-20 min)">Medium (10-20 min)</option>
                        <option value="Long (20-30 min)">Long (20-30 min)</option>
                      </select>
                    </div>

                    {/* Max Number of Chunks */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Number of Chunks</label>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                          value={podcastSettings.maxChunks}
                          onChange={(e) => setPodcastSettings({...podcastSettings, maxChunks: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1</span>
                          <span>{podcastSettings.maxChunks}</span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>

                    {/* Min Chunk Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Chunk Size</label>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                          value={podcastSettings.minChunkSize}
                          onChange={(e) => setPodcastSettings({...podcastSettings, minChunkSize: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1</span>
                          <span>{podcastSettings.minChunkSize}</span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>

                    {/* Play Button Placeholder */}
                    <div className="flex justify-center py-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <AudioLines className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        if (!podcastSettings.episodeName?.trim()) {
                          toast({
                            title: "Episode name required",
                            description: "Please enter an episode name.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setIsGeneratingPodcast(true);
                        try {
                          await podcastsAPI.generate({
                            notebook_id: id!,
                            prompt: `Episode: ${podcastSettings.episodeName}, Template: ${podcastSettings.template}, Length: ${podcastSettings.length}`,
                          });
                          toast({
                            title: "Podcast generation started",
                            description: "Your podcast is being generated. This may take a few minutes.",
                          });
                          setShowPodcastForm(false);
                          setPodcastSettings({
                            episodeName: "",
                            template: "Deep Dive - get into it",
                            length: "Short (5-10 min)",
                            maxChunks: 5,
                            minChunkSize: 3
                          });
                          // Poll for updates
                          const pollInterval = setInterval(async () => {
                            const updatedPodcasts = await podcastsAPI.list(id!);
                            setPodcasts(updatedPodcasts);
                            const generatingPodcast = updatedPodcasts.find(p => p.status === 'generating');
                            if (!generatingPodcast) {
                              clearInterval(pollInterval);
                              setIsGeneratingPodcast(false);
                            }
                          }, 3000);
                        } catch (error) {
                          toast({
                            title: "Generation failed",
                            description: "Failed to generate podcast.",
                            variant: "destructive",
                          });
                          setIsGeneratingPodcast(false);
                        }
                      }}
                      disabled={isGeneratingPodcast || !podcastSettings.episodeName?.trim()}
                    >
                      {isGeneratingPodcast ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          GENERATING...
                        </>
                      ) : (
                        "GENERATE"
                      )}
                    </Button>

                    {/* Progress indicator */}
                    {isGeneratingPodcast && (
                      <div className="space-y-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                          Generating podcast episode... This may take a few minutes.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              /* Note Editor */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">
                    {expandedNoteId ? "Edit Note" : "New Note"}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={!noteTitle?.trim() || !noteContent?.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsCreatingNote(false);
                        setExpandedNoteId(null);
                        setNoteTitle("");
                        setNoteContent("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-4 flex flex-col">
                  <input
                    type="text"
                    placeholder="Note title..."
                    className="w-full px-3 py-2 rounded-lg border bg-background/50 font-semibold text-sm"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Start writing your note..."
                    className="w-full flex-1 px-3 py-2 rounded-lg border bg-background/50 resize-none text-sm min-h-[400px]"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Notes and Podcasts List - Only show when not in form mode */}
            {!isCreatingNote && !showPodcastForm && (
              <ScrollArea className="flex-1">
                <div className="p-4">
            <div className="space-y-4">
                    {/* Recent Notes */}
              {notes.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Recent Notes</h3>
                  <div className="space-y-2">
                    {notes.slice(0, 3).map((note) => (
                      <Card
                        key={note.id}
                        className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleEditNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{note.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {note.content}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No notes yet</p>
                  <p className="text-xs">Create your first note to get started</p>
                </div>
              )}

                    {/* Recent Podcasts */}
              {podcasts.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Generated Podcasts</h3>
                  <div className="space-y-2">
                    {podcasts.map((podcast) => (
                      <Card key={podcast.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{podcast.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {podcast.duration} • {new Date(podcast.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <AudioLines className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No podcasts yet</p>
                  <p className="text-xs">Generate your first audio overview</p>
                </div>
              )}
            </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Note Editor Overlay */}
      {isCreatingNote && (
        <div className="sm:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">
                {expandedNoteId ? "Edit Note" : "New Note"}
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={!noteTitle?.trim() || !noteContent?.trim()}
                >
                  Save
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingNote(false);
                    setExpandedNoteId(null);
                    setNoteTitle("");
                    setNoteContent("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 flex flex-col">
              <input
                type="text"
                placeholder="Note title..."
                className="w-full px-3 py-2 rounded-lg border bg-background/50 font-semibold backdrop-blur-sm"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <textarea
                placeholder="Start writing your note..."
                className="w-full flex-1 px-3 py-2 rounded-lg border bg-background/50 resize-none backdrop-blur-sm min-h-[400px]"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
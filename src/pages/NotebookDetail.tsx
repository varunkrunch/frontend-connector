import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Download, Trash2, Minimize2, AudioLines, Video, Network, FileBarChart, Plus, FileText, ChevronLeft, Menu, X, Upload, Link, Type, Sparkles, Play, MoreVertical, Edit, Check } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState("");
  const [transformationResults, setTransformationResults] = useState<Record<string, string>>({});
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [editingSourceTitle, setEditingSourceTitle] = useState("");
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (!id || !notebook) return;
    
    console.log("Loading data for notebook:", id, "name:", notebook.name);
    
    // Load sources (this works)
    try {
      const sourcesData = await sourcesAPI.listByNotebookName(notebook.name);
      console.log("✅ Sources loaded:", sourcesData);
      setSources(sourcesData);
    } catch (error) {
      console.error("❌ Error loading sources:", error);
    }
    
    // Load notes (this might fail, but we'll handle it gracefully)
    try {
      const notesData = await notesAPI.list(id);
      console.log("✅ Notes loaded:", notesData);
      setNotes(notesData);
    } catch (error) {
      console.error("❌ Error loading notes:", error);
      setNotes([]); // Set empty array if notes fail
    }
    
    // Load podcasts (this might fail, but we'll handle it gracefully)
    try {
      const podcastsData = await podcastsAPI.list(id);
      console.log("✅ Podcasts loaded:", podcastsData);
      setPodcasts(podcastsData);
    } catch (error) {
      console.error("❌ Error loading podcasts:", error);
      setPodcasts([]); // Set empty array if podcasts fail
    }
  };

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    setShowAddSourceForm(false); // Hide add form
    setShowDiscoverForm(false); // Hide discover form
    setIsSourceExpanded(true);
    
    // Load existing insights/transformations for this source
    if (source.insights && source.insights.length > 0) {
      const insightsMap: Record<string, string> = {};
      source.insights.forEach(insight => {
        if (insight.content) {
          insightsMap[insight.transformation_name || 'Transformation'] = insight.content;
        }
      });
      setTransformationResults(insightsMap);
    } else {
      setTransformationResults({});
    }
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
      
      console.log("🔍 NotebookDetail: Running transformation:", selectedTransformation, "on source:", selectedSource.title);
      
      // Call the real transformation API
      const result = await sourcesAPI.runTransformationsByTitle(selectedSource.title, selectedTransformation);
      
      console.log("✅ NotebookDetail: Transformation result:", result);
      
      // Extract the actual AI-generated content from the results
      let aiContent = `Successfully applied "${selectedTransformation}" transformation. Applied: ${result.total_applied}, Failed: ${result.total_failed}`;
      
      if (result.results && result.results.length > 0) {
        const firstResult = result.results[0];
        if (firstResult.success && firstResult.output) {
          aiContent = firstResult.output;
        }
      }
      
      setTransformationResults(prev => ({
        ...prev,
        [selectedTransformation]: aiContent
      }));
      
      toast({
        title: "Transformation complete",
        description: `${selectedTransformation} has been applied successfully.`,
      });
      
      // Reload sources to get updated insights
      await loadData();
      
    } catch (error) {
      console.error("❌ NotebookDetail: Transformation error:", error);
      
      const errorResult = `Failed to apply "${selectedTransformation}" transformation: ${error.message}`;
      setTransformationResults(prev => ({
        ...prev,
        [selectedTransformation]: errorResult
      }));
      
      toast({
        title: "Transformation failed",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
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
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error("❌ NotebookDetail: Error renaming source:", error);
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
      setTransformationResults({});
      setShowDeleteConfirm(false);
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error("❌ NotebookDetail: Error deleting source:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete source. Please try again.",
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
    if (!files || files.length === 0 || !notebook) return;

    setIsAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('type', 'upload');
      formData.append('file', files[0]);
      
      await sourcesAPI.createByNotebookName(notebook.name, formData);
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
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim() || !notebook) return;

    setIsAddingSource(true);
    try {
      const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const formData = new FormData();
      formData.append('type', 'link');
      formData.append('url', urlInput);
      
      await sourcesAPI.createByNotebookName(notebook.name, formData);
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
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !notebook) return;

    setIsAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('content', textInput);
      
      await sourcesAPI.createByNotebookName(notebook.name, formData);
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
    } finally {
      setIsAddingSource(false);
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
  console.log("🔍 NotebookDetail: Component rendering - sources.length:", sources.length, "isSourceExpanded:", isSourceExpanded);
  console.log("🔍 NotebookDetail: Will show sources list?", !isSourceExpanded);
  console.log("🔍 NotebookDetail: Sources array:", sources);
  
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
        {console.log("🔍 NotebookDetail: Rendering left panel - isSourceExpanded:", isSourceExpanded)}
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


          {console.log("🔍 NotebookDetail: isSourceExpanded:", isSourceExpanded, "Will render sources list?")}
          {!isSourceExpanded ? (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
              <div className="p-4 space-y-2 w-full max-w-full overflow-hidden">
                  {console.log("🔍 NotebookDetail: Rendering sources - sources.length:", sources.length, "sources:", sources)}
                  {sources.length > 0 ? (
                    sources.map((source) => (
                  <Card
                    key={source.id}
                    className="group p-2 cursor-pointer hover:bg-accent/50 transition-colors w-full max-w-full h-12 flex items-center overflow-hidden"
                    onClick={() => handleSourceSelect(source)}
                  >
                        <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
                            <span className="text-sm flex-shrink-0">{getSourceIcon(source.type)}</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden" style={{maxWidth: 'calc(100% - 80px)'}}>
                              {editingSourceId === source.id ? (
                                <Input
                                  value={editingSourceTitle}
                                  onChange={(e) => setEditingSourceTitle(e.target.value)}
                                  className="text-sm font-medium h-6 flex-1"
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
                                  <p className="font-medium text-sm truncate">
                                    {source.title}
                                  </p>
                                </div>
                              )}
                              <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
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
                    <div className="space-y-6 relative">
                      {/* Loading Overlay */}
                      {isAddingSource && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">Adding source...</p>
                          </div>
                        </div>
                      )}
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
                                disabled={isAddingSource}
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
                              disabled={isAddingSource}
                            />
                            <Button 
                              onClick={handleUrlSubmit}
                              className="w-full h-12"
                              disabled={!urlInput.trim() || isAddingSource}
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
                              disabled={isAddingSource}
                            />
                            <Button 
                              onClick={handleTextSubmit}
                              className="w-full h-12"
                              disabled={!textInput.trim() || isAddingSource}
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
                <div className="p-4 border-b bg-muted/30 relative">
                  {/* Loading Overlay */}
                  {isAddingSource && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Adding source...</p>
                      </div>
                    </div>
                  )}
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
              {console.log("🔍 NotebookDetail Mobile: isSourceExpanded:", isSourceExpanded, "Will render mobile sources list?")}
              {!isSourceExpanded && (
                <ScrollArea className="flex-1">
                  <div className="p-4 w-full max-w-full overflow-hidden">
            <div className="space-y-2 w-full max-w-full overflow-hidden">
              {console.log("🔍 NotebookDetail Mobile: Rendering sources - sources.length:", sources.length, "sources:", sources)}
              {sources.length > 0 ? (
                sources.map((source) => (
                  <Card
                    key={source.id}
                    className="group p-2 cursor-pointer hover:bg-accent/50 transition-colors w-full max-w-full h-12 flex items-center overflow-hidden"
                    onClick={() => handleSourceSelect(source)}
                  >
                            <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
                            <span className="text-sm flex-shrink-0">{getSourceIcon(source.type)}</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden" style={{maxWidth: 'calc(100% - 80px)'}}>
                                  {editingSourceId === source.id ? (
                                    <Input
                                      value={editingSourceTitle}
                                      onChange={(e) => setEditingSourceTitle(e.target.value)}
                                      className="text-sm font-medium h-6 flex-1"
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
                                        <p className="font-medium text-sm truncate">
                                          {source.title}
                                        </p>
                                      </div>
                                  )}
                              <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
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
    </div>
  );
}
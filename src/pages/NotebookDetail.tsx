import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Trash2, Minimize2, AudioLines, Video, Network, FileBarChart, Plus, FileText, ChevronLeft } from "lucide-react";
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
  
  // Data states
  const [sources, setSources] = useState<Source[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastPrompt, setPodcastPrompt] = useState("");

  useEffect(() => {
    if (!notebook && id) {
      loadNotebook();
    } else if (id) {
      loadData();
    }
  }, [id]);

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
      const [sourcesData, notesData, podcastsData] = await Promise.all([
        sourcesAPI.list(id),
        notesAPI.list(id),
        podcastsAPI.list(id),
      ]);
      setSources(sourcesData);
      setNotes(notesData);
      setPodcasts(podcastsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    setIsSourceExpanded(true);
  };

  const handleCloseSourceView = () => {
    setIsSourceExpanded(false);
    setSelectedSource(null);
  };

  const handleSaveNote = async () => {
    if (!id || !noteTitle.trim() || !noteContent.trim()) return;

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
    if (!id || !podcastPrompt.trim()) return;
    
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Notebook not found</h2>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notebooks
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{notebook.name}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Three Panel Layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Panel - Sources */}
        <div className={cn(
          "border-r bg-card/50 transition-all duration-300 flex flex-col",
          isSourceExpanded ? "w-[600px]" : "w-80"
        )}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sources</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button size="sm" variant="outline">
                  Discover
                </Button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search sources..."
              className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {!isSourceExpanded ? (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {sources.map((source) => (
                  <Card
                    key={source.id}
                    className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSourceSelect(source)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getSourceIcon(source.source_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{source.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(source.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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
                  <h3 className="font-semibold">{selectedSource?.title}</h3>
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
                  <p className="text-sm text-muted-foreground">
                    {selectedSource?.content || "No content available"}
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Middle Panel - Chat */}
        <div className="flex-1 border-r">
          <ChatPanel notebookId={notebook.id} />
        </div>

        {/* Right Panel - Studio */}
        <div className={cn(
          "bg-card/50 transition-all duration-300 flex flex-col",
          isCreatingNote ? "w-[600px]" : "w-96"
        )}>
          {!isCreatingNote ? (
            <>
              {/* Studio Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold mb-4">Studio</h2>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button variant="outline" size="sm" className="justify-start">
                    <AudioLines className="h-4 w-4 mr-2" />
                    Audio Overview
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Video Overview
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Network className="h-4 w-4 mr-2" />
                    Mind Map
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </div>

                {/* Create Note Button */}
                <Button 
                  className="w-full mb-4"
                  onClick={() => setIsCreatingNote(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add note
                </Button>

                {/* Podcast Generation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Create an Audio Overview</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Describe what you want to discuss..."
                      className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                      value={podcastPrompt}
                      onChange={(e) => setPodcastPrompt(e.target.value)}
                      disabled={isGeneratingPodcast}
                    />
                    <Button 
                      size="sm"
                      onClick={handleGeneratePodcast}
                      disabled={isGeneratingPodcast || !podcastPrompt.trim()}
                    >
                      {isGeneratingPodcast ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
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
                    disabled={!noteTitle.trim() || !noteContent.trim()}
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
              <div className="flex-1 p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Note title..."
                  className="w-full px-3 py-2 rounded-md border bg-background font-semibold"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <textarea
                  placeholder="Start writing your note..."
                  className="w-full flex-1 px-3 py-2 rounded-md border bg-background resize-none min-h-[400px]"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
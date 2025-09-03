import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, BookOpen, MessageSquare, Mic, Plus, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notebookAPI } from "@/services/api";
import type { Notebook } from "@/types";
import { SourcesPanel } from "@/components/SourcesPanel";
import { NotesPanel } from "@/components/NotesPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { PodcastPanel } from "@/components/PodcastPanel";

export default function NotebookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [notebook, setNotebook] = useState<Notebook | null>(location.state?.notebook || null);
  const [activeTab, setActiveTab] = useState("sources");
  const [loading, setLoading] = useState(!notebook);

  useEffect(() => {
    if (!notebook && id) {
      loadNotebook();
    }
  }, [id]);

  const loadNotebook = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await notebookAPI.get(id);
      setNotebook(data);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold">{notebook.name}</h1>
                {notebook.description && (
                  <p className="text-sm text-muted-foreground">{notebook.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="sources" className="gap-2">
              <FileText className="h-4 w-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="gap-2">
              <Mic className="h-4 w-4" />
              Podcasts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-0">
            <SourcesPanel notebookId={notebook.id} />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <NotesPanel notebookId={notebook.id} />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <ChatPanel notebookId={notebook.id} />
          </TabsContent>

          <TabsContent value="podcasts" className="mt-0">
            <PodcastPanel notebookId={notebook.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
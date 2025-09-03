import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, BookOpen, MessageSquare, Mic, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notebookAPI } from "@/services/api";
import type { Notebook } from "@/types";
import { SourcesPanel } from "@/components/SourcesPanel";
import { NotesPanel } from "@/components/NotesPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { PodcastPanel } from "@/components/PodcastPanel";
import { cn } from "@/lib/utils";

export default function NotebookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [notebook, setNotebook] = useState<Notebook | null>(location.state?.notebook || null);
  const [activeTab, setActiveTab] = useState("sources");
  const [loading, setLoading] = useState(!notebook);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const tabs = [
    { id: "sources", label: "Sources", icon: FileText },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "podcasts", label: "Podcasts", icon: Mic },
  ];

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
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{notebook.name}</h1>
                {notebook.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{notebook.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                className="text-xs sm:text-sm"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Left Sidebar */}
      <div className="flex h-[calc(100vh-65px)] sm:h-[calc(100vh-73px)]">
        {/* Left Sidebar Navigation - Hidden on Mobile */}
        <aside className={cn(
          "hidden sm:flex border-r bg-card/50 transition-all duration-300",
          isSidebarOpen ? "sm:w-44 md:w-48 lg:w-56" : "w-14"
        )}>
          <nav className="h-full flex flex-col w-full">
            <div className="p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full justify-center hover:bg-accent"
              >
                {isSidebarOpen ? 
                  <span className="text-xs font-medium">◀</span> : 
                  <span className="text-xs font-medium">▶</span>
                }
              </Button>
            </div>
            
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-accent/50",
                      activeTab === tab.id 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "shrink-0 transition-all",
                      isSidebarOpen ? "h-4 w-4" : "h-5 w-5"
                    )} />
                    {isSidebarOpen && (
                      <span className="text-sm font-medium truncate">
                        {tab.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            {activeTab === "sources" && <SourcesPanel notebookId={notebook.id} />}
            {activeTab === "notes" && <NotesPanel notebookId={notebook.id} />}
            {activeTab === "chat" && <ChatPanel notebookId={notebook.id} />}
            {activeTab === "podcasts" && <PodcastPanel notebookId={notebook.id} />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t sm:hidden z-40">
          <nav className="flex justify-around items-center py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all",
                    "hover:bg-accent/50 min-w-0 flex-1",
                    activeTab === tab.id 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { notebookAPI } from "@/services/api";
import { Plus, BookOpen, FileText, Mic, MoreVertical, Settings, User, Loader2, Cloud, TrendingUp, Recycle, Code, FileCode, Palette } from "lucide-react";
import type { Notebook } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Index = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      const data = await notebookAPI.list();
      setNotebooks(data);
    } catch (error) {
      toast({
        title: "Error loading notebooks",
        description: "Failed to load notebooks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    try {
      await notebookAPI.delete(id);
      setNotebooks(notebooks.filter(n => n.id !== id));
      toast({
        title: "Notebook deleted",
        description: "The notebook has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete notebook. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenNotebook = (notebook: Notebook) => {
    navigate(`/notebook/${notebook.id}`, { state: { notebook } });
  };

  const getNotebookIcon = (index: number) => {
    const icons = [Cloud, TrendingUp, Recycle, Code, FileCode, Palette];
    const Icon = icons[index % icons.length];
    return <Icon className="h-12 w-12" />;
  };

  const getNotebookDate = (date?: string) => {
    if (!date) return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getSourceCount = () => {
    // Generate random source count for display
    return Math.floor(Math.random() * 10) + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                NotebookLM
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-border" />
              <Button variant="ghost" size="sm" className="gap-2">
                PRO
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Recent notebooks</h2>
          <p className="text-muted-foreground">Organize your sources, notes, and ideas in one place</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Notebook Card */}
            <Card 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-dashed border-2 bg-muted/10"
              onClick={() => navigate('/create-notebook')}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 h-[200px]">
                <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Create new notebook</h3>
              </CardContent>
            </Card>

            {/* Notebook Cards */}
            {notebooks.map((notebook, index) => (
              <Card 
                key={notebook.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenNotebook(notebook)}>
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteNotebook(notebook.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardContent 
                  className="p-6 h-[200px] flex flex-col"
                  onClick={() => handleOpenNotebook(notebook)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl text-primary">
                      {getNotebookIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate mb-1">{notebook.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notebook.description || "No description"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>{getNotebookDate(notebook.created_at)}</span>
                    <span className="font-medium">
                      {getSourceCount()} source{getSourceCount() !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
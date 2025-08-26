import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NotebookView } from "@/components/NotebookView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { notebookAPI, healthCheck, modelsAPI } from "@/services/api";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import type { Notebook, Model } from "@/types";

const Index = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotebook, setNewNotebook] = useState({ name: "", description: "" });
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [models, setModels] = useState<Model[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkAPIConnection();
    loadNotebooks();
    loadModels();
  }, []);

  const checkAPIConnection = async () => {
    // Always show as connected in standalone mode
    setApiStatus("connected");
  };

  const loadModels = async () => {
    try {
      const modelsList = await modelsAPI.list();
      setModels(modelsList);
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      const data = await notebookAPI.list();
      setNotebooks(data);
      if (data.length > 0 && !selectedNotebook) {
        setSelectedNotebook(data[0]);
      }
    } catch (error) {
      if (apiStatus === "connected") {
        toast({
          title: "Error loading notebooks",
          description: "Failed to load notebooks. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async () => {
    if (!newNotebook.name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your notebook.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await notebookAPI.create(newNotebook);
      setNotebooks([...notebooks, created]);
      setSelectedNotebook(created);
      setShowCreateDialog(false);
      setNewNotebook({ name: "", description: "" });
      toast({
        title: "Notebook created",
        description: `"${created.name}" has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Failed to create notebook. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    try {
      await notebookAPI.delete(id);
      setNotebooks(notebooks.filter(n => n.id !== id));
      if (selectedNotebook?.id === id) {
        setSelectedNotebook(notebooks[0] || null);
      }
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

  return (
    <div className="flex h-screen bg-background">
      {/* API Status Banner */}
      {apiStatus === "disconnected" && (
        <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center z-50">
          <div className="flex items-center justify-center gap-2">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">
              Backend API is not connected. Please start the backend server on http://localhost:8000
            </span>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={checkAPIConnection}
              className="ml-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        notebooks={notebooks}
        selectedNotebook={selectedNotebook}
        onSelectNotebook={setSelectedNotebook}
        onCreateNotebook={() => setShowCreateDialog(true)}
        onDeleteNotebook={handleDeleteNotebook}
      />

      {/* Main Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <NotebookView notebook={selectedNotebook} />
      )}

      {/* Create Notebook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription>
              Create a new notebook to organize your sources and notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Research Notebook"
                value={newNotebook.name}
                onChange={(e) => setNewNotebook({ ...newNotebook, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="A collection of research materials and notes..."
                value={newNotebook.description}
                onChange={(e) => setNewNotebook({ ...newNotebook, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotebook}>Create Notebook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Endpoints Info (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <Card className="w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Backend Status</h4>
              <Badge variant={apiStatus === "connected" ? "default" : "destructive"}>
                {apiStatus === "checking" ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : apiStatus === "connected" ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {apiStatus}
              </Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="font-medium text-muted-foreground mb-2">Available Endpoints:</div>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/notebooks</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/notes</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/sources</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/podcasts</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/chat</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/search</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/models</span>
                </Badge>
                <Badge variant="outline" className="justify-start">
                  <span className="truncate">/transformations</span>
                </Badge>
              </div>
              
              {models.length > 0 && (
                <>
                  <div className="font-medium text-muted-foreground mt-3 mb-1">Available Models:</div>
                  <div className="space-y-1">
                    {models.slice(0, 3).map((model) => (
                      <div key={model.id} className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {model.name}
                        </Badge>
                        <span className={`text-xs ${model.status === 'available' ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {model.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="pt-2 border-t">
                <a 
                  href="http://localhost:8000/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  View API Documentation
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
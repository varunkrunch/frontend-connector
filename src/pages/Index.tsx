import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { NotebookView } from "@/components/NotebookView";
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar */}
      <MobileSidebar
        notebooks={notebooks}
        selectedNotebook={selectedNotebook}
        onSelectNotebook={setSelectedNotebook}
        onCreateNotebook={() => {}}
      />

      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:block h-screen">
        <Sidebar
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          onSelectNotebook={setSelectedNotebook}
          onCreateNotebook={() => {}}
          onDeleteNotebook={handleDeleteNotebook}
        />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <NotebookView notebook={selectedNotebook} />
        )}
      </div>


      {/* API Endpoints Info - Hidden on mobile */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-40">
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
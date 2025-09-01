import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Youtube, 
  Globe, 
  Trash2, 
  Eye,
  Plus,
  Search
} from "lucide-react";
import { sourcesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { AddSourceDialog } from "@/components/dialogs/AddSourceDialog";
import { ViewSourceDialog } from "@/components/dialogs/ViewSourceDialog";
import { Input } from "@/components/ui/input";
import type { Source } from "@/types";

interface SourcesPanelProps {
  notebookId: string;
}

export function SourcesPanel({ notebookId }: SourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
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
      loadSources();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search and Add Button */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            size="sm"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredSources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No sources yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "No sources match your search" : "Upload documents or add links to get started"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  variant="default"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Source
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredSources.map((source) => (
                <Card 
                  key={source.id} 
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSource(source)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 bg-primary/10 rounded shrink-0">
                          {getSourceIcon(source.source_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate text-sm">{source.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs h-5">
                              {source.source_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(source.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSource(source);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSource(source.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Dialogs */}
      <AddSourceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        notebookId={notebookId}
        onSourceAdded={loadSources}
      />
      
      <ViewSourceDialog
        open={!!selectedSource}
        onOpenChange={(open) => !open && setSelectedSource(null)}
        source={selectedSource}
      />
    </div>
  );
}
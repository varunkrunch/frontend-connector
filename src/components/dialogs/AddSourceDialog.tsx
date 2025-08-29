import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  onSourceAdded: () => void;
}

export function AddSourceDialog({ open, onOpenChange, notebookId, onSourceAdded }: AddSourceDialogProps) {
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      // Simulate upload - would need actual API implementation
      toast({
        title: "Source uploaded",
        description: `${file.name} has been added to your notebook.`,
      });
      onSourceAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) return;

    try {
      setLoading(true);
      // Simulate URL processing - would need actual API implementation
      toast({
        title: "Processing URL",
        description: "Extracting content from the provided URL...",
      });
      setUrl("");
      onSourceAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
        </DialogHeader>
        
        <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "url")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Add URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
              <Input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-dialog"
                disabled={loading}
              />
              <label htmlFor="file-upload-dialog">
                <Button variant="secondary" asChild disabled={loading}>
                  <span>
                    Choose Files
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, TXT, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <Link className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter URL (website, YouTube, etc.)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                disabled={loading || !url} 
                className="w-full"
              >
                Add URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
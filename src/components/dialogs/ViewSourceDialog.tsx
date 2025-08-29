import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Youtube, Globe, Download, ExternalLink } from "lucide-react";
import type { Source } from "@/types";

interface ViewSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: Source | null;
}

export function ViewSourceDialog({ open, onOpenChange, source }: ViewSourceDialogProps) {
  if (!source) return null;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'txt':
      case 'doc':
        return <FileText className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'website':
        return <Globe className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getSourceIcon(source.source_type)}
              </div>
              <div>
                <DialogTitle className="text-xl">{source.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{source.source_type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Added {new Date(source.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Preview Content */}
          <div className="bg-muted/30 rounded-lg p-6 min-h-[300px]">
            <p className="text-muted-foreground">
              Content preview would appear here. This would show the actual content
              from the PDF, website, or YouTube transcript.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Original
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Copy, Share } from "lucide-react";
import type { Note } from "@/types";

interface ViewNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function ViewNoteDialog({ 
  open, 
  onOpenChange, 
  note,
  onEdit,
  onDelete 
}: ViewNoteDialogProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{note.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last updated {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Note Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap bg-muted/30 rounded-lg p-6 max-h-[400px] overflow-y-auto">
              {note.content}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Content
            </Button>
            <Button variant="outline" className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notesAPI } from "@/services/api";
import type { Note } from "@/types";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  onNoteAdded: () => void;
  editingNote?: Note | null;
}

export function AddNoteDialog({ 
  open, 
  onOpenChange, 
  notebookId, 
  onNoteAdded,
  editingNote 
}: AddNoteDialogProps) {
  const [note, setNote] = useState({
    title: editingNote?.title || "",
    content: editingNote?.content || "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!note.title || !note.content) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content for the note.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (editingNote?.id) {
        await notesAPI.update(editingNote.id, { ...editingNote, ...note });
        toast({
          title: "Note updated",
          description: "Your note has been successfully updated.",
        });
      } else {
        await notesAPI.create({ ...note, notebook_id: notebookId });
        toast({
          title: "Note created",
          description: "Your new note has been created.",
        });
      }
      setNote({ title: "", content: "" });
      onNoteAdded();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={note.title}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
              placeholder="Enter note title..."
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={note.content}
              onChange={(e) => setNote({ ...note, content: e.target.value })}
              placeholder="Write your note content..."
              className="min-h-[300px]"
              disabled={loading}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {editingNote ? "Update Note" : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
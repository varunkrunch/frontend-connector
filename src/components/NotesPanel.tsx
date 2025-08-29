import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  FileText,
  Calendar
} from "lucide-react";
import { notesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { AddNoteDialog } from "@/components/dialogs/AddNoteDialog";
import { ViewNoteDialog } from "@/components/dialogs/ViewNoteDialog";
import type { Note } from "@/types";

interface NotesPanelProps {
  notebookId: string;
}

export function NotesPanel({ notebookId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, [notebookId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await notesAPI.list(notebookId);
      setNotes(data);
    } catch (error) {
      toast({
        title: "Error loading notes",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    
    try {
      await notesAPI.delete(selectedNote.id);
      toast({
        title: "Note deleted",
        description: "The note has been removed from your notebook.",
      });
      setSelectedNote(null);
      setShowViewDialog(false);
      loadNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditNote = () => {
    setEditingNote(selectedNote);
    setShowViewDialog(false);
    setShowAddDialog(true);
  };

  const filteredNotes = notes.filter(note =>
    (note.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (note.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Main Layout
  return (
    <div className="h-full flex flex-col">
      {/* Header with Search and Add Button */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Button 
            size="sm" 
            onClick={() => {
              setEditingNote(null);
              setShowAddDialog(true);
            }} 
            variant="default"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "No notes match your search" : "Create your first note to get started"}
              </p>
              {!searchQuery && (
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={() => {
                    setEditingNote(null);
                    setShowAddDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setSelectedNote(note);
                    setShowViewDialog(true);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm">{note.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote(note);
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNote(note);
                            handleDeleteNote();
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
      <AddNoteDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        notebookId={notebookId}
        onNoteAdded={loadNotes}
        editingNote={editingNote}
      />
      
      <ViewNoteDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        note={selectedNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
}
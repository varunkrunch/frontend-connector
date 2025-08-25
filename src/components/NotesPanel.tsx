import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save,
  X,
  FileText,
  Calendar
} from "lucide-react";
import { notesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/types";

interface NotesPanelProps {
  notebookId: string;
}

export function NotesPanel({ notebookId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
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

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote({
      title: "",
      content: "",
      notebook_id: notebookId,
    });
  };

  const handleSaveNote = async () => {
    if (!editingNote.title || !editingNote.content) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content for the note.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (editingNote.id) {
        await notesAPI.update(editingNote.id, editingNote);
        toast({
          title: "Note updated",
          description: "Your note has been successfully updated.",
        });
      } else {
        await notesAPI.create(editingNote);
        toast({
          title: "Note created",
          description: "Your new note has been created.",
        });
      }
      setIsCreating(false);
      setEditingNote({});
      loadNotes();
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

  const handleDeleteNote = async (id: string) => {
    try {
      await notesAPI.delete(id);
      toast({
        title: "Note deleted",
        description: "The note has been removed from your notebook.",
      });
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      loadNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* Notes List */}
      <div className="w-96 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notes</h3>
            <Button size="sm" onClick={handleCreateNote}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No notes found" : "No notes yet. Create your first note!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={cn(
                    "cursor-pointer hover:bg-accent/50 transition-colors",
                    selectedNote?.id === note.id && "bg-accent"
                  )}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardContent className="p-3">
                    <h4 className="font-medium truncate">{note.title}</h4>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Note Editor/Viewer */}
      <div className="flex-1 flex flex-col">
        {selectedNote || isCreating ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {isCreating ? "New Note" : selectedNote?.title}
              </h2>
              <div className="flex gap-2">
                {!isCreating && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingNote(selectedNote!);
                        setIsCreating(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNote(selectedNote!.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              {isCreating ? (
                <div className="space-y-4 max-w-4xl">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={editingNote.title || ""}
                      onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                      placeholder="Enter note title..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      value={editingNote.content || ""}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      placeholder="Write your note content..."
                      className="min-h-[400px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNote}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingNote({});
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Select a note to view</h3>
              <p className="text-muted-foreground">
                Choose a note from the list or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for classnames
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
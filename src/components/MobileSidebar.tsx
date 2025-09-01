import { useState } from "react";
import { Menu, X, Plus, BookOpen, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Notebook } from "@/types";

interface MobileSidebarProps {
  notebooks: Notebook[];
  selectedNotebook: Notebook | null;
  onSelectNotebook: (notebook: Notebook) => void;
  onCreateNotebook: () => void;
}

export function MobileSidebar({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  onCreateNotebook,
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectNotebook = (notebook: Notebook) => {
    onSelectNotebook(notebook);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>NotebookLM</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-4">
          <Button
            onClick={() => {
              navigate('/create-notebook');
              setOpen(false);
            }}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            New Notebook
          </Button>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              My Notebooks
            </h3>
            {notebooks.map((notebook) => (
              <Button
                key={notebook.id}
                variant={selectedNotebook?.id === notebook.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => handleSelectNotebook(notebook)}
              >
                <BookOpen className="h-4 w-4" />
                <span className="truncate">{notebook.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
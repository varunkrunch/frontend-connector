import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Link, 
  Youtube, 
  Globe, 
  Mic, 
  MessageSquare,
  Sparkles,
  FileUp,
  Plus,
  Trash2,
  Download
} from "lucide-react";
import { SourcesPanel } from "./SourcesPanel";
import { NotesPanel } from "./NotesPanel";
import { ChatPanel } from "./ChatPanel";
import { PodcastPanel } from "./PodcastPanel";
import type { Notebook } from "@/types";

interface NotebookViewProps {
  notebook: Notebook | null;
}

export function NotebookView({ notebook }: NotebookViewProps) {
  const [activeTab, setActiveTab] = useState("sources");

  if (!notebook) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold">Welcome to NotebookLM</h2>
          <p className="text-muted-foreground">
            Select a notebook from the sidebar or create a new one to get started.
            Upload sources, take notes, generate podcasts, and chat with your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{notebook.name}</h1>
              {notebook.description && (
                <p className="text-muted-foreground mt-1">{notebook.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <FileText className="h-3 w-3 mr-1" />
              12 Sources
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <MessageSquare className="h-3 w-3 mr-1" />
              24 Notes
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Mic className="h-3 w-3 mr-1" />
              3 Podcasts
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="h-12 bg-transparent border-b-0">
            <TabsTrigger value="sources" className="data-[state=active]:bg-accent">
              <FileUp className="h-4 w-4 mr-2" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-accent">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-accent">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="data-[state=active]:bg-accent">
              <Mic className="h-4 w-4 mr-2" />
              Podcasts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="sources" className="h-full m-0">
            <SourcesPanel notebookId={notebook.id} />
          </TabsContent>
          <TabsContent value="notes" className="h-full m-0">
            <NotesPanel notebookId={notebook.id} />
          </TabsContent>
          <TabsContent value="chat" className="h-full m-0">
            <ChatPanel notebookId={notebook.id} />
          </TabsContent>
          <TabsContent value="podcasts" className="h-full m-0">
            <PodcastPanel notebookId={notebook.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
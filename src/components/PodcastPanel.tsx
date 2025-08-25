import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Mic, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Sparkles,
  Download,
  Trash2,
  Plus,
  Loader2,
  FileText
} from "lucide-react";
import { podcastsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Podcast } from "@/types";

interface PodcastPanelProps {
  notebookId: string;
}

export function PodcastPanel({ notebookId }: PodcastPanelProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPodcasts();
  }, [notebookId]);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const data = await podcastsAPI.list(notebookId);
      setPodcasts(data);
    } catch (error) {
      toast({
        title: "Error loading podcasts",
        description: "Failed to load podcasts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePodcast = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please provide instructions for the podcast generation.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      setShowGenerateDialog(false);
      
      await podcastsAPI.generate({
        notebook_id: notebookId,
        prompt: prompt,
        style: "conversational", // Could be made configurable
      });
      
      toast({
        title: "Podcast generation started",
        description: "Your podcast is being generated. This may take a few minutes.",
      });
      
      setPrompt("");
      
      // Poll for updates
      setTimeout(loadPodcasts, 5000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate podcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePodcast = async (id: string) => {
    try {
      await podcastsAPI.delete(id);
      toast({
        title: "Podcast deleted",
        description: "The podcast has been removed.",
      });
      if (selectedPodcast?.id === id) {
        setSelectedPodcast(null);
      }
      loadPodcasts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete podcast. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Audio Overviews</h3>
            <p className="text-sm text-muted-foreground">
              Generate AI-powered podcast discussions from your notebook
            </p>
          </div>
          <Button 
            onClick={() => setShowGenerateDialog(true)}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Podcast
              </>
            )}
          </Button>
        </div>

        {/* Current Playing Podcast */}
        {selectedPodcast && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{selectedPodcast.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPodcast.description}
                    </p>
                  </div>
                  <Badge variant={selectedPodcast.status === 'completed' ? 'default' : 'secondary'}>
                    {selectedPodcast.status}
                  </Badge>
                </div>

                {selectedPodcast.status === 'completed' && (
                  <>
                    {/* Audio Player Controls */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1">
                        <Slider
                          value={[currentTime]}
                          max={selectedPodcast.duration || 100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(selectedPodcast.duration || 0)}</span>
                        </div>
                      </div>
                      
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        defaultValue={[75]}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Podcasts List */}
      <ScrollArea className="flex-1 p-6">
        <div className="grid gap-4">
          {podcasts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No podcasts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate an AI podcast discussion from your notebook sources
                </p>
                <Button onClick={() => setShowGenerateDialog(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First Podcast
                </Button>
              </CardContent>
            </Card>
          ) : (
            podcasts.map((podcast) => (
              <Card 
                key={podcast.id} 
                className={cn(
                  "cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedPodcast?.id === podcast.id && "bg-accent"
                )}
                onClick={() => setSelectedPodcast(podcast)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mic className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{podcast.title}</h4>
                        {podcast.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {podcast.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={podcast.status === 'completed' ? 'default' : 'secondary'}>
                            {podcast.status}
                          </Badge>
                          {podcast.duration && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(podcast.duration)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(podcast.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {podcast.status === 'completed' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePodcast(podcast.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Generate Podcast Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Podcast</DialogTitle>
            <DialogDescription>
              Create an engaging audio discussion from your notebook sources
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Podcast Instructions
              </label>
              <Textarea
                placeholder="E.g., Create a 10-minute conversational podcast discussing the main topics from my sources. Focus on key insights and practical applications."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Be specific about the style, duration, and focus areas 
                you want for your podcast. The AI will create a natural conversation between 
                two hosts discussing your content.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGeneratePodcast} disabled={!prompt.trim()}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function for classnames
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
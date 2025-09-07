import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText
} from "lucide-react";
import { chatAPI, notesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/types";

interface ChatPanelProps {
  notebookId: string;
  onNoteSaved?: () => void;
}

export function ChatPanel({ notebookId, onNoteSaved }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadChatHistory();
  }, [notebookId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatAPI.history(notebookId);
      setMessages(history);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      notebook_id: notebookId,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatAPI.send({
        notebook_id: notebookId,
        message: input,
      });

      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "-assistant",
        notebook_id: notebookId,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove the user message if the request failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setInput(userMessage.content);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleSaveAsNote = async (content: string) => {
    try {
      const noteTitle = `AI Response - ${new Date().toLocaleDateString()}`;
      
      await notesAPI.create({
        notebook_id: notebookId,
        title: noteTitle,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Note saved",
        description: "AI response has been saved as a note.",
      });
      
      // Notify parent component to refresh notes
      onNoteSaved?.();
    } catch (error) {
      toast({
        title: "Failed to save note",
        description: "Could not save the AI response as a note.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden pb-20 rounded-xl">
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card/80 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Ask questions about your notebook content
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={loadChatHistory} 
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 sm:mb-4 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Ask questions about your sources, get summaries, or explore insights
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  <Button
                    variant="outline"
                    className="justify-start text-xs sm:text-sm h-auto py-2 px-3 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                    onClick={() => setInput("Summarize all my sources")}
                  >
                    Summarize all my sources
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-xs sm:text-sm h-auto py-2 px-3 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                    onClick={() => setInput("What are the key insights?")}
                  >
                    What are the key insights?
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-xs sm:text-sm h-auto py-2 px-3 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                    onClick={() => setInput("Generate study questions")}
                  >
                    Generate study questions
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-xs sm:text-sm h-auto py-2 px-3 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                    onClick={() => setInput("Create an outline")}
                  >
                    Create an outline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-primary">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[70%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  } rounded-xl p-3 sm:p-4 transition-all duration-300 ease-out hover:shadow-md animate-in slide-in-from-bottom-2 fade-in-0`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  
                  {message.role === "assistant" && (
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveAsNote(message.content)}
                        className="h-7 px-3 text-xs bg-white border-border/50 hover:bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Save as Note"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Save as Note
                      </Button>
                    </div>
                  )}
                </div>
                
                {message.role === "user" && (
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                    <AvatarFallback>
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-2 sm:gap-3">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                <AvatarFallback className="bg-gradient-primary">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      </div>

      {/* Input - Fixed at bottom of page */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-border bg-card/95 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out rounded-t-xl">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            placeholder="Ask about your notebook..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={loading}
            className="flex-1 text-sm sm:text-base bg-background/50 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 rounded-xl"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || !input.trim()}
            size="icon"
            className="shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
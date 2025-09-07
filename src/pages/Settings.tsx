import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Info, Save, Mic, Settings as SettingsIcon, Leaf, Plus, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  
  // Podcast Template Form State
  const [templateName, setTemplateName] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [podcastTagline, setPodcastTagline] = useState("");
  const [language, setLanguage] = useState("");
  const [person1Roles, setPerson1Roles] = useState<string[]>([]);
  const [person2Roles, setPerson2Roles] = useState<string[]>([]);
  const [conversationStyle, setConversationStyle] = useState<string[]>([]);
  const [engagementTechniques, setEngagementTechniques] = useState<string[]>([]);
  const [dialogueStructure, setDialogueStructure] = useState<string[]>([]);
  const [creativity, setCreativity] = useState([0.0]);
  const [endingMessage, setEndingMessage] = useState("Thank you for listening!");
  const [transcriptModelProvider, setTranscriptModelProvider] = useState("openai");
  const [transcriptModel, setTranscriptModel] = useState("gpt-4o-mini");
  const [audioModelProvider, setAudioModelProvider] = useState("openai");
  const [audioModel, setAudioModel] = useState("tts-1");
  const [voice1, setVoice1] = useState("");
  const [voice2, setVoice2] = useState("");

  // Transformations State
  const [transformationType, setTransformationType] = useState("Prompt");
  const [newPromptTemplate, setNewPromptTemplate] = useState(`TRANSFORMATIONS:
You are an expert at [your role]. Your task is to [your task]. You will be given [input]. You must [output requirements].

CONSTRAINTS:
- [constraint 1]
- [constraint 2]
- [constraint 3]

EXAMPLE:
Input: [example input]
Output: [example output]`);
  const [selectedTransformation, setSelectedTransformation] = useState("Analyze Paper");
  const [transformationDescription, setTransformationDescription] = useState("");
  const [transformationPrompt, setTransformationPrompt] = useState("");
  const [expandedTransformation, setExpandedTransformation] = useState<string | null>("Analyze Paper");
  const [transformationName, setTransformationName] = useState("Analyze Paper");
  const [cardTitle, setCardTitle] = useState("Analyze Paper");
  const [showNewTransformationForm, setShowNewTransformationForm] = useState(false);
  const [newTransformationName, setNewTransformationName] = useState("New Tranformation");
  const [newTransformationCardTitle, setNewTransformationCardTitle] = useState("New Transformation Title");
  const [newTransformationDescription, setNewTransformationDescription] = useState("New Transformation Description");
  const [newTransformationPrompt, setNewTransformationPrompt] = useState("New Transformation Prompt");
  const [userTransformations, setUserTransformations] = useState<Array<{
    id: string;
    name: string;
    description: string;
    prompt: string;
  }>>([]);

  // Role suggestions
  const roleSuggestions = [
    "Main Summarizer", "Questioner/Clarifier", "Optimist", "Skeptic", "Specialist", 
    "Thesis Presenter", "Counterargument Provider", "Professor", "Student", "Moderator", 
    "Host", "Co-host", "Expert Guest", "Novice", "Devil's Advocate", "Analyst", 
    "Storyteller", "Fact-checker", "Comedian", "Interviewer", "Interviewee", "Historian", 
    "Visionary", "Strategist", "Critic", "Enthusiast", "Mediator", "Commentator", 
    "Researcher", "Reporter", "Advocate", "Debater", "Explorer"
  ];

  const conversationStyleSuggestions = [
    "Analytical", "Argumentative", "Informative", "Humorous", "Casual", "Formal", 
    "Inspirational", "Debate-style", "Interview-style", "Storytelling", "Satirical", 
    "Educational", "Philosophical", "Speculative", "Motivational", "Fun", "Technical", 
    "Light-hearted", "Serious", "Investigative", "Debunking", "Didactic", 
    "Thought-provoking", "Controversial", "Sarcastic", "Emotional", "Exploratory", 
    "Fast-paced", "Slow-paced", "Introspective"
  ];

  const engagementTechniqueSuggestions = [
    "Rhetorical Questions", "Anecdotes", "Analogies", "Humor", "Metaphors", 
    "Storytelling", "Quizzes", "Personal Testimonials", "Quotes", "Jokes", 
    "Emotional Appeals", "Provocative Statements", "Sarcasm", "Pop Culture References", 
    "Thought Experiments", "Puzzles and Riddles", "Role-playing", "Debates", 
    "Catchphrases", "Statistics and Facts", "Open-ended Questions", 
    "Challenges to Assumptions", "Evoking Curiosity"
  ];

  const dialogueStructureSuggestions = [
    "Topic Introduction", "Opening Monologue", "Guest Introduction", "Icebreakers", 
    "Historical Context", "Defining Terms", "Problem Statement", "Overview of the Issue", 
    "Deep Dive into Subtopics", "Pro Arguments", "Con Arguments", "Cross-examination", 
    "Expert Interviews", "Case Studies", "Myth Busting", "Q&A Session", 
    "Rapid-fire Questions", "Summary of Key Points", "Recap", "Key Takeaways", 
    "Actionable Tips", "Call to Action", "Future Outlook", "Closing Remarks", 
    "Resource Recommendations", "Trending Topics", "Closing Inspirational Quote", 
    "Final Reflections"
  ];

  const handleAddRole = (role: string, type: 'person1' | 'person2') => {
    if (type === 'person1' && !person1Roles.includes(role)) {
      setPerson1Roles([...person1Roles, role]);
    } else if (type === 'person2' && !person2Roles.includes(role)) {
      setPerson2Roles([...person2Roles, role]);
    }
  };

  const handleRemoveRole = (role: string, type: 'person1' | 'person2') => {
    if (type === 'person1') {
      setPerson1Roles(person1Roles.filter(r => r !== role));
    } else if (type === 'person2') {
      setPerson2Roles(person2Roles.filter(r => r !== role));
    }
  };

  const handleAddStyle = (style: string, type: 'conversation' | 'engagement' | 'dialogue') => {
    if (type === 'conversation' && !conversationStyle.includes(style)) {
      setConversationStyle([...conversationStyle, style]);
    } else if (type === 'engagement' && !engagementTechniques.includes(style)) {
      setEngagementTechniques([...engagementTechniques, style]);
    } else if (type === 'dialogue' && !dialogueStructure.includes(style)) {
      setDialogueStructure([...dialogueStructure, style]);
    }
  };

  const handleRemoveStyle = (style: string, type: 'conversation' | 'engagement' | 'dialogue') => {
    if (type === 'conversation') {
      setConversationStyle(conversationStyle.filter(s => s !== style));
    } else if (type === 'engagement') {
      setEngagementTechniques(engagementTechniques.filter(s => s !== style));
    } else if (type === 'dialogue') {
      setDialogueStructure(dialogueStructure.filter(s => s !== style));
    }
  };

  // Transformations data
  const transformations = [
    {
      name: "Analyze Paper",
      description: "Analyses a technical/scientific paper",
      prompt: `# IDENTITY and PURPOSE
You are an insightful and analytical reader of academic papers, extracting the key components, significance, and broader implications. Your focus is to uncover the core contributions, practical applications, methodological strengths or weaknesses, and any surprising findings. You are especially attuned to the clarity of arguments, the relevance to existing literature, and potential impacts on both the specific field and broader contexts.

# STEPS
1. **READ AND UNDERSTAND THE PAPER**: Thoroughly read the paper, identifying its main focus, arguments, methods, results, and conclusions.
2. **IDENTIFY CORE ELEMENTS**:
   - **Purpose**: What is the main goal or research question?
   - **Contribution**: What new knowledge or innovation does this paper bring to the field?
   - **Methods**: What methods are used, and are they novel or particularly effective?
   - **Key Findings**: What are the most critical results, and why do they matter?
   - **Limitations**: Are there any notable limitations or areas for further research?
3. **SYNTHESIZE THE MAIN POINTS**:
   - Extract the key elements and organize them into insightful observations.
   - Highlight the broader impact and potential applications.
   - Note any aspects that challenge established views or introduce new questions.

# OUTPUT INSTRUCTIONS
- Structure the output as follows:
  - **PURPOSE**: A concise summary of the main research question or goal (1-2 sentences).
  - **CONTRIBUTION**: A bullet list of 2-3 points that describe what the paper adds to the field.
  - **KEY FINDINGS**: A bullet list of 2-3 points summarizing the critical outcomes of the study.
  - **IMPLICATIONS**: A bullet list of 2-3 points discussing the significance or potential impact of the findings on the field or broader context.
  - **LIMITATIONS**: A bullet list of 1-2 points identifying notable limitations or areas for future work.
- **Bullet Points** should be between 15-20 words.
- Avoid starting each bullet point with the same word to maintain variety.
- Use clear and concise language that conveys the key ideas effectively.
- Do not include warnings, disclaimers, or personal opinions.
- Output only the requested sections with their respective labels.`
    },
    {
      name: "Dense Summary",
      description: "Creates a rich, deep summary of the content",
      prompt: `# MISSION
You are a Sparse Priming Representation (SPR) writer. An SPR is a particular kind of use of language for advanced NLP, NLU, and NLG tasks, particularly useful for the latest generation of Large Language Models (LLMs). You will be given information by the USER which you are to render as an SPR.

# THEORY
LLMs are a kind of deep neural network. They have been demonstrated to embed knowledge, abilities, and concepts, ranging from reasoning to planning, and even to theory of mind. These are called latent abilities and latent content, collectively referred to as latent space. The latent space of an LLM can be activated with the correct series of words as inputs, which will create a useful internal state of the neural network. This is not unlike how the right shorthand cues can prime a human mind to think in a certain way. Like human minds, LLMs are associative, meaning you only need to use the correct associations to 'prime' another model to think in the same way.

# METHODOLOGY
Render the input as a distilled list of succinct statements, assertions, associations, concepts, analogies, and metaphors. The idea is to capture as much, conceptually, as possible but with as few words as possible. Write it in a way that makes sense to you, as the future audience will be another language model, not a human. Use complete sentences.`
    },
    {
      name: "Key Insights",
      description: "Extracts important insights and actionable items",
      prompt: `# IDENTITY and PURPOSE
You extract surprising, powerful, and interesting insights from text content. You are interested in insights related to the purpose and meaning of life, human flourishing, the role of technology in the future of humanity, artificial intelligence and its affect on humans, memes, learning, reading, books, continuous improvement, and similar topics. You create 15 word bullet points that capture the most important insights from the input. Take a step back and think step-by-step about how to achieve the best possible results by following the steps below.

# STEPS
- Extract 20 to 50 of the most surprising, insightful, and/or interesting ideas from the input in a section called IDEAS, and write them on a virtual whiteboard in your mind using 15 word bullets. If there are less than 50 then collect all of them. Make sure you extract at least 20.
- From those IDEAS, extract the most powerful and insightful of them and write them in a section called INSIGHTS. Make sure you extract at least 10 and up to 25.

# OUTPUT INSTRUCTIONS
- INSIGHTS are essentially higher-level IDEAS that are more abstracted and wise.
- Output the INSIGHTS section only.
- Each bullet should be about 15 words in length.
- Do not give warnings or notes; only output the requested sections.
- You use bulleted lists for output, not numbered lists.
- Do not start items with the same opening words.
- Ensure you follow ALL these instructions when creating your output.`
    },
    {
      name: "Reflections",
      description: "Generates reflection questions from the document to help explore it further",
      prompt: `# IDENTITY and PURPOSE
You extract deep, thought-provoking, and meaningful reflections from text content. You are especially focused on themes related to the human experience, such as the purpose of life, personal growth, the intersection of technology and humanity, artificial intelligence's societal impact, human potential, collective evolution, and transformative learning. Your reflections aim to provoke new ways of thinking, challenge assumptions, and provide a thoughtful synthesis of the content.

# STEPS
- Extract 3 to 5 of the most profound, thought-provoking, and/or meaningful ideas from the input in a section called REFLECTIONS.
- Each reflection should aim to explore underlying implications, connections to broader human experiences, or highlight a transformative perspective.
- Take a step back and consider the deeper significance or questions that arise from the content.

# OUTPUT INSTRUCTIONS
- The output section should be labeled as REFLECTIONS.
- Each bullet point should be between 20-25 words.
- Avoid repetition in the phrasing and ensure variety in sentence structure.
- The reflections should encourage deeper inquiry and provide a synthesis that transcends surface-level observations.
- Use bullet points, not numbered lists.
- Every bullet should be formatted as a question that elicits contemplation or a statement that offers a profound insight.
- Do not give warnings or notes; only output the requested section.`
    },
    {
      name: "Simple Summary",
      description: "Generates a small summary of the content",
      prompt: `# SYSTEM ROLE
You are a content summarization assistant that creates dense, information-rich summaries optimized for machine understanding.

Your summaries should capture key concepts with minimal words while maintaining complete, clear sentences.

# TASK
Analyze the provided content and create a summary that:
- Captures the core concepts and key information
- Uses clear, direct language
- Maintains context from any previous summaries`
    },
    {
      name: "Table of Contents",
      description: "Describes the different topics of the document",
      prompt: `# SYSTEM ROLE
You are a content analysis assistant that reads through documents and provides a Table of Contents (ToC) to help users identify what the document covers more easily.

Your ToC should capture all major topics and transitions in the content and should mention them in the order they appear.

# TASK
Analyze the provided content and create a Table of Contents:
- Captures the core topics included in the text
- Gives a small description of what is covered`
    }
  ];

  const handleSave = () => {
    // Save template logic here
    console.log("Saving podcast template...");
  };

  const handleSaveTransformation = () => {
    // Save transformation logic here
    console.log("Saving transformation...");
  };

  const handleCreateNewTransformation = () => {
    setShowNewTransformationForm(true);
    setExpandedTransformation(null); // Close any other expanded transformation
  };

  const handleSaveNewTransformation = () => {
    // Create new transformation with unique ID
    const newTransformation = {
      id: `user-${Date.now()}`,
      name: newTransformationName,
      description: newTransformationDescription,
      prompt: newTransformationPrompt
    };
    
    // Add to user transformations list
    setUserTransformations(prev => [...prev, newTransformation]);
    
    console.log("Saving new transformation...", newTransformation);
    setShowNewTransformationForm(false);
    
    // Reset form
    setNewTransformationName("New Tranformation");
    setNewTransformationCardTitle("New Transformation Title");
    setNewTransformationDescription("New Transformation Description");
    setNewTransformationPrompt("New Transformation Prompt");
  };

  const handleDeleteTransformation = (id: string) => {
    setUserTransformations(prev => prev.filter(t => t.id !== id));
    // If the deleted transformation was expanded, close it
    if (expandedTransformation === id) {
      setExpandedTransformation(null);
    }
  };

  const handleSuggestByAI = () => {
    // AI suggestion logic here
    console.log("Getting AI suggestions...");
  };

  const handleToggleExpansion = (transformationName: string) => {
    setExpandedTransformation(expandedTransformation === transformationName ? null : transformationName);
    // Set the current transformation values when expanding
    if (expandedTransformation !== transformationName) {
      setTransformationName(transformationName);
      setCardTitle(transformationName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-in-top">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full transition-all duration-200 hover:scale-110 hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/20 hover:shadow-md">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl animate-slide-in-bottom">
        <Tabs defaultValue="transformations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="transformations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Transformations</span>
              <span className="xs:hidden">Transform</span>
            </TabsTrigger>
            <TabsTrigger value="podcast-templates" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Podcast Templates</span>
              <span className="xs:hidden">Podcast</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transformations" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h2 className="text-xl sm:text-2xl font-bold">Transformations</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Transformations are prompts that can be used by the AI to create an automated output (e.g., a summary, key insights, etc.).
              </p>


              {/* Your Transformations */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold">Your Transformations</h3>
                  <Button onClick={handleCreateNewTransformation} className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span className="hidden xs:inline">Create new transformation</span>
                    <span className="xs:hidden">Create new</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {/* New Transformation Form */}
                  {showNewTransformationForm && (
                    <div className="bg-white border border-border rounded-xl">
                      {/* New Transformation Header */}
                      <div 
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        onClick={() => setShowNewTransformationForm(false)}
                      >
                        <span className="font-medium">New Tranformation</span>
                        <div className="text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* New Transformation Content */}
                      <div className="p-3 sm:p-4 border-t border-border">
                        <div className="space-y-3 sm:space-y-4">
                          {/* Transformation Name */}
                          <div className="space-y-2">
                            <Label className="text-sm">Transformation Name</Label>
                            <Input 
                              value={newTransformationName}
                              onChange={(e) => setNewTransformationName(e.target.value)}
                              placeholder="Enter transformation name"
                              className="text-sm"
                            />
                          </div>

                          {/* Card Title */}
                          <div className="space-y-2">
                            <Label className="text-sm">Card Title (this will be the title of all cards created by this transformation). ie 'Key Topics'</Label>
                            <Input 
                              value={newTransformationCardTitle}
                              onChange={(e) => setNewTransformationCardTitle(e.target.value)}
                              placeholder="Enter card title"
                              className="text-sm"
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label className="text-sm">Description (displayed as a hint in the UI so you know what you are selecting)</Label>
                            <Textarea
                              value={newTransformationDescription}
                              onChange={(e) => setNewTransformationDescription(e.target.value)}
                              rows={3}
                              placeholder="Enter description"
                              className="text-sm"
                            />
                          </div>

                          {/* Prompt */}
                          <div className="space-y-2">
                            <Label className="text-sm">Prompt</Label>
                            <Textarea
                              value={newTransformationPrompt}
                              onChange={(e) => setNewTransformationPrompt(e.target.value)}
                              rows={8}
                              className="font-mono text-xs sm:text-sm"
                              placeholder="Enter your prompt here..."
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end">
                            <Button onClick={handleSaveNewTransformation} size="sm" className="w-full sm:w-auto">
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Created Transformations */}
                  {userTransformations.map((transformation) => (
                    <div key={transformation.id} className="bg-white border border-border rounded-lg">
                      {/* Transformation Header */}
                      <div
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        onClick={() => handleToggleExpansion(transformation.id)}
                      >
                        <span className="font-medium">
                          {transformation.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTransformation(transformation.id);
                            }}
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                          <div className="text-muted-foreground">
                            <svg 
                              className={`h-4 w-4 transition-transform ${expandedTransformation === transformation.id ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedTransformation === transformation.id && (
                        <div className="p-4 border-t border-border">
                          <div className="space-y-4">
                            {/* Transformation Name */}
                            <div className="space-y-2">
                              <Label>Transformation Name</Label>
                              <Input 
                                value={transformationName}
                                onChange={(e) => setTransformationName(e.target.value)}
                                placeholder="Enter transformation name"
                              />
                            </div>

                            {/* Card Title */}
                            <div className="space-y-2">
                              <Label>Card Title (this will be the title of all cards created by this transformation). ie 'Key Topics'</Label>
                              <Input 
                                value={cardTitle}
                                onChange={(e) => setCardTitle(e.target.value)}
                                placeholder="Enter card title"
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label>Description (displayed as a hint in the UI so you know what you are selecting)</Label>
                              <Input 
                                value={transformation.description}
                                onChange={(e) => setTransformationDescription(e.target.value)}
                                placeholder="Enter description"
                              />
                            </div>

                            {/* Prompt */}
                            <div className="space-y-2">
                              <Label>Prompt</Label>
                              <Textarea
                                value={transformation.prompt}
                                onChange={(e) => setTransformationPrompt(e.target.value)}
                                rows={20}
                                className="font-mono text-sm"
                                placeholder="Enter your prompt here..."
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Default Transformations */}
                  {transformations.map((transformation, index) => (
                    <div key={index} className="bg-white border border-border rounded-lg">
                      {/* Transformation Header */}
                      <div
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        onClick={() => handleToggleExpansion(transformation.name)}
                      >
                        <span className="font-medium">
                          {transformation.name}
                          {transformation.name === "Dense Summary" && " - default"}
                        </span>
                        <div className="text-muted-foreground">
                          <svg 
                            className={`h-4 w-4 transition-transform ${expandedTransformation === transformation.name ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedTransformation === transformation.name && (
                        <div className="p-4 border-t border-border">
                          <div className="space-y-4">
                            {/* Transformation Name */}
                            <div className="space-y-2">
                              <Label>Transformation Name</Label>
                              <Input 
                                value={transformationName}
                                onChange={(e) => setTransformationName(e.target.value)}
                                placeholder="Enter transformation name"
                              />
                            </div>

                            {/* Card Title */}
                            <div className="space-y-2">
                              <Label>Card Title (this will be the title of all cards created by this transformation). ie 'Key Topics'</Label>
                              <Input 
                                value={cardTitle}
                                onChange={(e) => setCardTitle(e.target.value)}
                                placeholder="Enter card title"
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label>Description (displayed as a hint in the UI so you know what you are selecting)</Label>
                              <Input 
                                value={transformation.description}
                                onChange={(e) => setTransformationDescription(e.target.value)}
                                placeholder="Enter description"
                              />
                            </div>

                            {/* Prompt */}
                            <div className="space-y-2">
                              <Label>Prompt</Label>
                              <Textarea
                                value={transformation.prompt}
                                onChange={(e) => setTransformationPrompt(e.target.value)}
                                rows={20}
                                className="font-mono text-sm"
                                placeholder="Enter your prompt here..."
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="podcast-templates" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <CardTitle className="text-lg sm:text-xl">Podcast Templates</CardTitle>
                </div>
                <CardDescription className="text-sm">Create new Template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Template Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name" className="text-sm">Template Name</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Enter template name"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="podcast-name" className="text-sm">Podcast Name</Label>
                      <Input
                        id="podcast-name"
                        value={podcastName}
                        onChange={(e) => setPodcastName(e.target.value)}
                        placeholder="Enter podcast name"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="podcast-tagline" className="text-sm">Podcast Tagline</Label>
                    <Input
                      id="podcast-tagline"
                      value={podcastTagline}
                      onChange={(e) => setPodcastTagline(e.target.value)}
                      placeholder="Enter podcast tagline"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Roles Section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Person 1 roles</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {person1Roles.map((role) => (
                          <Badge key={role} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveRole(role, 'person1')}>
                            {role} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !person1Roles.includes(value)) {
                                handleAddRole(value, 'person1');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {roleSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddRole(suggestion, 'person1')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Person 2 roles</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {person2Roles.map((role) => (
                          <Badge key={role} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveRole(role, 'person2')}>
                            {role} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !person2Roles.includes(value)) {
                                handleAddRole(value, 'person2');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {roleSuggestions.slice(10, 20).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddRole(suggestion, 'person2')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Conversation and Engagement */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Conversation Style</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {conversationStyle.map((style) => (
                          <Badge key={style} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveStyle(style, 'conversation')}>
                            {style} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !conversationStyle.includes(value)) {
                                handleAddStyle(value, 'conversation');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {conversationStyleSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddStyle(suggestion, 'conversation')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Engagement Techniques</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {engagementTechniques.map((technique) => (
                          <Badge key={technique} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveStyle(technique, 'engagement')}>
                            {technique} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !engagementTechniques.includes(value)) {
                                handleAddStyle(value, 'engagement');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {engagementTechniqueSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddStyle(suggestion, 'engagement')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dialogue Structure</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {dialogueStructure.map((structure) => (
                          <Badge key={structure} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveStyle(structure, 'dialogue')}>
                            {structure} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !dialogueStructure.includes(value)) {
                                handleAddStyle(value, 'dialogue');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {dialogueStructureSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddStyle(suggestion, 'dialogue')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Settings */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Creativity</Label>
                      <div className="px-3">
                        <Slider
                          value={creativity}
                          onValueChange={setCreativity}
                          max={1}
                          min={0}
                          step={0.01}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0.00</span>
                          <span>{creativity[0].toFixed(2)}</span>
                          <span>1.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ending-message">Ending Message</Label>
                      <Textarea
                        id="ending-message"
                        value={endingMessage}
                        onChange={(e) => setEndingMessage(e.target.value)}
                        placeholder="Thank you for listening!"
                        rows={3}
                      />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="voice1">Voice 1</Label>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="voice1"
                          value={voice1}
                          onChange={(e) => setVoice1(e.target.value)}
                          placeholder="Enter voice name"
                        />
                        <div className="text-xs text-muted-foreground">
                          Voice names are case sensitive. Be sure to add the exact name.
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sample voices from: <a href="https://platform.openai.com/docs/guides/text-to-speech" target="_blank" rel="noopener noreferrer" className="text-primary cursor-pointer hover:underline">OpenAI</a>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="voice2">Voice 2</Label>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="voice2"
                          value={voice2}
                          onChange={(e) => setVoice2(e.target.value)}
                          placeholder="Enter voice name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your general preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">General settings will be implemented here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

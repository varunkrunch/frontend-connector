// Mock API Service for Standalone Frontend
import type { Notebook, Note, Source, Podcast } from '@/types';

// Mock data generators
const generateId = () => Math.random().toString(36).substring(7);

// Simulate async behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const STORAGE_KEYS = {
  notebooks: 'mock_notebooks',
  notes: 'mock_notes',
  sources: 'mock_sources',
  podcasts: 'mock_podcasts',
  chats: 'mock_chats',
};

// Initialize mock data
const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.notebooks)) {
    const initialNotebooks = [
      {
        id: '1',
        name: 'Machine Learning Research',
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Product Strategy 2024',
        created_at: new Date('2024-02-01').toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.notebooks, JSON.stringify(initialNotebooks));
  }

  if (!localStorage.getItem(STORAGE_KEYS.sources)) {
    const initialSources = [
      {
        id: '1',
        notebook_id: '1',
        title: 'Introduction to Neural Networks.pdf',
        source_type: 'pdf',
        content: 'Neural networks are computing systems inspired by biological neural networks...',
        url: null,
        created_at: new Date('2024-01-16').toISOString(),
      },
      {
        id: '2',
        notebook_id: '1',
        title: 'Deep Learning Tutorial',
        source_type: 'youtube',
        content: 'This video covers the fundamentals of deep learning...',
        url: 'https://youtube.com/watch?v=example',
        created_at: new Date('2024-01-17').toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.sources, JSON.stringify(initialSources));
  }

  if (!localStorage.getItem(STORAGE_KEYS.notes)) {
    const initialNotes = [
      {
        id: '1',
        notebook_id: '1',
        content: '## Key Concepts\n\n- Activation functions\n- Backpropagation\n- Gradient descent',
        created_at: new Date('2024-01-18').toISOString(),
        updated_at: new Date('2024-01-18').toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(initialNotes));
  }

  if (!localStorage.getItem(STORAGE_KEYS.podcasts)) {
    localStorage.setItem(STORAGE_KEYS.podcasts, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.chats)) {
    localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify([]));
  }
};

// Initialize on load
initializeMockData();

// Helper functions to manage local storage
const getFromStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Notebook API
export const notebookAPI = {
  list: async () => {
    await delay(300);
    return getFromStorage(STORAGE_KEYS.notebooks);
  },
  
  create: async (data: any) => {
    await delay(300);
    const notebooks = getFromStorage(STORAGE_KEYS.notebooks);
    const newNotebook = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    notebooks.push(newNotebook);
    saveToStorage(STORAGE_KEYS.notebooks, notebooks);
    return newNotebook;
  },
  
  get: async (id: string) => {
    await delay(300);
    const notebooks = getFromStorage(STORAGE_KEYS.notebooks);
    return notebooks.find((n: any) => n.id === id);
  },
  
  update: async (id: string, data: any) => {
    await delay(300);
    const notebooks = getFromStorage(STORAGE_KEYS.notebooks);
    const index = notebooks.findIndex((n: any) => n.id === id);
    if (index !== -1) {
      notebooks[index] = {
        ...notebooks[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.notebooks, notebooks);
      return notebooks[index];
    }
    throw new Error('Notebook not found');
  },
  
  delete: async (id: string) => {
    await delay(300);
    const notebooks = getFromStorage(STORAGE_KEYS.notebooks);
    const filtered = notebooks.filter((n: any) => n.id !== id);
    saveToStorage(STORAGE_KEYS.notebooks, filtered);
    return { success: true };
  },
};

// Notes API
export const notesAPI = {
  list: async (notebookId?: string) => {
    await delay(300);
    const notes = getFromStorage(STORAGE_KEYS.notes);
    if (notebookId) {
      return notes.filter((n: any) => n.notebook_id === notebookId);
    }
    return notes;
  },
  
  create: async (data: any) => {
    await delay(300);
    const notes = getFromStorage(STORAGE_KEYS.notes);
    const newNote = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    notes.push(newNote);
    saveToStorage(STORAGE_KEYS.notes, notes);
    return newNote;
  },
  
  get: async (id: string) => {
    await delay(300);
    const notes = getFromStorage(STORAGE_KEYS.notes);
    return notes.find((n: any) => n.id === id);
  },
  
  update: async (id: string, data: any) => {
    await delay(300);
    const notes = getFromStorage(STORAGE_KEYS.notes);
    const index = notes.findIndex((n: any) => n.id === id);
    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.notes, notes);
      return notes[index];
    }
    throw new Error('Note not found');
  },
  
  delete: async (id: string) => {
    await delay(300);
    const notes = getFromStorage(STORAGE_KEYS.notes);
    const filtered = notes.filter((n: any) => n.id !== id);
    saveToStorage(STORAGE_KEYS.notes, filtered);
    return { success: true };
  },
};

// Sources API
export const sourcesAPI = {
  list: async (notebookId?: string) => {
    await delay(300);
    const sources = getFromStorage(STORAGE_KEYS.sources);
    if (notebookId) {
      return sources.filter((s: any) => s.notebook_id === notebookId);
    }
    return sources;
  },
  
  upload: async (notebookId: string, file: File, type: string) => {
    await delay(500); // Simulate upload time
    const sources = getFromStorage(STORAGE_KEYS.sources);
    const newSource = {
      id: generateId(),
      notebook_id: notebookId,
      title: file.name,
      source_type: type,
      content: `Content from ${file.name}...`, // Mock content
      url: null,
      created_at: new Date().toISOString(),
    };
    sources.push(newSource);
    saveToStorage(STORAGE_KEYS.sources, sources);
    return newSource;
  },
  
  get: async (id: string) => {
    await delay(300);
    const sources = getFromStorage(STORAGE_KEYS.sources);
    return sources.find((s: any) => s.id === id);
  },
  
  delete: async (id: string) => {
    await delay(300);
    const sources = getFromStorage(STORAGE_KEYS.sources);
    const filtered = sources.filter((s: any) => s.id !== id);
    saveToStorage(STORAGE_KEYS.sources, filtered);
    return { success: true };
  },
};

// Podcasts API
export const podcastsAPI = {
  list: async (notebookId?: string) => {
    await delay(300);
    const podcasts = getFromStorage(STORAGE_KEYS.podcasts);
    if (notebookId) {
      return podcasts.filter((p: any) => p.notebook_id === notebookId);
    }
    return podcasts;
  },
  
  generate: async (data: any) => {
    await delay(2000); // Simulate generation time
    const podcasts = getFromStorage(STORAGE_KEYS.podcasts);
    const newPodcast = {
      id: generateId(),
      ...data,
      title: `Generated Podcast ${podcasts.length + 1}`,
      duration: Math.floor(Math.random() * 600) + 60, // Random duration between 1-10 minutes
      script: 'This is a mock podcast script generated from your notebook content...',
      created_at: new Date().toISOString(),
    };
    podcasts.push(newPodcast);
    saveToStorage(STORAGE_KEYS.podcasts, podcasts);
    return newPodcast;
  },
  
  get: async (id: string) => {
    await delay(300);
    const podcasts = getFromStorage(STORAGE_KEYS.podcasts);
    return podcasts.find((p: any) => p.id === id);
  },
  
  getAudio: (id: string) => {
    // Return a placeholder audio URL
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  },
  
  delete: async (id: string) => {
    await delay(300);
    const podcasts = getFromStorage(STORAGE_KEYS.podcasts);
    const filtered = podcasts.filter((p: any) => p.id !== id);
    saveToStorage(STORAGE_KEYS.podcasts, filtered);
    return { success: true };
  },
};

// Search API
export const searchAPI = {
  search: async (query: string, notebookId?: string) => {
    await delay(500);
    const results = [];
    
    // Search in notes
    const notes = getFromStorage(STORAGE_KEYS.notes);
    const matchingNotes = notes.filter((n: any) => {
      if (notebookId && n.notebook_id !== notebookId) return false;
      return n.content.toLowerCase().includes(query.toLowerCase());
    });
    
    // Search in sources
    const sources = getFromStorage(STORAGE_KEYS.sources);
    const matchingSources = sources.filter((s: any) => {
      if (notebookId && s.notebook_id !== notebookId) return false;
      return s.title.toLowerCase().includes(query.toLowerCase()) ||
             s.content.toLowerCase().includes(query.toLowerCase());
    });
    
    return {
      notes: matchingNotes,
      sources: matchingSources,
      total: matchingNotes.length + matchingSources.length,
    };
  },
};

// Models API
export const modelsAPI = {
  list: async () => {
    await delay(300);
    return [
      { id: 'gpt-4', name: 'GPT-4', type: 'chat', provider: 'OpenAI', status: 'available' as const },
      { id: 'claude-3', name: 'Claude 3', type: 'chat', provider: 'Anthropic', status: 'available' as const },
      { id: 'llama-2', name: 'Llama 2', type: 'chat', provider: 'Meta', status: 'available' as const },
    ];
  },
  
  status: async () => {
    await delay(300);
    return {
      status: 'healthy',
      models: 3,
      message: 'All models operational',
    };
  },
};

// Transformations API
export const transformationsAPI = {
  transform: async (data: any) => {
    await delay(1000);
    const { text, transformation_type } = data;
    
    // Mock transformations
    const transformations: Record<string, string> = {
      summarize: `Summary: ${text.substring(0, 100)}...`,
      translate: `Translated: ${text}`,
      simplify: `Simplified: ${text.replace(/\b\w{10,}\b/g, 'simple')}`,
      expand: `${text}\n\nAdditional context: This topic is important because...`,
    };
    
    return {
      original: text,
      transformed: transformations[transformation_type] || text,
      transformation_type,
    };
  },
};

// Chat API
export const chatAPI = {
  send: async (data: any) => {
    await delay(1000);
    const chats = getFromStorage(STORAGE_KEYS.chats);
    
    // Generate a mock response
    const responses = [
      "That's an interesting question! Based on your notebook content...",
      "According to the sources you've uploaded...",
      "I can help you understand this better. Let me explain...",
      "Great observation! Here's what I found in your materials...",
    ];
    
    const userMessage = {
      id: generateId(),
      notebook_id: data.notebook_id,
      role: 'user',
      content: data.message,
      timestamp: new Date().toISOString(),
    };
    
    const assistantMessage = {
      id: generateId(),
      notebook_id: data.notebook_id,
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
    };
    
    chats.push(userMessage, assistantMessage);
    saveToStorage(STORAGE_KEYS.chats, chats);
    
    return assistantMessage;
  },
  
  history: async (notebookId: string) => {
    await delay(300);
    const chats = getFromStorage(STORAGE_KEYS.chats);
    return chats.filter((c: any) => c.notebook_id === notebookId);
  },
};

// Health check (always returns healthy for standalone)
export const healthCheck = async () => {
  await delay(100);
  return { status: 'healthy', message: 'Standalone mode - No backend required' };
};
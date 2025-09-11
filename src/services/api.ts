// Real API Service for Frontend-Backend Integration
import type { Notebook, Note, Source, Podcast } from '@/types';

// API Configuration
const API_BASE_URL = 'http://localhost:8001';
const API_VERSION = '/api/v1';

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${API_VERSION}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultOptions.headers?.['Content-Type'];
  }

  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Notebooks API
export const notebookAPI = {
  list: async () => {
    console.log("notebookAPI.list called");
    return await apiRequest('/notebooks');
  },
  
  get: async (id: string) => {
    console.log("notebookAPI.get called with id:", id);
    return await apiRequest(`/notebooks/${id}`);
  },
  
  getByName: async (name: string) => {
    console.log("notebookAPI.getByName called with name:", name);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}`);
  },
  
  create: async (data: { name: string; description: string }) => {
    console.log("notebookAPI.create called with:", data);
    return await apiRequest('/notebooks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: Partial<Notebook>) => {
    console.log("notebookAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/notebooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("notebookAPI.delete called with id:", id);
    return await apiRequest(`/notebooks/${id}`, {
      method: 'DELETE',
    });
  },
  
  archive: async (id: string) => {
    console.log("notebookAPI.archive called with id:", id);
    return await apiRequest(`/notebooks/${id}/archive`, {
      method: 'POST',
    });
  },
  
  unarchive: async (id: string) => {
    console.log("notebookAPI.unarchive called with id:", id);
    return await apiRequest(`/notebooks/${id}/unarchive`, {
      method: 'POST',
    });
  },
  
  archiveByName: async (name: string) => {
    console.log("notebookAPI.archiveByName called with name:", name);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}/archive`, {
      method: 'POST',
    });
  },
  
  unarchiveByName: async (name: string) => {
    console.log("notebookAPI.unarchiveByName called with name:", name);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(name)}/unarchive`, {
      method: 'POST',
    });
  },
};

// Notes API
export const notesAPI = {
  list: async (notebookId?: string) => {
    console.log("notesAPI.list called with notebookId:", notebookId);
    if (notebookId) {
      return await apiRequest(`/notebooks/${notebookId}/notes`);
    }
    return await apiRequest('/notes');
  },
  
  listByNotebookName: async (notebookName: string) => {
    console.log("notesAPI.listByNotebookName called with name:", notebookName);
    return await apiRequest(`/notebooks/by-name/${encodeURIComponent(notebookName)}/notes`);
  },
  
  getByTitle: async (noteTitle: string) => {
    console.log("notesAPI.getByTitle called with title:", noteTitle);
    return await apiRequest(`/notes/by-title/${encodeURIComponent(noteTitle)}`);
  },
  
  create: async (data: { title: string; content: string; notebook_id: string }) => {
    console.log("notesAPI.create called with:", data);
    return await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  get: async (id: string) => {
    console.log("notesAPI.get called with id:", id);
    return await apiRequest(`/notes/${id}`);
  },
  
  update: async (id: string, data: any) => {
    console.log("notesAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("notesAPI.delete called with id:", id);
    return await apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sources API
export const sourcesAPI = {
  list: async (notebookId?: string) => {
    console.log("sourcesAPI.list called with notebookId:", notebookId);
    if (notebookId) {
      const response = await apiRequest(`/notebooks/${notebookId}/sources`);
      // Backend returns SourceListResponse with sources array
      return response.sources || response;
    }
    return await apiRequest('/sources');
  },
  
  listByNotebookName: async (notebookName: string) => {
    console.log("🔍 sourcesAPI.listByNotebookName called with name:", notebookName);
    const url = `/notebooks/by-name/${encodeURIComponent(notebookName)}/sources`;
    console.log("🌐 sourcesAPI: Making request to:", url);
    const response = await apiRequest(url);
    console.log("📊 sourcesAPI: Raw response:", response);
    console.log("📊 sourcesAPI: Response type:", typeof response, "Array?", Array.isArray(response));
    console.log("📊 sourcesAPI: Response.sources:", response.sources);
    // Backend returns SourceListResponse with sources array
    const result = response.sources || response;
    console.log("✅ sourcesAPI: Returning:", result);
    return result;
  },
  
  get: async (id: string) => {
    console.log("sourcesAPI.get called with id:", id);
    return await apiRequest(`/sources/${encodeURIComponent(id)}`);
  },
  
  getByTitle: async (title: string) => {
    console.log("sourcesAPI.getByTitle called with title:", title);
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}`);
  },
  
  create: async (notebookId: string, data: FormData) => {
    console.log("sourcesAPI.create called with notebookId:", notebookId);
    const url = `${API_BASE_URL}${API_VERSION}/notebooks/${notebookId}/sources`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: data, // FormData doesn't need Content-Type header
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Source upload failed:`, error);
      throw error;
    }
  },
  
  createByNotebookName: async (notebookName: string, data: FormData) => {
    console.log("sourcesAPI.createByNotebookName called with name:", notebookName);
    const url = `${API_BASE_URL}${API_VERSION}/notebooks/by-name/${encodeURIComponent(notebookName)}/sources`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Source upload failed:`, error);
      throw error;
    }
  },
  
  update: async (id: string, data: Partial<Source>) => {
    console.log("sourcesAPI.update called with id:", id, "data:", data);
    return await apiRequest(`/sources/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  updateByTitle: async (title: string, data: Partial<Source>) => {
    console.log("sourcesAPI.updateByTitle called with title:", title, "data:", data);
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async (id: string) => {
    console.log("sourcesAPI.delete called with id:", id);
    return await apiRequest(`/sources/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  
  deleteByTitle: async (title: string) => {
    console.log("sourcesAPI.deleteByTitle called with title:", title);
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}`, {
      method: 'DELETE',
    });
  },
  
  runTransformations: async (id: string, transformationNames: string, llmId?: string) => {
    console.log("sourcesAPI.runTransformations called with id:", id, "transformations:", transformationNames);
    const params = new URLSearchParams({ transformation_names: transformationNames });
    if (llmId) params.append('llm_id', llmId);
    
    return await apiRequest(`/sources/${encodeURIComponent(id)}/run-transformations?${params.toString()}`, {
      method: 'POST',
    });
  },
  
  runTransformationsByTitle: async (title: string, transformationNames: string, llmId?: string) => {
    console.log("sourcesAPI.runTransformationsByTitle called with title:", title, "transformations:", transformationNames);
    const params = new URLSearchParams({ transformation_names: transformationNames });
    if (llmId) params.append('llm_id', llmId);
    
    return await apiRequest(`/sources/by-title/${encodeURIComponent(title)}/run-transformations?${params.toString()}`, {
      method: 'POST',
    });
  },
  
  generateTitle: async (id: string) => {
    console.log("sourcesAPI.generateTitle called with id:", id);
    return await apiRequest(`/sources/${encodeURIComponent(id)}/generate-title`, {
      method: 'POST',
    });
  },
};

// Podcasts API
export const podcastsAPI = {
  list: async (notebookId?: string) => {
    console.log("podcastsAPI.list called with notebookId:", notebookId);
    if (notebookId) {
      return await apiRequest(`/notebooks/${notebookId}/podcasts`);
    }
    return await apiRequest('/podcasts/episodes');
  },
  
  generate: async (data: { notebook_id: string; title?: string; description?: string }) => {
    console.log("podcastsAPI.generate called with:", data);
    return await apiRequest('/podcasts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  get: async (id: string) => {
    console.log("podcastsAPI.get called with id:", id);
    return await apiRequest(`/podcasts/${id}`);
  },
  
  getAudio: (id: string) => {
    return `${API_BASE_URL}${API_VERSION}/podcasts/${id}/audio`;
  },
  
  delete: async (id: string) => {
    console.log("podcastsAPI.delete called with id:", id);
    return await apiRequest(`/podcasts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Search API
export const searchAPI = {
  search: async (query: string, notebookId?: string) => {
    console.log("searchAPI.search called with query:", query, "notebookId:", notebookId);
    const params = new URLSearchParams({ q: query });
    if (notebookId) params.append('notebook_id', notebookId);
    
    return await apiRequest(`/search?${params.toString()}`);
  },
};

// Models API
export const modelsAPI = {
  list: async () => {
    console.log("modelsAPI.list called");
    return await apiRequest('/models');
  },
  
  getProviders: async () => {
    console.log("modelsAPI.getProviders called");
    return await apiRequest('/models/providers');
  },
};

// Transformations API
export const transformationsAPI = {
  list: async () => {
    console.log("transformationsAPI.list called");
    return await apiRequest('/transformations');
  },
  
  transform: async (data: { text: string; transformation_type: string }) => {
    console.log("transformationsAPI.transform called with:", data);
    return await apiRequest('/transformations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (data: { message: string; notebook_id: string; session_id?: string }) => {
    console.log("chatAPI.sendMessage called with:", data);
    return await apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getHistory: async (notebookId: string, sessionId?: string) => {
    console.log("chatAPI.getHistory called with notebookId:", notebookId, "sessionId:", sessionId);
    const params = new URLSearchParams({ notebook_id: notebookId });
    if (sessionId) params.append('session_id', sessionId);
    
    return await apiRequest(`/chat/history?${params.toString()}`);
  },
};

// Serper API for Google Search
export const serperAPI = {
  getOptions: async () => {
    console.log("serperAPI.getOptions called");
    return await apiRequest('/serper/options');
  },
  
  search: async (query: string, options?: {
    num_results?: number;
    country?: string;
    language?: string;
  }) => {
    console.log("serperAPI.search called with query:", query, "options:", options);
    const params = new URLSearchParams({ query });
    if (options?.num_results) params.append('num_results', options.num_results.toString());
    if (options?.country) params.append('country', options.country);
    if (options?.language) params.append('language', options.language);
    
    const endpoint = `/serper/search?${params.toString()}`;
    console.log("🌐 Making request to endpoint:", endpoint);
    console.log("🌐 Full URL would be:", `${API_BASE_URL}${API_VERSION}${endpoint}`);
    
    try {
      const result = await apiRequest(endpoint);
      console.log("✅ serperAPI.search successful:", result);
      return result;
    } catch (error) {
      console.error("❌ serperAPI.search failed:", error);
      throw error;
    }
  },
};
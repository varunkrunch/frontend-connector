// API Service for Open Notebook Backend
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Notebook API
export const notebookAPI = {
  list: () => apiCall('/api/v1/notebooks'),
  create: (data: any) => apiCall('/api/v1/notebooks', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => apiCall(`/api/v1/notebooks/${id}`),
  update: (id: string, data: any) => apiCall(`/api/v1/notebooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/api/v1/notebooks/${id}`, { method: 'DELETE' }),
};

// Notes API
export const notesAPI = {
  list: (notebookId?: string) => apiCall(`/api/v1/notes${notebookId ? `?notebook_id=${notebookId}` : ''}`),
  create: (data: any) => apiCall('/api/v1/notes', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => apiCall(`/api/v1/notes/${id}`),
  update: (id: string, data: any) => apiCall(`/api/v1/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/api/v1/notes/${id}`, { method: 'DELETE' }),
};

// Sources API
export const sourcesAPI = {
  list: (notebookId?: string) => apiCall(`/api/v1/sources${notebookId ? `?notebook_id=${notebookId}` : ''}`),
  upload: async (notebookId: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('notebook_id', notebookId);
    formData.append('source_type', type);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/sources`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  get: (id: string) => apiCall(`/api/v1/sources/${id}`),
  delete: (id: string) => apiCall(`/api/v1/sources/${id}`, { method: 'DELETE' }),
};

// Podcasts API
export const podcastsAPI = {
  list: (notebookId?: string) => apiCall(`/api/v1/podcasts${notebookId ? `?notebook_id=${notebookId}` : ''}`),
  generate: (data: any) => apiCall('/api/v1/podcasts/generate', { method: 'POST', body: JSON.stringify(data) }),
  get: (id: string) => apiCall(`/api/v1/podcasts/${id}`),
  getAudio: (id: string) => `${API_BASE_URL}/api/v1/podcasts/${id}/audio`,
  delete: (id: string) => apiCall(`/api/v1/podcasts/${id}`, { method: 'DELETE' }),
};

// Search API
export const searchAPI = {
  search: (query: string, notebookId?: string) => 
    apiCall(`/api/v1/search?q=${encodeURIComponent(query)}${notebookId ? `&notebook_id=${notebookId}` : ''}`),
};

// Models API
export const modelsAPI = {
  list: () => apiCall('/api/v1/models'),
  status: () => apiCall('/api/v1/models/status'),
};

// Transformations API
export const transformationsAPI = {
  transform: (data: any) => apiCall('/api/v1/transformations', { method: 'POST', body: JSON.stringify(data) }),
};

// Chat API
export const chatAPI = {
  send: (data: any) => apiCall('/api/v1/chat', { method: 'POST', body: JSON.stringify(data) }),
  history: (notebookId: string) => apiCall(`/api/v1/chat/history?notebook_id=${notebookId}`),
};

// Health check
export const healthCheck = () => apiCall('/');
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== AUTH API =====
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  }
};

// ===== DOCUMENTS API =====
export const documentAPI = {
  // Récupérer tous les documents
  getAll: async (page = 0, size = 10, search = '') => {
    try {
      const response = await api.get('/documents', { params: { page, size, search } });
      return response.data;
    } catch (error) {
      return { success: false, documents: [], total: 0 };
    }
  },

  // Récupérer un document par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },

  // Créer un document
  create: async (documentData) => {
    try {
      const response = await api.post('/documents', documentData);
      return response.data;
    } catch (error) {
      return { success: false, message: "Erreur lors de la création" };
    }
  },

  // Mettre à jour un document
  update: async (id, documentData) => {
    try {
      const response = await api.put(`/documents/${id}`, documentData);
      return response.data;
    } catch (error) {
      return { success: false, message: "Erreur lors de la mise à jour" };
    }
  },

  // Supprimer un document
  delete: async (id) => {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur delete:', error);
      return { success: false, message: 'Erreur lors de la suppression' };
    }
  },

  // Upload de fichier
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: "Erreur lors de l'upload" };
    }
  },

  // Incrémenter les téléchargements
  incrementDownload: async (id) => {
    try {
      const response = await api.post(`/documents/${id}/download`);
      return response.data;
    } catch (error) {
      return { success: false };
    }
  }
};

// ===== STATS API =====
export const statsAPI = {
  get: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      return { success: false, stats: {} };
    }
  }
};

// ===== USERS API =====
export const usersAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      return { success: false, data: [] };
    }
  }
};

// Export par défaut
export default {
  authAPI,
  documentAPI,
  statsAPI,
  usersAPI
};
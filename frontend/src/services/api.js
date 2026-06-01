import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

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

export const documentAPI = {
    getAll: async (page = 0, size = 10, search = '', serviceId = null) => {
        try {
            const params = { page, size, search };
            if (serviceId) params.service_id = serviceId;
            const response = await api.get('/documents', { params });
            return response.data;
        } catch (error) {
            return { success: false, documents: [], total: 0 };
        }
    },
    create: async (documentData) => {
        try {
            const response = await api.post('/documents', documentData);
            return response.data;
        } catch (error) {
            return { success: false, message: "Erreur lors de la création" };
        }
    },
    delete: async (id) => {
        try {
            const response = await api.delete(`/documents/${id}`);
            return response.data;
        } catch (error) {
            return { success: false, message: 'Erreur lors de la suppression' };
        }
    },
    upload: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${API_URL}/documents/upload`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Erreur lors de l'upload" };
        }
    }
};

export default { authAPI, documentAPI };
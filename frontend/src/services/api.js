import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Use relative path to leverage Vite proxy or explicit URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-logout if the 401 comes from a login attempt
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (email, password) =>
    api.post('/auth/register', { email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
}

// Documents API
export const documentsAPI = {
  upload: (files) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  getAll: () =>
    api.get('/documents'),
  
  getById: (id) =>
    api.get(`/documents/${id}`),
  
  delete: (id) =>
    api.delete(`/documents/${id}`),
  
  getSummary: (id) =>
    api.get(`/documents/${id}/summary`),
  
  getStats: () =>
    api.get('/documents/stats'),
}

// Chat API
export const chatAPI = {
  query: (question, session_id = null) =>
    api.post('/chat/query', { question, session_id }),
  
  getHistory: (limit = 50) =>
    api.get('/chat/history', { params: { limit } }),
  
  getSessions: () =>
    api.get('/chat/sessions'),
  
  getSessionHistory: (session_id) =>
    api.get(`/chat/sessions/${session_id}`),
  
  clearHistory: () =>
    api.delete('/chat/history'),
}

export default api

import axios from 'axios';
import type {
  User,
  LicensePlate,
  UserCollection,
  Statistics,
  LeaderboardEntry,
  SearchResult,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (username: string, password: string): Promise<User> => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// License Plate API
export const licensePlateApi = {
  getAll: async (): Promise<LicensePlate[]> => {
    const response = await api.get('/license-plates');
    return response.data;
  },

  search: async (query: string, page?: number, limit?: number): Promise<SearchResult | LicensePlate[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (page !== undefined && limit !== undefined) {
      params.append('page', page.toString());
      params.append('limit', limit.toString());
    }
    const response = await api.get(`/license-plates/search?${params.toString()}`);
    // Backend always returns SearchResult now, even without pagination params
    // If pagination params are provided, return SearchResult, otherwise return the data array for backward compatibility
    if (page !== undefined && limit !== undefined) {
      return response.data as SearchResult;
    }
    // For backward compatibility, return SearchResult when no pagination params
    // The Dashboard can extract both data and total from it
    return response.data as SearchResult;
  },
};

// Collection API
export const collectionApi = {
  getUserCollection: async (): Promise<UserCollection[]> => {
    const response = await api.get('/collection');
    return response.data;
  },

  addToCollection: async (
    licensePlateId: string,
    spottedDate?: string
  ): Promise<UserCollection> => {
    const response = await api.post('/collection', {
      licensePlateId,
      spottedDate: spottedDate || new Date().toISOString().split('T')[0],
    });
    return response.data;
  },

  removeFromCollection: async (collectionId: string): Promise<void> => {
    await api.delete(`/collection/${collectionId}`);
  },
};

// Statistics API
export const statisticsApi = {
  getUserStatistics: async (): Promise<Statistics> => {
    const response = await api.get('/statistics');
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/statistics/leaderboard');
    return response.data;
  },
};

export default api;


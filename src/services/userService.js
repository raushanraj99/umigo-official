import axios from 'axios';
import { getToken } from './authService';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User API functions
export const userService = {
  // Get current user profile
//   getCurrentUser: async () => {
//     try {
//       const response = await api.get('/api/user/me');
//       return response.data.user;
//     } catch (error) {
//       console.error('Error fetching current user:', error);
//       throw error;
//     }
//   },

//   // Update user profile
//   updateProfile: async (userData) => {
//     try {
//       const response = await api.put('/api/user/update', userData);
//       return response.data;
//     } catch (error) {
//       console.error('Error updating user profile:', error);
//       throw error;
//     }
//   },

  // Update glow mode
//   updateGlowMode: async (glowMode) => {
//     try {
//       const response = await api.put('/api/user/glow', { glow_mode: glowMode });
//       return response.data;
//     } catch (error) {
//       console.error('Error updating glow mode:', error);
//       throw error;
//     }
//   },

  // Get users with glow mode enabled
//   getGlowUsers: async () => {
//     try {
//       const response = await api.get('/api/user/glow');
//       return response.data.users;
//     } catch (error) {
//       console.error('Error fetching glow users:', error);
//       throw error;
//     }
//   },

  // Get other user by ID
  getOtherUser: async (userId) => {
    try {
      const response = await api.get(`/api/user/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching other user:', error);
      throw error;
    }
  },
};

export default userService;

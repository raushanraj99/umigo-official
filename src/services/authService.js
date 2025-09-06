import axios from 'axios';

// Create Axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Token Management
const TOKEN_KEY = 'jwtToken';

export const setToken = (token) => {
  console.log("token ", token)
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Request interceptor to automatically attach JWT token
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

// Response interceptor for error handling and token management
api.interceptors.response.use(
  (response) => {
    // Return only the data payload for successful responses
    return response.data;
  },
  (error) => {
    // Handle token expiration or authentication errors
    if (error.response?.status === 401) {
      removeToken();
      // Optionally redirect to login page or show auth error
      console.log('Token expired or invalid. Please log in again.');
    }

    // Extract and standardize error messages
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    });

    // Return standardized error object
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      originalError: error,
    });
  }
);

// Authentication API methods
export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      setToken(response.token);
    }
    return response;
    //   try { 
    // } catch (error) {
    //   throw error;
    //   }
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      setToken(response.token);
    }
    return response;
    // try {
    // } catch (error) {
    //   throw error;
    // }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  // Get current user profile
  getProfile: async () => {
    const token = getToken();
    return await api.get("/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // try {
    // } catch (error) {
    //   throw error;
    // }
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    if (response.token) {
      setToken(response.token);
    }
    return response;
    //   try {
    // } catch (error) {
    //     throw error;
    //   }
  },
};

// User API methods
export const userAPI = {
  updateProfile: async (userData) => {
    console.log("userdata : ",userData);
    return await api.put('/api/user/me', userData);
    //   try {
    // } catch (error) {
    //   throw error;
    //   }
  },
  // Update user profile

  // Get user by ID
  getUser: async (userId) => {
    return await api.get(`/users/${userId}`);
    //   try {
    // } catch (error) {
    //     throw error;
    //   }
  },
};

// Events API methods
export const eventsAPI = {
  // Get all events
  getEvents: async (params = {}) => {
    return await api.get('/events', { params });
    //   try {
    // } catch (error) {
    //     throw error;
    //   }
  },

  // Get single event
  getEvent: async (eventId) => {
    return await api.get(`/events/${eventId}`);
    //   try {
    // } catch (error) {
    //     throw error;
    //   }
  },

  // Create new event
  createEvent: async (eventData) => {
    return await api.post('/events', eventData);
    //   try {
    // } catch (error) {
    //     throw error;
    //   }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    return await api.put(`/events/${eventId}`, eventData);
    // try {
    // } catch (error) {
    //   throw error;
    // }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    return await api.delete(`/events/${eventId}`);
    //   try {
    // } catch (error) {
    //     throw error;
    //   }
  },
};

// Export the configured axios instance for direct use if needed
export default api; 
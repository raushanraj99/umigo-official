import axios from 'axios';

// Create Axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Response data with token and user info
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.token) {
        setToken(response.token);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email
   * @param {string} userData.name - User's name
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Response data with token and user info
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.token) {
        setToken(response.token);
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/me');
      return response.user; // Return only the user object
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.token) {
        setToken(response.token);
      }
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      removeToken();
      throw error;
    }
  },
};

/**
 * User API methods
 */
export const userAPI = {
  /**
   * Update current user profile
   * @param {Object} userData - Updated user data
   * @param {string} [userData.name] - Updated name
   * @param {string} [userData.bio] - Updated bio
   * @param {string} [userData.phone_no] - Updated phone number
   * @returns {Promise<Object>} Update result
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/user/update', userData);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID to fetch
   * @returns {Promise<Object>} User data
   */
  getUser: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get users with glow mode enabled
   * @returns {Promise<Array>} List of users with glow mode enabled
   */
  getGlowUsers: async () => {
    try {
      const response = await api.get('/api/user/glow');
      return response.users || [];
    } catch (error) {
      console.error('Error fetching glow users:', error);
      throw error;
    }
  },

  /**
   * Update user's glow mode status
   * @param {boolean} glowMode - Whether to enable or disable glow mode
   * @returns {Promise<Object>} Update result
   */
  updateGlowMode: async (glowMode) => {
    try {
      const response = await api.put('/api/user/glow', { glow_mode: glowMode });
      return response;
    } catch (error) {
      console.error('Error updating glow mode:', error);
      throw error;
    }
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
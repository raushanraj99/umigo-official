import api from './authService';

/**
 * Service for handling all hangout-related API calls
 */

const hangoutService = {
  /**
   * Fetches a paginated list of hangouts with optional filters
   * @param {Object} filters - Filter criteria (status, tags, limit, offset)
   * @returns {Promise<Object>} Response containing hangouts and pagination info
   */
  getHangouts: async (filters = {}) => {
    try {
      const response = await api.get('/api/hangouts', { params: filters });
      console.log("hangout response : ",response);
      return response.data;
    } catch (error) {
      console.error('Error fetching hangouts:', error);
      throw error;
    }
  },

  /**
   * Creates a new hangout
   * @param {Object} hangoutData - Hangout details (title, description, location, etc.)
   * @returns {Promise<Object>} Created hangout data
   */
  createHangout: async (hangoutData) => {
    try {
      const response = await api.post('/api/hangouts', hangoutData);
      console.log("hangout response : ",response);
      return response.data;
    } catch (error) {
      console.error('Error creating hangout:', error);
      throw error;
    }
  },

  /**
   * Fetches details of a specific hangout
   * @param {string} hangoutId - ID of the hangout to fetch
   * @returns {Promise<Object>} Hangout details
   */
  getHangoutDetails: async (hangoutId) => {
    try {
      const response = await api.get(`/api/hangouts/${hangoutId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hangout details:', error);
      throw error;
    }
  },

  /**
   * Updates an existing hangout
   * @param {string} hangoutId - ID of the hangout to update
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated hangout data
   */
  updateHangout: async (hangoutId, updateData) => {
    try {
      const response = await api.put(`/api/hangouts/${hangoutId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating hangout:', error);
      throw error;
    }
  },

  /**
   * Deletes a hangout
   * @param {string} hangoutId - ID of the hangout to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteHangout: async (hangoutId) => {
    try {
      const response = await api.delete(`/api/hangouts/${hangoutId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hangout:', error);
      throw error;
    }
  },

  /**
   * Requests to join a hangout
   * @param {string} hangoutId - ID of the hangout to join
   * @returns {Promise<Object>} Join request details
   */
  joinHangout: async (hangoutId) => {
    try {
      const response = await api.post(`/api/hangouts/${hangoutId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining hangout:', error);
      throw error;
    }
  },

  /**
   * Fetches join requests for a hangout (host only)
   * @param {string} hangoutId - ID of the hangout
   * @returns {Promise<Object>} List of join requests
   */
  getJoinRequests: async (hangoutId) => {
    try {
      const response = await api.get(`/api/hangouts/${hangoutId}/requests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching join requests:', error);
      throw error;
    }
  },

  /**
   * Approves or rejects a join request (host only)
   * @param {string} hangoutId - ID of the hangout
   * @param {string} requestId - ID of the join request
   * @param {string} status - New status ('approved' or 'rejected')
   * @returns {Promise<Object>} Updated request details
   */
  updateJoinRequest: async (hangoutId, requestId, status) => {
    try {
      const response = await api.put(
        `/api/hangouts/${hangoutId}/requests/${requestId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating join request:', error);
      throw error;
    }
  },

  /**
   * Fetches hangouts hosted by a specific user
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} List of hosted hangouts
   */
  getUserHostedHangouts: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/hangouts/hosted`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hosted hangouts:', error);
      throw error;
    }
  },

  /**
   * Fetches hangouts that a user has joined
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} List of joined hangouts
   */
  getUserJoinedHangouts: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/hangouts/joined`);
      return response.data;
    } catch (error) {
      console.error('Error fetching joined hangouts:', error);
      throw error;
    }
  },
};

export default hangoutService;

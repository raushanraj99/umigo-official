import api from './authService';

/**
 * @typedef {Object} User
 * @property {string} user_id - Unique identifier for the user
 * @property {string} name - User's display name
 * @property {string} email - User's email address
 * @property {string} [image_url] - URL to user's profile image
 * @property {string} [role] - User's role (e.g., 'user', 'admin')
 */

/**
 * @typedef {Object} HangoutParticipant
 * @property {string} hangout_id - ID of the hangout
 * @property {string} user_id - ID of the participant
 * @property {User} user - User details of the participant
 * @property {number} joined_at - Timestamp when user joined
 */

/**
 * @typedef {Object} JoinRequest
 * @property {string} id - Unique identifier for the join request
 * @property {string} hangout_id - ID of the hangout
 * @property {string} user_id - ID of the requesting user
 * @property {string} status - Request status ('pending', 'approved', 'rejected')
 * @property {User} user - User details of the requester
 * @property {Object} hangout - Basic hangout details
 * @property {string} hangout.id - Hangout ID
 * @property {string} hangout.title - Hangout title
 * @property {number} created_at - Timestamp when request was created
 * @property {number} updated_at - Timestamp when request was last updated
 */

/**
 * @typedef {Object} Hangout
 * @property {string} id - Unique identifier for the hangout
 * @property {string} title - Title of the hangout
 * @property {string} [description] - Detailed description
 * @property {string} host_id - ID of the user who created the hangout
 * @property {string} [location] - Geographic location (WKT or GeoJSON format)
 * @property {string} [address] - Human-readable address
 * @property {string[]} [tags] - Array of tags for categorization
 * @property {string} start_time - ISO 8601 datetime when hangout starts
 * @property {string} [end_time] - ISO 8601 datetime when hangout ends
 * @property {'active'|'cancelled'|'completed'} status - Current status
 * @property {number} max_participants - Maximum number of participants allowed
 * @property {boolean} is_public - Whether the hangout is publicly visible
 * @property {number} created_at - Unix timestamp of creation
 * @property {number} [updated_at] - Unix timestamp of last update
 * @property {number} [deleted_at] - Unix timestamp of soft deletion
 * @property {User} [host] - User details of the host (computed)
 * @property {HangoutParticipant[]} [participants] - List of participants (computed)
 * @property {JoinRequest[]} [join_requests] - List of join requests (host only)
 * @property {number} [participant_count] - Number of participants (computed)
 * @property {boolean} [is_host] - Whether current user is the host (computed)
 * @property {boolean} [can_join] - Whether current user can join (computed)
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Hangout[]} hangouts - Array of hangout objects
 * @property {number} total - Total number of hangouts matching the query
 * @property {number} limit - Number of results per page
 * @property {number} offset - Number of results skipped
 * @property {boolean} has_more - Whether there are more results available
 */

/**
 * Service for handling all hangout-related API calls
 */
const hangoutService = {
  /**
   * Fetches a paginated list of hangouts with optional filtering
   * @param {Object} [filters] - Filter criteria
   * @param {'active'|'cancelled'|'completed'} [filters.status] - Filter by status
   * @param {string} [filters.tags] - Comma-separated list of tags to filter by
   * @param {number} [filters.limit=20] - Number of results per page (max 100)
   * @param {number} [filters.offset=0] - Number of results to skip
   * @returns {Promise<PaginatedResponse>} Paginated list of hangouts
   */
  getHangouts: async (filters = {}) => {
    try {
      // Ensure limit doesn't exceed maximum
      const safeFilters = {
        ...filters,
        limit: Math.min(parseInt(filters.limit) || 20, 100)
      };

      const response = await api.get('/api/hangouts', { 
        params: safeFilters,
        paramsSerializer: params => {
          // Handle array parameters like tags
          return Object.entries(params)
            .filter(([_, value]) => value != null && value !== '')
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}=${value.join(',')}`;
              }
              return `${key}=${encodeURIComponent(value)}`;
            })
            .join('&');
        }
      });
      
      // Ensure we always return a consistent structure
      if (response && response) {
        return response;
      }
      
      return { hangouts: [], total: 0, limit: safeFilters.limit, offset: safeFilters.offset || 0, hasMore: false };
      
    } catch (error) {
      console.error('Error fetching hangouts:', error);
      
      // Return empty results on error to prevent UI breaking
      return { 
        hangouts: [], 
        total: 0, 
        limit: filters.limit || 20, 
        offset: filters.offset || 0, 
        hasMore: false,
        error: error.response?.data?.message || 'Failed to fetch hangouts'
      };
    }
  },

  /**
   * Creates a new hangout
   * @param {Object} hangoutData - Hangout details
   * @param {string} hangoutData.title - Title of the hangout (1-100 chars)
   * @param {string} [hangoutData.description] - Detailed description (max 500 chars)
   * @param {string} [hangoutData.location] - Geographic location (WKT or GeoJSON)
   * @param {string} [hangoutData.address] - Human-readable address (max 200 chars)
   * @param {string[]} [hangoutData.tags] - Array of tags (max 20)
   * @param {string} hangoutData.start_time - ISO 8601 datetime (must be in future)
   * @param {string} [hangoutData.end_time] - ISO 8601 datetime (must be after start_time)
   * @param {number} [hangoutData.max_participants=10] - Max participants (1-100)
   * @param {boolean} [hangoutData.is_public=true] - Whether hangout is public
   * @returns {Promise<{message: string, hangout_id: string}>} Creation result
   */
  createHangout: async (hangoutData) => {
    try {
      const requiredFields = ['title', 'start_time'];
      const missingFields = requiredFields.filter(field => !hangoutData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await api.post('/api/hangouts', {
        ...hangoutData,
        tags: Array.isArray(hangoutData.tags) ? hangoutData.tags : []
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating hangout:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetches details of a specific hangout
   * @param {string} hangoutId - ID of the hangout to fetch
   * @returns {Promise<Hangout>} Hangout details
   */
  getHangoutDetails: async (hangoutId) => {
    try {
      if (!hangoutId) {
        throw new Error('Hangout ID is required');
      }

      const response = await api.get(`/api/hangouts/${hangoutId}`);
      console.log("hangout response data:", response);
      return response;
    } catch (error) {
      console.error('Error fetching hangout details:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Updates an existing hangout (host only)
   * @param {string} hangoutId - ID of the hangout to update
   * @param {Object} updateData - Fields to update
   * @param {string} [updateData.title] - New title
   * @param {string} [updateData.description] - New description
   * @param {string} [updateData.status] - New status ('active', 'cancelled', 'completed')
   * @param {number} [updateData.max_participants] - New maximum participants
   * @returns {Promise<{message: string, hangout_id: string}>} Update result
   */
  updateHangout: async (hangoutId, updateData) => {
    try {
      if (!hangoutId) {
        throw new Error('Hangout ID is required');
      }
      
      const newData = {
        title: updateData.title,
        description: updateData.description,
        status: updateData.status,
        max_participants: updateData.max_participants
      };
   
      const response = await api.put(`/api/hangouts/${hangoutId}`, newData);

      return response.data;
    } catch (error) {
      console.error('Error updating hangout:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Deletes a hangout (host only, soft delete)
   * @param {string} hangoutId - ID of the hangout to delete
   * @returns {Promise<{message: string, hangout_id: string}>} Deletion result
   */
  deleteHangout: async (hangoutId) => {
    try {
      if (!hangoutId) {
        throw new Error('Hangout ID is required');
      }

      const response = await api.delete(`/api/hangouts/${hangoutId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hangout:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Requests to join a hangout
   * @param {string} hangoutId - ID of the hangout to join
   * @returns {Promise<{message: string, request_id: string, hangout_id: string}>} Join request result
   */
  joinHangout: async (hangoutId) => {
    try {
      if (!hangoutId) {
        throw new Error('Hangout ID is required');
      }

      const response = await api.post(`/api/hangouts/${hangoutId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining hangout:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetches join requests for a hangout (host only)
   * @param {string} hangoutId - ID of the hangout
   * @returns {Promise<{join_requests: JoinRequest[], hangout_id: string}>} List of join requests
   */
  getJoinRequests: async (hangoutId) => {
    try {
      if (!hangoutId) {
        throw new Error('Hangout ID is required');
      }

      const response = await api.get(`/api/hangouts/${hangoutId}/requests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching join requests:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Approves or rejects a join request (host only)
   * @param {string} hangoutId - ID of the hangout
   * @param {string} requestId - ID of the join request
   * @param {'approved'|'rejected'} status - New status for the request
   * @returns {Promise<{message: string, request_id: string, hangout_id: string, status: string}>} Update result
   */
  updateJoinRequest: async (hangoutId, requestId, status) => {
    try {
      if (!hangoutId || !requestId) {
        throw new Error('Hangout ID and Request ID are required');
      }
      if (status !== 'approved' && status !== 'rejected') {
        throw new Error("Status must be either 'approved' or 'rejected'");
      }

      const response = await api.patch(
        `/api/hangouts/${hangoutId}/requests/${requestId}`,
        { status }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating join request:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetches hangouts hosted by a specific user
   * @param {string} userId - ID of the user
   * @returns {Promise<{hangouts: Array<{id: string, title: string, status: string, start_time: string, created_at: number}>, user_id: string}>} List of hosted hangouts
   */
  getUserHostedHangouts: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await api.get(`/api/hangouts/user/${userId}/hosted`);
      return response;
    } catch (error) {
      console.error('Error fetching hosted hangouts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetches hangouts that a user has joined
   * @param {string} userId - ID of the user
   * @returns {Promise<{hangouts: Array<{id: string, title: string, status: string, start_time: string, host: User}>, user_id: string}>} List of joined hangouts
   */
  getUserJoinedHangouts: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await api.get(`/api/hangouts/users/${userId}/joined`);
      return response.data;
    } catch (error) {
      console.error('Error fetching joined hangouts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetches hangouts near a specific location
   * @param {Object} location - Location coordinates
   * @param {number} location.latitude - Latitude of the location
   * @param {number} location.longitude - Longitude of the location
   * @param {number} [radius=5000] - Search radius in meters (default: 5000m / 5km)
   * @param {Object} [filters] - Additional filters (status, tags, etc.)
   * @returns {Promise<PaginatedResponse>} Paginated list of nearby hangouts
   */
  getNearbyHangouts: async ({ latitude, longitude }, radius = 5000, filters = {}) => {
    try {
      if (latitude === undefined || longitude === undefined) {
        throw new Error('Latitude and longitude are required');
      }

      const response = await api.get('/api/hangouts/nearby', {
        params: {
          lat: latitude,
          lng: longitude,
          radius,
          ...filters
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching nearby hangouts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Fetches all plan requests (join requests) for the current user's hosted hangouts
   * This combines data from multiple hangouts to show all pending requests in one place
   * @returns {Promise<Array>} Array of plan requests in the format expected by Profile.jsx
   */
  getPlanRequests: async () => {
    try {
      // First get current user information
      const currentUserResponse = await api.get('/api/user/me');
      const userId = currentUserResponse.user?.user_id || currentUserResponse.user?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      // Get all hangouts hosted by the current user
      const hostedHangoutsResponse = await api.get(`/api/hangouts/user/${userId}/hosted`);

      // Handle case where user doesn't have hosted hangouts yet
      if (!hostedHangoutsResponse?.hangouts || !Array.isArray(hostedHangoutsResponse.hangouts)) {
        return [];
      }

      // For each hosted hangout, fetch join requests
      const planRequests = [];

      for (const hangout of hostedHangoutsResponse.hangouts) {
        if (hangout.status === 'active') {
          try {
            // Use the correct API endpoint: GET /api/hangouts/:id/requests
            const joinRequestsResponse = await api.get(`/api/hangouts/${hangout.id}/requests`);

            if (joinRequestsResponse?.join_requests && Array.isArray(joinRequestsResponse.join_requests)) {
              // Transform join requests to plan requests format
              const transformedRequests = joinRequestsResponse.join_requests
                .filter(request => request.status === 'pending' || request.status === 'approved')
                .map(request => ({
                  id: request.id,
                  title: request.hangout?.title || hangout.title,
                  location: hangout.address || 'Location not specified',
                  time: hangout.start_time,
                  requester: {
                    id: request.user_id,
                    name: request.user?.name || 'Unknown User',
                    avatar: request.user?.image_url || request.user?.name?.charAt(0)?.toUpperCase() || '👤'
                  },
                  status: request.status,
                  hangout_id: hangout.id
                }));

              planRequests.push(...transformedRequests);
            }
          } catch (error) {
            // If we can't fetch requests for a specific hangout, continue with others
            // This might happen if the user is not the host or if there are permission issues
            console.warn(`Failed to fetch requests for hangout ${hangout.id}:`, error);

            // If it's a permission error (403), log it but continue
            if (error.response?.status === 403) {
              console.warn(`User does not have permission to view requests for hangout ${hangout.id}`);
            }
          }
        }
      }

      return planRequests;
    } catch (error) {
      console.error('Error fetching plan requests:', error);
      throw error.response?.data || error;
    }
  }
};

export default hangoutService;

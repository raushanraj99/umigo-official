import api from './api';

/**
 * Service for handling email verification related operations
 */
const emailVerificationService = {
  /**
   * Verify email using the verification token from email
   * @param {string} token - The verification token from email
   * @returns {Promise<Object>} Response data
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.get('/verify-email', {
        params: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Resend verification email to the specified email address
   * @param {string} email - The email address to resend verification to
   * @returns {Promise<Object>} Response data
   */
  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post('/resend-verification-email', { email });
      return response.data;
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Extract token from URL and verify email
   * This is meant to be called when user clicks the verification link in their email
   * @returns {Promise<Object|null>} Verification result or null if no token found
   */
  handleEmailVerificationFromUrl: async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      try {
        const result = await emailVerificationService.verifyEmail(token);
        // Clean the URL after successful verification
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error.error || 'Failed to verify email' 
        };
      }
    }
    return null;
  }
};

export default emailVerificationService;

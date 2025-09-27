// src/services/notificationService.js
// Notification API client built on top of the shared axios instance (api)
// Endpoints documented in the provided Notification API Documentation

import api from './authService';

// Default pagination
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function clampLimit(limit) {
  if (typeof limit !== 'number') return DEFAULT_LIMIT;
  return Math.min(Math.max(limit, 1), MAX_LIMIT);
}

const normalizeListResponse = (resp, fallbackLimit, fallbackOffset) => ({
  notifications: Array.isArray(resp?.notifications) ? resp.notifications : [],
  limit: Number.isFinite(resp?.limit) ? resp.limit : fallbackLimit,
  offset: Number.isFinite(resp?.offset) ? resp.offset : fallbackOffset,
});

const normalizeCountResponse = (resp) => ({
  total_count: Number.isFinite(resp?.total_count) ? resp.total_count : 0,
  unread_count: Number.isFinite(resp?.unread_count) ? resp.unread_count : 0,
});

const handleError = (error, fallbackMessage) => {
  // The shared api already formats many error fields; keep consistent
  const status = error?.status || error?.response?.status || 500;
  const message = error?.message || error?.response?.data?.error || fallbackMessage;
  return Promise.reject({ status, message, originalError: error });
};

export const notificationService = {
  // GET /api/notification
  async list({ limit = DEFAULT_LIMIT, offset = 0 } = {}) {
    try {
      const safeLimit = clampLimit(Number(limit));
      const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
      const resp = await api.get('/api/notification', { params: { limit: safeLimit, offset: safeOffset } });
      return normalizeListResponse(resp, safeLimit, safeOffset);
    } catch (error) {
      return handleError(error, 'Failed to fetch notifications');
    }
  },

  // GET /api/notification/unread
  async listUnread({ limit = DEFAULT_LIMIT, offset = 0 } = {}) {
    try {
      const safeLimit = clampLimit(Number(limit));
      const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
      const resp = await api.get('/api/notification/unread', { params: { limit: safeLimit, offset: safeOffset } });
      return normalizeListResponse(resp, safeLimit, safeOffset);
    } catch (error) {
      return handleError(error, 'Failed to fetch unread notifications');
    }
  },

  // GET /api/notification/count
  async getCount() {
    try {
      const resp = await api.get('/api/notification/count');
      return normalizeCountResponse(resp);
    } catch (error) {
      return handleError(error, 'Failed to fetch notification count');
    }
  },

  // GET /api/notification/:id
  async getById(id) {
    try {
      if (!id) throw new Error('Notification id is required');
      const resp = await api.get(`/api/notification/${id}`);
      return resp?.notification || null;
    } catch (error) {
      return handleError(error, 'Failed to fetch notification');
    }
  },

  // PUT /api/notification/:id/read
  async markAsRead(id) {
    try {
      if (!id) throw new Error('Notification id is required');
      const resp = await api.put(`/api/notification/${id}/read`);
      // backend returns { message: "Notification marked as read" }
      return resp;
    } catch (error) {
      return handleError(error, 'Failed to mark notification as read');
    }
  },

  // PUT /api/notification/read-all
  async markAllAsRead() {
    try {
      const resp = await api.put('/api/notification/read-all');
      return resp; // { message: "All notifications marked as read" }
    } catch (error) {
      return handleError(error, 'Failed to mark all notifications as read');
    }
  },

  // DELETE /api/notification/:id
  async remove(id) {
    try {
      if (!id) throw new Error('Notification id is required');
      const resp = await api.delete(`/api/notification/${id}`);
      return resp; // { message: "Notification deleted successfully" }
    } catch (error) {
      return handleError(error, 'Failed to delete notification');
    }
  },
};

export default notificationService;

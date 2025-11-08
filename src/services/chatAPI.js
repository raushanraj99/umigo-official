import api from './authService';

const normalizeMsg = (m) => ({
  id: m.id || m.ID,
  chat_room_id: m.chat_room_id || m.ChatRoomID,
  sender_id: m.sender_id || m.SenderID,
  content: m.content ?? m.Content ?? '',
  type: m.type || m.Type || 'text',
  created_at: m.created_at || m.CreatedAt || null,
  updated_at: m.updated_at || m.UpdatedAt || null,
  deleted_at: m.deleted_at || m.DeletedAt || null,
  __raw: m,
});

export const chatAPI = {
  getRooms: async () => {
    try {
      const raw = await api.get('/api/chat/rooms');
      return (Array.isArray(raw) ? raw : []).map(r => ({
        id: r.id || r.ID,
        type: r.type || r.Type,
        name: r.name ?? r.Name ?? ((r.type || r.Type) === 'hangout' ? 'Hangout' : 'Direct Chat'),
        hangout_id: r.hangout_id || r.HangoutID,
        created_at: r.created_at || r.CreatedAt,
        updated_at: r.updated_at || r.UpdatedAt,
        __raw: r,
      }));
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      throw error;
    }
  },

  // ✅ If server flaps (500/204), return null so UI keeps current messages
  getMessages: async (roomId) => {
    try {
      const raw = await api.get(`/api/chat/${roomId}/messages`);
      const arr = Array.isArray(raw) ? raw : [];
      return arr.map(normalizeMsg);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 500 || status === 204) return null;  // signal "don't change UI"
      throw e;
    }
  },

  getUnread: async (roomId) => {
    try {
      const response = await api.get(`/api/chat/${roomId}/unread`);
      return response;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw error;
    }
  },

  markRead: async (roomId) => {
    try {
      const response = await api.post(`/api/chat/${roomId}/read`);
      return response;
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  },

  createDirect: async (otherUserId) => {
    try {
      const response = await api.post('/api/chat/direct', { other_user_id: otherUserId });
      return response;
    } catch (error) {
      console.error('Failed to create direct chat:', error);
      throw error;
    }
  },

  createHangout: async (hangoutId, name) => {
    try {
      const response = await api.post('/api/chat/hangout', {
        hangout_id: hangoutId,
        type: 'hangout',
        name
      });
      return response;
    } catch (error) {
      console.error('Failed to create hangout chat:', error);
      throw error;
    }
  },
};

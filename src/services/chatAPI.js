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
    const raw = await api.get('/api/chat/rooms');
    return (Array.isArray(raw) ? raw : []).map(r => ({
      id: r.id || r.ID,
      type: r.type || r.Type,
      name: r.name ?? r.Name ?? ((r.type || r.Type) === 'hangout' ? 'Hangout' : 'Direct Chat'),
      created_at: r.created_at || r.CreatedAt,
      updated_at: r.updated_at || r.UpdatedAt,
      __raw: r,
    }));
  },

  // ✅ If server flaps (500/204), return null so UI keeps current messages
  getMessages: async (roomId) => {
    try {
      const raw = await api.get(`/api/chat/${roomId}/messages`);
      const arr = Array.isArray(raw) ? raw : [];
      return arr.map(normalizeMsg);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 500 || status === 204) return null;  // signal “don’t change UI”
      throw e;
    }
  },

  getUnread:  (roomId) => api.get(`/api/chat/${roomId}/unread`),
  markRead:   (roomId) => api.post(`/api/chat/${roomId}/read`),
  createDirect: (otherUserId) =>
    api.post('/api/chat/direct', { other_user_id: otherUserId }),
  createHangout: (hangoutId, name) =>
    api.post('/api/chat/hangout', { hangout_id: hangoutId, type:'hangout', name }),
};

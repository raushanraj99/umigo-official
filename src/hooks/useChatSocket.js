// src/hooks/useChatSocket.js
import { useEffect, useRef } from 'react';

// Normalizer for WS events
const normalizeEvt = (e) => ({
  id: e.id || e.ID,
  chat_room_id: e.chat_room_id || e.ChatRoomID,
  sender_id: e.sender_id || e.SenderID,
  content: e.content ?? e.Content ?? '',
  type: e.type || e.Type || 'text',
  created_at: e.created_at || e.CreatedAt || Date.now(),
  updated_at: e.updated_at || e.UpdatedAt || null,
  deleted_at: e.deleted_at || e.DeletedAt || null,
  __raw: e, // keep original if needed
});

export default function useChatSocket({ onMessage }) {
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('Token_key');
    if (!token) return;

    const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080')
      .replace('http', 'ws');

    const ws = new WebSocket(
      `${base}/api/chat/ws?token=${encodeURIComponent(token)}`
    );
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);
        const msg = normalizeEvt(raw);
        onMessage?.(msg);
      } catch (err) {
        console.warn('WS parse error', err);
      }
    };

    return () => ws.close();
  }, [onMessage]);

  const send = (payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(payload)); // { chat_room_id, content, type }
  };

  return { send };
}

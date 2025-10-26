import { useEffect, useState } from 'react';
import { chatAPI } from '../../services/chatAPI';

export default function ChatList({ onSelectChat, selectedChatId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      const rooms = await chatAPI.getRooms();
      setRooms(rooms);
    } catch (err) {
      console.warn('getRooms failed:', err?.response?.status, err?.response?.data);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  

  if (loading) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
      <p className="mt-4 text-stone-600">Loading chats...</p>
    </div>
  );

  return (
    <div className="h-full overflow-auto">
      {rooms.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelectChat(r)}
          className={`w-full text-left px-4 py-3 border-b border-stone-200 hover:bg-stone-50 transition-colors ${selectedChatId === r.id ? 'bg-orange-50 border-orange-200' : ''}`}
        >
          <div className="font-medium text-stone-800">{r.name || (r.type === 'hangout' ? 'Hangout' : 'Direct Chat')}</div>
          <div className="text-xs text-stone-500 capitalize">{r.type}</div>
        </button>
      ))}
      {!rooms.length && (
        <div className="p-8 text-center bg-stone-50 rounded-lg mx-4 my-6">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-stone-500 text-lg">No chats yet</p>
          <p className="text-stone-400 text-sm mt-1">Start a conversation to see your chats here</p>
        </div>
      )}
    </div>
  );
}

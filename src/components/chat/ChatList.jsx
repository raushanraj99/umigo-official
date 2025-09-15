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

  

  if (loading) return <div className="p-4">Loading chats…</div>;

  return (
    <div className="h-full overflow-auto">
      {rooms.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelectChat(r)}
          className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${selectedChatId === r.id ? 'bg-gray-100' : ''}`}
        >
          <div className="font-medium">{r.name || (r.type === 'hangout' ? 'Hangout' : 'Direct Chat')}</div>
          <div className="text-xs text-gray-500">{r.type}</div>
        </button>
      ))}
      {!rooms.length && <div className="p-4 text-gray-500">No chats yet</div>}
    </div>
  );
}

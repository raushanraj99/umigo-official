import { useEffect, useRef, useState } from 'react';
import { chatAPI } from '../../services/chatAPI';
import useChatSocket from '../../hooks/useChatSocket';

export default function ChatWindow({ selectedChat, onBack }) {
  const { id: chatRoomId } = selectedChat || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  // Load history once per room
  useEffect(() => {
    if (!chatRoomId) return;
    let mounted = true;

    (async () => {
      const hist = await chatAPI.getMessages(chatRoomId); // returns array or null on 500
      if (!mounted) return;
      if (Array.isArray(hist)) setMessages(hist); // ✅ only update on success
      // mark read (fire & forget)
      chatAPI.markRead(chatRoomId).catch(() => {});
    })();

    return () => { mounted = false; };
  }, [chatRoomId]);

  // WS: append incoming messages belonging to this room
  const { send } = useChatSocket({
    onMessage: (evt) => {
      if (evt?.chat_room_id === chatRoomId) {
        setMessages((p) => [...p, evt]);
      }
    }
  });

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const onSend = () => {
    const content = input.trim();
    if (!content) return;
    const temp = {
      id: `temp-${Date.now()}`,
      chat_room_id: chatRoomId,
      content,
      type: 'text',
      created_at: Date.now(),
    };
    setMessages((p) => [...p, temp]);   // optimistic
    setInput('');
    send({ chat_room_id: chatRoomId, content, type: 'text' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b px-3 py-2">
        <button className="lg:hidden text-sm px-2 py-1 border rounded" onClick={onBack}>Back</button>
        <div className="font-medium">{selectedChat?.name || selectedChat?.type}</div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2 bg-white">
        {messages.map((m) => (
          <div key={m.id || `${m.chat_room_id}-${m.created_at}`} className="max-w-[80%] px-3 py-2 rounded-lg shadow-sm bg-gray-100">
            <div className="text-sm whitespace-pre-wrap">{m.content}</div>
            {m.created_at && (
              <div className="text-[10px] text-gray-500 mt-1">
                {new Date(m.created_at).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t p-2 flex gap-2 bg-gray-50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border px-3 py-2 outline-none"
        />
        <button onClick={onSend} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Send</button>
      </div>
    </div>
  );
}

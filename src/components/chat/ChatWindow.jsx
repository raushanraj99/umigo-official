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
      <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3 bg-white">
        <button className="lg:hidden text-sm px-3 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors" onClick={onBack}>Back</button>
        <div className="font-medium text-stone-800">{selectedChat?.name || selectedChat?.type}</div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-stone-50">
        {messages.map((m) => (
          <div key={m.id || `${m.chat_room_id}-${m.created_at}`} className="max-w-[80%] px-4 py-3 rounded-xl shadow-sm bg-white border border-stone-200">
            <div className="text-sm text-stone-800 whitespace-pre-wrap">{m.content}</div>
            {m.created_at && (
              <div className="text-[10px] text-stone-500 mt-2">
                {new Date(m.created_at).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200 p-3 flex gap-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-stone-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
        />
        <button onClick={onSend} className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">Send</button>
      </div>
    </div>
  );
}

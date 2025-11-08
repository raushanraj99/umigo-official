import { useEffect, useRef, useState } from 'react';
import { chatAPI } from '../../services/chatAPI';
import useChatSocket from '../../hooks/useChatSocket';
import { toast } from 'react-toastify';

export default function ChatWindow({ selectedChat, onBack }) {
  const { id: chatRoomId } = selectedChat || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
        setMessages((prev) => {
          // Check if this message is replacing a temporary message
          const tempIndex = prev.findIndex(msg => msg.isTemp && msg.content === evt.content);
          if (tempIndex !== -1) {
            // Replace the temporary message with the actual message
            const updatedMessages = [...prev];
            updatedMessages[tempIndex] = evt;
            return updatedMessages;
          } else {
            // Add new message
            return [...prev, evt];
          }
        });
      }
    }
  });

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const onSend = () => {
    const content = input.trim();
    if (!content || !chatRoomId || isSending) {
      if (!content) toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    // Optimistic UI update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chat_room_id: chatRoomId,
      sender_id: 'me', // This will be replaced by the actual sender_id from the server
      content,
      type: 'text',
      created_at: Date.now(),
      isTemp: true, // Mark as temporary
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput('');

    // Send via WebSocket
    send({
      chat_room_id: chatRoomId,
      content,
      type: 'text'
    });

    // Reset sending state after a short delay
    setTimeout(() => setIsSending(false), 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3 bg-white">
        <button className="lg:hidden text-sm px-3 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors" onClick={onBack}>Back</button>
        <div className="font-medium text-stone-800">{selectedChat?.name || selectedChat?.type}</div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-stone-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-stone-500">No messages yet</p>
              <p className="text-stone-400 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id || `${m.chat_room_id}-${m.created_at}`}
              className={`flex ${m.isTemp ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-3 rounded-xl shadow-sm ${
                m.isTemp
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-stone-200'
              }`}>
                <div className={`text-sm whitespace-pre-wrap ${m.isTemp ? 'text-white' : 'text-stone-800'}`}>
                  {m.content}
                </div>
                {m.created_at && (
                  <div className={`text-[10px] mt-2 ${m.isTemp ? 'text-orange-100' : 'text-stone-500'}`}>
                    {new Date(m.created_at).toLocaleString()}
                    {m.isTemp && ' (Sending...)'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-stone-200 p-3 flex gap-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Type a message..."
          disabled={isSending}
          className={`flex-1 rounded-lg border px-4 py-3 outline-none transition-colors ${
            isSending
              ? 'border-stone-200 bg-stone-50 cursor-not-allowed'
              : 'border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 hover:border-orange-300'
          }`}
        />
        <button
          onClick={onSend}
          disabled={isSending || !input.trim()}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isSending || !input.trim()
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md'
          }`}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

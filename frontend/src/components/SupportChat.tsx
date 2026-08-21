import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  sender: 'USER' | 'ADMIN';
  timestamp: number;
}

const SupportChat = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [guestId] = useState(() => {
    let id = localStorage.getItem('guestId');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestId', id);
    }
    return id;
  });

  const activeUserId = user?.id || guestId;
  const activeUserName = user?.name || (user?.id ? 'مستخدم' : 'زائر');

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Polling for new messages
      return () => clearInterval(interval);
    }
  }, [isOpen, activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/messages?userId=${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      userId: activeUserId,
      userName: activeUserName,
      text: message,
      sender: 'USER'
    };

    setMessage('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, { ...newMessage, id: Date.now().toString(), timestamp: Date.now(), sender: 'USER' }]);

    try {
      await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      fetchMessages();
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  // الزر سيظهر للجميع، حتى للأدمن لكي يتمكن من رؤيته وتجربته
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-dark/95 border border-primary/30 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary/20 p-4 border-b border-primary/20 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-primary" />
              الدعم الفني
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center my-auto">مرحباً بك! كيف يمكننا مساعدتك اليوم؟</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.sender === 'USER' ? 'bg-primary text-dark self-start rounded-tr-none' : 'bg-dark-lighter border border-gray-700 text-white self-end rounded-tl-none'}`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${msg.sender === 'USER' ? 'text-dark/70' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-dark-lighter border-t border-gray-800 flex gap-2">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-dark rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary border border-transparent transition-colors"
            />
            <button type="submit" disabled={!message.trim()} className="bg-primary text-dark p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-dark rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform group"
        >
          <MessageCircle size={28} className="group-hover:animate-pulse" />
        </button>
      )}
    </div>
  );
};

export default SupportChat;

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { MessageCircle, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  sender: 'USER' | 'ADMIN';
  timestamp: number;
}

const STORAGE_KEY = 'chat_lastReadId_v2'; // v2 = new clean key, ignores old corrupted data

const SupportChat = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [firstCoach, setFirstCoach] = useState<any>(null);
  // Track the ID of the last message the user has "read" (seen in open chat)
  const [lastReadId, setLastReadId] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

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

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch the first coach for the bubble avatar
  useEffect(() => {
    fetch(`${API_URL}/api/managers?page=1`)
      .then(r => r.json())
      .then(data => {
        const coaches = Array.isArray(data.coaches) ? data.coaches : Array.isArray(data) ? data : [];
        if (coaches.length > 0) setFirstCoach(coaches[0]);
      })
      .catch(() => {});
  }, [API_URL]);

  // Poll messages every 4 seconds regardless of chat open state
  useEffect(() => {
    if (!activeUserId) return;
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/messages?userId=${activeUserId}&_t=${Date.now()}`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          setMessages(prev => {
            // Detect new ADMIN messages that weren't in previous array
            const prevIds = new Set(prev.map(m => m.id));
            const newAdminMsgs = data.filter(m => m.sender === 'ADMIN' && !prevIds.has(m.id));
            if (newAdminMsgs.length > 0 && !isOpen) {
              // Send browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                const latest = newAdminMsgs[newAdminMsgs.length - 1];
                new Notification('رسالة جديدة من الدعم الفني', {
                  body: latest.text,
                  icon: '/favicon.ico'
                });
              }
            }
            return data;
          });
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [activeUserId, API_URL, isOpen]);

  // When chat is OPENED: mark all current messages as read
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const lastId = messages[messages.length - 1].id;
      setLastReadId(lastId);
      localStorage.setItem(STORAGE_KEY, lastId);
    }
  }, [isOpen, messages]);

  // Scroll to bottom when chat is open and messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // ─── BADGE COUNT: count ADMIN messages AFTER lastReadId ───
  // Find the index of lastReadId in the array, count ADMIN messages after it
  const unreadCount = (() => {
    if (isOpen || messages.length === 0) return 0;
    const lastReadIndex = lastReadId
      ? messages.findIndex(m => m.id === lastReadId)
      : -1;
    const unread = messages.slice(lastReadIndex + 1).filter(m => m.sender === 'ADMIN');
    return unread.length;
  })();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      userId: activeUserId,
      userName: activeUserName,
      text: message,
      sender: 'USER'
    };

    const optimisticId = Date.now().toString();
    setMessage('');
    setMessages(prev => [...prev, { ...newMessage, id: optimisticId, timestamp: Date.now(), sender: 'USER' } as ChatMessage]);

    try {
      await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const coachAvatarUrl = firstCoach?.id
    ? `https://efimg.com/efootballhub22/images/coach_cards/${firstCoach.id}.png`
    : null;

  const coachInitials = firstCoach?.name
    ? firstCoach.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'MA';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">

      {/* Coach Bubble */}
      {!isOpen && (
        <div className="relative group" title="اكتشف المدربين">
          <button
            onClick={() => navigate('/products')}
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_16px_rgba(0,240,255,0.5)] hover:scale-110 transition-all duration-300"
          >
            {coachAvatarUrl ? (
              <img
                src={coachAvatarUrl}
                alt={firstCoach?.name}
                className="w-full h-full object-cover bg-[#1a1e2e]"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = 'none';
                  const parent = t.parentElement!;
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">${coachInitials}</div>`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
                {coachInitials}
              </div>
            )}
          </button>
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40 pointer-events-none" />
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-dark/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-primary/30">
            المدربين
          </span>
        </div>
      )}

      {/* Support Chat Panel */}
      {isOpen ? (
        <div className="w-80 h-96 bg-dark/95 border border-primary/30 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col backdrop-blur-xl overflow-hidden">
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
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {user ? (
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
          ) : (
            <div className="p-3 bg-dark-lighter border-t border-gray-800 text-center">
              <p className="text-gray-400 text-sm mb-2">يجب تسجيل الدخول أولاً للتواصل معنا</p>
              <button
                onClick={() => { setIsOpen(false); navigate('/login'); }}
                className="bg-primary text-dark text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full"
              >
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Chat Bubble with Badge */
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-primary text-dark rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform group"
        >
          <MessageCircle size={28} className="group-hover:animate-pulse" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-dark animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default SupportChat;

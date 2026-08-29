import React, { useState, useEffect } from 'react';

const SupportChatAdmin = () => {
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');

  const fetchChatUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/chat/users`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setChatUsers(await res.json());
    } catch (e) {}
  };

  const fetchAdminMessages = async (userId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/chat/admin/messages?userId=${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setAdminMessages(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchChatUsers();
    const interval = setInterval(fetchChatUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchAdminMessages(selectedUserId);
      const interval = setInterval(() => fetchAdminMessages(selectedUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedUserId) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const token = localStorage.getItem('authToken');
      await fetch(`${API_URL}/api/chat/admin/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: selectedUserId,
          userName: 'Admin',
          text: adminReply,
          sender: 'ADMIN'
        })
      });
      setAdminReply('');
      fetchAdminMessages(selectedUserId);
    } catch (e) {}
  };

  const handleDeleteChat = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المحادثة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/chat/admin/messages/${userId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        if (selectedUserId === userId) {
          setSelectedUserId(null);
          setAdminMessages([]);
        }
        fetchChatUsers();
      } else {
        alert('حدث خطأ أثناء الحذف.');
      }
    } catch (e) {
      alert('تعذر الاتصال بالخادم للحذف.');
    }
  };

  return (
    <div className="glass-panel rounded-2xl w-full h-[600px] flex overflow-hidden">
      {/* Users List */}
      <div className="w-1/3 border-l border-gray-800 flex flex-col bg-dark/40">
        <h3 className="p-4 border-b border-gray-800 font-bold text-white text-lg">المحادثات</h3>
        <div className="flex-1 overflow-y-auto">
          {chatUsers.length === 0 ? (
            <p className="text-gray-500 text-center p-4">لا توجد محادثات</p>
          ) : (
            chatUsers.map(u => (
              <button 
                key={u.userId}
                onClick={() => setSelectedUserId(u.userId)}
                className={`w-full text-right p-4 border-b border-gray-800 hover:bg-white/5 transition-colors ${selectedUserId === u.userId ? 'bg-primary/10 border-r-4 border-r-primary' : ''}`}
              >
                <h4 className="font-bold text-white">{u.userName}</h4>
                <p className="text-sm text-gray-400 truncate">{u.lastMessage}</p>
                <span className="text-xs text-gray-500">{new Date(u.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Chat View */}
      <div className="w-2/3 flex flex-col bg-dark-lighter/30">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b border-gray-800 bg-dark/60 font-bold text-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                المحادثة مع: {chatUsers.find(u => u.userId === selectedUserId)?.userName}
              </div>
              <button 
                onClick={() => handleDeleteChat(selectedUserId)}
                className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded transition-colors text-sm flex items-center gap-1"
                title="حذف المحادثة"
              >
                🗑️ حذف
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {adminMessages.map(msg => (
                <div key={msg.id} className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === 'ADMIN' ? 'bg-primary text-dark self-end rounded-tl-none mr-auto' : 'bg-dark-card border border-gray-700 text-white self-start rounded-tr-none ml-auto'}`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${msg.sender === 'ADMIN' ? 'text-dark/70' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleAdminReply} className="p-4 border-t border-gray-800 bg-dark/60 flex gap-2">
              <input 
                type="text" 
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="flex-1 bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button type="submit" disabled={!adminReply.trim()} className="bg-primary text-dark px-6 font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                إرسال
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-bold text-xl">
            اختر محادثة من القائمة لعرضها
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatAdmin;

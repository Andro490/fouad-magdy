import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

interface Streamer {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  rank: number;
}

const mockStreamers: Streamer[] = [
  { id: '1', name: 'أحمد جيمنج', avatar: 'https://i.pravatar.cc/150?u=1', coins: 50000, rank: 1 },
  { id: '2', name: 'عمر برو', avatar: 'https://i.pravatar.cc/150?u=2', coins: 42000, rank: 2 },
  { id: '3', name: 'سارة ستريم', avatar: 'https://i.pravatar.cc/150?u=3', coins: 38000, rank: 3 },
  { id: '4', name: 'يوسف بلايز', avatar: 'https://i.pravatar.cc/150?u=4', coins: 29000, rank: 4 },
  { id: '5', name: 'ليلى كرافت', avatar: 'https://i.pravatar.cc/150?u=5', coins: 21000, rank: 5 },
];

export default function Leaderboard() {
  const [streamers, setStreamers] = useState<Streamer[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let users = [];
      try {
        const res = await fetch(`${API_URL}/api/users`);
        if (res.ok) {
          users = await res.json();
          if (users.length === 0) {
            users = JSON.parse(localStorage.getItem('users') || '[]');
          }
        } else {
          users = JSON.parse(localStorage.getItem('users') || '[]');
        }
      } catch (err) {
        users = JSON.parse(localStorage.getItem('users') || '[]');
      }

      const realStreamers = users
        .filter((u: any) => u.role === 'STREAMER')
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=141414&color=FFD700`,
          coins: u.coins || 0,
        }));

    // 3. ترتيبهم حسب الكوينز
    realStreamers.sort((a: any, b: any) => b.coins - a.coins);
    
    // 4. إضافة الرتبة (Rank)
    const finalStreamers = realStreamers.map((s: any, i: number) => ({ ...s, rank: i + 1 }));
    setStreamers(finalStreamers);
    };
    
    fetchUsers();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
    if (rank === 2) return 'text-gray-300 border-gray-300/50 shadow-[0_0_15px_rgba(209,213,219,0.5)]';
    if (rank === 3) return 'text-amber-600 border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.5)]';
    return 'text-white border-white/10';
  };

  return (
    <main className="min-h-screen pt-24 pb-12 relative flex flex-col items-center" dir="rtl">
      <ThreeBackground />
      
      <div className="z-10 w-full max-w-4xl px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            لوحة الصدارة
          </h1>
          <p className="text-xl text-gray-400">أفضل صناع المحتوى هذا الأسبوع</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          {streamers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-xl">لا يوجد صناع محتوى حالياً.</p>
              <p className="text-sm mt-2">كن أول من ينضم لقائمة الصدارة!</p>
            </div>
          ) : (
            <AnimatePresence>
              {streamers.map((streamer) => (
                <motion.div
                  key={streamer.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`flex items-center gap-6 p-4 rounded-xl border bg-dark-lighter/50 backdrop-blur-md ${getRankColor(streamer.rank)}`}
                >
                  <div className="text-3xl font-black w-10 text-center">
                    #{streamer.rank}
                  </div>
                  <img 
                    src={streamer.avatar} 
                    alt={streamer.name} 
                    className="w-16 h-16 rounded-full border-2 border-current p-0.5 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{streamer.name}</h3>
                    <p className="text-accent text-sm">ستريمر معتمد</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono">{streamer.coins.toLocaleString()}</div>
                    <div className="text-xs text-primary font-bold">COINS</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
}

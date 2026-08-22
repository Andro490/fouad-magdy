import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

interface Streamer {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  rank: number;
  videos: number;
}

export default function Leaderboard() {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildLeaderboard = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      try {
        // Fetch all approved video reports
        let videos: any[] = [];
        try {
          const res = await fetch(`${API_URL}/api/videos`);
          if (res.ok) {
            const data = await res.json();
            videos = Array.isArray(data) ? data : [];
          }
        } catch {
          videos = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
        }

        // Keep only APPROVED videos
        const approved = videos.filter((v: any) => v.status === 'APPROVED');

        // Group by streamer and sum coins
        const map = new Map<string, Streamer>();
        approved.forEach((v: any) => {
          const key = v.streamerId || v.streamerName;
          if (map.has(key)) {
            const existing = map.get(key)!;
            existing.coins += Number(v.earnedCoins || 0);
            existing.videos += 1;
          } else {
            map.set(key, {
              id: key,
              name: v.streamerName || 'غير معروف',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(v.streamerName || 'S')}&background=141414&color=FFD700`,
              coins: Number(v.earnedCoins || 0),
              videos: 1,
              rank: 0,
            });
          }
        });

        // Sort by coins descending and assign ranks
        const sorted = Array.from(map.values())
          .sort((a, b) => b.coins - a.coins)
          .map((s, i) => ({ ...s, rank: i + 1 }));

        setStreamers(sorted);
      } finally {
        setLoading(false);
      }
    };

    buildLeaderboard();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.4)]';
    if (rank === 2) return 'text-gray-300 border-gray-300/50 shadow-[0_0_15px_rgba(209,213,219,0.3)]';
    if (rank === 3) return 'text-amber-600 border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.3)]';
    return 'text-white border-white/10';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <main className="min-h-screen pt-24 pb-12 relative flex flex-col items-center" dir="rtl">
      <ThreeBackground />
      
      <div className="z-10 w-full max-w-4xl px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            لوحة الصدارة
          </h1>
          <p className="text-xl text-gray-400">أفضل صناع المحتوى — مرتبون حسب الكوينز المكتسبة</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>جاري التحميل...</p>
            </div>
          ) : streamers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-xl">لا يوجد صناع محتوى حالياً.</p>
              <p className="text-sm mt-2">قم بالموافقة على تقارير الفيديوهات في لوحة الإدارة لتظهر هنا!</p>
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
                  className={`flex items-center gap-4 p-4 rounded-xl border bg-dark-lighter/50 backdrop-blur-md ${getRankColor(streamer.rank)}`}
                >
                  {/* Rank Badge */}
                  <div className="text-3xl font-black w-12 text-center">
                    {getRankBadge(streamer.rank)}
                  </div>

                  {/* Avatar */}
                  <img 
                    src={streamer.avatar} 
                    alt={streamer.name} 
                    className="w-14 h-14 rounded-full border-2 border-current p-0.5 object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{streamer.name}</h3>
                    <p className="text-gray-400 text-sm">{streamer.videos} فيديو معتمد</p>
                  </div>

                  {/* Coins */}
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

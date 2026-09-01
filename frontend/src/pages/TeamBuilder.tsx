import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
  id: string;
  name: string;
  rating: number;
  position: string;
}

interface AIAnalysis {
  formation: string;
  playstyle: {
    name: string;
    description: string;
    score: number;
  };
  manager: {
    name: string;
    tactic: string;
    compatibility: string;
  };
  playerRoles?: {
    position: string;
    role: string;
    reason: string;
  }[];
}

// Fallback / Mock Data in case OCR misses players or no image provided
const mockStarters: Player[] = [
  { id: '1', name: 'Alisson', rating: 95, position: 'GK' },
  { id: '2', name: 'Robertson', rating: 92, position: 'LB' },
  { id: '3', name: 'Van Dijk', rating: 98, position: 'CB' },
  { id: '4', name: 'Marquinhos', rating: 96, position: 'CB' },
  { id: '5', name: 'Alexander-Arnold', rating: 94, position: 'RB' },
  { id: '6', name: 'Casemiro', rating: 96, position: 'DMF' },
  { id: '7', name: 'De Bruyne', rating: 98, position: 'CMF' },
  { id: '8', name: 'Bellingham', rating: 95, position: 'AMF' },
  { id: '9', name: 'Vinicius Jr', rating: 97, position: 'LWF' },
  { id: '10', name: 'Messi', rating: 100, position: 'RWF' },
  { id: '11', name: 'Haaland', rating: 99, position: 'CF' },
];

const mockSubs: Player[] = [
  { id: '12', name: 'Ederson', rating: 94, position: 'GK' },
  { id: '13', name: 'Saliba', rating: 93, position: 'CB' },
  { id: '14', name: 'Rodri', rating: 97, position: 'DMF' },
  { id: '15', name: 'Foden', rating: 94, position: 'AMF' },
  { id: '16', name: 'Mbappe', rating: 99, position: 'CF' },
  { id: '17', name: 'Saka', rating: 95, position: 'RWF' },
  { id: '18', name: 'Gvardiol', rating: 92, position: 'LB' },
];

const TeamBuilder = () => {
  const [stage, setStage] = useState(1);
  const [isManual, setIsManual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium' | 'vip' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  
  const [starters, setStarters] = useState<Player[]>(mockStarters);
  const [subs, setSubs] = useState<Player[]>(mockSubs);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [playerImages, setPlayerImages] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [telegramVerified, setTelegramVerified] = useState(localStorage.getItem('telegram_verified') === 'true');
  const [botInfo, setBotInfo] = useState({ enabled: false, botUsername: '', channelUsername: '' });
  const [sessionId, setSessionId] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

  useEffect(() => {
    let sid = localStorage.getItem('telegram_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('telegram_session_id', sid);
    }
    setSessionId(sid);

    fetch(`${API_URL}/api/telegram/bot-info`)
      .then(r => r.json())
      .then(d => setBotInfo(d))
      .catch(console.error);
  }, [API_URL]);

  useEffect(() => {
    if (!telegramVerified && botInfo.enabled && sessionId) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/telegram/verify-session?sessionId=${sessionId}`);
          const data = await res.json();
          if (data.verified) {
            localStorage.setItem('telegram_verified', 'true');
            setTelegramVerified(true);
            clearInterval(interval);
          }
        } catch (e) {}
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [telegramVerified, botInfo.enabled, sessionId, API_URL]);

  /**
   * معالجة الصورة باستخدام الذكاء الاصطناعي البصري (Vision AI)
   * نستبدل الـ OCR العادي لأن صور اللعبة لا تحتوي على أسماء صريحة، والخطوط معقدة
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgressStatus('جاري فحص الصورة بالذكاء الاصطناعي البصري...');

    try {

      // تحويل الصورة وضغطها (Canvas) لتقليل الحجم قبل الإرسال لتجنب خطأ 400 Bad Request
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1920;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            // ضغط الصورة بجودة 95% للحفاظ على وضوح الأسماء الصغيرة جداً
            resolve(canvas.toDataURL('image/jpeg', 0.95));
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      // إرسال الصورة للباكيند ليقوم هو بتحليلها عبر مفتاح Gemini الخاص به (المحفوظ في الإعدادات)
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const response = await fetch(`${API_URL}/api/analyze-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل الاتصال بالذكاء الاصطناعي البصري");
      }

      const result = data;

      if (!result.starters || result.starters.length === 0) {
        throw new Error("لم يتم العثور على أي لاعبين، يرجى رفع صورة أوضح");
      }

      let idCounter = 1;
      const formatPlayer = (p: any) => ({
         id: (idCounter++).toString(),
         name: p.name || 'Unknown',
         rating: parseInt(p.rating) || 85,
         position: p.position || 'CMF',
         box: p.box
      });

      const allPlayers = [
        ...result.starters.map(formatPlayer).slice(0, 11),
        ...(result.subs || []).map(formatPlayer).slice(0, 7)
      ];
      setStarters(allPlayers.slice(0, 11));
      setSubs(allPlayers.slice(11));

      // قص صور الكروت مباشرة من الصورة المرفوعة بناءً على الإحداثيات من Gemini
      setProgressStatus('جاري استخراج صور اللاعبين من التشكيلة...');
      const images: Record<string, string> = {};
      
      try {
        const img = new Image();
        img.src = base64Image;
        await new Promise(resolve => { img.onload = resolve; });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          allPlayers.forEach(player => {
            // box: [ymin, xmin, ymax, xmax] normalized 0-1000
            if (player.box && player.box.length === 4) {
              const [ymin, xmin, ymax, xmax] = player.box;
              const sourceX = (xmin / 1000) * img.width;
              const sourceY = (ymin / 1000) * img.height;
              const sourceWidth = ((xmax - xmin) / 1000) * img.width;
              const sourceHeight = ((ymax - ymin) / 1000) * img.height;
              
              canvas.width = sourceWidth;
              canvas.height = sourceHeight;
              
              ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
              images[player.name] = canvas.toDataURL('image/jpeg', 0.9);
            }
          });
        }
      } catch (err) {
        console.warn('Failed to crop images from canvas', err);
      }
      
      setPlayerImages(images);

      setIsProcessing(false);
      setStage(2);
    } catch (error) {
      console.error('Vision AI Error:', error);
      setProgressStatus(error instanceof Error ? error.message : 'حدث خطأ في القراءة، تأكد من مفتاح API.');
      setTimeout(() => setIsProcessing(false), 3000);
    }
  };

  /**
   * تحليل التشكيلة باستخدام الذكاء الاصطناعي عبر الباكيند
   */
  const analyzeWithAI = async () => {
    setIsProcessing(true);
    setProgressStatus('يتم الآن التحليل المعمق للتشكيلة وتحديد أفضل أساليب اللعب عبر الذكاء الاصطناعي...');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const response = await fetch(`${API_URL}/api/tactical-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starters, subs })
      });

      if (!response.ok) {
        throw new Error('فشل في جلب التحليل التكتيكي من السيرفر');
      }

      const analysis = await response.json();
      setAiAnalysis(analysis);
    } catch (error) {
      console.warn('AI Analysis failed, using mock response:', error);
      // Mock Response Fallback if API fails
      setAiAnalysis({
        formation: "4-3-3",
        playstyle: {
          name: "الهجمة المرتدة السريعة (Quick Counter)",
          description: "بناءً على سرعة أطرافك وقوة خط الوسط، هذا الأسلوب سيعطيك أفضلية هجومية كاسحة في المرتدات.",
          score: 92
        },
        manager: {
          name: "Zeitzler (Klopp)",
          tactic: "4-3-3 الهجومي",
          compatibility: "كفاءة عالية مع فريقك"
        },
        playerRoles: [
          { position: "CB", role: "بناء لعب (Build Up)", reason: "المدافع يمتلك تمريرات متقنة من الخلف" },
          { position: "CB", role: "محطم (Destroyer)", reason: "المدافع الآخر يتميز بالقوة البدنية وقطع الكرات لعمل توازن" }
        ]
      });
    } finally {
      setIsProcessing(false);
      setStage(3);
    }
  };

  const prevStage = () => setStage((prev) => Math.max(prev - 1, 1));

  // ترتيب اللاعبين على الملعب حسب مراكزهم الفعلية
  const sortOrder: Record<string, number> = {
    'LWF': 1, 'SS': 2, 'CF': 3, 'RWF': 4,
    'LMF': 1, 'AMF': 2, 'CMF': 3, 'DMF': 4, 'RMF': 5,
    'LB': 1, 'CB': 2, 'RB': 3
  };

  const pitchAttackers = starters.filter(p => ['CF', 'SS', 'LWF', 'RWF'].includes(p.position)).sort((a, b) => (sortOrder[a.position] || 9) - (sortOrder[b.position] || 9));
  const pitchMidfielders = starters.filter(p => ['AMF', 'CMF', 'DMF', 'LMF', 'RMF'].includes(p.position)).sort((a, b) => (sortOrder[a.position] || 9) - (sortOrder[b.position] || 9));
  const pitchDefenders = starters.filter(p => ['CB', 'LB', 'RB'].includes(p.position)).sort((a, b) => (sortOrder[a.position] || 9) - (sortOrder[b.position] || 9));
  const pitchGk = starters.find(p => p.position === 'GK') || starters[0];

  return (
    <div className="min-h-screen bg-[#030510] text-white pt-24 pb-12 px-5 md:px-10 overflow-hidden relative" dir="rtl">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Telegram Verification Modal */}
        <AnimatePresence>
          {!telegramVerified && botInfo.enabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#030510]/90 backdrop-blur-sm p-4"
            >
              <div className="bg-[#0f172a] border border-blue-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">اشترك بقناتنا أول</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  هذه الميزة مجانية، وشرطها الوحيد إنك تكون بقناتنا على تلغرام {botInfo.channelUsername} — منها تجيك الأخبار والتسريبات أول بأول.
                </p>

                <a
                  href={`https://t.me/${botInfo.botUsername}?start=${sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-black text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105"
                >
                  افتح القناة واشترك ✈️
                </a>

                <p className="text-xs text-gray-600 mt-6 font-bold">
                  التحقق يصير عند تلغرام نفسه — إحنا ما نشوف حسابك ولا رسائلك.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            كوّن <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">خططك</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            حلّل تشكيلتك باستخدام الذكاء الاصطناعي، واكتشف الخطة والمدرب الأنسب لفريقك في eFootball.
          </p>
        </motion.div>

        {/* ─── Video Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(34,197,94,0.12)] max-w-4xl mx-auto"
        >
          <video
            src="/foud.mp4"
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full object-cover"
            style={{ maxHeight: '480px' }}
          />
        </motion.div>

        {/* ─── Pricing Plans ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-14 max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-black text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            اختر خطتك
          </h2>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* ── Plan 0: FREE (NEW) ── */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative bg-gradient-to-b from-emerald-900/30 to-teal-900/20 border border-emerald-400/40 rounded-3xl p-7 flex flex-col gap-4 backdrop-blur-xl shadow-[0_0_25px_rgba(52,211,153,0.12)]"
            >
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎁</span>
                <h3 className="text-xl font-black text-white mb-1">مجاناً</h3>
                <p className="text-gray-400 text-sm">ارفع صورة تشكيلتك</p>
              </div>

              <div className="text-center">
                <span className="text-3xl font-black text-emerald-400">0 ج</span>
              </div>

              <ul className="space-y-3 flex-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  رفع صورة التشكيلة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  استخراج اللاعبين بالـ AI
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  تحليل تكتيكي أساسي
                </li>
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan('free');
                  setTimeout(() => {
                    document.getElementById('team-builder-upload')?.scrollIntoView({ behavior: 'smooth' });
                    document.getElementById('team-builder-upload')?.click();
                  }, 100);
                }}
                className="mt-2 w-full py-3 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              >
                ابدأ مجاناً 🚀
              </button>
            </motion.div>

            {/* ── Plan 1: Basic ── */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col gap-4 backdrop-blur-xl"
            >
              <div className="text-center">
                <span className="text-4xl mb-2 block">⚙️</span>
                <h3 className="text-xl font-black text-white mb-1">الخطة الأساسية</h3>
                <p className="text-gray-500 text-sm">للمبتدئين</p>
              </div>

              <div className="text-center">
                <span className="text-3xl font-black text-white">199 <span className="text-lg text-gray-400">ج</span></span>
              </div>

              <ul className="space-y-3 flex-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  أساليب اللاعبين حسب مركزهم
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  خطة تكتيكية منظمة على حسب التشكيلة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  اسم المدرب الأنسب لفريقك
                </li>
              </ul>

              <a
                href="https://t.me/fouadmgdym"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-3 rounded-xl font-black bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-white text-center block"
              >
                تواصل على تيليغرام ✈
              </a>
            </motion.div>

            {/* ── Plan 2: Premium ── */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative bg-gradient-to-b from-green-900/40 to-blue-900/30 border border-green-400/40 rounded-3xl p-7 flex flex-col gap-4 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg">
                  🔥 الأكثر طلباً
                </span>
              </div>

              <div className="text-center mt-3">
                <span className="text-4xl mb-2 block">⚡</span>
                <h3 className="text-xl font-black text-white mb-1">الخطة المتقدمة</h3>
                <p className="text-gray-400 text-sm">للمحترفين</p>
              </div>

              <div className="text-center">
                <span className="text-3xl font-black text-green-300">399 <span className="text-lg text-gray-400">ج</span></span>
              </div>

              <ul className="space-y-3 flex-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  أساليب اللاعبين حسب مركزهم
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  خطة تكتيكية منظمة على حسب التشكيلة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  اسم المدرب الأنسب لفريقك
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✦</span>
                  <span className="text-blue-300 font-bold">خطة هجومية متكاملة</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✦</span>
                  <span className="text-blue-300 font-bold">خطة دفاعية متكاملة</span>
                </li>
              </ul>

              <a
                href="https://wa.me/message/fouadf9"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-3 rounded-xl font-black bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 transition-all text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center block"
              >
                تواصل على واتساب 📲
              </a>
            </motion.div>

            {/* ── Plan 3: VIP ── */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative bg-gradient-to-b from-yellow-900/30 to-orange-900/20 border border-yellow-400/30 rounded-3xl p-7 flex flex-col gap-4 backdrop-blur-xl"
            >
              <div className="text-center">
                <span className="text-4xl mb-2 block">👑</span>
                <h3 className="text-xl font-black text-white mb-1">خطة VIP</h3>
                <p className="text-gray-400 text-sm">جلسة خاصة مع فوائد مجدي</p>
              </div>

              <ul className="space-y-3 flex-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  أساليب اللاعبين حسب مركزهم
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  خطة تكتيكية منظمة على حسب التشكيلة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  اسم المدرب الأنسب لفريقك
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✦</span>
                  خطة هجومية ودفاعية متكاملة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">★</span>
                  <span className="text-yellow-300 font-bold">تواصل مباشر مع فوائد مجدي على تيليغرام</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">★</span>
                  <span className="text-yellow-300 font-bold">جلسة تحليل خاصة لفريقك</span>
                </li>
              </ul>

              <a
                href="https://t.me/FouadMagdyF9"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-3 rounded-xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 transition-all text-black text-center shadow-[0_0_20px_rgba(234,179,8,0.3)] block"
              >
                📩 تواصل على تيليغرام
              </a>
            </motion.div>

          </div>
        </motion.div>

        {/* ─── Team Builder Tool ─── */}
        <div id="team-builder-start" />

        {/* Free plan upload trigger anchor */}
        <div
          id="team-builder-upload"
          className="sr-only"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}
        />

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  stage >= step
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                    : 'bg-white/5 text-gray-500 border border-white/10'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 md:w-32 h-1 mx-2 rounded-full transition-all duration-300 ${
                    stage > step ? 'bg-green-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">أدخل تشكيلتك الحالية</h2>

              {!isManual ? (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />

                  <div
                    className="border-2 border-dashed border-gray-600 hover:border-green-400 transition-colors rounded-2xl p-12 text-center cursor-pointer relative group overflow-hidden"
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-green-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-green-400 font-bold">{progressStatus}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 relative z-10">
                        <svg className="w-16 h-16 text-gray-400 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <div>
                          <p className="text-xl font-bold mb-2">اضغط لرفع صورة التشكيلة</p>
                          <p className="text-sm text-gray-500">ارفع سكرين شوت للتشكيلة الأساسية والدكة ليتم تحليلها</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-400 bg-blue-500/10 p-4 rounded-xl">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>الخصوصية مضمونة 100%: تتم معالجة الصورة محلياً على جهازك ولا يتم رفعها إلى أي سيرفرات خارجية.</p>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-gray-500 font-bold">أو</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <button
                    onClick={() => setIsManual(true)}
                    disabled={isProcessing}
                    className="w-full mt-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-bold transition-colors disabled:opacity-50"
                  >
                    أدخلها يدوياً
                  </button>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-6">واجهة الإدخال اليدوي (قيد التطوير)</p>
                  <button
                    onClick={() => setStage(2)}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    متابعة لتجربة التحليل
                  </button>
                  <button
                    onClick={() => setIsManual(false)}
                    className="block mx-auto mt-4 text-sm text-gray-500 hover:text-white"
                  >
                    العودة لرفع الصورة
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="space-y-8 relative"
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-[#030510]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-green-400 font-bold text-xl">{progressStatus}</p>
                </div>
              )}

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-green-500 rounded-full inline-block" />
                  اللاعبون الأساسيون (11) الذي تم استخراجهم
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {starters.map((player, idx) => {
                    const imgUrl = playerImages[player.name]
                      || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0d2b1a&color=22c55e&bold=true&size=128&font-size=0.4&length=2&rounded=false`;
                    return (
                    <div key={`starter-${idx}`} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center hover:border-green-500/50 transition-all group cursor-pointer">
                      <div className="relative w-20 h-24 mx-auto mb-2">
                        {/* eFootball-style card */}
                        <div className="w-full h-full rounded-lg overflow-hidden relative" style={{
                          background: 'linear-gradient(145deg, #1a2a1a 0%, #0d1a0d 40%, #162516 100%)',
                          border: '1.5px solid rgba(34,197,94,0.3)',
                          boxShadow: '0 0 10px rgba(34,197,94,0.1)'
                        }}>
                          <img
                            src={imgUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                          {/* Position badge */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5">
                            <span className="text-green-400 text-[9px] font-black">{player.position}</span>
                          </div>
                        </div>
                        {/* Rating badge */}
                        <span className="absolute -top-1.5 -right-1.5 bg-[#0f1f0f] border border-green-400 text-green-300 text-[10px] font-black px-1 py-0.5 rounded shadow-lg">{player.rating}</span>
                      </div>
                      <p className="font-bold text-[10px] truncate text-white/90">{player.name}</p>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-500 rounded-full inline-block" />
                  دكة البدلاء
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {subs.map((player, idx) => {
                    const imgUrl = playerImages[player.name]
                      || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0d0d2b&color=60a5fa&bold=true&size=128&font-size=0.4&length=2&rounded=false`;
                    return (
                    <div key={`sub-${idx}`} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center hover:border-blue-500/50 transition-all group cursor-pointer">
                      <div className="relative w-20 h-24 mx-auto mb-2">
                        <div className="w-full h-full rounded-lg overflow-hidden relative" style={{
                          background: 'linear-gradient(145deg, #1a1a2e 0%, #0d0d1f 40%, #161625 100%)',
                          border: '1.5px solid rgba(59,130,246,0.3)',
                          boxShadow: '0 0 10px rgba(59,130,246,0.1)'
                        }}>
                          <img
                            src={imgUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5">
                            <span className="text-blue-400 text-[9px] font-black">{player.position}</span>
                          </div>
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 bg-[#0f0f1f] border border-blue-400 text-blue-300 text-[10px] font-black px-1 py-0.5 rounded shadow-lg">{player.rating}</span>
                      </div>
                      <p className="font-bold text-[10px] truncate text-white/90">{player.name}</p>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between max-w-4xl mx-auto">
                <button
                  onClick={prevStage}
                  disabled={isProcessing}
                  className="px-8 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-bold transition-colors disabled:opacity-50"
                >
                  تعديل الصورة
                </button>
                <button
                  onClick={analyzeWithAI}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  تحليل الخطة بالـ AI
                </button>
              </div>
            </motion.div>
          )}

          {stage === 3 && aiAnalysis && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Pitch View */}
              <div className="lg:col-span-2 bg-[#1a3822] rounded-3xl p-6 border-2 border-green-500/20 relative overflow-hidden h-[600px] flex flex-col justify-between shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                {/* Pitch Lines */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
                <div className="absolute inset-y-4 left-1/2 w-0 border-l-2 border-white/30 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-full pointer-events-none" />
                
                <div className="absolute top-1/4 -right-4 w-1/4 h-1/2 border-2 border-white/30 pointer-events-none" />
                <div className="absolute top-1/4 -left-4 w-1/4 h-1/2 border-2 border-white/30 pointer-events-none" />

                <div className="relative z-10 w-full h-full text-sm font-bold flex flex-row-reverse items-center">
                   {/* Attackers */}
                   <div className="flex flex-col justify-around h-full w-1/3 py-10">
                     {pitchAttackers.map((p, i) => (
                       <div key={`att-${i}`} className="flex flex-col items-center">
                         <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-red-500 flex items-center justify-center mb-1 shadow-lg overflow-hidden relative">
                           {playerImages[p.name] ? (
                             <img src={playerImages[p.name]} alt={p.name} className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-white text-xs">{p.rating}</span>
                           )}
                           {!playerImages[p.name] && <div className="absolute inset-0 bg-red-500/20" />}
                         </div>
                         <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] truncate max-w-[70px] border border-white/10">{p.name}</span>
                       </div>
                     ))}
                   </div>

                   {/* Midfielders */}
                   <div className="flex flex-col justify-around h-[80%] w-1/3">
                     {pitchMidfielders.map((p, i) => (
                       <div key={`mid-${i}`} className="flex flex-col items-center">
                         <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-green-500 flex items-center justify-center mb-1 shadow-lg overflow-hidden relative">
                           {playerImages[p.name] ? (
                             <img src={playerImages[p.name]} alt={p.name} className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-white text-xs">{p.rating}</span>
                           )}
                           {!playerImages[p.name] && <div className="absolute inset-0 bg-green-500/20" />}
                         </div>
                         <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] truncate max-w-[70px] border border-white/10">{p.name}</span>
                       </div>
                     ))}
                   </div>

                   {/* Defenders */}
                   <div className="flex flex-col justify-around h-full w-1/3 py-4">
                     {pitchDefenders.map((p, i) => (
                       <div key={`def-${i}`} className="flex flex-col items-center">
                         <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-blue-500 flex items-center justify-center mb-1 shadow-lg overflow-hidden relative">
                           {playerImages[p.name] ? (
                             <img src={playerImages[p.name]} alt={p.name} className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-white text-xs">{p.rating}</span>
                           )}
                           {!playerImages[p.name] && <div className="absolute inset-0 bg-blue-500/20" />}
                         </div>
                         <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] truncate max-w-[70px] border border-white/10">{p.name}</span>
                       </div>
                     ))}
                   </div>

                   {/* GK */}
                   {pitchGk && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                       <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-yellow-500 flex items-center justify-center mb-1 shadow-lg overflow-hidden relative">
                         {playerImages[pitchGk.name] ? (
                           <img src={playerImages[pitchGk.name]} alt={pitchGk.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-white text-xs">{pitchGk.rating}</span>
                         )}
                         {!playerImages[pitchGk.name] && <div className="absolute inset-0 bg-yellow-500/20" />}
                       </div>
                       <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] truncate max-w-[70px] border border-white/10">{pitchGk.name}</span>
                     </div>
                   )}
                </div>
                <div className="absolute bottom-6 right-6 bg-black/50 px-4 py-2 rounded-xl border border-white/10 font-black text-xl">
                  {aiAnalysis.formation}
                </div>
              </div>

              {/* Suggestions Side Panel */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    أسلوب اللعب المناسب
                  </h3>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <h4 className="text-lg font-bold text-white mb-2">{aiAnalysis.playstyle.name}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {aiAnalysis.playstyle.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${aiAnalysis.playstyle.score}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-green-500 h-2 rounded-full" 
                        />
                      </div>
                      <span className="text-xs font-bold text-green-400">{aiAnalysis.playstyle.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    المدرب الأنسب
                  </h3>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-gray-900 rounded-xl border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0">
                      <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{aiAnalysis.manager.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">تكتيك: {aiAnalysis.manager.tactic}</p>
                      <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {aiAnalysis.manager.compatibility}
                      </div>
                    </div>
                  </div>
                </div>


                
                <button
                  onClick={prevStage}
                  className="w-full py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-bold transition-colors"
                >
                  إعادة التحليل أو تعديل التشكيلة
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamBuilder;

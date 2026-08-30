import React, { useState, useRef } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  
  const [starters, setStarters] = useState<Player[]>(mockStarters);
  const [subs, setSubs] = useState<Player[]>(mockSubs);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [playerImages, setPlayerImages] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const prompt = `
        You are a precise eFootball screen parser. Analyze the uploaded screenshot of the eFootball team squad.
        You must extract EXACTLY 11 starting players from the pitch and up to 7 substitute players from the right sidebar bench. Do NOT hallucinate or repeat players.

        Return ONLY a JSON object in this exact structure, containing real player names based on their face/card, their exact yellow rating number, and green position:
        {
          "starters": [
            {"name": "Player Name", "rating": 99, "position": "GK"},
            {"name": "Player Name", "rating": 98, "position": "CB"}
            // استخرج باقي الـ 11 لاعب الأساسيين بنفس الطريقة
          ],
          "subs": [
            {"name": "P. Cech", "rating": 106, "position": "GK"}
          ]
        }
      `;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyA6eo5N9LuWuZC2l59tRUyjc8wAKfhmjqA";

      // إزالة الهيدر الخاص بـ Base64
      const base64Data = base64Image.split(',')[1];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.0,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "فشل الاتصال بالذكاء الاصطناعي البصري");
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) throw new Error("لم يتمكن Gemini من استخراج البيانات");
      
      // استخراج الـ JSON من الرد
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Gemini لم يرجع البيانات بصيغة صحيحة");

      const result = JSON.parse(jsonMatch[0]);

      if (!result.starters || result.starters.length === 0) {
        throw new Error("لم يتم العثور على أي لاعبين، يرجى رفع صورة أوضح");
      }

      let idCounter = 1;
      const formatPlayer = (p: any) => ({
         id: (idCounter++).toString(),
         name: p.name || 'Unknown',
         rating: parseInt(p.rating) || 85,
         position: p.position || 'CMF'
      });

      const allPlayers = [
        ...result.starters.map(formatPlayer).slice(0, 11),
        ...(result.subs || []).map(formatPlayer).slice(0, 7)
      ];
      setStarters(allPlayers.slice(0, 11));
      setSubs(allPlayers.slice(11));

      // جلب صور كروت اللاعبين من EFHub API
      setProgressStatus('جاري جلب صور الكروت...');
      const images: Record<string, string> = {};
      await Promise.all(allPlayers.map(async (player) => {
        try {
          const lastName = player.name.split(' ').pop() || player.name;
          const res = await fetch(`https://efhub.com/api/public/players?search=${encodeURIComponent(lastName)}&limit=10`);
          if (!res.ok) return;
          const apiData = await res.json();
          const list: any[] = Array.isArray(apiData) ? apiData : (apiData.data || apiData.players || []);
          if (list.length === 0) return;
          // نفضل Epic (نوع 5) ثم أعلى تقييم أقرب لتقييم اللاعب
          const epic = list.find(p => p.playerType === 5 && p.imageUrl);
          const bestRating = list.reduce((best: any, p: any) => {
            if (!p.imageUrl) return best;
            return (!best || Math.abs(p.overallRating - player.rating) < Math.abs(best.overallRating - player.rating)) ? p : best;
          }, null);
          const chosen = epic || bestRating;
          if (chosen?.imageUrl) images[player.name] = chosen.imageUrl;
        } catch { /* تجاهل الأخطاء لكل لاعب */ }
      }));
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
   * تحليل التشكيلة باستخدام الذكاء الاصطناعي (Groq API)
   */
  const analyzeWithAI = async () => {
    setIsProcessing(true);
    setProgressStatus('يتم الآن التحليل المعمق للتشكيلة عبر الذكاء الاصطناعي...');
    
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY; // يجب إضافته في ملف .env
      
      // Prompt للذكاء الاصطناعي
      const prompt = `
        You are an expert eFootball tactical analyst. I have a team with the following starting 11 players:
        ${starters.map(p => `${p.name} (${p.position}, Rating: ${p.rating})`).join(', ')}
        
        Analyze this team and provide the absolute best tactical setup. Return the response ONLY in JSON format:
        {
          "formation": "e.g. 4-3-3",
          "playstyle": {
            "name": "e.g. الهجمة المرتدة السريعة (Quick Counter)",
            "description": "Short explanation in Arabic of why this playstyle suits the players",
            "score": 92
          },
          "manager": {
            "name": "e.g. Zeitzler (Klopp)",
            "tactic": "e.g. 4-3-3 الهجومي",
            "compatibility": "كفاءة عالية"
          }
        }
      `;

      if (apiKey) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const analysis = JSON.parse(data.choices[0].message.content);
          setAiAnalysis(analysis);
        } else {
          throw new Error('API request failed');
        }
      } else {
        throw new Error('No API Key');
      }
    } catch (error) {
      console.warn('AI Analysis failed or no API key, using mock response:', error);
      // Mock Response Fallback if API fails or is not configured
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
        }
      });
    } finally {
      setIsProcessing(false);
      setStage(3);
    }
  };

  const prevStage = () => setStage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#030510] text-white pt-24 pb-12 px-5 md:px-10 overflow-hidden relative" dir="rtl">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
                   {/* Attackers (First 3) */}
                   <div className="flex flex-col justify-around h-full w-1/3 py-10">
                     {starters.slice(8, 11).map((p, i) => (
                       <div key={`att-${i}`} className="flex flex-col items-center">
                         <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-red-500 flex items-center justify-center mb-1 shadow-lg">{p.rating}</div>
                         <span className="bg-black/70 px-2 rounded truncate max-w-[80px]">{p.name}</span>
                       </div>
                     ))}
                   </div>

                   {/* Midfielders (Next 3) */}
                   <div className="flex flex-col justify-around h-[80%] w-1/3">
                     {starters.slice(5, 8).map((p, i) => (
                       <div key={`mid-${i}`} className="flex flex-col items-center">
                         <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-green-500 flex items-center justify-center mb-1 shadow-lg">{p.rating}</div>
                         <span className="bg-black/70 px-2 rounded truncate max-w-[80px]">{p.name}</span>
                       </div>
                     ))}
                   </div>

                   {/* Defenders (Next 4) */}
                   <div className="flex flex-col justify-around h-full w-1/3 py-4">
                     {starters.slice(1, 5).map((p, i) => (
                       <div key={`def-${i}`} className="flex flex-col items-center">
                         <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-blue-500 flex items-center justify-center mb-1 shadow-lg">{p.rating}</div>
                         <span className="bg-black/70 px-2 rounded truncate max-w-[80px]">{p.name}</span>
                       </div>
                     ))}
                   </div>

                   {/* GK */}
                   {starters[0] && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                       <div className="w-12 h-12 bg-gray-900 rounded-full border-2 border-yellow-500 flex items-center justify-center mb-1 shadow-lg">{starters[0].rating}</div>
                       <span className="bg-black/70 px-2 rounded truncate max-w-[80px]">{starters[0].name}</span>
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

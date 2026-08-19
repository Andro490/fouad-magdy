import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ManagerData {
  id?: string | number;
  name?: string;
  club?: string;
  team?: string;
  national_team?: string;
  formation?: string;
  management_skills?: number | string;
  managementSkill?: number | string;
  management?: number | string;
  imageUrl?: string;
  image?: string;
  photo?: string;
  position?: string;
  type?: string;
  [key: string]: any;
}

const Products = () => {
  const [managers, setManagers] = useState<ManagerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const extractArray = (d: any) => {
          if (Array.isArray(d)) return d;
          if (typeof d === 'object' && d !== null) {
            const arr = Object.values(d).find(val => Array.isArray(val));
            return arr ? arr : Object.values(d);
          }
          return [];
        };

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // 1. جلب البيانات المحلية أولاً وعرضها فوراً
        const localData = await fetch(`${API_URL}/api/managers`).then(res => res.ok ? res.json() : []).catch(() => []);
        const localArray = extractArray(localData);
        
        const mergedManagers = new Map();
        localArray.forEach((m: any) => mergedManagers.set(String(m.id || m.Id || m.managerId), m));
        
        if (localArray.length > 0) {
          setManagers(Array.from(mergedManagers.values()));
          setLoading(false);
        }

        // 2. جلب بيانات efhub على دفعات (3 صفحات معاً) لتجنب حظر الـ IP (403)
        // واستخدام allorigins بدلاً من corsproxy لثباته
        for (let i = 1; i <= 76; i += 3) {
            const batchPromises = [];
            for (let j = 0; j < 3 && (i + j) <= 76; j++) {
              batchPromises.push(
                fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(`https://efhub.com/api/public/coaches?page=${i + j}`))
                  .then(res => res.ok ? res.json() : null)
                  .catch(() => null)
              );
            }
            
            const batchResults = await Promise.all(batchPromises);
            
            let addedNew = false;
            batchResults.forEach(pageData => {
              if (pageData) {
                const pageArray = extractArray(pageData);
                pageArray.forEach((m: any) => {
                  const id = String(m.id || m.Id || m.managerId);
                  if (mergedManagers.has(id)) {
                    mergedManagers.set(id, { ...mergedManagers.get(id), ...m });
                  } else {
                    mergedManagers.set(id, m);
                    addedNew = true;
                  }
                });
              }
            });

            // تحديث الشاشة فوراً بعد كل دفعة ليرى المستخدم المدربين وهم يظهرون تدريجياً
            if (addedNew || i === 1) {
              setManagers(Array.from(mergedManagers.values()));
              setLoading(false);
            }
            
            // تأخير بسيط لمدة نصف ثانية بين كل دفعة وأخرى لمنع الحظر (Rate Limit)
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (err) {
        if (managers.length === 0) {
          setError('حدث خطأ أثناء تحميل بيانات المدربين. يرجى التحقق من الرابط.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const filteredDisplay = managers.filter(manager => {
    const name = manager.name || manager.Name || manager.managerName || manager["姓名"] || manager.title || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">المدربون (Managers)</h1>
            <p className="text-gray-400 text-lg">اختر المدرب الأنسب لخطتك وابنِ فريق أحلامك.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن اسم المدرب..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-card/60 border border-gray-700 rounded-xl pr-12 pl-4 py-4 text-white focus:outline-none focus:border-primary transition-colors backdrop-blur-md"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary mb-6" size={64} />
            <p className="text-2xl text-gray-400 font-bold">جاري تحميل المدربين...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20">
            <p className="text-xl font-bold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDisplay.map((manager, index) => {
              const name = manager.name || manager.Name || manager.managerName || manager["姓名"] || 'مدرب غير معروف';
              const team = manager.country ? `دولة رقم (${manager.country})` : (manager.team || manager.club || 'فريق غير محدد');
              
              let topPlaystyle = manager.formation || manager["阵型"] || 'غير محدد';
              let topRating = manager.management_skills || manager.cost || manager["管理能力"] || 'N/A';
              
              if (manager.skills) {
                const s = manager.skills;
                const styles: Record<string, number> = {
                  'استحواذ': s.possessionGame ?? s.PossessionGame ?? 0,
                  'مرتد سريع': s.quickCounter   ?? s.QuickCounter   ?? 0,
                  'مرتد طويل': s.longBallCounter?? s.LongBallCounter?? 0,
                  'أطراف':     s.outWide        ?? s.OutWide        ?? 0,
                  'كرات طويلة':s.longBall       ?? s.LongBall       ?? 0,
                };
                
                let max = 0;
                for (const [style, rating] of Object.entries(styles)) {
                  if (typeof rating === 'number' && rating > max) {
                    max = rating;
                    topPlaystyle = style;
                    topRating = rating.toString();
                  }
                }
              }

              const managementLabel = 'تقييم أسلوب اللعب:';
              const managementValue = topRating;

              // الصورة من efhub بناءً على الـ ID الذي أرسلته
              const imageId = manager.id || manager.Id || manager.managerId || manager.coachId || manager.ID;
              const image = imageId ? `https://efimg.com/efootballhub22/images/coach_cards/${imageId}.png` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=141414&color=FFD700&size=200`;

              return (
                <div key={manager.id || index} className="glass-panel rounded-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 group flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-dark-lighter to-dark relative flex items-center justify-center p-6 border-b border-gray-800">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                    <img 
                      src={image} 
                      alt={name} 
                      className="h-32 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.2)] group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=141414&color=FFD700&size=200`;
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-dark/90 px-3 py-1 rounded-full border border-primary/30 text-primary text-sm font-bold backdrop-blur-md shadow-lg">
                      {topPlaystyle}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4 line-clamp-1 group-hover:text-primary transition-colors" title={name}>{name}</h3>
                    <div className="space-y-3 text-sm text-gray-400 mb-6">
                      <div className="flex justify-between items-center bg-dark/40 px-3 py-2 rounded-lg">
                        <span>البلد/الفريق:</span>
                        <span className="text-gray-200 font-semibold text-xs">{team}</span>
                      </div>
                      <div className="flex justify-between items-center bg-dark/40 px-3 py-2 rounded-lg">
                        <span>{managementLabel}</span>
                        <span className="text-accent font-bold">{managementValue}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/manager/${manager.id || manager.Id || manager.managerId || manager.coachId}`}
                      state={{ manager }}
                      className="w-full mt-auto py-3 bg-dark-lighter border border-gray-700 rounded-lg text-white font-semibold hover:border-primary hover:text-primary transition-colors group-hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] flex items-center justify-center gap-2 text-center"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && !error && filteredDisplay.length === 0 && (
          <div className="text-center py-20 text-gray-400 glass-panel rounded-2xl flex flex-col items-center justify-center">
            <Search size={48} className="text-gray-600 mb-4" />
            <p className="text-2xl font-bold">لم يتم العثور على مدربين بهذا الاسم.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

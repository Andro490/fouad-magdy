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
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 76;

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);
      setError('');
      try {
        const extractArray = (d: any) => {
          if (Array.isArray(d)) return d;
          if (typeof d === 'object' && d !== null) {
            const arr = Object.values(d).find(val => Array.isArray(val));
            return arr ? arr : Object.values(d);
          }
          return [];
        };

        // 1. تجربة أكثر من Proxy للهروب من حظر Cloudflare القوي جداً الخاص بـ EFHub
        const originalUrl = `https://efhub.com/api/public/coaches?page=${currentPage}`;
        const proxies = [
          `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${originalUrl}`,
          `https://thingproxy.freeboard.io/fetch/${originalUrl}`
        ];

        let pageData = null;
        for (const proxyUrl of proxies) {
          try {
            const res = await fetch(proxyUrl);
            if (res.ok) {
              const data = await res.json();
              if (!data.error && data.error !== "Forbidden") {
                pageData = data;
                break; // نجحنا في جلب البيانات
              }
            }
          } catch (e) {
            // تجاهل الخطأ وجرب البروكسي التالي
          }
        }

        if (!pageData) throw new Error('جميع البروكسيات محظورة حالياً من قبل EFHub');
        
        const pageArray = extractArray(pageData);
        
        setManagers(pageArray);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات المدربين. يرجى المحاولة مرة أخرى.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, [currentPage]);

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

        {/* Pagination UI - Google Style */}
        {!loading && !error && (
          <div className="flex flex-col items-center justify-center mt-16 mb-8" dir="ltr">
            
            {/* Google Style Pagination Numbers */}
            <div className="flex items-end gap-1 mb-2">
              <span className="text-[#4285F4] text-4xl font-bold">S</span>
              <span className="text-[#EA4335] text-4xl font-bold">t</span>
              <span className="text-[#FBBC05] text-4xl font-bold">r</span>
              <span className="text-[#4285F4] text-4xl font-bold">e</span>
              <span className="text-[#34A853] text-4xl font-bold">a</span>
              <span className="text-[#EA4335] text-4xl font-bold">m</span>
              
              {/* Generate 'u's based on visible pages to mimic Google's 'o's */}
              {Array.from({ length: Math.min(10, totalPages) }).map((_, i) => (
                <span key={i} className={`${i % 2 === 0 ? 'text-[#FBBC05]' : 'text-[#34A853]'} text-4xl font-bold`}>
                  u
                </span>
              ))}
              
              <span className="text-[#4285F4] text-4xl font-bold">b</span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm font-arial" dir="rtl">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 ${currentPage === 1 ? 'text-gray-500 cursor-not-allowed hidden' : 'text-[#8ab4f8] hover:underline'}`}
              >
                <span className="text-xl">{'<'}</span> السابقة
              </button>
              
              <div className="flex items-center gap-3" dir="ltr">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show 10 pages window like Google
                    let start = Math.max(1, currentPage - 5);
                    let end = Math.min(totalPages, start + 9);
                    if (end - start < 9) {
                      start = Math.max(1, end - 9);
                    }
                    return page >= start && page <= end;
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`${
                        currentPage === page 
                          ? 'text-[#e8eaed] font-bold text-base cursor-default' 
                          : 'text-[#8ab4f8] hover:underline'
                      }`}
                    >
                      {page}
                    </button>
                  ))
                }
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 ${currentPage === totalPages ? 'text-gray-500 cursor-not-allowed hidden' : 'text-[#8ab4f8] hover:underline'}`}
              >
                التالية <span className="text-xl">{'>'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

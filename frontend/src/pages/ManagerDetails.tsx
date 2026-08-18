import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';


const boostMap: Record<number, string> = {
  10: 'وعي دفاعي +1', 14: 'قوة في الركل +1', 1: 'وعي هجومي +1',
  2: 'تحكم بالكرة +1', 3: 'مراوغة +1', 4: 'استحواذ في المساحات الضيقة +1',
  5: 'تمرير منخفض +1', 6: 'تمرير مرتفع +1', 7: 'إنهاء +1',
  8: 'رأسيات +1', 9: 'ركلات ثابتة +1', 11: 'احتكاك دفاعي +1',
  12: 'قطع الكرة +1', 13: 'شراسة +1', 15: 'سرعة +1',
  16: 'تسارع +1', 17: 'قوة الركل +1', 18: 'قفز +1',
  19: 'الاحتكاك الجسدي +1', 20: 'التوازن +1', 21: 'التحمل +1'
};

const positionMap: Record<number, string> = {
  0: 'GK', 1: 'CB', 2: 'LB', 3: 'RB', 4: 'DMF', 5: 'CMF',
  6: 'LMF', 7: 'RMF', 8: 'AMF', 9: 'LWF', 10: 'RWF', 11: 'SS', 12: 'CF'
};

const pitchCoords: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 88 }, 1: { x: 50, y: 72 }, 2: { x: 15, y: 72 },
  3: { x: 85, y: 72 }, 4: { x: 50, y: 60 }, 5: { x: 50, y: 50 },
  6: { x: 15, y: 50 }, 7: { x: 85, y: 50 }, 8: { x: 50, y: 40 },
  9: { x: 20, y: 28 }, 10: { x: 80, y: 28 }, 11: { x: 50, y: 28 }, 12: { x: 50, y: 15 }
};

const getBadgeColor = (val: number) => {
  if (val >= 85) return '#00e5a0';
  if (val >= 70) return '#ffd700';
  return '#f97316';
};

const linkupDb: Record<number, any> = {
  2: { name: 'Over-the-Top Pass B', centerPiecePositions: [5], keyManPositions: [9, 10] },
  5: { name: 'Aggressive Centring A', centerPiecePositions: [6, 7], keyManPositions: [12] },
  7: { name: 'Over-the-Top Pass C', centerPiecePositions: [1], keyManPositions: [9, 10] },
  8: { name: 'Breakthrough Pass B', centerPiecePositions: [5], keyManPositions: [12] },
  10: { name: 'Breakthrough Pass A', centerPiecePositions: [8], keyManPositions: [12] },
  12: { name: '1-2 Cut-in B', centerPiecePositions: [9, 10], keyManPositions: [12] }
};

// خريطة لتعويض بيانات الخطط للمدربين في حال فشل الـ API في جلبها ورجوعه للملف الأساسي
const managerLinkupMapping: Record<string, { linkupId: number; linkupId2?: number }> = {
  '17609097478250': { linkupId: 7, linkupId2: 12 }, // Antonio Conte
  '17606681559180': { linkupId: 10 },               // D. Deschamps
  '17607218430302': { linkupId: 2 },                // Ronald Koeman
  '17607755300893': { linkupId: 8 },                // V. Montella
  '17605607920019': { linkupId: 8 },                // F. Beckenbauer
};

const ManagerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // نبدأ بالبيانات اللي اتبعتت من Products (للسرعة)، ثم نحدّثها بالبيانات الكاملة من الـ API
  const [manager, setManager] = useState<any>(location.state?.manager || null);
  const [loading, setLoading] = useState(!location.state?.manager?.skills);

  useEffect(() => {
    // لو البيانات الموجودة بالفعل تحتوي على skills كاملة، لا نحتاج نجيب مجدداً
    if (manager?.skills && Object.keys(manager.skills).length > 0) {
      setLoading(false);
      return;
    }

    // جيب البيانات الكاملة من الـ Backend أو الملف الثابت وادمجهم
    const fetchFullData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const fetch1 = fetch(`${API_URL}/api/managers`).then(res => res.ok ? res.json() : []).catch(() => []);
        const fetch2 = fetch('https://corsproxy.io/?' + encodeURIComponent('https://efhub.com/api/public/coaches')).then(res => res.ok ? res.json() : []).catch(() => []);
        
        const [data1, data2] = await Promise.all([fetch1, fetch2]);
        
        const extractArray = (d: any) => {
          if (Array.isArray(d)) return d;
          if (typeof d === 'object' && d !== null) {
            const arr = Object.values(d).find(val => Array.isArray(val));
            return arr ? arr : Object.values(d);
          }
          return [];
        };

        const array1 = extractArray(data1);
        const array2 = extractArray(data2);
        
        const found1 = array1.find((m: any) => String(m.id || m.Id || m.managerId) === String(id));
        const found2 = array2.find((m: any) => String(m.id || m.Id || m.managerId) === String(id));
        
        // دمج بياناتهم إذا وجدوا في أي من المصدرين
        if (found1 || found2) {
          setManager({ ...(found1 || {}), ...(found2 || {}) });
        }
      } catch (e) {
        console.warn('Could not fetch full manager data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center text-white">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">لم يتم العثور على بيانات المدرب</h2>
        <button onClick={() => navigate('/products')} className="px-6 py-2 bg-primary text-dark font-bold rounded-lg">العودة</button>
      </div>
    );
  }

  const imageId = manager.id || manager.Id || manager.managerId;
  const image = imageId
    ? `https://efimg.com/efootballhub22/images/coach_cards/${imageId}.png`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=141414&color=FFD700&size=200`;

  const defaultSkills = { possessionGame: 68, quickCounter: 90, longBallCounter: 73, outWide: 89, longBall: 68, overload: 69 };
  const defaultLinkup = { name: 'Over-the-Top Pass C', centerPiecePositions: [1], keyManPositions: [9, 10] };
  const defaultLinkup2 = { name: '1-2 Cut-in B', centerPiecePositions: [9, 10], keyManPositions: [12] };

  // نستخدم ?? بدل || لأن الـ skills object ممكن يكون موجود لكن الأرقام فيه undefined
  // يدعم المصدرين: camelCase من coaches API، وPascalCase من managers.json
  const rawSkills = manager.skills || {};
  const skills = {
    possessionGame: rawSkills.possessionGame ?? rawSkills.PossessionGame ?? defaultSkills.possessionGame,
    quickCounter:   rawSkills.quickCounter   ?? rawSkills.QuickCounter   ?? defaultSkills.quickCounter,
    longBallCounter:rawSkills.longBallCounter?? rawSkills.LongBallCounter?? defaultSkills.longBallCounter,
    outWide:        rawSkills.outWide        ?? rawSkills.OutWide        ?? defaultSkills.outWide,
    longBall:       rawSkills.longBall       ?? rawSkills.LongBall       ?? defaultSkills.longBall,
    overload:       rawSkills.overload       ?? rawSkills.OverLoad       ?? defaultSkills.overload,
  };

  // استخراج أرقام الخطط من الخريطة المحلية في حال عدم توفرها في بيانات المدرب
  const fallbackLinkups = managerLinkupMapping[String(imageId)] || {};
  const actualLinkupId = manager.linkupId || fallbackLinkups.linkupId;
  const actualLinkupId2 = manager.linkupId2 || fallbackLinkups.linkupId2;

  // إزالة الخطة الاحتياطية (defaultLinkup) حتى لا يتشارك المدربون نفس الخطة بالخطأ
  const linkup1 = manager.linkup  || (actualLinkupId ? linkupDb[actualLinkupId] : null);
  const linkup2 = manager.linkup2 || (actualLinkupId2 ? linkupDb[actualLinkupId2] : null);
  const allLinkups = [linkup1, linkup2].filter(Boolean);

  const positionLabel = (positions: number[]) => {
    if (!positions || positions.length === 0) return 'بناء اللعب';
    const pos = positions[0];
    if (pos === 9 || pos === 10) return 'جناح عزيز الإنتاج';
    if (pos === 12)              return 'مهاجم ماريس';
    if (pos === 11)              return 'مهاجم ثانٍ';
    if (pos === 8)               return 'وسط متقدم';
    if (pos === 6 || pos === 7)  return 'وسط جانبي';
    if (pos === 5 || pos === 4)  return 'بناء اللعب';
    if (pos === 1)               return 'دفاع مركزي';
    if (pos === 2 || pos === 3)  return 'ظهير';
    return 'بناء اللعب';
  };

  return (
    <div style={{ direction: 'rtl' }} className="min-h-screen pt-24 pb-16 px-4 md:px-8 bg-[#0f1117] text-white">

      {/* زر الرجوع */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm"
          style={{ direction: 'rtl' }}
        >
          <ArrowRight size={16} />
          <span>العودة لقائمة المدربين</span>
        </button>
      </div>

      {/* الشبكة الرئيسية — 3 أعمدة بـ LTR حتى لا تنقلب */}
      <div
        className="max-w-6xl mx-auto grid gap-6"
        style={{ direction: 'ltr', gridTemplateColumns: '200px 1fr 1fr' }}
      >

        {/* ======= العمود 1: صورة + معلومات + boosts ======= */}
        <div style={{ direction: 'rtl' }}>
          {/* صورة المدرب */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl mb-3 relative">
              <img src={image} alt={manager.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg font-black text-white text-center">{manager.name}</h1>
            <span className="text-orange-500 text-sm font-bold">محترف</span>
          </div>

          {/* التقارب */}
          <div className="mb-4">
            <p className="text-gray-500 text-xs mb-1">التقارب</p>
            <p className="text-orange-400 font-bold text-sm">محترف</p>
          </div>

          {/* Boosts */}
          {manager.boosts && manager.boosts.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs mb-2">المدير بعزز</p>
              <div className="space-y-2">
                {manager.boosts.map((b: number, i: number) => (
                  <div key={i} className="bg-[#1a1e2e] border border-gray-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="text-yellow-400">⚡</span>
                    {boostMap[b] || 'ميزة خاصة +1'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ======= العمود 2: PROFICIENCY ======= */}
        <div style={{ direction: 'rtl' }}>
          <h3 className="text-gray-400 text-xs font-bold tracking-widest mb-4 text-right">PROFICIENCY</h3>
          {[
            { label: 'الاستحواذ على اللعب', val: skills.possessionGame },
            { label: 'كرة طويلة مضادة',     val: skills.longBallCounter },
            { label: 'هجمة مرتدة سريعة',    val: skills.quickCounter },
            { label: 'كرة طويلة',           val: skills.longBall },
            { label: 'الكرات العرضية',      val: skills.outWide },
            { label: 'Overload',             val: skills.overload },
          ].map(({ label, val }) => {
            const color = getBadgeColor(val);
            return (
              <div key={label} className="mb-4">
                {/* سطر: رقم + نص */}
                <div className="flex items-center gap-2 mb-1" style={{ direction: 'ltr' }}>
                  <span
                    style={{
                      backgroundColor: color,
                      color: '#111111',
                      fontWeight: 900,
                      fontSize: '12px',
                      lineHeight: '1',
                      minWidth: '34px',
                      height: '22px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      letterSpacing: 0,
                    }}
                  >
                    {String(val)}
                  </span>
                  <span style={{ color: '#ffd700', fontSize: '13px', fontWeight: 600, direction: 'rtl' }}>
                    {label}
                  </span>
                </div>
                {/* شريط */}
                <div style={{ background: '#252833', height: '5px', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${val}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '999px',
                    boxShadow: `0 0 6px ${color}`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ======= العمود 3: LINK-UP + ملعب ======= */}
        <div style={{ direction: 'rtl' }}>
          <h3 className="text-gray-400 text-xs font-bold tracking-widest mb-4 text-right">LINK-UP</h3>

          {/* كروت Link-Up */}
          {allLinkups.length > 0 ? allLinkups.map((link, idx) => (
            <div key={idx} className={`${idx === 0 ? 'bg-[#1e2235]' : 'bg-transparent'} rounded-xl p-4 mb-1`}>
              <h4 className={`${idx === 0 ? 'text-white' : 'text-[#8eb4f8] opacity-80'} font-bold text-base mb-3 text-right`}>
                {link.name}
              </h4>
              <div className="flex justify-between gap-3">
                <div className="flex-1 text-right">
                  <p className="text-gray-500 text-[11px] mb-1">القطعة المركزية</p>
                  <p className="text-[#8eb4f8] text-[11px] mb-2">{positionLabel(link.centerPiecePositions)}</p>
                  <div className="flex gap-1 flex-wrap justify-start">
                    {link.centerPiecePositions?.map((p: number) => (
                      <span key={p} className="text-[11px] font-bold px-2 py-1 rounded" style={{ background: '#3d2435', color: '#e06c88' }}>
                        {positionMap[p]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-gray-500 text-[11px] mb-1">رجل مفتاح</p>
                  <p className="text-[#8eb4f8] text-[11px] mb-2">{positionLabel(link.keyManPositions)}</p>
                  <div className="flex gap-1 flex-wrap justify-start">
                    {link.keyManPositions?.map((p: number) => (
                      <span key={p} className="text-[11px] font-bold px-2 py-1 rounded" style={{ background: '#3d2435', color: '#e06c88' }}>
                        {positionMap[p]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-[#1e2235] rounded-xl p-8 mb-3 flex items-center justify-center border border-gray-700">
              <span className="text-gray-500 font-bold text-lg tracking-wide">No Link Up</span>
            </div>
          )}

          {/* الملعب */}
          <div className="rounded-xl overflow-hidden border border-[#2a4a35] relative mt-2"
            style={{ height: '220px', background: '#1a3a25' }}>

            {/* خطوط الملعب */}
            <div className="absolute top-1/2 left-0 right-0 border-t border-[#2f6040]" style={{ transform: 'translateY(-50%)' }}></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-[#2f6040] rounded-full"
              style={{ transform: 'translate(-50%,-50%)' }}></div>
            <div className="absolute top-0 left-1/2 w-28 h-9 border-b border-x border-[#2f6040]"
              style={{ transform: 'translateX(-50%)' }}></div>
            <div className="absolute bottom-0 left-1/2 w-28 h-9 border-t border-x border-[#2f6040]"
              style={{ transform: 'translateX(-50%)' }}></div>

            {/* SVG خطوط اتصال */}
            <svg className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
              {allLinkups[0]?.centerPiecePositions?.map((cp: number) =>
                allLinkups[0]?.keyManPositions?.map((km: number) => {
                  const a = pitchCoords[cp];
                  const b = pitchCoords[km];
                  if (!a || !b) return null;
                  return (
                    <line key={`line-${cp}-${km}`}
                      x1={`${a.x}%`} y1={`${a.y}%`}
                      x2={`${b.x}%`} y2={`${b.y}%`}
                      stroke="#00c9a7" strokeWidth="2" opacity="0.9"
                    />
                  );
                })
              )}
            </svg>

            {/* نقاط رجال المفتاح */}
            {allLinkups[0]?.keyManPositions?.map((km: number) => {
              const c = pitchCoords[km];
              if (!c) return null;
              return (
                <div key={`km-${km}`}
                  className="absolute z-20 flex items-center justify-center font-bold rounded-full border-2 border-black shadow-lg"
                  style={{
                    left: `${c.x}%`, top: `${c.y}%`,
                    transform: 'translate(-50%,-50%)',
                    width: '42px', height: '42px',
                    backgroundColor: '#e06c88',
                    color: '#000', fontSize: '11px',
                  }}
                >
                  {positionMap[km]}
                </div>
              );
            })}

            {/* نقاط القطعة المركزية */}
            {allLinkups[0]?.centerPiecePositions?.map((cp: number) => {
              const c = pitchCoords[cp];
              if (!c) return null;
              return (
                <div key={`cp-${cp}`}
                  className="absolute z-20 flex items-center justify-center font-bold rounded-full border-2 border-black shadow-lg"
                  style={{
                    left: `${c.x}%`, top: `${c.y}%`,
                    transform: 'translate(-50%,-50%)',
                    width: '42px', height: '42px',
                    backgroundColor: '#00c9a7',
                    color: '#000', fontSize: '11px',
                  }}
                >
                  {positionMap[cp]}
                </div>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-5 z-30">
              <div className="flex items-center gap-1">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00c9a7' }}></div>
                <span style={{ color: '#ccc', fontSize: '10px' }}>القطعة المركزية</span>
              </div>
              <div className="flex items-center gap-1">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e06c88' }}></div>
                <span style={{ color: '#ccc', fontSize: '10px' }}>رجل مفتاح</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDetails;

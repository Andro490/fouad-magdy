import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { Loader2 } from 'lucide-react';
import { loginSuccess } from '../store/authSlice';
import VerifiedBadge from '../components/VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import Division1Admin from '../components/admin/Division1Admin';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // (Removed redirect to allow DIV1_ADMIN to manage from Dashboard)

  const [videoLink, setVideoLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCoins, setCurrentCoins] = useState(user?.coins || 0);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [divisionOrders, setDivisionOrders] = useState<any[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);


  React.useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
        const token = localStorage.getItem('authToken');
        try {
          // Use /api/auth/me — works for all logged-in users with token
          if (token) {
            const res = await fetch(`${API_URL}/api/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` },
              credentials: 'include'
            });
            if (res.ok) {
              const data = await res.json();
              setCurrentCoins(data.coins || 0);
              return;
            }
          }
          // Fallback to Redux/localStorage coins
          setCurrentCoins(user?.coins || 0);
        } catch (err) {
          setCurrentCoins(user?.coins || 0);
        }
      }
    };
    fetchUser();
  }, [user]);


  React.useEffect(() => {
    if (user?.id && user?.role === 'STREAMER') {
      const fetchVideos = async () => {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
        try {
          const res = await fetch(`${API_URL}/api/videos`);
          if (res.ok) {
            const data = await res.json();
            setMySubmissions(data.filter((v: any) => v.streamerId === user.id));
          } else {
            const stored = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
            setMySubmissions(stored.filter((v: any) => v.streamerId === user.id));
          }
        } catch {
          const stored = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
          setMySubmissions(stored.filter((v: any) => v.streamerId === user.id));
        }
      };
      fetchVideos();
    }

    const phoneToUse = user?.phone || localStorage.getItem('div1_phone');
    if (phoneToUse) {
      const fetchDivisionOrders = async () => {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
        try {
          const res = await fetch(`${API_URL}/api/division1/status?phone=${encodeURIComponent(phoneToUse)}`);
          if (res.ok) {
            const data = await res.json();
            setDivisionOrders(Array.isArray(data) ? data : []);
          }
        } catch (err) {}
      };
      fetchDivisionOrders();
    }
  }, [user, result]);

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setSearchLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    try {
      const res = await fetch(`${API_URL}/api/division1/status?phone=${encodeURIComponent(searchPhone.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setDivisionOrders(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          localStorage.setItem('div1_phone', searchPhone.trim());
        } else {
          alert('لا توجد طلبات مسجلة بهذا الرقم');
        }
      }
    } catch (err) {
      alert('حدث خطأ في البحث');
    } finally {
      setSearchLoading(false);
    }
  };

  const calcDaysRemaining = (startDate: string | null, deliveryDays: number) => {
    if (!startDate || !deliveryDays) return null;
    const start = new Date(startDate);
    const deadline = new Date(start.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dispatch = useDispatch();

  const handleUpgradeToStreamer = async () => {
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    const token = localStorage.getItem('authToken');
    
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ role: 'STREAMER' })
      });

      if (res.ok) {
        dispatch(loginSuccess({ user: { ...user, role: 'STREAMER' }, token: token || undefined }));
        alert('تمت ترقية حسابك إلى صانع محتوى بنجاح!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`حدث خطأ: ${err.error || 'تعذر ترقية الحساب'}`);
      }
    } catch (err) {
      // Fallback: update localStorage only
      dispatch(loginSuccess({ user: { ...user, role: 'STREAMER' } }));
      alert('تمت ترقية حسابك إلى صانع محتوى بنجاح!');
    }
  };

  const handleAnalyze = async () => {
    if (!videoLink) return alert('يرجى إدخال رابط الفيديو');
    
    setIsAnalyzing(true);
    setResult(null);
    
    let views = 0;
    let likes = 0;

    try {
      if (videoLink.includes('tiktok.com')) {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoLink)}`);
        const data = await res.json();
        
        if (data && data.code === 0 && data.data) {
          views = data.data.play_count || 0;
          likes = data.data.digg_count || 0;
        } else {
          alert('تعذر جلب بيانات الفيديو من تيك توك. يرجى التأكد من أن الرابط صحيح وعام.');
          setIsAnalyzing(false);
          return;
        }
      } else {
        alert('حالياً ندعم روابط تيك توك فقط لجلب الإحصائيات الدقيقة.');
        setIsAnalyzing(false);
        return;
      }
    } catch (error) {
      alert('حدث خطأ أثناء الاتصال بالخادم لجلب بيانات الفيديو.');
      setIsAnalyzing(false);
      return;
    }

    const earnedCoins = Math.floor(views / 20000) * 50;

    const submission = {
      id: Date.now().toString(),
      streamerId: user?.id,
      streamerName: user?.name,
      videoLink,
      views,
      likes,
      earnedCoins,
      status: 'PENDING', // Admin will approve it
      createdAt: new Date().toISOString()
    };

    // Save via API for Admin to see
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    let submissions = [];
    try {
      const res = await fetch(`${API_URL}/api/videos`);
      if (res.ok) {
        submissions = await res.json();
        if (submissions.length === 0) {
          submissions = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
        }
      } else {
        submissions = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
      }
    } catch (err) {
      submissions = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
    }
    
    submissions.push(submission);
    
    try {
      await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissions)
      });
    } catch (err) {
      localStorage.setItem('videoSubmissions', JSON.stringify(submissions));
    }

    setResult(submission);
    setIsAnalyzing(false);
    setVideoLink('');
  };


  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-white">الرجاء تسجيل الدخول</div>;
  }

  // If user is DIV1_ADMIN, show the full admin component right here on the dashboard
  if (user.role === 'DIV1_ADMIN') {
    return (
      <div className="flex-1 flex flex-col items-center pt-24 pb-12 px-4 relative min-h-screen bg-dark text-white" dir="rtl">
        <div className="z-10 w-full max-w-7xl space-y-8 glass-panel p-8 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-dark-lighter p-6 rounded-2xl border border-white/5">
            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=141414&color=FFD700`} alt={user.name} className="w-20 h-20 rounded-full border-2 border-primary" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {user.name}
                <VerifiedBadge className="w-6 h-6" />
              </h2>
              <p className="text-gray-400">أدمن وصول دفجن 1</p>
            </div>
          </div>
          <Division1Admin />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center pt-24 pb-12 px-4 relative min-h-screen bg-dark text-white" dir="rtl">
      <div className="z-10 w-full max-w-6xl space-y-8 glass-panel p-8 rounded-3xl">
        <h1 className="text-4xl font-bold text-gradient mb-4">لوحة التحكم</h1>
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-dark-lighter p-6 rounded-2xl border border-white/5">
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=141414&color=FFD700`} alt={user.name} className="w-20 h-20 rounded-full border-2 border-primary" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {user.name}
              {(user.role === 'ADMIN' || user.role === 'SELLER' || user.role === 'STREAMER') && (
                <VerifiedBadge className="w-6 h-6" />
              )}
            </h2>
            <p className="text-gray-400">
              {user.role === 'STREAMER' ? 'صانع محتوى معتمد' : user.role === 'SELLER' ? 'بائع (أدمن فرعي)' : user.role === 'ADMIN' ? 'المدير' : 'مستخدم عادي'}
            </p>
          </div>
          <div className="text-center bg-dark/50 px-6 py-3 rounded-xl border border-accent/20">
            <p className="text-sm text-gray-400 mb-1">الرصيد الحالي</p>
            <p className="text-3xl font-bold text-accent">{currentCoins} <span className="text-sm text-gray-500">كوينز</span></p>
          </div>
        </div>

        {/* Division 1 Tracking Section */}
        {divisionOrders.length > 0 && (
          <div className="bg-dark-lighter p-6 rounded-2xl border border-white/10 mt-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-primary">طلبات دفجن 1 الخاصة بك</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisionOrders.map(order => {
                const remaining = order.totalPrice - order.paidAmount;
                return (
                  <div key={order.id} className="bg-dark/50 border border-gray-700 rounded-xl p-5 hover:border-primary transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-white text-lg">{order.name}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status === 'COMPLETED' ? 'مكتمل' :
                         order.status === 'APPROVED' ? 'تمت الموافقة' :
                         order.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">
                      <span className="text-gray-500">التاريخ:</span> {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                    <p className="text-gray-300 text-sm mb-4">
                      <span className="text-gray-500">مدة التسليم:</span> {order.deliveryTime || order.deliveryDays}
                    </p>
                    <div className="flex justify-between items-center bg-black/30 rounded-lg p-3 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 mb-1">تم دفع</p>
                        <p className="text-green-400 font-bold">{order.paidAmount} ج</p>
                      </div>
                      <div className="w-px h-8 bg-gray-700"></div>
                      <div className="text-center">
                        <p className="text-gray-500 mb-1">متبقي</p>
                        <p className="text-red-400 font-bold">{remaining > 0 ? remaining : 0} ج</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {user.role === 'STREAMER' && (
          <div className="bg-dark-lighter p-6 rounded-2xl border border-white/10 mt-8">
            <h3 className="text-xl font-bold mb-4 text-primary">تحليل أداء الفيديو</h3>
            <p className="text-gray-400 mb-6 text-sm">أدخل رابط الفيديو الخاص بك (يوتيوب أو تيك توك). سيقوم النظام بتحليل المشاهدات والإعجابات. كل 20,000 مشاهدة تمنحك 50 كوينز بعد موافقة الإدارة.</p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input 
                type="url" 
                value={videoLink}
                onChange={e => setVideoLink(e.target.value)}
                placeholder="أدخل رابط الفيديو هنا..." 
                className="flex-1 bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent text-left"
                dir="ltr"
              />
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-accent text-dark font-bold rounded-lg px-8 py-3 hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center min-w-[150px]"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={24} /> : 'تحليل وإرسال'}
              </button>
            </div>

            {result && (
              <div className="mt-6 bg-dark/50 p-6 rounded-xl border border-green-500/30 flex flex-col gap-4">
                <div className="flex justify-between items-center text-green-400 font-bold text-lg">
                  <span>تم إرسال التقرير للإدارة بنجاح!</span>
                  <span>قيد المراجعة 🕒</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mt-2">
                  <div className="bg-dark p-3 rounded-lg border border-gray-800">
                    <p className="text-gray-400 text-xs mb-1">المشاهدات</p>
                    <p className="font-bold text-white">{result.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-dark p-3 rounded-lg border border-gray-800">
                    <p className="text-gray-400 text-xs mb-1">الإعجابات</p>
                    <p className="font-bold text-white">{result.likes.toLocaleString()}</p>
                  </div>
                  <div className="bg-dark p-3 rounded-lg border border-accent/20">
                    <p className="text-gray-400 text-xs mb-1">الكوينز المتوقعة</p>
                    <p className="font-bold text-accent">+{result.earnedCoins}</p>
                  </div>
                </div>
              </div>
            )}

            {mySubmissions.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="text-lg font-bold mb-4 text-white">سجل روابطك السابقة</h4>
                <div className="space-y-3">
                  {mySubmissions.slice().reverse().map(sub => (
                    <div key={sub.id} className="bg-dark/40 border border-gray-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                      <a href={sub.videoLink} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm w-full md:w-auto truncate block max-w-[200px]" dir="ltr">
                        {sub.videoLink}
                      </a>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>👀 {sub.views?.toLocaleString()}</span>
                        <span>❤️ {sub.likes?.toLocaleString()}</span>
                        <span className="text-accent">💰 +{sub.earnedCoins}</span>
                      </div>
                      <div>
                        {sub.status === 'APPROVED' ? (
                          <span className="text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded text-sm">مقبول</span>
                        ) : sub.status === 'REJECTED' ? (
                          <span className="text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded text-sm">مرفوض</span>
                        ) : (
                          <span className="text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded text-sm">قيد المراجعة</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing dashboard stats for normal users */}
        {user.role === 'USER' && (
          <div className="flex flex-col items-center mt-8">


            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl w-full text-center">
              <h3 className="text-2xl font-bold text-white mb-2">هل أنت صانع محتوى؟ 🎥</h3>
              <p className="text-gray-300 mb-6">قم بترقية حسابك الآن إلى "Clipper" لتتمكن من إضافة فيديوهاتك والحصول على كوينز مقابل الإعجابات والمشاهدات!</p>
              <button 
                onClick={handleUpgradeToStreamer}
                className="bg-primary text-dark font-bold px-8 py-3 rounded-lg hover:bg-accent hover:text-white transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                ترقية حسابي لـ Clipper الآن!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

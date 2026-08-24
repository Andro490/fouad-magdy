import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import type { StoreProduct } from './Store';

const Admin = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [videoSubmissions, setVideoSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'coaches' | 'support' | 'coachVideos'>('products');
  
  // Chat States
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');
  
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmittingJson, setIsSubmittingJson] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Coach Videos States
  const [coachManagers, setCoachManagers] = useState<any[]>([]);
  const [cvSelectedManager, setCvSelectedManager] = useState('');
  const [cvFreeUrl, setCvFreeUrl] = useState('');
  const [cvLibraryId, setCvLibraryId] = useState('');
  const [cvTokenKey, setCvTokenKey] = useState('');
  const [cvVideoId, setCvVideoId] = useState('');
  const [cvImagesInput, setCvImagesInput] = useState('');
  const [cvIsUploading, setCvIsUploading] = useState(false);
  const [cvIsSaving, setCvIsSaving] = useState(false);
  const [cvSavedData, setCvSavedData] = useState<any[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
    // Load from API
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        let fetched = Array.isArray(data) ? data : [];
        if (fetched.length === 0) {
          fetched = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        }
        setProducts(fetched);
      })
      .catch(() => {
        const storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        setProducts(storedProducts);
      });
    fetch(`${API_URL}/api/videos`)
      .then(r => r.json())
      .then(data => {
        let fetched = Array.isArray(data) ? data : [];
        if (fetched.length === 0) {
          fetched = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
        }
        setVideoSubmissions(fetched);
      })
      .catch(() => {
        const storedVideos = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
        setVideoSubmissions(storedVideos);
      });
    fetch(`${API_URL}/api/managers`)
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data.coaches) ? data.coaches : Array.isArray(data) ? data : [];
        setCoachManagers(arr);
      })
      .catch(() => {});
      
    fetch(`${API_URL}/api/coach-videos`)
      .then(r => r.json())
      .then(data => {
        const fetched = Array.isArray(data) ? data : [];
        setCvSavedData(fetched);
        if (fetched.length > 0) {
          localStorage.setItem('coachVideosData', JSON.stringify(fetched));
        }
      })
      .catch(() => {
        const savedCv = JSON.parse(localStorage.getItem('coachVideosData') || '[]');
        setCvSavedData(savedCv);
      });
  }, [isAuthenticated, user, navigate, API_URL]);

  useEffect(() => {
    if (activeTab === 'support') {
      fetchChatUsers();
      const interval = setInterval(fetchChatUsers, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'support' && selectedUserId) {
      fetchAdminMessages(selectedUserId);
      const interval = setInterval(() => fetchAdminMessages(selectedUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedUserId]);

  const fetchChatUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/chat/users`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setChatUsers(await res.json());
    } catch (e) {}
  };

  const fetchAdminMessages = async (userId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/chat/admin/messages?userId=${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setAdminMessages(await res.json());
    } catch (e) {}
  };

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedUserId) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      const uploadedUrls: string[] = [];
      // Use Vercel serverless function (same origin, no CORS)
      const UPLOAD_URL = window.location.hostname === 'localhost'
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`
        : '/api/upload';
      
      for (const file of files) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
        });

        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        });
        
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Upload failed:', data);
          if (data.error?.toLowerCase().includes('api key')) {
            alert('يوجد خطأ في مفتاح API في السيرفر.');
          }
        }
      }
      
      if (uploadedUrls.length > 0) {
        setImagesInput(prev => {
          const current = prev.trim();
          const newUrls = uploadedUrls.join('\n');
          return current ? `${current}\n${newUrls}` : newUrls;
        });
        alert(`تم رفع ${uploadedUrls.length} صور بنجاح!`);
      } else {
        alert('فشل رفع الصور. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('حدث خطأ أثناء الاتصال بالسيرفر لرفع الصور.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedImages = imagesInput.split('\n').map(s => s.trim()).filter(Boolean);
    
    const newProduct: StoreProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: Number(price),
      image: parsedImages[0] || '',
      images: parsedImages.length > 0 ? parsedImages : undefined,
      adminPhone: adminPhone.trim() || undefined
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    // Save to API
    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProducts)
    }).catch(() => localStorage.setItem('storeProducts', JSON.stringify(updatedProducts)));
    
    setName('');
    setDescription('');
    setPrice('');
    setImagesInput('');
    setAdminPhone('');
    alert('تم إضافة المنتج بنجاح');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProducts)
    }).catch(() => localStorage.setItem('storeProducts', JSON.stringify(updatedProducts)));
  };

  const handleToggleSoldOut = (id: string) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p
    );
    setProducts(updatedProducts);
    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProducts)
    }).catch(() => localStorage.setItem('storeProducts', JSON.stringify(updatedProducts)));
  };

  const handleApproveVideo = async (id: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let earnedCoins = 0;
    let streamerId = '';

    const updatedSubmissions = videoSubmissions.map(sub => {
      if (sub.id === id && sub.status === 'PENDING') {
        earnedCoins = sub.earnedCoins;
        streamerId = sub.streamerId;
        return { ...sub, status: 'APPROVED' };
      }
      return sub;
    });

    setVideoSubmissions(updatedSubmissions);
    
    try {
      await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubmissions)
      });
    } catch (err) {
      localStorage.setItem('videoSubmissions', JSON.stringify(updatedSubmissions));
    }

    if (earnedCoins > 0 && streamerId) {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        if (res.ok) {
          let users = await res.json();
          if (users.length === 0) {
            users = JSON.parse(localStorage.getItem('users') || '[]');
          }
          const userIndex = users.findIndex((u: any) => u.id === streamerId);
          if (userIndex !== -1) {
            users[userIndex].coins = (users[userIndex].coins || 0) + earnedCoins;
            await fetch(`${API_URL}/api/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(users)
            }).catch(() => localStorage.setItem('users', JSON.stringify(users)));
          }
        } else {
          throw new Error('Fallback to local');
        }
      } catch (err) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === streamerId);
        if (userIndex !== -1) {
          users[userIndex].coins = (users[userIndex].coins || 0) + earnedCoins;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
    }
    
    alert('تم الموافقة على التقرير وإضافة الكوينز للستريمر!');
  };

  const handleAddCoaches = async () => {
    if (!jsonInput.trim()) return alert('الرجاء إدخال البيانات بصيغة JSON');
    try {
      setIsSubmittingJson(true);
      const parsedData = JSON.parse(jsonInput);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/managers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setJsonInput('');
      } else {
        alert(data.error || 'حدث خطأ أثناء الإضافة');
      }
    } catch (err: any) {
      alert('صيغة JSON غير صحيحة! يرجى التأكد من الأقواس والعلامات.');
    } finally {
      setIsSubmittingJson(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-gradient mb-10 text-center">لوحة تحكم الإدارة</h1>
        
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('products')} 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
          >
            إدارة المتجر
          </button>
          <button 
            onClick={() => setActiveTab('videos')} 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'videos' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
          >
            مراجعة الفيديوهات
          </button>
          <button 
            onClick={() => setActiveTab('coaches')} 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'coaches' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
          >
            إضافة مدربين (JSON)
          </button>
          <button 
            onClick={() => setActiveTab('coachVideos')} 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'coachVideos' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
          >
            فيديوهات المدربين
          </button>
          <button 
            onClick={() => setActiveTab('support')} 
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'support' ? 'bg-primary text-dark shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-dark-lighter text-gray-400 hover:text-white'}`}
          >
            الدعم الفني
          </button>
        </div>
        
        {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* إضافة منتج */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-1 h-fit">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">إضافة منتج جديد</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">اسم المنتج</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الوصف</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none h-24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">السعر</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">روابط الصور (رابط في كل سطر)</label>
                <div className="mb-2">
                  <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-bold ${isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-dark-lighter border border-gray-600 text-white hover:bg-white/10'}`}>
                    {isUploading ? 'جاري الرفع...' : 'رفع صور من الجهاز 📷'}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
                <textarea value={imagesInput} onChange={e => setImagesInput(e.target.value)} required placeholder="https://..."
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none text-left h-24" dir="ltr" />
                <p className="text-xs text-gray-400 mt-1">يمكنك إدخال الروابط يدوياً أو استخدام الزر لرفع الصور من جهازك ليتم إضافتها تلقائياً.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">رقم هاتف تليجرام (اختياري)</label>
                <input type="text" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} placeholder="+201xxxxxxxxx"
                  className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none text-left" dir="ltr" />
              </div>
              <button type="submit" className="w-full py-3 bg-accent text-dark font-bold rounded-lg hover:bg-primary transition-colors mt-4 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                إضافة للمتجر
              </button>
            </form>
          </div>

          {/* قائمة المنتجات */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-white">المنتجات الحالية</h2>
            {products.length === 0 ? (
              <p className="text-gray-400">لا توجد منتجات مضافة.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="pb-3 px-2">الصورة</th>
                      <th className="pb-3 px-2">الاسم</th>
                      <th className="pb-3 px-2">السعر</th>
                      <th className="pb-3 px-2 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-600" />
                        </td>
                        <td className="py-3 px-2 font-semibold text-white">{product.name}</td>
                        <td className="py-3 px-2 text-accent font-bold">{product.price} EGP</td>
                        <td className="py-3 px-2 text-center">
                          <button onClick={() => handleToggleSoldOut(product.id)} className={`font-semibold px-3 py-1 rounded transition-colors ml-2 ${product.isSoldOut ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-yellow-500/10 text-yellow-500 hover:text-yellow-400'}`}>
                            {product.isSoldOut ? 'متاح' : 'تم البيع'}
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-400 font-semibold px-3 py-1 bg-red-500/10 rounded transition-colors">
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        ) : activeTab === 'videos' ? (
        <div className="glass-panel p-6 rounded-2xl w-full">
          <h2 className="text-2xl font-bold mb-6 text-white">تقارير فيديوهات الستريمرز</h2>
          {videoSubmissions.length === 0 ? (
            <p className="text-gray-400">لا توجد تقارير جديدة.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="pb-3 px-2">اسم الستريمر</th>
                    <th className="pb-3 px-2">رابط الفيديو</th>
                    <th className="pb-3 px-2 text-center">المشاهدات</th>
                    <th className="pb-3 px-2 text-center">الإعجابات</th>
                    <th className="pb-3 px-2 text-center">الكوينز</th>
                    <th className="pb-3 px-2 text-center">الحالة / الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {videoSubmissions.map(sub => (
                    <tr key={sub.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-bold text-white">{sub.streamerName}</td>
                      <td className="py-4 px-2">
                        <a href={sub.videoLink} target="_blank" rel="noreferrer" className="text-accent hover:underline block max-w-[200px] truncate" dir="ltr">
                          {sub.videoLink}
                        </a>
                      </td>
                      <td className="py-4 px-2 text-center">{sub.views.toLocaleString()}</td>
                      <td className="py-4 px-2 text-center">{sub.likes.toLocaleString()}</td>
                      <td className="py-4 px-2 text-center text-accent font-bold">+{sub.earnedCoins}</td>
                      <td className="py-4 px-2 text-center">
                        {sub.status === 'APPROVED' ? (
                          <span className="text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded">تمت الموافقة</span>
                        ) : (
                          <button 
                            onClick={() => handleApproveVideo(sub.id)}
                            className="bg-primary text-dark font-bold px-4 py-1 rounded hover:bg-primary/90 transition-colors"
                          >
                            موافقة
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        ) : activeTab === 'coaches' ? (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">إضافة مدربين عن طريق كود JSON</h2>
          <p className="text-gray-400 mb-4 text-center">
            يمكنك نسخ كود JSON الذي يحتوي على مدرب واحد أو قائمة من المدربين ولصقه هنا.
            المدربون الجدد سيظهرون تلقائياً في الصفحة الأولى (رقم 1) بالموقع.
          </p>
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="انسخ كود JSON هنا..."
            className="w-full h-64 bg-dark/50 border border-gray-700 rounded-lg p-4 text-white focus:border-primary focus:outline-none mb-4"
            dir="ltr"
          />
          <button 
            onClick={handleAddCoaches}
            disabled={isSubmittingJson}
            className="w-full py-3 bg-accent text-dark font-bold rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 mb-8"
          >
            {isSubmittingJson ? 'جاري الإضافة...' : 'إضافة المدربين الآن'}
          </button>
          
          <hr className="border-gray-700 mb-8" />
          
          <h2 className="text-2xl font-bold mb-6 text-red-500 text-center">حذف مدرب</h2>
          <p className="text-gray-400 mb-4 text-center">أدخل الـ ID الخاص بالمدرب لحذفه نهائياً من قاعدة البيانات والموقع.</p>
          <div className="flex gap-4">
            <input 
              type="text" 
              id="deleteCoachIdInput"
              placeholder="مثال: 17608292273375"
              className="flex-1 bg-dark/50 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
              dir="ltr"
            />
            <button 
              onClick={async () => {
                const idInput = (document.getElementById('deleteCoachIdInput') as HTMLInputElement).value;
                if (!idInput) return alert('يرجى إدخال ID المدرب');
                if (window.confirm('هل أنت متأكد من حذف هذا المدرب نهائياً؟')) {
                  try {
                    const res = await fetch(`${API_URL}/api/managers/${idInput}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (res.ok) {
                      alert('تم حذف المدرب بنجاح!');
                      (document.getElementById('deleteCoachIdInput') as HTMLInputElement).value = '';
                    } else {
                      alert(`فشل الحذف: ${result.error}`);
                    }
                  } catch (e) {
                    alert('حدث خطأ في الاتصال بالسيرفر');
                  }
                }
              }}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              حذف المدرب
            </button>
          </div>
        </div>
        ) : activeTab === 'coachVideos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ═══ Form - Right ═══ */}
          <div className="glass-panel p-6 rounded-2xl h-fit">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">إضافة / تعديل فيديو مدرب</h2>

            {/* Select Manager */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">اختر المدرب</label>
              <select
                value={cvSelectedManager}
                onChange={e => {
                  setCvSelectedManager(e.target.value);
                  const existing = cvSavedData.find((d: any) => d.managerId === e.target.value);
                  if (existing) {
                    setCvFreeUrl(existing.freeUrl || '');
                    setCvLibraryId(existing.libraryId || '');
                    setCvTokenKey(existing.tokenKey || '');
                    setCvVideoId(existing.videoId || '');
                    setCvImagesInput((existing.images || []).join('\n'));
                  } else {
                    setCvFreeUrl(''); setCvLibraryId(''); setCvTokenKey(''); setCvVideoId(''); setCvImagesInput('');
                  }
                }}
                className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              >
                <option value="">-- اختر مدرباً --</option>
                {coachManagers.map((m: any) => (
                  <option key={m.id || m.managerId} value={String(m.id || m.managerId)}>
                    {m.name || m.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Free Video URL */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-300 mb-1">🎬 فيديو مجاني (YouTube / TikTok)</label>
              <p className="text-xs text-gray-500 mb-2">يظهر قبل الدفع للجميع</p>
              <input
                type="url" value={cvFreeUrl} onChange={e => setCvFreeUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                dir="ltr"
              />
            </div>

            {/* Bunny.net Paid Video */}
            <div className="mb-4 bg-[#1a1e2e] rounded-xl p-4 border border-gray-700">
              <label className="block text-sm font-bold text-[#00c9a7] mb-3">🐰 فيديو مدفوع (Bunny.net)</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Library ID</label>
                  <input
                    type="text" value={cvLibraryId} onChange={e => setCvLibraryId(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-dark/60 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00c9a7] focus:outline-none text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Token Key (API Key)</label>
                  <input
                    type="password" value={cvTokenKey} onChange={e => setCvTokenKey(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-dark/60 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00c9a7] focus:outline-none text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Video ID</label>
                  <input
                    type="text" value={cvVideoId} onChange={e => setCvVideoId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full bg-dark/60 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#00c9a7] focus:outline-none text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-300 mb-1">🖼️ صور تفاصيل التكتيك</label>
              <div className="mb-2">
                <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-bold ${cvIsUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-dark-lighter border border-gray-600 text-white hover:bg-white/10'}`}>
                  {cvIsUploading ? 'جاري الرفع...' : 'رفع صور من الجهاز 📷'}
                  <input
                    type="file" multiple accept="image/*" className="hidden" disabled={cvIsUploading}
                    onChange={async (e) => {
                      if (!e.target.files || !e.target.files.length) return;
                      setCvIsUploading(true);
                      const files = Array.from(e.target.files);
                      const UPLOAD_URL = window.location.hostname === 'localhost'
                        ? `${API_URL}/api/upload` : '/api/upload';
                      const uploaded: string[] = [];
                      for (const file of files) {
                        const base64 = await new Promise<string>((res, rej) => {
                          const r = new FileReader();
                          r.readAsDataURL(file);
                          r.onload = () => res((r.result as string).split(',')[1]);
                          r.onerror = rej;
                        });
                        const resp = await fetch(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) });
                        const d = await resp.json();
                        if (d.success) uploaded.push(d.url);
                      }
                      if (uploaded.length) {
                        setCvImagesInput(prev => prev.trim() ? `${prev.trim()}\n${uploaded.join('\n')}` : uploaded.join('\n'));
                        alert(`تم رفع ${uploaded.length} صور بنجاح!`);
                      }
                      setCvIsUploading(false);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <textarea
                value={cvImagesInput} onChange={e => setCvImagesInput(e.target.value)}
                placeholder="https://... (رابط في كل سطر)"
                className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none h-24 text-sm"
                dir="ltr"
              />
            </div>

            <button
              disabled={!cvSelectedManager || cvIsSaving}
              onClick={async () => {
                if (!cvSelectedManager) return alert('اختر مدرباً أولاً');
                setCvIsSaving(true);
                const images = cvImagesInput.split('\n').map(s => s.trim()).filter(Boolean);
                const entry = {
                  managerId: cvSelectedManager,
                  freeUrl: cvFreeUrl,
                  libraryId: cvLibraryId,
                  tokenKey: cvTokenKey,
                  videoId: cvVideoId,
                  images,
                  updatedAt: new Date().toISOString()
                };
                const existing = cvSavedData.filter((d: any) => d.managerId !== cvSelectedManager);
                const updated = [entry, ...existing];
                localStorage.setItem('coachVideosData', JSON.stringify(updated));
                setCvSavedData(updated);
                try {
                  await fetch(`${API_URL}/api/coach-videos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry)
                  });
                } catch (e) {}
                setCvIsSaving(false);
                alert('تم الحفظ بنجاح! ✅');
              }}
              className="w-full py-3 bg-accent text-dark font-black rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {cvIsSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </button>
          </div>

          {/* ═══ Preview - Left ═══ */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">معاينة</h2>

            {/* Selected manager info */}
            <div className="mb-5 p-4 bg-[#1a1e2e] rounded-xl border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">المدرب المختار</p>
              <p className="text-white font-bold text-lg">
                {cvSelectedManager
                  ? (coachManagers.find((m: any) => String(m.id || m.managerId) === cvSelectedManager)?.name || '—')
                  : 'لم يتم الاختيار بعد'}
              </p>
            </div>

            {/* Free Video Preview */}
            {cvFreeUrl && (
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-2 font-bold">📺 معاينة الفيديو المجاني</p>
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-700" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={cvFreeUrl.includes('youtu') ? `https://www.youtube.com/embed/${cvFreeUrl.split('v=')[1]?.split('&')[0] || cvFreeUrl.split('/').pop()?.split('?')[0]}` : cvFreeUrl}
                    title="Free Video Preview" frameBorder="0" allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Bunny Video Info */}
            {(cvLibraryId || cvVideoId) && (
              <div className="mb-5 p-4 bg-[#0f1f17] rounded-xl border border-[#00c9a7]/30">
                <p className="text-xs text-[#00c9a7] mb-2 font-bold">🐰 بيانات Bunny.net</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Library ID: <span className="text-white font-mono" dir="ltr">{cvLibraryId || '—'}</span></p>
                  <p className="text-gray-300">Video ID: <span className="text-white font-mono text-xs" dir="ltr">{cvVideoId || '—'}</span></p>
                  {cvLibraryId && cvVideoId && (
                    <p className="text-gray-300 text-xs">Embed URL: <span className="text-[#00c9a7] font-mono text-xs" dir="ltr">{`https://iframe.mediadelivery.net/embed/${cvLibraryId}/${cvVideoId}`}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Images Preview */}
            {cvImagesInput.trim() && (
              <div>
                <p className="text-xs text-gray-400 mb-2 font-bold">🖼️ معاينة الصور ({cvImagesInput.split('\n').filter(Boolean).length})</p>
                <div className="grid grid-cols-2 gap-3">
                  {cvImagesInput.split('\n').filter(Boolean).map((url, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl border border-gray-700 h-28">
                      <img
                        src={url.trim()}
                        alt={`image-${i}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i}/300/200`; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved entries */}
            {cvSavedData.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-gray-400 font-bold mb-2">📋 المحفوظات ({cvSavedData.length})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cvSavedData.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-dark/50 rounded-lg border border-gray-800 text-sm">
                      <span className="text-white font-bold">
                        {coachManagers.find((m: any) => String(m.id || m.managerId) === d.managerId)?.name || d.managerId}
                      </span>
                      <span className="text-gray-500 text-xs">{d.images?.length || 0} صور</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        ) : activeTab === 'support' ? (
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
                <div className="p-4 border-b border-gray-800 bg-dark/60 font-bold text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  المحادثة مع: {chatUsers.find(u => u.userId === selectedUserId)?.userName}
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
        ) : null}
      </div>
    </div>
  );
};

export default Admin;

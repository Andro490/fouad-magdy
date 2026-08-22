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
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'coaches' | 'support'>('products');
  
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
    // Load from API
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {
        // fallback to localStorage
        const storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        setProducts(storedProducts);
      });
    const storedVideos = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
    setVideoSubmissions(storedVideos);
  }, [isAuthenticated, user, navigate]);

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
      const res = await fetch(`${API_URL}/api/chat/users`);
      if (res.ok) setChatUsers(await res.json());
    } catch (e) {}
  };

  const fetchAdminMessages = async (userId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/chat/messages?userId=${userId}`);
      if (res.ok) setAdminMessages(await res.json());
    } catch (e) {}
  };

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedUserId) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleApproveVideo = (id: string) => {
    const updatedSubmissions = videoSubmissions.map(sub => {
      if (sub.id === id && sub.status === 'PENDING') {
        // Also update the streamer's coins in users localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === sub.streamerId);
        if (userIndex !== -1) {
          users[userIndex].coins = (users[userIndex].coins || 0) + sub.earnedCoins;
          localStorage.setItem('users', JSON.stringify(users));
        }
        return { ...sub, status: 'APPROVED' };
      }
      return sub;
    });
    setVideoSubmissions(updatedSubmissions);
    localStorage.setItem('videoSubmissions', JSON.stringify(updatedSubmissions));
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
            className="w-full h-96 bg-dark/50 border border-gray-700 rounded-lg p-4 text-white focus:border-primary focus:outline-none mb-4"
            dir="ltr"
          />
          <button 
            onClick={handleAddCoaches}
            disabled={isSubmittingJson}
            className="w-full py-3 bg-accent text-dark font-bold rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
          >
            {isSubmittingJson ? 'جاري الإضافة...' : 'إضافة المدربين الآن'}
          </button>
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

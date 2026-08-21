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
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'coaches'>('products');
  
  const [jsonInput, setJsonInput] = useState('');
  const [isSubmittingJson, setIsSubmittingJson] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
    const storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    setProducts(storedProducts);
    const storedVideos = JSON.parse(localStorage.getItem('videoSubmissions') || '[]');
    setVideoSubmissions(storedVideos);
  }, [isAuthenticated, user, navigate]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: StoreProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: Number(price),
      image
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('storeProducts', JSON.stringify(updatedProducts));
    
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    alert('تم إضافة المنتج بنجاح');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('storeProducts', JSON.stringify(updatedProducts));
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
                <label className="block text-sm font-medium text-gray-300 mb-2">رابط الصورة (URL)</label>
                <input type="url" value={image} onChange={e => setImage(e.target.value)} required
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Admin;

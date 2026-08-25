import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import type { StoreProduct } from '../../pages/Store';

const StoreManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        let fetched = Array.isArray(data) ? data : [];
        if (user?.role === 'SELLER') {
          fetched = fetched.filter((p: any) => p.sellerId === user.id);
        }
        setProducts(fetched);
      })
      .catch(() => {
        let storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        if (user?.role === 'SELLER') {
          storedProducts = storedProducts.filter((p: any) => p.sellerId === user.id);
        }
        setProducts(storedProducts);
      });
  }, [API_URL, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      const uploadedUrls: string[] = [];
      const UPLOAD_URL = window.location.hostname === 'localhost'
        ? `${API_URL}/api/upload` : '/api/upload';
      
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
    
    const newProduct: any = {
      id: Date.now().toString(),
      name,
      description,
      price: Number(price),
      image: parsedImages[0] || '',
      images: parsedImages.length > 0 ? parsedImages : undefined,
      adminPhone: adminPhone.trim() || undefined,
      sellerId: user?.id
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
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
    
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updatedProducts)
    }).catch(() => localStorage.setItem('storeProducts', JSON.stringify(updatedProducts)));
  };

  const handleToggleSoldOut = (id: string) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p
    );
    setProducts(updatedProducts);
    
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updatedProducts)
    }).catch(() => localStorage.setItem('storeProducts', JSON.stringify(updatedProducts)));
  };

  return (
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
  );
};

export default StoreManagement;

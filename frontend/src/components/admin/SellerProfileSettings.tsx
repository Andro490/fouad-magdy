import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const SellerProfileSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/users/${user.id}/profile`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setBio(data.bio || '');
          setScreenshots(data.screenshots || []);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [user?.id, API_URL]);

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
        }
      }
      
      if (uploadedUrls.length > 0) {
        setScreenshots(prev => [...prev, ...uploadedUrls]);
        alert(`تم رفع ${uploadedUrls.length} صور بنجاح!`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('حدث خطأ أثناء الرفع.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone, location, bio, screenshots })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم حفظ البيانات بنجاح!');
      } else {
        alert(data.error || 'حدث خطأ أثناء الحفظ');
      }
    } catch (err) {
      alert('فشل الاتصال بالسيرفر');
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="glass-panel p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">إعدادات ملف البائع</h2>
      <p className="text-gray-400 mb-8 text-center">قم بتحديث بيانات التواصل الخاصة بك وارفع صور للمحادثات مع العملاء كدليل ثقة.</p>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف (تليجرام/واتساب)</label>
            <input 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="+201xxxxxxxxx"
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              dir="ltr" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الموقع الجغرافي / رابط الموقع</label>
            <input 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="مثال: مصر، القاهرة أو رابط موقعك"
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">نبذة عن البائع (وصف أو معلومات إضافية تظهر للعملاء)</label>
          <textarea 
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            placeholder="اكتب نبذة عنك، عن خدمتك، أو أي معلومات تود أن يراها العميل قبل الصور..."
            className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none min-h-[100px]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-300">صور الثقة (محادثات العملاء، تقييمات، الخ)</label>
            <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-bold ${isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-dark-lighter border border-gray-600 text-white hover:bg-white/10'}`}>
              {isUploading ? 'جاري الرفع...' : 'رفع صور 📷'}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </label>
          </div>
          
          {screenshots.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-gray-700 rounded-xl text-center text-gray-500">
              لا توجد صور مرفوعة حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {screenshots.map((url, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-700 h-32">
                  <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveScreenshot(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-accent text-dark font-bold rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] text-lg"
        >
          حفظ التعديلات
        </button>
      </form>
    </div>
  );
};

export default SellerProfileSettings;

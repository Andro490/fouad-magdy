import React, { useState, useEffect } from 'react';

const SubAdminsManagement = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const users = await res.json();
        // Filter users who are SELLERs
        setSellers(users.filter((u: any) => u.role === 'SELLER'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return alert('يرجى ملء جميع الحقول');

    const token = localStorage.getItem('authToken');
    try {
      // The backend accepts an array of users for upserting
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify([{
          name,
          email,
          password,
          role: 'SELLER',
          coins: 0
        }])
      });

      if (res.ok) {
        alert('تم إضافة الأدمن الفرعي بنجاح');
        setName('');
        setEmail('');
        setPassword('');
        fetchSellers();
      } else {
        alert('حدث خطأ أثناء الإضافة');
      }
    } catch (e) {
      alert('تعذر الاتصال بالسيرفر');
    }
  };

  const handleDeleteSeller = async (id: string, userEmail: string) => {
    if (!window.confirm('هل أنت متأكد من إزالة هذا الأدمن الفرعي؟ سيتحول إلى مستخدم عادي.')) return;
    
    const token = localStorage.getItem('authToken');
    try {
      // Demote them to 'USER' instead of deleting them completely, or just send an update
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify([{
          email: userEmail,
          role: 'USER'
        }])
      });

      if (res.ok) {
        alert('تم إزالة الصلاحية بنجاح');
        fetchSellers();
      } else {
        alert('حدث خطأ');
      }
    } catch (e) {
      alert('خطأ في الاتصال');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 text-right w-full" style={{ direction: 'rtl' }}>
      
      {/* List of Sellers */}
      <div className="w-full md:w-2/3 glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">الأدمنين الفرعيين (البائعين)</h2>
        {sellers.length === 0 ? (
          <p className="text-gray-400">لا يوجد أدمنين فرعيين حالياً.</p>
        ) : (
          <div className="space-y-4">
            {sellers.map((seller) => (
              <div key={seller.id} className="bg-dark/40 border border-gray-700 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{seller.name}</h4>
                  <p className="text-sm text-gray-400">{seller.email}</p>
                </div>
                <button 
                  onClick={() => handleDeleteSeller(seller.id, seller.email)}
                  className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors font-bold text-sm"
                >
                  إزالة الصلاحية
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Seller */}
      <div className="w-full md:w-1/3 glass-panel p-6 rounded-2xl h-fit">
        <h2 className="text-2xl font-bold text-white mb-6">إضافة أدمن فرعي</h2>
        <form onSubmit={handleAddSeller} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">اسم الأدمن</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">رقم الهاتف (الآيدي لسهولة الدخول)</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">كلمة المرور</label>
            <input 
              type="text" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary"
              required
              dir="ltr"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-dark font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">
            إضافة الصلاحية
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubAdminsManagement;

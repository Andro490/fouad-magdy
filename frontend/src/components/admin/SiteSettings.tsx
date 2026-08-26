import React, { useState, useEffect } from 'react';

const SiteSettings = () => {
  const [showComingSoonBanner, setShowComingSoonBanner] = useState(true);
  const [paymentPhone, setPaymentPhone] = useState('01000026470');
  const [topupPhone, setTopupPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(data => {
        setShowComingSoonBanner(!!data.showComingSoonBanner);
        if (data.paymentPhone) setPaymentPhone(data.paymentPhone);
        if (data.topupPhone) setTopupPhone(data.topupPhone);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [API_URL]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ showComingSoonBanner, paymentPhone, topupPhone })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch {
      alert('تعذر الاتصال بالسيرفر');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-10">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-8">⚙️ إعدادات الموقع</h2>

      <div className="glass-panel rounded-2xl p-8 space-y-6">

        {/* Payment Phone Number */}
        <div className="bg-dark/40 border border-gray-700 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg">رقم التحويل (فودافون كاش / انستا باي)</h3>
          <p className="text-gray-400 text-sm">هذا الرقم يظهر للعملاء في صفحة الدفع اليدوي. قم بتغييره متى أردت.</p>
          <input
            type="text"
            value={paymentPhone}
            onChange={e => setPaymentPhone(e.target.value)}
            className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-3 text-white text-xl font-bold text-center tracking-widest focus:border-primary focus:outline-none"
            dir="ltr"
            placeholder="01000000000"
          />
        </div>

        {/* Topup Phone Number */}
        <div className="bg-dark/40 border border-gray-700 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg">رقم الشحن في اللعبة (واتساب / تليجرام)</h3>
          <p className="text-gray-400 text-sm">هذا الرقم يظهر للعملاء في المتجر كزر "للشحن في لعبة اضغط هنا".</p>
          <input
            type="text"
            value={topupPhone}
            onChange={e => setTopupPhone(e.target.value)}
            className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-3 text-white text-xl font-bold text-center tracking-widest focus:border-primary focus:outline-none"
            dir="ltr"
            placeholder="+201xxxxxxxxx"
          />
        </div>

        {/* Coming Soon Banner Toggle */}
        <div className="flex items-center justify-between bg-dark/40 border border-gray-700 rounded-xl p-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">بانر "قريباً" في صفحة المدربين</h3>
            <p className="text-gray-400 text-sm">يظهر بانر "قادم قريباً" في أعلى صفحة المدربين.</p>
          </div>
          <button
            onClick={() => setShowComingSoonBanner(prev => !prev)}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
              showComingSoonBanner ? 'bg-primary' : 'bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                showComingSoonBanner ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Current Status */}
        <div className={`px-5 py-3 rounded-xl text-sm font-semibold text-center ${
          showComingSoonBanner 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {showComingSoonBanner 
            ? '✅ البانر ظاهر حالياً في الموقع' 
            : '❌ البانر مخفي حالياً في الموقع'
          }
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-primary text-dark hover:bg-primary/90 disabled:opacity-50'
          }`}
        >
          {saving ? 'جاري الحفظ...' : saved ? '✅ تم الحفظ بنجاح!' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
};

export default SiteSettings;


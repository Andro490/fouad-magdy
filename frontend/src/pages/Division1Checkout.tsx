import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Loader2, Upload, Copy, CheckCheck } from 'lucide-react';

const Division1Checkout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentRate, setCurrentRate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  
  const [receipt, setReceipt] = useState<File | null>(null);
  const [squadImage, setSquadImage] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('01000026470');
  const [depositAmount, setDepositAmount] = useState(100);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.paymentPhone) setPaymentPhone(data.paymentPhone);
        if (data.div1DepositAmount) setDepositAmount(Number(data.div1DepositAmount));
      })
      .catch(() => {});
  }, [API_URL]);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(paymentPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!receipt || !squadImage) {
      alert('يرجى إرفاق إيصال التحويل وصورة التشكيلة');
      setLoading(false);
      return;
    }

    try {
      // 1. Upload both images first
      const receiptUrl = await uploadFile(receipt);
      const squadUrl = await uploadFile(squadImage);

      if (!receiptUrl || !squadUrl) {
        alert('فشل رفع الصور. يرجى المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }

      // 2. Submit the request
      const payload = {
        name,
        phone,
        currentRate,
        deliveryTime,
        receiptImage: receiptUrl,
        squadImage: squadUrl
      };

      const response = await fetch(`${API_URL}/api/division1/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        alert(`❌ حدث خطأ: ${result.error || 'فشل إرسال الطلب'}`);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" style={{ direction: 'rtl' }}>
      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-gradient mb-8 text-center">طلب وصول دفجن 1</h1>
        
        <div className="glass-panel p-6 rounded-2xl mb-8 border border-primary/20">
          <h3 className="text-xl font-bold text-white mb-2">تفاصيل الطلب:</h3>
          <p className="text-gray-300">الخدمة: <span className="text-white font-bold">وصول إلى دفجن 1</span></p>
          <p className="text-gray-300">عربون جدية الاشتراك: <span className="text-accent font-bold text-xl">{depositAmount} جنيه</span></p>
          <p className="text-sm text-gray-500 mt-2">سيتم تحديد باقي المبلغ بعد مراجعة التشكيلة والريت الخاص بك.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الاسم الثلاثي</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف (للتواصل)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">الريت الحالي (Current Rate)</label>
              <input type="text" value={currentRate} onChange={e => setCurrentRate(e.target.value)} required placeholder="مثال: 2750"
                className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مدة التسليم المطلوبة</label>
              <input type="text" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} required placeholder="مثال: 3 أيام"
                className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Payment Number Box */}
            <div className="bg-gradient-to-r from-[#e06c88]/10 to-pink-900/10 border border-[#e06c88]/40 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-2 text-center">قم بتحويل مبلغ <span className="font-bold text-white">{depositAmount} جنيه</span> كعربون على الرقم التالي (فودافون كاش / انستا باي):</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-white tracking-widest" dir="ltr">{paymentPhone}</span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="flex items-center gap-1 px-3 py-2 bg-[#e06c88]/20 border border-[#e06c88]/50 rounded-lg text-[#e06c88] hover:bg-[#e06c88]/30 transition-colors text-sm font-bold"
                >
                  {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">صورة الإيصال (فودافون كاش، انستا باي)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-dark/30 hover:bg-dark/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-400">إيصال التحويل</p>
                    {receipt && <p className="text-accent mt-2 text-xs font-bold text-center px-2 truncate w-full">{receipt.name}</p>}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setReceipt(e.target.files?.[0] || null)} required />
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">صورة تشكيلة الفريق</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-dark/30 hover:bg-dark/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-400">تشكيلة الحساب</p>
                    {squadImage && <p className="text-accent mt-2 text-xs font-bold text-center px-2 truncate w-full">{squadImage.name}</p>}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setSquadImage(e.target.files?.[0] || null)} required />
                </label>
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-l from-[#e06c88] to-[#ff477e] text-white font-black text-lg rounded-xl hover:from-[#ff7b9a] hover:to-[#ff477e] transition-all shadow-[0_0_15px_rgba(224,108,136,0.4)] flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'تأكيد إرسال الطلب'}
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark border border-green-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCheck className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              سيتم مراجعة التشكيلة والتواصل معك على الرقم <strong className="text-white dir-ltr inline-block mx-1">{phone}</strong> للاتفاق على باقي المبلغ وموعد البدء.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-green-500 text-dark font-bold text-lg rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Division1Checkout;

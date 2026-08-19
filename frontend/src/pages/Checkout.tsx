import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Loader2, Upload } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const product = location.state?.product;

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gameId, setGameId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">لا يوجد منتج محدد</h2>
          <button onClick={() => navigate('/store')} className="px-6 py-2 bg-primary text-dark font-bold rounded-lg">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      alert('يرجى إرفاق إيصال التحويل');
      return;
    }

    setLoading(true);
    try {
      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(receipt);
      reader.onloadend = async () => {
        const base64data = reader.result;

        const payload = {
          name,
          phone,
          gameId,
          productName: product.name,
          price: product.price,
          receiptBase64: base64data
        };

        const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwjMxGM_NE0uYAdWT3KuqFS_bQR0EeGKn8wXmD-Y6T3bzOA2ioTY2NX6z0jxcBMJrn6yg/exec';
        
        if (!GOOGLE_SCRIPT_URL) {
          alert('يرجى إضافة رابط Google Script في ملف .env');
          setLoading(false);
          return;
        }

        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          // mode: 'no-cors', // قد نحتاجها إذا كان هناك مشكلة في الـ CORS في جوجل سكربت
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // جوجل سكربت يفضل text/plain أحياناً لتجنب مشاكل CORS
          body: JSON.stringify(payload),
        });

        if (response.ok || response.type === 'opaque') {
          alert('تم إرسال طلبك بنجاح! سيتم مراجعته والتواصل معك.');
          navigate('/store');
        } else {
          alert('حدث خطأ أثناء إرسال الطلب');
        }
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالسيرفر');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 px-4 md:px-10 pb-20 relative" style={{ direction: 'rtl' }}>
      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-gradient mb-8 text-center">إتمام الشراء</h1>
        
        <div className="glass-panel p-6 rounded-2xl mb-8 border border-primary/20">
          <h3 className="text-xl font-bold text-white mb-2">تفاصيل الطلب:</h3>
          <p className="text-gray-300">المنتج: <span className="text-white font-bold">{product.name}</span></p>
          <p className="text-gray-300">المبلغ المطلوب تحويله: <span className="text-accent font-bold text-xl">{product.price} EGP</span></p>
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الـ ID الخاص بك في اللعبة (eFootball ID)</label>
            <input type="text" value={gameId} onChange={e => setGameId(e.target.value)} required
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">صورة إيصال التحويل (فودافون كاش، انستا باي، الخ)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-dark/30 hover:bg-dark/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">اضغط هنا لرفع الصورة</p>
                {receipt && <p className="text-accent mt-2 text-sm font-bold">{receipt.name}</p>}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={e => setReceipt(e.target.files?.[0] || null)} required />
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-dark font-bold rounded-lg hover:bg-accent hover:text-white transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'إرسال الطلب لتأكيد الدفع'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

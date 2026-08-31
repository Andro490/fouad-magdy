import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { AlertTriangle, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ResetPoints = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading' | 'success' | 'error'>('idle');
  const [resultMsg, setResultMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetCount, setResetCount] = useState(0);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : '');

  const handleReset = async () => {
    setStep('loading');
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${API_URL}/api/users/reset-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResetCount(data.usersReset ?? data.count ?? 0);
        setResultMsg(data.message);
        setStep('success');
      } else {
        setErrorMsg(data.error || 'حدث خطأ غير معروف');
        setStep('error');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل الاتصال بالخادم');
      setStep('error');
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="bg-dark-lighter rounded-2xl border border-white/10 p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
          <RotateCcw className="text-red-400" size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">تصفير النقاط الشهري</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            إعادة تعيين نقاط جميع الحسابات في نهاية المسابقة الشهرية
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-5 mb-8 flex gap-3">
        <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-200/80 leading-relaxed">
          <p className="font-bold text-yellow-300 mb-1">تحذير مهم</p>
          <p>
            هذه العملية ستقوم بتصفير نقاط (coins) جميع الأكونتات المسجلة
            في قاعدة البيانات دفعةً واحدة. لا يمكن التراجع عن هذه العملية.
            استخدمها فقط في نهاية كل مسابقة شهرية.
          </p>
        </div>
      </div>

      {/* States */}
      {step === 'idle' && (
        <button
          id="btn-open-reset-confirm"
          onClick={() => setStep('confirm')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
        >
          <RotateCcw size={18} />
          تصفير جميع النقاط
        </button>
      )}

      {step === 'confirm' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
            <AlertTriangle size={22} />
            هل أنت متأكد تمامًا؟
          </div>
          <p className="text-gray-300 text-sm">
            سيتم تصفير نقاط <span className="text-white font-bold">جميع الحسابات</span> في
            قاعدة البيانات. هذا الإجراء لا يمكن التراجع عنه.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              id="btn-confirm-reset"
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-lg transition-all"
            >
              <RotateCcw size={16} />
              نعم، صفّر الكل الآن
            </button>
            <button
              id="btn-cancel-reset"
              onClick={() => setStep('idle')}
              className="bg-dark/60 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold px-6 py-2.5 rounded-lg transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex items-center gap-3 text-gray-300 py-4">
          <Loader2 className="animate-spin text-accent" size={26} />
          <span className="text-lg">جاري تصفير النقاط...</span>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 text-green-400 font-bold text-xl mb-2">
            <CheckCircle size={26} />
            تمت العملية بنجاح! 🎯
          </div>
          <p className="text-gray-300 mb-1">{resultMsg}</p>
          <p className="text-sm text-gray-500 mb-5">
            تم تصفير{' '}
            <span className="text-white font-bold">{resetCount}</span> حساب
            في قاعدة البيانات.
          </p>
          <button
            id="btn-reset-again"
            onClick={() => { setStep('idle'); setResultMsg(''); setResetCount(0); }}
            className="bg-dark/60 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold px-6 py-2.5 rounded-lg transition-all text-sm"
          >
            إغلاق
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xl mb-2">
            <XCircle size={24} />
            فشلت العملية
          </div>
          <p className="text-red-300 text-sm mb-4">{errorMsg}</p>
          <button
            id="btn-retry-reset"
            onClick={() => setStep('idle')}
            className="bg-dark/60 border border-gray-700 hover:border-red-700/50 text-gray-300 hover:text-white font-bold px-6 py-2.5 rounded-lg transition-all text-sm"
          >
            حاول مرة أخرى
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPoints;

import React, { useState, useEffect } from 'react';

const SiteSettings = () => {
  const [showComingSoonBanner, setShowComingSoonBanner] = useState(true);
  const [showTopupButton, setShowTopupButton] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('01000026470');
  const [topupPhone, setTopupPhone] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number>(50); // كم جنيه = 1 دولار
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramWelcomeVideoUrl, setTelegramWelcomeVideoUrl] = useState('');
  const [telegramWelcomeText, setTelegramWelcomeText] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [teamBuilderVideoUrl, setTeamBuilderVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(data => {
        setShowComingSoonBanner(!!data.showComingSoonBanner);
        setShowTopupButton(!!data.showTopupButton);
        if (data.paymentPhone) setPaymentPhone(data.paymentPhone);
        if (data.topupPhone) setTopupPhone(data.topupPhone);
        if (data.exchangeRate) setExchangeRate(Number(data.exchangeRate));
        if (data.telegramBotToken) setTelegramBotToken(data.telegramBotToken);
        if (data.telegramChatId) setTelegramChatId(data.telegramChatId);
        if (data.telegramWelcomeVideoUrl) setTelegramWelcomeVideoUrl(data.telegramWelcomeVideoUrl);
        if (data.telegramWelcomeText) setTelegramWelcomeText(data.telegramWelcomeText);
        if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
        if (data.googleClientId) setGoogleClientId(data.googleClientId);
        if (data.teamBuilderVideoUrl) setTeamBuilderVideoUrl(data.teamBuilderVideoUrl);
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
        body: JSON.stringify({ showComingSoonBanner, showTopupButton, paymentPhone, topupPhone, exchangeRate, telegramBotToken, telegramChatId, telegramWelcomeVideoUrl, telegramWelcomeText, geminiApiKey, googleClientId, teamBuilderVideoUrl })
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

        {/* Exchange Rate */}
        <div className="bg-dark/40 border border-yellow-500/30 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg">💱 سعر الصرف (جنيه مصري مقابل الدولار)</h3>
          <p className="text-gray-400 text-sm">حدد كم جنيه مصري يساوي 1 دولار أمريكي. سيتم تحويل الأسعار تلقائياً للزوار من خارج مصر.</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm whitespace-nowrap">1 USD =</span>
            <input
              type="number"
              value={exchangeRate}
              onChange={e => setExchangeRate(Number(e.target.value))}
              className="flex-1 bg-dark border border-yellow-500/50 rounded-lg px-4 py-3 text-yellow-400 text-xl font-bold text-center focus:border-yellow-400 focus:outline-none"
              dir="ltr"
              min="1"
              placeholder="50"
            />
            <span className="text-gray-400 text-sm whitespace-nowrap">جنيه مصري</span>
          </div>
          <div className="text-center text-xs text-gray-500 bg-dark/50 rounded-lg p-2">
            مثال: لو المنتج بـ 6500 جنيه → سيظهر للزوار من الخارج بـ {(6500 / exchangeRate).toFixed(2)} USD
          </div>
        </div>

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
            placeholder="+201xxxxxxxxx أو @username أو رابط مباشر"
          />
        </div>

        {/* Topup Button Toggle */}
        <div className="flex items-center justify-between bg-dark/40 border border-gray-700 rounded-xl p-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">زر "للشحن في لعبة اضغط هنا"</h3>
            <p className="text-gray-400 text-sm">تفعيل أو إخفاء زر الشحن من صفحة المتجر.</p>
          </div>
          <button
            onClick={() => setShowTopupButton(prev => !prev)}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
              showTopupButton ? 'bg-primary' : 'bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                showTopupButton ? 'right-1' : 'left-1'
              }`}
            />
          </button>
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

        {/* Telegram Config */}
        <div className="bg-dark/40 border border-[#2AABEE]/30 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-[#2AABEE]">✈️</span> إعدادات تليجرام (طلبات الشراء)
          </h3>
          <p className="text-gray-400 text-sm">حدد الـ Token الخاص بالبوت والـ ID لمدير المتجر الذي ستصله الإشعارات لرسائل الدفع اليدوي.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Bot Token</label>
              <input
                type="text"
                value={telegramBotToken}
                onChange={e => setTelegramBotToken(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-[#2AABEE] focus:outline-none"
                dir="ltr"
                placeholder="123456789:ABCdefGHIjklmNOPQRstuvwXYZ"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Admin Chat ID</label>
              <input
                type="text"
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-[#2AABEE] focus:outline-none"
                dir="ltr"
                placeholder="123456789"
              />
            </div>
            <hr className="border-gray-700 my-4" />
            <div>
              <label className="block text-gray-400 text-sm mb-1">رابط فيديو الترحيب (اختياري)</label>
              <input
                type="url"
                value={telegramWelcomeVideoUrl}
                onChange={e => setTelegramWelcomeVideoUrl(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-[#2AABEE] focus:outline-none"
                dir="ltr"
                placeholder="https://example.com/video.mp4"
              />
              <p className="text-xs text-gray-500 mt-1">يجب أن يكون رابط مباشر لملف فيديو بصيغة MP4.</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">رسالة الترحيب (أسفل الفيديو)</label>
              <textarea
                value={telegramWelcomeText}
                onChange={e => setTelegramWelcomeText(e.target.value)}
                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-[#2AABEE] focus:outline-none min-h-[80px]"
                placeholder="أهلاً بك! يرجى الاشتراك في القناة..."
              />
            </div>
          </div>
        </div>

        {/* Gemini AI Key */}
        <div className="bg-dark/40 border border-purple-500/30 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-purple-400">🤖</span> مفتاح Gemini AI (تحليل التشكيلات)
          </h3>
          <p className="text-gray-400 text-sm">أضف مفتاح Gemini API من Google AI Studio لتفعيل ميزة قراءة التشكيلات. المفتاح يُحفظ على السيرفر بشكل آمن.</p>
          <input
            type="password"
            value={geminiApiKey}
            onChange={e => setGeminiApiKey(e.target.value)}
            className="w-full bg-dark border border-purple-500/50 rounded-lg px-4 py-2 text-white text-sm focus:border-purple-400 focus:outline-none"
            dir="ltr"
            placeholder="AIzaSy..."
          />
          {geminiApiKey && (
            <p className="text-green-400 text-xs">✅ المفتاح محفوظ - ميزة Team Builder مفعّلة</p>
          )}
          {!geminiApiKey && (
            <p className="text-yellow-400 text-xs">⚠️ بدون مفتاح لن تعمل ميزة تحليل التشكيلات</p>
          )}
        </div>

        {/* Google Client ID */}
        <div className="bg-dark/40 border border-blue-500/30 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-blue-500">G</span> مفتاح تسجيل الدخول بجوجل (Google Client ID)
          </h3>
          <p className="text-gray-400 text-sm">لإتاحة تسجيل الدخول بحساب جوجل. إذا تركته فارغاً سيتم إخفاء الزر.</p>
          <input
            type="text"
            value={googleClientId}
            onChange={e => setGoogleClientId(e.target.value)}
            className="w-full bg-dark border border-blue-500/50 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
            dir="ltr"
            placeholder="xxxxxx-yyyyyy.apps.googleusercontent.com"
          />
        </div>

        {/* TeamBuilder YouTube Video URL */}
        <div className="bg-dark/40 border border-red-500/30 rounded-xl p-6 space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-red-500">▶️</span> رابط يوتيوب لفيديو (كوّن خطتك)
          </h3>
          <p className="text-gray-400 text-sm">أدخل رابط فيديو اليوتيوب الذي سيظهر في صفحة كون خطتك (TeamBuilder). إذا تركته فارغاً سيظهر الفيديو الافتراضي.</p>
          <input
            type="url"
            value={teamBuilderVideoUrl}
            onChange={e => setTeamBuilderVideoUrl(e.target.value)}
            className="w-full bg-dark border border-red-500/50 rounded-lg px-4 py-2 text-white text-sm focus:border-red-400 focus:outline-none"
            dir="ltr"
            placeholder="https://www.youtube.com/watch?v=..."
          />
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


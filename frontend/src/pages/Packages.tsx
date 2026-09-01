import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const packages = [
  {
    id: 1,
    tier: 'الباقة الأولى',
    name: 'تواصل تليجرام',
    emoji: '💬',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/40',
    glow: 'rgba(59,130,246,0.25)',
    glowHover: 'rgba(59,130,246,0.5)',
    badge: null,
    price: '199',
    currency: 'ج',
    ctaText: 'تواصل على تليجرام',
    ctaIcon: '✈',
    ctaColor: 'bg-blue-500 hover:bg-blue-400',
    ctaShadow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]',
    ctaUrl: 'https://t.me/fouadmgdym',
    desc: 'للي عايز يتطور ويعرف أخطاءه ويحصل على التوجيه المناسب.',
    features: [
      { text: 'تواصل مباشر على تليجرام', highlight: false },
      { text: 'إرسال خطتك ولاعيبتك وتحليلها', highlight: false },
      { text: 'تعديل على الخطة وأحسن أسلوب لعب مناسب ليك', highlight: false },
    ],
    extras: [],
  },
  {
    id: 2,
    tier: 'الباقة الثانية',
    name: 'واتساب شخصي',
    emoji: '📱',
    color: 'from-green-500/25 to-emerald-500/10',
    border: 'border-green-500/50',
    glow: 'rgba(34,197,94,0.25)',
    glowHover: 'rgba(34,197,94,0.5)',
    badge: '🔥 الأكثر طلباً',
    badgeColor: 'bg-green-500/20 text-green-300 border-green-500/40',
    price: '399',
    currency: 'ج',
    ctaText: 'تواصل على واتساب',
    ctaIcon: '📲',
    ctaColor: 'bg-green-500 hover:bg-green-400',
    ctaShadow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]',
    ctaUrl: 'https://wa.me/message/fouadf9',
    desc: 'متابعة أكثر خصوصية وخطة مناسبة لأسلوب لعبك.',
    features: [
      { text: 'تواصل شخصي على واتساب', highlight: false },
      { text: 'التعليمات الفردية المناسبة للخطة', highlight: false },
      { text: 'اختيار أفضل خطة تناسب أسلوب لعبك', highlight: false },
      { text: 'اختيار الخطة بناءً على اللعيبة في فريقك', highlight: false },
      { text: 'تعديلات ونصائح للتشكيلة المناسبة', highlight: false },
    ],
    extras: [],
  },
  {
    id: 3,
    tier: 'الباقة الثالثة',
    name: 'متابعة VIP شهرية',
    emoji: '👑',
    color: 'from-yellow-500/20 to-orange-500/10',
    border: 'border-yellow-500/50',
    glow: 'rgba(234,179,8,0.25)',
    glowHover: 'rgba(234,179,8,0.5)',
    badge: '⭐ VIP',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    price: '999',
    currency: 'ج',
    ctaText: 'اشترك VIP الآن',
    ctaIcon: '👑',
    ctaColor: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400',
    ctaShadow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.7)]',
    ctaUrl: 'https://wa.me/message/fouadf9',
    desc: 'أعلى مستوى من المتابعة — خطة خاصة بيك + دعم لمدة شهر كامل.',
    features: [
      { text: 'كل مميزات الباقة الأولى والثانية', highlight: true },
      { text: 'تواصل مباشر على واتساب طوال الشهر', highlight: false },
      { text: 'خطة خاصة بالكامل بطريقة لعبك', highlight: false },
      { text: 'ضبط التشكيلة والتعليمات بما يناسبك', highlight: false },
      { text: 'تواجد في كميونيتي Discord الخاصة بالبطولات', highlight: false },
      { text: 'متابعة مستمرة لمدة شهر كامل', highlight: false },
      { text: 'دعم فوري لأي مستجدات من مدربين أو لاعبين', highlight: false },
      { text: 'استفسار في أي وقت: الخطة، المدرب، التشكيلة، البكجات', highlight: false },
    ],
    extras: [
      '📋 الخطة والتكتيك',
      '🧑‍🏫 المدرب المناسب',
      '⚽ التشكيلة',
      '📌 التعليمات',
      '🎯 البكجات واختيارات اللاعبين',
    ],
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Packages() {
  return (
    <div className="min-h-screen bg-[#030510] text-white overflow-x-hidden" dir="rtl">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-600/5 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-yellow-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="text-green-300 text-xs font-bold tracking-widest uppercase">FOUAD F9</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 leading-tight tracking-tight">
            باقات{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400">
              التدريب والمتابعة
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            اختار الباقة المناسبة ليك وابدأ رحلتك نحو الاحتراف في eFootball مع فؤاد مجدي
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`
                relative rounded-3xl border ${pkg.border}
                bg-gradient-to-b ${pkg.color}
                backdrop-blur-md overflow-hidden
                transition-all duration-500
                ${pkg.id === 3 ? 'md:-mt-4' : ''}
              `}
              style={{
                boxShadow: `0 0 30px ${pkg.glow}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 50px ${pkg.glowHover}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${pkg.glow}`;
              }}
            >
              {/* Top glow line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${pkg.glow.replace('0.25', '0.8')}, transparent)` }}
              />

              <div className="p-6 sm:p-8">
                {/* Badge */}
                {pkg.badge && (
                  <div className="flex justify-center mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                  </div>
                )}

                {/* Emoji + Tier */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3 + pkg.id * 0.5, ease: 'easeInOut' }}
                    className="text-5xl mb-3"
                  >
                    {pkg.emoji}
                  </motion.div>
                  <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">{pkg.tier}</p>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{pkg.name}</h2>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-black text-white">{pkg.price}</span>
                    <span className="text-xl font-bold text-gray-300 mb-1">{pkg.currency}</span>
                  </div>
                  {pkg.id === 3 && (
                    <p className="text-gray-500 text-xs mt-1">/ شهر كامل</p>
                  )}
                </div>

                {/* Desc */}
                <p className="text-gray-400 text-sm text-center leading-relaxed mb-6 px-2">
                  {pkg.desc}
                </p>

                {/* Divider */}
                <div className="h-px bg-white/5 mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black
                        ${f.highlight ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {f.highlight ? '★' : '✓'}
                      </span>
                      <span className={`text-sm leading-snug ${f.highlight ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Extras (VIP only) */}
                {pkg.extras.length > 0 && (
                  <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-yellow-400 text-xs font-bold mb-3 tracking-wider">يشمل الاستفسار عن:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {pkg.extras.map((ex, i) => (
                        <span key={i} className="text-gray-300 text-xs">{ex}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <motion.a
                  href={pkg.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    w-full flex items-center justify-center gap-2
                    py-3.5 rounded-2xl font-black text-sm tracking-wide
                    text-white transition-all duration-300
                    ${pkg.ctaColor} ${pkg.ctaShadow}
                  `}
                >
                  <span>{pkg.ctaIcon}</span>
                  {pkg.ctaText}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-2xl">🎮</span>
            <div className="text-right">
              <p className="text-white font-bold text-sm">مش عارف تختار؟</p>
              <p className="text-gray-400 text-xs">تواصل معايا على تليجرام وهنساعدك تختار الأنسب ليك</p>
            </div>
            <motion.a
              href="https://t.me/fouadmgdym"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all duration-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              تواصل الآن ✈
            </motion.a>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

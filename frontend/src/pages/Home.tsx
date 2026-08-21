import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import fouadImg from '../assets/FOUAD.png';
import backgrondImg from '../assets/backgrond.png';
import type { StoreProduct } from './Store';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const STATS = [
  { value: '+50K', label: 'Subscribers', sub: 'YouTube' },
  { value: '+200', label: 'Videos', sub: 'Published' },
  { value: 'F9', label: 'Community', sub: 'eFootball' },
  { value: '#1', label: 'Creator', sub: 'eFootball' },
];

const EXPERIENCES = [
  { num: '01', icon: '⚽', title: 'eFootball', desc: 'أفضل محتوى eFootball في المنطقة العربية مع تحليل عميق للعبة والتكتيكات.' },
  { num: '02', icon: '🎮', title: 'Gameplay', desc: 'مباريات حصرية، مهارات ومراجعات لأحدث تحديثات اللعبة أول بأول.' },
  { num: '03', icon: '🏆', title: 'Challenges', desc: 'تحديات ومسابقات حصرية مع جوائز قيمة لأعضاء مجتمع F9.' },
  { num: '04', icon: '📺', title: 'Football', desc: 'تحليل كرة القدم الحقيقية وربطها بعالم eFootball بأسلوب مميز.' },
];

const SOCIALS = [
  { label: 'YouTube', url: 'https://www.youtube.com/@fouadf9/', color: 'hover:text-red-500', icon: '▶' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@fouadf9', color: 'hover:text-white', icon: '♪' },
  { label: 'Telegram', url: 'https://t.me/fouadf9', color: 'hover:text-blue-400', icon: '✈' },
  { label: 'Facebook', url: 'https://facebook.com', color: 'hover:text-blue-500', icon: 'f' },
];

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <motion.div variants={itemUp}
      className="group flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-800 shadow-sm hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300">
      <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
        {value}
      </span>
      <span className="text-gray-200 text-xs font-bold tracking-widest uppercase">{label}</span>
      <span className="text-gray-400 text-[10px] uppercase tracking-wider">{sub}</span>
    </motion.div>
  );
}

function SectionTitle({ en, ar, accent }: { en: string; ar: string; accent?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12 md:mb-16"
    >
      <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-80">{ar}</p>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
        {en.split(' ').map((w, i) =>
          accent && w.toUpperCase() === accent.toUpperCase()
            ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"> {w}</span>
            : <span key={i}> {w}</span>
        )}
      </h2>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: 64 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-4 mx-auto h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full" 
      />
    </motion.div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    setProducts(stored.filter((p: StoreProduct) => !p.isSoldOut).slice(0, 4));
  }, []);

  return (
    <div className="min-h-screen bg-[#030510] text-gray-100 font-sans overflow-hidden" dir="rtl">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20"
               style={{
                 backgroundImage: `url(${backgrondImg})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}>
        
        {/* Dark Overlay over the background */}
        <div className="absolute inset-0 bg-[#030510]/50 z-0 pointer-events-none" />

        {/* Two-column hero layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-6">

          {/* LEFT — Fouad Image (Floating) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full md:w-1/2 flex justify-center md:justify-start relative"
          >
            <div className="relative animate-float">
              {/* Soft shadow below the floating image */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-900/20 blur-xl rounded-[100%]" />
              <img
                src={fouadImg}
                alt="Fouad F9"
                className="relative z-10 w-72 sm:w-96 md:w-full max-w-md object-contain drop-shadow-[0_15px_35px_rgba(59,130,246,0.25)]"
              />
            </div>
          </motion.div>

          {/* RIGHT — Text */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="w-full md:w-1/2 text-right"
          >
            {/* Badge */}
            <motion.div variants={itemUp} className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
              <span className="text-blue-300 text-xs font-bold tracking-widest uppercase">Official Website</span>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={staggerContainer}>
              <motion.p variants={itemUp} className="text-gray-400 text-base md:text-lg font-semibold tracking-[0.2em] uppercase mb-3">FOUAD F9</motion.p>
              <motion.h1 variants={itemUp} className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter mb-1 text-white">PLAY.</motion.h1>
              <motion.h1 variants={itemUp} className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter mb-1 text-white">WIN.</motion.h1>
              <motion.h1 variants={itemUp} className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400 mb-6 drop-shadow-lg">
                DOMINATE.
              </motion.h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={itemUp} className="mb-8">
              <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-medium">
                مرحبًا بك في عالم Fouad F9 — محتوى eFootball، تحديات، Gameplay<br />
                وتجارب مميزة لعشاق كرة القدم والألعاب.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemUp} className="flex flex-col sm:flex-row items-center md:justify-end gap-4">
              <a
                href="https://www.youtube.com/@fouadf9/"
                target="_blank"
                rel="noreferrer"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-white hover:bg-gray-200 text-[#030510] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-1"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">▶</span>
                شاهد القناة
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </a>
              <Link
                to="/store"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-gray-900/60 backdrop-blur-md border border-gray-700 text-gray-200 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:-translate-y-1"
              >
                🛒 المتجر الحصري
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="relative z-10 mt-12 md:mt-16 flex flex-wrap justify-center gap-4 px-4"
        >
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </motion.div>

        {/* Scroll hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
        >
          <span className="text-xs text-gray-400 tracking-widest uppercase font-bold">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent" />
        </motion.div>
      </section>

      {/* ── F9 EXPERIENCE ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-[#030510] border-t border-gray-900 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionTitle en="THE F9 EXPERIENCE" ar="تجربة مميزة" accent="EXPERIENCE" />
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {EXPERIENCES.map((ex) => (
              <motion.div variants={itemUp} key={ex.num}
                className="group relative p-8 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow-sm hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-500 hover:-translate-y-2 cursor-default">
                <span className="text-5xl font-black text-gray-800/50 group-hover:text-blue-500/10 transition-colors duration-300 absolute top-4 right-4">{ex.num}</span>
                <motion.span whileHover={{ scale: 1.2, rotate: 5 }} className="text-4xl block mb-4 relative z-10 drop-shadow-md origin-center">{ex.icon}</motion.span>
                <h3 className="text-xl font-black text-white mb-3 tracking-wide relative z-10 group-hover:text-blue-300 transition-colors">{ex.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed relative z-10">{ex.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STORE SECTION ───────────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="relative py-24 px-4 bg-gray-950/50 border-t border-gray-900 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <SectionTitle en="PREMIUM STORE" ar="المتجر الحصري" accent="STORE" />
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-gray-400 text-sm -mt-8 mb-12 max-w-xl mx-auto"
            >
              اكتشف منتجات وخدمات Fouad F9 واستمتع بتجربة eFootball بشكل مختلف.
            </motion.p>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.map(p => (
                <motion.div variants={itemUp} key={p.id}
                  className="group relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 shadow-sm hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-400 hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden bg-gray-950">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">⚽</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white text-base mb-2 truncate group-hover:text-green-300 transition-colors">{p.name}</h3>
                    <p className="text-gray-400 text-xs mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 font-black text-lg">{p.price} EGP</span>
                      <Link to="/store" className="text-xs font-bold px-4 py-2 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors">عرض</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Link to="/store" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-gray-200 text-[#030510] font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all duration-300">
                عرض جميع المنتجات ←
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── ABOUT ───────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-[#030510] border-t border-gray-900 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative flex justify-center order-2 md:order-1"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-gray-900/50 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.1)] flex items-center justify-center border border-gray-800">
                <div className="text-center">
                  <motion.div 
                    animate={{ rotate: [0, -10, 10, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} 
                    className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    🎮
                  </motion.div>
                  <span className="text-gray-500 font-medium">Fouad F9</span>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 md:order-2 text-right"
            >
              <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-80">WHO IS FOUAD?</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                FOUAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">F9</span>
              </h2>
              <p className="text-gray-400 text-sm mb-1 font-medium">Gaming Creator • eFootball Content Creator</p>
              <p className="text-gray-300 leading-relaxed mt-5 text-sm md:text-base">
                فواد F9 هو صانع محتوى متخصص في eFootball، يقدم محتوى احترافيًا يشمل مراجعات اللاعبين، التكتيكات، الـ Gameplay، والتحديات الحصرية. يهدف إلى بناء مجتمع قوي من عشاق كرة القدم الإلكترونية.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                {SOCIALS.map((s, idx) => (
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    key={s.label} href={s.url} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900/50 border border-gray-800 text-gray-300 text-sm font-bold shadow-sm hover:border-gray-600 hover:shadow-md ${s.color} transition-all duration-300`}
                  >
                    <span>{s.icon}</span> {s.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 bg-gray-950/50 border-t border-gray-900 overflow-hidden">
        {/* Glow behind CTA */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[300px] bg-gradient-to-r from-blue-900/30 to-green-900/30 blur-[100px] pointer-events-none" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-80">JOIN US</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">F9</span> COMMUNITY
          </h2>
          <p className="text-gray-300 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            كن جزءًا من مجتمع Fouad F9 وتابع أحدث الفيديوهات والتحديات والعروض الحصرية.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://t.me/fouadf9" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300"
            >
              ✈ انضم للمجتمع
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://www.youtube.com/@fouadf9/" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-gray-900/80 backdrop-blur-sm border-2 border-red-900/50 text-red-500 font-bold hover:bg-red-900/20 hover:border-red-500 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300"
            >
              ▶ اشترك على YouTube
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative bg-[#030510] border-t border-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="text-center md:text-right">
              <div className="text-2xl font-black text-white">FOUAD <span className="text-blue-500">F9</span></div>
              <p className="text-gray-500 text-xs mt-1 font-medium">Gaming • Football • Community</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400">
              {[['الرئيسية', '/'], ['المتجر', '/store'], ['المدربين', '/products'], ['لوحة المحتوى', '/leaderboard'], ['تسجيل الدخول', '/login']].map(([label, path]) => (
                <Link key={label} to={path} className="hover:text-blue-400 transition-colors">{label}</Link>
              ))}
            </div>
            <div className="flex gap-3">
              {SOCIALS.map(s => (
                <motion.a 
                  whileHover={{ y: -5 }}
                  key={s.label} href={s.url} target="_blank" rel="noreferrer"
                  className={`w-10 h-10 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-gray-500 shadow-sm ${s.color} hover:border-gray-600 hover:shadow-md transition-all duration-300`}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 text-center">
            <p className="text-gray-600 text-xs font-medium">© 2026 Fouad F9. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Animations CSS for floating image since CSS keyframes are slightly smoother for continuous float than react-spring sometimes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

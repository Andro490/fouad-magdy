import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import fouadImg from '../assets/FOUAD.png';
import patternImg from '../assets/pattern.png';
import type { StoreProduct } from './Store';

gsap.registerPlugin(ScrollTrigger);

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
  { label: 'TikTok', url: 'https://www.tiktok.com/@fouadf9', color: 'hover:text-pink-400', icon: '♪' },
  { label: 'Telegram', url: 'https://t.me/fouadf9', color: 'hover:text-blue-400', icon: '✈' },
  { label: 'Facebook', url: 'https://facebook.com', color: 'hover:text-blue-500', icon: 'f' },
];

// ─── ANIMATED COUNTER ───────────────────────────────────────────────────────
function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="group flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-white/8 transition-all duration-300">
      <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
        {value}
      </span>
      <span className="text-white text-xs font-bold tracking-widest uppercase">{label}</span>
      <span className="text-gray-500 text-[10px] uppercase tracking-wider">{sub}</span>
    </div>
  );
}

// ─── SECTION TITLE ───────────────────────────────────────────────────────────
function SectionTitle({ en, ar, accent }: { en: string; ar: string; accent?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <p className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-70">{ar}</p>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
        {en.split(' ').map((w, i) =>
          accent && w.toUpperCase() === accent.toUpperCase()
            ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"> {w}</span>
            : <span key={i}> {w}</span>
        )}
      </h2>
      <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    // Load real products from localStorage
    const stored = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    setProducts(stored.filter((p: StoreProduct) => !p.isSoldOut).slice(0, 4));

    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(headingRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(subRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
      .fromTo(btnsRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.4')
      .fromTo(statsRef.current?.children ? Array.from(statsRef.current.children) : [],
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 }, '-=0.3');

    // Scroll reveal sections
    gsap.utils.toArray<HTMLElement>('.reveal-up').forEach(el => {
      gsap.fromTo(el, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #060c1f 0%, #091428 40%, #0a1a3a 70%, #060c1f 100%)' }} dir="rtl">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">

        {/* Pattern Background with fade animation */}
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
             style={{
               backgroundImage: `url(${patternImg})`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               animation: 'patternFade 5s ease-in-out infinite alternate'
             }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,180,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,1) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />

        {/* Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Two-column hero layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-6" dir="rtl">

          {/* LEFT — Fouad Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start relative">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full scale-75" />
            <img
              src={fouadImg}
              alt="Fouad F9"
              className="relative z-10 w-72 sm:w-96 md:w-full max-w-md object-contain drop-shadow-[0_0_60px_rgba(0,180,255,0.3)]"
              style={{ filter: 'drop-shadow(0 0 40px rgba(0,150,255,0.25))' }}
            />
          </div>

          {/* RIGHT — Text */}
          <div className="w-full md:w-1/2 text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/5 border border-cyan-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Official Website</span>
            </div>

            {/* Main heading */}
            <div ref={headingRef}>
              <p className="text-gray-400 text-base md:text-lg font-semibold tracking-[0.2em] uppercase mb-3">FOUAD F9</p>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter mb-1">PLAY.</h1>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter mb-1">WIN.</h1>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-6">
                DOMINATE.
              </h1>
            </div>

            {/* Subtitle */}
            <div ref={subRef} className="mb-8">
              <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed">
                مرحبًا بك في عالم Fouad F9 — محتوى eFootball، تحديات، Gameplay<br />
                وتجارب مميزة لعشاق كرة القدم والألعاب.
              </p>
          </div>

            {/* CTA Buttons */}
            <div ref={btnsRef} className="flex flex-col sm:flex-row items-center md:justify-end gap-4">
              <a
                href="https://www.youtube.com/@fouadf9/"
                target="_blank"
                rel="noreferrer"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:-translate-y-1"
              >
                <span className="text-xl">▶</span>
                شاهد القناة على YouTube
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </a>
              <Link
                to="/store"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-white/5 border border-cyan-500/30 text-cyan-300 backdrop-blur-sm hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all duration-300 hover:-translate-y-1"
              >
                🛒 استكشف المتجر
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="relative z-10 mt-12 md:mt-16 flex flex-wrap justify-center gap-3 px-4">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ── F9 EXPERIENCE ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="reveal-up">
            <SectionTitle en="THE F9 EXPERIENCE" ar="تجربة مميزة" accent="EXPERIENCE" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERIENCES.map((ex) => (
              <div key={ex.num}
                className="reveal-up group relative p-6 rounded-2xl bg-white/3 border border-white/8 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-white/6 transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-default">
                {/* glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 to-blue-600/5" />
                <span className="text-4xl font-black text-white/10 group-hover:text-cyan-500/20 transition-colors duration-300 block mb-4 leading-none">{ex.num}</span>
                <span className="text-3xl block mb-3">{ex.icon}</span>
                <h3 className="text-lg font-black text-white mb-2 tracking-wide">{ex.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORE SECTION ───────────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="reveal-up">
              <SectionTitle en="F9 PREMIUM STORE" ar="المتجر الحصري" accent="STORE" />
              <p className="text-center text-gray-400 text-sm -mt-8 mb-12 max-w-xl mx-auto">
                اكتشف منتجات وخدمات Fouad F9 واستمتع بتجربة eFootball بشكل مختلف.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id}
                  className="reveal-up group relative rounded-2xl overflow-hidden bg-white/3 border border-white/8 hover:border-cyan-500/30 transition-all duration-400 hover:-translate-y-2">
                  <div className="relative h-44 overflow-hidden bg-dark">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">⚽</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1 truncate">{p.name}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-black text-base">{p.price} EGP</span>
                      <Link to="/store" className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">عرض</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10 reveal-up">
              <Link to="/store" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:-translate-y-1 transition-all duration-300">
                عرض جميع المنتجات ←
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT ───────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/8 blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="reveal-up grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="relative flex justify-center order-2 md:order-1">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-3">🎮</div>
                  <span className="text-white/40 text-sm">Fouad F9</span>
                </div>
                {/* Rim light effects */}
                <div className="absolute inset-0 rounded-3xl border border-cyan-500/20 pointer-events-none" />
                <div className="absolute -right-4 top-1/4 w-2 h-32 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0 blur-sm" />
                <div className="absolute -left-4 top-1/3 w-2 h-24 bg-gradient-to-b from-purple-400/0 via-purple-400/50 to-purple-400/0 blur-sm" />
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2 text-right">
              <p className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-70">WHO IS FOUAD?</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">FOUAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">F9</span></h2>
              <p className="text-gray-400 text-sm mb-1">Gaming Creator • eFootball Content Creator</p>
              <p className="text-gray-300 leading-relaxed mt-4 text-sm md:text-base">
                فواد F9 هو صانع محتوى متخصص في eFootball، يقدم محتوى احترافيًا يشمل مراجعات اللاعبين، التكتيكات، الـ Gameplay، والتحديات الحصرية. يهدف إلى بناء مجتمع قوي من عشاق كرة القدم الإلكترونية.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold backdrop-blur-sm hover:border-white/20 hover:bg-white/8 ${s.color} transition-all duration-300`}>
                    <span>{s.icon}</span> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center reveal-up">
          <p className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-70">JOIN US</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">F9</span> COMMUNITY
          </h2>
          <p className="text-gray-300 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            كن جزءًا من مجتمع Fouad F9 وتابع أحدث الفيديوهات والتحديات والعروض الحصرية.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://t.me/fouadf9" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:-translate-y-1 transition-all duration-300">
              ✈ انضم للمجتمع
            </a>
            <a href="https://www.youtube.com/@fouadf9/" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-white/5 border border-red-500/30 text-red-400 font-bold backdrop-blur-sm hover:bg-red-500/10 hover:border-red-400 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:-translate-y-1 transition-all duration-300">
              ▶ اشترك على YouTube
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-right">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">FOUAD F9</div>
              <p className="text-gray-600 text-xs mt-1">Gaming • Football • Community</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              {[['الرئيسية', '/'], ['المتجر', '/store'], ['المدربين', '/products'], ['لوحة المحتوى', '/leaderboard'], ['تسجيل الدخول', '/login']].map(([label, path]) => (
                <Link key={label} to={path} className="hover:text-cyan-400 transition-colors">{label}</Link>
              ))}
            </div>
            <div className="flex gap-3">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                  className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm text-gray-400 ${s.color} hover:border-white/20 hover:bg-white/8 transition-all duration-300`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center">
            <p className="text-gray-700 text-xs">© 2026 Fouad F9. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes patternFade {
          0% { opacity: 0.05; transform: scale(1.02); }
          100% { opacity: 0.4; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

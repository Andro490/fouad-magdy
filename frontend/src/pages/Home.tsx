import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import fouadImg from '../assets/FOUAD.png';
import patternImg from '../assets/pattern.png';
import backgrondImg from '../assets/backgrond.png';
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
  { label: 'TikTok', url: 'https://www.tiktok.com/@fouadf9', color: 'hover:text-white', icon: '♪' },
  { label: 'Telegram', url: 'https://t.me/fouadf9', color: 'hover:text-blue-400', icon: '✈' },
  { label: 'Facebook', url: 'https://facebook.com', color: 'hover:text-blue-500', icon: 'f' },
];

function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="group flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-gray-800 border border-gray-700 shadow-sm hover:border-green-400/40 hover:shadow-md transition-all duration-300">
      <span className="text-2xl md:text-3xl font-black text-green-400">
        {value}
      </span>
      <span className="text-gray-200 text-xs font-bold tracking-widest uppercase">{label}</span>
      <span className="text-gray-400 text-[10px] uppercase tracking-wider">{sub}</span>
    </div>
  );
}

function SectionTitle({ en, ar, accent }: { en: string; ar: string; accent?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <p className="text-green-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-80">{ar}</p>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
        {en.split(' ').map((w, i) =>
          accent && w.toUpperCase() === accent.toUpperCase()
            ? <span key={i} className="text-green-400"> {w}</span>
            : <span key={i}> {w}</span>
        )}
      </h2>
      <div className="mt-4 mx-auto w-16 h-1 bg-green-500 rounded-full" />
    </div>
  );
}

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
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans" dir="rtl">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
               style={{
                 backgroundImage: `url(${backgrondImg})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}>
        
        {/* Dark Overlay over the background to make text readable */}
        <div className="absolute inset-0 bg-gray-950/70 z-0 pointer-events-none" />

        {/* Pattern Background with fade animation */}
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-5"
             style={{
               backgroundImage: `url(${patternImg})`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               animation: 'patternFade 5s ease-in-out infinite alternate'
             }} />

        {/* Soft glow accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-800/30 rounded-full blur-[100px] pointer-events-none" />

        {/* Two-column hero layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-6">

          {/* LEFT — Fouad Image (Floating) */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start relative">
            <div className="relative animate-float">
              {/* Soft shadow below the floating image */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-xl rounded-[100%]" />
              <img
                src={fouadImg}
                alt="Fouad F9"
                className="relative z-10 w-72 sm:w-96 md:w-full max-w-md object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {/* RIGHT — Text */}
          <div className="w-full md:w-1/2 text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-green-900/30 border border-green-800 shadow-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-xs font-bold tracking-widest uppercase">Official Website</span>
            </div>

            {/* Main heading */}
            <div ref={headingRef}>
              <p className="text-gray-400 text-base md:text-lg font-semibold tracking-[0.2em] uppercase mb-3">FOUAD F9</p>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter mb-1 text-white">PLAY.</h1>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter mb-1 text-white">WIN.</h1>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter text-green-500 mb-6">
                DOMINATE.
              </h1>
            </div>

            {/* Subtitle */}
            <div ref={subRef} className="mb-8">
              <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-medium">
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
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-white hover:bg-gray-200 text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <span className="text-xl">▶</span>
                شاهد القناة
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </a>
              <Link
                to="/store"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-gray-800 border-2 border-gray-700 text-gray-200 hover:border-green-500 hover:text-green-400 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                🛒 المتجر الحصري
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="relative z-10 mt-12 md:mt-16 flex flex-wrap justify-center gap-4 px-4">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-xs text-gray-500 tracking-widest uppercase font-bold">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ── F9 EXPERIENCE ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="reveal-up">
            <SectionTitle en="THE F9 EXPERIENCE" ar="تجربة مميزة" accent="EXPERIENCE" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERIENCES.map((ex) => (
              <div key={ex.num}
                className="reveal-up group relative p-8 rounded-2xl bg-gray-900 border border-gray-800 shadow-sm hover:border-green-500 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-default">
                <span className="text-5xl font-black text-gray-800 group-hover:text-green-900/30 transition-colors duration-300 absolute top-4 right-4">{ex.num}</span>
                <span className="text-4xl block mb-4 relative z-10">{ex.icon}</span>
                <h3 className="text-xl font-black text-white mb-3 tracking-wide relative z-10">{ex.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed relative z-10">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORE SECTION ───────────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="relative py-24 px-4 bg-gray-900 border-t border-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="reveal-up">
              <SectionTitle en="PREMIUM STORE" ar="المتجر الحصري" accent="STORE" />
              <p className="text-center text-gray-400 text-sm -mt-8 mb-12 max-w-xl mx-auto">
                اكتشف منتجات وخدمات Fouad F9 واستمتع بتجربة eFootball بشكل مختلف.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id}
                  className="reveal-up group relative rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-sm hover:border-green-400 hover:shadow-xl transition-all duration-400 hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">⚽</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white text-base mb-2 truncate">{p.name}</h3>
                    <p className="text-gray-400 text-xs mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-black text-lg">{p.price} EGP</span>
                      <Link to="/store" className="text-xs font-bold px-4 py-2 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors">عرض</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12 reveal-up">
              <Link to="/store" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-gray-200 text-gray-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                عرض جميع المنتجات ←
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT ───────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="reveal-up grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="relative flex justify-center order-2 md:order-1">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-gray-900 shadow-xl flex items-center justify-center border border-gray-800">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <span className="text-gray-600 font-medium">Fouad F9</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2 text-right">
              <p className="text-green-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-80">WHO IS FOUAD?</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">FOUAD <span className="text-green-500">F9</span></h2>
              <p className="text-gray-400 text-sm mb-1 font-medium">Gaming Creator • eFootball Content Creator</p>
              <p className="text-gray-300 leading-relaxed mt-5 text-sm md:text-base">
                فواد F9 هو صانع محتوى متخصص في eFootball، يقدم محتوى احترافيًا يشمل مراجعات اللاعبين، التكتيكات، الـ Gameplay، والتحديات الحصرية. يهدف إلى بناء مجتمع قوي من عشاق كرة القدم الإلكترونية.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-bold shadow-sm hover:border-gray-600 hover:shadow-md ${s.color} transition-all duration-300`}>
                    <span>{s.icon}</span> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-gray-900 border-t border-gray-800 overflow-hidden">
        <div className="relative max-w-3xl mx-auto text-center reveal-up">
          <p className="text-green-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 opacity-80">JOIN US</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            JOIN THE <span className="text-green-500">F9</span> COMMUNITY
          </h2>
          <p className="text-gray-300 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            كن جزءًا من مجتمع Fouad F9 وتابع أحدث الفيديوهات والتحديات والعروض الحصرية.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://t.me/fouadf9" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              ✈ انضم للمجتمع
            </a>
            <a href="https://www.youtube.com/@fouadf9/" target="_blank" rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-gray-800 border-2 border-red-900/50 text-red-500 font-bold hover:bg-red-900/20 hover:border-red-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              ▶ اشترك على YouTube
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative bg-gray-950 border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="text-center md:text-right">
              <div className="text-2xl font-black text-white">FOUAD <span className="text-green-500">F9</span></div>
              <p className="text-gray-400 text-xs mt-1 font-medium">Gaming • Football • Community</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-300">
              {[['الرئيسية', '/'], ['المتجر', '/store'], ['المدربين', '/products'], ['لوحة المحتوى', '/leaderboard'], ['تسجيل الدخول', '/login']].map(([label, path]) => (
                <Link key={label} to={path} className="hover:text-green-400 transition-colors">{label}</Link>
              ))}
            </div>
            <div className="flex gap-3">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                  className={`w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 shadow-sm ${s.color} hover:border-gray-600 hover:shadow-md transition-all duration-300`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-xs font-medium">© 2026 Fouad F9. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes patternFade {
          0% { opacity: 0.05; }
          100% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

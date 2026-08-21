import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';

// Fouad Magdy Channel Data
const CHANNEL_DATA = {
  name: 'فواد ماجدي',
  handle: '@fouadf9',
  tagline: 'يوتيوبر eFootball | حسابات مميزة | كل حاجة بتخص اللعبة',
  avatar: 'https://yt3.googleusercontent.com/ytc/AIdro_mAfU1u0ZfuMY7AwO1P4P_nGgBFuqBNy78UJIFKGjf7Zg=s176-c-k-c0x00ffffff-no-rj',
  links: [
    {
      label: 'قناة يوتيوب',
      url: 'https://www.youtube.com/@fouadf9',
      icon: '▶',
      color: 'from-red-600 to-red-800',
      glow: 'rgba(220,38,38,0.5)',
      border: 'border-red-500/40',
    },
    {
      label: 'مجموعة تيليجرام',
      url: 'https://t.me/fouadf9',
      icon: '✈',
      color: 'from-blue-500 to-blue-700',
      glow: 'rgba(59,130,246,0.5)',
      border: 'border-blue-500/40',
    },
    {
      label: 'سوق الحسابات',
      url: '/store',
      icon: '🛒',
      color: 'from-yellow-400 to-amber-600',
      glow: 'rgba(250,204,21,0.5)',
      border: 'border-yellow-400/40',
      isInternal: true,
    },
    {
      label: 'تواصل على تيك توك',
      url: 'https://www.tiktok.com/@fouadf9',
      icon: '♪',
      color: 'from-pink-500 to-fuchsia-700',
      glow: 'rgba(236,72,153,0.5)',
      border: 'border-pink-500/40',
    },
  ],
};

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
      {value}
    </div>
    <div className="text-xs text-gray-400 mt-1">{label}</div>
  </div>
);

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(avatarRef.current,
      { scale: 0, opacity: 0, rotate: -10 },
      { scale: 1, opacity: 1, rotate: 0, duration: 1, delay: 0.2 }
    )
    .fromTo(nameRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9 },
      '-=0.5'
    )
    .fromTo(statsRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      '-=0.4'
    )
    .fromTo(linksRef.current?.children ? Array.from(linksRef.current.children) : [],
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.12, duration: 0.7 },
      '-=0.3'
    );

    // Floating animation for avatar
    gsap.to(avatarRef.current, {
      y: -12,
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 1.5,
    });
  }, []);

  return (
    <main
      ref={heroRef}
      className="flex-1 flex items-center justify-center pt-20 relative min-h-screen bg-dark text-white overflow-hidden"
      dir="rtl"
    >
      {/* 3D Background */}
      <ThreeBackground />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/5 rounded-full blur-[200px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-12 flex flex-col items-center gap-8">

        {/* Avatar Ring */}
        <div ref={avatarRef} className="relative">
          {/* Spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #facc15, #a855f7, #3b82f6, #ec4899, #facc15)',
              padding: '4px',
              borderRadius: '9999px',
              animation: 'spin 4s linear infinite',
            }}
          />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dark z-10 m-1">
            {!imgError ? (
              <img
                src={CHANNEL_DATA.avatar}
                alt={CHANNEL_DATA.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-dark text-4xl font-black">
                ف
              </div>
            )}
          </div>
          {/* Live badge */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-400 whitespace-nowrap z-20 animate-pulse">
            🔴 مباشر على يوتيوب
          </span>
        </div>

        {/* Name & Handle */}
        <div ref={nameRef} className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
              {CHANNEL_DATA.name}
            </span>
          </h1>
          <p className="text-gray-400 text-base font-mono">{CHANNEL_DATA.handle}</p>
          <p className="text-gray-300 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
            {CHANNEL_DATA.tagline}
          </p>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="flex items-center gap-6 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <StatCard value="+10K" label="متابع" />
          <div className="w-px h-10 bg-white/10" />
          <StatCard value="+500" label="حساب بُيع" />
          <div className="w-px h-10 bg-white/10" />
          <StatCard value="4.9⭐" label="تقييم الخدمة" />
        </div>

        {/* Links */}
        <div ref={linksRef} className="w-full flex flex-col gap-3">
          {CHANNEL_DATA.links.map((link) => {
            const commonClass = `w-full group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-white text-right border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`;
            const inner = (
              <>
                <span
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {link.icon}
                </span>
                <span className="flex-1 text-lg">{link.label}</span>
                <svg className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-[-4px] transition-all duration-300 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            );

            return link.isInternal ? (
              <Link
                key={link.label}
                to={link.url}
                className={`${commonClass} ${link.border} bg-white/5`}
                style={{ '--glow': link.glow } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${link.glow}`;
                  (e.currentTarget as HTMLElement).style.borderColor = link.glow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                }}
              >
                {inner}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`${commonClass} ${link.border} bg-white/5`}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${link.glow}`;
                  (e.currentTarget as HTMLElement).style.borderColor = link.glow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                }}
              >
                {inner}
              </a>
            );
          })}
        </div>

        {/* Footer tag */}
        <p className="text-gray-600 text-xs mt-2">
          © 2025 فواد ماجدي — جميع الحقوق محفوظة
        </p>
      </div>

      {/* Spinning ring keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
};

export default Home;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { siteConfig } from '../../config/siteConfig';
import { staggerContainer, itemUp } from './Shared';
import fouadImg from '../../assets/FOUAD.png';
import backgrondImg from '../../assets/backgrond.png';

// Social Media SVG Icons
const SocialIcons: Record<string, JSX.Element> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/>
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Kick: (
    <svg viewBox="0 0 50 50" fill="currentColor" className="w-5 h-5">
      <path d="M5 5 L5 45 L15 45 L15 30 L20 25 L30 45 L42 45 L27 22 L41 5 L29 5 L15 22 L15 5 Z"/>
    </svg>
  ),
  WhatsApp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  ),
  Telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
};

const socialStyles: Record<string, { bg: string; text: string; ring: string }> = {
  Instagram: { bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400', text: 'text-white', ring: 'ring-pink-400' },
  TikTok:    { bg: 'bg-black', text: 'text-white', ring: 'ring-white' },
  YouTube:   { bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-400' },
  Facebook:  { bg: 'bg-[#1877F2]', text: 'text-white', ring: 'ring-blue-400' },
  Kick:      { bg: 'bg-[#53fc18]', text: 'text-black', ring: 'ring-green-400' },
  WhatsApp:  { bg: 'bg-[#25D366]', text: 'text-white', ring: 'ring-green-300' },
  Telegram:  { bg: 'bg-[#2AABEE]', text: 'text-white', ring: 'ring-blue-300' },
};

// ===================== MOBILE PROFILE CARD =====================
function MobileProfileCard() {
  const [email, setEmail] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const kickUrl = siteConfig.socials.find(s => s.label === 'Kick')?.url || 'https://kick.com';
    window.open(kickUrl, '_blank');
  };

  const totalFollowers = siteConfig.stats[0]?.value || '+51K';

  return (
    <motion.div
      className="md:hidden min-h-screen w-full bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        {/* ── Hero Image full width ── */}
        <div className="relative w-full" style={{ height: '60vh', minHeight: '320px' }}>
          <img
            src={fouadImg}
            alt={siteConfig.name}
            className="w-full h-full object-cover object-top"
          />
          {/* gradient fade into body */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* ── Body ── */}
        <div className="flex-1 px-5 pb-8 -mt-8 relative z-10 bg-black">

          {/* Name + Verified */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-1"
          >
            <h1 className="text-2xl font-black text-white tracking-tight">
              {siteConfig.name}
            </h1>
            {/* Verified badge */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#7C3AED"/>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
            </svg>
          </motion.div>

          {/* Handle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm text-center mb-5"
          >
            @fouadf9
          </motion.p>

          {/* Social Media Icons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            {siteConfig.socials.map((social) => {
              const style = socialStyles[social.label];
              const icon = SocialIcons[social.label];
              if (!icon) return null;
              return (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.label}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${style?.bg ?? 'bg-gray-700'} ${style?.text ?? 'text-white'}
                    shadow-md transition-all duration-200
                    ring-2 ring-transparent hover:ring-2 ${style?.ring ?? 'ring-white'}
                  `}
                >
                  {icon}
                </motion.a>
              );
            })}
          </motion.div>

          {/* Total Followers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="text-white font-black text-base">{totalFollowers}</span>
            <span className="text-gray-300 text-sm font-medium">Total Followers</span>
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </motion.div>

          {/* Email + Kick CTA */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onSubmit={handleConnect}
            className="flex items-center gap-0 rounded-full overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm pr-1 pl-4 py-1"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none py-2"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white text-xs font-bold px-4 py-3 rounded-full transition-all duration-200 border border-white/10 flex-shrink-0"
            >
              Connect with
              {/* Kick avatar mini */}
              <span className="w-7 h-7 rounded-full bg-[#53fc18] flex items-center justify-center text-black font-black text-xs">
                K
              </span>
            </button>
          </motion.form>

          {/* Kick logo bottom pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-4 flex justify-start"
          >
            <a
              href={siteConfig.socials.find(s => s.label === 'Kick')?.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#0f0f0f] border border-white/10 text-white text-xs font-bold px-4 py-3 rounded-2xl hover:border-[#53fc18]/50 transition-all duration-200 shadow-md"
            >
              <span className="w-8 h-8 rounded-xl bg-[#53fc18] flex items-center justify-center">
                <svg viewBox="0 0 50 50" fill="black" className="w-5 h-5">
                  <path d="M5 5 L5 45 L15 45 L15 30 L20 25 L30 45 L42 45 L27 22 L41 5 L29 5 L15 22 L15 5 Z"/>
                </svg>
              </span>
              <span className="text-[#53fc18] font-black text-sm tracking-tight">Kick</span>
            </a>
          </motion.div>

        </div>
    </motion.div>
  );
}

// ===================== DESKTOP HERO =====================
function DesktopHero() {
  return (
    <section
      className="hidden md:flex relative min-h-screen flex-col items-center justify-center pt-20"
      style={{
        backgroundImage: `url(${backgrondImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark Overlay */}
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
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-900/20 blur-xl rounded-[100%]" />
            <img
              src={fouadImg}
              alt={siteConfig.name}
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
            <span className="text-blue-300 text-xs font-bold tracking-widest uppercase">{siteConfig.hero.badge}</span>
          </motion.div>

          {/* Main heading */}
          <motion.div variants={staggerContainer}>
            <motion.p variants={itemUp} className="text-gray-400 text-base md:text-lg font-semibold tracking-[0.2em] uppercase mb-3">{siteConfig.name}</motion.p>
            {siteConfig.hero.titleLines.map((line: string, idx: number) => (
              <motion.h2 key={idx} variants={itemUp} className={`text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter ${idx === siteConfig.hero.titleLines.length - 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400 drop-shadow-lg mb-6' : 'mb-1 text-white'}`}>
                {line}
              </motion.h2>
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemUp} className="mb-8">
            <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-medium">
              {siteConfig.hero.subtitle}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemUp} className="flex flex-col sm:flex-row items-center md:justify-end gap-4">
            <a
              href={siteConfig.socials.find(s => s.label === 'Kick')?.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-[#53fc18] hover:bg-[#53fc18]/80 text-black transition-all duration-300 shadow-[0_0_20px_rgba(83,252,24,0.3)] hover:shadow-[0_0_25px_rgba(83,252,24,0.5)] hover:-translate-y-1"
            >
              <span className="text-xl font-black group-hover:scale-110 transition-transform">k</span>
              Follow on Kick
              <span className="group-hover:translate-x-[4px] transition-transform">→</span>
            </a>
            <Link
              to="/store"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-gray-900/60 backdrop-blur-md border border-gray-700 text-gray-200 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:-translate-y-1"
            >
              🛒 Premium Store
              <span className="group-hover:translate-x-[4px] transition-transform">→</span>
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
        {siteConfig.stats.map((s: { value: string, label: string, sub: string }) => (
          <motion.div key={s.label} variants={itemUp}
            className="group flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-800 shadow-sm hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300">
            <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              {s.value}
            </span>
            <span className="text-gray-200 text-xs font-bold tracking-widest uppercase">{s.label}</span>
            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{s.sub}</span>
          </motion.div>
        ))}
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
  );
}

// ===================== MAIN EXPORT =====================
export default function HeroSection() {
  return (
    <>
      <MobileProfileCard />
      <DesktopHero />
    </>
  );
}

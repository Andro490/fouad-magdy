import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { siteConfig } from '../../config/siteConfig';
import { staggerContainer, itemUp } from './Shared';
import fouadImg from '../../assets/FOUAD.png';
import backgrondImg from '../../assets/backgrond.png';

export default function HeroSection() {
  return (
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
          className="w-full md:w-1/2 text-left"
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
              <motion.h1 key={idx} variants={itemUp} className={`text-5xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter ${idx === siteConfig.hero.titleLines.length - 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400 drop-shadow-lg mb-6' : 'mb-1 text-white'}`}>
                {line}
              </motion.h1>
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemUp} className="mb-8">
            <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-medium">
              {siteConfig.hero.subtitle}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemUp} className="flex flex-col sm:flex-row items-center md:justify-start gap-4">
            <a
              href={siteConfig.socials.find(s => s.label === 'YouTube')?.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base bg-white hover:bg-gray-200 text-[#030510] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-1"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">▶</span>
              Watch Channel
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

import { motion } from 'framer-motion';
import { siteConfig } from '../../config/siteConfig';

export default function CommunitySection() {
  const tgUrl = siteConfig.socials.find(s => s.label === 'Telegram')?.url || "#";
  const kickUrl = siteConfig.socials.find(s => s.label === 'Kick')?.url || "#";

  return (
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
          JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">{siteConfig.shortName}</span> COMMUNITY
        </h2>
        <p className="text-gray-300 text-base mb-10 max-w-xl mx-auto leading-relaxed">
          Be a part of the {siteConfig.name} community and follow the latest videos, challenges, and exclusive offers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={tgUrl} target="_blank" rel="noreferrer"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300"
          >
            ✈ Join Community
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={kickUrl} target="_blank" rel="noreferrer"
            className="px-8 py-4 rounded-xl bg-gray-900/80 backdrop-blur-sm border-2 border-[#53fc18]/30 text-[#53fc18] font-bold hover:bg-[#53fc18]/10 hover:border-[#53fc18] shadow-sm hover:shadow-[0_0_15px_rgba(83,252,24,0.2)] transition-all duration-300"
          >
            <span className="font-black mr-2">k</span> Follow on Kick
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}

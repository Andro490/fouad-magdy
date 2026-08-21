import { motion } from 'framer-motion';
import { siteConfig } from '../../config/siteConfig';

export default function AboutSection() {
  return (
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
                <span className="text-gray-500 font-medium">{siteConfig.name}</span>
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
            <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-3 opacity-80">WHO IS {siteConfig.name.split(' ')[0]}?</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
              {siteConfig.name.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">{siteConfig.shortName}</span>
            </h2>
            <p className="text-gray-400 text-sm mb-1 font-medium">Gaming Creator • eFootball Content Creator</p>
            <p className="text-gray-300 leading-relaxed mt-5 text-sm md:text-base">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {siteConfig.socials.map((s, idx) => (
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
  );
}

import { motion } from 'framer-motion';

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

export const itemUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export function SectionTitle({ en, ar, accent }: { en: string; ar: string; accent?: string }) {
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
